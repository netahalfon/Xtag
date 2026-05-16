# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production server
npm run lint     # ESLint (eslint .)
```

No test suite is configured.

## Project Overview

**Xtag** — Hebrew-language workforce management system for managing employee shifts, salaries, and HR documents. Three user roles: `worker`, `manager`, `admin`.

## Architecture

### Stack
- **Next.js 16** (App Router) — no `/api` routes; uses **Server Actions** exclusively
- **Supabase** — Auth, Postgres DB, Storage (for Form 101 PDFs)
- **TypeScript** with strict mode
- **Shadcn/ui** (Radix UI + Tailwind CSS 4) for components; **Bootstrap 5** grid (CDN) for layout
- **React Hook Form** + **Zod** for all form validation
- **pnpm** as package manager

### Routing & File Pattern

Routes follow `app/[role]/[feature]/` with a consistent file pattern:

```
app/
├── auth/           login, signup, forgot-password, reset-password
├── admin/
│   ├── all-shifts/         page.tsx + all-shifts.tsx + shift-detail-panel.tsx + actions.ts
│   ├── all-workers/        page.tsx + all-workers.tsx + worker-details.tsx + actions.ts
│   ├── forms101/           page.tsx + forms101-viewer-client.tsx + actions.ts
│   └── payroll/            page.tsx + payroll-report-client.tsx + actions.ts
├── manager/
│   └── add-shifts/         page.tsx + manager-add-shifts-client.tsx + worker-combobox.tsx + actions.ts
└── worker/
    ├── my-salary/          page.tsx + shifts-list.tsx
    └── settings/           page.tsx + worker-settings-client.tsx + actions.ts
```

Each feature has:
- `page.tsx` — Server Component, auth/role guard, initial data fetch
- `*-client.tsx` — Client Component for interactive UI
- `actions.ts` — `"use server"` functions called from client components

### Role-Based Access Control

Roles: `worker < manager < admin`. Enforced at two layers:
1. Server-side redirect in `page.tsx` (check session + role from `users` table)
2. Supabase Row-Level Security (RLS) policies on DB

After login, users are redirected by role:
- admin → `/admin/all-shifts`
- manager → `/manager/add-shifts`
- worker → `/worker/my-salary`

### Supabase Clients

| File | When to use |
|------|-------------|
| `lib/supabase/client.ts` | Client Components (browser) |
| `lib/supabase/server.ts` | Server Components & Server Actions |
| `lib/supabase/proxy.ts` | Session refresh middleware |

### Data Models

**`types/user.ts`** — `User` type mirrors the `users` table:
- Core: `id`, `email`, `full_name`, `role`, `phone`, `birth_date`, `city`
- Salary: `salary_regular` (hourly), `salary_manager` (hourly for manager role)
- Banking: `bank_name`, `bank_branch_number`, `bank_account_number`
- Identity: `id_number` (national ID), `employee_number`
- HR: `form101_pdf_path` (Supabase Storage path), `notes`

**`types/shift.ts`** — `Shift` type mirrors the `shifts` table:
- Identity: `id`, `worker_id` (FK → users), `role` (`worker`|`manager`)
- Event: `shift_date`, `event_name`, `location`, `manager`
- Time: `start_time`, `end_time`, `total_hours`
- Pay: `hourly_rate`, `wage_bonus`, `travel_amount`, `shift_pay_total`
- Status: `pending` | `approved` | `rejected`
- Join: `worker: { full_name, email, employee_number } | null`

### Database Scripts

SQL migration scripts in `scripts/`:
- `001_create_users_table.sql`
- `002_user_trigger.sql` — auto-creates `users` row on auth signup
- `003_fix_rls_policies.sql`
- `004_fix_users_table_permissions.sql`

Supabase also exposes a `payroll_report_v2` RPC function used by the payroll page.

### Key Configuration

**`next.config.mjs`:**
- `typescript.ignoreBuildErrors: true` — build won't fail on TS errors
- `experimental.serverActions.bodySizeLimit: "10mb"` — for PDF uploads
- `images.unoptimized: true`

**Environment variables (`.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL=                # SMTP sender (Gmail account)
EMAIL_PASSWORD=       # Gmail App Password
ADMIN_EMAIL=          # Recipient for admin & Tamuz notifications
```

### UI Notes

- All user-facing text is in **Hebrew** (RTL)
- Israeli bank list is hardcoded in `app/auth/signup/page.tsx`
- Toasts use **Sonner** (`hooks/use-toast.ts`)
- `components/ui/` contains 50+ Shadcn/ui components — prefer these over new installs
- `components/navbar.tsx` is role-aware and updates on `onAuthStateChange`
