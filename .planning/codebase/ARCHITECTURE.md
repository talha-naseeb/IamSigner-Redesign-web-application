---
last_mapped_commit: 12c772748142bd7383929470449986e10caefa13
last_mapped_at: 2026-10-24
---
<!-- refreshed: 2026-10-24 -->

# Architecture

**Analysis Date:** 2026-10-24

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Presentation & UI Layer                               │
├─────────────────────────┬─────────────────────────┬─────────────────────────┤
│    Public Routes        │    Protected Shell      │    Signing Canvases     │
│   `src/Pages/Auth/`     │ `src/Components/Layout/`│`src/Pages/SignaturePage`│
│ `src/Pages/Errors/403`  │ `src/Components/Navbar/`│`src/Components/Upload/` │
└────────────┬────────────┴────────────┬────────────┴────────────┬────────────┘
             │                         │                         │
             ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Routing & Access Control Layer                           │
│  `src/routes/AppRouter.js`  │  `src/routes/Guards/AuthGuard.js`              │
│  `src/routes/paths.js`      │  `src/routes/Guards/RoleGuard.js`              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    State & Context Layer (Global Memory)                    │
│  `src/Context/UserContext.js`        │  `src/Context/ThemeContext.js`       │
│  `src/Context/AppTourProvider.js`    │  `src/Context/themeUtils.js`         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Business Services & Security                             │
│  `src/services/tokenManager.js`      │  `src/services/userService.js`        │
│  `src/services/documentService.js`   │  `src/services/uploadFlowService.js`  │
│  `src/services/templateService.js`   │  `src/services/authService.js`        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HTTP Client & API Gateways                            │
│  `src/Api/api.js` (Axios Core)       │  `src/Api/dmsApi.js` (Axios DMS)     │
│  `src/Api/apiHandlers.js`            │  `src/Api/errorHandler.js`           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    External APIs & Remote Services                          │
│  Backend IAMSigner REST API   │  DMS Microservice   │  OAuth / Cloud Drives │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App.js` | Top-level provider orchestrator (Router, I18n, Theme, User, Tour, Toast, Activity Status) | `src/App.js` |
| `AppRouter.js` | Route table definition, public route exposure, and protected route guard assignment | `src/routes/AppRouter.js` |
| `AuthGuard.js` | Validates session token presence before permitting access to protected shell routes | `src/routes/Guards/AuthGuard.js` |
| `RoleGuard.js` | Evaluates user AccountType (`B`/`I`), RoleID (1..4), userAccess flags, and subscription validity | `src/routes/Guards/RoleGuard.js` |
| `tokenManager.js` | In-memory JWT access token manager with refresh scheduling and base64 sessionStorage resilience | `src/services/tokenManager.js` |
| `UserContext.js` | Fetches, holds, and distributes authenticated user identity, account configuration, and permission flags | `src/Context/UserContext.js` |
| `ThemeContext.js` | Controls application theme (`light`/`dark`) and dynamic accent palette (`indigo`, `rose`, etc.) | `src/Context/ThemeContext.js` |
| `Layout.js` | Main application shell layout providing unified sidebar navigation, top header, and page canvas | `src/Components/Layout/Layout.js` |
| `Sidebar.js` | Collapsible sidebar with navigation items filtered by user permissions and DMS feature flag | `src/Components/Navbar/Sidebar.js` |
| `api.js` / `apiHandlers.js` | Configures centralized Axios client with request authorization headers and response status handling | `src/Api/api.js`, `src/Api/apiHandlers.js` |
| `errorHandler.js` | Centralized response error normalization, session expiration handling, and toast alerts | `src/Api/errorHandler.js` |
| `SignaturePage.js` | Public interactive document viewer and signature placement execution canvas | `src/Pages/SignaturePage/SignaturePage.js` |
| `UploadDoc.js` | Multi-step document preparation, recipient management, field placement, and dispatch flow | `src/Components/Upload Flow/UploadDoc/UploadDoc.js` |
| `DMS.js` | Document Management System file browser, folder tree, and permission management | `src/Components/DMS/DMS.js` |

## Pattern Overview

**Overall:** Layered Component-Driven Single Page Architecture (SPA) with In-Memory Token Management and Declarative Route Guarding.

**Key Characteristics:**
- **Separation of Presentation and Services:** UI components in `src/Pages/` and `src/Components/` delegate network communication to specialized service modules in `src/services/`.
- **Token Security Architecture:** Access tokens are stored primarily in memory in `src/services/tokenManager.js`, with session-scoped fallback for tab persistence and silent refresh dispatching.
- **Declarative RBAC Guarding:** Routing architecture uses nested route layouts in React Router 6, applying `AuthGuard` and `RoleGuard` as layout wrappers that check granular user attributes before rendering child components.
- **Token-Based Design System:** Shared CSS variable tokens (`--modern-*` in `src/index.css`) govern all surface backgrounds, borders, card layers, typography, and accent colors across light mode, dark mode, and multi-palette variations without hardcoded hex values.

## Layers

**Presentation Layer:**
- Purpose: Render user interfaces, forms, canvas drawing tools, tables, and dialogs.
- Location: `src/Pages/`, `src/Components/`
- Contains: React functional components, hooks, local styles, and shadcn-style UI primitives (`src/Components/Common/`).
- Depends on: Context providers, routing constants (`src/routes/paths.js`), services (`src/services/`), and utilities (`src/lib/utils.js`).
- Used by: End users interacting in web browsers.

**State & Context Layer:**
- Purpose: Maintain application-wide state (user profile, authentication status, theme, visual palette, tours).
- Location: `src/Context/`
- Contains: React context objects, providers, custom hooks (`useUser`, `useTheme`, `useAppTour`).
- Depends on: Services (`src/services/tokenManager.js`, `src/services/userService.js`).
- Used by: Presentation layer components across the tree.

**Routing & Access Control Layer:**
- Purpose: Match browser URL to component views and enforce authentication / authorization rules.
- Location: `src/routes/`
- Contains: `AppRouter.js`, `paths.js`, `Guards/AuthGuard.js`, `Guards/RoleGuard.js`.
- Depends on: `src/services/tokenManager.js`, `src/Context/UserContext.js`.
- Used by: `src/App.js` as the application router entry point.

**Service & API Layer:**
- Purpose: Encapsulate REST API interactions, token lifecycle, data transforms, and business logic.
- Location: `src/services/`, `src/Api/`
- Contains: Axios client instances (`api.js`, `dmsApi.js`), interceptors (`apiHandlers.js`), error handlers (`errorHandler.js`), domain services (`documentService.js`, `userService.js`, etc.).
- Depends on: `axios`, `src/Constants/apiStatuses.js`.
- Used by: Presentation layer and Context providers.

## Data Flow

### Primary Request Path (Protected Data Retrieval)

1. User navigates to a protected route (e.g., `/home` or `/pending-docs`).
2. `AuthGuard` checks `tokenManager.hasToken()`. If valid, child route renders; otherwise redirects to `/login` preserving target location (`src/routes/Guards/AuthGuard.js:15-17`).
3. Component mounts and invokes domain service (e.g. `dashboardService.getRecentDocuments()` in `src/services/dashboardService.js`).
4. Axios request interceptor pulls current JWT token from `tokenManager.getToken()` and sets `Authorization: Bearer <token>` header (`src/Api/apiHandlers.js:7-16`).
5. Axios response interceptor verifies HTTP status and custom business status code (`response.data.statusCode`):
   - Status 200 / Success: Returns data payload to service caller (`src/Api/apiHandlers.js:27-28`).
   - Session Expired (`API_STATUS.EXPIRED`): Calls `handleSessionExpiry()` to clear tokens and route to `/login` (`src/Api/apiHandlers.js:30-38`).
6. Component updates local React state and renders refreshed data.

### Secondary Flow: Multi-Factor Role Authorization

1. User requests restricted resource (e.g., `/app-users` or `/company-profile/:accountId`).
2. `RoleGuard` inspects `user` and `userAccess` from `useUser()` (`src/routes/Guards/RoleGuard.js:18`):
   - Check AccountType (`B` Business required).
   - Check numeric `RoleID` against allowed roles.
   - Check active subscription (`remainingDays > 0`).
   - Check feature entitlement flag (`userAccess[requiredPermission]`).
3. If any check fails, renders `<Forbidden403 />` with prescriptive reason string without leaking data or redirecting incorrectly (`src/routes/Guards/RoleGuard.js:25-48`).

## Anti-Patterns

### Hardcoded Surface Colors & Ad-hoc Hex Values

**What happens:** Using inline styles or arbitrary CSS color codes (`#ffffff`, `#1e293b`) in components instead of `--modern-*` tokens.
**Why it's wrong:** Breaks dark mode, palette switching, and violates the shared visual system established in `AGENTS.md`.
**Do this instead:** Use token classes or CSS variables: `bg-[var(--modern-card)]`, `text-[var(--modern-text)]`, `border-[var(--modern-border)]` (refer to `src/index.css`).

### Direct LocalStorage Token Writing

**What happens:** Storing raw JWT access tokens directly in `localStorage.setItem("token", ...)` across unrelated components.
**Why it's wrong:** Vulnerable to XSS token theft and causes session crosstalk across tabs in multi-account scenarios.
**Do this instead:** Interact exclusively via `tokenManager.setToken()` and `tokenManager.getToken()` in `src/services/tokenManager.js`.

### Ad-hoc API Calls Inside Component Lifecycles

**What happens:** Instantiating raw `axios.get()` or `fetch()` inside a component without using `src/Api/api.js`.
**Why it's wrong:** Bypasses token injection, session expiry handling, and centralized error notification toasts.
**Do this instead:** Call the appropriate domain method in `src/services/` or use the configured instance from `src/Api/api.js`.

## Error Handling

**Strategy:** Centralized interceptor pipeline with graceful UI degradation and non-blocking toast notifications.

**Patterns:**
- HTTP Errors & 401/403: Normalized in `src/Api/errorHandler.js`, converting backend response messages into user-friendly localized toast notifications.
- Session Expiry: Intercepted before state corruption via `handleSessionExpiry()`, invoking `tokenManager.clearToken()` and redirecting to `/login`.
- Form & Validation Errors: Surfaced inline next to input fields using `react-hook-form` or state validators, accompanied by toast alerts.

## Cross-Cutting Concerns

**Logging:** Performance logging via `src/reportWebVitals.js`; client console logging for development environment.
**Validation:** Client-side sanitization via `dompurify` and regex validators in `src/Helpers/validation.js` and `src/utils/recaptcha.js`.
**Authentication & Authorization:** Memory-first token manager (`src/services/tokenManager.js`), declarative route guards (`src/routes/Guards/`), and account type / role checks (`RoleGuard.js`).
**Styling & Theming:** Centralized CSS variable system (`src/index.css`), Tailwind CSS configuration with modern token mapping, and theme persistence in `src/Context/ThemeContext.js`.

---

*Architecture analysis: 2026-10-24*
