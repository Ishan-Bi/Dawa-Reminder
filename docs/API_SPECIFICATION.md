# DawaReminder — REST API Specification

**Document Version:** 1.0.0  
**Base Path:** `/api/v1`  
**Data Interchange:** JSON (`application/json`)  
**Standard Errors:** RFC 7807 Problem Details  
**Authentication Mechanisms:**
1. **Caregiver Dashboard:** Secure HttpOnly Session Cookie or `Authorization: Bearer <jwt_token>`
2. **Elderly Patient PWA:** Device Token Header: `X-Patient-Device-Token: <encrypted_token>`

---

## 1. Global Standards & Error Format

All error responses strictly adhere to **RFC 7807 (Problem Details for HTTP APIs)**:
```json
{
  "type": "https://dawareminder.in/errors/dose-already-confirmed",
  "title": "Dose Conflict",
  "status": 409,
  "detail": "Dose instance 3fa85f64-5717-4562-b3fc-2c963f66afa6 was already recorded as TAKEN at 2026-11-22T08:34:10Z.",
  "instance": "/api/v1/doses/3fa85f64-5717-4562-b3fc-2c963f66afa6/events",
  "code": "DOSE_ALREADY_CONFIRMED"
}
```

---

## 2. API Endpoint Matrix

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| **POST** | `/auth/register` | Public | Register new caregiver account |
| **POST** | `/auth/login` | Public | Authenticate caregiver (sets HttpOnly cookie) |
| **POST** | `/auth/logout` | Caregiver | Invalidate session / cookie |
| **POST** | `/patients/pair` | Public | Pair elderly device using 6-character code |
| **GET** | `/patients` | Caregiver | List all patients accessible to caregiver |
| **POST** | `/patients` | Caregiver | Create new elderly patient profile |
| **GET** | `/patients/{id}` | Caregiver / Patient | Get patient profile details |
| **PATCH** | `/patients/{id}` | Caregiver | Update patient profile |
| **GET** | `/patients/{id}/caregivers` | Caregiver | List caregivers assigned to patient |
| **POST** | `/patients/{id}/caregivers` | Caregiver (Owner) | Invite / assign new caregiver |
| **GET** | `/patients/{id}/medications` | Caregiver / Patient | List medications for patient |
| **POST** | `/patients/{id}/medications` | Caregiver | Create new medication entry |
| **PATCH** | `/medications/{id}` | Caregiver | Update medication details/photo |
| **POST** | `/prescriptions/upload-request`| Caregiver | Request presigned S3 upload URL |
| **POST** | `/prescriptions/{id}/process-ocr` | Caregiver | Enqueue background OCR extraction |
| **GET** | `/prescriptions/{id}` | Caregiver | Get prescription details & OCR output |
| **GET** | `/patients/{id}/schedules` | Caregiver / Patient | List active schedules |
| **POST** | `/patients/{id}/schedules` | Caregiver | Create new medication schedule |
| **PUT** | `/schedules/{id}` | Caregiver | Update schedule (creates new version) |
| **GET** | `/patients/{id}/doses/today`| Caregiver / Patient | Get current day's doses by slot |
| **POST** | `/doses/{id}/events` | Caregiver / Patient | Confirm taken or report skipped |
| **POST** | `/doses/batch-sync` | Patient Device | Offline synchronization batch submission |
| **GET** | `/patients/{id}/analytics` | Caregiver | Get 7/30-day adherence report |
| **POST** | `/notifications/subscribe` | Caregiver / Patient | Register Web Push subscription |

---

## 3. Detailed Request & Response Schemas

### 3.1 Patient Pairing & Device Token
#### `POST /api/v1/patients/pair`
Allows an elderly patient PWA to pair with their family profile via a one-time code without typing an email or password.
- **Request:**
```json
{
  "pairing_code": "DAWA72",
  "device_name": "Samsung Galaxy M14 (Dadaji)",
  "device_fingerprint": "a9f8c47b92e102834b..."
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "patient": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "full_name": "Ramashankar Shukla",
    "primary_language": "hi-IN",
    "iana_timezone": "Asia/Kolkata",
    "emergency_contact_phone": "+919876543210",
    "emergency_contact_name": "Neha (Daughter)"
  },
  "device_token": "eyJhGciOiJIUzI1NiIsIn...",
  "expires_in_days": 365
}
```

---

### 3.2 Today's Medication Routine (Elderly View)
#### `GET /api/v1/patients/{id}/doses/today`
Returns time-slotted dose cards populated with photo URLs and localized instructions.
- **Response (200 OK):**
```json
{
  "patient_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "date": "2026-11-22",
  "timezone": "Asia/Kolkata",
  "active_slot": "MORNING",
  "slots": {
    "MORNING": {
      "slot_label_en": "Morning Routine",
      "slot_label_hi": "सुबह की दवाई",
      "target_time": "08:30:00",
      "doses": [
        {
          "dose_instance_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "medication_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "brand_name": "Glycomet-GP 1/500",
          "generic_name": "Glimepiride (1mg) + Metformin (500mg)",
          "dosage_display": "1 Tablet (1 पूरी गोली)",
          "food_relation": "AFTER_FOOD",
          "food_relation_display_en": "After Breakfast",
          "food_relation_display_hi": "नाश्ते के बाद",
          "status": "DUE",
          "photos": {
            "strip_front": "https://storage.dawareminder.in/meds/glycomet_front.webp",
            "strip_back": "https://storage.dawareminder.in/meds/glycomet_back.webp",
            "tablet": "https://storage.dawareminder.in/meds/glycomet_tablet.webp"
          },
          "voice_instruction_hi": "नाश्ते के बाद यह नीली और सफेद पट्टी वाली एक गोली पानी के साथ लें।",
          "voice_instruction_en": "Take one tablet of Glycomet with water after breakfast.",
          "scheduled_for_utc": "2026-11-22T03:00:00Z"
        },
        {
          "dose_instance_id": "18c24590-bdf1-4a12-8e3b-d5333f024db1",
          "medication_id": "5e138a0b-19bf-45ce-8c38-89c0800ebbf6",
          "brand_name": "Telma 40",
          "generic_name": "Telmisartan (40mg)",
          "dosage_display": "1 Tablet (1 पूरी गोली)",
          "food_relation": "AFTER_FOOD",
          "food_relation_display_en": "After Breakfast",
          "food_relation_display_hi": "नाश्ते के बाद",
          "status": "DUE",
          "photos": {
            "strip_front": "https://storage.dawareminder.in/meds/telma40_front.webp",
            "tablet": "https://storage.dawareminder.in/meds/telma40_tablet.webp"
          },
          "voice_instruction_hi": "नाश्ते के बाद बीपी की यह लाल गोली लें।",
          "scheduled_for_utc": "2026-11-22T03:00:00Z"
        }
      ]
    },
    "AFTERNOON": {
      "slot_label_en": "Afternoon Routine",
      "slot_label_hi": "दोपहर की दवाई",
      "target_time": "13:30:00",
      "doses": []
    },
    "EVENING": {
      "slot_label_en": "Evening Routine",
      "slot_label_hi": "शाम की दवाई",
      "target_time": "18:30:00",
      "doses": []
    },
    "NIGHT": {
      "slot_label_en": "Night Routine",
      "slot_label_hi": "रात की दवाई",
      "target_time": "21:30:00",
      "doses": []
    }
  }
}
```

---

### 3.3 Dose Confirmation (Taken / Skipped)
#### `POST /api/v1/doses/{id}/events`
- **Headers:**
  - `Idempotency-Key: 7b8979bb-3652-4e8c-859a-dfca3206fbcd`
- **Request Body:**
```json
{
  "event_type": "MARKED_TAKEN",
  "event_timestamp_device": "2026-11-22T08:34:10+05:30",
  "idempotency_token": "7b8979bb-3652-4e8c-859a-dfca3206fbcd",
  "is_offline_synced": false
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "dose_instance_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "current_status": "TAKEN",
  "confirmed_at_server": "2026-11-22T03:04:12Z",
  "celebration_message_hi": "शाबाश! आपने आज सुबह की दवाई समय पर ले ली।"
}
```

---

### 3.4 Offline Batch Synchronization
#### `POST /api/v1/doses/batch-sync`
Used when an offline device regains connectivity to submit queued events.
- **Request Body:**
```json
{
  "patient_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "events": [
    {
      "dose_instance_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "event_type": "MARKED_TAKEN",
      "skip_reason": null,
      "event_timestamp_device": "2026-11-22T08:34:10+05:30",
      "idempotency_token": "7b8979bb-3652-4e8c-859a-dfca3206fbcd"
    },
    {
      "dose_instance_id": "18c24590-bdf1-4a12-8e3b-d5333f024db1",
      "event_type": "MARKED_TAKEN",
      "skip_reason": null,
      "event_timestamp_device": "2026-11-22T08:35:02+05:30",
      "idempotency_token": "90e4f513-887e-4b47-ba21-1ce668589c31"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "processed": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "idempotency_token": "7b8979bb-3652-4e8c-859a-dfca3206fbcd",
      "status": "ACCEPTED",
      "current_status": "TAKEN"
    },
    {
      "idempotency_token": "90e4f513-887e-4b47-ba21-1ce668589c31",
      "status": "ACCEPTED",
      "current_status": "TAKEN"
    }
  ]
}
```

---

### 3.5 Adherence Analytics (Caregiver View)
#### `GET /api/v1/patients/{id}/analytics?period=7d`
- **Response (200 OK):**
```json
{
  "patient_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "period": "7d",
  "adherence_percentage": 94.2,
  "total_scheduled_doses": 42,
  "taken_on_time": 38,
  "taken_delayed": 2,
  "skipped": 2,
  "unconfirmed": 0,
  "daily_breakdown": [
    { "date": "2026-11-16", "scheduled": 6, "taken": 6, "skipped": 0, "score": 100 },
    { "date": "2026-11-17", "scheduled": 6, "taken": 6, "skipped": 0, "score": 100 },
    { "date": "2026-11-18", "scheduled": 6, "taken": 5, "skipped": 1, "score": 83 },
    { "date": "2026-11-19", "scheduled": 6, "taken": 6, "skipped": 0, "score": 100 },
    { "date": "2026-11-20", "scheduled": 6, "taken": 6, "skipped": 0, "score": 100 },
    { "date": "2026-11-21", "scheduled": 6, "taken": 5, "skipped": 1, "score": 83 },
    { "date": "2026-11-22", "scheduled": 6, "taken": 6, "skipped": 0, "score": 100 }
  ],
  "skip_reasons": {
    "FEELING_UNWELL": 1,
    "OUT_OF_STOCK": 1
  }
}
```
