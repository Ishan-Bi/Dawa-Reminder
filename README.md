# DawaReminder — Visual Medication Management & Reminder Platform

> **"The family configures the medication routine. The elderly person simply follows it."**

[![CI/CD Pipeline](https://github.com/dawareminder/dawareminder/actions/workflows/ci.yml/badge.svg)](https://github.com/dawareminder/dawareminder/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-success.svg)](docs/UI_UX.md)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](docs/SYSTEM_ARCHITECTURE.md)
[![React PWA](https://img.shields.io/badge/Frontend-React%2018%20PWA-61DAFB.svg)](docs/PWA_OFFLINE_ARCHITECTURE.md)

---

## 1. Product Overview

DawaReminder is a dual-interface digital healthcare platform designed to solve the critical challenge of polypharmacy non-adherence among elderly individuals in India. By connecting family caregivers with an ultra-accessible, mobile-first Progressive Web Application (PWA), elderly patients identify their prescribed medicines through **actual high-resolution photographs of blister strips and tablets**, hear local voice instructions (Hindi/English), and confirm doses with a single 68px **TAKEN** button.

### Key Capabilities
- **Elderly-First Ergonomics:** 64px+ touch targets, zero typing, high-contrast (#167C53) theme, Devanagari typography, and haptic confirmations.
- **Offline Resilience:** Seamless IndexedDB caching and Workbox Service Worker engine allows full operation without Wi-Fi or cellular data; offline doses automatically batch-synchronize when reconnected.
- **Caregiver Command Center:** Real-time dose confirmation feed, 7-day adherence circular analytics, multi-caregiver access, and 45-minute overdue escalation push notifications.
- **Assisted Prescription Ingestion:** Caregiver prescription uploads processed via PaddleOCR/OpenCV with split-screen human verification.

---

## 2. Comprehensive Architectural Documentation

The project includes an exhaustive, production-grade architectural specification:

| Document | Description |
|---|---|
| [**docs/PRD.md**](docs/PRD.md) | Product Requirements Document: Personas, functional/non-functional requirements, P0/P1/P2 scopes, clinical disclaimers. |
| [**docs/UI_UX.md**](docs/UI_UX.md) | Design System: Color tokens, typography scales, touch ergonomics, 17 Family screens & 12 Patient screens. |
| [**docs/SYSTEM_ARCHITECTURE.md**](docs/SYSTEM_ARCHITECTURE.md) | High-Level Architecture: Modular monolith, Mermaid system diagrams, data flow sequences, and background worker model. |
| [**docs/DATABASE_DESIGN.md**](docs/DATABASE_DESIGN.md) | PostgreSQL 16 Schema: 11 normalized tables, UUID PKs, versioned schedules, append-only dose events, and Mermaid ER diagram. |
| [**docs/API_SPECIFICATION.md**](docs/API_SPECIFICATION.md) | REST API Contracts (`/api/v1`): Request/Response schemas, RFC 7807 error handling, and batch sync specifications. |
| [**docs/PWA_OFFLINE_ARCHITECTURE.md**](docs/PWA_OFFLINE_ARCHITECTURE.md) | PWA & Offline Engine: Workbox caching strategies, IndexedDB schema, sync manager, and conflict resolution rules. |
| [**docs/SECURITY_AND_PRIVACY.md**](docs/SECURITY_AND_PRIVACY.md) | Security & DPDP Compliance: Argon2id, HttpOnly session cookies, S3 presigned URLs, and health data governance. |
| [**docs/DEVELOPMENT_ROADMAP.md**](docs/DEVELOPMENT_ROADMAP.md) | 48-Hour Hackathon Sprint Plan: Hour-by-hour milestones, jury demo preparation, and post-hackathon roadmap. |
| [**docs/TEAM_RESPONSIBILITIES.md**](docs/TEAM_RESPONSIBILITIES.md) | 6-Member Team Structure: Ownership boundaries, deliverables, dependencies, and trunk-based Git workflow. |
| [**docs/TESTING_STRATEGY.md**](docs/TESTING_STRATEGY.md) | QA Strategy: Pytest, Vitest, Playwright E2E offline sync testing, axe-core WCAG audits, and CI/CD. |

---

## 3. Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Workbox 7, `idb` (IndexedDB).
- **Backend:** Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), Alembic.
- **Data & Cache:** PostgreSQL 16, Redis 7.
- **Workers & Tasks:** Celery 5, Celery Beat.
- **Storage:** S3-Compatible Object Store (MinIO / AWS S3).
- **Edge & DevOps:** Docker, Docker Compose, Nginx, GitHub Actions.

---

## 4. Quickstart (Local Development with Docker)

### Prerequisites
- Docker Engine 24+ & Docker Compose v2+
- Git

### 1. Clone & Configure
```bash
git clone https://github.com/dawareminder/dawareminder.git
cd dawareminder
cp .env.example .env
```

### 2. Start Full Stack
```bash
docker compose up --build
```

### 3. Service Access Endpoints
- **Caregiver Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Elderly Patient PWA:** [http://localhost:3000/patient](http://localhost:3000/patient)
- **FastAPI Interactive Docs (Swagger):** [http://localhost/docs](http://localhost/docs)
- **MinIO Object Storage Console:** [http://localhost:9001](http://localhost:9001) (User: `dawa_minio_admin` / Pass: `dawa_minio_secret_key_123`)

---

## 5. Six-Member Engineering Team Allocation

1. **Dev 1 (Product & UI/UX):** PRD, Figma design tokens, WCAG 2.2 AA audit, jury presentation.
2. **Dev 2 (Family Dashboard):** React web app, medicine catalog, schedule builder, adherence charts.
3. **Dev 3 (Patient PWA):** Mobile PWA, Signature Medicine Card, Workbox SW, IndexedDB, Hindi voice readout.
4. **Dev 4 (Backend & DB):** FastAPI core, PostgreSQL schemas, Alembic migrations, Auth, batch-sync resolution.
5. **Dev 5 (Scheduling & OCR):** Celery Beat rolling 7-day generator, 45-min overdue escalation, PaddleOCR pipeline.
6. **Dev 6 (DevOps & QA):** Docker Compose, Nginx gateway, MinIO S3, Playwright E2E offline sync tests.

---

## 6. License & Medical Disclaimer
Licensed under the **MIT License**.  
*Disclaimer: DawaReminder is an administrative medication adherence reminder tool. It does not provide medical diagnosis, clinical decision support, or guaranteed confirmation of biological drug ingestion.*
