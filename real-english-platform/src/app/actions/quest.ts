'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitQuestProof(questId: string, imagePath: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // 1. Get current Quest info (to know frequency)
    const { data: quest } = await supabase
        .from('class_quests')
        .select('weekly_frequency')
        .eq('id', questId)
        .single();

    if (!quest) throw new Error("Quest not found");

    // 2. Get current progress (or create if missing)
    const { data: progress } = await supabase
        .from('student_quest_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('quest_id', questId)
        .single();

    // Logic: Increment count, Update URL
    const currentCount = (progress?.current_count || 0) + 1;
    let status = 'in_progress';
    if (currentCount >= (quest.weekly_frequency || 1)) {
        status = 'completed';
    }

    const { error } = await supabase
        .from('student_quest_progress')
        .upsert({
            student_id: user.id,
            quest_id: questId,
            current_count: currentCount,
            last_proof_image_url: imagePath,
            last_submitted_at: new Date().toISOString(),
            status: status
        }, { onConflict: 'student_id, quest_id' });

    if (error) {
        console.error("Error submitting proof:", error);
        throw new Error("Failed to submit proof");
    }

    revalidatePath('/dashboard');
    revalidatePath('/class/[id]'); // Revalidate class page (not exact ID known here, but Next.js might need specific path. For now dashboard is key)

    return { success: true, newCount: currentCount, status };
}
