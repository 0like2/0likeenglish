'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/actions/admin";
import { notifyAdmins } from "@/lib/actions/notification";

export async function submitQuestProof(questId: string, imagePath: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: "로그인이 필요합니다." };

        // 1. Get current Quest info (to know frequency)
        const { data: quest } = await supabase
            .from('class_quests')
            .select('weekly_frequency')
            .eq('id', questId)
            .single();

        if (!quest) return { success: false, message: "퀘스트 정보를 찾을 수 없습니다." };

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
            return { success: false, message: "DB 저장 오류 발생" };
        }

        // Get quest title for logging
        const { data: questInfo } = await supabase
            .from('class_quests')
            .select('title')
            .eq('id', questId)
            .single();

        // Log activity
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || '학생';
        const questTitle = questInfo?.title || '숙제';
        await logActivity(
            user.id,
            userName,
            'submit',
            `${userName} 학생이 '${questTitle}'를 제출했습니다. (${currentCount}회차)`,
            { questId, questTitle, currentCount, status }
        );

        // 관리자에게 알림 전송
        await notifyAdmins({
            senderId: user.id,
            senderName: userName,
            type: 'homework_submit',
            title: '새 숙제 제출',
            message: `${userName} 학생이 '${questTitle}'를 제출했습니다.`,
            link: '/admin',
            metadata: { questId, questTitle, currentCount, status }
        });

        revalidatePath('/dashboard');
        revalidatePath('/class/[id]');

        return { success: true, newCount: currentCount, status };
    } catch (e: any) {
        console.error("Unexpected error in submitQuestProof:", e);
        return { success: false, message: "서버 내부 오류가 발생했습니다." };
    }
}
