-- Create activity_logs table for tracking student and admin activities
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT,
    action_type TEXT NOT NULL, -- 'submit', 'exam', 'payment', 'feedback', 'listening', 'class_assign'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Teachers can see all logs
CREATE POLICY "Teachers can view all activity logs"
    ON activity_logs FOR SELECT
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
    );

-- Students can see their own logs
CREATE POLICY "Students can view own activity logs"
    ON activity_logs FOR SELECT
    USING (user_id = auth.uid());

-- Allow insert from service role (server actions)
CREATE POLICY "Service role can insert logs"
    ON activity_logs FOR INSERT
    WITH CHECK (true);
