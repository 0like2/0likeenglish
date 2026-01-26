-- ============================================
-- 데일리 숙제 시스템: homework_date 컬럼 추가
-- 하루 1회 제출 제한을 위한 스키마 변경
-- ============================================

-- 1. listening_submissions에 homework_date 컬럼 추가
ALTER TABLE listening_submissions
ADD COLUMN IF NOT EXISTS homework_date DATE;

-- 2. easy_submissions에 homework_date 컬럼 추가
ALTER TABLE easy_submissions
ADD COLUMN IF NOT EXISTS homework_date DATE;

-- 3. student_quest_progress에 homework_date 컬럼 추가
ALTER TABLE student_quest_progress
ADD COLUMN IF NOT EXISTS homework_date DATE;

-- 4. 기존 데이터에 대해 homework_date를 created_at 기준으로 채우기
-- (선택사항 - 기존 데이터가 있는 경우)
UPDATE listening_submissions
SET homework_date = DATE(created_at AT TIME ZONE 'Asia/Seoul')
WHERE homework_date IS NULL;

UPDATE easy_submissions
SET homework_date = DATE(created_at AT TIME ZONE 'Asia/Seoul')
WHERE homework_date IS NULL;

UPDATE student_quest_progress
SET homework_date = DATE(last_submitted_at AT TIME ZONE 'Asia/Seoul')
WHERE homework_date IS NULL AND last_submitted_at IS NOT NULL;

-- 5. 하루 1회 제한용 유니크 인덱스 생성
-- 같은 학생이 같은 날짜에 중복 제출 방지

-- 듣기 - 학생당 하루 1회
CREATE UNIQUE INDEX IF NOT EXISTS idx_listening_daily
ON listening_submissions(student_id, homework_date)
WHERE homework_date IS NOT NULL;

-- 쉬운문제 - 학생당 하루 1회
CREATE UNIQUE INDEX IF NOT EXISTS idx_easy_daily
ON easy_submissions(student_id, homework_date)
WHERE homework_date IS NOT NULL;

-- 영단어(퀘스트) - 학생당 퀘스트별 하루 1회
-- 주의: 기존 unique constraint (student_id, quest_id)와 충돌할 수 있음
-- 기존 로직을 유지하면서 homework_date로 일별 추적만 함
-- upsert 로직이 (student_id, quest_id)를 기준으로 하므로 별도 인덱스 불필요

-- 6. 조회 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_listening_student_date
ON listening_submissions(student_id, homework_date);

CREATE INDEX IF NOT EXISTS idx_easy_student_date
ON easy_submissions(student_id, homework_date);

CREATE INDEX IF NOT EXISTS idx_quest_progress_student_date
ON student_quest_progress(student_id, homework_date);

-- 7. 코멘트 추가
COMMENT ON COLUMN listening_submissions.homework_date IS '숙제 날짜 (KST 새벽 3시 기준)';
COMMENT ON COLUMN easy_submissions.homework_date IS '숙제 날짜 (KST 새벽 3시 기준)';
COMMENT ON COLUMN student_quest_progress.homework_date IS '숙제 날짜 (KST 새벽 3시 기준)';
