# Deployment Guide

## Vercel (Recommended)

### Steps

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. Framework preset: **Next.js** (auto-detected)
4. Add all environment variables (see `.env.example`)
5. Click **Deploy**

Vercel handles:
- Edge middleware (session refresh)
- Serverless functions for Server Actions
- Automatic HTTPS
- Preview deployments per PR

### Important Vercel settings

- **Node.js version**: 18.x or 20.x
- **Build command**: `npm run build` (default)
- **Output directory**: `.next` (default)

### Environment variables for Vercel

Add all variables from `.env.example` in **Settings → Environment Variables**.

Set scope to **Production + Preview + Development** for most variables.
Set `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` to **Production only** for security.

---

## Supabase Setup

### 1. Create project
- Go to [supabase.com](https://supabase.com) → New project
- Choose a region close to your users (e.g., `eu-central-1` for Europe)

### 2. Run migrations
In the Supabase SQL Editor, run each file in order:

```
sql/001_initial_schema.sql
sql/002_applications.sql
sql/004_indeed_jobs.sql
sql/005_agencies.sql
```

### 3. Storage bucket
The initial schema creates a `cvs` bucket. Verify it exists in **Storage → Buckets**.

Set bucket policy to **private** (the schema handles this).

### 4. Auth settings
In **Authentication → URL Configuration**:
- Site URL: `https://your-domain.com`
- Redirect URLs: `https://your-domain.com/**`

### 5. Email auth
In **Authentication → Providers → Email**:
- Enable email confirmations (recommended for production)

---

## Custom Domain

In Vercel → Settings → Domains, add your domain.

Update `NEXT_PUBLIC_APP_URL` in environment variables to your production domain.

---

## Monitoring

- **Vercel Analytics** — enable in project settings (free tier available)
- **Supabase Logs** — available in the Supabase dashboard under Logs
- **Error tracking** — add [Sentry](https://sentry.io) by wrapping Server Actions in try/catch and calling `Sentry.captureException()`

---

## Scaling Considerations

### When you hit Supabase free tier limits
- Upgrade to Supabase Pro ($25/mo) for more compute and storage
- Enable connection pooling (PgBouncer) in Supabase settings

### When you hit Vercel function timeouts
- Claude matching runs per-job — with 50+ jobs it may approach the 30s Vercel limit
- Solution: move `runMatchingForCandidate` to a background job (Trigger.dev, Inngest, or Supabase Edge Functions)

### Multi-agency scale
- Each agency has isolated data via `agency_id` FK and RLS policies
- No additional infrastructure needed until >100 agencies
