-- Create class_exams table
CREATE TABLE IF NOT EXISTS public.class_exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    answers JSONB NOT NULL, -- Array of 45 integers [1, 4, 2, ...]
    score_distribution JSONB DEFAULT '[]'::JSONB, -- Array of indices for 3-point questions e.g. [31, 32, 33]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Create exam_submissions table
CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES public.class_exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    student_answers JSONB NOT NULL, -- Array of 45 integers
    score INTEGER NOT NULL,
    is_graded BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Basic)
ALTER TABLE public.class_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (Refine later for class-specific)
CREATE POLICY "Allow read access for authenticated users" ON public.class_exams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for teachers/admins" ON public.class_exams FOR INSERT WITH CHECK (auth.role() = 'authenticated'); -- Simplified, ideally check user role

-- Submissions policies
CREATE POLICY "Users can see own submissions" ON public.exam_submissions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers can see all submissions" ON public.exam_submissions FOR SELECT USING (auth.role() = 'authenticated'); -- Simplified
CREATE POLICY "Users can insert own submissions" ON public.exam_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
