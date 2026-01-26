-- 알림 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 알림 수신자
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- 알림 발신자 (시스템 알림의 경우 NULL)
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_name TEXT,

    -- 알림 타입
    type TEXT NOT NULL, -- 'homework_submit', 'feedback', 'payment_update', 'class_assign', 'announcement'

    -- 알림 내용
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- 관련 리소스 링크 (클릭 시 이동할 경로)
    link TEXT,

    -- 추가 메타데이터
    metadata JSONB DEFAULT '{}',

    -- 상태 관리
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 알림만 조회 가능
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (recipient_id = auth.uid());

-- RLS 정책: 사용자는 자신의 알림을 읽음 처리 가능
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (recipient_id = auth.uid());

-- RLS 정책: 서비스 롤은 모든 알림 생성 가능
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- RLS 정책: 서비스 롤은 모든 알림 삭제 가능
DROP POLICY IF EXISTS "Service role can delete notifications" ON notifications;
CREATE POLICY "Service role can delete notifications"
    ON notifications FOR DELETE
    USING (true);
