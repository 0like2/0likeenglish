-- 1. Drop existing class_exams (Assuming empty or can be discarded as per plan)
-- If preserving data is needed, we would RENAME and ALTER, but plan implies a clean break for "Global" structure.
DROP TABLE IF EXISTS class_exams CASCADE;
DROP TABLE IF EXISTS exam_submissions CASCADE; -- Need to recreate to reference new exams table

-- 2. Create Global Exams Table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT, -- e.g., 'High 1', 'TOEIC'
    answers JSONB NOT NULL, -- Array of correct answers [1, 2, 3...]
    score_distribution JSONB DEFAULT '[]'::jsonb, -- Array of 3-point question indices
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Recreate Exam Submissions Table
CREATE TABLE exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE, -- References new exams table
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_answers JSONB NOT NULL, -- Array of student's answers
    score INTEGER NOT NULL DEFAULT 0,
    details JSONB, -- Detailed results (correct/incorrect per question)
    is_graded BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Update Lesson Plans to link to Exams
-- Check if column exists first to be safe (plpgsql block) or just add it if we know it's missing.
-- Simple ALTER:
ALTER TABLE lesson_plans 
ADD COLUMN exam_id UUID REFERENCES exams(id) ON DELETE SET NULL;

-- 5. RLS Policies (Security)
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

-- Exams: Readable by everyone (authenticated), Modifiable by Admins only
CREATE POLICY "Exams are viewable by everyone" ON exams
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Exams are insertable by teachers/admins" ON exams
    FOR INSERT WITH CHECK (
        EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin') )
        OR
        auth.jwt() ->> 'email' = 'dudfkr236@gmail.com'
    );

CREATE POLICY "Exams are updatable by teachers/admins" ON exams
    FOR UPDATE USING (
        EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin') )
        OR
        auth.jwt() ->> 'email' = 'dudfkr236@gmail.com'
    );

CREATE POLICY "Exams are deletable by teachers/admins" ON exams
    FOR DELETE USING (
        EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin') )
        OR
        auth.jwt() ->> 'email' = 'dudfkr236@gmail.com'
    );

-- Submissions: Students see own, Teachers see all
CREATE POLICY "Users can insert their own submissions" ON exam_submissions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view their own submissions" ON exam_submissions
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all submissions" ON exam_submissions
    FOR SELECT USING (
        EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin') )
        OR
        auth.jwt() ->> 'email' = 'dudfkr236@gmail.com'
    );
