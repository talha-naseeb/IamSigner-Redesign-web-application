---
last_mapped_commit: 12c772748142bd7383929470449986e10caefa13
last_mapped_at: 2026-10-24
---
# Codebase Concerns

**Analysis Date:** 2026-10-24

## Tech Debt

**Monolithic Feature Components:**
- Issue: Several critical feature components exceed 1,000 lines of code, conflating UI rendering, canvas calculations, modal state, and API network requests.
- Files:
  - `src/Components/DMS/DMS.js` (2,144 lines)
  - `src/Pages/SignaturePage/SignaturePage.js` (1,575 lines)
  - `src/Components/SelfSignature/SignaturePage/SignaturePageSelf.js` (1,143 lines)
  - `src/Components/BulkSend/Step3/Thirdstep.js` (1,083 lines)
- Impact: Increases cognitive load during maintenance, slows down hot reload times, and makes isolated unit testing difficult.
- Fix approach: Extract sub-components (toolbar, page canvas, thumbnail rail, modals) and extract custom hooks for document data and signing actions.

**Embedded Space in Directory Path:**
- Issue: The directory `src/Components/Upload Flow/` contains a literal space character.
- Files: `src/Components/Upload Flow/**`
- Impact: Causes shell commands, scripts, and build tools to break unless paths are explicitly escaped with quotes or backslashes.
- Fix approach: Rename `src/Components/Upload Flow/` to `src/Components/UploadFlow/` in a dedicated refactoring step with updated import references.

**Backward Compatibility Token Mirroring:**
- Issue: `tokenManager.js` sets `sessionStorage.setItem("token", token)` alongside `_enc_tk` to maintain compatibility with legacy components reading `sessionStorage.getItem("token")`.
- Files: `src/services/tokenManager.js:27`
- Impact: Duplicates storage and delays full migration to strict in-memory token governance.
- Fix approach: Audit remaining components and replace all direct `sessionStorage.getItem("token")` accesses with `tokenManager.getToken()`.

## Known Bugs & Gaps

**Missing `test` Script in `package.json`:**
- Symptoms: Running `npm test` fails or defaults to an unconfigured runner because `package.json` only defines `"start"`, `"dev"`, `"build"`, and `"preview"`.
- Files: `package.json:68-73`
- Trigger: Attempting to run automated tests from CLI or CI pipeline.
- Workaround: Manually invoking testing tools or adding `"test": "react-scripts test"` / `"vitest"`.
- Fix approach: Add an explicit `"test"` script in `package.json` utilizing Vitest or Jest.

**Static Fallback User IDs in Workflows:**
- Symptoms: Several components fall back to `process.env.REACT_APP_STATIC_ADHOCK_USER_ID` when dynamic user session IDs are undefined.
- Files:
  - `src/Components/Upload Flow/Step3/Thirdstep.js:411`
  - `src/Components/BulkSend/Step3/Thirdstep.js:402`
  - `src/Components/Comments/Comments.js:91`
- Trigger: Actions taken when user profile state is partially loaded.
- Workaround: Relies on static environment configuration.
- Fix approach: Require dynamic authenticated `user.UserId` from `UserContext` and disable dispatch actions until identity is fully resolved.

## Security Considerations

**Client-Side In-Memory Token Handling:**
- Risk: Cross-Site Scripting (XSS) could attempt to access tokens in memory or sessionStorage.
- Files: `src/services/tokenManager.js`, `src/services/authService.js`
- Current mitigation: Obfuscated base64 sessionStorage encoding (`_enc_tk`), automatic memory-first access, and strict HTML sanitization via `dompurify` and `rehype-sanitize`.
- Recommendations: Implement HTTP-only secure cookie authentication where possible, and enforce strict Content Security Policy (CSP) headers in production.

**Public Signing URL Tampering:**
- Risk: Public signing links (`/SignNow/:documentId/:signerId`) must strictly validate that the signer token matches the document state before displaying private PDF content.
- Files: `src/Pages/SignaturePage/SignaturePage.js`
- Current mitigation: Backend validates signing tokens and verification hashes upon fetching document metadata.
- Recommendations: Ensure expired and recalled documents cannot be viewed in cache, as already enforced by `/link-expired` and `/doc-recalled` handlers.

## Performance Bottlenecks

**Large Bundle Size & Missing Route Splitting:**
- Problem: `chunkSizeWarningLimit` is set to 1,600 kB in `vite.config.js` to silence build warnings caused by heavy dependencies (`xlsx`, `apexcharts`, `pdf` generators, `msal`).
- Files: `vite.config.js:37`, `src/routes/AppRouter.js`
- Cause: All page components and third-party libraries are eagerly imported at the top of `AppRouter.js`.
- Improvement path: Introduce `React.lazy()` and `Suspense` for heavy routes (e.g. `BulkSend`, `DMS`, `ReportDashboard`, `MacAiGeneratedDocs`).

**Client-Side PDF Generation and Canvas Rasterization:**
- Problem: `html2canvas` and `react-to-pdf` execution blocks the browser main thread during multi-page document export.
- Files: `src/Pages/AuditTrail/AuditTrail.js`, `src/Integrations/MacAiGeneratedDocs/AIGeneratedPDF.js`
- Cause: Synchronous DOM rasterization on large canvases.
- Improvement path: Offload heavy PDF compilation to backend server endpoints or Web Workers.

## Fragile Areas

**Coordinate Mapping on Responsive PDF Canvases:**
- Files:
  - `src/Pages/SignaturePage/SignaturePage.js`
  - `src/Components/Upload Flow/Step2/DisplayCenterImage.js`
  - `src/Components/SelfSignature/Step2/DisplayCenterImage.js`
- Why fragile: Signature boxes, initials, dates, and checkboxes placed on the canvas must translate between dynamic screen pixel dimensions (with pinch/zoom) and fixed PDF coordinate points (points/inches). Slight calculation drifts can cause signatures to burn into the final PDF in the wrong location.
- Safe modification: Thoroughly verify coordinate calculations against varying zoom levels and screen viewports whenever touching canvas layout code.
- Test coverage: Currently relies on manual testing.

## Scaling Limits

**Client-Side Batch Recipient Processing in Bulk Send:**
- Current capacity: Efficient for hundreds of rows in CSV/XLSX.
- Limit: Parsing spreadsheets with thousands of recipient rows in browser memory can cause UI jank or tab crashes.
- Scaling path: Introduce chunked web worker parsing or direct server-side CSV streaming.

## Dependencies at Risk

**React 19 Ecosystem Compatibility:**
- Package: `react` (v19.3.1), `react-dom` (v19.3.1)
- Risk: Several legacy dependencies (`react-color`, `react-lottie`, `react-to-pdf`, `react-zoom-pan-pinch`) were written for React 16/17/18 and may throw warnings or deprecation errors regarding `ref` forwarding, `findDOMNode`, or StrictMode.
- Impact: Potential subtle runtime warnings or broken integrations during library updates.
- Migration plan: Monitor vendor updates and migrate to native HTML canvas / SVG components where applicable.

## Test Coverage Gaps

**Untested Business Services and UI Components:**
- What's not tested:
  - `tokenManager.js`: Silent refresh scheduling, token decoding, and storage synchronization.
  - `RoleGuard.js`: Multi-factor authorization logic (account types, roles, subscription expiry).
  - Document signing workflows: Field validation, signature capture, and document recall.
- Files: `src/services/tokenManager.js`, `src/routes/Guards/RoleGuard.js`, `src/Pages/SignaturePage/SignaturePage.js`
- Risk: Regressions in authentication, security guards, or signing logic may go unnoticed until production deployment.
- Priority: High.

---

*Concerns audit: 2026-10-24*
