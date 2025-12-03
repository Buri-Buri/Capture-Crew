-- Run this in your Supabase SQL Editor

-- Drop the table if it was partially created (unlikely if it errored, but good practice)
DROP TABLE IF EXISTS notifications;

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'message', 'booking_update', 'booking_request'
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id BIGINT, -- ID of the message or booking (both are BigInt/Int in existing schema)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
