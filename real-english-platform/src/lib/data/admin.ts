import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// --- Data Fetching (DAL) ---

export async function getStudentsData() {
    // Use Service Role to bypass RLS for admin dashboard if available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let supabase;

    if (serviceRoleKey) {
        supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );
    } else {
        console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to standard client (RLS enforced).");
        supabase = await createClient();
    }

    const { data: students, error } = await supabase
        .from('users')
        .select(`
        *,
        class_members(
            status,
            classes(name)
        ),
        payments(
            status
        )
    `)
        /* .eq('role', 'student') -- Allow seeing all for now or filter? User said 3 students. strict filter might hide them if role is null. */
        /* Let's keep strict filter for now but maybe strict role check is why they are hidden if they don't have role 'student' set? */
        /* The user screenshot shows role 'student' in DB. So filter is fine. */
        .eq('role', 'student')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching students:', error);
        return [];
    }

    return students.map(s => {
        const activeClass = s.class_members?.find((m: any) => m.status === 'active')?.classes?.name || '미배정';
        const recentPayment = s.payments?.[0]?.status || 'expired';

        return {
            id: s.id,
            name: s.name,
            email: s.email,
            school: s.school || '학교 정보 없음',
            class: activeClass,
            paymentStatus: recentPayment,
            lastActive: new Date(s.created_at).toLocaleDateString()
        };
    });
}


export async function getClassesData() {
    // Use Service Role to bypass RLS for admin dashboard
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

    const { data } = await supabase
        .from('classes')
        .select('*, class_members(count)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return data?.map(c => ({
        id: c.id,
        name: c.name,
        schedule: c.schedule,
        day_of_week: c.day_of_week,
        start_time: c.start_time,
        end_time: c.end_time,
        price: c.price,
        students: c.class_members?.[0]?.count || 0,
        quest_vocab_on: c.quest_vocab_on,
        quest_listening_on: c.quest_listening_on,
        quest_mock_on: c.quest_mock_on,
        quest_frequency: c.quest_frequency
    })) || [];
}


export async function getBlogPostsData() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    return data?.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        date: new Date(p.created_at).toLocaleDateString(),
        status: p.is_published ? 'published' : 'draft',
        views: 0
    })) || [];
}
