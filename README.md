# PLC Practice Companion

A browser-based practice tool for PLC ladder logic. Trainees build programs in a ladder (LAD) or function-block (FBD) editor, watch a simulated machine respond, get instant pass/fail feedback against tests, and can sit a checkpoint to earn a badge that anyone can verify. Trainers can run classes and see progress.

Built with Next.js 14 (App Router), Prisma + PostgreSQL, next-auth (credentials) and Tailwind CSS.

## Features

- **Simulator (`/lab`)**: ladder and FBD editors, tag table, live scenes (tank, conveyor, garage door, lift, bottling line and more). Timers (TON/TOF/TP), counters (CTU/CTD), math blocks, edge contacts, SET/RESET coils.
- **Problems (`/problems`)**: 36 exercises in six learning paths, from a jog motor to five full industrial projects. Answers are checked on the server. Hints unlock after failed checks.
- **Checkpoint (`/exam`)**: graded against hidden server-side tests, limited tries, a badge with a verification code (`/verify`).
- **Classes (`/trainer`, `/join`)**: trainers create classes, trainees join with a code, trainers see progress and download a CSV.
- **Community**: share projects and solutions, likes, discussion posts, reviews.
- **Schools / employers pages**: quote request form (`/api/quote`).

## Getting started

Requirements: Node.js 18.18 or newer, and a PostgreSQL database (Supabase works well).

```bash
npm install
cp .env.example .env      # then fill in the values
npx prisma db push        # create the tables
npm run dev               # http://localhost:3000
```

See `.env.example` for every setting. Required: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`. Useful optional ones:

| Variable | What it does |
| --- | --- |
| `SIGNUP_CODE` | Require an invite code to register |
| `TRAINER_EMAILS` | Comma-separated emails that can use `/trainer` |
| `QUOTE_WEBHOOK_URL` | Where pilot requests are forwarded (Slack/Discord-style webhook). Without it they are only written to the server log, so set it |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_OPERATOR` | Shown on the About, Privacy and Contact pages |
| `NEXT_PUBLIC_PILOT_VENUE` | Venue shown on pilot requests (default: Centurion Systems Limited) |
| `NEXT_PUBLIC_PILOT_PRICE` | Optional pilot fee text shown on the site, for example `KES 15,000 per trainee` |
| `NEXT_PUBLIC_PAY_METHODS` | Payment methods shown on the site (default: M-Pesa, bank transfer or against an invoice) |

## Tests

```bash
npm test
```

- `npm run test:engine` runs regression tests for the simulation engine (`lib/sim.js`): edge contacts, negative numbers in compares, counter limits, timers, latches.
- `npm run check:problems` runs the reference solution of every problem (the "Solution" hint in `lib/hints.js`) against that problem's tests, and against the hidden exam tests where a problem is used in a checkpoint. If you add or change a problem, this tells you immediately whether it can still be solved.

Neither needs a database or a build.

## Project layout

```
app/            Pages, server actions (app/actions.js), API routes
components/     Ladder and FBD editors, scene view, tag table, hint panel
lib/sim.js      The PLC engine: compile + scan cycle + test runner
lib/scenes.js   Physics for each simulated machine
lib/problems*.js, lib/hints.js, lib/tracks.js   Exercise content
lib/exams.js, lib/exam_tests.js                  Checkpoint outline (client-safe) and hidden tests (server only)
prisma/         Database schema
scripts/        Test scripts
```

### How the engine works

Each scan (every 100 ms in the browser) does the following: take a copy of the current tags, work out edge flags from the previous scan, evaluate every rung in order, then run the machine physics. Rungs compile to a boolean expression that a small hand-written parser evaluates (no `eval`). Timers advance by 100 ms of simulated time per scan. Edge memory stores the values each scan *started* with, so P and N contacts work on tags the program itself drives.

## Deploying

Set the same environment variables in your host (for example Vercel). `npm run build` runs `prisma generate` first. The schema is applied with `npx prisma db push`; there is no migration history yet.

`/api/health` runs a trivial database query, so pointing an uptime monitor at it also stops a free Supabase project from pausing.

## Known limitations

- Practice and checkpoint tasks share the same problems, and practice hints include full solutions. The checkpoint is a useful check, not a proctored exam.
- No email verification and no rate limiting on login, sign-up or the public forms.
- The app is on Next.js 14. Moving to Next 15 or later means converting `params` and `searchParams` to async access.

## Contributing

Run `npm test` before opening a pull request. Please report bugs and ideas as issues.

## Not done yet

- **CDACC unit mapping.** The site makes no claim about Kenyan curriculum alignment. Add it only after each problem has been mapped to a unit of competency.
- **Online payments.** M-Pesa is mentioned as a way to pay; there is no payment integration in the app.
