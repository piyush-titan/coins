---
name: TN Gold Coin Delivery Platform
description: Audit-first operate surface for tracking the Tamil Nadu Government gold coin scheme from batch upload through verified handover.
colors:
  primary: "#00b0ab"
  primary-50: "#e6f8f7"
  primary-100: "#ccf1ef"
  primary-300: "#66d6d1"
  primary-600: "#009690"
  primary-700: "#00847f"
  primary-900: "#00524f"
  secondary: "#115e6e"
  secondary-50: "#e8f1f3"
  secondary-100: "#d1e3e7"
  secondary-300: "#4c8a98"
  secondary-700: "#0c4550"
  secondary-900: "#072c33"
  surface: "#ffffff"
  surface-muted: "#f7fafa"
  surface-subtle: "#f0f5f5"
  border: "#e3ecec"
  ink: "#1f2e2e"
  ink-muted: "#5b7070"
  ink-faint: "#8fa3a3"
  success: "#2fae83"
  success-bg: "#e7f6f0"
  warning: "#e0a82e"
  warning-bg: "#fbf3e1"
  danger: "#d9614f"
  danger-bg: "#fbeae7"
typography:
  display:
    fontFamily: "Manrope, Segoe UI, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontWeight: 400
rounded:
  chip: "8px"
  btn: "12px"
  card: "20px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.btn}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-600}"
  status-pill-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
  status-pill-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning}"
    rounded: "{rounded.pill}"
  status-pill-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "24px"
---

## Overview

This is a front-end-only demo (React 19 + TypeScript + Vite + Tailwind v4) for the TN Gold Coin Delivery Platform: a three-party operate surface (Titan Company Limited, Sequel logistics, TN Government Social Welfare Dept.) for tracking gold coin delivery from batch upload through SLA-bound last-mile delivery, identity verification at handover, and grievance resolution. There is no live backend — all data is deterministic mock data seeded into a Zustand store, persisted to `localStorage` so a presenter's demo edits (new batch upload, simulated tracking events) survive a page refresh.

The product's core differentiator is an **audit-first posture**: every screen exists to answer "what actually happened, and can we prove it?" rather than to look busy. Failure states (on-hold verification, breached SLA, batch validation errors) are shown honestly with real reasons, not glossed over or hidden. Two roles are supported: `titan_admin` (full visibility, batch confirmation, Reports/export, reverse lookup) and `tn_govt` (upload + read-only oversight — no export, no batch confirmation, no Reports page at all, not even hidden-but-present).

## Colors

- **Primary teal** (`#00b0ab`) is the platform's single accent — used for primary actions, active nav state, focus rings, links, and the brand mark. It is used deliberately sparingly: most of the UI is ink-on-white/muted-surface, so teal reads as "this is actionable or important" rather than decorative.
- **Secondary deep teal** (`#115e6e`) is reserved for high-emphasis dark surfaces: the sidebar background, hero/callout cards (e.g. "Batches awaiting confirmation," "Verification checklist"), and the dev-only control panel (intentionally, to visually separate it from real product chrome).
- **Semantic triad** (success green / warning amber / danger red, each with a matching pale `-bg` tint) is the *only* vocabulary for status communication — SLA state, batch validation state, verification pass/fail, grievance status. Status is never conveyed by color alone: every status pill pairs an icon + a text label + the color, so the UI remains legible without color perception.
- **Ink scale** (`ink` / `ink-muted` / `ink-faint`) is a warm-neutral near-black rather than pure gray, keeping body text visually related to the teal brand rather than clashing with it.

## Typography

- **Manrope** (display) for all headings (`h1`–`h4`) — a geometric, slightly rounded sans that reads as modern-government/civic-tech rather than corporate-enterprise. Headings use a tightened `-0.01em` letter-spacing.
- **Inter** (body) for everything else — labels, table content, form fields, numbers. Tables additionally set `font-variant-numeric: tabular-nums` so amounts, counts, and dates align in monospace-like columns.
- **Material Symbols Rounded** is the exclusive icon font (loaded via `material-symbols/rounded.css`, rendered through a shared `<Icon>` component) at a fixed variation (`FILL 0, wght 500, GRAD 0, opsz 24`) — never mixed with any other icon set, so glyph weight stays consistent across the whole app.

## Layout

- **App shell**: fixed dark-teal sidebar (nav + brand mark + settings) on desktop, collapsing to a slide-in drawer with a scrim on mobile (toggled by a hamburger in the topbar). Topbar carries global search, the demo-only role switcher, notifications, and the active user's avatar/role chip.
- **Content grid**: pages use a responsive stat-card row (1 column on mobile, up to 4 on desktop) above a two-thirds/one-third split for chart+detail content, collapsing to a single column below the `lg` breakpoint.
- **Cards** are the primary layout unit — `20px` radius, `24px` internal padding, `shadow-soft` at rest, `shadow-lift` on hover/interactive rows — used consistently for stat tiles, chart panels, detail panels, and list rows.
- **Tables** (the shared `<DataTable>`) use a dark-teal header row, zebra-free white rows with a bottom border, and a consistent search+filter+pagination footer bar across every list page (Batches, Beneficiaries, Grievances, Tracking's priority table).

## Elevation & Depth

Two shadow tokens only — `shadow-soft` (resting cards) and `shadow-lift` (hover, active dev-panel, modals) — both teal-tinted (`rgba(17, 94, 110, …)`) rather than neutral black, so elevation reads as part of the brand rather than a generic Material default. No skeuomorphic gradients or borders-as-depth; elevation is shadow-only, kept subtle and workmanlike to suit an Operate-mode admin tool.

## Shapes

- `--radius-chip` (8px) for small inline tags/filter chips.
- `--radius-btn` (12px) for buttons and inputs.
- `--radius-card` (20px) for cards, panels, and modals.
- `--radius-pill` (999px) for status pills and the role-switcher/notification badges.

Corners are consistently soft but not rounded-to-the-point-of-playful — this is a government-facing audit tool, so shapes stay closer to "precise" than "friendly."

## Components

- **StatusPill**: the canonical status communicator across the whole app (SLA state, batch state, order state, verification state, grievance state). Always icon + label + semantic background/text pair; two sizes (`sm`/`md`).
- **StatCard**: GSAP count-up numeric stat tile, respecting both the in-app "reduce motion" setting and the OS `prefers-reduced-motion` media query — falls back to an instant static number.
- **Stepper**: two use cases — a horizontal 8-stage delivery-pipeline stepper (`pickup_requested` → `pod_uploaded`) and a vertical 3-step identity-verification stepper (Aadhaar last-4 → mobile OTP → unique/voucher code, matching the BRD's fixed handover order), each step rendered `done` / `active` / `failed` / `upcoming`.
- **SlaCountdown**: a compact colored countdown/overdue chip (`sm`/`md`), reused in tables and detail headers.
- **DataTable**: generic sortable/searchable/paginated table with per-page column render + per-column sort-value functions; the single list-rendering primitive for every collection page.
- **FileDropzone**: drag-and-drop + click-to-browse batch upload control, feeding a simulated processing → validation-outcome flow.
- **DevControlPanel**: a deliberately dark, badge-labeled "DEV / DEMO CONTROLS — NOT PART OF THE PRODUCT" floating panel (simulate next tracking event, reset demo data) — visually distinct (different chrome, explicit label) so it is never mistaken for real product surface.

## Do's and Don'ts

- **Do** pair every status color with an icon and a text label — never rely on color alone.
- **Do** show failure/on-hold/breached states with a real, specific reason (e.g. "Voucher code entered did not match TN Govt records") — never a silent or vague failure state.
- **Do** keep the identity-verification step order fixed as Aadhaar last-4 → mobile OTP → unique/voucher code, with all three timestamps reflecting one coherent handover instant, not independently randomized times.
- **Do** gate Titan-only actions (Reports/export, reverse lookup, batch confirmation) out of the TN Government role entirely — omit the nav item and route, don't show a disabled/greyed-out version.
- **Don't** introduce a second icon set, a second display/body font pairing, or a shadow token outside the two defined levels.
- **Don't** invent resolutions to open questions from the underlying BRD (e.g. don't fabricate how an on-hold verification failure gets resolved) — represent the state honestly and stop there.
