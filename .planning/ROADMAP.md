# Roadmap: IAMSigner Redesign & Modernization

## Overview

A phased journey modernizing IAMSigner (`Macquires-ESign-FE`): starting with foundational token security and declarative RBAC route authorization, progressing through codebase deduplication and design token enforcement, and concluding with component engine consolidation and universal DMS file management.

## Phases

- [x] **Phase 1: In-Memory Token Security & Session Management** - Centralize JWT storage in memory, eliminate persistent plaintext localStorage tokens, and implement silent refresh.
- [x] **Phase 2: Multi-Factor Declarative RBAC Route Guards** - Implement layout-level AuthGuard and RoleGuard checking account types, roles, permissions, and subscription validity.
- [x] **Phase 3: Codebase Deduplication & Route Consolidation** - Clean up duplicate components, eliminate orphaned dead code, and normalize route redirects.
- [x] **Phase 4: Shared Visual System & Design Token Enforcement** - Apply `--modern-*` design tokens across all views, eliminate decorative box-shadows, and verify theme switching.
- [x] **Phase 5: Centralized Stepper Wizard Engine** - Build a unified 3-step document preparation engine consolidating Upload & Send, BulkSend, SelfSignature, and Templates.
- [x] **Phase 6: Unified Document Status Table Engine** - Construct a standardized document status table component powering all status dashboard views.
- [ ] **Phase 7: DMS Universal File Upload & API Integration** - Deliver multi-format DMS file uploading with metadata capture and wire up remaining backend endpoints.

## Phase Details

### Phase 1: In-Memory Token Security & Session Management
**Goal**: Safeguard authentication credentials by moving JWT access tokens into an in-memory manager with silent refresh and session resilience.
**Depends on**: Nothing (first phase)
**Requirements**: SEC-01, SEC-02, SEC-03
**Success Criteria**:
  1. No plaintext JWT tokens are stored or persisted in `localStorage`.
  2. Silent token refresh triggers automatically prior to JWT expiration without interrupting the user.
  3. Browser page reloads preserve active user sessions without leaking tokens to disk storage.
**Plans**: 2 plans
- [x] `01-01`: Harden centralized token manager service and build unit test suite (Wave 1)
- [x] `01-02`: Migrate direct sessionStorage token removals and standardize session expiry (Wave 2)

### Phase 2: Multi-Factor Declarative RBAC Route Guards
**Goal**: Enforce declarative route authorization preventing address-bar privilege escalation across account types, roles, and subscriptions.
**Depends on**: Phase 1
**Requirements**: RBAC-01, RBAC-02, RBAC-03
**Success Criteria**:
  1. Unauthenticated attempts to access protected routes redirect cleanly to `/login` preserving target URL.
  2. Non-business or restricted users attempting to access admin or company settings receive a prescriptive `<Forbidden403 />` screen.
  3. Accounts with expired subscriptions (`remainingDays <= 0`) are prompted to renew rather than entering restricted feature workflows.
**Plans**: 2 plans
- [x] `02-01`: Harden AuthGuard & RoleGuard multi-factor checks, post-login redirection, and create unit test suite
- [x] `02-02`: Route guard audit and end-to-end integration validation across roles, account types, and subscriptions

### Phase 3: Codebase Deduplication & Route Consolidation
**Goal**: Eliminate redundant duplicate files, paired legacy routes, and dead code to streamline the codebase.
**Depends on**: Phase 2
**Requirements**: DEDUP-01, DEDUP-02
**Success Criteria**:
  1. Duplicate status files and orphaned unreferenced components are safely removed.
  2. Legacy routes redirect to canonical routes with no broken internal links.
**Plans**: 2 plans
- [x] `03-01`: Remove orphaned DashboardTempalte.js, purge obsolete directories, and clean commented dead imports
- [x] `03-02`: Normalize legacy URL redirects, disambiguate route constants, and handle shared route aliases

### Phase 4: Shared Visual System & Design Token Enforcement
**Goal**: Unify all application surfaces under the shared `--modern-*` design tokens with zero decorative box-shadows.
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03
**Success Criteria**:
  1. All page cards, panels, and shell surfaces use token-based backgrounds and borders.
  2. Decorative box-shadows are completely removed from cards and section containers.
  3. Theme switching seamlessly alternates between light mode, dark mode, and selected color palettes.
**Plans**: 3 plans
- [x] `04-01`: Eliminate decorative box-shadows and vertical lift, and normalize scrollbar tokens in index.css
- [x] `04-02`: Ensure RTL-safe positioning for dialog/sheet close buttons and batch Google Fonts @import rules
- [x] `04-03`: Verify theme/palette switching with zero transition flicker, upgrade theme test suite, and update inventory

### Phase 5: Centralized Stepper Wizard Engine
**Goal**: Consolidate document preparation across Upload & Send, BulkSend, SelfSignature, and Templates into a single reusable stepper engine.
**Depends on**: Phase 4
**Requirements**: ENG-01
**Success Criteria**:
  1. Step 1 (Upload/Source), Step 2 (Canvas Placement), and Step 3 (Review/Send) share a unified component architecture.
  2. Code duplication across the 4 major signing flows is reduced by >40%.
**Plans**: 3 plans
- [x] `05-01`: Centralized Navigation Stepper Component & Hook Engine with 11 unit tests
- [x] `05-02`: Step 1 (Document Source & Upload Engine) shared extraction and consolidation across all 4 flows
- [x] `05-03`: Step 2 & Step 3 wizard architecture consolidation with preserved canvas coordinate calculations

### Phase 6: Unified Document Status Table Engine
**Goal**: Construct a standardized, reusable document status table component powering all dashboard status lists.
**Depends on**: Phase 4
**Requirements**: ENG-02
**Success Criteria**:
  1. Pending, Draft, Completed, Declined, Recalled, and Inactive lists share common table, filter, and pagination logic.
  2. Search, date filters, sorting, and action menus function identically across all status routes.
**Plans**: 2 plans
- [x] `06-01`: Standardize and build DocumentStatusTable engine, statusTableConfig, and unit test suite
- [x] `06-02`: Refactor all status views (Draft, Completed, Declined, Recalled, Inactive, Pending) to consume DocumentStatusTable

### Phase 7: DMS Universal File Upload & API Integration
**Goal**: Implement universal multi-format file uploads into DMS folders and wire up remaining backend endpoints.
**Depends on**: Phase 6
**Requirements**: DMS-01, DMS-02
**Success Criteria**:
  1. Users can upload any file type (up to 100MB) with real-time progress indicators and metadata tags.
  2. All hardcoded mock data in `src/Components/DMS/` is replaced by live DMS API calls.
**Plans**: 2 plans
- [x] `07-01`: Universal Multi-Format DMS File Upload Engine with Real-Time Progress & Metadata Tagging
- [x] `07-02`: DMS Live Backend API Integration, Mock Purge, and Inventory Verification

---

*Roadmap generated via /gsd-ingest-docs on 2026-10-24*
