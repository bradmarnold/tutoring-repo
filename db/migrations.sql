-- AI Quiz Builder and Question Bank Migrations
-- Run this SQL in Supabase SQL editor

-- 1) Topics (e.g., course/unit slugs)
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  course text not null,           -- e.g., 'calc1', 'phys1'
  unit text not null,             -- e.g., 'derivatives', 'kinematics'
  slug text unique not null,      -- 'calc1-derivatives'
  created_at timestamptz default now()
);

-- 2) Bank of reusable questions
create table if not exists question_bank (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete set null,
  prompt text not null,
  options jsonb not null,
  correct_index integer not null,
  difficulty text check (difficulty in ('easy','med','hard')) default 'med',
  teks_code text,
  explanation text,
  created_by text,
  created_at timestamptz default now()
);
create index if not exists idx_qbank_topic on question_bank(topic_id);
create index if not exists idx_qbank_teks on question_bank(teks_code);

-- 3) Pools attach to quizzes and specify draws
create table if not exists quiz_pools (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  topic_id uuid references topics(id),
  difficulty text check (difficulty in ('easy','med','hard')) default 'med',
  draw_count integer not null default 5,
  created_at timestamptz default now()
);
create index if not exists idx_quiz_pools_quiz on quiz_pools(quiz_id);

-- 4) Snapshot the exact items shown per attempt (works for static or bank)
create table if not exists attempt_items (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references attempts(id) on delete cascade,
  source text check (source in ('static','bank')) not null,
  question_id uuid,         -- if source='static' (from questions.id)
  bank_id uuid,             -- if source='bank'   (from question_bank.id)
  prompt text not null,
  options jsonb not null,
  correct_index int not null,
  points int not null default 1
);
create index if not exists idx_attempt_items_attempt on attempt_items(attempt_id);

-- 5) Adjust answers to reference attempt_items (keeps legacy columns for compatibility)
alter table answers drop constraint if exists answers_pkey;
alter table answers drop constraint if exists answers_question_id_fkey;
alter table answers add column if not exists attempt_item_id uuid;
alter table answers alter column question_id drop not null;
alter table answers add constraint answers_pk primary key (attempt_id, attempt_item_id);