import { createClient } from '@/lib/supabase/server';

// --- Data Fetching (DAL) ---

export async function getStudentsData() {
    const supabase = await createClient();

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
            school: '학교 정보 없음',
            class: activeClass,
            paymentStatus: recentPayment,
            lastActive: new Date(s.created_at).toLocaleDateString()
        };
    });
}


export async function getClassesData() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('classes')
        .select('*, class_members(count)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return data?.map(c => ({
        id: c.id,
        name: c.name,
        schedule: c.schedule,
        price: c.price.toLocaleString(),
        students: c.class_members?.[0]?.count || 0
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
