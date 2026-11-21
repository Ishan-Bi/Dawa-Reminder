# DawaReminder — UI/UX Design System & Screen Specifications

**Document Version:** 1.0.0  
**Design Philosophy:** "Calm Healthcare, Zero Friction, Elder-First Ergonomics"  
**Target Accessibility:** WCAG 2.2 Level AA / AAA where applicable  

---

## 1. Visual Design System

### 1.1 Color Palette
DawaReminder avoids cold, clinical hospital blues or stark clinical whites. It embraces an organic, reassuring botanical green palette designed to evoke vitality, calm, and clarity.

| Semantic Token | HEX Code | Tailwind Class | Contrast against `#F8FAF9` | Usage Context |
|---|---|---|---|---|
| **Primary Green** | `#167C53` | `bg-emerald-800` / `text-emerald-800` | 8.4:1 (Pass AAA) | Primary CTAs, Header Branding, Active Navigation |
| **Soft Sage Green** | `#E9F5EF` | `bg-emerald-50` | 1.1:1 | Card Backgrounds, Pill container badges, Subtle borders |
| **Deep Forest Green** | `#0D4E34` | `text-emerald-950` | 13.8:1 (Pass AAA) | Primary headings, Dose confirmation text |
| **App Background** | `#F8FAF9` | `bg-slate-50` | Base Surface | Neutral, warm canvas reducing glare on OLED/LCD screens |
| **Surface Card** | `#FFFFFF` | `bg-white` | Base Card | Elevated medication cards, modal sheets |
| **Text Primary** | `#202824` | `text-slate-900` | 14.1:1 (Pass AAA) | Medicine names, critical instructions, headers |
| **Text Muted** | `#5C6863` | `text-slate-600` | 5.8:1 (Pass AA) | Timestamps, secondary metadata, subtext |
| **Food Indicator (Amber)** | `#FFF4D6` / `#B45309` | `bg-amber-50` / `text-amber-800` | 6.2:1 (Pass AA) | Before Food alert badges |
| **Food Indicator (Green)** | `#E6F9F0` / `#0E6245` | `bg-emerald-50` / `text-emerald-800`| 7.8:1 (Pass AAA) | After Food reassurance badges |
| **Warning / Overdue** | `#FEEFE6` / `#C2410C` | `bg-orange-50` / `text-orange-700`| 5.9:1 (Pass AA) | Overdue dose warning card border |
| **Error / Skipped** | `#FDE8E7` / `#B91C1C` | `bg-red-50` / `text-red-700` | 6.9:1 (Pass AA) | Skipped status, Emergency buttons, validation |

---

### 1.2 Typography & Dual-Script Hierarchy
- **Latin Script Font:** `Inter`, system-ui, -apple-system, BlinkMacSystemFont, sans-serif.
- **Devanagari Font:** `Noto Sans Devanagari`, sans-serif.
- **Fallback Stack:** `Roboto`, Arial, sans-serif.

#### Type Scale Specifications
- **Elderly Display Title:** `32px` (2rem), Line Height: `40px`, Weight: `800` (Extra Bold). High readability for time slots (e.g., "सुबह की दवाई / Morning Medicines").
- **Elderly Medicine Title:** `24px` (1.5rem), Line Height: `32px`, Weight: `700` (Bold).
- **Elderly Instruction Badge:** `18px` (1.125rem), Line Height: `24px`, Weight: `600` (Semi-bold).
- **Elderly Button Text:** `20px` (1.25rem), Line Height: `28px`, Weight: `700` (Bold), Uppercase tracking.
- **Caregiver Dashboard Heading 1:** `28px`, Weight: `700`.
- **Caregiver Dashboard Body:** `15px`, Line Height: `22px`, Weight: `400` / `500`.
- **Caregiver Dashboard Microcopy:** `13px`, Line Height: `18px`, Weight: `500`.

---

### 1.3 Physical Ergonomics & Elderly Touch Target Standards
1. **Minimum Touch Surface:** Every primary interactive element on the Patient PWA adheres to a minimum 64px vertical height (exceeding WCAG 2.2 44x44px requirements).
2. **Thumb Zone Architecture:** The most critical action on every card—the **"दवाई ले ली (TAKEN)"** button—is located within natural one-handed thumb sweep (lower 50% of the viewport).
3. **Generous Touch Separation:** 16px to 24px physical margin between the primary `TAKEN` and secondary `SKIPPED` triggers to eliminate mis-taps caused by hand tremors.
4. **Haptic & Audio Confirmation:** Every successful tap emits a 150ms soft haptic vibration (`navigator.vibrate(150)`) and a pleasant 440Hz harmonic chime.

---

## 2. Elderly Patient Interface: Core Screen Layouts (Mobile PWA)

### 2.1 The Signature Medicine Card Specification
This card is the focal point of the entire application. When an elderly user opens the app, this card tells them *who*, *what*, *when*, and *how* within 3 seconds.

```
+-------------------------------------------------------------------+
|  [ TIME SLOT BADGE: 08:30 AM  *  सुबह की दवाई (Morning) ]          |
|                                                                   |
|  +-------------------------------------------------------------+  |
|  |                                                             |  |
|  |           ACTUAL PHOTOGRAPH OF MEDICINE STRIP               |  |
|  |         [High Resolution, Front View of Blister Pack]       |  |
|  |            e.g., Glycomet-GP 1/500 (White & Green foil)     |  |
|  |                                                             |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
|   GLYCOMET-GP 1/500                                  [ (()) VOICE ]|
|   ग्लाइकोमेट-जीपी 1/500                                 SPEAKER   |
|                                                                   |
|   +--------------------------+   +----------------------------+   |
|   |  FOOD INSTRUCTION BADGE  |   |    DOSE QUANTITY BADGE     |   |
|   |  [plate icon] नाश्ते के बाद |   |    [pill icon] 1 पूरी गोली  |   |
|   |  (After Breakfast)       |   |    (1 Full Tablet)         |   |
|   +--------------------------+   +----------------------------+   |
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |                                                           |   |
|   |             [check icon] दवाई ले ली (TAKEN)               |   |
|   |       (Height: 68px | Solid Primary Green #167C53)       |   |
|   |                                                           |   |
|   +-----------------------------------------------------------+   |
|                                                                   |
|               [x] अभी नहीं ली / छोड़ दी (Skip Dose)               |
+-------------------------------------------------------------------+
```

---

### 2.2 Elderly Patient Screens Specification (12 Screens)

#### Screen P01: Welcome & Auto-Pairing Screen
- **Purpose:** Seamless first-time onboarding without login credentials.
- **Components:** Warm greeting illustration, simple 6-digit PIN input or "Scan Family QR Code" button. Once paired, token is written to IndexedDB / localStorage permanently.

#### Screen P02: Language Selection Screen
- **Purpose:** Let the patient select their preferred regional tongue with huge visual language cards.
- **Cards:** "हिंदी (Hindi)" with Devanagari script, "English", "मराठी (Marathi)", "ગુજરાતી (Gujarati)". Single tap saves preference and immediately translates the UI.

#### Screen P03: Patient Home Screen (Daily Routine Hub)
- **Header:** Date in Hindi (e.g., *रविवार, 22 नवंबर*), Patient photo/name, Language Switcher toggle (`हि / En`).
- **Slot Tabs (Time segments):**
  - **सुबह (Morning - 06:00 to 11:59):** Active/Highlighted. Shows pill count: "3 दवाइयां".
  - **दोपहर (Afternoon - 12:00 to 16:59):** "1 दवाई".
  - **शाम (Evening - 17:00 to 20:59):** "2 दवाइयां".
  - **रात (Night - 21:00 onwards):** "2 दवाइयां".
- **Floating Emergency Button:** Lower right red telephone badge (`नेहा को कॉल करें / Call Neha`).

#### Screen P04: Today's Medication Feed
- **Behavior:** Vertically scrollable list of Signature Medicine Cards for the active slot.
- **Card States:**
  - `DUE`: Highlighted border, active green TAKEN button.
  - `TAKEN`: Dimmed opacity 80%, card turns soft green with stamped green checkmark ("ले ली गई - 08:34 AM"). Button replaced with "वापस बदलें / Undo" link.
  - `SKIPPED`: Card marked with neutral grey badge ("छोड़ दी - तबीयत ठीक नहीं थी").

#### Screen P05: Medicine Detail & Zoom Screen
- **Purpose:** Accessible when tapping the medicine photo.
- **Content:** Full-screen zoomable photo viewer with pinch-to-zoom. Toggle button between:
  1. Front of Strip.
  2. Back of Strip (Expiry & Brand details).
  3. Actual Unwrapped Tablet on a clean spoon.

#### Screen P06: Voice Instruction Playback
- **Trigger:** Tapping the circular Speaker icon on any medicine card.
- **Behavior:** Card enters active audio state with gentle soundwave animation. Synthesizes or plays recorded family audio:
  > *"रामशंकर जी, नाश्ते के बाद यह नीली और सफेद पट्टी वाली गोली एक कप पानी के साथ लें।"*
- Large button: "दोबारा सुनें (Listen Again)" and "बंद करें (Stop)".

#### Screen P07: Taken Confirmation Toast & Celebration
- **Visuals:** Full-width celebration banner slides up from bottom:
  - Big animated green tick.
  - Message: *"शाबाश! आपने आज सुबह की दवाई समय पर ले ली।"*
  - Caregiver notification status: *"नेहा को सूचना भेज दी गई है।"*
  - Auto-dismisses in 3 seconds or on backdrop tap.

#### Screen P08: Skipped Dose Dialog Sheet
- **Purpose:** Non-judgmental, compassionate reason logging.
- **Options (Large 54px buttons):**
  1. *"तबीयत ठीक नहीं लग रही (Feeling unwell / Nausea)"*
  2. *"दवाई खत्म हो गई है (Medicine out of stock)"*
  3. *"डॉक्टर ने मना किया (Doctor advised to pause)"*
  4. *"गलती से दब गया (Cancel / Pressed by mistake)"*

#### Screen P09: Daily History Screen
- **Summary:** Simple calendar strip for past 7 days.
- **Days:** Green circle for 100% completed days, Yellow circle for partially skipped days.
- Reassuring summary statement: *"इस हफ्ते आपने 95% दवाइयां सही समय पर ली हैं।"*

#### Screen P10: Call Family / Help Screen
- **Purpose:** One-touch contact with designated caregivers.
- **Content:** Large photo cards of caregivers:
  - Card 1: Neha (Daughter - Primary) -> Huge green button: *"नेहा को कॉल करें"*
  - Card 2: Sanjay (Local Nephew) -> Huge green button: *"संजय को कॉल करें"*
  - Direct trigger to phone dialer via `tel:+919876543210`.

#### Screen P11: Offline Mode Banner
- **Trigger:** Browser `navigator.onLine === false`.
- **UI:** A persistent gentle amber banner at the top:
  - *"इंटरनेट बंद है — आप दवाई ले सकते हैं, इंटरनेट आने पर नेहा को पता चल जाएगा।"*
  - Buttons continue working seamlessly; IndexedDB saves the event.

#### Screen P12: Synchronization Status Indicator
- **UI:** Small spinning sync icon at top right. When synced: Soft checkmark *"सब अपडेट है (All Synced)"*.

---

## 3. Family/Caregiver Dashboard: Screen Specifications (17 Screens)

The Caregiver Dashboard is optimized for Desktop and Tablet, with a responsive layout for mobile browsers.

```
+-------------------------------------------------------------------------------+
|  DAWAREMINDER CAREGIVER    [Patients v]   [Alerts (2)]    [Dr. Sharma Setup]  |
+-------------------------------------------------------------------------------+
|  PATIENT: Ramashankar (Father) | 72 Yrs | Lucknow | Today's Adherence: 100%   |
+-------------------------------------------------------------------------------+
|  [Overview]  [Medications (8)]  [Schedules]  [Dose History]  [Caregivers (2)] |
+-------------------------------------------------------------------------------+
|  +---------------------------+  +------------------------------------------+  |
|  | TODAY'S TIMELINE (4 SLOTS)|  | RECENT DOSE CONFIRMATIONS                |  |
|  | - Morning (08:30): DONE   |  | 08:34 AM - Glycomet-GP 1/500 (Taken)     |  |
|  | - Afternoon (13:30): DUE  |  | 08:35 AM - Telma 40 (Taken)              |  |
|  | - Evening (18:30): UPCOMING|  | 08:35 AM - Ecosprin 75 (Taken)           |  |
|  | - Night (21:30): UPCOMING |  |------------------------------------------|  |
|  +---------------------------+  | CRITICAL ALERTS                          |  |
|                                 | [!] Ecosprin 75 running low (4 tabs left)|  |
|                                 +------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### 3.1 Family Dashboard Screens (17 Screens Breakdown)

1. **F01 Landing Page & Value Proposition:** Highlighting elderly visual adherence, family peace of mind, testimonials, and "Start Free" CTA.
2. **F02 Registration & Login:** Email/Password, Google OAuth, OTP login; remembers sessions with secure cookies.
3. **F03 Main Dashboard (Command Center):** Aggregated summary across all dependent patients. Health status cards, adherence score rings, unconfirmed dose badges.
4. **F04 Patient Management:** List of all monitored elderly family members with quick switch controls.
5. **F05 Add Patient Wizard:** Multi-step modal (Basic info -> Timezone -> Language preference -> Emergency phone -> Generate pairing code/QR).
6. **F06 Patient Profile & Clinical Summary:** Contact information, primary physician details, pharmacy contact, allergy list, caregiver permissions.
7. **F07 Medicine Management (Master Catalog):** Grid of all active medications with real strip photos, stock quantities, and dosage formulations.
8. **F08 Add Medicine Wizard (3-Step):**
   - Step 1: Drug Name (with autocompletion for top 2,000 Indian formulations), Strength, Form.
   - Step 2: High-resolution photo upload with client-side crop tool (Front strip, Back strip, Loose pill).
   - Step 3: Food dependency and instructions.
9. **F09 Edit Medicine:** Update brand substitution, change packaging photo after pharmacy brand change, update strengths.
10. **F10 Medicine Photograph Upload & Inspection:** Drag-and-drop crop utility with guideline overlays ensuring medicine name and color foil are framed properly.
11. **F11 Prescription Upload & OCR Review:** PDF/JPEG upload interface with split-screen view: Original prescription on left, OCR extracted drug candidates on right with "Accept & Add" buttons.
12. **F12 Medication Schedule Editor:** Interactive timeline builder. Assign medications to Morning/Afternoon/Evening/Night slots with custom minute offsets, food relation toggles, and start/end dates.
13. **F13 Dose History & Audit Log:** Comprehensive calendar table with exact confirmation timestamps, reporting IP/device, latency between due time and taken time.
14. **F14 Adherence Analytics:** 7-day, 30-day, and 90-day graphical adherence curves, on-time percentage, skip reason breakdown bar charts.
15. **F15 Caregiver Management:** Invite family members (siblings, spouse, local attendants). Assign roles (`PRIMARY_OWNER`, `CAREGIVER`, `VIEWER`).
16. **F16 Notification Settings:** Configurable escalation rules (e.g., "Alert me via Web Push if morning dose is unconfirmed by 09:30 AM", "Send SMS for night doses").
17. **F17 User Profile & Security:** Account credentials, session management, active devices list, data export (JSON/CSV) under DPDP Act, and account deletion.

---

## 4. Design-to-Code Responsive Breakpoints

| Breakpoint | Target Devices | UI Adaptation |
|---|---|---|
| `< 640px` (sm) | Smartphones (Patient PWA & Mobile Caregiver) | Single column layout, full-width cards, fixed bottom action bar, 64px button heights. |
| `640px - 1024px` (md) | Tablets & Foldables (e.g., iPad, Galaxy Tab) | Two-column grid, persistent sidebar navigation for caregivers, scaled-up card fonts for elderly tablet users. |
| `> 1024px` (lg/xl) | Desktop Laptops & Monitors (Caregivers) | Multi-column dashboard with side-by-side timeline, adherence charts, and medicine catalog preview. |
