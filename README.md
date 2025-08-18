# Tutoring Site

Professional tutoring site with:
- Marketing landing page
- Tokenized magic links per student
- Timed quizzes with auto scoring
- AI explanations using the OpenAI Responses API
- Supabase database for quizzes, links, attempts
- Teacher dashboard with randomized pools, email delivery, analytics
- Deploy on Vercel from a GitHub repo

## Quick start

1) Create a new empty GitHub repo, then download and extract this project and push it.
2) Create a Supabase project. In the SQL editor run the contents of `db/migrations.sql`. Optionally run `db/seed.sql` to add example templates.
3) In Vercel, import the GitHub repo. Add the env vars from `.env.example` (fill values).
4) Deploy. Visit `/admin` to sign in with `ADMIN_PASSWORD`. Create a quiz, mint links, and send emails.

## Environment Variables

### Required
- `SUPABASE_URL` - Your Supabase project URL (https://YOUR-PROJECT.supabase.co)
- `SUPABASE_SERVICE_ROLE` - Your Supabase service role key (for admin operations)
- `ADMIN_PASSWORD` - Password for admin access (cookie and header auth)

### Demo System
- `DEMO_QUIZ_ID` - UUID of quiz to use for public demos (enables /api/demo-link)
- `DEMO_TTL_MINUTES` - Demo link expiration in minutes (default: 15)
- `DEMO_MAX_ATTEMPTS` - Max attempts for demo users (default: 1)

### AI Features (Optional)
- `OPENAI_API_KEY` - OpenAI API key for explanations (degrades gracefully if missing)
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-4.1-mini)

### Email (Optional)
- `RESEND_API_KEY` - Resend API key for email delivery
- `MAIL_FROM` - From address for emails (e.g., "Bradford <noreply@your-domain>")

### Other
- `SITE_URL` - Public site base URL for email links (e.g., https://your-site.vercel.app)

## Diagnostics

Visit `/api/diag` to check system status:
- Environment variable presence
- Database connectivity
- OpenAI API status
- Demo configuration

## Admin Features

### Cookie Authentication
Admin pages accept both:
- `x-admin-key` header with ADMIN_PASSWORD
- HttpOnly cookie set via POST `/admin/login` with password

### AI Generator
- Supports tone selection: Concise, Step-by-step, Exam-style
- Automatically normalizes difficulty to easy|med|hard

### Pool Management
- Shows availability warnings when bank has fewer items than draw_count
- Quick actions for adjusting draw counts and deletion
- Pools sample from question_bank with topic_id and difficulty matching

### Analytics
- TEKS performance tracking across attempt_items and legacy questions
- Returns: teks_code, attempts, correct, accuracy

## Database Schema

Run `db/migrations.sql` for idempotent setup:
- `topics` - Course/unit organization (calc1-derivatives, etc.)
- `question_bank` - Reusable questions with TEKS codes
- `quiz_pools` - Sampling configuration per quiz
- `attempt_items` - Snapshot system for consistent grading
- Enhanced `answers` table supports both legacy and new systems

## Local development

```bash
npm i
npm run dev
```

Create `.env.local` with the keys from `.env.example`.

## Deployment

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy
5. Run migrations in Supabase SQL editor
6. Test with `/api/diag`

## Seeding Data

Example SQL for Calc I Derivatives topic with 6 questions:

```sql
-- Create topic
insert into topics (course, unit, slug)
values ('calc1','derivatives','calc1-derivatives')
on conflict (slug) do nothing;

-- Add 6 sample questions to question_bank
-- (See full SQL in db/seed.sql)

-- Attach pool to demo quiz
insert into quiz_pools (quiz_id, topic_id, difficulty, draw_count)
select 'YOUR_DEMO_QUIZ_ID'::uuid, t.id, 'med', 5
from topics t where t.slug='calc1-derivatives';
```

## Notes

- Never call OpenAI from the browser. Serverless routes keep the key private.
- For production security turn on Vercel Password Protection or wire NextAuth.
- Keep explanations concise to manage token cost.
- Submit API supports anytime submission with unanswered question highlighting.
- Navigation warnings prevent accidental quiz abandonment.
- Radio button groups are unique per question to prevent cross-question interference.
