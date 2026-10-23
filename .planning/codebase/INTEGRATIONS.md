---
last_mapped_commit: 12c772748142bd7383929470449986e10caefa13
last_mapped_at: 2026-10-24
---
# External Integrations

**Analysis Date:** 2026-10-24

## APIs & External Services

**Core IAMSigner REST API:**
- Primary backend API providing authentication, document processing, signing workflows, template management, user admin, and audit trails.
  - SDK/Client: `axios` instance configured in `src/Api/api.js`
  - Authentication: JWT Bearer token dynamically injected via request interceptor from `tokenManager.getToken()` in `src/Api/apiHandlers.js`
  - Base URL env var: `REACT_APP_API_BASE_URL`

**Document Management System (DMS) API:**
- Dedicated API providing document and folder hierarchy, subfolders, search, access rights, and file storage operations.
  - SDK/Client: `axios` instance in `src/Api/dmsApi.js`
  - Base URL env var: `REACT_APP_DMS_API_BASE_URL`
  - Feature flag env var: `REACT_APP_ENABLE_DOCUMENT_MANAGER` in `src/routes/AppRouter.js` and `src/Components/Navbar/hooks/useMenuConfig.js`

**Cloud Storage Pickers:**
- **Google Drive:**
  - Used for importing documents directly from Google Drive during Upload & Send and Template creation flows.
  - Client: `react-google-drive-picker` in `src/Components/Common/CloudPickers/GoogleDrivePicker.js`
  - Auth: `REACT_APP_GOOGLE_CLIENT_ID`, `REACT_APP_GOOGLE_DEVELOPER_KEY`
- **Dropbox:**
  - Used for picking documents from Dropbox cloud storage into the signing workflow.
  - Client: `react-dropbox-chooser` in `src/Components/Common/CloudPickers/DropboxPicker.js`
  - Auth: `REACT_APP_DROPBOX_APP_KEY`
- **Microsoft OneDrive:**
  - Used for authenticating and choosing documents from Microsoft OneDrive personal/business storage.
  - Client: `@azure/msal-browser` and Microsoft Graph API client in `src/Components/OneDrive/oneDriveIntegration.js` and `src/Components/OneDrive/authConfig.js`
  - Auth: `REACT_APP_ONEDRIVE_CLIENTID`, `REACT_APP_ONEDRIVE_REDIRECT_URI_LOCAL`, `REACT_APP_ONEDRIVE_REDIRECT_URI_DEMO`, `REACT_APP_ONEDRIVE_REDIRECT_URI_PROD`

**Security & Anti-Bot Verification:**
- **Google reCAPTCHA v3:**
  - Invisible human verification on public authentication endpoints.
  - Client: `src/utils/recaptcha.js`
  - Auth: `REACT_APP_SITE_KEY_RECAPTCHA_V3`
  - Activation: Scoped conditionally via `RecaptchaPageScope` in `src/App.js` on `/login`, `/sign-up`, `/forgot-password`, and password reset routes.

**AI & Automation Services:**
- **n8n Automation Engine:**
  - Webhook integration powering automated assistant and workflow actions.
  - Client: HTTP post in `src/Context/useIAmSignerChat.js`
  - Webhook URL env var: `REACT_APP_N8N_AUTOMATION_WEBHOOK_URL`
- **Mac AI Document Crafting:**
  - Client-side document generation and drafting tools in `src/Integrations/MacAiGeneratedDocs/OpenAIComponent.js` and `src/Integrations/MacAiGeneratedDocs/AIGeneratedPDF.js`.

## Data Storage

**Databases:**
- No direct database access from frontend client; all persistent relational and document storage is mediated by the backend IAMSigner and DMS APIs.

**Client-Side Browser Storage:**
- `sessionStorage`:
  - `_enc_tk`: Obfuscated base64 access token copy providing page-refresh resilience without localStorage persistent disk vulnerability in `src/services/tokenManager.js`.
  - `token`: Synchronized fallback token for legacy integrations.
  - `auth_active`: Session validity indicator.
- `localStorage`:
  - `data-theme`: Active visual theme mode (`light` or `dark`).
  - `iamsigner_palette`: Custom accent palette (`indigo`, `blue`, `emerald`, `violet`, `rose`, `amber`, etc.).
  - `i18nextLng`: Active UI language (`en` or `ar`).
  - User details & profile metadata cache.

**File Storage:**
- IAMSigner backend server endpoints for signed PDFs, original uploads, signatures, and company stamps.
- Third-party cloud drives (OneDrive, Google Drive, Dropbox) for source document selection.

## Authentication & Identity

**Auth Providers:**
- **Native JWT Authentication:**
  - Managed by `src/services/authService.js` and `src/services/tokenManager.js`.
  - Memory-first token architecture with silent refresh scheduling via `scheduleRefresh()`.
- **Google OAuth 2.0:**
  - Managed via `@react-oauth/google` with provider mounted in `src/index.js` using `REACT_APP_GOOGLE_LOGIN_CLIENTID`.
- **Microsoft Entra ID / Azure AD:**
  - Managed via `@azure/msal-browser` and `@azure/msal-react` in `src/Components/OneDrive/authConfig.js`.

**Role-Based Access Control (RBAC):**
- Declarative guards in `src/routes/Guards/`:
  - `AuthGuard.js`: Enforces authentication via `tokenManager.hasToken()`.
  - `RoleGuard.js`: Multi-factor authorization inspecting `user.AccountType` (`B` vs `I`), `user.RoleID` (1: SuperAdmin, 2: Standard, 3: Restricted, 4: Admin), `userAccess` module flags, and `remainingDays` subscription validity.

## Monitoring & Observability

**Error Tracking & Notifications:**
- Centralized Axios interceptors in `src/Api/errorHandler.js` capture network errors, 401 unauthenticated, 403 forbidden, and backend validation errors.
- Dispatches unified, accessible toast notifications via `CustomToast.js` in `src/Components/CommonModals/CustomToast/CustomToast.js`.
- Session expiration handled cleanly via `handleSessionExpiry()` redirecting to `/login` without crashing in-flight states.

**Logs & Performance:**
- Performance tracking via `reportWebVitals.js` (`web-vitals` library).
- Console logging for non-production debugging.

## CI/CD & Deployment

**Hosting:**
- Static web server (NGINX, Apache, IIS).
- `web.config` provides IIS URL rewrite rules to map all SPA routes to `/index.html`.

**Build Pipeline:**
- Build command: `npm run build` (`vite build`). Output directory: `build/`.

## Environment Configuration

**Required Environment Variables (Existence noted):**
- `REACT_APP_API_BASE_URL` - Core backend API endpoint
- `REACT_APP_DMS_API_BASE_URL` - DMS backend API endpoint
- `REACT_APP_ENABLE_DOCUMENT_MANAGER` - Toggle DMS module features
- `REACT_APP_GOOGLE_LOGIN_CLIENTID` - Google OAuth client ID
- `REACT_APP_GOOGLE_CLIENT_ID` - Google Drive picker client ID
- `REACT_APP_GOOGLE_DEVELOPER_KEY` - Google API key
- `REACT_APP_DROPBOX_APP_KEY` - Dropbox application key
- `REACT_APP_ONEDRIVE_CLIENTID` - Microsoft Azure client ID
- `REACT_APP_SITE_KEY_RECAPTCHA_V3` - Google reCAPTCHA v3 site key
- `REACT_APP_N8N_AUTOMATION_WEBHOOK_URL` - n8n webhook automation URL

**Secrets Location:**
- Stored exclusively in deployment environment variables and local `.env` file (never committed to git repository).

## Webhooks & Callbacks

**Incoming:**
- OAuth redirect callbacks configured for Microsoft MSAL authentication in `src/Components/OneDrive/authConfig.js`.

**Outgoing:**
- Custom webhook dispatcher configured by users in `src/Integrations/webhookIntegration/CreateWebhook.js` for document event triggers (document signed, declined, expired).
- n8n automation webhook trigger in `src/Context/useIAmSignerChat.js`.

---

*Integration audit: 2026-10-24*
