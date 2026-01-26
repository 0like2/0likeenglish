-- 사용자 승인 필드 추가
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 기존 사용자는 모두 승인 처리
UPDATE public.users SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

-- 선생님(teacher)은 자동 승인
UPDATE public.users SET is_approved = true WHERE role = 'teacher';

-- 인덱스 추가 (승인 대기 목록 조회용)
CREATE INDEX IF NOT EXISTS idx_users_approval ON public.users(is_approved, role);
