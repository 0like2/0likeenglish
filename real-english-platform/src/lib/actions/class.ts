"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function createLesson(classId: string, formData: any) {
    console.log("[createLesson] Starting with classId:", classId);
    console.log("[createLesson] FormData:", JSON.stringify(formData, null, 2));

    // Use Service Role Client for DB operations to bypass RLS
    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Use standard client for Auth only
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        console.error("[createLesson] Auth Error:", authError);
        throw new Error("Authentication failed");
    }

    console.log("[createLesson] User:", user?.email);

    if (!user) throw new Error("Unauthorized");

    // Check role using Metadata (faster & avoids recursion) or Service Role Check
    const userRole = user.user_metadata?.role;

    if (userRole !== 'teacher' && user.email !== 'dudfkr236@gmail.com') {
        console.error("[createLesson] Permission Denied. Role:", userRole, "Email:", user.email);
        throw new Error("Only teachers can create lessons");
    }

    // Prepare insert data - ensure exam_id is null if empty
    const insertData = {
        class_id: classId,
        title: formData.title,
        date: formData.date,
        content: formData.content || null,
        vocab_hw: formData.vocab_hw || null,
        listening_hw: formData.listening_hw || null,
        grammar_hw: formData.grammar_hw || null,
        other_hw: formData.other_hw || null,
        exam_id: formData.exam_id && formData.exam_id !== '' ? formData.exam_id : null,
        status: 'upcoming'
    };

    console.log("[createLesson] Insert data:", JSON.stringify(insertData, null, 2));

    // Insert using Admin Client
    const { data, error } = await adminSupabase
        .from('lesson_plans')
        .insert(insertData)
        .select();

    if (error) {
        console.error("[createLesson] Database Insert Error:", error);
        throw new Error(`Database error: ${error.message}`);
    }

    console.log("[createLesson] Insert success:", data);

    // Revalidate paths
    try {
        revalidatePath(`/class/${classId}`);
        revalidatePath(`/admin/classes`);
        revalidatePath(`/admin/classes/${classId}`);
        console.log("[createLesson] Revalidation complete");
    } catch (revalidateError) {
        console.error("[createLesson] Revalidation error:", revalidateError);
        // Don't throw here - insert was successful
    }

    return { success: true, data };
}

export async function updateLesson(lessonId: string, classId: string, formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const userRole = user.user_metadata?.role;
    if (userRole !== 'teacher' && user.email !== 'dudfkr236@gmail.com') {
        throw new Error("Only teachers can update lessons");
    }

    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const updateData = {
        title: formData.title,
        date: formData.date,
        content: formData.content || null,
        vocab_hw: formData.vocab_hw || null,
        listening_hw: formData.listening_hw || null,
        grammar_hw: formData.grammar_hw || null,
        other_hw: formData.other_hw || null,
        exam_id: formData.exam_id && formData.exam_id !== '' ? formData.exam_id : null,
        status: formData.status || 'upcoming'
    };

    const { error } = await adminSupabase
        .from('lesson_plans')
        .update(updateData)
        .eq('id', lessonId);

    if (error) {
        console.error("[updateLesson] Error:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/class/${classId}`);
    revalidatePath(`/admin/classes/${classId}`);
    return { success: true };
}

export async function deleteLesson(lessonId: string, classId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const userRole = user.user_metadata?.role;
    if (userRole !== 'teacher' && user.email !== 'dudfkr236@gmail.com') {
        throw new Error("Only teachers can delete lessons");
    }

    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await adminSupabase
        .from('lesson_plans')
        .delete()
        .eq('id', lessonId);

    if (error) {
        console.error("[deleteLesson] Error:", error);
        throw new Error(error.message);
    }

    revalidatePath(`/class/${classId}`);
    revalidatePath(`/admin/classes/${classId}`);
    return { success: true };
}
