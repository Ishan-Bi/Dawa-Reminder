# DawaReminder — Six-Member Engineering Team Responsibilities & Workflow

**Document Version:** 1.0.0  
**Team Composition:** 6 Engineers  
**Methodology:** Contract-Driven Parallel Development  

---

## 1. Team Roles & Ownership Matrix

```
+---------------------------------------------------------------------------------------+
| Dev 1: Product Management & UI/UX Lead                                                |
| Owns: PRD, Design System, Figma/Mockups, User Testing, Pitch & Jury Presentation     |
+---------------------------------------------------------------------------------------+
        |                                                              |
        v                                                              v
+-------------------------------+                     +---------------------------------+
| Dev 2: Family Dashboard Lead  |                     | Dev 3: Patient PWA Lead         |
| Owns: Desktop/Tablet React UI,|                     | Owns: Mobile PWA, Workbox SW,   |
| Med Catalog, Schedule Editor, |                     | IndexedDB, Hindi Speech, Cards, |
| Adherence Charts, OCR Review  |                     | Taken/Skip Haptic Actions       |
+-------------------------------+                     +---------------------------------+
        \                                                              /
         +------------------------------+-----------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------------+
| Dev 4: Backend & Database Lead                                                        |
| Owns: FastAPI App, PostgreSQL Schema, SQLAlchemy Models, Alembic Migrations, Auth,   |
| Patient/Medication/Schedule/Dose CRUD APIs, Batch-Sync Resolution                     |
+---------------------------------------------------------------------------------------+
        |                                                              |
        v                                                              v
+-------------------------------+                     +---------------------------------+
| Dev 5: Engine & Background    |                     | Dev 6: DevOps, QA & Integration |
| Owns: Celery Beat, Redis,     |                     | Owns: Docker Compose, Nginx, CI,|
| 7-Day Rolling Dose Generator, |                     | MinIO S3, Playwright E2E Tests, |
| 45-min Overdue Escalations,   |                     | Offline Simulators, Demo Setup  |
| Web Push Dispatcher, OCR Task |                     |                                 |
+-------------------------------+                     +---------------------------------+
```

---

## 2. Detailed Member Profiles & Deliverables

### Developer 1: Product Management & UI/UX Lead
- **Primary Ownership:** Product definition, user journeys, visual design system tokens, copy localization (English & Hindi), WCAG 2.2 AA accessibility audit, and final jury presentation.
- **Key Deliverables:**
  - Complete Figma design tokens (Hex colors, typography scale, 64px button components).
  - High-fidelity visual mockups for Patient PWA and Family Dashboard.
  - Authentic asset collection: 10 Indian medication blister strips + tablet photos with transparent/clean backgrounds.
  - Pitch deck and live demo script.
- **Interfaces with:** Dev 2 and Dev 3 for UI component fidelity.

### Developer 2: Family Dashboard Frontend Lead
- **Primary Ownership:** Desktop/Tablet React web application for family caregivers.
- **Key Deliverables:**
  - Caregiver registration, login, and patient profile management.
  - Add Medicine Wizard with client-side image cropping and preview.
  - Medication Schedule Editor (interactive time-slot picker, food relation toggle).
  - Split-Screen OCR Human Verification interface.
  - 7-Day & 30-Day adherence analytics charts (Recharts / Chart.js).
- **Dependencies & Boundary:** Consumes `/api/v1/auth`, `/api/v1/patients`, `/api/v1/medications`, `/api/v1/schedules`, and `/api/v1/prescriptions`.

### Developer 3: Patient PWA Frontend Lead
- **Primary Ownership:** Mobile-first, elder-centric Progressive Web Application.
- **Key Deliverables:**
  - One-tap pair flow via 6-digit code or QR scan.
  - Signature Medicine Card with high-resolution pill photos and 68px TAKEN button.
  - Time-segmented daily routine feed (Morning, Afternoon, Evening, Night).
  - Web Speech API voice synthesis in Hindi and English.
  - Workbox Service Worker integration with offline asset precaching.
  - IndexedDB storage engine (`idb`) and offline sync event dispatcher.
  - Persistent red Emergency "Call Family" button.
- **Dependencies & Boundary:** Consumes `/api/v1/patients/pair`, `/api/v1/patients/{id}/doses/today`, and `/api/v1/doses/batch-sync`.

### Developer 4: Backend & Database Lead
- **Primary Ownership:** Core FastAPI application, database schemas, and transactional business logic.
- **Key Deliverables:**
  - PostgreSQL schema and Alembic migrations for all 11 tables.
  - Argon2id password hashing and JWT cookie authentication middleware.
  - Patient-level multi-tenant authorization middleware (`patient_access`).
  - REST API implementation for Patients, Medications, Schedules, and Dose Events.
  - `/doses/batch-sync` endpoint with idempotency token verification and monotonic state resolution.
- **Dependencies & Boundary:** Delivers tested REST endpoints to Dev 2 and Dev 3; coordinates with Dev 5 on data models.

### Developer 5: Scheduling, Notifications & OCR Lead
- **Primary Ownership:** Asynchronous background processing, distributed task queues, periodic schedules, and OCR ingestion.
- **Key Deliverables:**
  - Celery 5 worker configuration with Redis 7 broker.
  - Celery Beat rolling 7-day dose instance generator task.
  - 45-minute overdue dose escalation worker with Web Push (VAPID) notification dispatcher.
  - Prescription OCR processing pipeline using PaddleOCR/OpenCV with drug entity extraction.
  - Low-stock inventory alert worker.
- **Dependencies & Boundary:** Interacts with PostgreSQL via SQLAlchemy async sessions; consumes presigned S3 URLs from Dev 4.

### Developer 6: Integration, DevOps & QA Lead
- **Primary Ownership:** Infrastructure, Docker Compose, Nginx reverse proxy, CI/CD, mock servers, and automated end-to-end testing.
- **Key Deliverables:**
  - Production-ready `docker-compose.yml` orchestrating Frontend, Backend, PostgreSQL, Redis, Celery Workers, MinIO, and Nginx.
  - GitHub Actions CI workflow (linting, type checks, unit tests, Docker build).
  - Mock API server (Prism / Mirage / stubs) initialized in Hour 2 so frontends can develop without blocking.
  - Automated Playwright E2E tests simulating:
    1. Online dose confirmation.
    2. Complete offline disconnect -> dose mark -> reconnect -> batch sync verification.
- **Dependencies & Boundary:** Unblocks all developers with local development containers and runs integration health checks.

---

## 3. Git Workflow & Collaboration Rules

### 3.1 Branching Strategy (Trunk-Based Development)
- **`main`:** Production-stable branch. All merges require automated CI pass and 1 peer review.
- **`feature/<member>-<feature-name>`:** Short-lived feature branches (lifespan < 8 hours).
  - Example: `feature/dev3-elderly-medicine-card`
  - Example: `feature/dev5-celery-rolling-generator`

### 3.2 Strict Contract-First Agreement
To avoid integration bottlenecks:
1. All request/response schemas in `docs/API_SPECIFICATION.md` are **FROZEN**.
2. If an engineer requires a schema alteration, they must propose it in the team chat and update `docs/API_SPECIFICATION.md` before changing code.
3. Dev 2 and Dev 3 use typed TypeScript interfaces mirroring the API contracts.

### 3.3 Commit Message Convention
Follow Conventional Commits:
- `feat(patient-pwa): add hindi voice synthesis for medicine card`
- `fix(backend): prevent duplicate dose generation on beat restart`
- `docs(api): add idempotency token specification to dose event`
