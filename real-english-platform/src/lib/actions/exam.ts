'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Helper to get admin client (duplicated from admin.ts, better to export shared utility but fine here for now)
function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

export async function createExam(data: {
    title: string;
    answers: number[]; // 45 integers
    score_distribution: number[]; // indices of 3-point questions (0-44)
    category?: string;
}) {
    const supabase = await createClient(); // RLS allows insert for teachers

    // 1. Validate
    if (data.answers.length !== 45) {
        return { success: false, message: "정답은 총 45개여야 합니다." };
    }

    // 2. Insert into Global 'exams' table
    const { error } = await supabase.from('exams').insert({
        title: data.title,
        answers: data.answers,
        score_distribution: data.score_distribution,
        category: data.category || 'General',
        is_active: true
    });

    if (error) {
        console.error("Create Exam Error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/exams');
    return { success: true, message: "모의고사가 등록되었습니다." };
}

export async function submitExam(examId: string, studentAnswers: number[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "로그인이 필요합니다." };

    // 1. Fetch Exam Data (Global Table)
    const { data: exam, error: fetchError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

    if (fetchError || !exam) {
        return { success: false, message: "시험 정보를 찾을 수 없습니다." };
    }

    // 2. Grade Auto
    const answerKey = exam.answers as number[];
    const threePointIndices = new Set(exam.score_distribution as number[]);

    let score = 0;
    const details = studentAnswers.map((ans, index) => {
        const isCorrect = (ans !== 0 && ans === answerKey[index]);
        if (isCorrect) {
            if (threePointIndices.has(index)) score += 3;
            else score += 2;
        }
        return {
            questionIndex: index,
            isCorrect,
            studentAnswer: ans,
            correctAnswer: answerKey[index]
        };
    });

    // 3. Save Submission
    const { error: saveError } = await supabase.from('exam_submissions').insert({
        exam_id: examId,
        student_id: user.id,
        student_answers: studentAnswers,
        score: score,
        is_graded: true,
        details: details // Save details for review
    });

    if (saveError) {
        console.error("Submit Exam Error:", saveError);
        return { success: false, message: saveError.message };
    }

    // 4. Update Quest Progress LOGIC (Magic Link)
    try {
        // Find user's class (assuming single active class for simplicity, or handle multiples)
        const { data: member } = await supabase.from('class_members')
            .select('class_id')
            .eq('student_id', user.id)
            .eq('status', 'active')
            .single();

        if (member) {
            // Find "Mock Exam" quest for this class
            const { data: quest } = await supabase.from('class_quests')
                .select('id, weekly_frequency')
                .eq('class_id', member.class_id)
                .eq('title', '모의고사') // Matches the fixed title in admin.ts
                .single();

            if (quest) {
                // Get current progress or init
                const { data: progress } = await supabase.from('student_quest_progress')
                    .select('current_count')
                    .eq('student_id', user.id)
                    .eq('quest_id', quest.id)
                    .single();

                const currentCount = (progress?.current_count || 0) + 1;
                let status = 'in_progress';
                if (currentCount >= (quest.weekly_frequency || 1)) status = 'completed';

                // Upsert Progress
                // Note: We might need Admin privileges if RLS blocks updates? 
                // Usually Users can update THEIR own progress row.
                // If fails, used AdminClient.

                await supabase.from('student_quest_progress').upsert({
                    student_id: user.id,
                    quest_id: quest.id,
                    current_count: currentCount,
                    last_submitted_at: new Date().toISOString(),
                    status: status
                }, { onConflict: 'student_id, quest_id' });

                console.log(`Quest Updated: ${user.email} - Mock Exam ${currentCount}`);
            }
        }
    } catch (questError) {
        console.error("Quest Update Failed (Non-critical):", questError);
        // Don't fail the whole submission just because quest update failed
    }

    revalidatePath(`/class/exam/${examId}`);
    revalidatePath('/dashboard');
    return { success: true, score: score, details: details, message: "채점이 완료되었습니다." };
}

export async function getExamResults(examId: string) {
    const supabase = await createClient();
    // This is for Admin View basically
    const { data: submissions } = await supabase
        .from('exam_submissions')
        .select(`
            *,
            users (name, email)
        `)
        .eq('exam_id', examId)
        .order('score', { ascending: false });

    return submissions;
}

// Get available exams for students
export async function getAvailableExams() {
    const supabase = await createClient();
    const { data: exams } = await supabase
        .from('exams')
        .select('id, title, category')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return exams || [];
}
