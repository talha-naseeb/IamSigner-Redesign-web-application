# Synthesized Decisions

## DEC-01: In-Memory Token Management Architecture
- source: docs/PRD_Refactoring_RBAC_Token_Security.md
- status: locked (Approved PRD Architecture)
- decision: Store JWT access tokens primarily in memory via `tokenManager` singleton with silent refresh scheduling, using base64-encoded session-scoped storage (`_enc_tk`) only for page refresh resilience, completely eliminating plaintext `localStorage` token storage.
- scope: authentication, token security, XSS mitigation

## DEC-02: Multi-Factor Declarative Route Guard Architecture
- source: docs/PRD_Refactoring_RBAC_Token_Security.md
- status: locked (Approved PRD Architecture)
- decision: Enforce routing access control using nested layout guards in React Router 6 (`AuthGuard` and `RoleGuard`). `RoleGuard` must evaluate AccountType (`B` Business vs `I` Individual), numeric `RoleID` (1: SuperAdmin, 2: Standard, 3: Restricted, 4: Admin), feature entitlement flags in `userAccess`, and active subscription status (`remainingDays > 0`). Unauthorized access must render `<Forbidden403 />` with an explanatory reason.
- scope: authorization, RBAC, route guards

## DEC-03: Shared Design Tokens and Zero Decorative Box-Shadows
- source: docs/IAMSigner-Design-System.md
- status: locked (Design System Spec)
- decision: Implement all visual surfaces, cards, text, and borders using `--modern-*` CSS custom properties mapped in `src/index.css`. Prohibit decorative box-shadows on cards and shell panels; rely on surface color contrast and borders for visual hierarchy. Support dark mode, light mode, and multi-palette switching.
- scope: design system, theming, visual tokens

## DEC-04: Centralized Stepper Wizard Engine
- source: docs/PRD_Refactoring_RBAC_Token_Security.md
- status: locked (Approved PRD Architecture)
- decision: Unify the 3-step document preparation wizards across `Upload Flow`, `BulkSend`, `SelfSignature`, and `Templates` into a single reusable stepper engine to eliminate duplicated canvas placement, recipient management, and dispatch logic.
- scope: component reusability, stepper wizard, upload flow

## DEC-05: DMS Universal File Upload Support
- source: docs/DMS_FileUpload_PRD.md
- status: proposed (Draft PRD)
- decision: Allow users to upload any file type into DMS folders with client-side validation, size caps (100MB per file), drag-and-drop dropzones, and metadata capture (title, description, tags).
- scope: DMS, file upload, file storage
