"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

    const oldStatus = current ? current[field] : 'none';
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
