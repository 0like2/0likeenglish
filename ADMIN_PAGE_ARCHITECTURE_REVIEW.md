# 📋 관리자 페이지 설계 및 구조 검토 보고서

**작성일:** 2025-12-22
**상태:** 검토 완료 - 즉시 개선 필요
**우선순위:** 🔴 High (500 에러 원인 포함)

---

## 요약

관리자 페이지가 설계 문서 없이 구현되어, 다음과 같은 **구조적 문제**들이 발견되었습니다:

1. **역할(Role) 판별 로직 불일치** - 3가지 다른 방식으로 작동
2. **보안 문제** - 미들웨어에서 역할 기반 보호 없음
3. **마이페이지 연동 실패** - 관리자 버튼 조건 제대로 작동 안 함
4. **데이터 흐름 에러** - `user.id` 미포함으로 인한 500 에러 가능성 높음
5. **기획 문서와 구현 불일치** - 정의되지 않은 페이지 존재

---

## 🔴 핵심 문제점 (즉시 해결 필요)

### **1. 역할(Role) 판별 로직의 심각한 불일치** ⚠️

현재 세 곳에서 **완전히 다르게** 작동하고 있습니다:

#### 로그인 페이지 (`/auth/login/page.tsx:29-34`)
```typescript
const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        if (email.toLowerCase().includes("admin")) {
            router.push("/admin");     // ← 클라이언트 사이드 판별
        } else {
            router.push("/dashboard");
        }
    }, 800);
};
```
**문제:**
- 클라이언트에서만 작동
- 서버의 실제 역할 데이터와 동기화 안 됨
- 학생이 이메일을 "admin"으로 입력하면 `/admin` 접근 가능!

#### 마이페이지 (`/dashboard/page.tsx:37-42`)
```typescript
{(user?.role === 'teacher' || user?.role === 'admin') && (
    <Button asChild variant="outline">
        <Link href="/admin">🎓 관리자 대시보드</Link>
    </Button>
)}
```
**문제:**
- `user?.role`이 `undefined`일 가능성 높음
- `getUserProfile()`의 역할 반환과 불일치

#### getUserProfile() (`/lib/data/dashboard.ts:36-40`)
```typescript
return profile || {
    name: user.email?.split('@')[0],
    email: user.email,
    role: user.email === 'dudfkr236@gmail.com' ? 'teacher' : 'student'
    // ↑ 하드코딩, 확장성 없음
};
```
**문제:**
- 특정 이메일(dudfkr236@gmail.com)만 teacher
- 새 강사 추가 불가능
- `user.id` 미포함 (아래 참조)

#### 미들웨어 (`/lib/supabase/middleware.ts:48-49`)
```typescript
if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
}
// ↑ user 존재 여부만 확인, 역할 미확인!
```
**문제:**
- 역할 기반 보호 전혀 없음
- 학생도 `/admin` 진입 가능

#### 비교 표

| 위치 | 판별 방식 | 신뢰도 |
|------|---------|--------|
| 로그인 페이지 | 이메일 "admin" 포함 | ⭐ 낮음 (클라이언트) |
| 마이페이지 | `user?.role === 'teacher'` | ⭐ 낮음 (undefined 가능) |
| getUserProfile() | `user.email === 'dudfkr236@gmail.com'` | ⭐⭐ 중간 (하드코딩) |
| 미들웨어 | user 존재 여부만 | ⭐ 낮음 (역할 미확인) |

---

### **2. 보안 문제: 역할 기반 접근 제어(RBAC) 미흡**

#### Admin 페이지 접근
```
현재 흐름:
로그인 (클라이언트)
  → "admin" 포함?
    → YES: /admin 라우팅
    → NO: /dashboard 라우팅
  → 미들웨어: user 있으면 통과 ✓
  → /admin 페이지 진입 (학생도 가능!)
```

#### 데이터 조작은 보호됨
```typescript
// lib/actions/admin.ts - getAdminClient() 사용
// Supabase admin client로 RLS 우회
// ✓ 데이터 수정은 안전
// ✗ 하지만 페이지 진입은 막지 않음
```

**결과:**
- 학생이 `/admin` 페이지 이미지/텍스트 볼 수 있음
- 버튼 클릭 시 server action 실패하지만, UX 손상

---

### **3. 마이페이지 + 관리자 대시보드 연동 실패**

#### 현재 로그인 흐름
```
로그인 페이지 (/auth/login)
  ↓
이메일 "admin" 포함?
  → YES: /admin으로 즉시 리다이렉트
  → NO: /dashboard로 즉시 리다이렉트
```

#### 마이페이지의 관리자 버튼
```tsx
{(user?.role === 'teacher' || user?.role === 'admin') && (
    <Link href="/admin">관리자 대시보드</Link>
)}
```

**문제:**
1. 관리자는 로그인 후 `/admin`으로 바로 가므로, 마이페이지(`/dashboard`)에 올 수 없음
2. 마이페이지의 버튼은 **절대 표시되지 않음**
3. 역할 확인 코드가 무의미함

**결과:**
- 기획 문서의 의도(마이페이지에서 관리자 패널 접근)가 작동 안 함
- 관리자는 마이페이지를 볼 방법이 없음

---

### **4. 데이터 흐름 에러: 500 Render 에러의 원인** 🔥

#### getDashboardData() 함수
```typescript
// lib/data/dashboard.ts:138-162
export async function getDashboardData() {
    const user = await getUserProfile();
    if (!user) {
        redirect('/auth/login');
    }

    // user.id가 필요한데...
    const [payment, classInfo] = await Promise.all([
        getPaymentStatus(user.id),     // ← user.id 사용
        getClassInfo(user.id)          // ← user.id 사용
    ]);
}
```

#### getUserProfile() 반환
```typescript
return profile || {
    name: user.email?.split('@')[0],
    email: user.email,
    // ❌ user.id가 없다!
    role: user.email === 'dudfkr236@gmail.com' ? 'teacher' : 'student'
};
```

#### 결과
```
getDashboardData()
  → user = getUserProfile()
  → user.id = undefined ❌
  → getPaymentStatus(undefined)
    → .eq('student_id', undefined)
    → 쿼리 실패 또는 잘못된 데이터 반환
  → 렌더링 에러 (500)
```

**이것이 커밋 메시지의 "500 render error"의 원인으로 추정됩니다.**

---

### **5. 기획 문서 vs 실제 구현 불일치**

#### 기획 문서 (PRD.md:592-690)
```
관리자 메뉴:
├─ 대시보드          /admin ✓
├─ 학생 관리         /admin/students ✓
├─ 반(Class) 관리    /admin/classes ✓
├─ 수업 일지         /admin/lessons ✗
├─ 숙제 평가         /admin/homework ✗
├─ 모의고사 관리     /admin/mock-exams ✗
├─ 듣기 관리         /admin/listening ✗
├─ 정보글(블로그)    /admin/blog ✓
└─ 설정             /admin/settings ✗
```

#### 현재 구현 (Sidebar.tsx:19-27)
```typescript
const NAV_ITEMS = [
    { label: "대시보드", href: "/admin", icon: LayoutDashboard },           ✓
    { label: "학생 관리", href: "/admin/students", icon: Users },           ✓
    { label: "수업/반 관리", href: "/admin/classes", icon: BookOpen },      ✓
    { label: "모의고사 관리", href: "/admin/exams", icon: ClipboardList }, ⚠️ (기획 없음)
    { label: "듣기 관리", href: "/admin/listening", icon: Headphones },     ⚠️ (기획 없음)
    { label: "블로그/공지", href: "/admin/blog", icon: PenTool },          ✓
    { label: "설정", href: "/admin/settings", icon: Settings },             ⚠️ (기획 없음)
];
```

**문제:**
- `/admin/exams` - 기획에 정의되지 않음
- `/admin/listening` - 기획에 정의되지 않음
- `/admin/settings` - 기획에 정의되지 않음
- 기획의 `/admin/lessons`, `/admin/homework`, `/admin/mock-exams`는 구현 안 됨

**결과:** 기획과 구현이 완전히 달라서, 유지보수 어려움

---

## 🟡 추가 문제점

### **6. Admin Action에 역할 확인 없음**

```typescript
// lib/actions/admin.ts - seedBlogPosts(), createClass(), 등등
export async function createClass(name, schedule, price) {
    const supabase = getAdminClient();
    // ↑ admin client 사용하므로 RLS 우회
    // ✗ 하지만 호출자의 역할을 확인하지 않음!

    // 학생이 이 함수를 호출할 수 있는가?
    // YES - 클라이언트에서 server action 호출 가능
}
```

**해결책:** 모든 admin action의 처음에서 역할 확인
```typescript
export async function createClass(name, schedule, price) {
    const user = await getUserProfile();
    if (user?.role !== 'teacher') {
        throw new Error('Unauthorized: Only teachers can create classes');
    }
    // ...
}
```

---

## 🟢 올바른 부분

✅ **Admin Layout 구조** - Sidebar + Main Content (기획과 일치)
✅ **주요 페이지들** - /admin/students, /admin/classes, /admin/blog 존재
✅ **CRUD 기능** - Create/Update/Delete 폼 컴포넌트 구현됨
✅ **Supabase 통합** - Admin client, RLS 기본 설정 있음
✅ **미들웨어 기본 보호** - 로그인 필수 확인 있음

---

## 📌 즉시 수정 체크리스트

### Phase 1: 긴급 (500 에러 해결) - 우선순위 🔴 HIGH

- [ ] **`getUserProfile()` 수정**
  - [ ] `user.id` 포함하여 반환
  - [ ] 반환 객체 타입 명확히 하기
  ```typescript
  return {
      id: user.id,           // ← 추가
      name: user.email?.split('@')[0],
      email: user.email,
      role: 'student'
  };
  ```

- [ ] **테스트**: 관리자 로그인 후 마이페이지/대시보드 로드 성공 확인

- [ ] **500 에러 재현** 및 로그 확인
  ```
  getDashboardData() → getPaymentStatus(user.id)
  → 쿼리 결과 확인
  ```

### Phase 2: 역할 관리 개선 - 우선순위 🟡 MEDIUM

- [ ] **Supabase users 테이블에 role 컬럼 추가**
  ```sql
  ALTER TABLE public.users
  ADD COLUMN role TEXT DEFAULT 'student'
  CHECK (role IN ('student', 'teacher', 'admin'));
  ```

- [ ] **역할 판별 통일**
  - 로그인: Supabase users 테이블에서 role 확인
  - 마이페이지: getUserProfile()의 role 사용
  - 미들웨어: users 테이블 role 확인

- [ ] **로그인 흐름 재설계**
  ```
  OAuth 로그인
    → Supabase auth 완료
    → users 테이블의 role 확인
    → role === 'teacher' → /admin
    → else → /dashboard
  ```

- [ ] **미들웨어 업그레이드** - 역할 기반 보호
  ```typescript
  if (request.nextUrl.pathname.startsWith('/admin')) {
      const user = await getUserProfile();
      if (user?.role !== 'teacher') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
  }
  ```

### Phase 3: 구조 정리 - 우선순위 🟡 MEDIUM

- [ ] **기획 문서 업데이트**
  - [ ] `/admin/exams`, `/admin/listening`, `/admin/settings` 추가하거나
  - [ ] 실제 구현에서 제거 (기획과 맞추기)

- [ ] **마이페이지 관리자 버튼 재검토**
  - [ ] 관리자도 마이페이지 접근 가능하도록 설계 변경 또는
  - [ ] 버튼 제거 및 기획 문서에서 삭제

- [ ] **Admin 페이지 기획 문서화**
  - [ ] 누락된 pages의 목적/요구사항 정의
  - [ ] 또는 불필요한 항목 제거

### Phase 4: 보안 강화 - 우선순위 🟡 MEDIUM

- [ ] **Admin Actions에 권한 확인 추가**
  ```typescript
  // admin.ts의 모든 함수에서
  async function createClass(...) {
      const user = await getUserProfile();
      if (user?.role !== 'teacher') {
          throw new Error('Unauthorized');
      }
      // ...
  }
  ```

- [ ] **RLS 정책 검증**
  - [ ] `lesson_plans` RLS 확인
  - [ ] `class_members` RLS 확인
  - [ ] `homework_submissions` RLS 확인

---

## 📊 영향도 분석

| 문제 | 심각도 | 영향 범위 | 해결 난이도 |
|------|--------|---------|-----------|
| 500 에러 (user.id 미포함) | 🔴 높음 | 마이페이지/관리자 페이지 | ⭐ 낮음 (5분) |
| 역할 판별 불일치 | 🔴 높음 | 전체 인증/인가 | ⭐⭐ 중간 (30분) |
| 미들웨어 보호 부족 | 🔴 높음 | 관리자 페이지 접근 | ⭐ 낮음 (15분) |
| 마이페이지 연동 실패 | 🟡 중간 | UX 경험 | ⭐ 낮음 (10분) |
| 기획과 구현 불일치 | 🟡 중간 | 유지보수성 | ⭐⭐ 중간 (1시간) |
| Admin Actions 미보호 | 🟡 중간 | 보안 | ⭐⭐ 중간 (1시간) |

---

## 🎯 권장 수정 순서

```
1️⃣ getUserProfile() 수정 (user.id 추가) - 5분
   ↓
2️⃣ 테스트: 500 에러 해결 확인 - 5분
   ↓
3️⃣ 미들웨어 역할 확인 추가 - 15분
   ↓
4️⃣ 로그인 흐름 통일 - 30분
   ↓
5️⃣ Admin Actions 권한 확인 - 1시간
   ↓
6️⃣ 기획/구현 문서 동기화 - 30분
```

**예상 총 소요 시간:** 2~3시간

---

## 📝 참고: 관련 파일 목록

**설정 파일:**
- `src/app/layout.tsx` - Root Layout (Navbar 포함)
- `src/middleware.ts` - 전역 미들웨어
- `src/lib/supabase/middleware.ts` - Supabase 세션 관리

**로그인 & 인증:**
- `src/app/auth/login/page.tsx` - 로그인 페이지 (클라이언트)
- `src/lib/data/dashboard.ts` - getUserProfile(), getDashboardData()

**마이페이지:**
- `src/app/dashboard/page.tsx` - 학생 마이페이지
- `src/app/settings/page.tsx` - 사용자 설정

**관리자 페이지:**
- `src/app/admin/layout.tsx` - Admin Layout (Sidebar)
- `src/app/admin/page.tsx` - Admin Dashboard
- `src/app/admin/students/page.tsx` - 학생 관리
- `src/app/admin/classes/page.tsx` - 반 관리
- `src/app/admin/blog/page.tsx` - 블로그 관리
- `src/app/admin/exams/page.tsx` - 모의고사 관리
- `src/app/admin/listening/page.tsx` - 듣기 관리
- `src/app/admin/settings/page.tsx` - 관리자 설정

**Admin 컴포넌트:**
- `src/components/admin/Sidebar.tsx` - 네비게이션
- `src/components/admin/*.tsx` - 폼/다이얼로그 컴포넌트

**Admin 데이터:**
- `src/lib/actions/admin.ts` - Admin server actions
- `src/lib/data/admin.ts` - Admin 데이터 조회

---

## 📌 결론

현재 관리자 페이지는 **프로토타입 수준**으로, 기획 문서 없이 급하게 구현된 상태입니다.

**긴급 개선 필요:**
1. ✅ 500 에러 해결 (user.id 추가)
2. ✅ 역할 판별 로직 통일
3. ✅ 미들웨어 보안 강화

이 세 가지를 먼저 해결하면, 기본적인 기능은 안정적으로 작동할 것입니다.

---

**문서 작성:** Claude Code
**최종 검토:** 대기 중
**추천 검토자:** 개발 팀리드
