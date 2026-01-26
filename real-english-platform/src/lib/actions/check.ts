"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

export async function toggleLessonCheck(lessonId: string, field: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Get current status
    const { data: current } = await supabase
        .from('student_lesson_checks')
        .select(field)
        .eq('student_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

    const statusMap = {
        'none': 'done',
        'done': 'ambiguous',
        'ambiguous': 'failed',
        'failed': 'none'
    };

    const oldStatus = current ? (current as any)[field] : 'none';
    const newStatus = statusMap[oldStatus as keyof typeof statusMap] || 'done';

    // 2. Upsert
    const updateData: any = {
        student_id: user.id,
        lesson_id: lessonId,
        updated_at: new Date().toISOString()
    };
    updateData[field] = newStatus;

    const { error } = await supabase
        .from('student_lesson_checks')
        .upsert(updateData, { onConflict: 'student_id, lesson_id' });

    if (error) console.error("Toggle Error:", error);

    revalidatePath('/class/[id]');
}

// 관리자용: 학생 단어 테스트 통과 여부 토글
// NULL → true → false → NULL 순환
export async function toggleVocabTest(studentId: string, lessonId: string) {
    const supabase = getAdminClient();

    // 1. 현재 상태 조회
    const { data: current } = await supabase
        .from('student_lesson_checks')
        .select('vocab_test_passed')
        .eq('student_id', studentId)
        .eq('lesson_id', lessonId)
        .single();

    // NULL → true → false → NULL
    let newValue: boolean | null;
    const currentValue = current?.vocab_test_passed;

    if (currentValue === null || currentValue === undefined) {
        newValue = true;
    } else if (currentValue === true) {
        newValue = false;
    } else {
        newValue = null;
    }

    // 2. Upsert
    const { error } = await supabase
        .from('student_lesson_checks')
        .upsert({
            student_id: studentId,
            lesson_id: lessonId,
            vocab_test_passed: newValue,
            updated_at: new Date().toISOString()
        }, { onConflict: 'student_id, lesson_id' });

    if (error) {
        console.error("Toggle Vocab Test Error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/classes/[id]');
    return { success: true, newValue };
}

// 관리자용: 특정 수업의 모든 학생 단어 테스트 상태 조회
export async function getLessonVocabTestStatus(lessonId: string) {
    const supabase = getAdminClient();

    const { data, error } = await supabase
        .from('student_lesson_checks')
        .select('student_id, vocab_test_passed')
        .eq('lesson_id', lessonId);

    if (error) {
        console.error("Get Vocab Test Status Error:", error);
        return [];
    }

    return data || [];
}
