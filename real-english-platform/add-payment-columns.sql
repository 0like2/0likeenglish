-- Add missing columns to payments table for subscription management
-- Run this in Supabase SQL Editor

-- Add class_count column (number of lessons in the subscription)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS class_count integer DEFAULT 4;

-- Add expiry_date column (subscription expiry date)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS expiry_date timestamp with time zone;

-- Add updated_at column for tracking updates
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

-- Update existing records to have a default class_count if null
UPDATE payments SET class_count = 4 WHERE class_count IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'payments';
