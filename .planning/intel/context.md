# Synthesized Context

## Document Lifecycle & User Experience
- source: docs/IamSigner-Client-Features-Presentation.md
- notes: IAMSigner provides electronic signature workflows covering individual self-signing, multi-party recipient signing with enforceable order, template generation for repeated workflows, and bulk sending via spreadsheet upload. Documents transition across states: Draft -> Pending -> Completed / Declined / Recalled / Expired.

## Legal Compliance & Audit Trails
- source: docs/IamSigner-Client-Features-Presentation.md
- notes: Every signing event (viewed, authenticated, signed, declined) records an immutable legal audit trail with IP address, timestamp, device metadata, and signature verification hash. Audit certificates can be viewed in-app or downloaded as standalone legal PDFs.

## Development Environment & Tooling
- source: docs/GUIDE.md
- notes: The project is bundled with Vite 6, using React 19 and Tailwind CSS 3.4. Development server runs on port 3000 (`npm run dev`). Production build compiles to `build/` (`npm run build`). IIS URL rewrites are defined in `web.config`.
