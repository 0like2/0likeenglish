"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLesson(classId: string, formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if user is teacher
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'teacher' && user.email !== 'dudfkr236@gmail.com') { // Safety check
        throw new Error("Only teachers can create lessons");
    }

    const { error } = await supabase
        .from('lesson_plans')
        .insert({
            class_id: classId,
            title: formData.title,
            date: formData.date, // YYYY-MM-DD
            content: formData.content, // Main note
            vocab_hw: formData.vocab_hw,
            listening_hw: formData.listening_hw,
            grammar_hw: formData.grammar_hw,
            other_hw: formData.other_hw,
            status: 'upcoming'
        });

    if (error) throw new Error(error.message);
    revalidatePath(`/class/${classId}`);
    revalidatePath(`/admin/classes`);
}

export async function deleteLesson(lessonId: string, classId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('lesson_plans').delete().eq('id', lessonId);
    if (error) throw new Error(error.message);
    revalidatePath(`/class/${classId}`);
}
