import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function getUserProfile() {
    const supabaseUser = await createClient();
    const { data: { user }, error } = await supabaseUser.auth.getUser();

    if (error || !user) {
        return null; // Handle auth redirect in middleware or page
    }

    // Use Service Role to bypass RLS for reading profile
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let dbClient = supabaseUser;

    if (serviceRoleKey) {
        dbClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        ) as any;
    }

    const { data: profile } = await dbClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile || {
        id: user.id,
        name: user.email?.split('@')[0],
        email: user.email,
        role: user.user_metadata?.role || (user.email === 'dudfkr236@gmail.com' ? 'teacher' : 'student')
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

    if (!payment) return null;

    // Default fallback if no payment record found
    return payment || { status: 'active', class_count: 4, amount: 0 };
}

export async function getClassInfo(userId: string) {
    // Use Service Role to bypass RLS if possible (prevents issues where student can't see own membership due to policy gap)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let supabase;

    if (serviceRoleKey) {
        supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );
    } else {
        supabase = await createClient();
    }

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
        .select(`
            *,
            exams ( id, title )
        `)
        .eq('class_id', classId)
        .order('date', { ascending: false })
        .limit(4);

    return lessons || [];
}


export async function getQuestProgress(classId: string, studentId: string) {
    const supabase = await createClient();

    // Fetch all active quests for the class
    const { data: quests } = await supabase
        .from('class_quests')
        .select('*')
        .eq('class_id', classId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (!quests) return [];

    // Fetch student's progress
    const { data: progress } = await supabase
        .from('student_quest_progress')
        .select('*')
        .eq('student_id', studentId)
        .in('quest_id', quests.map(q => q.id));

    // Combine
    return quests.map(quest => {
        const p = progress?.find(p => p.quest_id === quest.id);
        const currentCount = p?.current_count || 0;
        const targetCount = quest.weekly_frequency || 1;

        // Determine status based on count vs target
        let status = p?.status || 'locked';
        if (currentCount >= targetCount) status = 'completed';
        else if (currentCount > 0) status = 'in_progress';

        return {
            ...quest,
            weekly_frequency: targetCount,
            current_count: currentCount,
            status: status,
            proof_image_url: p?.last_proof_image_url || null, // Updated column name if changed, or keep simple
        };
    });
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
    let quests = [];

    if (classInfo) {
        // Fetch lessons and quests concurrently
        const [lessonsData, questsData] = await Promise.all([
            getRecentLessons(classInfo.id),
            getQuestProgress(classInfo.id, user.id)
        ]);
        recentLessons = lessonsData;
        quests = questsData;
    }

    return { user, payment, classInfo, recentLessons, quests };
}
