# DawaReminder — Comprehensive Testing & Quality Assurance Strategy

**Document Version:** 1.0.0  
**Testing Frameworks:** Pytest (Backend), Vitest + React Testing Library (Frontend), Playwright (E2E), Axe-Core (Accessibility)  
**Target Coverage:** >= 85% on critical healthcare state transitions  

---

## 1. Testing Pyramid Overview

```
                      / \
                     /   \
                    / E2E \       Playwright: Offline Sync & Caregiver Live Feed (10%)
                   /-------\
                  /  Integ  \     Testcontainers: FastAPI + PostgreSQL + Redis (30%)
                 /-----------\
                /    Unit     \   Pytest & Vitest: State Machine, Validation & UI (60%)
               /---------------\
```

---

## 2. Test Suites by Layer

### 2.1 Backend Unit & API Testing (Pytest + HTTPX)
- **Dose State Machine Test (`tests/unit/test_dose_state_machine.py`):**
  - Verify all valid transitions: `UPCOMING` -> `DUE` -> `TAKEN`.
  - Verify invalid transition rejection: `TAKEN` -> `UPCOMING` throws `409 Conflict`.
- **Idempotency Verification Test (`tests/api/test_idempotency.py`):**
  - Submit the identical `idempotency_token` twice within 100ms.
  - Verify: Database creates exactly 1 `dose_event` row; second request returns `200 OK` with existing confirmation data without double-counting.
- **Schedule Versioning Test (`tests/unit/test_schedule_versioning.py`):**
  - Update a schedule from 08:30 to 09:00.
  - Verify: Previous schedule version gains `effective_to = NOW()`; new schedule row created with `version = 2`; historical dose instances remain bound to version 1.
- **Timezone Calculation Test (`tests/unit/test_timezones.py`):**
  - Verify patient in `Asia/Kolkata` (+05:30) correctly computes morning 08:30 AM as `03:00:00 UTC`.

### 2.2 Frontend Unit & Accessibility Testing (Vitest + Testing Library + Axe-Core)
- **Signature Medicine Card Render Test (`frontend/tests/MedicineCard.test.tsx`):**
  - Renders medicine photograph, large name, and food instruction badge.
  - Verifies TAKEN button touch target has min 64px height.
  - Fires haptic vibrate call upon click.
- **Axe Accessibility Audit Test (`frontend/tests/a11y.test.tsx`):**
  - Injects `axe-core` into rendered Patient PWA Home Screen.
  - Asserts zero WCAG 2.2 AA violations (contrast ratio >= 7:1 for text, correct ARIA roles).
- **Hindi Localization Test (`frontend/tests/i18n.test.tsx`):**
  - Verifies that toggling language switches all copy to Devanagari script without layout truncation.

### 2.3 PWA Offline & Background Sync Testing (Playwright E2E)
This is the most critical test scenario for hackathon judges and production stability.

```python
# tests/e2e/test_offline_dose_sync.py
import pytest
from playwright.sync_api import Page, expect

def test_offline_dose_confirmation_and_sync(page: Page, context):
    # 1. Open Elderly Patient PWA
    page.goto("http://localhost:3000/patient")
    expect(page.get_by_text("GLYCOMET-GP 1/500")).to_be_visible()

    # 2. Simulate complete network disconnection
    context.set_offline(True)

    # 3. Confirm dose while offline
    taken_button = page.get_by_role("button", name="दवाई ले ली (TAKEN)")
    taken_button.click()

    # 4. Verify optimistic UI state & offline indicator
    expect(page.get_by_text("सुरक्षित किया गया (Saved Offline)")).to_be_visible()
    expect(page.get_by_text("ले ली गई")).to_be_visible()

    # 5. Restore network connectivity
    context.set_offline(False)

    # 6. Verify automatic sync completion
    expect(page.get_by_text("सब अपडेट है (All Synced)")).to_be_visible(timeout=5000)

    # 7. Open Caregiver Dashboard on second tab and verify real-time status
    caregiver_page = context.new_page()
    caregiver_page.goto("http://localhost:3000/dashboard")
    expect(caregiver_page.get_by_text("Glycomet-GP 1/500 - Taken")).to_be_visible()
```

---

## 3. Security & Multi-Tenant Authorization Tests

- **Cross-Patient Isolation Test:**
  - Authenticate as User A (Caregiver for Patient 1).
  - Attempt `GET /api/v1/patients/{patient_2_id}/doses/today`.
  - Assert HTTP `403 Forbidden` with RFC 7807 problem details.
- **Presigned URL Expiry Test:**
  - Request S3 upload URL.
  - Fast-forward clock by 11 minutes.
  - Attempt upload; assert S3 returns `403 RequestTimeTooSkewed` or `AccessDenied`.
- **Argon2id Verification:**
  - Verify dummy passwords take >= 80ms to hash, mitigating GPU brute force.

---

## 4. Continuous Integration Pipeline (GitHub Actions)

Located at `.github/workflows/ci.yml`:
1. **Lint & Static Analysis:** `flake8`, `mypy --strict`, `eslint`, `tsc --noEmit`.
2. **Backend Pytest Suite:** Spins up ephemeral PostgreSQL & Redis containers via GitHub Services.
3. **Frontend Vitest Suite:** Runs unit tests and accessibility audits.
4. **Playwright E2E Container Test:** Executes full offline sync scenarios in headless Chromium.
5. **Docker Build Validation:** Validates multi-stage Dockerfiles build clean images under 200MB.
