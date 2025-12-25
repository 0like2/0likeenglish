-- 1. Enable RLS on users table (Critical)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Policy: Teachers can view all profiles (using Metadata to prevent recursion)
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public.users;
CREATE POLICY "Teachers can view all profiles"
ON public.users FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'teacher'
);


-- Policy: Users can update their own profile (optional but good)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);


-- 2. Enable RLS on qna_posts (Security Warning)
ALTER TABLE public.qna_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all posts (Customize if needed)
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.qna_posts;
CREATE POLICY "Authenticated users can view posts"
ON public.qna_posts FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert posts (using student_id)
-- Confirmed via screenshot: column is 'student_id'
DROP POLICY IF EXISTS "Users can insert posts" ON public.qna_posts;
CREATE POLICY "Users can insert posts"
ON public.qna_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Policy: Users can update/delete their own posts
DROP POLICY IF EXISTS "Users can update own posts" ON public.qna_posts;
CREATE POLICY "Users can update own posts"
ON public.qna_posts FOR UPDATE
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.qna_posts;
CREATE POLICY "Users can delete own posts"
ON public.qna_posts FOR DELETE
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can view all qna posts" ON public.qna_posts;
CREATE POLICY "Teachers can view all qna posts"
ON public.qna_posts FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'teacher'
);


-- 3. Payments Table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view all payments" ON public.payments;
CREATE POLICY "Teachers can view all payments" ON public.payments FOR SELECT USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'teacher'
);


-- 4. Class Members
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own classes" ON public.class_members;
CREATE POLICY "Users can view own classes" ON public.class_members FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view all class members" ON public.class_members;
CREATE POLICY "Teachers can view all class members" ON public.class_members FOR SELECT USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'teacher'
);


-- 5. Student Quest Progress
ALTER TABLE public.student_quest_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quest progress" ON public.student_quest_progress;
CREATE POLICY "Users can view own quest progress"
ON public.student_quest_progress FOR SELECT
USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own quest progress" ON public.student_quest_progress;
CREATE POLICY "Users can update own quest progress"
ON public.student_quest_progress FOR UPDATE
USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own quest progress" ON public.student_quest_progress;
CREATE POLICY "Users can insert own quest progress"
ON public.student_quest_progress FOR INSERT
WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view all quest progress" ON public.student_quest_progress;
CREATE POLICY "Teachers can view all quest progress" ON public.student_quest_progress FOR SELECT USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'teacher'
);


-- 6. Classes Table (Admin Management)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active classes" ON public.classes;
CREATE POLICY "Public can view active classes" ON public.classes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers can manage classes" ON public.classes;
CREATE POLICY "Teachers can manage classes" ON public.classes FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'teacher'
);
