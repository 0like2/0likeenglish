-- ============================================
-- 듣기 자료 시스템 테이블 생성
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. 듣기 책/교재 테이블
CREATE TABLE IF NOT EXISTS listening_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,           -- 책 이름 (예: "2024 수능특강", "EBS 모의고사")
    description TEXT,             -- 설명
    total_rounds INTEGER DEFAULT 0, -- 총 회차 수
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. 듣기 회차별 정답 테이블
CREATE TABLE IF NOT EXISTS listening_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES listening_books(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL, -- 회차 번호 (1, 2, 3...)
    title TEXT,                    -- 회차 제목 (선택)
    answers JSONB NOT NULL,        -- 정답 배열 [3,1,2,5,4...] (27문항 기준)
    question_count INTEGER DEFAULT 27,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(book_id, round_number)
);

-- 3. 듣기 제출/채점 결과 테이블
CREATE TABLE IF NOT EXISTS listening_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES listening_rounds(id) ON DELETE CASCADE,
    student_answers JSONB NOT NULL, -- 학생 답안
    score INTEGER NOT NULL,         -- 점수 (0-100)
    correct_count INTEGER NOT NULL, -- 맞은 개수
    total_count INTEGER NOT NULL,   -- 총 문항 수
    details JSONB,                  -- 상세 결과
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_listening_rounds_book ON listening_rounds(book_id);
CREATE INDEX IF NOT EXISTS idx_listening_submissions_student ON listening_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_listening_submissions_round ON listening_submissions(round_id);

-- 5. RLS 정책
ALTER TABLE listening_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_submissions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 읽기 허용
CREATE POLICY "listening_books_read" ON listening_books FOR SELECT USING (true);
CREATE POLICY "listening_rounds_read" ON listening_rounds FOR SELECT USING (true);

-- 학생 자신의 제출 읽기/쓰기
CREATE POLICY "listening_submissions_read" ON listening_submissions
    FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "listening_submissions_insert" ON listening_submissions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- 관리자 전체 권한 (Service Role 사용)

-- 6. 샘플 데이터
INSERT INTO listening_books (name, description, total_rounds) VALUES
    ('2024 수능특강 영어듣기', '2024학년도 수능 대비 EBS 수능특강', 20),
    ('2024 수능완성 영어듣기', '2024학년도 수능 대비 EBS 수능완성', 10),
    ('고3 모의고사 듣기', '전국연합 모의고사 듣기 평가', 12)
ON CONFLICT DO NOTHING;

-- 7. 스키마 리로드
NOTIFY pgrst, 'reload schema';

-- 확인
SELECT 'listening_books' as table_name, COUNT(*) as count FROM listening_books
UNION ALL
SELECT 'listening_rounds', COUNT(*) FROM listening_rounds
UNION ALL
SELECT 'listening_submissions', COUNT(*) FROM listening_submissions;
