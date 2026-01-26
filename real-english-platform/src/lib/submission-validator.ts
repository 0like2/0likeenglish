/**
 * 일일 제출 검증 유틸리티
 * 하루 1회 제출 제한 및 마감 체크
 */

import { getHomeworkDate, isBeforeDeadline, formatDeadline } from './homework-date';

export type QuestType = 'listening' | 'easy' | 'vocab';

export interface ValidationResult {
    canSubmit: boolean;
    reason?: string;
    homeworkDate: string;
    deadline?: string;
}

/**
 * 일일 제출 가능 여부 검증
 *
 * @param supabase - Supabase 클라이언트 (admin client 권장)
 * @param studentId - 학생 ID
 * @param questType - 숙제 유형 (listening, easy, vocab)
 * @param questId - 퀘스트 ID (vocab 타입에만 필요)
 * @returns 제출 가능 여부 및 사유
 */
export async function validateDailySubmission(
    supabase: any,
    studentId: string,
    questType: QuestType,
    questId?: string
): Promise<ValidationResult> {
    const homeworkDate = getHomeworkDate();
    const deadline = formatDeadline(homeworkDate);

    // 1. 마감 시간 체크
    if (!isBeforeDeadline(homeworkDate)) {
        return {
            canSubmit: false,
            reason: '오늘 숙제 마감 시간이 지났습니다. (새벽 3시 마감)',
            homeworkDate,
            deadline
        };
    }

    // 2. 중복 제출 체크
    let existing = null;

    if (questType === 'listening') {
        const { data } = await supabase
            .from('listening_submissions')
            .select('id')
            .eq('student_id', studentId)
            .eq('homework_date', homeworkDate)
            .maybeSingle();
        existing = data;
    } else if (questType === 'easy') {
        const { data } = await supabase
            .from('easy_submissions')
            .select('id')
            .eq('student_id', studentId)
            .eq('homework_date', homeworkDate)
            .maybeSingle();
        existing = data;
    } else if (questType === 'vocab' && questId) {
        const { data } = await supabase
            .from('student_quest_progress')
            .select('id')
            .eq('student_id', studentId)
            .eq('quest_id', questId)
            .eq('homework_date', homeworkDate)
            .maybeSingle();
        existing = data;
    }

    if (existing) {
        return {
            canSubmit: false,
            reason: '오늘 이미 제출하셨습니다. 내일 다시 제출해주세요.',
            homeworkDate,
            deadline
        };
    }

    return {
        canSubmit: true,
        homeworkDate,
        deadline
    };
}

/**
 * 오늘의 숙제 완료 상태 조회
 *
 * @param supabase - Supabase 클라이언트
 * @param studentId - 학생 ID
 * @returns 각 숙제 유형별 완료 여부
 */
export async function getTodaySubmissionStatus(
    supabase: any,
    studentId: string
): Promise<{
    listening: boolean;
    easy: boolean;
    vocab: boolean;
    homeworkDate: string;
    deadline: string;
}> {
    const homeworkDate = getHomeworkDate();
    const deadline = formatDeadline(homeworkDate);

    const [listeningResult, easyResult, vocabResult] = await Promise.all([
        // 듣기 제출 여부
        supabase
            .from('listening_submissions')
            .select('id')
            .eq('student_id', studentId)
            .eq('homework_date', homeworkDate)
            .maybeSingle(),

        // 쉬운문제 제출 여부
        supabase
            .from('easy_submissions')
            .select('id')
            .eq('student_id', studentId)
            .eq('homework_date', homeworkDate)
            .maybeSingle(),

        // 영단어(vocab) 제출 여부 - 오늘 날짜에 제출한 퀘스트 개수
        supabase
            .from('student_quest_progress')
            .select('id')
            .eq('student_id', studentId)
            .eq('homework_date', homeworkDate)
    ]);

    return {
        listening: !!listeningResult.data,
        easy: !!easyResult.data,
        vocab: (vocabResult.data?.length || 0) > 0,
        homeworkDate,
        deadline
    };
}

/**
 * 놓친 숙제 개수 조회 (최근 N일)
 *
 * @param supabase - Supabase 클라이언트
 * @param studentId - 학생 ID
 * @param classId - 반 ID (수업 요일 확인용)
 * @param days - 조회할 일수 (기본: 7일)
 * @returns 놓친 숙제 정보
 */
export async function getMissedHomeworkCount(
    supabase: any,
    studentId: string,
    classId: string,
    days: number = 7
): Promise<{
    listening: number;
    easy: number;
    vocab: number;
    total: number;
    details: Array<{ date: string; type: string }>;
}> {
    // 반의 수업 요일 정보 가져오기
    const { data: classData } = await supabase
        .from('classes')
        .select('day_of_week, quest_listening_on, quest_easy_on, quest_vocab_on')
        .eq('id', classId)
        .single();

    if (!classData) {
        return { listening: 0, easy: 0, vocab: 0, total: 0, details: [] };
    }

    // 최근 N일의 숙제 날짜들 계산 (오늘 제외)
    const homeworkDates: string[] = [];
    const today = new Date();

    for (let i = 1; i <= days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // 해당 날짜가 수업 요일인지 확인 (간단 버전 - 모든 날짜 체크)
        const dateStr = getHomeworkDate(date);
        homeworkDates.push(dateStr);
    }

    if (homeworkDates.length === 0) {
        return { listening: 0, easy: 0, vocab: 0, total: 0, details: [] };
    }

    // 제출된 숙제 조회
    const [listeningSubmissions, easySubmissions, vocabSubmissions] = await Promise.all([
        classData.quest_listening_on ? supabase
            .from('listening_submissions')
            .select('homework_date')
            .eq('student_id', studentId)
            .in('homework_date', homeworkDates)
            : { data: [] },

        classData.quest_easy_on ? supabase
            .from('easy_submissions')
            .select('homework_date')
            .eq('student_id', studentId)
            .in('homework_date', homeworkDates)
            : { data: [] },

        classData.quest_vocab_on ? supabase
            .from('student_quest_progress')
            .select('homework_date')
            .eq('student_id', studentId)
            .in('homework_date', homeworkDates)
            : { data: [] }
    ]);

    const submittedListening = new Set((listeningSubmissions.data || []).map((s: any) => s.homework_date));
    const submittedEasy = new Set((easySubmissions.data || []).map((s: any) => s.homework_date));
    const submittedVocab = new Set((vocabSubmissions.data || []).map((s: any) => s.homework_date));

    // 놓친 숙제 계산
    let missedListening = 0;
    let missedEasy = 0;
    let missedVocab = 0;
    const details: Array<{ date: string; type: string }> = [];

    for (const date of homeworkDates) {
        if (classData.quest_listening_on && !submittedListening.has(date)) {
            missedListening++;
            details.push({ date, type: '듣기' });
        }
        if (classData.quest_easy_on && !submittedEasy.has(date)) {
            missedEasy++;
            details.push({ date, type: '쉬운문제' });
        }
        if (classData.quest_vocab_on && !submittedVocab.has(date)) {
            missedVocab++;
            details.push({ date, type: '영단어' });
        }
    }

    return {
        listening: missedListening,
        easy: missedEasy,
        vocab: missedVocab,
        total: missedListening + missedEasy + missedVocab,
        details: details.sort((a, b) => b.date.localeCompare(a.date))
    };
}
