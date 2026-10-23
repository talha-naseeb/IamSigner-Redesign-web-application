---
last_mapped_commit: 12c772748142bd7383929470449986e10caefa13
last_mapped_at: 2026-10-24
---
# Codebase Structure

**Analysis Date:** 2026-10-24

## Directory Layout

```text
/Users/talhajutt/Desktop/Macquires/Iamsigner project/IamSigner Redesign/
├── .planning/                  # GSD planning artifacts, codebase maps, roadmap, state
│   └── codebase/               # Structured codebase analysis documents
├── docs/                       # Project specifications, PRDs, and API requirement docs
├── public/                     # Static public assets (favicon, manifest, robot configs)
├── src/                        # Main application source code
│   ├── Api/                    # Axios instances, request/response interceptors, error handling
│   ├── assets/                 # Brand images, SVGs, logos, and Lottie animations
│   ├── Components/             # Reusable UI components, feature modules, and shared dialogs
│   │   ├── BulkSend/           # Bulk CSV upload and batch recipient signing workflows
│   │   ├── Cobranding/         # Custom branding, logos, stamps, and subscription plan status
│   │   ├── Comments/           # Document comment threads and discussion lists
│   │   ├── Common/             # Modern shadcn-style UI primitives (AppModal, AppDrawer, Dialog)
│   │   ├── CommonModals/       # Shared modals (DocumentComments, CustomToast)
│   │   ├── CreateTeam/         # App user administration, team member creation and editing
│   │   ├── DashboardStatuses/  # Status list tables (Pending, Draft, Complete, Decline, Inactive)
│   │   ├── Delegation/         # Signer delegation management and date ranges
│   │   ├── Department/         # Department management and assignment tables
│   │   ├── DMS/                # Document Management System file browser, folder tree, and panels
│   │   ├── EmailTemplates/     # Email notification templates and rich-text editor
│   │   ├── Folder/             # Legacy folder views and document tables
│   │   ├── Language/           # i18n configuration and language switchers
│   │   ├── Layout/             # Application layout shell (Header, Sidebar, Content Canvas)
│   │   ├── Navbar/             # Top header bar, breadcrumbs, user profile dropdown, menu hooks
│   │   ├── OneDrive/           # Microsoft OneDrive MSAL authentication and file picker
│   │   ├── ReportDashboard/    # Company profile reports, user document charts, and exports
│   │   ├── SelfSignature/      # Self-signing workflow and document placement canvas
│   │   ├── Translation/        # Bilingual localization JSON files (English & Arabic)
│   │   └── Upload Flow/        # Multi-step Upload & Send workflow, signatories, and canvas
│   ├── Constants/              # Global constants, API status codes, and enum definitions
│   ├── Context/                # Global React contexts (UserContext, ThemeContext, TourProvider)
│   ├── Helpers/                # General utility functions, validation logic, and navigation hooks
│   ├── Integrations/           # Third-party integrations (Webhooks, Mac AI docs, SMS)
│   ├── lib/                    # Shared library utilities (Tailwind `cn()` class merger)
│   ├── Pages/                  # Route-level page components
│   │   ├── AuditTrail/         # Legal audit trail view and PDF download page
│   │   ├── Auth/               # Authentication pages (Login, Signup, ForgotPassword, PasswordChange)
│   │   ├── Errors/             # HTTP error pages (Forbidden 403, 404 handler)
│   │   ├── Home/               # Main user dashboard and quick action cards
│   │   ├── Profile/            # User profile, personal info, signatures, and stamps
│   │   ├── SignaturePage/      # Public recipient signing canvas and signature modal
│   │   └── Templates/          # Template management, creation, and editing flows
│   ├── routes/                 # Route configuration, URL paths, and access control guards
│   ├── services/               # Business logic, API services, and centralized token manager
│   ├── StatusActivity/         # Inactive session timeout and user activity listeners
│   ├── styles/                 # Shared styles and third-party theme adaptations
│   ├── utils/                  # Security utilities (reCAPTCHA v3 wrapper)
│   ├── App.js                  # Top-level React component and context wrapper
│   ├── index.css               # Central design system, tokens, and CSS variables
│   └── index.js                # React DOM entry point
├── package.json                # Project dependencies, scripts, and build configuration
├── tailwind.config.js          # Tailwind CSS configuration mapping tokens to CSS variables
├── vite.config.js              # Vite bundler configuration, aliases, and dev server settings
└── web.config                  # Windows IIS web server rewrite rules for client-side routing
```

## Directory Purposes

**`src/Api/`:**
- Purpose: Configures HTTP clients for network communication.
- Contains: `api.js` (core Axios client), `dmsApi.js` (DMS Axios client), `apiHandlers.js` (interceptors), `errorHandler.js` (error normalization).
- Key files: `src/Api/api.js`, `src/Api/apiHandlers.js`.

**`src/routes/`:**
- Purpose: Declares all route paths, layout bindings, and security guards.
- Contains: `AppRouter.js`, `paths.js`, `Guards/AuthGuard.js`, `Guards/RoleGuard.js`.
- Key files: `src/routes/AppRouter.js`, `src/routes/Guards/RoleGuard.js`.

**`src/services/`:**
- Purpose: Encapsulates API requests, data models, token persistence, and business logic.
- Contains: `tokenManager.js`, `authService.js`, `documentService.js`, `userService.js`, `uploadFlowService.js`.
- Key files: `src/services/tokenManager.js`, `src/services/userService.js`.

**`src/Context/`:**
- Purpose: Application-wide state distribution and theme engines.
- Contains: `UserContext.js` (identity and permissions), `ThemeContext.js` (light/dark/palette state), `themeUtils.js`, `AppTourProvider.js`.
- Key files: `src/Context/UserContext.js`, `src/Context/ThemeContext.js`.

**`src/Components/Common/`:**
- Purpose: Reusable modern UI component primitives styled with `--modern-*` tokens and Tailwind.
- Contains: `AppModal/AppModal.js`, `AppDrawer/AppDrawer.js`, `AppConfirmModal/AppConfirmModal.js`.

**`src/Components/Upload Flow/`:**
- Purpose: The multi-step document upload, recipient setup, field placement, and sending experience.
- Contains: `UploadDoc/UploadDoc.js`, `Step1/FirstStep.js`, `Step2/Secondstep.js`, `Step3/Thirdstep.js`, `Signatories/Signatories.js`.

## Key File Locations

**Entry Points:**
- `src/index.js`: Mounts React application, applies initial theme, and sets up Google OAuth provider.
- `src/App.js`: Root component mounting routers, theme, user context, toast notifications, and activity listeners.
- `index.html`: Base HTML template hosting root DOM container (`#root`).

**Configuration:**
- `vite.config.js`: Dev server, module resolution aliases, environment variable exposure.
- `tailwind.config.js`: Design system mapping to `--modern-*` variables.
- `src/index.css`: Master design token repository defining surfaces, borders, typography, and palettes.
- `src/routes/paths.js`: Centralized URL route constants.

**Core Logic:**
- `src/services/tokenManager.js`: Central memory-first authentication token lifecycle.
- `src/routes/Guards/RoleGuard.js`: Multi-factor RBAC authorization evaluator.
- `src/Context/UserContext.js`: Authenticated user state provider.

**Testing:**
- `src/Context/themeUtils.test.js`: Unit tests for theme initialization and document application.
- `src/App.test.js`: Smoke test verifying root render.

## Naming Conventions

**Files:**
- React Components & Pages: PascalCase (`UserProfile.js`, `RecentDocuments.js`, `UploadDoc.js`).
- Hooks: camelCase with `use` prefix (`useMenuConfig.js`, `useDmsFolderData.js`, `useIAmSignerChat.js`).
- Services & Utilities: camelCase (`tokenManager.js`, `authService.js`, `validation.js`).
- Stylesheets: kebab-case or PascalCase matching component (`index.css`, `Home.css`, `sidebarStyle.css`).

**Directories:**
- Feature Modules & Components: PascalCase (`DashboardStatuses`, `SelfSignature`, `CommonModals`).
- Core Infrastructure: lowercase or camelCase (`routes`, `services`, `lib`, `utils`).
- Note: `src/Components/Upload Flow` contains an embedded space; require quotes or backslashes in shell commands.

## Where to Add New Code

**New Feature / Screen:**
- Route component: `src/Pages/<FeatureName>/<FeatureName>.js`
- Route definition: Register path in `src/routes/paths.js` and add guarded route entry in `src/routes/AppRouter.js`.
- Feature subcomponents: `src/Components/<FeatureName>/`
- Business service: `src/services/<featureName>Service.js`

**New Reusable UI Component:**
- Primitive control (button, dialog, input): `src/Components/Common/` or `src/Components/UI/`
- Style with CSS variables (`var(--modern-*)`) and Tailwind utility classes via `cn()` in `src/lib/utils.js`.

**New Shared State:**
- React Context: Create `src/Context/<Feature>Context.js` and mount provider in `src/App.js`.

**Utilities & Helpers:**
- General helpers: `src/Helpers/<helperName>.js`
- Core UI utilities: `src/lib/utils.js`

## Special Directories

**`.planning/`:**
- Purpose: Stores GSD state, codebase maps, roadmaps, and requirements.
- Generated: Managed by GSD tools and agents.
- Committed: Yes.

**`docs/`:**
- Purpose: Functional requirements, PRDs, and API architecture specifications.
- Committed: Yes.

**`build/`:**
- Purpose: Production Vite build artifacts.
- Generated: Yes (via `npm run build`).
- Committed: No (in `.gitignore`).

---

*Structure analysis: 2026-10-24*
