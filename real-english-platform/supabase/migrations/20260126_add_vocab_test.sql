-- 단어 테스트 통과 여부 컬럼 추가
-- NULL: 미체크, true: 통과, false: 불통과

ALTER TABLE student_lesson_checks
ADD COLUMN IF NOT EXISTS vocab_test_passed BOOLEAN DEFAULT NULL;

-- 인덱스 추가 (선생님이 미체크 학생 조회 시 유용)
CREATE INDEX IF NOT EXISTS idx_student_lesson_checks_vocab_test
ON student_lesson_checks(lesson_id, vocab_test_passed);

COMMENT ON COLUMN student_lesson_checks.vocab_test_passed IS '단어 테스트 통과 여부: NULL=미체크, true=통과, false=불통과';
