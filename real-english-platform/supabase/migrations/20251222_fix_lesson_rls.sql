
-- Enable RLS on lesson_plans if not already
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;

-- Allow teachers/admins to insert into lesson_plans
CREATE POLICY "Lesson plans are insertable by teachers/admins" ON lesson_plans
    FOR INSERT WITH CHECK (
        EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin') )
        OR
        auth.jwt() ->> 'email' = 'dudfkr236@gmail.com'
    );

-- Allow teachers/admins to update lesson_plans
CREATE POLICY "Lesson plans are updatable by teachers/admins" ON lesson_plans
    FOR UPDATE USING (
        EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin') )
        OR
        auth.jwt() ->> 'email' = 'dudfkr236@gmail.com'
    );

-- Allow teachers/admins to delete lesson_plans
CREATE POLICY "Lesson plans are deletable by teachers/admins" ON lesson_plans
    FOR DELETE USING (
        EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('teacher', 'admin') )
        OR
        auth.jwt() ->> 'email' = 'dudfkr236@gmail.com'
    );

-- Allow view access (already presumably exists, but good to be safe)
CREATE POLICY "Lesson plans are viewable by everyone" ON lesson_plans
    FOR SELECT USING (auth.role() = 'authenticated');
