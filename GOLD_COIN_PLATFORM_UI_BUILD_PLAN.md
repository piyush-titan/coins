# Gold Coin Delivery Platform — Front-End Demo Build Plan

**Purpose of this document:** a complete, self-contained specification for building a fully clickable front-end demo of the Gold Coin Delivery Platform (TN Government Gold Coin Scheme). No real backend, no real integrations — every screen must look and feel finished and every interaction must work end-to-end against mock/local data.

**Audience for the demo:** internal stakeholders (Titan CBG Finance, TN Govt reviewers) evaluating look, feel, and flow before real build begins. A meaningful share of eventual real users are government staff who may not be confident with software — the UI must be unambiguous, low-density where possible, and forgiving.

**Source of truth for scope/data model:** the finalized BRD (Gold Coin Delivery Platform, v1.6) and its process flow. This plan translates that BRD into screens, components, and mock data — it does not introduce new business scope.

---

## 1. Non-negotiable constraints — read this section first

1. **Colors:** primary `#00B0AB` (teal), secondary `#115E6E` (dark teal). Otherwise **white and very light grey only.** No black, no dark grey, no dark navy, no dark surfaces of any kind — not even for cards, sidebars, or "dark mode" accents borrowed from inspiration images. Where an inspiration screenshot uses a black card or black sidebar, translate that to a **primary/secondary teal-toned surface** instead, never to near-black.

   **Both brand colors must be visibly, deliberately used — not just technically permitted.** This is not "pick whichever teal is convenient": these are the company's actual brand colors, and both must read clearly on every major page. Assign them distinct jobs so neither gets neglected in favor of the other:
   - **Primary `#00B0AB`** — the "action and attention" color: primary CTA buttons, active nav item, links, focus rings, count-up numbers on hero stat cards, chart bars representing the main/positive metric, the SLA "within window" state.
   - **Secondary `#115E6E`** — the "structure and depth" color: sidebar background or sidebar accent bar, page headers/title bar, table header row, one hero card per dashboard-style page (as a deep teal gradient card, echoing the black card in the Monetra reference but in-brand), chart bars representing a secondary/comparison metric.
   - Every page must show **both** colors clearly on first glance — not one dominant teal with the other appearing only in a stray icon. When in doubt, add a secondary-colored structural element (header bar, sidebar, one hero card) rather than defaulting everything to primary.

   Gradients and soft color washes (teal-to-white, teal-to-very-light-grey, primary-to-secondary) are encouraged for hero stat cards, CTA buttons, and background hues — keep them light and airy, never muddy or high-contrast-dark.
2. **Typography:** two Google Fonts only, no serif anywhere.
   - **Headings, large numbers, page titles:** `Manrope` (geometric, confident, reads well at large sizes — matches the big-number stat-card look in the reference dashboards).
   - **Body text, labels, table data, buttons, forms:** `Inter` (exceptional readability at small sizes, wide adoption in accessible/government-facing products, huge character-shape clarity — important for the less tech-confident users of this platform).
   - Load both via Google Fonts `<link>` or `@fontsource` packages. No other typefaces, no serif fallback stacks beyond system defaults for emergency fallback only.
3. **Icons:** Google's **Material Symbols** only (use the *Rounded* style, not Sharp/Outlined-sharp — Rounded matches the soft, friendly, clean aesthetic this needs). Use via the `material-symbols` npm package or Google Fonts icon `<link>` — do not mix in any other icon library (no Lucide, Font Awesome, Heroicons, etc.).
4. **No heavy backend.** No real database, no real auth, no real file parsing requirements, no real external API calls. See Section 4 for exactly what "just enough backend" means here.
5. **Every click must lead somewhere real.** No dead buttons, no "coming soon" toasts standing in for entire features. Where the actual BRD leaves something unresolved (e.g. action after verification failure), the screen must still be fully built and navigable — it should visibly show the "pending decision" state rather than being missing or disabled.
6. **Animation:** GSAP for subtle motion only — page/section entrance fades or slight slide-ins, number count-ups on stat cards, smooth height transitions on expand/collapse, gentle hover lift on cards. Nothing bouncy, nothing looping, nothing that delays the user from acting. If in doubt, cut the animation down further. Respect `prefers-reduced-motion`.
7. **Accessibility & simplicity mandate:** generous whitespace, large touch/click targets (minimum 44px height for buttons/rows), plain-language labels (no jargon without a plain-language subtitle), consistent iconography meaning (never reuse the same icon for two different actions), and every data table must have visible column headers and obvious sort/filter affordances — never rely on hover-only discovery for something a first-time user needs.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18 + Vite** | Fast dev/build, simplest path for Claude Code to scaffold and iterate, no server-rendering complexity needed for a demo |
| Language | **TypeScript** | The data model matters (it mirrors the real BRD entities) — typed models prevent silent mock-data mistakes and make the eventual real-backend swap safer |
| Styling | **Tailwind CSS** | Fast to build consistent spacing/color scales; define the brand colors and both fonts as Tailwind theme tokens so nothing drifts off-brand |
| Routing | **React Router v6** | Standard, simple, matches the multi-page sitemap in Section 6 |
| State / mock data layer | **Zustand** (lightweight global store) + a `mock-api` module (Section 4) | Avoids Redux boilerplate; still gives every page a single consistent source of truth for beneficiaries/batches/etc. |
| Charts | **Recharts** | Clean, themeable, matches the bar-chart style in the reference dashboards, easy to restyle in brand teal |
| Animation | **GSAP** (+ `@gsap/react` hook) | Per Section 1.6 |
| Icons | **Material Symbols Rounded** (`material-symbols` package or Google Fonts CDN) | Per Section 1.3 |
| Fonts | **Manrope** + **Inter** via `@fontsource/manrope` and `@fontsource/inter` | Bundled locally, no CDN dependency at runtime |
| Tables | Build a custom `<DataTable>` component (Section 8) rather than pulling in a heavy table library — keeps behavior fully controllable and matches the plain, clean look required |

No server framework, no ORM, no real database. See Section 4.

---

## 3. Design system

### 3.1 Color tokens (Tailwind theme extension)

```
colors: {
  primary:   { DEFAULT: '#00B0AB', 50: '#E6F8F7', 100: '#CCF1EF', 300: '#66D6D1', 500: '#00B0AB', 700: '#00847F', 900: '#00524F' },
  secondary: { DEFAULT: '#115E6E', 50: '#E8F1F3', 100: '#D1E3E7', 300: '#4C8A98', 500: '#115E6E', 700: '#0C4550', 900: '#072C33' },
  surface:   { DEFAULT: '#FFFFFF', muted: '#F7FAFA', subtle: '#F0F5F5' },
  border:    '#E3ECEC',
  ink:       { DEFAULT: '#1F2E2E', muted: '#5B7070', faint: '#8FA3A3' },
  success:   '#2FAE83',
  warning:   '#E0A82E',
  danger:    '#D9614F'
}
```
`success`/`warning`/`danger` are used only for status meaning (delivered/at-risk/breached, etc.) — kept muted, not neon, and always paired with an icon or label, never color alone (accessibility).

**Reminder:** per Section 1.1, `primary` and `secondary` are not interchangeable — apply the action/structure split defined there consistently. A page that uses `primary` everywhere and never `secondary` (or vice versa) fails the brief.

### 3.2 Typography scale

- Page titles: Manrope, 28–32px, weight 700
- Section headings: Manrope, 20–22px, weight 600
- Stat card big numbers: Manrope, 32–40px, weight 700
- Body / table text: Inter, 14–15px, weight 400–500
- Labels / captions / meta text: Inter, 12–13px, weight 500, `ink-muted` color
- Buttons: Inter, 14px, weight 600

### 3.3 Surface & elevation rules

- Cards: white surface, 1px `border` color border, 16–20px border-radius, very soft shadow (`shadow-sm`, never a heavy drop shadow) — matches the flat-but-defined card look in the Donezo/Fundcy references.
- Section backgrounds: `surface-muted` (very light grey/teal wash), never plain white-on-white for the whole page — use it to separate the page background from card surfaces, as in the reference screenshots.
- Gradients: allowed on (a) primary CTA buttons (teal-500 → teal-700, subtle), (b) 1–2 hero stat cards per page for visual interest (teal-50 → white radial or linear wash), (c) the sidebar's active nav item background. Never on body text backgrounds or tables.
- Border-radius scale: 8px (inputs, chips), 12px (buttons), 16–20px (cards), 999px (pills/badges/avatars).

### 3.4 Layout inspiration — what to take from the reference dashboards, translated to our palette

Take **layout rhythm and structure**, not colors/icons/fonts, from the four reference images:

- **Fundcy-style** stat-card row at the top of dashboards (3 large cards, big number + small delta chip), and the clean table row style with rounded status pill in the last column.
- **Monetra-style** two-column dashboard layout: a wide left column (cards + main chart) and a narrower right column (quick actions, a highlighted "hero" card, upgrade-style callout — repurpose that slot for something like "Batches awaiting confirmation").
- **Crextio-style** small circular/radial progress indicators and the segmented onboarding-checklist card (repurpose for something like "Verification checklist" or "Batch completion checklist").
- **Donezo-style** left sidebar with a colored active-state pill, top stat cards in a strong single-color hero card contrasted against neutral cards beside it, and the clean "Reminders/Team" list-row pattern (repurpose for the contact/helpline directory or activity feed).

Every one of these patterns should be rebuilt using only the teal/white/light-grey palette, Manrope/Inter, and Material Symbols — do not reuse any color, icon, or font from the reference images themselves.

---

## 4. "Just enough backend" — the mock data layer

There is no real server. Build a `src/mock-api/` module that behaves like an API but runs entirely in the browser:

- **Data storage:** an in-memory Zustand store, seeded on load from static JSON fixture files (`src/mock-api/fixtures/*.json`). Persist to `localStorage` so a demo presenter's edits (e.g. a new batch upload) survive a page refresh.
- **Simulated async:** every mock-api function returns a `Promise` with an artificial 300–700ms delay (randomized slightly) so loading states, skeletons, and spinners are real and demoable — this is important for the "looks finished" goal.
- **Simulated file upload:** the upload screen accepts a real file via drag-and-drop or file picker (any file — content is not actually parsed). On "upload," the mock-api ignores the real file content and loads one of two pre-seeded fixture outcomes at random or by a dev-toggle: (a) a clean batch, or (b) a batch with 4–6 deliberately broken rows (missing mobile number, malformed pincode, duplicate beneficiary) so the validation-error screen has real, varied errors to display with row/field callouts.
- **Simulated status progression:** a "Simulate next event" button (visible only in a small dev/demo control panel, collapsible, out of the way of the main UI) advances a selected beneficiary/order through the tracking pipeline one step at a time (Section 7's status list), so a presenter can show the countdown, status badges, and PoD screen updating live rather than only showing static pre-seeded snapshots.
- **No real auth.** A simple role switcher (Section 6) sets `currentRole` in the store — no login form with real validation, just a lightweight "Continue as TN Govt / Continue as Titan Admin" screen.

---

## 5. Data model (TypeScript interfaces — mirrors the BRD)

```ts
type Role = 'tn_govt' | 'titan_admin';

type OrderStatus =
  | 'pickup_requested' | 'pickup_accepted' | 'picked_up' | 'reached_origin_hub'
  | 'assistant_assigned' | 'out_for_delivery' | 'delivered' | 'pod_uploaded'
  | 'on_hold_verification_failed' | 'on_hold_data_error' | 'rescheduled' | 'cancelled';

interface Batch {
  id: string;                     // e.g. "BATCH-2026-08-0007"
  uploadedAt: string;             // ISO date
  uploadedFileName: string;
  status: 'validation_pending' | 'has_errors' | 'confirmed';
  totalRecords: number;
  errorCount: number;
  confirmedAt?: string;
  slaWindowDays: 7 | 14 | 'mixed';
}

interface ValidationError {
  batchId: string;
  rowNumber: number;
  field: string;
  message: string;
}

interface VerificationStepResult {
  step: 'unique_code' | 'mobile_otp' | 'aadhaar_last4';
  status: 'pending' | 'passed' | 'failed';
  timestamp?: string;
  failureReason?: string;
}

interface ProofOfDelivery {
  coinSerialNumber?: string;
  signatureImageUrl?: string;
  beneficiaryWithCoinPhotoUrl?: string;
  idPhotoUrl?: string;             // demo: masked placeholder always
  gpsLat?: number;
  gpsLng?: number;
  capturedAt?: string;
}

interface RescheduleEvent {
  previousDate: string;
  newDate: string;
  reasonCode: string;              // from a fixed mock list
  triggeredAt: 'availability_call' | 'delivery_attempt';
  loggedAt: string;
}

interface GrievanceCase {
  id: string;
  orderId: string;
  category: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolutionOutcome?: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;                      // Titan-generated order/beneficiary ID
  batchId: string;
  awb?: string;
  receiverName: string;
  primaryMobile: string;
  alternateMobile?: string;
  aadhaarLast4: string;
  uniqueCode: string;
  address: {
    doorNo: string; building?: string; street: string; area: string;
    landmark?: string; villageTaluk: string; cityTown: string;
    district: string; pincode: string;
  };
  slaWindowDays: 7 | 14;
  slaStartDate: string;             // = batch uploadedAt date
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string }[];
  verification: VerificationStepResult[];
  pod?: ProofOfDelivery;
  reschedules: RescheduleEvent[];
  grievance?: GrievanceCase;
}

interface ContactDirectoryEntry {
  name: string;
  role: string;
  organization: 'Titan' | 'Sequel' | 'TN Govt';
  phone: string;
  email?: string;
}
```

Seed **~80–120 orders** across **3–4 batches**, with a realistic spread: most delivered, several in various in-progress statuses, 3–5 on-hold (mixed data-error and verification-failure causes, tagged with which of the 3 checks failed), 2–3 rescheduled, 2–3 with an open grievance, a couple genuinely SLA-breached and a handful "at risk" (within 1–2 days of their SLA deadline) so the SLA breakdown feature has real numbers to show.

---

## 6. Roles & sitemap

Build **both** role experiences behind a lightweight switcher (a persistent small pill in the top bar reading "Viewing as: TN Government ▾ / Titan Admin ▾" that any demo presenter can toggle instantly — this is a demo convenience, not a real auth mechanism).

```
/                          → Landing / role selection ("Continue as TN Govt" / "Continue as Titan Admin")
/dashboard                 → Role-aware overview (Section 7.1)
/batches                   → Batch list (Section 7.2)
/batches/:id               → Batch detail + validation errors + confirm gate (Section 7.3)
/batches/upload            → New upload flow (Section 7.4)
/beneficiaries             → Searchable/filterable order list (Section 7.5)
/beneficiaries/:id         → Single beneficiary/order detail (Section 7.6)
/tracking                  → SLA & delivery tracking overview (Section 7.7)
/grievances                → Grievance case list + detail (Section 7.8)  [both roles, TN Govt view-only]
/reports                   → Export presets & reverse lookup (Section 7.9) [Titan Admin only]
/directory                 → Contact & helpline directory (Section 7.10) [both roles]
/settings                  → Minimal settings/profile stub (Section 7.11)
```

Titan-only routes (`/reports`, and edit affordances anywhere) must be hidden from the nav — not just permission-blocked — when viewing as TN Govt, so the UI never shows a control a real TN Govt user couldn't use.

---

## 7. Page-by-page specification

### 7.1 Dashboard (role-aware)
- Top row: 3–4 stat cards (Manrope big numbers, small delta/status chip) — Total beneficiaries this batch, Delivered, In progress, At-risk/Breached count. Use GSAP count-up on mount.
- SLA breakdown widget: a horizontal stacked bar or donut (Recharts) showing within-SLA / at-risk / breached proportions — this is the single most important "wow" widget per the BRD discussion; make it prominent.
- Delivery status funnel or bar chart (Recharts) across the 8 tracking stages.
- Recent activity list (last 5–8 status changes, reschedules, grievance updates) — Donezo-style list-row pattern.
- Titan Admin only: a secondary card surfacing batches awaiting confirmation and pending open points needing attention.

### 7.2 Batch list
- Table: Batch ID, upload date, uploaded by (TN Govt, always), record count, status pill (Validation pending / Has errors / Confirmed), SLA window, quick action.
- Empty state with a friendly illustimage-free icon + "Upload your first batch" CTA if no batches exist (only realistically reachable via a dev-reset control).

### 7.3 Batch detail
- Header: batch metadata + big status pill.
- If `has_errors`: a clear, scannable error list — table of Row #, Field, Error message, with a "Download error report" mock button. Prominent "Re-upload corrected file" CTA that routes to `/batches/upload`.
- If clean and unconfirmed: a highlighted **"Confirm this batch"** call-to-action card, explaining in plain language that nothing is sent onward until confirmed (mirrors BRD 2.3 — this is a deliberate, visible gate, not a formality).
- If confirmed: read-only summary + link into the beneficiary list filtered to this batch.

### 7.4 New upload flow
- Step 1: drag-and-drop / file-picker dropzone (accepts any file for the demo), Manrope-styled instructions, a downloadable "template format" mock link.
- Step 2 (after "upload"): a brief simulated processing state (skeleton/progress, GSAP fade), then routes to the batch detail page in either the clean or has-errors state (Section 4's simulated outcome).

### 7.5 Beneficiary/order list
- The core `<DataTable>` component: search box (name/mobile/pincode/AWB/unique code), filter chips (status, district, batch, reschedule flag, grievance flag), sortable columns, pagination (25/50/100 rows).
- Status column uses color-coded pills (success/warning/danger/neutral) plus a text label — never color alone.
- Row click → beneficiary detail.
- Titan Admin sees an extra "bulk export" toolbar above the table (Section 7.9 presets, inline here too for convenience).

### 7.6 Beneficiary/order detail
- Header: name, order ID, AWB, current status pill, SLA countdown (or "Rescheduled" / "Breached" state).
- Address block, contact numbers (masked/plain per role — TN Govt sees full; no different masking rule stated in BRD, so show full to both for now, flag as assumption in an inline dev-comment).
- **Verification timeline:** 3 steps (unique code, mobile OTP, Aadhaar last-4) each with a pass/fail/pending icon and timestamp. If any failed, show a clearly labeled **"Outcome pending — awaiting CBG Finance / TN Govt decision"** panel instead of inventing a resolution. This directly visualizes the BRD's open point — don't hide it.
- **Delivery tracking timeline:** vertical stepper through the 8 statuses with timestamps (Donezo/Crextio-style stepper), highlighting the current stage.
- **Reschedule panel** (if applicable): old date → new date, reason, a small tag distinguishing "requested at availability call" vs "requested during delivery attempt."
- **PoD panel:** signature (placeholder image), beneficiary+coin photo (placeholder), ID photo (blurred/masked placeholder — never show a realistic Aadhaar-like image), GPS coordinates on a simple static map placeholder (no real maps API — a styled placeholder with a pin icon and lat/long text is sufficient), coin serial number.
- **Grievance panel** (if applicable): case summary, status, resolution outcome once resolved.
- **"Export delivery certificate" button** (Section 9 of the BRD) — generates a print-friendly single-page view (use the browser print stylesheet; a real PDF library is optional/stretch, not required for the demo).
- In the small dev/demo control panel: "Simulate next event" button described in Section 4.

### 7.7 Tracking / SLA overview
- A dedicated page for the SLA breakdown at a larger scale than the dashboard widget: filterable by batch/district, with a table of at-risk and breached beneficiaries surfaced first.

### 7.8 Grievances
- List of grievance cases (status pill: open/in progress/resolved), searchable by beneficiary.
- Detail view: case description, category, timestamps, resolution outcome. View-only for TN Govt (no comment/escalate controls, since that's still an open BRD point) — Titan Admin sees the same view-only layout for this demo (no resolution controls, since Sequel owns resolution per the BRD).

### 7.9 Reports (Titan Admin only)
- Export preset buttons: "All delivered this month," "All pending," "All rescheduled," "All with open grievances" — clicking simulates a CSV/PDF download (can actually generate a real client-side CSV from the mock data using a small utility — cheap to do and demoes well).
- **Reverse lookup:** a single search box — enter a coin serial or AWB, get the matching beneficiary card.
- A simple mock **activity log** table (who viewed/exported what, when) — seed with a handful of fixture rows.

### 7.10 Contact & helpline directory
- Simple card-per-contact grid: name, role, organization badge, phone (click-to-copy), email. Static seeded list (use clearly placeholder names/numbers, labeled as such, since the real list is a pending BRD input).

### 7.11 Settings (minimal stub)
- Just enough to not feel broken: profile display (name/role, non-editable), a light/reduced-motion toggle (wire this to actually disable GSAP animations — good demo of care/craft), and an "About this platform" panel summarizing scope.

---

## 8. Shared components to build

- `<Sidebar>` — collapsible, active-state pill in primary teal, Material Symbols icons, role-aware item visibility.
- `<Topbar>` — search (where relevant), role switcher, notification bell (stub with seeded mock notifications), avatar.
- `<StatCard>` — big Manrope number, label, optional delta chip, optional icon, optional gradient background variant.
- `<DataTable>` — generic, typed, with search/filter/sort/pagination built in once and reused everywhere.
- `<StatusPill>` — consistent color+icon+label mapping for every status type used across the app (single source of truth object, not re-implemented per page).
- `<SlaCountdown>` — computes days remaining / at-risk / breached from `slaStartDate` + `slaWindowDays`, renders consistently everywhere it's used.
- `<Timeline>` / `<Stepper>` — used for both the verification steps and the delivery-status pipeline.
- `<Modal>`, `<Toast>` — lightweight, teal-accented, used sparingly.
- `<FileDropzone>` — for the upload flow.
- `<EmptyState>` — consistent "nothing here yet" pattern with icon + short plain-language message + a CTA where relevant.
- `<ProgressRing>` / `<ProgressBar>` — for the SLA breakdown and onboarding-checklist-style widgets.
- `<RoleSwitcher>` — the demo convenience control described in Section 6.
- `<DevControlPanel>` — collapsible, visually separated from the "real" UI (e.g. a distinct bottom-corner drawer), holding "simulate next event," "reset demo data," and batch-outcome toggles. Must never look like it's part of the actual product.

---

## 9. Folder structure

```
src/
  main.tsx
  App.tsx
  routes/                  (one file per route in Section 6)
  components/
    ui/                    (Section 8 shared components)
    layout/                (Sidebar, Topbar, PageShell)
  mock-api/
    fixtures/*.json
    store.ts               (Zustand store)
    api.ts                 (promise-based functions used by pages)
  lib/
    sla.ts                 (SLA calculation helpers)
    status.ts              (status → color/icon/label map)
    format.ts              (dates, phone numbers, etc.)
  styles/
    tailwind.config.ts
    globals.css
  types/
    index.ts               (Section 5 interfaces)
```

---

## 10. Build phases (recommended order for Claude Code)

1. **Scaffold** — Vite + React + TS + Tailwind + fonts + Material Symbols wired up; confirm the color/type tokens render correctly on a blank page before building anything else.
2. **Shell** — Sidebar, Topbar, routing, role switcher, empty page shells for every route in Section 6.
3. **Mock data layer** — types, fixtures, Zustand store, simulated-async api functions, localStorage persistence.
4. **Shared components** — build the Section 8 list against real mock data before wiring up full pages.
5. **Dashboard** — first full page, since it exercises the most shared components at once (stat cards, charts, lists).
6. **Beneficiary list + detail** — the core of the demo; get search/filter/sort/pagination and the detail page's timelines/panels solid.
7. **Batch list/detail/upload flow** — including the validation-error and confirmation-gate states.
8. **Tracking, grievances, reports, directory, settings** — remaining pages.
9. **Animation pass** — add GSAP polish once everything works without it; never block functionality on animation.
10. **Accessibility/usability pass** — click-target sizes, color-alone checks, plain-language copy review, reduced-motion respect.

---

## 11. Explicit non-goals for this build

- No real authentication, no real file parsing, no real PDF generation (print-stylesheet is enough), no real maps integration, no real webhook/API calls to anything, no persistence beyond `localStorage`, no mobile-app packaging (responsive web only), no server-side code of any kind.

---

## 12. Acceptance checklist

- [ ] Every nav item and button leads to a real, built screen — nothing dead or "coming soon."
- [ ] Only `#00B0AB`, `#115E6E`, white, and light greys appear anywhere in the UI (status colors excepted, and used sparingly/accessibly).
- [ ] Both brand colors are clearly visible on every major page — no page reads as "all primary, no secondary" or vice versa.
- [ ] Only Manrope + Inter render anywhere; only Material Symbols icons appear anywhere.
- [ ] Role switch instantly changes visible nav items and page content with no reload.
- [ ] Upload flow demoes both a clean batch and an error batch.
- [ ] SLA countdown, at-risk, and breached states are all visible somewhere in the seeded data without needing the simulate-event control.
- [ ] Verification-failure and grievance screens visibly show "pending decision" rather than a fabricated resolution.
- [ ] All animation is subtle, non-looping, and respects reduced-motion.
- [ ] The whole app is usable and legible at a glance by someone unfamiliar with the underlying scheme.
