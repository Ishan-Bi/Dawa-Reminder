# DawaReminder — System Architecture Document

**Document Version:** 1.0.0  
**Architectural Style:** Modular Monolith with Event-Driven Background Processing  
**Deployment Model:** Containerized (Docker Compose / Cloud Container Service)  

---

## 1. Architectural Strategy & Technology Rationale

DawaReminder adopts a **Modular Monolith** architecture instead of microservices. 

### Why Modular Monolith?
1. **Team Size & Velocity:** For a six-member engineering team working on an ambitious timeline, microservices introduce severe overhead (distributed transactions, network latency, multiple CI/CD pipelines, complex observability).
2. **Transactional Consistency:** Critical clinical adherence workflows—such as updating a medication schedule while archiving obsolete future dose instances—require ACID transactions across database tables.
3. **Operational Simplicity:** A single backend codebase with strict domain module boundaries (`auth`, `patients`, `medications`, `schedules`, `doses`, `notifications`, `ocr`) can be developed, tested, and deployed as a cohesive unit while remaining trivial to split into separate services in the future if scale warrants.

### Technology Stack Justification

| Layer | Chosen Technology | Engineering Rationale |
|---|---|---|
| **Frontend Framework** | **React 18 + Vite** | Instant HMR development speed, small bundle footprint, unmatched ecosystem for accessible UI components. |
| **Styling** | **Tailwind CSS** | Atomic utility styling allows strict adherence to design system tokens without CSS bloat; critical for PWA performance. |
| **PWA Engine** | **Workbox + Service Worker** | Industry standard for reliable offline asset caching and background synchronization strategies. |
| **Local Storage** | **IndexedDB (via `idb`)** | Transactional, structured client-side storage capable of holding multi-day schedules, base64 cached pill images, and offline dose event queues. |
| **Backend Framework**| **Python 3.11 + FastAPI** | High-performance asynchronous execution (Starlette/Uvicorn), automatic OpenAPI documentation, and native Pydantic v2 validation. |
| **ORM / Data Access**| **SQLAlchemy 2.0 (Async) + Alembic** | Modern async-await support, robust transaction management, complex queries, and enterprise-grade migrations. |
| **Primary Database** | **PostgreSQL 16** | Robust relational model, JSONB support for schedule rules, UUID primary keys, and ACID compliance for audit trails. |
| **Background Broker**| **Redis 7** | Sub-millisecond queue broker for Celery and high-speed in-memory cache for patient session tokens and rate limiting. |
| **Task Queue** | **Celery 5 + Celery Beat** | Battle-tested distributed task queue for recurring schedule generators, 45-minute overdue escalation monitors, and OCR ingestion. |
| **Object Storage** | **S3-Compatible (MinIO / AWS S3)** | Secure private object storage with presigned time-limited URLs for confidential prescription PDFs and medicine photos. |
| **OCR Engine** | **PaddleOCR / OpenCV** | High accuracy multilingual OCR with lightweight model footprints compared to heavy legacy tools. |

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client_Layer["Client Layer (PWA & Web)"]
        PWA["Elderly Patient PWA<br/>(Mobile React + Service Worker)"]
        DASH["Family Caregiver Dashboard<br/>(Desktop/Tablet React)"]
        SW["Service Worker<br/>(Workbox Cache Engine)"]
        IDB[("IndexedDB<br/>(Schedules, Photos & Queue)")]
        PWA <--> SW
        SW <--> IDB
    end

    subgraph Edge_Layer["Edge & Gateway Layer"]
        DNS["DNS / Cloudflare"]
        NGINX["Nginx Reverse Proxy & SSL Termination<br/>(Rate Limiting & Static Asset Server)"]
        DNS --> NGINX
        PWA -->|HTTPS / WSS| NGINX
        DASH -->|HTTPS / WSS| NGINX
    end

    subgraph Application_Layer["Application Layer (FastAPI Modular Monolith)"]
        API["FastAPI Application Server<br/>(Uvicorn ASGI)"]
        NGINX -->|Reverse Proxy /api/v1| API

        subgraph Modules["Domain Modules"]
            AUTH["Auth & Session Module<br/>(Argon2id + JWT Cookies)"]
            PAT["Patient & Caregiver Module"]
            MED["Medicine & Photo Module"]
            SCHED["Schedule & Versioning Engine"]
            DOSE["Dose Tracking & State Machine"]
            NOTIF["Notification Dispatcher"]
            OCR_MOD["OCR Prescription Ingestion"]
            AUDIT["Audit & Compliance Logger"]
        end

        API --> AUTH
        API --> PAT
        API --> MED
        API --> SCHED
        API --> DOSE
        API --> NOTIF
        API --> OCR_MOD
        API --> AUDIT
    end

    subgraph Background_Layer["Background Processing Layer"]
        REDIS[("Redis 7<br/>Broker & Cache")]
        BEAT["Celery Beat<br/>(Periodic Scheduler)"]
        WORKER["Celery Workers<br/>(Dose Generator & Escalation)"]
        OCR_WORKER["OCR Dedicated Worker<br/>(OpenCV + PaddleOCR)"]

        API -->|Enqueue Tasks| REDIS
        BEAT -->|Cron Triggers| REDIS
        REDIS --> WORKER
        REDIS --> OCR_WORKER
    end

    subgraph Data_Layer["Data & Storage Layer"]
        PG[("PostgreSQL 16<br/>Relational Database")]
        S3[("Private S3 Object Store<br/>(Prescriptions & Photos)")]

        API -->|Async SQLAlchemy| PG
        WORKER -->|Query / Write| PG
        MED -->|Presigned Upload/Fetch| S3
        OCR_WORKER -->|Fetch Raw Image| S3
    end

    subgraph External_Services["External Cloud Integrations"]
        FCM["Firebase Cloud Messaging<br/>& Web Push VAPID"]
        SMS_GW["SMS / WhatsApp Gateway<br/>(Twilio / Gupshup)"]

        WORKER --> FCM
        WORKER --> SMS_GW
    end
```

---

## 3. Data Flow Scenarios

### 3.1 Scenario A: Medicine Dose Confirmation Flow (Online & Offline)

```mermaid
sequenceDiagram
    autonumber
    actor Elder as Elderly Patient
    participant PWA as Patient PWA (UI)
    participant IDB as Local IndexedDB
    participant SW as Service Worker
    participant API as FastAPI Backend
    participant PG as PostgreSQL
    participant Worker as Celery Worker
    actor Caregiver as Family Caregiver

    Elder->>PWA: Taps "दवाई ले ली (TAKEN)"
    PWA->>PWA: Trigger Haptic (150ms) & Audio Chime
    PWA->>IDB: Update local status = TAKEN (Optimistic UI)
    PWA->>PWA: Show Celebration Toast ("बहुत बढ़िया!")

    alt Device is Online
        PWA->>API: POST /api/v1/doses/{id}/events (status: TAKEN, token, timestamp)
        API->>PG: Validate dose instance & record DoseEvent
        API->>PG: Transition DoseInstance state -> TAKEN
        API-->>PWA: 200 OK (Confirmed)
        API->>Worker: Enqueue "DoseTakenNotification"
        Worker->>Caregiver: Send Web Push / Update Dashboard Feed
    else Device is Offline
        PWA->>IDB: Push event to pending_sync_queue
        PWA->>PWA: Display "Saved Offline" gentle status
        Note over PWA, SW: Device regains connectivity (navigator.onLine = true)
        SW->>PWA: Fire sync event
        PWA->>IDB: Read all pending events
        PWA->>API: POST /api/v1/doses/batch-sync (idempotent array)
        API->>PG: Apply events in sequence, verify version consistency
        API-->>PWA: 200 OK (All synced)
        PWA->>IDB: Clear pending_sync_queue
        API->>Caregiver: Update Caregiver Dashboard with sync timestamp
    end
```

---

### 3.2 Scenario B: Prescription OCR Extraction & Human Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Caregiver as Family Caregiver
    participant Dash as Caregiver Dashboard
    participant API as FastAPI Backend
    participant S3 as S3 Object Store
    participant Celery as Celery Worker (OCR)
    actor VerifiedCaregiver as Caregiver Reviewer

    Caregiver->>Dash: Uploads prescription (PDF / JPEG)
    Dash->>API: POST /api/v1/prescriptions/upload-request
    API-->>Dash: Returns S3 Presigned Upload URL & prescription_id
    Dash->>S3: Uploads file directly (Client-side)
    Dash->>API: POST /api/v1/prescriptions/{id}/process-ocr
    API->>Celery: Enqueue `process_prescription_ocr(prescription_id)`
    API-->>Dash: 202 Accepted (Processing)

    Celery->>S3: Fetch prescription image
    Celery->>Celery: Image Preprocessing (Binarization, Deskewing, Noise Reduction)
    Celery->>Celery: PaddleOCR Text Extraction & NER Pattern Match
    Celery->>API: Store raw candidates in `prescriptions.extracted_data` (JSONB)
    Celery->>Dash: Notify OCR Complete via SSE or Polling

    VerifiedCaregiver->>Dash: Opens Split-Screen OCR Verification Screen
    Dash->>VerifiedCaregiver: Shows original image (left) + Extracted candidates (right)
    Note over VerifiedCaregiver: Caregiver reviews: Corrects "Telma 40" & dosage
    VerifiedCaregiver->>Dash: Clicks "Approve & Add to Catalog"
    Dash->>API: POST /api/v1/medications/batch-create (Approved items)
    API->>API: Create Medication records & update Prescription status to VERIFIED
```

---

## 4. Background Processing & Scheduling Architecture

### 4.1 Rolling 7-Day Window Generator
Rather than running expensive real-time calculation whenever a user opens the app, DawaReminder uses an active **Rolling Window Generation Strategy**.

- **Daily Beat Schedule (00:05 UTC):** A Celery Beat task triggers `generate_weekly_dose_instances()`.
- **Lookahead:** The worker inspects all active `MedicationSchedules`, computes instances for Day `T+7` across patient-specific timezones, and inserts corresponding records into `dose_instances`.
- **Unique Constraint Protection:** A compound PostgreSQL unique index `(schedule_id, patient_id, scheduled_for_utc)` guarantees that re-running the job is completely idempotent and will never produce duplicate doses.

### 4.2 Overdue Escalation Engine
- **Frequency:** Runs every 5 minutes (`check_overdue_doses()`).
- **Algorithm:**
  1. Queries all `dose_instances` where `status = 'DUE'` and `scheduled_for_utc < (NOW() - INTERVAL '45 MINUTES')`.
  2. For each overdue dose:
     - Check `notification_logs` to ensure an escalation has not already been fired for this dose.
     - Look up designated primary and secondary caregivers in `patient_access`.
     - Dispatch Web Push notification: *"अलर्ट: रामशंकर जी ने सुबह 08:30 बजे की ग्लाइकोमेट अभी तक नहीं ली है।"*
     - Transition dose status to `UNCONFIRMED`.
     - Log alert to `notification_logs`.
