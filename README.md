# StudySession - Gamified Learning & Calendar Platform

A Next.js 14 platform combining AI-powered calendar parsing, gamified courses with XP & achievements, and monthly skill-based competitions.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Payments:** Stripe Checkout & Webhooks
- **AI:** OpenAI API (GPT-4 for parsing course outlines)
- **Email:** Nodemailer with Gmail SMTP

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 3. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Enable Email and OAuth providers (Google, GitHub) in Authentication settings
4. **To skip email confirmation** (e.g. if using Gmail SMTP and emails are blocked): Authentication → Providers → Email → turn **off** "Confirm email". New users will be signed in immediately without a confirmation link.
5. Create Storage buckets: `course-outlines` and `course-thumbnails`
6. Add your Supabase URL and anon key to `.env.local`

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/` - Next.js App Router pages
- `components/` - React components
- `lib/` - Utilities, Supabase clients, database types
- `supabase/migrations/` - Database schema

## Webhooks & error handling

- **Stripe webhook**  
  Set `STRIPE_WEBHOOK_SECRET` (from Stripe Dashboard → Developers → Webhooks). Endpoint: `POST /api/stripe/webhook`. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Signature is verified; failed processing returns a generic error so internal details are not leaked.

- **Security / audit webhook (optional)**  
  Set `SECURITY_WEBHOOK_URL` to a URL that accepts `POST` JSON (e.g. Slack, Discord, or your own endpoint). The app will send events such as failed auth, forbidden access, and account deletions. Payload shape: `{ type, message, path?, userId?, context?, timestamp, source: "studysession" }`. Omit or leave unset to disable.

- **App error handling**  
  The app uses `app/error.tsx` (recoverable errors), `app/global-error.tsx` (root-level crashes), and `app/not-found.tsx` (404). API routes can use `apiError()` from `@/lib/api-error` for consistent JSON responses and optional security event notifications.

## Deployment (Vercel)

1. Connect your GitHub repo to Vercel
2. Add all environment variables from `.env.example`
3. Set up Stripe webhook: `https://your-domain.com/api/stripe/webhook`
4. Cron: Race winner calculation runs on 1st of each month at 2am
5. **Make yourself admin:** Add your email to `ADMIN_EMAILS` in `.env` (comma-separated, e.g. `ADMIN_EMAILS=admin@example.com`).

## Subscription Tiers

- **Scholar** ($15/year) - Calendar only; AI syllabus parsing, 30 calendar uploads per year
- **Champion** ($8/month) - Full site access; Learn section, 3 course generations per day, XP, race eligibility. Access ends when subscription ends.
# StudySession
