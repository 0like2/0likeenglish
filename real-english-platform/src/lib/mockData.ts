export const SCHEDULE_DATA = {
    "09:00 - 12:00": [
        { day: "평일 (화/목)", type: "empty" },
        {
            day: "토요일",
            type: "active",
            title: "고3 수능 대비반",
            tag: "개인",
            status: "진행중",
            id: "class-1",
            nextDate: "2025-12-20"
        },
        {
            day: "일요일",
            type: "recruiting",
            title: "중등 심화반",
            tag: "그룹",
            status: "모집중",
            id: "class-2"
        },
    ],
    "14:00 - 17:00": [
        {
            day: "평일 (화/목)",
            type: "active",
            title: "고2 내신 집중반",
            tag: "그룹",
            status: "진행중",
            id: "class-3",
            nextDate: "2025-12-16"
        },
        { day: "토요일", type: "empty" },
        {
            day: "일요일",
            type: "closed",
            title: "고3 실전 모의고사",
            tag: "그룹",
            status: "마감",
            id: "class-4"
        },
    ],
    "19:00 - 22:00": [
        {
            day: "평일 (화/목)",
            type: "recruiting",
            title: "직장인 회화 기초",
            tag: "개인",
            status: "모집중",
            id: "class-5"
        },
        {
            day: "토요일",
            type: "active",
            title: "토익 900+ 반",
            tag: "그룹",
            status: "진행중",
            id: "class-6",
            nextDate: "2025-12-20"
        },
        { day: "일요일", type: "empty" },
    ]
};

export const CLASS_DETAILS = {
    "class-3": {
        id: "class-3",
        title: "고2 내신 집중반",
        date: "2025-12-16",
        content: `## 오늘 수업 내용: 수동태와 가정법
- 수동태의 기본 형태와 시제 변환 연습
- 가정법 과거와 과거완료의 차이점 이해
- **숙제:** 단어장 Day 15-16 암기, 워크북 p.45-50 풀기`,
        homework: [
            { id: "hw-1", title: "단어장 Day 15-16 암기 및 테스트", type: "word", completed: false },
            { id: "hw-2", title: "워크북 p.45-50 문법 문제 풀이", type: "workbook", completed: false },
            { id: "hw-3", title: "듣기 평가 2회분 풀고 딕테이션", type: "listening", completed: true, evaluation: "perfect" } // Example of completed
        ]
    },
    "class-1": {
        id: "class-1",
        title: "고3 수능 대비반",
        date: "2025-12-20",
        content: "모의고사 풀이 및 해설...",
        homework: []
    }
};

export const MOCK_EXAM_KEY_TITLE = "2025학년도 12월 수능 모의 평가";
// Random answer key for 45 questions (1-5)
export const MOCK_EXAM_KEY = [
    3, 4, 1, 5, 2,  // 1-5
    2, 3, 5, 1, 4,  // 6-10
    4, 1, 2, 5, 3,  // 11-15
    5, 2, 4, 3, 1,  // 16-20
    1, 4, 3, 2, 5,  // 21-25
    3, 1, 5, 4, 2,  // 26-30
    2, 5, 1, 3, 4,  // 31-35
    4, 2, 5, 1, 3,  // 36-40
    5, 3, 2, 4, 1   // 41-45
];
