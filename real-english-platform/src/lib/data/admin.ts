import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Helper to get admin client for bypassing RLS
function getAdminClientForData() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
        return createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );
    }
    return null;
}

// --- Dashboard Stats ---

export async function getDashboardStats() {
    const adminClient = getAdminClientForData();
    const supabase = adminClient || await createClient();

    // Get total students count
    const { count: totalStudents } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

    // Get ungraded quest submissions (proof images submitted but not reviewed)
    const { count: ungradedQuests } = await supabase
        .from('student_quest_progress')
        .select('*', { count: 'exact', head: true })
        .not('last_proof_image_url', 'is', null)
        .eq('status', 'in_progress');

    // Get today's classes
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()];
    const { data: todayClasses } = await supabase
        .from('classes')
        .select('id, name, start_time, end_time')
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

    // Get unanswered QnA posts (posts without teacher reply - simplified check)
    const { count: unansweredQna } = await supabase
        .from('qna_posts')
        .select('*', { count: 'exact', head: true });

    // Get this month's new students
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newStudentsThisMonth } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .gte('created_at', startOfMonth.toISOString());

    return {
        totalStudents: totalStudents || 0,
        ungradedQuests: ungradedQuests || 0,
        todayClasses: todayClasses || [],
        unansweredQna: unansweredQna || 0,
        newStudentsThisMonth: newStudentsThisMonth || 0
    };
}

// --- Activity Logs ---

export async function getRecentActivityLogs(limit: number = 10) {
    const adminClient = getAdminClientForData();
    const supabase = adminClient || await createClient();

    const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching activity logs:', error);
        return [];
    }

    return data?.map(log => ({
        id: log.id,
        text: log.description,
        type: log.action_type,
        time: formatRelativeTime(new Date(log.created_at)),
        userId: log.user_id,
        userName: log.user_name,
        metadata: log.metadata
    })) || [];
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
}

// --- Data Fetching (DAL) ---

export async function getStudentsData(options?: { includeTestAccounts?: boolean }) {
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
            class_id,
            classes(id, name)
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

    // Filter out test accounts if not explicitly included
    const includeTest = options?.includeTestAccounts ?? false;
    const filteredStudents = includeTest
        ? students
        : students.filter(s => {
            const email = s.email?.toLowerCase() || '';
            return !email.includes('test') && !email.includes('example');
        });

    return filteredStudents.map(s => {
        const activeMembership = s.class_members?.find((m: any) => m.status === 'active');
        const activeClassName = activeMembership?.classes?.name || '미배정';
        const activeClassId = activeMembership?.class_id || null;
        const recentPayment = s.payments?.[0]?.status || 'expired';

        return {
            id: s.id,
            name: s.name,
            email: s.email,
            school: s.school || '학교 정보 없음',
            class: activeClassName,
            classId: activeClassId,
            paymentStatus: recentPayment,
            lastActive: new Date(s.created_at).toLocaleDateString(),
            isTestAccount: (s.email?.toLowerCase() || '').includes('test') || (s.email?.toLowerCase() || '').includes('example')
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
        quest_easy_on: c.quest_easy_on,
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
