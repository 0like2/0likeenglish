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
// 쉬운문제 교재 관리
// ============================================

export async function getEasyBooks() {
    const supabase = getAdminClient();
    const { data, error } = await supabase
        .from('easy_books')
        .select('*, easy_rounds(count)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Get Easy Books Error:", error);
        return [];
    }
    return data || [];
}

export async function createEasyBook(data: {
    name: string;
    description?: string;
    total_rounds?: number;
}) {
    const supabase = getAdminClient();
    const { error } = await supabase.from('easy_books').insert({
        name: data.name,
        description: data.description || '',
        total_rounds: data.total_rounds || 0
    });

    if (error) {
        console.error("Create Easy Book Error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/easy');
    return { success: true, message: "쉬운문제 교재가 등록되었습니다." };
}

// ============================================
// 쉬운문제 회차 관리
// ============================================

export async function getEasyRounds(bookId: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
        .from('easy_rounds')
        .select('*')
        .eq('book_id', bookId)
        .order('round_number', { ascending: true });

    if (error) {
        console.error("Get Easy Rounds Error:", error);
        return [];
    }
    return data || [];
}

export async function createEasyRound(data: {
    book_id: string;
    round_number: number;
    title?: string;
    answers: number[];
}) {
    const supabase = getAdminClient();

    // 10문항 검증 (18-20, 25-28, 43-45)
    if (data.answers.length !== 10) {
        return { success: false, message: "쉬운문제 정답은 10개여야 합니다." };
    }

    // 중복 체크 (더블클릭 방지)
    const { data: existing } = await supabase
        .from('easy_rounds')
        .select('id')
        .eq('book_id', data.book_id)
        .eq('round_number', data.round_number)
        .single();

    if (existing) {
        return { success: false, message: "이미 존재하는 회차입니다." };
    }

    const { error } = await supabase.from('easy_rounds').insert({
        book_id: data.book_id,
        round_number: data.round_number,
        title: data.title || `${data.round_number}회`,
        answers: data.answers,
        question_count: 10
    });

    if (error) {
        console.error("Create Easy Round Error:", error);
        if (error.message.includes('duplicate')) {
            return { success: false, message: "이미 존재하는 회차입니다." };
        }
        return { success: false, message: error.message };
    }

    // Update total_rounds count
    await supabase.rpc('update_easy_book_round_count', { book_uuid: data.book_id });

    revalidatePath('/admin/easy');
    return { success: true, message: "회차가 등록되었습니다." };
}

export async function updateEasyRound(roundId: string, data: {
    title?: string;
    answers?: number[];
}) {
    const supabase = getAdminClient();
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.answers) {
        if (data.answers.length !== 10) {
            return { success: false, message: "쉬운문제 정답은 10개여야 합니다." };
        }
        updateData.answers = data.answers;
    }

    const { error } = await supabase
        .from('easy_rounds')
        .update(updateData)
        .eq('id', roundId);

    if (error) {
        console.error("Update Easy Round Error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/easy');
    return { success: true, message: "회차가 수정되었습니다." };
}

// ============================================
// 쉬운문제 제출 및 자동채점
// ============================================

// 쉬운문제 번호 범위 (10문항)
const EASY_PROBLEMS_RANGES = [
    { start: 18, end: 20 },   // 3문항
    { start: 25, end: 28 },   // 4문항
    { start: 43, end: 45 }    // 3문항
];

// 문제 번호를 배열 인덱스로 변환
function getEasyIndex(qNum: number): number {
    if (qNum >= 18 && qNum <= 20) return qNum - 18;           // 0-2
    if (qNum >= 25 && qNum <= 28) return 3 + (qNum - 25);     // 3-6
    if (qNum >= 43 && qNum <= 45) return 7 + (qNum - 43);     // 7-9
    return -1;
}

// 배열 인덱스를 문제 번호로 변환
function getEasyQuestionNumber(idx: number): number {
    if (idx < 3) return 18 + idx;       // 0-2 → 18-20
    if (idx < 7) return 25 + (idx - 3); // 3-6 → 25-28
    return 43 + (idx - 7);              // 7-9 → 43-45
}

export async function submitEasyExam(roundId: string, studentAnswers: number[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "로그인이 필요합니다." };

    // 10문항 검증
    if (studentAnswers.length !== 10) {
        return { success: false, message: "쉬운문제 답안은 10개여야 합니다." };
    }

    // 1. Get round info with answers
    const adminClient = getAdminClient();
    const { data: round, error: fetchError } = await adminClient
        .from('easy_rounds')
        .select('*, easy_books(name)')
        .eq('id', roundId)
        .single();

    if (fetchError || !round) {
        return { success: false, message: "쉬운문제 정보를 찾을 수 없습니다." };
    }

    // 2. Grade
    const answerKey = round.answers as number[];
    let correctCount = 0;
    const details = studentAnswers.map((ans, index) => {
        const isCorrect = (ans !== 0 && ans === answerKey[index]);
        if (isCorrect) correctCount++;
        return {
            questionIndex: index,
            questionNumber: getEasyQuestionNumber(index),
            isCorrect,
            studentAnswer: ans,
            correctAnswer: answerKey[index]
        };
    });

    const score = Math.round((correctCount / answerKey.length) * 100);

    // 3. Save submission
    const { error: saveError } = await adminClient.from('easy_submissions').insert({
        student_id: user.id,
        round_id: roundId,
        student_answers: studentAnswers,
        score: score,
        correct_count: correctCount,
        total_count: answerKey.length,
        details: details
    });

    if (saveError) {
        console.error("Submit Easy Exam Error:", saveError);
        return { success: false, message: saveError.message };
    }

    // 4. Update Quest Progress (쉬운문제풀이 퀘스트)
    try {
        const { data: member } = await adminClient.from('class_members')
            .select('class_id')
            .eq('student_id', user.id)
            .eq('status', 'active')
            .single();

        if (member) {
            // Find "쉬운문제" quest for this class
            const { data: quest } = await adminClient.from('class_quests')
                .select('id, weekly_frequency')
                .eq('class_id', member.class_id)
                .ilike('title', '%쉬운문제%')
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

                console.log(`쉬운문제 Quest Updated: ${user.email} - ${currentCount}회`);
            }
        }
    } catch (questError) {
        console.error("Quest Update Failed:", questError);
    }

    // Log activity
    const userName = user.user_metadata?.name || user.email?.split('@')[0] || '학생';
    const bookName = round.easy_books?.name || '쉬운문제';
    await logActivity(
        user.id,
        userName,
        'submit',
        `${userName} 학생이 '${bookName} ${round.title}'(쉬운문제)을(를) 완료했습니다. (${score}점)`,
        { roundId, bookName, roundTitle: round.title, score, correctCount, totalCount: answerKey.length, type: 'easy' }
    );

    revalidatePath('/dashboard');
    revalidatePath('/class');

    return {
        success: true,
        score,
        correctCount,
        totalCount: answerKey.length,
        details,
        message: "채점이 완료되었습니다."
    };
}

// ============================================
// 쉬운문제 기록 조회
// ============================================

export async function getMyEasyHistory() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const adminClient = getAdminClient();
    const { data, error } = await adminClient
        .from('easy_submissions')
        .select(`
            *,
            easy_rounds (
                round_number,
                title,
                easy_books (name)
            )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Get Easy History Error:", error);
        return [];
    }

    return data || [];
}
