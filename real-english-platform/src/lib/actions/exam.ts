'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExam(data: {
    class_id: string;
    title: string;
    answers: number[]; // 45 integers
    score_distribution: number[]; // indices of 3-point questions (0-44)
}) {
    const supabase = await createClient();

    // 1. Validate
    if (data.answers.length !== 45) {
        return { success: false, message: "정답은 총 45개여야 합니다." };
    }

    // 2. Insert
    const { error } = await supabase.from('class_exams').insert({
        class_id: data.class_id,
        title: data.title,
        answers: data.answers,
        score_distribution: data.score_distribution
    });

    if (error) {
        console.error("Create Exam Error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath(`/admin/classes/${data.class_id}`);
    revalidatePath('/admin/exams');
    return { success: true, message: "모의고사가 등록되었습니다." };
}

export async function submitExam(examId: string, studentAnswers: number[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "로그인이 필요합니다." };

    // 1. Fetch Exam Data (Answer Key)
    const { data: exam, error: fetchError } = await supabase
        .from('class_exams')
        .select('*')
        .eq('id', examId)
        .single();

    if (fetchError || !exam) {
        return { success: false, message: "시험 정보를 찾을 수 없습니다." };
    }

    // 2. Grade Auto
    const answerKey = exam.answers as number[];
    const threePointIndices = new Set(exam.score_distribution as number[]); // Indices of 3-pt questions

    let score = 0;

    // Validate length
    if (studentAnswers.length !== 45) {
        // Pad if necessary? Or fail. Let's fail or handle gracefully.
        // Assuming client sends full array 0s for skip.
    }

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
            correctAnswer: answerKey[index] // Return correct answer for review
        };
    });

    // 3. Save Submission
    const { error: saveError } = await supabase.from('exam_submissions').insert({
        exam_id: examId,
        student_id: user.id,
        student_answers: studentAnswers,
        score: score,
        is_graded: true
    });

    if (saveError) {
        console.error("Submit Exam Error:", saveError);
        return { success: false, message: saveError.message };
    }

    revalidatePath(`/class/exam/${examId}`);
    return { success: true, score: score, details: details, message: "채점이 완료되었습니다." };
}

export async function getExamResults(examId: string) {
    const supabase = await createClient();
    // ... Implementation for admin view
}
