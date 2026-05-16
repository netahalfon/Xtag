# Email Notification System — Implementation Plan

## Goal
Add server-side email notifications using `nodemailer` for shift lifecycle events
(submission, approval, rejection) and new-employee registration.

---

## Resolved Decisions

- **SMTP** — Gmail (`smtp.gmail.com:465`, secure). `EMAIL_PASSWORD` assumed
  to be a Gmail App Password. Host/port hard-coded in `lib/email/mailer.ts`.
- **Admin recipient (task #3)** — new env var `ADMIN_EMAIL`.
- **Tamuz recipient (task #6)** — reuses `ADMIN_EMAIL` (no separate var).
- **Email language** — Hebrew, matching the rest of the UI.

---

## Environment Variables to Add

Add to `.env.local`:

```
ADMIN_EMAIL=<recipient for admin notifications and Tamuz notifications>
```

(`EMAIL` and `EMAIL_PASSWORD` already exist.)

---

## Subtasks (one per file edit)

### Subtask 1 — Install dependency
- Run `npm i nodemailer` and `npm i -D @types/nodemailer`.

### Subtask 2 — Create `lib/email/mailer.ts` (new file)
- `"use server"`-safe module (server-only).
- Build a singleton `nodemailer` transporter from
  `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL`, `EMAIL_PASSWORD`.
- Export `sendEmail(to: string | string[], subject: string, text: string)`.
- Fail soft: log errors, never throw out of the action (so a mail failure
  does not roll back a DB insert / update).

### Subtask 3 — Create `lib/email/templates.ts` (new file)
- Pure functions that build `{ subject, text }` per event:
  - `shiftSubmittedToWorkers(submitter, shifts[])`
  - `shiftSubmittedToAdmin(submitter, shifts[])`
  - `shiftApproved(shift)`
  - `shiftRejected(shift)`
  - `newEmployeeRegistered(user)`
- Hebrew bodies, matching the spec text per task.

### Subtask 4 — Edit `app/manager/add-shifts/actions.ts`
- After `supabase.from("shifts").insert(rows)` succeeds in
  `createShiftsAction`:
  - Fetch the submitter's `full_name` and `email`.
  - Fetch all active employees' emails (`users` where `role in (worker,
    manager, admin)`).
  - For each shift just inserted, build the per-worker context (event name,
    date, hours, role, location, notes, status).
  - Send **task #2** email — BCC all employees — using
    `shiftSubmittedToWorkers`.
  - Send **task #3** email — to `ADMIN_EMAIL` — using
    `shiftSubmittedToAdmin` (one summary email for the whole event,
    including every worker line just inserted).
- Wrap both `sendEmail` calls in try/catch so DB success is preserved.

### Subtask 5 — Edit `app/admin/all-shifts/actions.ts`
- In `updateShift`:
  - Before mutation, read the existing shift's `status` and the worker
    record (`full_name`, `email`).
  - After the update succeeds, if status changed:
    - `pending|rejected → approved` → send **task #4** email to the
      employee using `shiftApproved`.
    - `pending|approved → rejected` → send **task #5** email to the
      employee using `shiftRejected`.
- In `deleteShift`:
  - Before deletion, load the shift + worker (`full_name`, `email`,
    `shift_date`).
  - After successful delete, send **task #5** email (rejection wording).
- Wrap email calls in try/catch — DB result wins.

### Subtask 6 — Edit `app/auth/signup/page.tsx` + new
        `app/auth/signup/actions.ts`
- Create `app/auth/signup/actions.ts` (new file) exporting
  `notifyTamuzNewEmployee({ full_name, id_number, email })` — a `"use
  server"` wrapper that calls `sendEmail` with `newEmployeeRegistered`
  template, addressed to `TAMUZ_EMAIL`.
- In `app/auth/signup/page.tsx`, after a successful `supabase.auth.signUp`
  (current line ~290), call `await notifyTamuzNewEmployee({...})`.
- Wrap in try/catch so a mail failure does not surface as a signup error.

### Subtask 7 — Update `CLAUDE.md`
- Add the new env vars to the "Environment variables" section so future
  contributors know they are required.

---

## Out of Scope
- Queueing / retry on transient SMTP errors (fail-soft logging only).
- HTML templates (plain-text per spec).
- i18n / English fallback (Hebrew matches existing UI).
- Background workers — emails are sent synchronously inside the same
  server action.
