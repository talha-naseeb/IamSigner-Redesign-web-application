# IAMSigner Redesign & Modernization

## What This Is

IAMSigner (`Macquires-ESign-FE`) is an enterprise-grade electronic signature and document management platform enabling individuals and business organizations to upload, prepare, route, sign, manage, and legally audit documents with ease. Built with React 19, Vite, and Tailwind CSS, the platform delivers a modern, accessible, and high-performance document workflow.

## Core Value

Secure, legally compliant, seamless multi-party document signing and management with zero data loss or authentication vulnerability.

## Business Context

- **Customer**: Individual professionals and business organizations (SuperAdmin, Admin, Standard, and Restricted user roles).
- **Revenue model**: Tiered SaaS subscription licensing with active remaining-day validity tracking.
- **Success metric**: 100% elimination of unauthorized URL address-bar privilege escalation, zero plaintext token storage in localStorage, and >40% duplicate codebase LOC reduction.

## Requirements

### Validated

- [x] Initial codebase map established in `.planning/codebase/` (`STACK.md`, `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `INTEGRATIONS.md`, `CONCERNS.md`).

### Active

- [ ] **SEC-01**: Centralized in-memory JWT access token management in `src/services/tokenManager.js`.
- [ ] **SEC-02**: Proactive silent token refresh scheduled before JWT expiry.
- [ ] **SEC-03**: Page refresh resilience via session-scoped base64 encoding (`_enc_tk`) without persistent disk vulnerability.
- [ ] **RBAC-01**: Declarative `AuthGuard` redirecting unauthenticated visitors to `/login` with target return URL preserved.
- [ ] **RBAC-02**: Multi-factor `RoleGuard` evaluating AccountType (`B` vs `I`), RoleID (1..4), userAccess flags, and active subscription status (`remainingDays > 0`).
- [ ] **RBAC-03**: Accessible `<Forbidden403 />` denial screen providing prescriptive error context on denied routes.
- [ ] **DEDUP-01**: Elimination of redundant duplicate files, paired legacy routes, and dead code across status views.
- [ ] **DEDUP-02**: Route consolidation and redirect aliases (`/drafts` -> `/draft-docs`, `/completed-status` -> `/completed-docs`).
- [ ] **UI-01**: Strict adherence to `--modern-*` design tokens from `src/index.css` across all surfaces.
- [ ] **UI-02**: Complete elimination of decorative box-shadows on cards and shell surfaces.
- [ ] **UI-03**: Comprehensive light mode, dark mode, and multi-palette visual system continuity.
- [ ] **ENG-01**: Unified 3-step document preparation Stepper Wizard Engine (Upload & Send, BulkSend, SelfSignature, Templates).
- [ ] **ENG-02**: Unified Document Status Table Engine powering all dashboard status lists.
- [ ] **DMS-01**: DMS universal multi-format file upload modal with real-time progress and metadata capture.
- [ ] **DMS-02**: Real DMS backend API integration replacing hardcoded mock data.

### Out of Scope

- Native desktop/mobile apps (iOS/Android native binaries) — the platform remains a responsive browser-based web application.
- Direct client-to-database connections — all database persistence remains strictly mediated by backend REST microservices.

## Decisions

<decisions>
- **DEC-01: In-Memory Token Management Architecture** (locked): Store JWT access tokens primarily in memory via `tokenManager` singleton with silent refresh scheduling, using base64-encoded session-scoped storage (`_enc_tk`) only for page refresh resilience, completely eliminating plaintext `localStorage` token storage.
- **DEC-02: Multi-Factor Declarative Route Guard Architecture** (locked): Enforce routing access control using nested layout guards in React Router 6 (`AuthGuard` and `RoleGuard`). `RoleGuard` must evaluate AccountType, RoleID, userAccess flags, and active subscription. Unauthorized access must render `<Forbidden403 />`.
- **DEC-03: Shared Design Tokens and Zero Decorative Box-Shadows** (locked): Implement all visual surfaces, cards, text, and borders using `--modern-*` CSS custom properties mapped in `src/index.css`. Prohibit decorative box-shadows on cards and shell panels; rely on surface color contrast and borders for visual hierarchy. Support dark mode, light mode, and multi-palette switching.
- **DEC-04: Centralized Stepper Wizard Engine** (locked): Unify the 3-step document preparation wizards across `Upload Flow`, `BulkSend`, `SelfSignature`, and `Templates` into a single reusable stepper engine to eliminate duplicated canvas placement, recipient management, and dispatch logic.
- **DEC-05: DMS Universal File Upload Support** (proposed): Allow users to upload any file type into DMS folders with client-side validation, size caps (100MB per file), drag-and-drop dropzones, and metadata capture (title, description, tags).
</decisions>

---

*Project context created via /gsd-ingest-docs on 2026-10-24*
