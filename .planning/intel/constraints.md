# Synthesized Constraints

## CONSTR-01: Shared Design Token Protocol
- source: docs/IAMSigner-Design-System.md
- type: nfr
- content: All redesign components must utilize `--modern-*` design tokens from `src/index.css`. No decorative box-shadows on cards, shell surfaces, or panels. Use surface color contrast (`--modern-bg`, `--modern-card`, `--modern-raised`) and borders (`--modern-border`) to show hierarchy. Outlines must be used for keyboard focus indicators.

## CONSTR-02: DMS API Endpoint Contract
- source: DMS_API_Requirements.md
- type: api-contract
- content: All DMS endpoints are rooted at `REACT_APP_DMS_API_BASE_URL` and must authenticate with `Authorization: Bearer <token>`. Must return JSON responses with standard status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).

## CONSTR-03: DMS Document Schema
- source: docs/DMS_FileUpload_PRD.md
- type: schema
- content: Document upload payload requires `file` (binary), `folderId` (UUID string), optional `title` (string), `description` (string), and `tags` (array of strings). Maximum single file size is 100 MB.

## CONSTR-04: Token Management Storage Protocol
- source: docs/PRD_Refactoring_RBAC_Token_Security.md
- type: protocol
- content: Access tokens must reside in runtime memory within `src/services/tokenManager.js`. Persistent disk storage in `localStorage` is prohibited. Session storage may only contain base64-encoded `_enc_tk` for page refresh survival. All external token reads must invoke `tokenManager.getToken()`.
