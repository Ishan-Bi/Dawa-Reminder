# DawaReminder Context & Roadmap Tracker

## 1. Project Philosophy & Core Stack
- **Philosophy**: "Family configures. Elderly follows."
- **Two Interfaces**:
  1. Caregiver Dashboard (`/app/*`): manages patients, medicines, schedules, history. Protected by HttpOnly SameSite=Lax session cookie.
  2. Patient Interface (`/p/:token`): large-type, high-contrast, zero-password interface with Taken / Skipped actions.
- **Frontend**: React + Vite + TypeScript, Tailwind CSS + shadcn/ui, React Router, Lucide React, `vite-plugin-pwa`.
- **Backend**: Python + FastAPI, Pydantic, SQLAlchemy 2, Alembic, PostgreSQL on Neon (with SQLite fallback for local unit tests).
- **Images**: Cloudinary (URLs stored in database).
- **Timezone**: Interpret all schedules in `Asia/Kolkata`, store UTC in DB.
- **Hosting & Proxy**: Vercel (frontend) + Render (backend). Same-origin proxy via `vercel.json` rewrites `/api/*` to Render to avoid cross-origin cookie issues.

---

## 2. Master Stage Tracker

- [~] **Stage 0: Pipeline and foundation** (code foundation complete; live deployment acceptance check remains)
  - [x] Configure `.gitignore`, backend & frontend local environment defaults (`.env`, `.env.example`).
  - [x] Configure same-origin proxy: `vercel.json` rewrites and `vite.config.ts` dev proxy.
  - [x] Create `CONTEXT.md`.
  - [x] Initialize backend structure (`core/`, `models/`, `schemas/`, `routers/`, `services/`, `alembic/`).
  - [x] Initialize 5 core database tables (`users`, `patients`, `medications`, `schedules`, `dose_logs`) and working Alembic migrations.
  - [x] Initialize frontend `src/` shell (`App.tsx`, `main.tsx`, `styles/globals.css`, `lib/api.ts`) and verify TypeScript check.
- [~] **Stage 1: Authentication** (API and local UI implemented; live iPhone Safari acceptance check remains)
  - [x] Caregiver register, login, logout, and current-session API routes.
  - [x] Hashed server-side sessions with HttpOnly, SameSite=Lax cookies; Secure in production.
  - [x] Login/registration form and protected caregiver route shell.
- [ ] **Stage 2: Patients and medicines** (Caregiver-scoped CRUD, Cloudinary upload)
- [ ] **Stage 3: Schedules and doses** (Schedule builder, on-demand generation in Asia/Kolkata, Pytest suite)
- [ ] **Stage 4: Patient experience and monitoring** (Token link & QR, Taken/Skipped, live status, in-app audio alert)
- [ ] **Stage 5: PWA and accessibility** (Manifest, service worker, install prompt, Hindi/English toggle, disclaimer)
- [ ] **Stage 6: Stretch features** (Adherence weekly charts, offline queue, caregiver missed dose alerts)
- [ ] **Stage 7: Hardening and demo preparation** (Database seed script, manual checklist, keep-awake pinger)

---

## 3. Current Status and Known Issues
- A follow-up Alembic revision creates the five MVP tables; a second revision creates revocable caregiver sessions. The original published revision remains unchanged.
- Deployment acceptance is currently failing: the configured Render `/health` URL returns 404 and the configured Vercel URL returns `DEPLOYMENT_NOT_FOUND`.
- The local `DATABASE_URL` uses SQLite. A Neon production URL and deployment credentials are not configured in this checkout; no Vercel project link or deploy CLI is available, and Docker is not running.
- Python syntax and TypeScript checks pass. Runtime/migration execution is blocked because Windows Application Control blocks native Python modules; Vite build is blocked by the same policy on Rollup's native module.
- No backend test files or frontend test files are present yet.
- Expired session records are removed when used; periodic session cleanup is not configured.
- Stage 1 needs a live deployment and a real-device login check before it can be marked complete.

## 4. Workflow Rules for AI Coding Agents
1. Inspect existing repo before changing anything and report what works and what is missing.
2. One stage at a time. Never request the whole app in one prompt.
3. Do not rewrite working code. Make small, incremental changes.
4. No mock data in final flows. Everything hits the real API and database.
5. Every query is scoped to the caregiver or the patient token.
6. Run the build and relevant tests after each task and report only what was actually verified.
7. Commit after each working step so any break can be rolled back.
8. Keep deployment compatibility in mind from the first commit.
9. Update `CONTEXT.md` with current status and known issues after each stage.
