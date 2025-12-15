# REAL English 과외 플랫폼 - PRD (Product Requirements Document)

**버전:** 1.0
**날짜:** 2025-12-15
**작성자:** 제품 기획팀
**상태:** Draft (검토 전)

---

## 📋 Executive Summary (요약)

### 프로젝트 개요
REAL English는 영어 과외 강사가 학생들의 학습 진행도, 숙제, 모의고사 성적을 통합적으로 관리하고, 학생들이 자신의 수업 일정, 숙제, 성적을 한눈에 확인할 수 있는 **영어 과외 관리 플랫폼**입니다.

### 핵심 가치
- **학생:** 수업 일정, 숙제, 성적을 한곳에서 관리
- **강사:** 학생별 학습 진도를 효율적으로 추적 및 관리
- **비용:** 완전 무료 배포 (Vercel + Supabase)

### 초기 타겟
- **사용자:** 4명의 영어 과외 학생
- **강사:** 1명 (본인)
- **출시일:** 2025년 1월 (목표)

---

## 🎯 목표 및 성공 지표

### 비즈니스 목표
1. 수업 관리 효율성 **50% 향상** (노션 → 플랫폼 전환)
2. 학생의 숙제 완성률 추적 **자동화**
3. 월간 학습 리포트 **자동 생성**

### 성공 지표 (KPI)
| 지표 | 목표 | 측정 방법 |
|------|------|---------|
| 숙제 제출률 | 90% 이상 | 플랫폼 제출 기록 |
| 모의고사 응시율 | 100% | 채점 기록 |
| 월간 리포트 자동화율 | 100% | 수동 작업 제거 |
| 시스템 가용성 | 99% 이상 | Vercel 모니터링 |

---

## 🏗️ 서비스 구조 (Information Architecture)

```
REAL English Platform
│
├─ 📍 Landing Page (공개)
│  └─ 과외 소개, 시간표, 문의
│
├─ 🔐 학생 로그인 (OAuth: Google, Kakao)
│  │
│  ├─ 📊 마이페이지 (Dashboard)
│  │  ├─ 이번주 숙제 공지
│  │  ├─ 수강권 상태 (남은 횟수, 다음 결제일)
│  │  ├─ 현재 수업 진행도 (시작전/진행중/완료)
│  │  └─ 월간 학습 성과 리포트
│  │
│  ├─ 📅 수업 시간표
│  │  └─ 반(Class) 선택
│  │     └─ 📖 반 상세 페이지
│  │        ├─ 📝 수업 일지 (날짜별)
│  │        ├─ ✍️ 매일 숙제 제출 (이미지 업로드)
│  │        └─ ✅ 숙제 완료도 확인
│  │
│  ├─ 📝 모의고사 채점
│  │  └─ 객관식 1~45번 입력 → 자동 채점
│  │
│  ├─ 🎧 듣기 시험
│  │  └─ 특수 구간 입력 (1~20, 25~28, 43~45) → 자동 채점
│  │
│  ├─ 📚 정보글 (블로그)
│  │  └─ 강사가 작성한 영어 학습 콘텐츠
│  │
│  └─ ❓ FAQ & QnA
│     └─ 자주 묻는 질문 + 학생 질문 게시판
│
└─ 🔐 강사 관리자 패널 (별도 비밀번호)
   ├─ 학생 관리
   ├─ 반 관리 (시간표, 가격 설정)
   ├─ 수업 일지 작성
   ├─ 숙제 채점
   ├─ 모의고사/듣기 정답 등록
   ├─ 정보글 관리
   └─ 학생별 성적 리포트
```

---

## 🎨 주요 기능 상세 명세

### 1️⃣ 학생 인증 (Authentication)

#### 요구사항
- Google OAuth 로그인
- Kakao OAuth 로그인
- 이메일 및 비밀번호 로그인 (선택)

#### 기술 스펙
```
엔드포인트:
POST /auth/login
  - provider: "google" | "kakao" | "email"
  - (OAuth) redirectUri: "https://domain.com/auth/callback"
  - (Email) email, password

응답:
{
  "success": true,
  "user_id": "uuid",
  "email": "student@example.com",
  "name": "학생이름",
  "class_id": "반ID",
  "token": "JWT_TOKEN"
}
```

#### 예외 처리
- 등록되지 않은 사용자 → 자동 회원가입
- 토큰 만료 → 자동 갱신

---

### 2️⃣ 학생 대시보드 (Dashboard)

#### 주요 콘텐츠
1. **이번주 숙제 공지** (우선 표시)
   - 반별 숙제 리스트
   - 마감일 표시
   - 제출 상태 (미제출/제출/완료 여부)

2. **수강권 상태**
   - 선입제 기반 남은 횟수
   - 수강권 금액 및 결제 상태 (대기/입금확인중/활성화)
   - 다음 결제일 (입금일 기준 +4주)
   - 결제 버튼 → 결제 대기 상태 전환

3. **현재 수업 진행도**
   - 카드 형식: [시작전] [진행중] [완료]
   - 수업 날짜, 과목, 진도 시각화

4. **월간 학습 성과 리포트**
   - 숙제 완성률 (%)
   - 모의고사 평균 점수 (점)
   - 듣기 평균 점수 (점)
   - 성적 변화 그래프 (주간)
   - 월간 주요 내용 요약

#### UI 설계 기준
- 모바일 우선 (스마트폰에서 읽기 쉬운 크기)
- 카드 기반 레이아웃
- 색상 코딩 (제출 완료 = 초록, 미제출 = 빨강)

---

### 3️⃣ 반(Class) 상세 페이지

#### 탭 구성
**[수업 일지] [숙제] [성적]**

#### 탭 1: 수업 일지
```
날짜별 리스트:
┌─────────────────────┐
│ 12월 15일 (월)     │
│ 📝 수업 내용: 어법 기초
│ 📌 오늘 숙제: 단어 + 듣기
│ ⏰ 다음 수업: 12월 22일
└─────────────────────┘

클릭 → 확대보기
```

#### 탭 2: 숙제
```
📋 이번주 숙제
┌──────────────────────────┐
│ 월 12/15 - 단어 숙제    │
│ 상태: 미제출 ❌          │
│ [사진 업로드] [완료]    │
│                          │
│ 화 12/16 - 듣기 숙제    │
│ 상태: 제출됨 ✅          │
│ 완성도: [완벽] [중간] [미완료]
│ [완료 저장]             │
└──────────────────────────┘

지난주 숙제 기록...
```

#### 탭 3: 성적
```
📊 반별 성적 현황
- 모의고사: 평균 80점
- 듣기: 평균 85점
- 주간 동향: 📈 +5점
```

---

### 4️⃣ 결제 관리 (Payment / 수강권)

#### 결제 흐름
```
1. 학생이 "결제하기" 클릭
   ↓
2. 결제 정보 표시 (금액, 횟수, 유효기간)
   ↓
3. 결제 대기 상태로 전환
   - 상태: "입금 대기중"
   - 강사 계좌 정보 표시
   - 입금 기한 알림
   ↓
4. 강사가 입금 확인 후 "입금 확인" 클릭 (강사 대시보드)
   ↓
5. 학생 화면에 "활성화됨" ✅
   - 남은 횟수: 4회
   - 유효기간: ~2025년 1월 15일
```

#### 데이터베이스 스키마
```
payments 테이블:
{
  id: UUID,
  student_id: UUID,
  amount: 금액,
  class_count: 횟수,
  status: "대기중" | "입금확인중" | "활성화" | "만료",
  payment_date: 결제 신청 날짜,
  confirmed_date: 입금 확인 날짜,
  expiry_date: 유효기간 종료일
}
```

---

### 5️⃣ 수업 일지 관리 (강사 대시보드)

#### 강사 화면
```
[강사 관리자 패널] → [수업 일지] → [반 선택] → [날짜 선택] → [작성]

작성 폼:
┌────────────────────────────┐
│ 날짜: 2025-12-15 (월)     │
│ 반: 고등부 1반            │
│                            │
│ 📝 수업 내용              │
│ [본문 분석 / 어법 기초]  │
│ [텍스트 에리어]           │
│                            │
│ 📌 오늘의 숙제            │
│ ☐ 단어                     │
│ ☐ 듣기                     │
│ [추가 숙제]               │
│                            │
│ 📎 첨부 파일             │
│ [필기본 사진 업로드]      │
│ [이미지 미리보기]         │
│                            │
│ [저장] [취소]            │
└────────────────────────────┘

→ 학생 화면에 자동 반영
```

---

### 6️⃣ 숙제 제출 및 평가 (Homework)

#### 학생 화면: 제출
```
📝 단어 숙제 (12월 15일)
- 마감: 12월 16일 23:59
- 상태: 미제출 ❌

[사진 찍어서 올리기] [갤러리에서 선택]
→ 이미지 업로드 → "제출" 클릭

→ 상태: 제출됨 ✅ (대기중)
→ 강사가 평가 후 완성도 표시
```

#### 강사 화면: 평가
```
[강사 대시보드] → [숙제 평가]

학생별 숙제 목록:
┌──────────────────────┐
│ 학생: 김영희          │
│ 과제: 단어 (12/15)  │
│                       │
│ 📷 제출 사진         │
│ [이미지 미리보기]    │
│                       │
│ 완성도:              │
│ ○ 완벽               │
│ ○ 중간               │
│ ○ 미완료             │
│                       │
│ [저장]               │
└──────────────────────┘
```

#### 데이터 스키마
```
homework_submissions 테이블:
{
  id: UUID,
  student_id: UUID,
  lesson_id: UUID,
  homework_type: "word" | "listening",
  image_url: S3 경로,
  submitted_at: 제출 시간,
  evaluation: "완벽" | "중간" | "미완료" | null,
  evaluated_at: 평가 시간
}
```

---

### 7️⃣ 모의고사 채점 (Mock Exam)

#### 학생 화면
```
[모의고사] → [새로운 답안 작성]

┌─────────────────────────────┐
│ 모의고사 채점               │
│                             │
│ 시험명: 수능 모의고사 12월 │
│ 응시일: 2025-12-15        │
│                             │
│ 1번: ○ ○ ● ○ ○           │
│ 2번: ○ ○ ○ ● ○           │
│ ...                         │
│ 45번: ○ ○ ○ ○ ●          │
│                             │
│ [채점하기]                 │
└─────────────────────────────┘

결과:
┌─────────────────────────────┐
│ ✅ 채점 완료!              │
│ 총점: 86점 / 100점        │
│ 정답률: 86%               │
│                             │
│ 틀린 문제:                 │
│ 3번, 7번, 15번            │
│                             │
│ [상세 분석] [이전 결과]   │
└─────────────────────────────┘
```

#### 강사 화면: 정답 관리
```
[강사 대시보드] → [모의고사 정답 관리]

┌──────────────────────┐
│ 시험명: 12월 수능   │
│ 시험일: 2025-12-15 │
│                      │
│ 정답 입력:          │
│ 1번: [③] (1-5 선택) │
│ 2번: [④]           │
│ ...                  │
│ 45번: [②]          │
│                      │
│ [저장]              │
└──────────────────────┘

→ 학생 제출 시 자동 채점
```

#### 기술 스펙
```
채점 로직:
1. 학생이 1~45번 답안 제출
2. 데이터베이스에서 정답 조회
3. 일치 여부 판단
4. 점수 계산 (각 1점 ~ 100점)
5. 결과 저장 및 표시

API:
POST /exams/grade-mock
{
  exam_id: UUID,
  student_id: UUID,
  answers: [1, 3, 2, ...] // 1~45번
}
→ 200 OK
{
  score: 86,
  correct_count: 43,
  wrong_questions: [3, 7, 15]
}
```

---

### 8️⃣ 듣기 시험 (Listening Exam)

#### 특수 구간 처리
```
일반: 1번 ~ 20번 (20문항)
쉬는 시간 (21~24번 제외)
영어로 진행 (25번 ~ 28번)
최종: 43번 ~ 45번 (3문항)

총 23문항 (1-20 + 25-28 + 43-45)
```

#### 학생 화면
```
[듣기] → [새로운 답안]

┌─────────────────────────────┐
│ 듣기 시험                   │
│                             │
│ 1번~20번: [입력 폼]        │
│ ...                         │
│ 25번~28번: [입력 폼]       │
│ 43번~45번: [입력 폼]       │
│                             │
│ [채점하기]                 │
└─────────────────────────────┘

결과:
┌─────────────────────────────┐
│ ✅ 채점 완료!              │
│ 총점: 19점 / 23점        │
│ 정답률: 82%               │
└─────────────────────────────┘
```

#### 강사 화면: 정답 관리
```
[강사 대시보드] → [듣기 정답 관리]

1~20번 정답, 25~28번 정답, 43~45번 정답 입력
```

---

### 9️⃣ 월간 학습 성과 리포트 (Learning Report)

#### 대시보드에 표시되는 지표

```
📊 12월 학습 성과

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ 숙제 완성률 (주간)
   1주: 85% ████████░
   2주: 90% █████████░
   3주: 100% ██████████
   평균: 91.7%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣ 매일 숙제 완성률 (단어+듣기)
   완벽: 20개 (60%)
   중간: 10개 (30%)
   미완료: 3개 (10%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ 모의고사 성적
   시험 횟수: 3회
   평균 점수: 84점
   최고 점수: 88점
   최저 점수: 80점

   점수 추이: 📈 +4점 (상승)
   [그래프: 80 → 85 → 88]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4️⃣ 듣기 성적
   시험 횟수: 3회
   평균 점수: 82점
   최고 점수: 85점
   최저 점수: 79점

   점수 추이: 📈 +6점 (상승)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5️⃣ 월간 수업 내용 요약
   📚 1주: 어법 기초, 시제
   📚 2주: 수동태, 관계사
   📚 3주: 분사구문, 가정법
   📚 4주: 복합 문장, 숙어

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 데이터 계산 로직
```
숙제 완성률 = (완벽 + 중간) / 전체 숙제 수 × 100%

모의고사 평균 = 모든 모의고사 점수의 합 / 횟수

성적 변화 = 최신 점수 - 4주전 점수
```

---

### 1️⃣0️⃣ 정보글 (Blog)

#### 강사 화면: 작성
```
[강사 대시보드] → [정보글 작성]

┌────────────────────────────┐
│ 새 글 작성                  │
│                            │
│ 제목: [텍스트 입력]       │
│ 카테고리: [문법 ▼]        │
│ 썸네일: [이미지 업로드]   │
│                            │
│ 본문: [에디터]            │
│ [텍스트 서식, 이미지, 링크]
│                            │
│ [임시저장] [발행] [취소]  │
└────────────────────────────┘
```

#### 학생 화면: 열람
```
[정보글] → [카테고리 선택] → [글 목록] → [본문]

카테고리:
- 문법
- 발음
- 어휘
- 시험 준비
- 기타
```

---

### 1️⃣1️⃣ FAQ & QnA

#### 강사 화면: FAQ 관리
```
[강사 대시보드] → [FAQ 관리]

┌────────────────────────────┐
│ 자주 묻는 질문 관리        │
│                            │
│ Q: 숙제는 언제 제출하나요? │
│ A: [에디터]               │
│                            │
│ Q: 수강료는 어떻게 내나요? │
│ A: [에디터]               │
│                            │
│ [추가] [수정] [삭제]      │
└────────────────────────────┘
```

#### 학생 화면: QnA 게시판
```
[FAQ & QnA]

[자주 묻는 질문]
┌─────────────────────────┐
│ Q: 숙제는 언제까지?    │
│ A: 매일 밤 12시 전     │
│                         │
│ Q: 수강료는?           │
│ A: 4주 4회 기준        │
└─────────────────────────┘

[학생 질문 게시판]
┌─────────────────────────┐
│ [새 질문] 버튼          │
│                         │
│ 질문 목록:              │
│ 1. 개인사정으로 한 번   │
│    빠져도 되나요?      │
│    → 강사 답변         │
│                         │
│ 2. 숙제 양이 너무 많아요
│    → 강사 답변         │
└─────────────────────────┘

질문 작성:
[제목], [내용], [등록]
```

---

## 🔐 강사 관리자 대시보드 (Teacher Admin Dashboard)

### Step 7: Teacher Admin Dashboard 구현 사항

#### 7.1 강사 인증 로직
```
로그인 흐름:
1. /auth/login 페이지에서 이메일 입력
2. 이메일에 "admin" 포함 여부 확인
   - admin 포함 → /admin 으로 리다이렉트 (강사 모드)
   - admin 미포함 → /dashboard 로 리다이렉트 (학생 모드)
3. 현재는 mock 로그인 (시뮬레이션)
   - 추후: Supabase Auth + 별도 강사 역할 설정

예시:
- student@test.com → /dashboard (학생)
- admin@test.com → /admin (강사)
- teacherkim@real.com → /admin (강사)
```

#### 7.2 강사 대시보드 레이아웃
```
┌─────────────────────────────────────┐
│  🎓 REAL English 강사 대시보드       │
├─────────────────────────────────────┤
│ [Sidebar]        │     [Main Content] │
├─────────────────┤────────────────────┤
│ • Students      │  Dashboard Overview │
│ • Classes       │  - Total Students   │
│ • Blog/Notice   │  - Pending HWs      │
│ • Settings      │  - Upcoming Classes │
│                 │  - Recent Activity  │
└─────────────────────────────────────┘
```

#### 7.3 강사 메뉴 (Sidebar Navigation)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 REAL English 강사 대시보드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 대시보드
├─ 오늘의 수업 일정
├─ 최근 제출된 숙제
├─ 미확인 질문
└─ 월간 통계

👥 학생 관리
├─ 학생 목록
├─ 반 배정 (Assign Class Dialog)
├─ 학생별 상세 정보 (연락처, 수강권)
├─ 수강권 상태 확인/수정
└─ 결제 확인 (입금 대기 → 입금확인)

🏫 반(Class) 관리
├─ 반 목록 (활성 반)
├─ 새 반 생성 (Create New Class Form)
│  └─ Class Name, Schedule, Price 입력
├─ 반별 학생 추가/제거
├─ 반별 시간표 설정
├─ 반별 수강료 설정
├─ 반별 숙제 빈도 설정 (주 3회, 주 5회 등)
└─ "Add Homework" 버튼 (각 반마다)

📝 수업 일지
├─ 날짜 선택
├─ 수업 내용 입력
├─ 숙제 설정
└─ 필기본 사진 업로드

✅ 숙제 평가
├─ 학생별 미평가 숙제 목록
├─ 이미지 확인
└─ 완성도 평가 (완벽/중간/미완료)

📋 모의고사 관리
├─ 정답 등록
├─ 학생 답안 조회
├─ 성적 관리
└─ 성적 변화 분석

🎧 듣기 관리
├─ 정답 등록 (특수 구간 처리)
├─ 학생 성적 조회
└─ 성적 추이

📚 정보글 (블로그)
├─ 글 목록
├─ "Write New Post" 버튼
│  └─ Title & Markdown Content 입력
├─ 글 수정/삭제
├─ 카테고리 관리
└─ 발행/임시저장

⚙️ 설정
└─ 기본 설정, 프로필 등

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 7.4 주요 기능 (Step 7 신규)

##### A. 학생 관리 페이지
```
URL: /admin/students
기능:
1. 학생 목록 표시
2. "Assign Class" 버튼 (각 학생마다)
   → Dialog 팝업
   → Class 선택 드롭다운
   → [확인] [취소] 버튼
3. 학생별 수강권 상태 표시
4. 학생별 활동 기록 (최근 숙제 제출 등)
```

##### B. 반(Class) 관리 페이지
```
URL: /admin/classes
기능:
1. 활성 반 목록
2. "Create New Class" 버튼
   → Form 팝업
   → Class Name (텍스트)
   → Schedule (시간표, e.g., "월수금 3PM")
   → Price (숫자)
   → [생성] [취소] 버튼
3. 각 반마다 "Add Homework" 버튼
   → Homework Form
   → Homework Type (Word, Listening 등)
   → Deadline 설정
   → [등록] [취소] 버튼
4. 반별 학생 목록 (수정 가능)
```

##### C. 블로그/공지 관리 페이지
```
URL: /admin/blog
기능:
1. 게시글 목록 (발행/임시저장 상태)
2. "Write New Post" 버튼
   → 페이지 이동 또는 Modal
   → Title 입력
   → Markdown Editor
     - 기본 서식 (Bold, Italic, List 등)
     - 실시간 Preview (선택)
   → [임시저장] [발행] [취소] 버튼
3. 글 수정/삭제 기능
4. 카테고리 필터 (문법, 어휘, 발음 등)
```

#### 7.5 기술 구현 스펙

##### 파일 구조
```
src/app/
├─ auth/
│  └─ login/
│     └─ page.tsx (수정: admin 로그인 로직)
│
├─ admin/
│  ├─ layout.tsx (신규: Sidebar 레이아웃)
│  ├─ page.tsx (신규: 대시보드 개요)
│  │
│  ├─ students/
│  │  └─ page.tsx (신규: 학생 관리)
│  │
│  ├─ classes/
│  │  └─ page.tsx (신규: 반 관리)
│  │
│  └─ blog/
│     ├─ page.tsx (신규: 블로그 목록)
│     └─ new/
│        └─ page.tsx (신규: 새 글 작성)
│
└─ components/
   ├─ admin/
   │  ├─ Sidebar.tsx (신규: 사이드바)
   │  ├─ AssignClassDialog.tsx (신규)
   │  ├─ CreateClassForm.tsx (신규)
   │  ├─ AddHomeworkForm.tsx (신규)
   │  └─ MarkdownEditor.tsx (신규: 블로그 에디터)
   │
   └─ ...
```

##### 주요 컴포넌트 & 구현 항목

| 컴포넌트 | 설명 | 상태 |
|---------|------|------|
| AdminLayout | 사이드바 + 메인 콘텐츠 레이아웃 | 신규 |
| AdminDashboard | 대시보드 개요 페이지 | 신규 |
| StudentList | 학생 목록 + Assign Dialog | 신규 |
| ClassList | 반 목록 + Create Dialog | 신규 |
| CreateClassForm | 새 반 생성 폼 | 신규 |
| AddHomeworkForm | 숙제 추가 폼 | 신규 |
| BlogPostList | 블로그 글 목록 | 신규 |
| MarkdownEditor | Markdown 에디터 | 신규 |
| BlogPostForm | 새 글 작성 폼 | 신규 |

##### API 엔드포인트 (기존 + 신규)

```
기존 (유지):
POST /api/auth/login
GET /api/student/dashboard
POST /api/homework/submit
POST /api/mock-exams/grade
등...

신규 (Step 7):
GET /api/teacher/students
  → 학생 목록 조회

POST /api/teacher/students/{id}/assign-class
  → 학생에게 반 배정

GET /api/teacher/classes
  → 강사의 모든 반 조회

POST /api/teacher/classes
  → 새 반 생성

POST /api/teacher/classes/{id}/homework
  → 반에 숙제 추가

GET /api/teacher/blog
  → 블로그 글 목록

POST /api/teacher/blog
  → 새 글 작성 (Title, Content)

PUT /api/teacher/blog/{id}
  → 글 수정

DELETE /api/teacher/blog/{id}
  → 글 삭제
```

---

## 💾 데이터베이스 스키마 (ER Diagram)

### 주요 테이블

```
users (학생)
├─ id: UUID (PK)
├─ email: string
├─ name: string
├─ phone: string
├─ oauth_provider: "google" | "kakao" | "email"
└─ created_at: timestamp

classes (반)
├─ id: UUID (PK)
├─ teacher_id: UUID (현재는 고정, 나중에 확장)
├─ name: string
├─ description: text
├─ schedule: string (e.g., "월수금 오후 3시")
├─ price: integer (수강료)
├─ homework_frequency: "주3회" | "주5회" (미래)
└─ created_at: timestamp

class_members (학생-반 매핑)
├─ id: UUID (PK)
├─ student_id: UUID (FK)
├─ class_id: UUID (FK)
├─ joined_at: timestamp
└─ status: "활성" | "중단" | "종료"

lesson_plans (수업 일지)
├─ id: UUID (PK)
├─ class_id: UUID (FK)
├─ date: date
├─ content: text (수업 내용)
├─ homework: string[] (숙제 리스트)
├─ notes_image_url: string (필기본 사진)
└─ created_at: timestamp

homework_submissions (숙제 제출)
├─ id: UUID (PK)
├─ student_id: UUID (FK)
├─ lesson_id: UUID (FK)
├─ homework_type: "word" | "listening"
├─ image_url: string (S3 경로)
├─ submitted_at: timestamp
├─ evaluation: "완벽" | "중간" | "미완료" | null
└─ evaluated_at: timestamp

mock_exams (모의고사)
├─ id: UUID (PK)
├─ exam_name: string
├─ exam_date: date
├─ answer_key: integer[45] (정답)
└─ created_at: timestamp

mock_exam_results (모의고사 결과)
├─ id: UUID (PK)
├─ student_id: UUID (FK)
├─ exam_id: UUID (FK)
├─ answers: integer[45] (학생 답안)
├─ score: integer
├─ submitted_at: timestamp
└─ updated_at: timestamp

listening_exams (듣기 시험)
├─ id: UUID (PK)
├─ exam_name: string
├─ exam_date: date
├─ answer_key: {[1-20]: int[], [25-28]: int[], [43-45]: int[]}
└─ created_at: timestamp

listening_exam_results (듣기 결과)
├─ id: UUID (PK)
├─ student_id: UUID (FK)
├─ exam_id: UUID (FK)
├─ answers: {[1-20]: int[], [25-28]: int[], [43-45]: int[]}
├─ score: integer
├─ submitted_at: timestamp
└─ updated_at: timestamp

payments (결제/수강권)
├─ id: UUID (PK)
├─ student_id: UUID (FK)
├─ class_id: UUID (FK)
├─ amount: integer
├─ class_count: integer (4회 등)
├─ status: "대기중" | "입금확인중" | "활성화" | "만료"
├─ payment_date: timestamp (결제 신청)
├─ confirmed_date: timestamp (입금 확인)
├─ expiry_date: date (유효기간)
└─ created_at: timestamp

blog_posts (정보글)
├─ id: UUID (PK)
├─ teacher_id: UUID (FK)
├─ title: string
├─ category: string
├─ content: text
├─ thumbnail_url: string
├─ published: boolean
└─ created_at: timestamp

faqs
├─ id: UUID (PK)
├─ question: string
├─ answer: text
├─ order: integer
└─ created_at: timestamp

qna_posts (질문 게시판)
├─ id: UUID (PK)
├─ student_id: UUID (FK)
├─ title: string
├─ content: text
├─ answer: text | null (강사 답변)
├─ answered_at: timestamp | null
├─ created_at: timestamp
└─ updated_at: timestamp
```

---

## 🌐 API 스펙 (주요 엔드포인트)

### 인증 (Auth)
```
POST /api/auth/login
POST /api/auth/oauth/callback
POST /api/auth/logout
GET /api/auth/me
```

### 학생 대시보드
```
GET /api/student/dashboard
  → 이번주 숙제, 수강권, 진도, 리포트

GET /api/student/classes
  → 소속 반 목록

GET /api/student/homework
  → 이번주 숙제 목록
```

### 숙제
```
POST /api/homework/submit
  → 이미지 업로드 + 제출

GET /api/homework/{id}
  → 숙제 상세 정보
```

### 모의고사
```
POST /api/mock-exams/grade
  → 답안 입력 → 자동 채점

GET /api/mock-exams/results
  → 성적 이력
```

### 듣기
```
POST /api/listening-exams/grade
  → 특수 구간 답안 입력 → 채점

GET /api/listening-exams/results
  → 성적 이력
```

### 강사 대시보드
```
POST /api/teacher/lessons
  → 수업 일지 작성

POST /api/teacher/homework/evaluate
  → 숙제 완성도 평가

POST /api/teacher/exams/answer-key
  → 정답 등록

GET /api/teacher/students/{id}/report
  → 학생별 리포트
```

---

## 🎨 UI/UX 원칙

### 반응형 디자인
| 기기 | 해상도 | 대응 |
|------|--------|------|
| 모바일 | 320px ~ 480px | 터치 최적화, 큰 버튼 |
| 태블릿 | 481px ~ 768px | 2단 레이아웃 |
| 데스크톱 | 769px + | 3단 레이아웃, 사이드바 |

### 색상 스키마
- **Primary:** 파란색 (#0066CC)
- **Success:** 초록색 (#28A745) - 완료, 제출 완료
- **Warning:** 주황색 (#FFC107) - 미제출, 대기중
- **Danger:** 빨간색 (#DC3545) - 미완료, 에러
- **Neutral:** 회색 (#6C757D)

### 타이포그래피
- 제목: 볼드, 24px
- 본문: 정상, 16px
- 보조: 정상, 14px

---

## 📱 페이지 목록 (Site Map)

### 공개 페이지
1. **랜딩 페이지** (`/`)
2. **로그인** (`/login`)

### 학생 페이지 (보호됨)
1. **마이페이지** (`/dashboard`)
2. **수업 시간표** (`/classes`)
3. **반 상세** (`/classes/{id}`)
4. **모의고사** (`/mock-exams`)
5. **듣기** (`/listening`)
6. **정보글** (`/blog`)
7. **FAQ & QnA** (`/faq`)

### 강사 페이지 (보호됨 + 비밀번호)
1. **강사 대시보드** (`/teacher/dashboard`)
2. **학생 관리** (`/teacher/students`)
3. **반 관리** (`/teacher/classes`)
4. **수업 일지** (`/teacher/lessons`)
5. **숙제 평가** (`/teacher/homework`)
6. **모의고사 관리** (`/teacher/mock-exams`)
7. **듣기 관리** (`/teacher/listening`)
8. **정보글 관리** (`/teacher/blog`)
9. **FAQ 관리** (`/teacher/faq`)

---

## 🚀 배포 전략

### 호스팅
- **Frontend:** Vercel (Next.js 최적화)
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Storage:** Supabase Storage (S3 호환)

### 무료 Tier 비용
| 서비스 | 무료 한도 | 비고 |
|--------|---------|------|
| Vercel | 무료 | 월 1TB 대역폭 |
| Supabase | 50MB DB, 1GB 저장소 | 4명 학생 충분 |
| Github | 무료 | 무제한 퍼블릭 저장소 |
| **총합** | **완전 무료** | - |

### 배포 단계
1. **Local Dev:** Next.js 로컬 개발 환경
2. **Staging:** Vercel Preview (자동)
3. **Production:** Vercel + Supabase

---

## ⚠️ 위험 요소 및 완화 전략

| 위험 | 영향 | 완화 전략 |
|------|------|---------|
| 데이터 손실 | 높음 | Supabase 자동 백업 + 주1회 수동 백업 |
| 이미지 업로드 용량 초과 | 중간 | 압축, 크기 제한 (5MB/파일) |
| 강사 계정 탈취 | 높음 | 강력한 비밀번호 + 2FA (나중) |
| 학생 개인정보 유출 | 높음 | HTTPS, Supabase RLS (Row Level Security) |
| 서비스 다운 | 중간 | Vercel 99.95% SLA, 모니터링 |

---

## 📊 성공 측정 방법

### Phase 1 (MVP 배포)
- [ ] 4명 모두 로그인 성공
- [ ] 숙제 제출률 90% 이상
- [ ] 시스템 가용성 99% 이상
- [ ] 강사 관리 시간 50% 단축

### Phase 2 (추가 기능)
- [ ] 블로그 글 5개 이상 작성
- [ ] 학생 만족도 4.5/5.0 이상
- [ ] 모의고사 응시율 100%

---

---

## 📌 Step 7 구현 요약

### 핵심 변경 사항

#### 강사 인증 (Mock Login)
- **구현 위치:** `src/app/auth/login/page.tsx`
- **로직:** 이메일에 "admin" 문자 포함 여부로 강사/학생 구분
  - `admin` 포함 → `/admin` 리다이렉트
  - `admin` 미포함 → `/dashboard` 리다이렉트
- **상태:** Mock 기반 시뮬레이션 (추후 Supabase Auth 통합)

#### Admin Dashboard 레이아웃
- **기본 구조:** Sidebar + Main Content
- **Sidebar 메뉴:**
  - Students (학생 관리)
  - Classes (반 관리)
  - Blog/Notice (블로그/공지)
  - Settings (설정)
- **구현 파일:**
  - `src/app/admin/layout.tsx` - Admin 레이아웃
  - `src/components/admin/Sidebar.tsx` - 사이드바 컴포넌트

#### Admin 페이지 목록

##### 1. Dashboard (`/admin`)
- 총 학생 수
- 미평가 숙제 건수
- 예정된 수업
- 최근 활동 로그

##### 2. Students 관리 (`/admin/students`)
- **기능:**
  - 학생 목록 표시
  - "Assign Class" 버튼 (각 학생별)
  - 반 선택 Dialog
- **컴포넌트:**
  - `StudentList.tsx`
  - `AssignClassDialog.tsx`

##### 3. Classes 관리 (`/admin/classes`)
- **기능:**
  - 활성 반 목록 표시
  - "Create New Class" 버튼
  - 클래스 정보 입력 폼 (이름, 시간표, 수강료)
  - "Add Homework" 버튼 (각 반별)
  - Homework 추가 폼
- **컴포넌트:**
  - `ClassList.tsx`
  - `CreateClassForm.tsx`
  - `AddHomeworkForm.tsx`

##### 4. Blog 관리 (`/admin/blog`)
- **기능:**
  - 게시글 목록 (발행/임시저장 상태)
  - "Write New Post" 버튼
  - Markdown 에디터
  - 글 수정/삭제
- **컴포넌트:**
  - `BlogPostList.tsx`
  - `MarkdownEditor.tsx`
  - `BlogPostForm.tsx`

#### 신규 API 엔드포인트 (Step 7)

```
강사용 API:

GET /api/teacher/students
  → 학생 목록 조회

POST /api/teacher/students/{id}/assign-class
  → 학생에게 반 배정

GET /api/teacher/classes
  → 강사의 모든 반 조회

POST /api/teacher/classes
  → 새 반 생성 (name, schedule, price)

POST /api/teacher/classes/{id}/homework
  → 반에 숙제 추가

GET /api/teacher/blog
  → 블로그 글 목록

POST /api/teacher/blog
  → 새 글 작성 (title, content)

PUT /api/teacher/blog/{id}
  → 글 수정

DELETE /api/teacher/blog/{id}
  → 글 삭제
```

### 사용 시나리오

#### 시나리오 1: 강사 로그인 및 대시보드 접근
```
1. 강사가 /auth/login 접속
2. 이메일 "admin@real.com" 입력
3. "admin" 포함 → /admin 자동 리다이렉트
4. Admin Dashboard 표시
   - 오늘의 일정
   - 미평가 숙제
   - 최근 활동
```

#### 시나리오 2: 새 반 생성
```
1. /admin/classes 접속
2. "Create New Class" 버튼 클릭
3. Dialog 팝업:
   - Class Name: "고등부 1반"
   - Schedule: "월수금 3:00 PM"
   - Price: "50000"
4. [생성] 버튼 클릭
5. 반 목록에 새로 생성된 반 표시
```

#### 시나리오 3: 학생에게 반 배정
```
1. /admin/students 접속
2. 학생 "김영희" 찾기
3. [Assign Class] 버튼 클릭
4. Dialog 팝업:
   - Class 선택 드롭다운 (고등부 1반, 중등부 2반 등)
5. "고등부 1반" 선택 → [확인] 클릭
6. 학생이 해당 반에 배정됨
```

#### 시나리오 4: 블로그 글 작성
```
1. /admin/blog 접속
2. "Write New Post" 버튼 클릭
3. 새 글 작성 페이지:
   - Title: "영어 어법 기초"
   - Markdown Editor:
     * ## 소제목
     * **굵은 글씨**
     * 리스트 등
4. [미리보기] 또는 직접 작성
5. [발행] 또는 [임시저장] 클릭
6. 블로그 목록에 글 추가됨
```

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 사항 |
|------|------|---------|
| 1.1 | 2025-12-15 | Step 7: Teacher Admin Dashboard 추가 |
| 1.0 | 2025-12-15 | 초안 작성 |

---

## ✅ 승인 및 서명

| 역할 | 이름 | 날짜 | 서명 |
|------|------|------|------|
| 강사/PM | - | - | - |
| 개발자 | - | - | - |

---

**문서 작성:** 제품 기획팀
**최종 검토:** 대기 중
**배포 대상:** 무료 (Vercel + Supabase)
**예상 출시일:** 2025년 1월
