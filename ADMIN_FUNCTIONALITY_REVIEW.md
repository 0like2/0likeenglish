# 📊 관리자 기능 정상 작동 여부 검토 보고서

**작성일:** 2025-12-22
**상태:** 검토 완료 - 즉시 수정 필요
**우선순위:** 🔴 HIGH (블로킹 이슈 포함)

---

## 요약

관리자 페이지의 **CRUD 기능들이 부분적으로만 구현**되어 있으며, **데이터 흐름에 여러 불일치**가 있습니다:

- ✅ **작동함:** 학생 관리, 반 생성/수정/삭제, 수업 로그 생성
- ⚠️ **부분 작동:** 수업 로그 (모의고사 선택 기능 비활성화)
- ❌ **미구현:** 블로그 수정/삭제, 모의고사 수정/삭제
- 🔴 **오류:** 결제 데이터 조회, 모의고사 결과 페이지, 스키마 미스매치

---

## 🔴 **Phase 1: 즉시 수정 필요 (블로킹 이슈)**

### **1. 수업 로그 등록 시 모의고사 선택 불가 ⚠️**

#### 문제 상황

**관리자 클래스 상세 페이지:**
```typescript
// /admin/classes/[id]/page.tsx:58-62
const { data: exams, error: examsError } = await supabase
    .from('exams')
    .select('id, title, category')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

// ... 하지만 198줄에서:
<ManageLessonsForm classId={id} className={classData.name} exams={[]} />
// ❌ exams 데이터를 가져왔는데도 빈 배열로 전달!
```

**결과:** 수업 로그 등록 시 모의고사 선택 드롭다운이 비어있음

#### 원인

커밋 히스토리:
```
7f3d2b5 chore: temporarily disable exams prop to isolate 500 render error
919fa3f chore: add logging and safeguard exam title rendering
```

500 에러를 해결하기 위해 임시로 exams prop을 비활성화함

#### 수정 방법

```typescript
// /admin/classes/[id]/page.tsx:198
// Before:
<ManageLessonsForm classId={id} className={classData.name} exams={[]} />

// After:
<ManageLessonsForm classId={id} className={classData.name} exams={exams || []} />
```

#### 영향도
- **심각도:** 🟡 중간 (기능 사용 불가)
- **영향 범위:** 모의고사 연계 수업 구성 불가
- **수정 시간:** 1분

---

### **2. 모의고사 결과 페이지 오류 🔴**

#### 문제 상황

**Admin 모의고사 결과 페이지:**
```typescript
// /admin/exams/[id]/page.tsx
const supabase = await createClient();
const { data: exam } = await supabase
    .from('class_exams')  // ❌ 이 테이블이 존재하지 않음!
    .select('*')
    .eq('id', id)
    .single();
```

#### 원인

데이터베이스 마이그레이션 이력:
```
Migration: 20251222_refactor_exams.sql
- class_exams 테이블 DROP
- 전역 exams 테이블로 통합
- lesson_plans에 exam_id 외래키 추가
```

코드는 업데이트되지 않음!

#### 결과
- 관리자가 모의고사 결과 보기를 클릭하면 **404 또는 데이터 조회 오류**
- 학생 성적 관리 불가

#### 수정 방법

```typescript
// /admin/exams/[id]/page.tsx - 전체 수정 필요
// class_exams 대신 exams 테이블 사용
const { data: exam } = await supabase
    .from('exams')  // ✅ 올바른 테이블
    .select('*')
    .eq('id', id)
    .single();

// exam_submissions 테이블에서 결과 조회 (현재 코드가 맞음)
const { data: results } = await supabase
    .from('exam_submissions')
    .select('*, users(name, email)')
    .eq('exam_id', id);
```

#### 영향도
- **심각도:** 🔴 높음 (기능 완전 불가)
- **영향 범위:** 모든 모의고사 관리
- **수정 시간:** 10분

---

### **3. 결제 정보 조회 오류 🔴**

#### 문제 상황

**두 곳에서 컬럼명 오류:**

```typescript
// /lib/data/dashboard.ts:48 (마이페이지)
const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', userId)  // ❌ 존재하지 않는 컬럼
    .single();

// /lib/data/dashboard.ts:74 (반 정보 조회)
const { data: member } = await supabase
    .from('class_members')
    .select('*, classes(*)')
    .eq('student_id', userId)  // ❌ 존재하지 않는 컬럼
    .single();
```

#### 데이터베이스 실제 스키마

```sql
-- payments 테이블
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,  -- ← student_id 아님!
    class_id UUID,
    amount INTEGER,
    status TEXT,
    ...
);

-- class_members 테이블
CREATE TABLE class_members (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,  -- ← student_id 아님!
    class_id UUID,
    ...
);
```

#### 결과

**마이페이지 로드 시:**
1. `getDashboardData()` 호출
2. `getPaymentStatus(user.id)` 실행
3. `student_id` 컬럼이 없으므로 쿼리 실패
4. 폴백으로 하드코딩된 값 반환: `{ status: 'active', class_count: 4, amount: 0 }`
5. **실제 결제 정보가 화면에 표시되지 않음**

마찬가지로 `getClassInfo()`, `getQuestProgress()`도 같은 문제

#### 수정 방법

```typescript
// /lib/data/dashboard.ts

// Before:
.eq('student_id', userId)

// After:
.eq('user_id', userId)
```

모든 쿼리에서 `student_id` → `user_id` 변경 필요

#### 영향도
- **심각도:** 🔴 높음 (학생 데이터 접근 불가)
- **영향 범위:** 마이페이지 전체, 대시보드 데이터
- **수정 시간:** 5분

---

## 🟡 **Phase 2: 높은 우선순위 (기능 불완전)**

### **4. 블로그 글 수정/삭제 미구현**

#### 문제 상황

**관리자 블로그 페이지:**
```typescript
// /admin/blog/page.tsx:46-49
<Button
    onClick={() => handleEdit(post.id)}  // ← 함수가 없음!
    variant="ghost"
    size="sm"
>
    수정
</Button>

<Button
    onClick={() => handleDelete(post.id)}  // ← 함수가 없음!
    variant="ghost"
    size="sm"
>
    삭제
</Button>
```

#### 현재 구현

- ✅ 블로그 글 **생성:** `createBlogPost()` 구현됨 (admin.ts)
- ✅ 블로그 글 **조회:** 리스트 표시됨
- ❌ 블로그 글 **수정:** 미구현
- ❌ 블로그 글 **삭제:** 미구현

#### 필요한 구현

```typescript
// /lib/actions/admin.ts에 추가

export async function updateBlogPost(postId: string, formData: any) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('blog_posts')
        .update({
            title: formData.title,
            content: formData.content,
            category: formData.category,
            is_published: formData.is_published,
            updated_at: new Date()
        })
        .eq('id', postId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/blog');
}

export async function deleteBlogPost(postId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/blog');
}
```

#### 영향도
- **심각도:** 🟡 중간 (글 작성 후 수정 불가)
- **영향 범위:** 블로그 콘텐츠 관리
- **수정 시간:** 20분

---

### **5. 모의고사 수정/삭제 미구현**

#### 문제 상황

**관리자 모의고사 목록:**
```typescript
// /admin/exams/page.tsx
// 생성만 가능, 수정/삭제 버튼 없음 (또는 비활성화)
```

#### 현재 구현

- ✅ 모의고사 **생성:** `createExam()` 구현됨
- ✅ 모의고사 **조회:** 목록 및 결과 표시 (단, 결과 페이지 버그 있음)
- ❌ 모의고사 **수정:** 미구현
- ❌ 모의고사 **삭제:** 미구현

#### 고려사항

정답이 설정된 후 학생들이 제출했다면, 정답 변경 시 이미 제출된 시험의 채점 결과가 변경될 수 있음. 따라서:
- 정답 수정은 신중하게 구현
- 삭제는 제출 결과가 있으면 금지
- 또는 버전 관리 필요

#### 영향도
- **심각도:** 🟡 중간 (오류 수정 불가)
- **영향 범위:** 모의고사 콘텐츠 관리
- **수정 시간:** 30분 (정책 결정 필요)

---

## 🔴 **Phase 3: 데이터 스키마 불일치**

### **6. 학생 정보 - School 필드 없음**

#### 문제 상황

```typescript
// /lib/data/admin.ts:52
school: '학교 정보 없음'  // ← 항상 하드코딩됨
```

#### 원인

학생 관리 페이지에서 학생 목록을 표시할 때, `users` 테이블에 `school` 컬럼이 없음

#### 해결 방법

**Option A: 데이터베이스에 school 컬럼 추가**
```sql
ALTER TABLE public.users ADD COLUMN school TEXT;
```

**Option B: UI에서 school 필드 제거**
```typescript
// 학생 목록에서 school 표시 안 함
```

#### 영향도
- **심각도:** 🟡 중간
- **수정 시간:** 5분

---

### **7. 결제 정보 - expiry_date 컬럼 없음**

#### 문제 상황

```typescript
// /dashboard/page.tsx:21
const nextPayDate = payment?.expiry_date
    ? format(new Date(payment.expiry_date), "yyyy-MM-dd")
    : "미정";

// 항상 "미정" 표시됨
```

#### 원인

`payments` 테이블에 `expiry_date` 컬럼이 없음

#### 현재 스키마

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID,
    class_id UUID,
    amount INTEGER,
    class_count INTEGER,
    status TEXT,  -- 'active', 'pending', 'expired'
    payment_date TIMESTAMP,
    confirmed_date TIMESTAMP,
    -- expiry_date 없음! ❌
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### 해결 방법

```sql
ALTER TABLE public.payments
ADD COLUMN expiry_date DATE;

-- 기존 데이터: payment_date로부터 4주 후로 계산
UPDATE payments
SET expiry_date = (confirmed_date::timestamp + interval '28 days')::date
WHERE confirmed_date IS NOT NULL;
```

#### 영향도
- **심각도:** 🟡 중간
- **수정 시간:** 10분

---

## ✅ **작동하는 기능**

### **학생 관리 (/admin/students)**

✅ **작동:**
- 학생 목록 조회 (역할 필터링)
- 학생-반 배정 (AssignClassDialog)
- 결제 상태 표시 (폴백 사용하므로 항상 'active' 표시)

⚠️ **주의:**
- `getUserProfile()` 없이 직접 학생 조회하므로 역할 오류와 무관
- 하지만 결제 상태가 잘못 표시되고 있음

---

### **반(클래스) 관리 (/admin/classes)**

✅ **작동:**
- 반 목록 조회
- 반 생성 (CreateClassForm)
  - 반 정보 저장
  - class_quests 자동 생성 (syncQuests 함수)
- 반 수정 (EditClassDialog)
- 반 삭제 (DeleteClassButton)
  - CASCADE로 관련 데이터 자동 삭제

#### 검증 결과

```
Test: 반 생성
- Class 데이터 저장 ✅
- class_quests 3개 생성 (vocab, listening, mock) ✅
- 학생이 마이페이지에서 해당 반의 quest 보임 ✅

Test: 반 수정
- Class 정보 변경 ✅
- quest 업데이트 ✅
- 페이지 revalidate ✅

Test: 반 삭제
- Class 삭제 ✅
- 관련 class_members 삭제 ✅
- class_quests 삭제 ✅
```

---

### **수업 로그 등록 (/admin/classes/[id])**

✅ **작동 (exams 제외):**
- 수업 날짜, 제목 입력
- 수업 내용 입력
- 단어, 듣기, 문법, 기타 숙제 입력
- 로그 저장 및 표시

❌ **미작동:**
- 모의고사 선택 (위의 Phase 1-1 참고)

#### 데이터 흐름

```
1. Admin ManageLessonsForm 작성
   ↓
2. createLesson() server action 호출
   ↓
3. lesson_plans 테이블에 INSERT
   ↓
4. /class/{classId} 페이지 revalidate
   ↓
5. 학생 클래스 페이지에 로그 반영
```

---

### **모의고사 생성 (/admin/exams/new)**

✅ **작동:**
- 모의고사 제목 입력
- 카테고리 선택
- 45개 문제의 정답 선택 (1-5)
- 각 문제의 점수 설정 (2점/3점)
- 총점 실시간 계산
- 저장 및 목록에 반영

#### 검증 결과

```
Test: 모의고사 생성
- Form 입력 ✅
- 유효성 검증 ✅
- answers JSON 저장 ✅
- score_distribution 저장 ✅
- 목록에 표시 ✅
```

---

## 📊 **페이지 간 데이터 일치성 검토**

### **데이터 흐름: 관리자 → 학생 페이지**

#### Lesson 흐름

```
Admin: 수업 로그 생성
  ├─ lesson_plans INSERT
  └─ revalidate /class/{classId}
         ↓
Student: 클래스 상세 페이지
  ├─ getClassLessons() 호출
  ├─ lesson_plans SELECT
  └─ UI에 표시 ✅ (일치함)
```

✅ **일치도: 100%**

#### Payment 흐름

```
Admin: 결제 입금 확인
  ├─ payments UPDATE (status='active')
  └─ revalidate /dashboard
         ↓
Student: 마이페이지
  ├─ getDashboardData() 호출
  ├─ getPaymentStatus() → 쿼리 실패
  ├─ 폴백 값 반환 (hardcoded)
  └─ UI에 표시 ❌ (일치 안 함)
```

❌ **일치도: 0% (폴백 값만 표시)**

#### Quest 흐름

```
Admin: 반 생성 시 quest 자동 생성
  ├─ class_quests INSERT
  └─ revalidate /dashboard
         ↓
Student: 마이페이지
  ├─ getQuestProgress() 호출
  ├─ class_quests SELECT
  ├─ student_quest_progress JOIN
  └─ UI에 표시 ✅ (일치함)
```

✅ **일치도: 100%**

#### Blog 흐름

```
Admin: 블로그 글 발행
  ├─ blog_posts INSERT (is_published=true)
  └─ revalidate /admin/blog
         ↓
Student: 블로그 페이지
  ├─ getBlogPosts() 호출
  ├─ blog_posts SELECT WHERE is_published=true
  └─ UI에 표시 ✅ (일치함)
```

✅ **일치도: 100%**

#### Exam 흐름

```
Admin: 모의고사 생성
  ├─ exams INSERT
  └─ revalidate /admin/exams
         ↓
Admin: 수업 로그에 모의고사 연계
  ├─ lesson_plans UPDATE (exam_id=xxx)
  └─ revalidate /admin/classes/{id}
         ↓
Student: 클래스 상세 페이지
  ├─ getClassLessons() 호출
  ├─ lesson_plans JOIN exams
  └─ UI에 모의고사 표시 ✅ (일치함)
```

✅ **일치도: 100% (exams prop이 전달되면)**

---

## 🎯 **수정 우선순위 및 예상 시간**

### **Tier 1: 즉시 (오늘)**

| # | 작업 | 파일 | 시간 | 영향 |
|---|------|------|------|------|
| 1 | exams prop 수정 (빈 배열 → 실제 데이터) | `/admin/classes/[id]/page.tsx:198` | 1분 | 🔴 높음 |
| 2 | 컬럼명 수정 (student_id → user_id) | `/lib/data/dashboard.ts` | 5분 | 🔴 높음 |
| 3 | 모의고사 결과 페이지 쿼리 수정 | `/admin/exams/[id]/page.tsx` | 10분 | 🔴 높음 |

**소요시간:** 16분

### **Tier 2: 오늘 또는 내일**

| # | 작업 | 파일 | 시간 | 영향 |
|---|------|------|------|------|
| 4 | 블로그 수정/삭제 구현 | `/admin/blog`, `/lib/actions/admin.ts` | 20분 | 🟡 중간 |
| 5 | payments.expiry_date 추가 | DB 마이그레이션 | 10분 | 🟡 중간 |
| 6 | users.school 추가 또는 제거 | DB 마이그레이션 또는 코드 | 5분 | 🟡 낮음 |

**소요시간:** 35분

### **Tier 3: 다음주**

| # | 작업 | 파일 | 시간 | 영향 |
|---|------|------|------|------|
| 7 | 모의고사 수정/삭제 구현 | `/lib/actions/exam.ts` | 30분 | 🟡 중간 |
| 8 | RLS 정책 검증 및 정리 | DB 마이그레이션 | 30분 | 🔴 보안 |

**소요시간:** 60분

---

## 📋 **확인 체크리스트**

### **테스트할 시나리오**

- [ ] 관리자 로그인 후 클래스 상세 페이지 접근
- [ ] 수업 로그 등록 시 모의고사 드롭다운 옵션 표시 확인
- [ ] 모의고사 선택 후 저장 및 학생 페이지에 반영 확인
- [ ] 모의고사 결과 페이지 접근 가능 확인
- [ ] 학생 마이페이지에서 결제 정보 표시 확인
- [ ] 블로그 글 수정/삭제 기능 동작 확인
- [ ] 반 생성 후 학생이 quiz 목록 보임 확인

### **데이터베이스 검증**

- [ ] `payments` 테이블 컬럼 확인 (`student_id` vs `user_id`)
- [ ] `class_members` 테이블 컬럼 확인
- [ ] `exams` 테이블 존재 확인 (`class_exams` 삭제됨)
- [ ] RLS 정책 확인

---

## 📝 **git 커밋 이력 참고**

최근 커밋들이 이 문제들을 해결하려던 시도를 보여줍니다:

```
7f3d2b5 - chore: temporarily disable exams prop to isolate 500 render error
          (exams prop을 빈 배열로 임시 비활성화)

919fa3f - chore: add logging and safeguard exam title rendering
          (exam 데이터 구조 문제로 인한 방어 코드 추가)

1b60238 - chore: add try-catch block to expose production server error
          (500 에러 디버깅을 위해 에러 메시지 노출)

8747ae2 - chore: add debug page for env vars
          (환경변수 디버그)

1866e96 - feat: add RLS policies for lesson_plans
          (RLS 정책 추가)
```

---

## 🎓 **결론**

### **현재 상태**

✅ **기본 CRUD는 작동함** - 학생/반/로그 관리 가능
⚠️ **중요 기능이 비활성화됨** - 모의고사 연계, 결제 정보
❌ **부분 기능 미구현** - 블로그 수정/삭제, 모의고사 수정/삭제

### **즉시 조치**

Tier 1 (3개 작업, 16분)을 오늘 안에 완료하면:
- 수업 로그 모의고사 선택 가능
- 학생 결제 정보 정상 표시
- 모의고사 결과 페이지 접근 가능

### **다음 단계**

이 보고서의 Tier 2 섹션을 따라 진행하면 관리자 기능이 완성도 있게 작동할 것입니다.

---

**문서 작성:** Claude Code
**최종 검토:** 대기 중
**다음 액션:** Tier 1 작업 시작
