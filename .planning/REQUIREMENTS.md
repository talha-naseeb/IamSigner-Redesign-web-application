# Requirements: IAMSigner Redesign & Modernization

**Defined:** 2026-10-24  
**Core Value:** Secure, legally compliant, seamless multi-party document signing and management with zero data loss or authentication vulnerability.

## v1 Requirements

Requirements for initial modernization and architecture stabilization, mapping directly to roadmap phases.

### Security & Token Architecture

- [x] **SEC-01**: User access token is managed in-memory via `tokenManager.js`, with zero plaintext JWT written to `localStorage`.
- [x] **SEC-02**: Silent token refresh is proactively scheduled before JWT expiry using `scheduleRefresh()`.
- [x] **SEC-03**: Session-scoped base64 encoding (`_enc_tk`) in `sessionStorage` provides page refresh resilience without disk vulnerability.

### Authorization & RBAC Route Guards

- [x] **RBAC-01**: `AuthGuard` validates session token presence and preserves attempted URL in router state for post-login redirect.
- [x] **RBAC-02**: `RoleGuard` evaluates AccountType (`B` Business vs `I` Individual), RoleID (1: SuperAdmin, 2: Standard, 3: Restricted, 4: Admin), `userAccess` module flags, and subscription validity (`remainingDays > 0`).
- [x] **RBAC-03**: `<Forbidden403 />` error screen renders prescriptive explanation when permission check fails.

### Codebase Deduplication & Route Cleanup

- [x] **DEDUP-01**: Redundant duplicate component files and dead code are eliminated across status directories.
- [x] **DEDUP-02**: Duplicate routes and legacy URL redirects are consolidated to clean canonical paths.

### Visual Design System & Theming

- [x] **UI-01**: All surfaces, text, borders, and controls strictly consume shared `--modern-*` tokens from `src/index.css`.
- [x] **UI-02**: Decorative box-shadows are eliminated across all cards, section panels, and shell surfaces.
- [x] **UI-03**: Light mode, dark mode, and dynamic palette switches maintain consistent visual hierarchy and contrast.

### Component Engine Consolidation

- [x] **ENG-01**: Centralized 3-step document preparation Stepper Wizard Engine unifies Upload & Send, BulkSend, SelfSignature, and Templates.
- [x] **ENG-02**: Unified Document Status Table Engine powers Pending, Draft, Completed, Declined, Recalled, and Inactive lists.

### Document Management System (DMS)

- [x] **DMS-01**: Multi-format DMS file upload modal supports any file type up to 100MB with progress tracking and metadata tagging.
- [x] **DMS-02**: Real DMS backend API integration replaces all hardcoded mock data in `src/Components/DMS/`.

## v2 Requirements

Deferred to future releases. Tracked but outside current scope.

- **V2-01**: Biometric WebAuthn passkey authentication.
- **V2-02**: Offline PWA signing mode with background sync.

## Out of Scope

- Native desktop or mobile applications (iOS/Android native binaries).
- Direct client-to-database connections.

---

*Requirements established from ingested PRDs and SPECs on 2026-10-24*
