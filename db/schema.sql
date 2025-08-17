-- Enable UUID
create extension if not exists "uuid-ossp";

-- Core quizzes
create table if not exists quizzes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  duration_seconds integer not null default 900,
  created_at timestamptz default now()
);

create table if not exists questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_index integer not null,
  points integer not null default 1,
  created_at timestamptz default now(),
  bank_question_id uuid,
  teks_code text
);

create table if not exists student_links (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references quizzes(id) on delete cascade,
  student_email text not null,
  token text unique not null,
  expires_at timestamptz not null,
  max_attempts integer not null default 1
);

create table if not exists attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references quizzes(id) on delete cascade,
  student_email text not null,
  started_at timestamptz default now(),
  ends_at timestamptz not null,
  finished boolean default false,
  score integer not null default 0
);

create table if not exists answers (
  attempt_id uuid references attempts(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  selected_index integer not null,
  is_correct boolean not null,
  explanation text,
  primary key (attempt_id, question_id)
);

-- Bank and tagging
create table if not exists bank_questions (
  id uuid primary key default uuid_generate_v4(),
  course text not null check (course in ('Calc I','Calc II','Calc III','Physics I','Physics II')),
  unit text,
  prompt text not null,
  options jsonb not null,
  correct_index integer not null,
  points integer not null default 1,
  difficulty text check (difficulty in ('easy','medium','hard')),
  created_at timestamptz default now()
);

create table if not exists topics (
  id uuid primary key default uuid_generate_v4(),
  course text not null,
  name text not null
);

create table if not exists standards (
  id uuid primary key default uuid_generate_v4(),
  code text not null,
  description text,
  course text
);

create table if not exists bank_question_topics (
  bank_question_id uuid references bank_questions(id) on delete cascade,
  topic_id uuid references topics(id) on delete cascade,
  primary key (bank_question_id, topic_id)
);

create table if not exists bank_question_standards (
  bank_question_id uuid references bank_questions(id) on delete cascade,
  standard_id uuid references standards(id) on delete cascade,
  primary key (bank_question_id, standard_id)
);

-- Pools and templates
create table if not exists pools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  course text not null,
  exam text not null
);

create table if not exists pool_items (
  pool_id uuid references pools(id) on delete cascade,
  bank_question_id uuid references bank_questions(id) on delete cascade,
  weight real not null default 1,
  primary key (pool_id, bank_question_id)
);

create table if not exists quiz_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  course text not null,
  exam text not null,
  duration_seconds integer not null default 3600
);

create table if not exists template_sources (
  template_id uuid references quiz_templates(id) on delete cascade,
  pool_id uuid references pools(id) on delete cascade,
  count integer not null,
  primary key (template_id, pool_id)
);

-- Email logs
create table if not exists email_logs (
  id uuid primary key default uuid_generate_v4(),
  to_email text not null,
  quiz_id uuid references quizzes(id) on delete set null,
  token text,
  status text,
  provider_id text,
  created_at timestamptz default now()
);

-- Analytics function
create or replace function topic_accuracy(p_course text, p_since timestamptz)
returns table(topic text, attempts int, correct int, accuracy numeric) language sql as $$
  select t.name as topic,
         count(a.*) as attempts,
         sum(case when a.is_correct then 1 else 0 end) as correct,
         round(100.0*sum(case when a.is_correct then 1 else 0 end)/nullif(count(a.*),0), 1) as accuracy
  from answers a
  join questions q on q.id = a.question_id
  join bank_question_topics bqt on bqt.bank_question_id = q.bank_question_id
  join topics t on t.id = bqt.topic_id
  where (p_course is null or t.course = p_course)
    and (p_since is null or a.attempt_id in (
      select id from attempts where started_at >= p_since
    ))
  group by t.name
  order by accuracy asc, attempts desc;
$$;

-- TEKS support
alter table questions add column if not exists teks_code text;
create index if not exists idx_questions_teks on questions(teks_code);

-- TEKS analytics view
create or replace view v_teks_accuracy as
select q.quiz_id, q.teks_code,
       count(*) filter (where a.is_correct) as correct,
       count(*) as total
from answers a
join questions q on q.id = a.question_id
where q.teks_code is not null
group by 1,2;
