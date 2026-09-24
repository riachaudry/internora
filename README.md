# Internora

**Virtual Internships. Real Experience.**
Project-Based Virtual Internships & Career Experience

A complete, working internship management platform: public marketing site, student
portal, admin portal, document generation and public verification. Not a mockup —
every screen reads from and writes to a real Postgres database with row-level
security, real authentication and real file storage.

---

## What this actually does

**Students** register, apply to one of nine internship fields at 4, 6 or 8 weeks,
pay the fee through JazzCash or Easypaisa and upload a receipt. Once an admin
verifies that payment by hand, the system creates the internship, calculates every
week window and task deadline from the start date, issues an offer letter with a
public ID, and unlocks week 1. Students submit work, receive scores and written
feedback, and the next week unlocks only once 70% of the current week's required
task points are approved. At the end they get a certificate with a public
verification link, and the top three in each duration group are eligible for a
letter of recommendation and a performance reward.

**Admins** verify payments, review submissions, manage the roadmap catalog, issue
and revoke documents, assign rewards, answer support tickets, send invitations and
announcements, and read an immutable audit log of every administrative action.

### Deliberate design decisions

- **Payment verification is never automatic.** It is the single gate that activates
  an internship. The fee is recomputed server-side on submission, so a tampered form
  cannot lower it, and a unique index blocks duplicate transaction IDs.
- **Week locking is enforced on the server.** The submissions API refuses work for a
  locked week regardless of what the interface allowed.
- **Dates are never hard-coded.** Every week window, unlock date and deadline is
  derived from one stored `start_date` (see `src/lib/dates.ts`). The dashboard's
  TODAY card renders the live system date.
- **Scoring is one formula in one place.** 70% weekly work + 30% final project,
  recomputed on every review (`src/lib/scoring.ts`).
- **Duration mapping rule.** A D-week program runs the first D−1 progression weeks
  plus the final project week. So 4 weeks = weeks 1–3 + final; 8 weeks = weeks 1–7 +
  final. Documented in `roadmapFor()`.
- **Brand data has one source of truth** (`src/lib/brand.ts`), so the site, both
  portals and every generated document always agree.

### Trust statements (shown in the footer and on /about)

- This is a project-based virtual internship program.
- Performance rewards are subject to eligibility and final evaluation.
- Certificates are issued after meeting the published completion criteria.
- LORs are issued according to performance and eligibility.

Internora is an independent private program. It is not affiliated with any
government body or university, is not an accredited institution, and does not
guarantee employment or income. Performance rewards are not guaranteed income.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS with custom design tokens |
| Database | Supabase (PostgreSQL) with row-level security on every table |
| Auth | Supabase Auth (email + password, reset, invitations) |
| Storage | Supabase Storage — 4 buckets with per-user path policies |
| Email | Resend, or a console provider for local development |
| Validation | Zod on every API route |
| Hosting | Netlify or Vercel |

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in your Supabase credentials
```

Then, in the Supabase SQL editor, run these three files **in order**:

1. `supabase/schema.sql` — tables, enums, ID generator, triggers, leaderboard view
2. `supabase/policies.sql` — row-level security on every table
3. `supabase/storage.sql` — the four storage buckets and their access policies

Then seed and start:

```bash
npm run seed:roadmaps                                    # 9 fields × 3 durations
npm run create:admin -- you@example.com "Your Name" "StrongPass123"
npm run seed:demo                                        # optional demo students
npm run dev
```

Open http://localhost:3000. Sign in at `/login` — admins land on `/admin`,
students on `/dashboard`.

> The first `npm run build` needs internet access to fetch the Google Fonts used by
> `next/font`. This is normal; the fonts are then self-hosted in the build output.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run seed:roadmaps` | Publishes the 9 fields and their full roadmaps for 4, 6 and 8 weeks. Safe to re-run. |
| `npm run create:admin -- <email> "<Name>" "<password>"` | Creates an admin, or promotes an existing account |
| `npm run seed:demo` | Creates clearly-marked demo students so every screen has data |

Every demo account uses the `@demo.internora.test` domain and the password
`DemoPass123`. Remove them all with:

```sql
delete from auth.users where email like '%@demo.internora.test';
```

---

## Project layout

```
supabase/          schema.sql · policies.sql · storage.sql
scripts/           seed-roadmaps · seed-demo · create-admin
src/lib/
  brand.ts         all official brand, fee and reward data
  dates.ts         the week engine — every date derives from start_date
  scoring.ts       70/30 weighting and the 70% week-completion rule
  roadmaps/        the 9 field roadmaps, 8 weeks each, as typed data
  services/        internship activation, progression, documents, student state
  supabase/        browser, server and service-role clients
src/app/
  (site)/          public marketing site and /verify
  (auth)/          login, register, reset, invite
  dashboard/       student portal (19 screens)
  admin/           admin portal (23 screens)
  api/             all mutations, zod-validated and auth-guarded
```

---

## Security notes

- Row-level security is enabled on every table; students can only ever read their
  own rows. A trigger blocks self-promotion to admin.
- The service-role key is used only in server-side code and never reaches the
  browser.
- Admin routes are guarded three times: middleware, `requireAdmin()` on the page,
  and `apiAdmin()` in the API route.
- Invitation tokens are stored only as salted hashes; the raw token exists solely
  in the emailed link and expires.
- Uploads are validated for extension and size on both the client and the server,
  and land under `<bucket>/<user-id>/` where the storage policy scopes them.

---

## Contact

HR: **Rahat Chaudhry** — WhatsApp **+966 54 786 0296**
Fee payments: JazzCash / Easypaisa — **Rahat Chaudhry**, **03041713438**
