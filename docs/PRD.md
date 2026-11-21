# DawaReminder — Product Requirements Document (PRD)

**Document Version:** 1.0.0  
**Status:** Approved for Architecture & Implementation  
**Product Category:** Digital Health / Visual Medication Adherence PWA  
**Target Audience:** Elderly Patients (60+ years) & Family Caregivers  
**Regulatory & Compliance Scope:** Non-diagnostic, patient-reported adherence tracker; aligned with India Digital Personal Data Protection (DPDP) Act 2023.

---

## 1. Executive Summary & Problem Definition

In India and developing nations, millions of elderly individuals suffer from chronic co-morbidities (Type 2 Diabetes, Hypertension, Dyslipidemia, Ischemic Heart Disease) requiring complex polypharmacy—frequently 4 to 10 distinct tablets daily.

### The Problem Space
1. **Visual & Cognitive Barriers:** Aging leads to diminished visual acuity, mild cognitive impairment, and memory lapses. Strips from different pharmaceutical brands often look indistinguishable (e.g., silver foil strips with small red/black text).
2. **Ambiguous Prescription Schedules:** Handwritten prescriptions are notoriously illegible. Crucial instructions like *empty stomach (Before Food)* vs. *post-prandial (After Food)* get mixed up, leading to therapeutic failures or adverse drug events (such as hypoglycemia from sulfonylureas taken without food).
3. **Accidental Double-Dosing or Omission:** Elderly patients often forget whether they took their morning dose 20 minutes prior, resulting in hazardous double-dosing or anxiety-driven non-adherence.
4. **Caregiver Distance & Blind Spots:** Adult children living in different cities or working long hours cannot be physically present at meal times to confirm whether parents took their medication.
5. **App Inaccessibility:** Conventional medication apps require complex navigations, typing, login forms, notification permissions, and micro-interactions that elderly users struggle with.

### The Solution: DawaReminder
DawaReminder implements a dual-interface architecture governed by a singular philosophy:
> **"The family configures the medication routine. The elderly person simply follows it."**

The platform connects elderly patients to an intuitive, mobile-first Progressive Web Application (PWA) displaying high-resolution visual photographs of their actual medicine strips and tablets, combined with one-tap confirmation buttons and local voice readouts. Family members monitor routine adherence, receive unconfirmed dose alerts, and manage prescription records via a web dashboard.

---

## 2. Product Personas & Use Cases

### Persona 1: "Dadaji" (Ramashankar, 72 years) — The Elderly Patient
- **Profile:** Retired schoolteacher living in Lucknow. Diagnosed with Hypertension and Type 2 Diabetes. Uses an entry-level Android smartphone with WhatsApp. Has mild tremors and presbyopia; struggles with English UI and complex menus.
- **Pain Point:** Frequently confuses his morning BP pill (*Telmisartan 40mg*) with his evening cholesterol pill (*Atorvastatin 10mg*) because both come in identical-sized aluminium blister strips.
- **Desired Experience:** Taps one icon on his phone screen. Sees a crisp photo of his exact medicine strip. Hears a voice note in Hindi: *"रामशंकर जी, नाश्ते के बाद यह नीली और सफेद गोली पानी के साथ लें।"* Pressing one large green button marks it as taken.

### Persona 2: "Neha" (34 years) — The Primary Caregiver Daughter
- **Profile:** Software engineer residing in Bengaluru, 1,800 km away from her parents in Lucknow.
- **Pain Point:** Calls her father every morning to ask if he took his diabetes medicine. Feels persistent guilt and anxiety when calls go unanswered during office meetings.
- **Desired Experience:** Configures Dadaji's medication catalog on her laptop on Sunday. Snaps photos of the strips when visiting, or has local family upload them. Receives an automated alert at 10:00 AM only if Dadaji hasn't pressed the "TAKEN" button by 9:45 AM.

### Persona 3: "Sanjay" (42 years) — The Secondary Caregiver / Local Relative
- **Profile:** Ramashankar’s nephew living 5 km away.
- **Pain Point:** Steps in during emergencies or when Neha is travelling internationally, but does not know the exact dosage or brand names.
- **Desired Experience:** Granted "Caregiver" access with view-and-confirm permissions. Can see historical doses, check current medicine stocks, and receive escalated emergency calls directly from Dadaji’s PWA.

---

## 3. Product Principles & Non-Negotiables

| Principle | Concrete Application |
|---|---|
| **Zero-Typing for Elderly Users** | The patient interface requires zero keyboard input. Every interaction is single-tap (Taken, Skipped, Voice, Call Family). |
| **Visual First, Text Second** | Real photographic images of blister strips and tablets take visual precedence over brand names or chemical formulas. |
| **Patient-Reported Action Disclaimer** | Dose confirmations represent *user-reported logging*, not verified physiological ingestion. Clinically clear audit trails protect legal compliance. |
| **Resilient Offline Operation** | Network connectivity drops must never block an elderly patient from viewing today's medicines or recording a dose. Synchronization occurs automatically in the background. |
| **Fail-Safe Caregiver Escalation** | Caregivers are alerted only on exceptions (e.g., dose overdue by 45 minutes), eliminating notification fatigue. |

---

## 4. Feature Scope & Release Prioritization

```
+--------------------------------------------------------------------------------+
| P0: Core MVP (Hackathon Focus - 100% Reliable Core)                            |
| - Caregiver Auth & Patient Profile Management                                  |
| - Medicine Catalog with Photograph Uploads (Blister & Tablet)                  |
| - Flexible Scheduling (Morning, Afternoon, Evening, Night + Before/After Food) |
| - High-Contrast Elderly PWA Home Screen (Single-day view)                      |
| - Large-target "TAKEN" and "SKIPPED" dose confirmation                         |
| - Offline-first IndexedDB storage + Background Sync                            |
| - Caregiver Daily Dose Feed & Real-time Adherence Status                      |
+--------------------------------------------------------------------------------+
                                        |
+---------------------------------------v----------------------------------------+
| P1: Differentiators (Hackathon Final Presentation Impact)                      |
| - Dual Language Support (English + Hindi / Noto Sans Devanagari)               |
| - Web Speech API Voice Instructions in Hindi & English                         |
| - OCR-Assisted Prescription Ingestion (PaddleOCR/OpenCV with Human Verification)|
| - Web Push Notifications for Caregivers & Elderly Devices                      |
| - Weekly Adherence Percentage Ring & Trend Graphs                              |
| - Multi-Caregiver Access Delegation (Primary Owner + Secondary Caregiver)      |
+--------------------------------------------------------------------------------+
                                        |
+---------------------------------------v----------------------------------------+
| P2: Post-Hackathon / Commercial Expansion                                      |
| - Regional Languages (Tamil, Telugu, Bengali, Marathi, Gujarati)              |
| - WhatsApp Business API alerts for non-PWA users                               |
| - Smart Pillbox (BLE / IoT hardware integration)                               |
| - Local Pharmacy Refill Delivery API Integration                               |
| - Digital Health Locker (ABDM / Ayushman Bharat Digital Mission integration)   |
+--------------------------------------------------------------------------------+
```

---

## 5. Functional Requirements

### 5.1 Patient Management & Profile (Caregiver Domain)
- **FR-PAT-01:** Caregivers can register using email/password or phone number.
- **FR-PAT-02:** Caregivers can create multiple patient profiles under a single account (e.g., Mother, Father).
- **FR-PAT-03:** Each patient profile stores: Full Name, Preferred Language (en-IN, hi-IN), Date of Birth, Emergency Contact Phone Number, Primary Timezone (default: `Asia/Kolkata`), and Medical Notes.
- **FR-PAT-04:** Patient profiles generate a unique, non-guessable 8-character Patient Access Code (or secure QR code) allowing simple pairing on the elderly patient's smartphone without requiring passwords.

### 5.2 Medication & Schedule Configuration (Caregiver Domain)
- **FR-MED-01:** Caregiver can add medications with: Brand Name, Generic Composition, Form (Tablet, Capsule, Syrup, Injection, Drops), Strength (e.g., 500mg), and Storage Instructions.
- **FR-MED-02:** Photo Upload: High-resolution uploads for (a) Front of blister pack, (b) Back of blister pack showing label, (c) Physical pill/tablet appearance. Cropping and compression handled client-side before S3 storage.
- **FR-MED-03:** Schedule Types:
  - *Daily Routine:* Scheduled slots (Morning: 08:00, Afternoon: 13:00, Evening: 18:00, Night: 21:00).
  - *Specific Days:* E.g., Alternate days, specific days of week (Sunday & Thursday).
  - *Cyclic/Tapering:* Antibiotic 5-day course or tapering steroid doses.
- **FR-MED-04:** Food Dependency Instruction:
  - `BEFORE_FOOD` (30 mins before meal)
  - `WITH_FOOD` (During meal)
  - `AFTER_FOOD` (Immediately or 20 mins post meal)
  - `EMPTY_STOMACH` (First thing in morning)
  - `NO_RELATION` (Anytime)
- **FR-MED-05:** Versioning: Modifying a schedule archives the previous schedule version with an `effective_to` timestamp. Existing historical records remain linked to the version under which they were administered.

### 5.3 Elderly Patient Experience (Patient Domain)
- **FR-ELDER-01:** Zero-Authentication Daily Session: Opening the bookmarked PWA immediately launches the patient's personalized home screen using a locally encrypted hardware-tied token.
- **FR-ELDER-02:** Time-Window Segmentation: The screen dynamically filters and highlights the immediate current time slot (e.g., Morning between 06:00 and 11:59), while allowing scroll to later slots (Afternoon, Evening, Night).
- **FR-ELDER-03:** Visual Medicine Card:
  - High-definition medicine photograph (min 300x200px on mobile).
  - Large medicine name (min 22pt high-contrast bold).
  - Explicit food badge (e.g., Green plate icon with "खाने के बाद / After Food").
  - Dosage badge (e.g., "1 गोली / 1 Tablet").
  - Prominent Voice Instruction icon.
- **FR-ELDER-04:** One-Tap Taken Action:
  - Touch target >= 64px height.
  - Vibrates haptically (navigator.vibrate 150ms).
  - Displays instant celebratory green checkmark with positive feedback ("बहुत बढ़िया! दवाई ली गई").
- **FR-ELDER-05:** Explicit Skip Action:
  - Tapping "दवाई नहीं ली / Skipped" displays a polite, 2-option sheet: "तबीयत ठीक नहीं है / Feeling Unwell" or "दवाई खत्म हो गई / Out of Stock".
- **FR-ELDER-06:** Voice Readout:
  - Tapping speaker icon triggers Web Speech API synthesizing clear, slow speech in chosen language (Hindi/English).
- **FR-ELDER-07:** Emergency Call Button:
  - Persistent, fixed-bottom red phone button that launches a direct tel: URI to the primary caregiver's telephone number.

### 5.4 Caregiver Monitoring & Alerts
- **FR-ALERT-01:** Real-time Adherence Feed: Caregiver dashboard updates in real-time or via polling showing dose status (`TAKEN`, `SKIPPED`, `DUE`, `UNCONFIRMED`).
- **FR-ALERT-02:** Overdue Dose Escalation: If a dose remains unconfirmed 45 minutes past the scheduled window, background Celery workers dispatch a Web Push and SMS notification to the caregiver.
- **FR-ALERT-03:** Adherence Scorecard: Visual 7-day adherence circular progress gauge (e.g., 94% on-time adherence).

---

## 6. Non-Functional Requirements

### 6.1 Usability & Accessibility (WCAG 2.2 AA)
- **Color Contrast:** All body text maintains minimum 7:1 contrast ratio against `#F8FAF9`. Large buttons maintain 4.5:1 against button backgrounds.
- **Touch Ergonomics:** All interactive buttons have minimum touch bounding boxes of 56x56 CSS pixels with at least 16px spatial padding to prevent accidental fat-finger triggers.
- **Font Scaling:** Supports OS-level large text scaling up to 200% without clipping or layout breakage.
- **Screen Reader Support:** Complete ARIA semantics (`role="button"`, `aria-label`, `aria-live="polite"` for state updates).

### 6.2 Performance & Reliability
- **Core Web Vitals on 3G:**
  - Largest Contentful Paint (LCP) <= 2.2 seconds.
  - First Input Delay (FID) <= 80 milliseconds.
  - Cumulative Layout Shift (CLS) <= 0.02.
- **Cold Cache Size:** PWA asset bundle <= 850 KB gzip.
- **Sync Latency:** Under active connection, dose confirmation synced to backend within <= 1.2 seconds.

### 6.3 Security & Data Protection
- End-to-end HTTPS enforcement via TLS 1.3.
- Sensitive medical records (prescriptions, dosage history) encrypted at rest using AES-256-GCM.
- Strict adherence to Indian DPDP Act 2023: Caregiver serves as the legal guardian / authorized representative for data consent; patient data is exportable and erasable upon request.

---

## 7. Medical & Legal Safety Disclaimers
1. **Non-Diagnostic Tool:** DawaReminder is an administrative reminder aid, not a Medical Device (SaMD) as defined under the CDSCO or US FDA guidelines. It does not provide pharmacological clinical decision support, drug-drug interaction warnings, or diagnostic recommendations.
2. **Patient Confirmation Semantics:** The system records *affirmative logging by the user*. An entry marked `TAKEN` signifies that the patient or caregiver recorded the completion; the system makes no legal guarantee of biological absorption.
