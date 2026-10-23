---
last_mapped_commit: 12c772748142bd7383929470449986e10caefa13
last_mapped_at: 2026-10-24
---
# Technology Stack

**Analysis Date:** 2026-10-24

## Languages

**Primary:**
- JavaScript (ES6+ / React JSX) - Core application logic, React components, and state management in `src/`
- CSS3 - Design tokens, global theme styles, and component stylesheets in `src/index.css` and `src/**/*.css`
- HTML5 - Application shell in `index.html`

**Secondary:**
- JSON - Localization dictionaries in `src/Components/Translation/` (`en/translation.json`, `ar/translation.json`), component config in `components.json`, and project metadata in `package.json`

## Runtime

**Environment:**
- Browser Single Page Application (SPA)
- Node.js (v18+ recommended) for development tooling, dependency resolution, and build bundling

**Package Manager:**
- npm (package-lock.json v3 present)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- React 19.3.1 (`react`, `react-dom`) - Component-based user interface library
- React Router DOM 6.14.2 (`react-router-dom`) - Client-side declarative routing and route guarding in `src/routes/`

**UI & Styling:**
- Tailwind CSS 3.4.19 (`tailwindcss`, `tailwindcss-animate`) - Utility-first styling with disabled preflight to prevent CSS resets from breaking existing layouts
- Radix UI primitives (`@radix-ui/react-dialog`) - Accessible modal, dialog, and overlay primitives in `src/Components/Common/`
- Styled Components 6.6.0 (`styled-components`) - Dynamic CSS-in-JS for specific canvas and widget components
- CSS Variables Design System (`src/index.css`) - Centralized `--modern-*` design tokens supporting light mode, dark mode, and multiple brand palettes

**Testing:**
- React Testing Library 16.3.2 (`@testing-library/react`) - Component rendering and DOM assertions
- Jest DOM 6.9.1 (`@testing-library/jest-dom`) - Custom matchers for DOM node expectations
- User Event 13.5.0 (`@testing-library/user-event`) - User interaction simulation

**Build/Dev:**
- Vite 6.4.5 (`vite`, `@vitejs/plugin-react`) - Next-generation frontend build tool and dev server
- PostCSS 8.5.31 (`postcss`, `autoprefixer`) - CSS post-processing pipeline

## Key Dependencies

**Critical:**
- `axios` (v1.5.0) - Promise-based HTTP client with centralized interceptors in `src/Api/api.js` and `src/Api/apiHandlers.js`
- `@azure/msal-browser` (v4.28.1) & `@azure/msal-react` (v3.0.25) - Microsoft Authentication Library for OneDrive cloud file picking and Azure identity
- `@react-oauth/google` (v0.12.1) - Google Identity Services OAuth integration for authentication
- `react-signature-canvas` (v1.0.7) - HTML5 canvas digital signature capture component
- `i18next` (v23.16.8) & `react-i18next` (v14.0.0) - Internationalization and RTL support for English and Arabic
- `date-fns` (v3.6.0) - Date formatting, parsing, and arithmetic
- `lucide-react` (v1.61.0) & `react-icons` (v4.10.1) - Vector icon sets
- `clsx` (v2.1.1), `tailwind-merge` (v3.7.0), `class-variance-authority` (v0.7.1) - Utility function `cn()` for conditional Tailwind class merging in `src/lib/utils.js`
- `dompurify` (v3.2.1) & `rehype-sanitize` (v6.0.0) - Cross-site scripting (XSS) sanitizer for user input and markdown rendering
- `idle-session-timeout` (v1.0.1) - Inactive user session detection and automatic logout handling in `src/StatusActivity/UserActivityStatus.js`

**Infrastructure & Utilities:**
- `xlsx` (v0.18.5) & `papaparse` (v5.4.1) - Excel sheet and CSV document parsing for Bulk Send flows
- `html2canvas` (v1.4.1) & `react-to-pdf` (v1.0.1) - Client-side canvas rasterization and PDF generation
- `file-saver` (v2.0.5) - Browser file download manager
- `react-zoom-pan-pinch` (v3.1.0) & `react-draggable` (v4.4.5) - Canvas zooming, panning, and draggable field placement
- `@hello-pangea/dnd` (v18.0.1) & `react-dnd` (v16.0.1) - Drag-and-drop signing order management
- `lottie-web` (v5.12.2) & `react-lottie` (v1.2.4) - Animated vector loaders and empty-state graphics

## Configuration

**Environment:**
- `.env` file present - contains environment-specific API URLs, cloud client IDs, and feature flags. (Sensitive credentials and tokens are strictly kept out of version control).
- Environment variables are exposed via `vite.config.js` with `process.env` definitions for backward compatibility with Create React App conventions (`process.env.REACT_APP_*`).

**Build:**
- `vite.config.js` - Configures development server on port 3000, build output to `build/`, JSX handling for `.js` files, path aliases (`@` -> `/src`, `@/Components/ui` -> `/src/Components/UI`), and 1600 kB chunk warning threshold.
- `tailwind.config.js` - Disables Tailwind preflight (`corePlugins.preflight: false`) to safeguard legacy styles during redesign, maps theme colors directly to `--modern-*` CSS variables, and enables `tailwindcss-animate`.
- `postcss.config.js` - Configures Tailwind CSS and Autoprefixer plugins.
- `jsconfig.json` - Defines IDE path alias resolution for `@/*` mapped to `src/*`.
- `web.config` - IIS server routing rewrite rules for client-side SPA routing.

## Platform Requirements

**Development:**
- Node.js 18+ or 20+
- npm 9+
- Modern Chromium, Gecko, or WebKit browser with developer tools

**Production:**
- Static web server (NGINX, Apache, IIS via `web.config`, Cloudflare Pages, AWS S3/CloudFront) capable of redirecting all routes to `index.html` for client-side routing.

---

*Stack analysis: 2026-10-24*
