-- Enable pgcrypto for password hashing if not enabled
create extension if not exists pgcrypto;

-- 1. Insert Classes
insert into public.classes (name, day_of_week, start_time, end_time, price, is_active)
values 
  ('고1/2 내신 집중반 (목)', '목', '18:00', '22:00', 400000, true),
  ('고3 수능 대비 과외 (토)', '토', '13:00', '17:00', 600000, true)
on conflict (name) do nothing;

-- 2. Insert Users (Auth + Public)
do $$
declare
  u_id uuid;
  email_val text;
  name_val text;
begin
  -- User 1: Noh Do-mi
  email_val := 'nohdomi@example.com';
  name_val := '노도미';
  
  if not exists (select 1 from auth.users where email = email_val) then
    u_id := gen_random_uuid();
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    values (u_id, email_val, crypt('password123', gen_salt('bf')), now(), jsonb_build_object('name', name_val, 'role', 'student'));
    
    insert into public.users (id, email, name, role)
    values (u_id, email_val, name_val, 'student')
    on conflict (id) do nothing;
  end if;

  -- User 2: Jeon Young-seo
  email_val := 'jeonyoungseo@example.com';
  name_val := '전영서';
  
  if not exists (select 1 from auth.users where email = email_val) then
    u_id := gen_random_uuid();
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    values (u_id, email_val, crypt('password123', gen_salt('bf')), now(), jsonb_build_object('name', name_val, 'role', 'student'));
    
    insert into public.users (id, email, name, role)
    values (u_id, email_val, name_val, 'student')
    on conflict (id) do nothing;
  end if;

  -- User 3: Special 100 Days
  email_val := 'despair100@example.com';
  name_val := '특집100일의절망';
  
  if not exists (select 1 from auth.users where email = email_val) then
    u_id := gen_random_uuid();
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    values (u_id, email_val, crypt('password123', gen_salt('bf')), now(), jsonb_build_object('name', name_val, 'role', 'student'));
    
    insert into public.users (id, email, name, role)
    values (u_id, email_val, name_val, 'student')
    on conflict (id) do nothing;
  end if;

  -- User 4: Lee Young-lag
  email_val := 'iyeonglag@example.com';
  name_val := '이영락';
  
  if not exists (select 1 from auth.users where email = email_val) then
    u_id := gen_random_uuid();
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    values (u_id, email_val, crypt('password123', gen_salt('bf')), now(), jsonb_build_object('name', name_val, 'role', 'student'));
    
    insert into public.users (id, email, name, role)
    values (u_id, email_val, name_val, 'student')
    on conflict (id) do nothing;
  end if;

end $$;


-- 3. Enrollments (Class Members)
-- Use nested select to find IDs
insert into public.class_members (user_id, class_id, status, joined_at)
select u.id, c.id, 'active', now()
from public.users u, public.classes c
where u.name = '노도미' and c.name = '고1/2 내신 집중반 (목)'
on conflict (user_id, class_id) do nothing;

insert into public.class_members (user_id, class_id, status, joined_at)
select u.id, c.id, 'active', now()
from public.users u, public.classes c
where u.name = '전영서' and c.name = '고3 수능 대비 과외 (토)'
on conflict (user_id, class_id) do nothing;


-- 4. Payments (Expired)
insert into public.payments (user_id, amount, status, payment_date, method)
select id, 0, 'expired', '2025-11-18', 'card'
from public.users
where name in ('노도미', '전영서', '특집100일의절망', '이영락')
and not exists (select 1 from public.payments where user_id = public.users.id);
