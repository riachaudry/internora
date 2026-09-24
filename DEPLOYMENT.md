# Deploying Internora

From an empty Supabase project to a live site. Roughly 30 minutes.

---

## 1. Create the Supabase project

1. Go to supabase.com, create a project, pick a region close to Pakistan
   (Singapore or Frankfurt are both reasonable) and save the database password.
2. In **Project Settings → API**, copy three values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

> The service-role key bypasses row-level security. It belongs only in server
> environment variables — never in a `NEXT_PUBLIC_` variable, never in the browser,
> never in Git.

## 2. Run the SQL, in order

Open **SQL Editor** and run each file top to bottom. Order matters.

| # | File | What it creates |
|---|---|---|
| 1 | `supabase/schema.sql` | 25 tables, 12 enums, the `next_public_id()` generator, the `handle_new_user` trigger, the leaderboard view |
| 2 | `supabase/policies.sql` | Row-level security on every table, plus the trigger that blocks self-promotion to admin |
| 3 | `supabase/storage.sql` | The four buckets and their per-user path policies |

Check **Table Editor** afterwards: you should see `profiles`, `internships`,
`internship_weeks`, `internship_tasks` and the rest, each with the RLS shield on.

## 3. Configure Auth

In **Authentication → Providers**, keep Email enabled. For a smooth first run,
turn **Confirm email** off; turn it back on before you take real signups.

In **Authentication → URL Configuration**, set:

- Site URL: your production URL (e.g. `https://internora.netlify.app`)
- Redirect URLs: add `https://your-domain/auth/callback` and
  `https://your-domain/reset-password`, plus the `http://localhost:3000`
  equivalents for local development.

## 4. Check the storage buckets

`supabase/storage.sql` creates them, but verify in **Storage**:

| Bucket | Public | Limit | Holds |
|---|---|---|---|
| `avatars` | yes | 2 MB | Profile photos |
| `payment-proofs` | no | 5 MB | Payment screenshots |
| `submissions` | no | 25 MB | Task deliverables |
| `documents` | no | 10 MB | Support attachments |

## 5. Environment variables

Copy `.env.example` to `.env.local` locally, and set the same keys in your host's
dashboard for production:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-domain
EMAIL_PROVIDER=resend            # or "console" to log emails instead of sending
RESEND_API_KEY=...
EMAIL_FROM="Internora <noreply@your-domain>"
INVITE_TOKEN_SECRET=<a long random string>
```

Generate the invite secret with `openssl rand -hex 32`.

## 6. Seed and create your admin

```bash
npm install
npm run seed:roadmaps
npm run create:admin -- hr@your-domain "Rahat Chaudhry" "<strong password>"
```

`seed:roadmaps` publishes all nine fields with their 4, 6 and 8 week roadmaps and is
safe to re-run — it replaces each roadmap in place rather than duplicating it.

Optionally run `npm run seed:demo` to populate every screen with clearly-marked demo
students, then delete them later with the query in the README.

## 7. Email

With `EMAIL_PROVIDER=console`, emails are written to the server log — fine for
development. For real delivery:

1. Create a Resend account and verify your sending domain.
2. Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` and `EMAIL_FROM`.
3. Send yourself a test invitation from **Admin → Invitations**, then check
   **Admin → Emails** for the log entry.

## 8. Push to GitHub

```bash
git init
git add .
git commit -m "Internora platform"
git branch -M main
git remote add origin https://github.com/<you>/internora.git
git push -u origin main
```

`.gitignore` already excludes `.env.local`, `node_modules` and `.next`. Confirm no
`.env*` file is staged before your first push.

## 9. Deploy

**Netlify** — `netlify.toml` is included and configured.

1. Add a new site from your Git repository.
2. Build command `npm run build`, publish directory `.next`.
3. Add every environment variable from step 5 under **Site settings → Environment
   variables**.
4. Deploy, then set `NEXT_PUBLIC_SITE_URL` to the real URL and redeploy.

**Vercel** — import the repository, add the same environment variables, deploy. The
App Router and middleware need no extra configuration.

After the first deploy, go back to Supabase **Authentication → URL Configuration**
and make sure the Site URL and redirect URLs match your live domain.

## 10. Verify it works

Walk the full path once on production:

1. Register a test student account.
2. Apply to a field and pick a duration; confirm the fee matches the published one.
3. Submit a payment with a screenshot.
4. Sign in as admin, open **Payments**, verify it with an immediate start.
5. Confirm as the student that the offer letter exists, week 1 is unlocked and
   weeks 2+ are locked.
6. Submit a task, approve it as admin, and watch the score and progress update.
7. Open `/verify/offer-letter/<id>` in a private window and confirm it resolves.

## Common problems

| Symptom | Cause |
|---|---|
| "Missing NEXT_PUBLIC_SUPABASE_URL" from a script | No `.env.local`, or it's not in the directory you ran from |
| Registration succeeds but no profile row | `schema.sql` wasn't run, so the `handle_new_user` trigger is missing |
| Student sees an empty dashboard after paying | The payment hasn't been verified yet — that's the intended gate |
| Uploads fail with a permissions error | `storage.sql` wasn't run, or the bucket names don't match the env vars |
| Admin redirected to `/dashboard` | That account's `role` is still `student`; run `create:admin` again to promote it |
| Application form shows no fields | `npm run seed:roadmaps` hasn't been run |
| Build fails fetching Google Fonts | The build machine needs outbound internet for `next/font` |
