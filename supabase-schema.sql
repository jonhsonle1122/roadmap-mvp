-- ========================================================
-- SUPABASE SCHEMA CHO ROADMAP PLATFORM (PHASE 1 MVP)
-- Copy và dán toàn bộ đoạn mã này vào Supabase -> SQL Editor -> Run
-- ========================================================

-- 1. Bảng hồ sơ người dùng (Profiles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  streak_count int default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật RLS cho profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Trigger tự động tạo profile khi có user đăng ký auth mới
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Bảng theo dõi tiến độ bài học (User Progress)
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  roadmap_id text not null,
  node_id text not null,
  status text check (status in ('done', 'in_progress', 'skipped', 'pending')) default 'pending',
  notes text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, roadmap_id, node_id)
);

-- Bật RLS cho user_progress
alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select
  using ( auth.uid() = user_id );

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own progress"
  on public.user_progress for update
  using ( auth.uid() = user_id );

create policy "Users can delete own progress"
  on public.user_progress for delete
  using ( auth.uid() = user_id );

-- 3. Bảng lộ trình tùy chỉnh do người dùng tạo (Custom Roadmaps)
create table if not exists public.custom_roadmaps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text default '',
  nodes_json jsonb not null default '[]'::jsonb,
  edges_json jsonb not null default '[]'::jsonb,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật RLS cho custom_roadmaps
alter table public.custom_roadmaps enable row level security;

create policy "Users can manage own custom roadmaps"
  on public.custom_roadmaps for all
  using ( auth.uid() = user_id );

create policy "Public can view public roadmaps"
  on public.custom_roadmaps for select
  using ( is_public = true );
