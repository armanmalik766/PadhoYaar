
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table public.user_profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  attempt_year int,
  optional_subject text,
  daily_hours_goal int,
  study_mode text check (study_mode in ('COACHING', 'SELF_STUDY')),
  exam_stage text check (exam_stage in ('PRELIMS', 'MAINS', 'FINAL')) default 'PRELIMS', -- New column for exam stage
  language text default 'EN', -- Default to English
  created_at timestamptz default now(),
  updated_at timestamptz default now() -- Added for sync logic
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);


-- NEW: STUDY PREFERENCES TABLE
create table public.user_study_preferences (
  user_id uuid references public.user_profiles(id) not null primary key,
  plan_type text check (plan_type in ('GUIDED', 'CUSTOM')) default 'GUIDED',
  daily_task_limit int default 4,
  study_structure text check (study_structure in ('STATIC_ROTATION', 'MIXED_DAILY', 'SINGLE_SUBJECT')) default 'MIXED_DAILY',
  revision_style text check (revision_style in ('DAILY_LIGHT', 'ALTERNATE_DAYS', 'LIGHT_DAYS_ALLOWED')) default 'DAILY_LIGHT',
  answer_writing_freq text check (answer_writing_freq in ('DAILY', 'ALTERNATE', 'WEEKENDS')) default 'DAILY',
  last_modified_at timestamptz default now(),
  locked_until timestamptz
);

alter table public.user_study_preferences enable row level security;

create policy "Users can crud own preferences" on public.user_study_preferences
  for all using (auth.uid() = user_id);


-- 2. DAILY TASKS TABLE
create table public.daily_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) not null,
  task_date date not null default current_date,
  title text not null,
  task_type text check (task_type in ('STUDY', 'REVISION', 'ANSWER_WRITING')),
  status text check (status in ('PENDING', 'COMPLETED', 'SKIPPED')) default 'PENDING',
  description text,
  duration int default 60,
  created_at timestamptz default now(),
  updated_at timestamptz default now() -- Added for sync logic
);

-- Index for fast retrieval of today's tasks
create index tasks_user_date_idx on public.daily_tasks (user_id, task_date);
-- Index for finding updated records during sync
create index tasks_updated_idx on public.daily_tasks (user_id, updated_at);

alter table public.daily_tasks enable row level security;

create policy "Users can crud own tasks" on public.daily_tasks
  for all using (auth.uid() = user_id);


-- 3. REVISION QUEUE TABLE
create table public.revision_queue (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) not null,
  topic text not null,
  source_task_id uuid references public.daily_tasks(id),
  stage int default 1,
  last_reviewed_date date,
  next_revision_date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now() -- Added for sync logic
);

-- Index for finding what's due
create index revision_user_due_idx on public.revision_queue (user_id, next_revision_date);
create index revision_updated_idx on public.revision_queue (user_id, updated_at);

alter table public.revision_queue enable row level security;

create policy "Users can crud own revisions" on public.revision_queue
  for all using (auth.uid() = user_id);


-- 4. PROGRESS LOGS TABLE
create table public.progress_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) not null,
  log_date date not null default current_date,
  tasks_completed int default 0,
  tasks_total int default 0,
  revision_compliance boolean default false,
  consistency_score int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(), -- Added for sync logic
  unique(user_id, log_date)
);

alter table public.progress_logs enable row level security;

create policy "Users can view own progress" on public.progress_logs
  for select using (auth.uid() = user_id);

-- FUNCTION TO HANDLE NEW USER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Init default preferences
  insert into public.user_study_preferences (user_id) values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- FUNCTION TO AUTO-UPDATE UPDATED_AT
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp_users before update on public.user_profiles
for each row execute procedure public.handle_updated_at();

create trigger set_timestamp_tasks before update on public.daily_tasks
for each row execute procedure public.handle_updated_at();

create trigger set_timestamp_revision before update on public.revision_queue
for each row execute procedure public.handle_updated_at();
