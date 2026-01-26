import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

// ============================================
// 성적 추이 조회
// ============================================

export type ScoreType = 'listening' | 'easy' | 'mock';

export interface ScoreTrendItem {
    date: string;
    score: number;
    label: string; // 회차 or 시험명
}

export async function getScoreTrend(
    studentId: string,
    type: ScoreType,
    limit: number = 20
): Promise<ScoreTrendItem[]> {
    const supabase = getAdminClient();

    if (type === 'listening') {
        const { data, error } = await supabase
            .from('listening_submissions')
            .select(`
                score,
                created_at,
                listening_rounds (
                    round_number,
                    title,
                    listening_books (name)
                )
            `)
            .eq('student_id', studentId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error || !data) return [];

        return data.map((item: any) => ({
            date: new Date(item.created_at).toLocaleDateString('ko-KR'),
            score: item.score,
            label: `${item.listening_rounds?.listening_books?.name || '듣기'} ${item.listening_rounds?.round_number || ''}회`
        }));
    }

    if (type === 'easy') {
        const { data, error } = await supabase
            .from('easy_submissions')
            .select(`
                score,
                created_at,
                easy_rounds (
                    round_number,
                    title,
                    easy_books:book_id (name)
                )
            `)
            .eq('student_id', studentId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error || !data) return [];

        return data.map((item: any) => ({
            date: new Date(item.created_at).toLocaleDateString('ko-KR'),
            score: item.score,
            label: `${item.easy_rounds?.easy_books?.name || '쉬운문제'} ${item.easy_rounds?.round_number || ''}회`
        }));
    }

    if (type === 'mock') {
        const { data, error } = await supabase
            .from('exam_submissions')
            .select(`
                score,
                created_at,
                exams (title)
            `)
            .eq('student_id', studentId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error || !data) return [];

        return data.map((item: any) => ({
            date: new Date(item.created_at).toLocaleDateString('ko-KR'),
            score: item.score,
            label: item.exams?.title || '모의고사'
        }));
    }

    return [];
}

// ============================================
// 숙제 완료율
// ============================================

export interface CompletionRate {
    total: number;
    completed: number;
    rate: number; // 0-100
}

export async function getHomeworkCompletionRate(
    studentId: string,
    period: 'week' | 'month'
): Promise<CompletionRate> {
    const supabase = getAdminClient();

    const now = new Date();
    let startDate: Date;

    if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    } else {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // 해당 학생이 속한 반의 수업 조회
    const { data: membership } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .single();

    if (!membership) {
        return { total: 0, completed: 0, rate: 0 };
    }

    // 기간 내 수업 계획 조회
    const { data: lessons, error: lessonsError } = await supabase
        .from('lesson_plans')
        .select('id, vocab_hw, listening_hw, grammar_hw, other_hw')
        .eq('class_id', membership.class_id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', now.toISOString().split('T')[0]);

    if (lessonsError || !lessons || lessons.length === 0) {
        return { total: 0, completed: 0, rate: 0 };
    }

    // 각 수업의 숙제 항목 개수 계산
    let totalHomeworks = 0;
    lessons.forEach((lesson: any) => {
        if (lesson.vocab_hw) totalHomeworks++;
        if (lesson.listening_hw) totalHomeworks++;
        if (lesson.grammar_hw) totalHomeworks++;
        if (lesson.other_hw) totalHomeworks++;
    });

    if (totalHomeworks === 0) {
        return { total: 0, completed: 0, rate: 100 }; // 숙제 없으면 100%
    }

    // 학생의 체크 상태 조회
    const lessonIds = lessons.map((l: any) => l.id);
    const { data: checks } = await supabase
        .from('student_lesson_checks')
        .select('lesson_id, vocab_status, listening_status, grammar_status, other_status')
        .eq('student_id', studentId)
        .in('lesson_id', lessonIds);

    // 완료된 항목 수 계산
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

    return {
        total: totalHomeworks,
        completed: completedCount,
        rate
    };
}

// ============================================
// 취약 문제 분석
// ============================================

export interface WeakPoint {
    questionNumber: number;
    wrongCount: number;
    totalAttempts: number;
    wrongRate: number; // 0-100
}

export async function getWeakPoints(
    studentId: string,
    type: ScoreType,
    minAttempts: number = 2
): Promise<WeakPoint[]> {
    const supabase = getAdminClient();

    let tableName: string;
    let questionCount: number;

    if (type === 'listening') {
        tableName = 'listening_submissions';
        questionCount = 17;
    } else if (type === 'easy') {
        tableName = 'easy_submissions';
        questionCount = 10;
    } else {
        tableName = 'exam_submissions';
        questionCount = 45;
    }

    const { data, error } = await supabase
        .from(tableName)
        .select('details')
        .eq('student_id', studentId);

    if (error || !data || data.length === 0) return [];

    // 문제별 틀린 횟수 집계
    const questionStats: Map<number, { wrong: number; total: number }> = new Map();

    // 초기화
    for (let i = 1; i <= questionCount; i++) {
        questionStats.set(i, { wrong: 0, total: 0 });
    }

    data.forEach((submission: any) => {
        const details = submission.details as any[];
        if (!details || !Array.isArray(details)) return;

        details.forEach((detail: any) => {
            const qNum = detail.questionNumber || (detail.questionIndex + 1);
            const stat = questionStats.get(qNum);
            if (stat) {
                stat.total++;
                if (!detail.isCorrect) {
                    stat.wrong++;
                }
            }
        });
    });

    // 오답률 계산 및 필터링
    const weakPoints: WeakPoint[] = [];

    questionStats.forEach((stat, questionNumber) => {
        if (stat.total >= minAttempts && stat.wrong > 0) {
            const wrongRate = Math.round((stat.wrong / stat.total) * 100);
            weakPoints.push({
                questionNumber,
                wrongCount: stat.wrong,
                totalAttempts: stat.total,
                wrongRate
            });
        }
    });

    // 오답률 높은 순으로 정렬
    weakPoints.sort((a, b) => b.wrongRate - a.wrongRate);

    return weakPoints.slice(0, 10); // 상위 10개만 반환
}

// ============================================
// 학생 기본 정보
// ============================================

export interface StudentInfo {
    id: string;
    name: string;
    email: string;
    school: string | null;
    className: string | null;
    classId: string | null;
    createdAt: string;
}

export async function getStudentInfo(studentId: string): Promise<StudentInfo | null> {
    const supabase = getAdminClient();

    const { data, error } = await supabase
        .from('users')
        .select(`
            id,
            name,
            email,
            school,
            created_at,
            class_members (
                status,
                classes (id, name)
            )
        `)
        .eq('id', studentId)
        .single();

    if (error || !data) return null;

    const activeMember = data.class_members?.find((m: any) => m.status === 'active') as any;
    const classes = activeMember?.classes;

    return {
        id: data.id,
        name: data.name,
        email: data.email,
        school: data.school,
        className: classes?.name || null,
        classId: classes?.id || null,
        createdAt: data.created_at
    };
}

// ============================================
// 전체 통계 요약
// ============================================

export interface StudentStats {
    listeningCount: number;
    listeningAvg: number;
    easyCount: number;
    easyAvg: number;
    mockCount: number;
    mockAvg: number;
    vocabTestPassCount: number;
    vocabTestFailCount: number;
}

export async function getStudentStats(studentId: string): Promise<StudentStats> {
    const supabase = getAdminClient();

    // 듣기 통계
    const { data: listeningData } = await supabase
        .from('listening_submissions')
        .select('score')
        .eq('student_id', studentId);

    const listeningScores = listeningData?.map((d: any) => d.score) || [];
    const listeningAvg = listeningScores.length > 0
        ? Math.round(listeningScores.reduce((a: number, b: number) => a + b, 0) / listeningScores.length)
        : 0;

    // 쉬운문제 통계
    const { data: easyData } = await supabase
        .from('easy_submissions')
        .select('score')
        .eq('student_id', studentId);

    const easyScores = easyData?.map((d: any) => d.score) || [];
    const easyAvg = easyScores.length > 0
        ? Math.round(easyScores.reduce((a: number, b: number) => a + b, 0) / easyScores.length)
        : 0;

    // 모의고사 통계
    const { data: mockData } = await supabase
        .from('exam_submissions')
        .select('score')
        .eq('student_id', studentId);

    const mockScores = mockData?.map((d: any) => d.score) || [];
    const mockAvg = mockScores.length > 0
        ? Math.round(mockScores.reduce((a: number, b: number) => a + b, 0) / mockScores.length)
        : 0;

    // 단어 테스트 통계
    const { data: vocabData } = await supabase
        .from('student_lesson_checks')
        .select('vocab_test_passed')
        .eq('student_id', studentId)
        .not('vocab_test_passed', 'is', null);

    const vocabTestPassCount = vocabData?.filter((d: any) => d.vocab_test_passed === true).length || 0;
    const vocabTestFailCount = vocabData?.filter((d: any) => d.vocab_test_passed === false).length || 0;

    return {
        listeningCount: listeningScores.length,
        listeningAvg,
        easyCount: easyScores.length,
        easyAvg,
        mockCount: mockScores.length,
        mockAvg,
        vocabTestPassCount,
        vocabTestFailCount
    };
}
