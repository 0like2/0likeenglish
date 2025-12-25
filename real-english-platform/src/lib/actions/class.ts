"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function createLesson(classId: string, formData: any) {
    // Use Service Role Client for DB operations to bypass RLS
    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Use standard client for Auth only
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log("Debug: createLesson called by:", user?.email);

    if (!user) throw new Error("Unauthorized");

    // Check role using Metadata (faster & avoids recursion) or Service Role Check
    const userRole = user.user_metadata?.role;

    if (userRole !== 'teacher' && user.email !== 'dudfkr236@gmail.com') {
        console.error("Debug: Permission Denied. Role:", userRole, "Email:", user.email);
        throw new Error("Only teachers can create lessons");
    }

    // Insert using Admin Client
    const { error } = await adminSupabase
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
            exam_id: formData.exam_id || null, // Link exam if selected
            status: 'upcoming'
        });

    if (error) {
        console.error("Debug: Database Insert Error:", error);
        throw new Error(error.message);
    }
    revalidatePath(`/class/${classId}`);
    revalidatePath(`/admin/classes`);
    revalidatePath(`/admin/classes/${classId}`);
}

export async function deleteLesson(lessonId: string, classId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('lesson_plans').delete().eq('id', lessonId);
    if (error) throw new Error(error.message);
    revalidatePath(`/class/${classId}`);
}
