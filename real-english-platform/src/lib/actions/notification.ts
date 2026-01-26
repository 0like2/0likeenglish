'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

// Admin Client 헬퍼 (RLS 우회)
function getAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
    }
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );
}

// 알림 타입 정의
export type NotificationType =
    | 'homework_submit'
    | 'feedback'
    | 'payment_update'
    | 'class_assign'
    | 'announcement';

export interface CreateNotificationParams {
    recipientId: string;
    senderId?: string | null;
    senderName?: string | null;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
}

// ============ 알림 생성 ============
export async function createNotification(params: CreateNotificationParams) {
    try {
        const supabase = getAdminClient();

        const { error } = await supabase.from('notifications').insert({
            recipient_id: params.recipientId,
            sender_id: params.senderId || null,
            sender_name: params.senderName || null,
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.link || null,
            metadata: params.metadata || {},
            is_read: false,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('Error creating notification:', error);
            return { success: false, message: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Failed to create notification:', error);
        return { success: false, message: error.message };
    }
}

// ============ 관리자에게 알림 (숙제 제출 등) ============
export async function notifyAdmins(params: Omit<CreateNotificationParams, 'recipientId'>) {
    try {
        const supabase = getAdminClient();

        // 모든 teacher 조회
        const { data: teachers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'teacher');

        if (!teachers || teachers.length === 0) {
            console.log('No teachers found to notify');
            return { success: true };
        }

        // 각 관리자에게 알림 생성
        const notifications = teachers.map(teacher => ({
            recipient_id: teacher.id,
            sender_id: params.senderId || null,
            sender_name: params.senderName || null,
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.link || null,
            metadata: params.metadata || {},
            is_read: false,
            created_at: new Date().toISOString()
        }));

        const { error } = await supabase.from('notifications').insert(notifications);

        if (error) {
            console.error('Error notifying admins:', error);
            return { success: false, message: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Failed to notify admins:', error);
        return { success: false, message: error.message };
    }
}

// ============ 알림 조회 ============
export async function getNotifications(limit: number = 20) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('recipient_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Failed to get notifications:', error);
        return [];
    }
}

// ============ 안읽은 알림 개수 조회 ============
export async function getUnreadNotificationCount(): Promise<number> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return 0;

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error counting unread notifications:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Failed to count unread notifications:', error);
        return 0;
    }
}

// ============ 단일 알림 읽음 처리 ============
export async function markNotificationAsRead(notificationId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: "로그인이 필요합니다." };

        const { error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('id', notificationId)
            .eq('recipient_id', user.id);

        if (error) {
            console.error('Error marking notification as read:', error);
            return { success: false, message: error.message };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to mark notification as read:', error);
        return { success: false, message: error.message };
    }
}

// ============ 모든 알림 읽음 처리 ============
export async function markAllNotificationsAsRead() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: "로그인이 필요합니다." };

        const { error } = await supabase
            .from('notifications')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('recipient_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all notifications as read:', error);
            return { success: false, message: error.message };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to mark all notifications as read:', error);
        return { success: false, message: error.message };
    }
}
