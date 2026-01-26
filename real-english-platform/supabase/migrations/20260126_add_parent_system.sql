-- 학부모 계정 시스템 마이그레이션
-- 1. 학생용 링크 코드 컬럼 추가
-- 2. 학부모-학생 연결 테이블 생성

-- 1. 학생용 링크 코드 컬럼 추가
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS link_code TEXT UNIQUE;

-- 2. 학부모-학생 연결 테이블
CREATE TABLE IF NOT EXISTS parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(parent_id, student_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON parent_student_links(student_id);

-- RLS 정책
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

-- 학부모는 자신의 연결 정보 조회 가능
CREATE POLICY "Parents can view own links"
ON parent_student_links FOR SELECT
USING (parent_id = auth.uid());

-- 학부모는 연결 추가 가능
CREATE POLICY "Parents can insert links"
ON parent_student_links FOR INSERT
WITH CHECK (parent_id = auth.uid());

-- 학부모는 자신의 연결 삭제 가능
CREATE POLICY "Parents can delete own links"
ON parent_student_links FOR DELETE
USING (parent_id = auth.uid());

-- 선생님은 모든 연결 조회 가능
CREATE POLICY "Teachers can view all links"
ON parent_student_links FOR SELECT
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'teacher'
);

-- 학생 수만 카운트하는 함수 (학부모 제외)
CREATE OR REPLACE FUNCTION get_class_student_count(class_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM class_members cm
    JOIN users u ON cm.student_id = u.id
    WHERE cm.class_id = class_uuid
    AND cm.status = 'active'
    AND (u.role = 'student' OR u.role IS NULL);
$$ LANGUAGE SQL STABLE;
