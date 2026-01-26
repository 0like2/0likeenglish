'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { logActivity } from "./admin";

function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

// ============================================
// 듣기 책 관리
// ============================================

export async function getListeningBooks() {
    const supabase = getAdminClient();
    const { data, error } = await supabase
        .from('listening_books')
        .select('*, listening_rounds(count)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Get Listening Books Error:", error);
        return [];
    }
    return data || [];
}

export async function createListeningBook(data: {
    name: string;
    description?: string;
    total_rounds?: number;
}) {
    const supabase = getAdminClient();
    const { error } = await supabase.from('listening_books').insert({
        name: data.name,
        description: data.description || '',
        total_rounds: data.total_rounds || 0
    });

    if (error) {
        console.error("Create Book Error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/listening');
    return { success: true, message: "듣기 교재가 등록되었습니다." };
}

// ============================================
// 듣기 회차 관리
// ============================================

export async function getListeningRounds(bookId: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
        .from('listening_rounds')
        .select('*')
        .eq('book_id', bookId)
        .order('round_number', { ascending: true });

    if (error) {
        console.error("Get Rounds Error:", error);
        return [];
    }
    return data || [];
}

export async function createListeningRound(data: {
    book_id: string;
    round_number: number;
    title?: string;
    answers: number[];
}) {
    const supabase = getAdminClient();

    // Validate answers (17 questions for listening: 1-17번)
    if (data.answers.length !== 17) {
        return { success: false, message: "듣기 정답은 17개여야 합니다. (1-17번)" };
    }

    // 중복 체크 (더블클릭 방지)
    const { data: existing } = await supabase
        .from('listening_rounds')
        .select('id')
        .eq('book_id', data.book_id)
        .eq('round_number', data.round_number)
        .single();

    if (existing) {
        return { success: false, message: "이미 존재하는 회차입니다." };
    }

    const { error } = await supabase.from('listening_rounds').insert({
        book_id: data.book_id,
        round_number: data.round_number,
        title: data.title || `${data.round_number}회`,
        answers: data.answers,
        question_count: 17
    });

    if (error) {
        console.error("Create Round Error:", error);
        if (error.message.includes('duplicate')) {
            return { success: false, message: "이미 존재하는 회차입니다." };
        }
        return { success: false, message: error.message };
    }

    // Update total_rounds count
    await supabase.rpc('update_book_round_count', { book_uuid: data.book_id });

    revalidatePath('/admin/listening');
    return { success: true, message: "회차가 등록되었습니다." };
}

export async function deleteListeningBook(bookId: string) {
    const supabase = getAdminClient();

    // Soft delete by setting is_active to false
    const { error } = await supabase
        .from('listening_books')
        .update({ is_active: false })
        .eq('id', bookId);

    if (error) {
        console.error("Delete Listening Book Error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/listening');
    return { success: true, message: "교재가 삭제되었습니다." };
}

export async function deleteListeningRound(roundId: string, bookId: string) {
    const supabase = getAdminClient();

    const { error } = await supabase
        .from('listening_rounds')
        .delete()
        .eq('id', roundId);

    if (error) {
        console.error("Delete Listening Round Error:", error);
        return { success: false, message: error.message };
    }

    // Update total_rounds count
    await supabase.rpc('update_book_round_count', { book_uuid: bookId });

    revalidatePath('/admin/listening');
    return { success: true, message: "회차가 삭제되었습니다." };
}

export async function updateListeningRound(roundId: string, data: {
    title?: string;
    answers?: number[];
}) {
    const supabase = getAdminClient();
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.answers) {
        if (data.answers.length !== 17) {
            return { success: false, message: "듣기 정답은 17개여야 합니다. (1-17번)" };
        }
        updateData.answers = data.answers;
    }

    const { error } = await supabase
        .from('listening_rounds')
        .update(updateData)
        .eq('id', roundId);

    if (error) {
        console.error("Update Round Error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/listening');
    return { success: true, message: "회차가 수정되었습니다." };
}

// ============================================
// 듣기 시험 제출 및 자동채점
// ============================================

export async function submitListeningExam(roundId: string, studentAnswers: number[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "로그인이 필요합니다." };

    // 17문항 검증 (1-17번)
    if (studentAnswers.length !== 17) {
        return { success: false, message: "듣기 답안은 17개여야 합니다. (1-17번)" };
    }

    // 1. Get round info with answers
    const adminClient = getAdminClient();
    const { data: round, error: fetchError } = await adminClient
        .from('listening_rounds')
        .select('*, listening_books(name)')
        .eq('id', roundId)
        .single();

    if (fetchError || !round) {
        return { success: false, message: "듣기 정보를 찾을 수 없습니다." };
    }

    // 2. Grade (1-17번만 채점)
    const fullAnswerKey = round.answers as number[];
    // 호환성: 기존 27문항 데이터는 처음 17개만 사용
    const answerKey = fullAnswerKey.slice(0, 17);
    let correctCount = 0;
    const details = studentAnswers.map((ans, index) => {
        const isCorrect = (ans !== 0 && ans === answerKey[index]);
        if (isCorrect) correctCount++;
        return {
            questionIndex: index,
            questionNumber: index + 1, // 1-17번
            isCorrect,
            studentAnswer: ans,
            correctAnswer: answerKey[index]
        };
    });

    const score = Math.round((correctCount / 17) * 100);

    // 3. Save submission
    const { error: saveError } = await adminClient.from('listening_submissions').insert({
        student_id: user.id,
        round_id: roundId,
        student_answers: studentAnswers,
        score: score,
        correct_count: correctCount,
        total_count: 17,
        details: details
    });

    if (saveError) {
        console.error("Submit Listening Error:", saveError);
        return { success: false, message: saveError.message };
    }

    // 4. Update Quest Progress (듣기 퀘스트)
    try {
        const { data: member } = await adminClient.from('class_members')
            .select('class_id')
            .eq('student_id', user.id)
            .eq('status', 'active')
            .single();

        if (member) {
            // Find "듣기" quest for this class
            const { data: quest } = await adminClient.from('class_quests')
                .select('id, weekly_frequency')
                .eq('class_id', member.class_id)
                .ilike('title', '%듣기%')
                .single();

            if (quest) {
                const { data: progress } = await adminClient.from('student_quest_progress')
                    .select('current_count')
                    .eq('student_id', user.id)
                    .eq('quest_id', quest.id)
                    .single();

                const currentCount = (progress?.current_count || 0) + 1;
                let status = 'in_progress';
                if (currentCount >= (quest.weekly_frequency || 1)) status = 'completed';

                await adminClient.from('student_quest_progress').upsert({
                    student_id: user.id,
                    quest_id: quest.id,
                    current_count: currentCount,
                    last_submitted_at: new Date().toISOString(),
                    status: status
                }, { onConflict: 'student_id, quest_id' });

                console.log(`듣기 Quest Updated: ${user.email} - ${currentCount}회`);
            }
        }
    } catch (questError) {
        console.error("Quest Update Failed:", questError);
    }

    // Log activity
    const userName = user.user_metadata?.name || user.email?.split('@')[0] || '학생';
    const bookName = round.listening_books?.name || '듣기 평가';
    await logActivity(
        user.id,
        userName,
        'listening',
        `${userName} 학생이 '${bookName} ${round.title}'(듣기)을(를) 완료했습니다. (${score}점)`,
        { roundId, bookName, roundTitle: round.title, score, correctCount, totalCount: 17, type: 'listening' }
    );

    revalidatePath('/dashboard');
    revalidatePath('/listening');
    revalidatePath('/class');

    return {
        success: true,
        score,
        correctCount,
        totalCount: 17,
        details,
        message: "채점이 완료되었습니다."
    };
}

// ============================================
// 듣기 기록 조회
// ============================================

export async function getMyListeningHistory() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const adminClient = getAdminClient();
    const { data, error } = await adminClient
        .from('listening_submissions')
        .select(`
            *,
            listening_rounds (
                round_number,
                title,
                listening_books (name)
            )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Get History Error:", error);
        return [];
    }

    return data || [];
}
