-- Insert classes for the Landing Page Timetable with FIXED UUIDs
-- Run this in your Supabase SQL Editor to make the Timetable links work!

INSERT INTO public.classes (id, teacher_id, name, schedule, price, is_active, description)
VALUES 
  -- 1. 토요일 09:00 - 12:00: 고3 수능 대비반
  ('11111111-1111-4111-8111-111111111111', (SELECT id FROM auth.users LIMIT 1), '고3 수능 대비반', '토요일 09:00 - 12:00', 600000, true, '개인 맞춤형 수능 대비 (진행중)'),

  -- 2. 일요일 09:00 - 12:00: 중등 심화반
  ('22222222-2222-4222-8222-222222222222', (SELECT id FROM auth.users LIMIT 1), '중등 심화반', '일요일 09:00 - 12:00', 400000, true, '중등 심화 과정 (모집중)'),

  -- 3. 평일(화/목) 14:00 - 17:00: 고2 내신 집중반
  ('33333333-3333-4333-8333-333333333333', (SELECT id FROM auth.users LIMIT 1), '고2 내신 집중반', '화/목 14:00 - 17:00', 500000, true, '내신 집중 관리 (진행중)'),

  -- 4. 일요일 14:00 - 17:00: 고3 실전 모의고사
  ('44444444-4444-4444-8444-444444444444', (SELECT id FROM auth.users LIMIT 1), '고3 실전 모의고사', '일요일 14:00 - 17:00', 400000, true, '실전 감각 훈련 (마감)'),

  -- 5. 평일(화/목) 19:00 - 22:00: 직장인 회화 기초
  ('55555555-5555-4555-8555-555555555555', (SELECT id FROM auth.users LIMIT 1), '직장인 회화 기초', '화/목 19:00 - 22:00', 300000, true, '비즈니스 영어 기초 (모집중)'),
  
  -- 6. 토요일 19:00 - 22:00: 토익 900+ 반
  ('66666666-6666-4666-8666-666666666666', (SELECT id FROM auth.users LIMIT 1), '토익 900+ 반', '토요일 19:00 - 22:00', 350000, true, '고득점 목표 실전반 (진행중)')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  schedule = EXCLUDED.schedule,
  description = EXCLUDED.description;
