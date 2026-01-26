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

// 입금일 이후 진행된 수업 횟수 계산
export async function getLessonCountSincePayment(classId: string, paymentDate: string | null) {
    if (!paymentDate) return 0;

    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: lessons, error } = await supabase
        .from('lesson_plans')
        .select('id')
        .eq('class_id', classId)
        .gte('date', paymentDate.split('T')[0]) // 입금일 이후
        .lte('date', today) // 오늘까지 (미래 수업 제외)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching lessons since payment:', error);
        return 0;
    }

    return lessons?.length || 0;
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
    let usedLessonCount = 0;

    if (classInfo) {
        // Fetch lessons, quests, and used lesson count concurrently
        const [lessonsData, questsData, lessonCount] = await Promise.all([
            getRecentLessons(classInfo.id),
            getQuestProgress(classInfo.id, user.id),
            getLessonCountSincePayment(classInfo.id, payment?.payment_date)
        ]);
        recentLessons = lessonsData;
        quests = questsData;
        usedLessonCount = lessonCount;
    }

    return { user, payment, classInfo, recentLessons, quests, usedLessonCount };
}

// ============================================
// 월간 리포트 데이터 조회
// ============================================

export interface ReportSummary {
    // 성적 추이
    mockTrend: { name: string; score: number; label: string }[];
    listeningTrend: { name: string; score: number; label: string }[];
    easyTrend: { name: string; score: number; label: string }[];
    // 숙제 완료율
    weeklyHomework: { total: number; completed: number; rate: number };
    monthlyHomework: { total: number; completed: number; rate: number };
    // 퀘스트 진행
    questProgress: { total: number; completed: number; rate: number };
    // 통계 요약
    stats: {
        mockAvg: number;
        mockCount: number;
        listeningAvg: number;
        listeningCount: number;
        easyAvg: number;
        easyCount: number;
        vocabPassRate: number;
    };
}

export async function getReportData(): Promise<ReportSummary | null> {
    const user = await getUserProfile();
    if (!user) return null;

    const studentId = user.id;

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return null;

    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );

    // 병렬로 모든 데이터 조회
    const [
        mockSubmissions,
        listeningSubmissions,
        easySubmissions,
        classMember,
        vocabChecks,
        questProgress
    ] = await Promise.all([
        // 모의고사 제출
        supabase
            .from('exam_submissions')
            .select('score, created_at, exams(title)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: true })
            .limit(10),
        // 듣기 제출
        supabase
            .from('listening_submissions')
            .select('score, created_at, listening_rounds(round_number, listening_books(name))')
            .eq('student_id', studentId)
            .order('created_at', { ascending: true })
            .limit(10),
        // 쉬운문제 제출
        supabase
            .from('easy_submissions')
            .select('score, created_at, easy_rounds(round_number, easy_books:book_id(name))')
            .eq('student_id', studentId)
            .order('created_at', { ascending: true })
            .limit(10),
        // 수강 중인 반
        supabase
            .from('class_members')
            .select('class_id')
            .eq('student_id', studentId)
            .eq('status', 'active')
            .single(),
        // 단어 테스트 결과
        supabase
            .from('student_lesson_checks')
            .select('vocab_test_passed')
            .eq('student_id', studentId)
            .not('vocab_test_passed', 'is', null),
        // 퀘스트 진행
        supabase
            .from('student_quest_progress')
            .select('status, quest_id, class_quests!inner(is_active)')
            .eq('student_id', studentId)
    ]);

    // 모의고사 추이 변환
    const mockTrend = (mockSubmissions.data || []).map((item: any, idx: number) => ({
        name: `${idx + 1}회`,
        score: item.score,
        label: item.exams?.title || `모의고사 ${idx + 1}`
    }));

    // 듣기 추이 변환
    const listeningTrend = (listeningSubmissions.data || []).map((item: any, idx: number) => ({
        name: `${idx + 1}회`,
        score: item.score,
        label: `${item.listening_rounds?.listening_books?.name || '듣기'} ${item.listening_rounds?.round_number || idx + 1}회`
    }));

    // 쉬운문제 추이 변환
    const easyTrend = (easySubmissions.data || []).map((item: any, idx: number) => ({
        name: `${idx + 1}회`,
        score: item.score,
        label: `${item.easy_rounds?.easy_books?.name || '쉬운문제'} ${item.easy_rounds?.round_number || idx + 1}회`
    }));

    // 숙제 완료율 계산
    const weeklyHomework = await calculateHomeworkRate(supabase, studentId, classMember.data?.class_id, 'week');
    const monthlyHomework = await calculateHomeworkRate(supabase, studentId, classMember.data?.class_id, 'month');

    // 퀘스트 진행률
    const activeQuests = (questProgress.data || []).filter((q: any) => q.class_quests?.is_active);
    const completedQuests = activeQuests.filter((q: any) => q.status === 'completed').length;
    const questRate = activeQuests.length > 0 ? Math.round((completedQuests / activeQuests.length) * 100) : 0;

    // 통계 계산
    const mockScores = (mockSubmissions.data || []).map((d: any) => d.score);
    const listeningScores = (listeningSubmissions.data || []).map((d: any) => d.score);
    const easyScores = (easySubmissions.data || []).map((d: any) => d.score);
    const vocabPassed = (vocabChecks.data || []).filter((d: any) => d.vocab_test_passed === true).length;
    const vocabTotal = (vocabChecks.data || []).length;

    return {
        mockTrend,
        listeningTrend,
        easyTrend,
        weeklyHomework,
        monthlyHomework,
        questProgress: {
            total: activeQuests.length,
            completed: completedQuests,
            rate: questRate
        },
        stats: {
            mockAvg: mockScores.length > 0 ? Math.round(mockScores.reduce((a: number, b: number) => a + b, 0) / mockScores.length) : 0,
            mockCount: mockScores.length,
            listeningAvg: listeningScores.length > 0 ? Math.round(listeningScores.reduce((a: number, b: number) => a + b, 0) / listeningScores.length) : 0,
            listeningCount: listeningScores.length,
            easyAvg: easyScores.length > 0 ? Math.round(easyScores.reduce((a: number, b: number) => a + b, 0) / easyScores.length) : 0,
            easyCount: easyScores.length,
            vocabPassRate: vocabTotal > 0 ? Math.round((vocabPassed / vocabTotal) * 100) : 0
        }
    };
}

async function calculateHomeworkRate(
    supabase: any,
    studentId: string,
    classId: string | null,
    period: 'week' | 'month'
): Promise<{ total: number; completed: number; rate: number }> {
    if (!classId) return { total: 0, completed: 0, rate: 0 };

    const now = new Date();
    let startDate = new Date(now);
    if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else {
        startDate.setMonth(now.getMonth() - 1);
    }

    const { data: lessons } = await supabase
        .from('lesson_plans')
        .select('id, vocab_hw, listening_hw, grammar_hw, other_hw')
        .eq('class_id', classId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', now.toISOString().split('T')[0]);

    if (!lessons || lessons.length === 0) {
        return { total: 0, completed: 0, rate: 100 };
    }

    let totalHomeworks = 0;
    lessons.forEach((lesson: any) => {
        if (lesson.vocab_hw) totalHomeworks++;
        if (lesson.listening_hw) totalHomeworks++;
        if (lesson.grammar_hw) totalHomeworks++;
        if (lesson.other_hw) totalHomeworks++;
    });

    if (totalHomeworks === 0) return { total: 0, completed: 0, rate: 100 };

    const lessonIds = lessons.map((l: any) => l.id);
    const { data: checks } = await supabase
        .from('student_lesson_checks')
        .select('lesson_id, vocab_status, listening_status, grammar_status, other_status')
        .eq('student_id', studentId)
        .in('lesson_id', lessonIds);

    let completedCount = 0;
    const checksMap = new Map(checks?.map((c: any) => [c.lesson_id, c]) || []);

    lessons.forEach((lesson: any) => {
        const check = checksMap.get(lesson.id) as any;
        if (check) {
            if (lesson.vocab_hw && check.vocab_status === 'done') completedCount++;
            if (lesson.listening_hw && check.listening_status === 'done') completedCount++;
            if (lesson.grammar_hw && check.grammar_status === 'done') completedCount++;
            if (lesson.other_hw && check.other_status === 'done') completedCount++;
        }
    });

    const rate = Math.round((completedCount / totalHomeworks) * 100);
    return { total: totalHomeworks, completed: completedCount, rate };
}

// Get learning streak data
export async function getStreakData(userId: string) {
    const supabase = await createClient();

    // Get all submission dates from multiple tables
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get listening submissions
    const { data: listeningSubmissions } = await supabase
        .from('listening_submissions')
        .select('created_at')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });

    // Get easy submissions
    const { data: easySubmissions } = await supabase
        .from('easy_submissions')
        .select('created_at')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });

    // Get quest progress submissions
    const { data: questSubmissions } = await supabase
        .from('student_quest_progress')
        .select('last_submitted_at')
        .eq('student_id', userId)
        .not('last_submitted_at', 'is', null)
        .order('last_submitted_at', { ascending: false });

    // Combine all submission dates
    const allDates = new Set<string>();

    listeningSubmissions?.forEach((s: any) => {
        const date = new Date(s.created_at);
        date.setHours(0, 0, 0, 0);
        allDates.add(date.toISOString().split('T')[0]);
    });

    easySubmissions?.forEach((s: any) => {
        const date = new Date(s.created_at);
        date.setHours(0, 0, 0, 0);
        allDates.add(date.toISOString().split('T')[0]);
    });

    questSubmissions?.forEach((s: any) => {
        if (s.last_submitted_at) {
            const date = new Date(s.last_submitted_at);
            date.setHours(0, 0, 0, 0);
            allDates.add(date.toISOString().split('T')[0]);
        }
    });

    const sortedDates = Array.from(allDates).sort().reverse();

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (allDates.has(dateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
            // Today hasn't been counted yet, check yesterday
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
        } else {
            break;
        }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    sortedDates.reverse().forEach(dateStr => {
        const date = new Date(dateStr);
        if (prevDate) {
            const diffDays = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        } else {
            tempStreak = 1;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        prevDate = date;
    });

    // Calculate this month's active days
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    let thisMonthDays = 0;

    allDates.forEach(dateStr => {
        const date = new Date(dateStr);
        if (date.getMonth() === thisMonth && date.getFullYear() === thisYear) {
            thisMonthDays++;
        }
    });

    // Get last 7 days activity
    const recentActivity: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        recentActivity.push(allDates.has(dateStr));
    }

    // Total days in this month so far
    const totalDays = today.getDate();

    return {
        currentStreak,
        longestStreak,
        thisMonthDays,
        totalDays,
        recentActivity
    };
}
