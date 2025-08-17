# AI Quiz Builder and Question Bank System

This implementation adds an AI-assisted quiz builder and question bank/pool system to enable teachers to create randomized, standards-aligned assessments.

## Features

### 🤖 AI Question Generation
- Generate draft multiple-choice questions using OpenAI
- Specify course, unit, topic, difficulty, and TEKS standards
- Review and edit questions before saving to question bank
- Batch selection and saving capabilities

### 🎯 Question Bank System
- Reusable question repository organized by topics
- Difficulty-based categorization (easy/medium/hard)
- TEKS standards alignment and tracking
- Explanation field support for detailed feedback

### 🎲 Pool-based Quizzes
- Create pools that randomly sample questions from the bank
- Multiple pools per quiz supported
- Each student gets different questions per attempt
- Prevents answer sharing and memorization

### 📊 Enhanced Analytics
- TEKS performance tracking across question sources
- Quiz-specific accuracy metrics
- Cross-pool analytics and insights

## Database Setup

Run the following SQL in your Supabase database:

```sql
-- Topics (course/unit organization)
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  course text not null,
  unit text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Question bank for reusable items
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

-- Quiz pools for sampling
create table if not exists quiz_pools (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  topic_id uuid references topics(id),
  difficulty text check (difficulty in ('easy','med','hard')) default 'med',
  draw_count integer not null default 5,
  created_at timestamptz default now()
);
create index if not exists idx_quiz_pools_quiz on quiz_pools(quiz_id);

-- Attempt snapshots for consistent grading
create table if not exists attempt_items (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references attempts(id) on delete cascade,
  source text check (source in ('static','bank')) not null,
  question_id uuid,
  bank_id uuid,
  prompt text not null,
  options jsonb not null,
  correct_index int not null,
  points int not null default 1
);
create index if not exists idx_attempt_items_attempt on attempt_items(attempt_id);

-- Update answers table for new system
alter table answers drop constraint if exists answers_pkey;
alter table answers drop constraint if exists answers_question_id_fkey;
alter table answers add column if not exists attempt_item_id uuid;
alter table answers alter column question_id drop not null;
alter table answers add constraint answers_pk primary key (attempt_id, attempt_item_id);
```

## Environment Variables

Ensure these environment variables are set:

```bash
ADMIN_PASSWORD=your-secure-password
OPENAI_API_KEY=sk-your-openai-key  # Optional, for AI generation
OPENAI_MODEL=gpt-4.1-mini          # Optional, defaults to gpt-4.1-mini
```

## Usage Workflow

### 1. Generate Questions
1. Navigate to `/admin/ai`
2. Fill in course, unit, topic details
3. Specify difficulty and TEKS codes
4. Click "Generate Items"
5. Review and edit the generated questions
6. Select desired questions and click "Save Selected"

### 2. Create Quiz Pools
1. Navigate to `/admin/pools`
2. Enter a Quiz ID
3. Add pools specifying:
   - Topic slug (e.g., "calc1-derivatives")
   - Difficulty level
   - Number of questions to draw
4. Monitor "Available" count vs. "Draw Count"

### 3. Student Experience
- Students taking pooled quizzes get randomized questions
- Each attempt samples different questions from the pools
- Questions are masked (correct answers hidden)
- Scoring uses the snapshotted correct answers

### 4. Analytics
- View TEKS performance at `/admin/analytics`
- Filter by quiz to see standards-specific data
- Track accuracy across static and pooled questions

## API Endpoints

### AI Generation
- `POST /api/admin/ai/generate-items` - Generate draft questions
- `POST /api/admin/ai/save-items` - Save questions to bank

### Pool Management
- `POST /api/admin/pools/add` - Create new pool
- `GET /api/admin/pools/list?quiz_id=X` - List pools for quiz
- `POST /api/admin/pools/delete` - Remove pool

### Analytics
- `GET /api/admin/analytics/teks?quiz_id=X` - TEKS performance data

All admin endpoints require `x-admin-key: ${ADMIN_PASSWORD}` header.

## Backward Compatibility

- Existing static quizzes continue to work unchanged
- New attempt_items system works alongside legacy questions table
- No breaking changes to existing API contracts
- Gradual migration path available

## Troubleshooting

### OpenAI Issues
- Check `OPENAI_API_KEY` environment variable
- Test with `/api/diag/openai` endpoint
- System gracefully handles missing API key

### Pool Issues
- Ensure questions exist in bank for specified topic/difficulty
- Check "Available" count in pools list
- Verify topic slugs match exactly

### Database Issues
- Run all migration SQL commands
- Check foreign key constraints
- Verify table indexes are created

## Development

To test locally:

```bash
npm install
npm run dev
```

Navigate to `/admin` and use password from `ADMIN_PASSWORD` environment variable.

## Deployment

1. Run database migrations in Supabase
2. Set environment variables in Vercel/hosting platform
3. Deploy as normal Next.js application
4. Test admin functionality and API endpoints

## Security Notes

- Admin password is required for all sensitive operations
- Question answers are never exposed to client JavaScript
- Attempt snapshots prevent answer changes after quiz start
- Input validation on all API endpoints