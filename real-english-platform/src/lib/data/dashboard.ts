import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getUserProfile() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null; // Handle auth redirect in middleware or page
    }

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile || { name: user.email?.split('@')[0], email: user.email, role: 'student' };
}

export async function getPaymentStatus(userId: string) {
    const supabase = await createClient();
    const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return payment || { status: 'expired', remaining_sessions: 0, total_sessions: 4 };
}

export async function getClassInfo(userId: string) {
    const supabase = await createClient();
    const { data: member } = await supabase
        .from('class_members')
        .select('*, classes(*)')
        .eq('student_id', userId)
        .eq('status', 'active')
        .single();

    return member?.classes || null;
}

export async function getDashboardData() {
    const user = await getUserProfile();
    if (!user) {
        redirect('/auth/login');
    }

    const [payment, classInfo] = await Promise.all([
        getPaymentStatus(user.id),
        getClassInfo(user.id)
    ]);

    return { user, payment, classInfo };
}
