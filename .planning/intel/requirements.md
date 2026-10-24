# Synthesized Requirements

## REQ-token-security
- source: docs/PRD_Refactoring_RBAC_Token_Security.md
- description: Centralized in-memory token manager preventing XSS token theft and multi-tab session crosstalk.
- acceptance: `tokenManager` stores JWT in memory; provides `getToken()`, `setToken()`, `clearToken()`, `decodePayload()`; schedules silent refresh before expiry; mirrors to `_enc_tk` in sessionStorage for refresh resilience; emits `auth:token-change` window events.
- scope: authentication, security, token lifecycle

## REQ-rbac-guards
- source: docs/PRD_Refactoring_RBAC_Token_Security.md
- description: Declarative multi-factor route authorization guards enforcing account type, user role, feature flags, and subscription validity.
- acceptance: `AuthGuard` redirects unauthenticated visitors to `/login` with `from` state; `RoleGuard` inspects `user.AccountType`, `user.RoleID`, `userAccess` flags, and `remainingDays > 0`; renders `<Forbidden403 reason="..." />` on denial; prevents URL address-bar privilege escalation.
- scope: authorization, routing, RBAC

## REQ-deduplication
- source: docs/PRD_Refactoring_RBAC_Token_Security.md
- description: Codebase cleanup eliminating redundant duplicate files, paired legacy routes, and dead code.
- acceptance: Over 25 duplicate files eliminated; legacy route redirects consolidated (`/drafts` -> `/draft-docs`, `/completed-status` -> `/completed-docs`); dead component folders removed.
- scope: refactoring, codebase maintainability

## REQ-stepper-wizard-engine
- source: docs/PRD_Refactoring_RBAC_Token_Security.md
- description: Unified 3-step document preparation wizard engine consolidating Upload & Send, BulkSend, SelfSignature, and Templates.
- acceptance: Standardized Step 1 (Upload / Document Source), Step 2 (Canvas Field Placement), Step 3 (Review / Dispatch); shared canvas coordinate mapping and recipient management.
- scope: components, upload flow, user experience

## REQ-status-table-engine
- source: docs/PRD_Refactoring_RBAC_Token_Security.md
- description: Unified document status table engine powering all dashboard status lists.
- acceptance: Standardized filter bar, search input, date picker, sorting, pagination, action dropdown menus, and empty states across Pending, Draft, Completed, Declined, Recalled, and Inactive documents.
- scope: components, dashboard, status lists

## REQ-dms-file-upload
- source: docs/DMS_FileUpload_PRD.md
- description: Multi-format file upload modal and dropzone for DMS folders.
- acceptance: Users can drag and drop or browse files of any file type up to 100MB; capture title, description, and tags; display real-time upload progress bar; provide validation errors for oversize or network failure; refresh folder file list upon completion.
- scope: DMS, file upload, file storage

## REQ-dms-api-wiring
- source: docs/DMS_Remaining_APIs.md
- description: Wire up remaining backend DMS API endpoints to replace hardcoded mock data.
- acceptance: Real API integration for document upload (`POST /api/documents/upload`), document details (`GET /api/documents/:id`), document download, rename, delete, search, and activity tracking via `src/Api/dmsApi.js`.
- scope: DMS, backend integration, API
