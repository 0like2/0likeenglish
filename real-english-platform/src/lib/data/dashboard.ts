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

    return profile || {
        name: user.email?.split('@')[0],
        email: user.email,
        role: user.email === 'dudfkr236@gmail.com' ? 'teacher' : 'student'
    };
}

export async function getPaymentStatus(userId: string) {
    const supabase = await createClient();
    const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    // Default fallback if no payment record found
    return payment || { status: 'active', class_count: 4, amount: 0 };
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

export async function getRecentLessons(classId: string) {
    const supabase = await createClient();
    const { data: lessons } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('class_id', classId)
        .order('date', { ascending: false })
        .limit(4);

    return lessons || [];
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

    let recentLessons = [];
    if (classInfo) {
        recentLessons = await getRecentLessons(classInfo.id);
    }

    return { user, payment, classInfo, recentLessons };
}
