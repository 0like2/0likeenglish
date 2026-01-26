import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClientForData() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return null;
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );
}

export interface DetailedReportData {
    studentName: string;
    stats: {
        mockAvg: number;
        mockCount: number;
        mockTrend: 'up' | 'down' | 'stable';
        listeningAvg: number;
        listeningCount: number;
        listeningTrend: 'up' | 'down' | 'stable';
        easyAvg: number;
        easyCount: number;
        easyTrend: 'up' | 'down' | 'stable';
        vocabPassRate: number;
        vocabPassCount: number;
        vocabTotalCount: number;
    };
    mockTrend: { name: string; score: number }[];
    listeningTrend: { name: string; score: number }[];
    easyTrend: { name: string; score: number }[];
    recentExams: { title: string; date: string; score: number; type: string }[];
    weeklyHomework: { total: number; completed: number; rate: number };
    monthlyHomework: { total: number; completed: number; rate: number };
    weeklyHomeworkDetails: { lessonDate: string; type: string; status: string }[];
    homeworkByType: {
        vocab: { total: number; done: number };
        listening: { total: number; done: number };
        grammar: { total: number; done: number };
        other: { total: number; done: number };
    };
    vocabTestResults: { lessonDate: string; passed: boolean }[];
    questProgress: { total: number; completed: number; rate: number };
    quests: { title: string; targetCount: number; currentCount: number; status: string }[];
    mockWeakPoints: { questionNumber: number; wrongRate: number; wrongCount: number; totalAttempts: number }[];
    listeningWeakPoints: { questionNumber: number; wrongRate: number; wrongCount: number; totalAttempts: number }[];
    easyWeakPoints: { questionNumber: number; wrongRate: number; wrongCount: number; totalAttempts: number }[];
    suggestions: string[];
}

export async function getDetailedReportData(): Promise<DetailedReportData | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const adminClient = getAdminClientForData();
    if (!adminClient) return null;

    const studentId = user.id;

    // Fetch user info
    const { data: userData } = await adminClient
        .from('users')
        .select('name')
        .eq('id', studentId)
        .single();

    const studentName = userData?.name || user.email?.split('@')[0] || '학생';

    // Parallel data fetching
    const [
        mockSubmissions,
        listeningSubmissions,
        easySubmissions,
        classMember,
        vocabChecks,
        questProgressData
    ] = await Promise.all([
        adminClient.from('exam_submissions')
            .select('score, created_at, details, exams(title)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: true })
            .limit(20),
        adminClient.from('listening_submissions')
            .select('score, created_at, details, listening_rounds(round_number, listening_books(name))')
            .eq('student_id', studentId)
            .order('created_at', { ascending: true })
            .limit(20),
        adminClient.from('easy_submissions')
            .select('score, created_at, details, easy_rounds(round_number, easy_books:book_id(name))')
            .eq('student_id', studentId)
            .order('created_at', { ascending: true })
            .limit(20),
        adminClient.from('class_members')
            .select('class_id')
            .eq('student_id', studentId)
            .eq('status', 'active')
            .single(),
        adminClient.from('student_lesson_checks')
            .select('lesson_id, vocab_test_passed, lesson_plans(date)')
            .eq('student_id', studentId)
            .not('vocab_test_passed', 'is', null),
        adminClient.from('student_quest_progress')
            .select('*, class_quests(title, weekly_frequency)')
            .eq('student_id', studentId)
    ]);

    // Process mock exam data
    const mockScores = mockSubmissions.data?.map((s: any) => s.score) || [];
    const mockAvg = mockScores.length > 0 ? Math.round(mockScores.reduce((a: number, b: number) => a + b, 0) / mockScores.length) : 0;
    const mockTrend = calculateTrend(mockScores);

    // Process listening data
    const listeningScores = listeningSubmissions.data?.map((s: any) => s.score) || [];
    const listeningAvg = listeningScores.length > 0 ? Math.round(listeningScores.reduce((a: number, b: number) => a + b, 0) / listeningScores.length) : 0;
    const listeningTrendDir = calculateTrend(listeningScores);

    // Process easy problem data
    const easyScores = easySubmissions.data?.map((s: any) => s.score) || [];
    const easyAvg = easyScores.length > 0 ? Math.round(easyScores.reduce((a: number, b: number) => a + b, 0) / easyScores.length) : 0;
    const easyTrendDir = calculateTrend(easyScores);

    // Vocab test stats
    const vocabPassed = vocabChecks.data?.filter((c: any) => c.vocab_test_passed === true).length || 0;
    const vocabTotal = vocabChecks.data?.length || 0;
    const vocabPassRate = vocabTotal > 0 ? Math.round((vocabPassed / vocabTotal) * 100) : 0;

    // Process trends for charts
    const mockTrendData = mockSubmissions.data?.map((s: any) => ({
        name: new Date(s.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        score: s.score
    })) || [];

    const listeningTrendData = listeningSubmissions.data?.map((s: any) => ({
        name: `${s.listening_rounds?.round_number || ''}회`,
        score: s.score
    })) || [];

    const easyTrendData = easySubmissions.data?.map((s: any) => ({
        name: `${s.easy_rounds?.round_number || ''}회`,
        score: s.score
    })) || [];

    // Recent exams
    const recentExams: any[] = [];
    mockSubmissions.data?.slice(-5).reverse().forEach((s: any) => {
        recentExams.push({
            title: s.exams?.title || '모의고사',
            date: new Date(s.created_at).toLocaleDateString('ko-KR'),
            score: s.score,
            type: '모의고사'
        });
    });
    listeningSubmissions.data?.slice(-3).reverse().forEach((s: any) => {
        recentExams.push({
            title: `${s.listening_rounds?.listening_books?.name || '듣기'} ${s.listening_rounds?.round_number}회`,
            date: new Date(s.created_at).toLocaleDateString('ko-KR'),
            score: s.score,
            type: '듣기'
        });
    });

    // Homework calculation
    const classId = classMember.data?.class_id;
    let weeklyHomework = { total: 0, completed: 0, rate: 0 };
    let monthlyHomework = { total: 0, completed: 0, rate: 0 };
    let weeklyHomeworkDetails: any[] = [];
    let homeworkByType = {
        vocab: { total: 0, done: 0 },
        listening: { total: 0, done: 0 },
        grammar: { total: 0, done: 0 },
        other: { total: 0, done: 0 }
    };

    if (classId) {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const { data: lessons } = await adminClient
            .from('lesson_plans')
            .select('id, date, vocab_hw, listening_hw, grammar_hw, other_hw')
            .eq('class_id', classId)
            .gte('date', monthAgo.toISOString().split('T')[0])
            .lte('date', now.toISOString().split('T')[0]);

        const lessonIds = lessons?.map((l: any) => l.id) || [];
        const { data: checks } = await adminClient
            .from('student_lesson_checks')
            .select('lesson_id, vocab_status, listening_status, grammar_status, other_status')
            .eq('student_id', studentId)
            .in('lesson_id', lessonIds);

        const checksMap = new Map(checks?.map((c: any) => [c.lesson_id, c]) || []);

        lessons?.forEach((lesson: any) => {
            const check = checksMap.get(lesson.id) as any;
            const isWeekly = new Date(lesson.date) >= weekAgo;

            if (lesson.vocab_hw) {
                homeworkByType.vocab.total++;
                monthlyHomework.total++;
                if (isWeekly) weeklyHomework.total++;
                if (check?.vocab_status === 'done') {
                    homeworkByType.vocab.done++;
                    monthlyHomework.completed++;
                    if (isWeekly) weeklyHomework.completed++;
                }
                if (isWeekly) {
                    weeklyHomeworkDetails.push({
                        lessonDate: lesson.date,
                        type: '단어',
                        status: check?.vocab_status || 'none'
                    });
                }
            }
            if (lesson.listening_hw) {
                homeworkByType.listening.total++;
                monthlyHomework.total++;
                if (isWeekly) weeklyHomework.total++;
                if (check?.listening_status === 'done') {
                    homeworkByType.listening.done++;
                    monthlyHomework.completed++;
                    if (isWeekly) weeklyHomework.completed++;
                }
            }
            if (lesson.grammar_hw) {
                homeworkByType.grammar.total++;
                monthlyHomework.total++;
                if (isWeekly) weeklyHomework.total++;
                if (check?.grammar_status === 'done') {
                    homeworkByType.grammar.done++;
                    monthlyHomework.completed++;
                    if (isWeekly) weeklyHomework.completed++;
                }
            }
            if (lesson.other_hw) {
                homeworkByType.other.total++;
                monthlyHomework.total++;
                if (isWeekly) weeklyHomework.total++;
                if (check?.other_status === 'done') {
                    homeworkByType.other.done++;
                    monthlyHomework.completed++;
                    if (isWeekly) weeklyHomework.completed++;
                }
            }
        });

        weeklyHomework.rate = weeklyHomework.total > 0 ? Math.round((weeklyHomework.completed / weeklyHomework.total) * 100) : 100;
        monthlyHomework.rate = monthlyHomework.total > 0 ? Math.round((monthlyHomework.completed / monthlyHomework.total) * 100) : 100;
    }

    // Vocab test results
    const vocabTestResults = vocabChecks.data?.map((c: any) => ({
        lessonDate: c.lesson_plans?.date || '',
        passed: c.vocab_test_passed === true
    })).slice(-10) || [];

    // Quest progress
    const quests = questProgressData.data?.map((q: any) => ({
        title: q.class_quests?.title || '퀘스트',
        targetCount: q.class_quests?.weekly_frequency || 1,
        currentCount: q.current_count || 0,
        status: q.status || 'pending'
    })) || [];

    const completedQuests = quests.filter((q: any) => q.status === 'completed').length;
    const questProgress = {
        total: quests.length,
        completed: completedQuests,
        rate: quests.length > 0 ? Math.round((completedQuests / quests.length) * 100) : 0
    };

    // Weak points analysis
    const mockWeakPoints = analyzeWeakPoints(mockSubmissions.data || [], 45);
    const listeningWeakPoints = analyzeWeakPoints(listeningSubmissions.data || [], 17);
    const easyWeakPoints = analyzeWeakPoints(easySubmissions.data || [], 10);

    // Generate suggestions
    const suggestions = generateSuggestions({
        mockAvg, listeningAvg, easyAvg, vocabPassRate,
        weeklyHomeworkRate: weeklyHomework.rate,
        mockWeakPoints, listeningWeakPoints, easyWeakPoints
    });

    return {
        studentName,
        stats: {
            mockAvg,
            mockCount: mockScores.length,
            mockTrend,
            listeningAvg,
            listeningCount: listeningScores.length,
            listeningTrend: listeningTrendDir,
            easyAvg,
            easyCount: easyScores.length,
            easyTrend: easyTrendDir,
            vocabPassRate,
            vocabPassCount: vocabPassed,
            vocabTotalCount: vocabTotal
        },
        mockTrend: mockTrendData,
        listeningTrend: listeningTrendData,
        easyTrend: easyTrendData,
        recentExams,
        weeklyHomework,
        monthlyHomework,
        weeklyHomeworkDetails,
        homeworkByType,
        vocabTestResults,
        questProgress,
        quests,
        mockWeakPoints,
        listeningWeakPoints,
        easyWeakPoints,
        suggestions
    };
}

function calculateTrend(scores: number[]): 'up' | 'down' | 'stable' {
    if (scores.length < 2) return 'stable';
    const recent = scores.slice(-3);
    const older = scores.slice(-6, -3);
    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (recentAvg > olderAvg + 3) return 'up';
    if (recentAvg < olderAvg - 3) return 'down';
    return 'stable';
}

function analyzeWeakPoints(submissions: any[], questionCount: number) {
    const stats: Map<number, { wrong: number; total: number }> = new Map();

    for (let i = 1; i <= questionCount; i++) {
        stats.set(i, { wrong: 0, total: 0 });
    }

    submissions.forEach((sub: any) => {
        const details = sub.details as any[];
        if (!details || !Array.isArray(details)) return;

        details.forEach((d: any) => {
            const qNum = d.questionNumber || (d.questionIndex + 1);
            const stat = stats.get(qNum);
            if (stat) {
                stat.total++;
                if (!d.isCorrect) stat.wrong++;
            }
        });
    });

    const weakPoints: any[] = [];
    stats.forEach((stat, qNum) => {
        if (stat.total >= 2 && stat.wrong > 0) {
            weakPoints.push({
                questionNumber: qNum,
                wrongCount: stat.wrong,
                totalAttempts: stat.total,
                wrongRate: Math.round((stat.wrong / stat.total) * 100)
            });
        }
    });

    return weakPoints.sort((a, b) => b.wrongRate - a.wrongRate).slice(0, 5);
}

function generateSuggestions(data: any): string[] {
    const suggestions: string[] = [];

    if (data.weeklyHomeworkRate < 70) {
        suggestions.push('숙제 완료율이 낮습니다. 꾸준한 숙제 수행이 성적 향상에 중요합니다.');
    }

    if (data.vocabPassRate < 60) {
        suggestions.push('단어 테스트 통과율을 높이기 위해 매일 단어 암기 시간을 확보해보세요.');
    }

    if (data.mockWeakPoints.length > 0) {
        const topWeak = data.mockWeakPoints[0];
        suggestions.push(`모의고사 ${topWeak.questionNumber}번 문제 유형을 집중적으로 복습해보세요.`);
    }

    if (data.listeningWeakPoints.length > 0) {
        suggestions.push('듣기 취약 문항을 반복 청취하고 받아쓰기 연습을 해보세요.');
    }

    if (data.mockAvg > 0 && data.mockAvg < 70) {
        suggestions.push('모의고사 점수 향상을 위해 오답 노트를 작성해보세요.');
    }

    if (suggestions.length === 0) {
        suggestions.push('꾸준히 잘 하고 있습니다! 현재 페이스를 유지하세요.');
    }

    return suggestions.slice(0, 4);
}
