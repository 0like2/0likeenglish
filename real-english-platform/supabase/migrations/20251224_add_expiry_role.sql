-- Add expiry_date to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add role and school to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS school TEXT;

-- Update existing payment expiry dates (default 4 weeks from created_at)
UPDATE payments
SET expiry_date = (created_at::timestamp + interval '28 days')::date
WHERE created_at IS NOT NULL AND expiry_date IS NULL;

-- Update role for the known teacher (optional but helpful)
UPDATE public.users
SET role = 'teacher'
WHERE email = 'dudfkr236@gmail.com';
