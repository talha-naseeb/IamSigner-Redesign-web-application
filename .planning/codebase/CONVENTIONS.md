---
last_mapped_commit: 12c772748142bd7383929470449986e10caefa13
last_mapped_at: 2026-10-24
---
# Coding Conventions

**Analysis Date:** 2026-10-24

## Naming Patterns

**Files:**
- React Components & Pages: PascalCase (`UserProfile.js`, `SignaturePage.js`, `RecentDocuments.js`)
- Custom Hooks: camelCase starting with `use` (`useMenuConfig.js`, `useDmsFolderData.js`, `useIAmSignerChat.js`)
- Services & API Gateways: camelCase (`tokenManager.js`, `authService.js`, `dmsApi.js`)
- Constants & Enums: camelCase or UPPER_SNAKE_CASE (`paths.js`, `apiStatuses.js`)
- Stylesheets: kebab-case or PascalCase matching component (`index.css`, `Home.css`, `sidebarStyle.css`)

**Functions:**
- Event Handlers: `handle` prefix (`handleLogin`, `handleStorageChange`, `handleSubmit`)
- Custom Hooks: `use` prefix (`useUser`, `useTheme`, `useAppTour`)
- Action/Service Verbs: descriptive camelCase (`getToken`, `decodePayload`, `applyThemeToDocument`, `fetchUserData`)

**Variables:**
- Local State & Instances: camelCase (`isAuthenticated`, `isDmsEnabled`, `userInfo`)
- Global Constants & Configuration: UPPER_SNAKE_CASE (`BASE_URL`, `API_STATUS`, `PATHS`, `GOOGLE_LOGIN_CLIENTID`)
- Boolean Flags: prefixed with `is`, `has`, `should`, or `can` (`isToken`, `hasToken`, `loading`)

**Types & Interfaces:**
- Pure JavaScript environment with JSDoc typing for complex function signatures and service modules.

## Code Style

**Formatting:**
- Standard 2-space indentation.
- Double quotes (`"`) preferred for JSX attributes and string literals.
- Semicolons used consistently at statement ends.

**Visual System Rules (Enforced by `AGENTS.md`):**
- **Token-Based Styling:** All surfaces, borders, text, and interactive states must use `--modern-*` CSS variables defined in `src/index.css`. Hardcoded hex values are strictly prohibited.
- **Zero Decorative Box-Shadows:** No `box-shadow` on dashboard cards, profile panels, section containers, or shell surfaces. Depth and hierarchy are achieved exclusively through surface color contrast (`--modern-bg` vs `--modern-card` vs `--modern-raised`) and borders (`--modern-border`).
- **Focus Rings & Interactions:** Use `outline` for accessible keyboard focus indicators. Signal hover and selected states through token-based border or surface color transitions; do not use vertical translation (lift) or shadows.
- **Inline Button Spinners:** When an action is initiated by a button, display a compact spinning loader inside the button while preserving the label. Do not block screens with full-page Lottie loader overlays.

## Import Organization

**Order:**
1. React core and hooks (`import React, { useState, useEffect } from "react";`)
2. Third-party packages (`react-router-dom`, `axios`, `lucide-react`, `date-fns`)
3. Internal alias imports (`@/routes/paths`, `@/Context/UserContext`, `@/services/tokenManager`)
4. Internal component imports (`@/Components/Common/AppModal/AppModal`)
5. Style sheets (`import "./index.css";`, `import "./style.css";`)

**Path Aliases:**
- `@/*` maps to `src/*` (configured in `vite.config.js` and `jsconfig.json`).
- `@/Components/ui` maps to `src/Components/UI`.

## Error Handling

**Patterns:**
- **Centralized Axios Interception:** Captured in `src/Api/errorHandler.js`. Backend error messages are extracted and passed to `toast.error()`.
- **Session Expiry:** Status `API_STATUS.EXPIRED` triggers `handleSessionExpiry()`, which safely removes credentials and redirects to `/login` with clean query state.
- **Guard Defenses:** Route guards (`RoleGuard.js`) render prescriptive, accessible error fallbacks (`<Forbidden403 reason="..." />`) rather than unhandled white-screens.

## Logging

**Framework:** Native browser `console`.

**Patterns:**
- In production, suppress unnecessary debugging logs.
- `console.error` is reserved for unhandled exceptions or caught API rejections.
- Performance monitoring uses `reportWebVitals.js` to log Core Web Vitals to telemetry collectors.

## Comments

**When to Comment:**
- Header comments explain architectural intent and security rationale (e.g. `tokenManager.js` documenting XSS defense).
- Complex regex patterns or security checks (e.g. base64 payload decoding).

**JSDoc/TSDoc:**
- Used on exported service methods to define parameters, return values, and side effects.

## Function Design

**Size:**
- Modular, focused components. Large workflows (e.g. `UploadDoc`) are split into discrete steps (`Step1/FirstStep`, `Step2/Secondstep`, `Step3/Thirdstep`).

**Parameters:**
- Destructured props with explicit default values in React components (`({ onLogin, isOpen = false }) => { ... }`).

**Return Values:**
- Clean JSX elements for components.
- Promises resolving to data objects or booleans for services.

## Module Design

**Exports:**
- Named exports preferred for utilities, constants, and hooks (`export const tokenManager = { ... }`).
- Default exports used for top-level React page components and guards (`export default AppRouter;`).

---

*Convention analysis: 2026-10-24*
