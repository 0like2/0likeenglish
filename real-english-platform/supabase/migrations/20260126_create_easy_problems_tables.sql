-- 쉬운문제 테이블 생성
-- 듣기와 분리하여 별도 교재/정답 시스템 구축

-- 쉬운문제 교재
CREATE TABLE IF NOT EXISTS easy_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    total_rounds INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 쉬운문제 회차 (10문항: 18-20, 25-28, 43-45)
CREATE TABLE IF NOT EXISTS easy_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES easy_books(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    title TEXT,
    answers JSONB NOT NULL,  -- 10개 정답 배열
    question_count INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(book_id, round_number)
);

-- 쉬운문제 제출
CREATE TABLE IF NOT EXISTS easy_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES easy_rounds(id) ON DELETE CASCADE,
    student_answers JSONB NOT NULL,
    score INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    total_count INTEGER NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_easy_rounds_book_id ON easy_rounds(book_id);
CREATE INDEX IF NOT EXISTS idx_easy_submissions_student_id ON easy_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_easy_submissions_round_id ON easy_submissions(round_id);

-- RPC: 교재 회차 수 업데이트
CREATE OR REPLACE FUNCTION update_easy_book_round_count(book_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE easy_books
    SET total_rounds = (
        SELECT COUNT(*) FROM easy_rounds WHERE book_id = book_uuid AND is_active = true
    )
    WHERE id = book_uuid;
END;
$$ LANGUAGE plpgsql;

-- RLS 정책
ALTER TABLE easy_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE easy_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE easy_submissions ENABLE ROW LEVEL SECURITY;

-- 교재/회차는 모든 인증된 사용자가 읽기 가능
CREATE POLICY "Easy books are viewable by authenticated users" ON easy_books
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Easy rounds are viewable by authenticated users" ON easy_rounds
    FOR SELECT TO authenticated USING (true);

-- 제출은 본인만 읽기/쓰기 가능
CREATE POLICY "Users can view their own easy submissions" ON easy_submissions
    FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own easy submissions" ON easy_submissions
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
