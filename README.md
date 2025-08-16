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
2) Create a Supabase project. In the SQL editor run the contents of `db/schema.sql`. Optionally run `db/seed.sql` to add example templates.
3) In Vercel, import the GitHub repo. Add the env vars from `.env.example` (fill values).
4) Deploy. Visit `/admin` to sign in with `ADMIN_PASSWORD`. Create a quiz, mint links, and send emails.

## Local development

```bash
npm i
npm run dev
```

Create `.env.local` with the keys from `.env.example`.

## Notes

- Never call OpenAI from the browser. Serverless routes keep the key private.
- For production security turn on Vercel Password Protection or wire NextAuth.
- Keep explanations concise to manage token cost.
