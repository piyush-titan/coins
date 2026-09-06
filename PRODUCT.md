# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18 + Vite + TypeScript, Tailwind CSS, React Router v6, Zustand, Recharts, GSAP (+ `@gsap/react`), Material Symbols Rounded icons, `@fontsource/manrope` + `@fontsource/inter`. No server framework, no real backend — a mock-api layer (Zustand store seeded from JSON fixtures, persisted to `localStorage`, simulated async delay) stands in for the real system. Confirmed by the user's own build plan document; not delegated.

## Users

Two internal, non-beneficiary user roles, switched via a demo role-switcher (no real auth):

- **TN Government (Social Welfare Dept.) reviewers** — view, export, and print access only, no edit access. Includes staff who may not be confident with software; the UI must be unambiguous and forgiving for this audience.
- **Titan CBG Finance / developers (Titan Admin)** — full view access to all orders, batches, delivery details, tracking, reschedules, grievances, and PoD documents, plus batch confirmation and reporting/export tooling.

Beneficiaries (the newlywed brides receiving coins) are never users of this platform — it is explicitly not beneficiary-facing. Sequel (the logistics partner) has no platform access at all; it interacts only via API, which this demo simulates rather than integrates.

## Product Purpose

A verified bulk-delivery and audit platform for the Tamil Nadu Government's marriage-assistance gold coin scheme: 8 grams of 24-carat gold delivered to each eligible newlywed bride. Titan Company Limited is the manufacturing/fulfilment partner and sole system of record; Sequel executes last-mile delivery end-to-end (calling, travel, 3-step identity verification, proof of delivery) and reports status back via API. The platform's job is to make three things structurally true: verified identity at handover (never a family member, even with the right codes), a defensible audit trail (exactly when/to whom/with what proof, months later if needed), and visibility without manual chasing (TN Govt sees delivery progress without calling Titan; Titan sees a process it doesn't itself execute).

This build is a **front-end-only demo**: no real backend, no real auth, no real external API calls, no real file parsing, no real PDF/maps integration. Every interaction must still work end-to-end against mock/local data so the demo looks and feels completely finished to internal stakeholders evaluating the design before real build begins.

## Positioning

Unlike a generic delivery-tracking dashboard, this platform's core differentiator is the mandatory 3-step identity verification at the point of handover (Aadhaar last-4, mobile OTP, unique/voucher code) tied to a single beneficiary-record system of truth that mirrors Sequel's real delivery status — built specifically for high-value, named-recipient welfare disbursement at state government scale, not a commercial parcel-tracking product.

## Operating Context

- **Beneficiary list intake**: TN Govt uploads a beneficiary file per delivery cycle (potentially tens of thousands of records/month, statewide, including remote/low-connectivity districts).
- **Batch lifecycle**: upload → format-level validation (mandatory fields, format rules, in-file duplicate detection) → if errors, corrected file must be re-uploaded as an independent new batch → if clean, TN Govt must explicitly confirm the batch (a deliberate gate; a clean file alone does not trigger processing) → order creation, one order per beneficiary, Titan-generated order ID.
- **Parallel downstream processes** (not user-facing in this platform beyond status): Titan → Oracle (aggregate coin quantity only, no beneficiary data, no "allocating/manufacturing" status shown) and Titan → Sequel (full beneficiary list) happen in parallel once orders are created.
- **Packing & AWB**: Sequel scans and stores the coin serial digitally at packing (not yet linked to a beneficiary); generates an AWB per order shared with Titan. The serial-to-beneficiary link is only created later, at successful verification during delivery.
- **Delivery tracking pipeline** (successful path; mirrors Sequel's own tracker, each with a timestamp): Pickup requested → Pickup accepted/created → Shipment picked up → Reached origin hub → Delivery assistant assigned → Out for delivery → Delivered → PoD uploaded. Failure/exception statuses and final end-states beyond this are explicitly undefined in the BRD (open point) — represent this as a visible "on hold / pending decision" state, never a fabricated resolution.
- **Reschedules**: can be triggered either at the availability call (beneficiary unavailable) or during an actual delivery attempt; shows new date, a "Rescheduled" tag, and a reason code. A rescheduled delivery is no longer measured against the original SLA window. Up to 2 standard re-attempts, a 3rd under special circumstances; what happens once attempts are exhausted is an open BRD point — do not invent a resolution.
- **3-step verification at handover**: Aadhaar last-4, mobile OTP, unique/voucher code — each shown pass/fail/pending individually. No downstream action is defined for a failed step (open BRD point) — must show as "outcome pending — awaiting CBG Finance / TN Govt decision," not an invented resolution.
- **Proof of delivery** (captured only on successful verification): beneficiary signature, photo of beneficiary holding the coin, GPS/geofence tag, photo of beneficiary's government ID (always shown masked/placeholder in this demo — never a realistic ID image).
- **SLA clock**: 7 days (accessible pincodes) or 14 days (remote pincodes), starting the same day TN Govt uploads the file (upload day = Day 1). Per-beneficiary countdown and per-batch breakdown (within-SLA / at-risk / breached) are core visibility features.
- **Grievances**: one case per beneficiary, owned end-to-end by Sequel; Titan/TN Govt see case ID, category, description, status, resolution outcome, timestamps — view-only for both roles in this platform (no comment/escalate/resolve controls for either role, since Sequel owns resolution and this is still an open BRD point).
- **Contact/helpline directory**: static, admin-maintained, visible to TN Govt and Titan only (not beneficiary-facing).
- **Reporting**: TN Govt has view/export/print access including which specific verification step failed and full batch/upload history, no edit access. Titan Admin has full view access plus reporting/export tooling (export presets, reverse lookup by coin serial/AWB, activity log).

## Capabilities and Constraints

- No real authentication — a lightweight, persistent role-switcher pill sets the current role; this is a demo convenience only, not a security boundary.
- No real backend/database — an in-memory Zustand store seeded from static JSON fixtures, persisted to `localStorage` so a presenter's edits (e.g. simulated upload) survive a refresh.
- Simulated async on every mock-api call (randomized ~300–700ms delay) so loading/skeleton states are real and demoable.
- Simulated file upload: accepts any real file via drag-and-drop or picker, but ignores its actual content — on "upload" it loads one of two pre-seeded fixture outcomes (a clean batch, or a batch with 4–6 deliberately broken rows) so the validation-error screen has real, varied errors.
- A small, visually distinct dev/demo control panel (never looking like part of the real product) provides "simulate next event" (advances a selected order through the tracking pipeline one step), "reset demo data," and batch-outcome toggles.
- Explicitly undefined BRD scope must be shown as a visible, honest "pending decision" state, not hidden or fabricated: failed verification-step outcome, exhausted-reschedule outcome, and end-states beyond the successful delivery path.
- Out of scope for this platform entirely (per BRD Section 8, applies to the demo's conceptual model too): identity/business-rule validation beyond upload format checks, gold coin inventory tracking, pick-pack workflow execution, OMS/pricing integration, Oracle financial reconciliation, any beneficiary-facing feature, Sequel having platform access beyond API, Titan resolving grievances directly.
- Terminology: "batch" = one independent upload with its own SLA (no relationship to other batches); "order" = the beneficiary record itself, one object whose status mirrors Sequel's delivery status directly (not a commercial/OMS order).

## Brand Commitments

- Primary brand color `#00B0AB` (teal) and secondary `#115E6E` (dark teal) are confirmed and mandatory; otherwise white and very light grey only — no black, no dark surfaces of any kind. Both colors must be visibly, deliberately used on every major page with distinct jobs (primary = action/attention, secondary = structure/depth).
- Typography: Manrope (headings/large numbers) + Inter (body/labels/tables/buttons) only, no serif anywhere.
- Icons: Google Material Symbols, Rounded style only — no other icon library.
- Muted status colors (success/warning/danger) are permitted for status meaning only, always paired with an icon or label, never color alone.

## Evidence on Hand

- Full BRD (`TN_Gold_Coin_Platform_BRD_Final_Scope_v1.7.docx`) — the authoritative business scope, roles/access table, data flow, assumptions, explicit non-goals, and a consolidated open-points list (Section 9) grouped by category with owning team and blank outcome, none of which this demo may resolve on its own authority.
- A pre-written, highly detailed UI build plan (`GOLD_COIN_PLATFORM_UI_BUILD_PLAN.md`) covering tech stack, design tokens, full data model (TypeScript interfaces), sitemap, page-by-page spec, shared component list, folder structure, build phases, and an acceptance checklist. This plan is the primary build reference alongside this file.
- Four reference dashboard screenshots (Donezo, Crextio, Monetra, Fundcy) supplied by the user as **layout-rhythm** references only — their structure/rhythm (stat-card rows, two-column dashboard layout, radial progress + checklist cards, sidebar + hero-card + list-row patterns) is to be rebuilt entirely in-brand; none of their colors, icons, or fonts (all use green/yellow/black/serif-adjacent styling foreign to this brief) transfer.
- No real beneficiary data, no real Sequel/Oracle API contracts, and no resolved outcomes for the BRD's Section 9 open points exist — the demo must not fabricate any of these.

## Product Principles

1. **Show the truth of the process, including its unresolved edges.** Where the BRD leaves an outcome open (failed verification, exhausted reschedules, grievance resolution), the screen is fully built and navigable but visibly shows "pending decision" — never a fabricated resolution standing in for missing scope.
2. **Design for the least confident user in the room.** A meaningful share of real eventual users are government staff who may not be confident with software: unambiguous labels, generous touch targets, low density, never rely on hover-only discovery, never color alone for status meaning.
3. **Every click leads somewhere real.** No dead buttons, no "coming soon" — this is a demo meant to look and feel completely finished.
4. **Audit-first, not delivery-first.** This is a welfare entitlement platform whose reason to exist is proof — verified identity at handover and a defensible audit trail — not merely tracking that "a delivery happened." Every screen involving verification or PoD should read as evidence, not decoration.
5. **One system of record, two read-only lenses.** TN Govt and Titan Admin see the same underlying truth at different edit/access levels (TN Govt: view/export/print only; Titan: full view + confirmation/reporting); the UI must never expose a control a role couldn't really use.

## Accessibility & Inclusion

Generous whitespace, minimum 44px click/touch targets, plain-language labels (no unexplained jargon), consistent icon-to-action meaning throughout, every data table has visible column headers with obvious sort/filter affordances, status is always color + icon + label together (never color alone), and all motion respects `prefers-reduced-motion`.
