/**
 * 숙제 날짜 계산 유틸리티
 * 새벽 3시(KST) 기준으로 숙제 날짜를 결정
 */

/**
 * 현재 시간 기준 "숙제 날짜" 계산
 * - 새벽 3시(KST) 이전: 전날 날짜
 * - 새벽 3시(KST) 이후: 당일 날짜
 *
 * @param date - 기준 날짜 (기본값: 현재 시간)
 * @returns YYYY-MM-DD 형식의 숙제 날짜
 */
export function getHomeworkDate(date: Date = new Date()): string {
    // UTC를 KST로 변환 (+9시간)
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstTime = new Date(date.getTime() + kstOffset);

    const hours = kstTime.getUTCHours();

    // 새벽 3시 이전이면 전날 날짜로 처리
    if (hours < 3) {
        kstTime.setUTCDate(kstTime.getUTCDate() - 1);
    }

    // YYYY-MM-DD 형식으로 반환
    const year = kstTime.getUTCFullYear();
    const month = String(kstTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstTime.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * 제출 마감 시각 계산 (다음날 새벽 3시 KST)
 *
 * @param homeworkDate - YYYY-MM-DD 형식의 숙제 날짜
 * @returns 마감 시각 Date 객체
 */
export function getDeadline(homeworkDate: string): Date {
    // 숙제 날짜의 다음날 새벽 3시 (KST)
    const [year, month, day] = homeworkDate.split('-').map(Number);

    // UTC 기준으로 다음날 새벽 3시 KST = 전날 18:00 UTC
    // 즉, homeworkDate 당일 18:00 UTC = homeworkDate+1 03:00 KST
    const deadline = new Date(Date.UTC(year, month - 1, day, 18, 0, 0));

    return deadline;
}

/**
 * 현재 시간이 마감 전인지 확인
 *
 * @param homeworkDate - YYYY-MM-DD 형식의 숙제 날짜
 * @returns 마감 전이면 true
 */
export function isBeforeDeadline(homeworkDate: string): boolean {
    const deadline = getDeadline(homeworkDate);
    return new Date() < deadline;
}

/**
 * 마감까지 남은 시간 계산
 *
 * @param homeworkDate - YYYY-MM-DD 형식의 숙제 날짜
 * @returns 남은 시간 문자열 (예: "5시간 30분")
 */
export function getTimeRemaining(homeworkDate: string): string {
    const deadline = getDeadline(homeworkDate);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) {
        return "마감됨";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
}

/**
 * 마감 시각을 한국어로 포맷
 *
 * @param homeworkDate - YYYY-MM-DD 형식의 숙제 날짜
 * @returns 포맷된 마감 시각 (예: "내일 새벽 3시")
 */
export function formatDeadline(homeworkDate: string): string {
    const deadline = getDeadline(homeworkDate);
    const now = new Date();

    // KST 기준 날짜 비교
    const kstOffset = 9 * 60 * 60 * 1000;
    const todayKst = new Date(now.getTime() + kstOffset);
    const deadlineKst = new Date(deadline.getTime() + kstOffset);

    const todayDate = todayKst.getUTCDate();
    const tomorrowDate = todayDate + 1;
    const deadlineDate = deadlineKst.getUTCDate();

    if (deadlineDate === todayDate) {
        return "오늘 새벽 3시";
    } else if (deadlineDate === tomorrowDate) {
        return "내일 새벽 3시";
    }

    return `${deadlineKst.getUTCMonth() + 1}/${deadlineDate} 새벽 3시`;
}
