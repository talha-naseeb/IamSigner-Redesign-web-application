# Phase 1: In-Memory Token Security & Session Management - Research

**Researched:** 2026-10-24  
**Domain:** Client-Side JWT Security, Memory-First State Management, Silent Refresh, and Storage Isolation  
**Confidence:** HIGH  

<user_constraints>
## User Constraints (from Ingested PRD & PROJECT.md)

### Locked Decisions
- **DEC-01 (In-Memory Token Management Architecture)**: Store JWT access tokens primarily in memory via `tokenManager` singleton with silent refresh scheduling, using base64-encoded session-scoped storage (`_enc_tk`) only for page refresh resilience, completely eliminating plaintext `localStorage` token storage.
- **SEC-01**: User access token is managed in-memory via `tokenManager.js`, with zero plaintext JWT written to `localStorage`.
- **SEC-02**: Silent token refresh is proactively scheduled before JWT expiry using `scheduleRefresh()`.
- **SEC-03**: Session-scoped base64 encoding (`_enc_tk`) in `sessionStorage` provides page refresh resilience without disk vulnerability.

### the agent's Discretion
- Implementation details of unit tests for `tokenManager.js`.
- Strategy for clean backward-compatible migration of legacy components still performing raw `sessionStorage.removeItem("token")`.
- Window event naming and subscriber cleanup patterns.

### Deferred Ideas (OUT OF SCOPE)
- Full HttpOnly cookie-based authentication (requires backend architecture overhaul).
- WebAuthn passkey authentication (v2 requirement).
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| In-memory Token Store | Client Service (`src/services/tokenManager.js`) | — | Client-side memory prevents XSS script exfiltration from disk. |
| Silent Token Refresh | Client Service (`src/services/tokenManager.js`) | Backend Auth API | Timer-based preemptive refresh before JWT expiration. |
| Page Refresh Resilience | Client Session Storage (`sessionStorage`) | — | Encoded session storage (`_enc_tk`) survives page reloads within the same browser tab without leaking to disk. |
| Auth Interception & Injection | HTTP Client (`src/Api/apiHandlers.js`) | — | Injects `Authorization: Bearer <token>` dynamically from memory on every outgoing request. |
| Session Expiry & Cleanup | Central Error Handler (`src/Api/errorHandler.js`) | UI Toast / Router | Normalizes 401/expired errors, purges in-memory token, and redirects to `/login`. |
</architectural_responsibility_map>

<research_summary>
## Summary

This phase hardens authentication state management and token lifecycle across the frontend application. In traditional SPAs, storing JWTs directly in `localStorage` leaves tokens vulnerable to cross-site scripting (XSS) attacks and causes session crosstalk when users open multiple tabs or accounts under the same origin. 

Our architecture establishes `tokenManager` as the single authoritative source of truth for JWT access tokens. Tokens are held in module-level memory variables, eliminating disk persistence. To handle standard page reloads without forcing the user to log in again, an obfuscated session-scoped backup (`_enc_tk`) is maintained in `sessionStorage`. Before token expiration, `tokenManager` triggers a silent refresh event, allowing the session to stay alive seamlessly.

**Primary recommendation:** Eliminate all remaining direct `sessionStorage.getItem("token")` / `sessionStorage.removeItem("token")` references across components (e.g. `MobileTemplates`, `MobileUpload`, `Thirdstep.js`), routing all token interactions strictly through `tokenManager`. Back this with a robust unit test suite (`src/services/tokenManager.test.js`).
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `src/services/tokenManager.js` | Built-in | In-memory token singleton | Memory-first storage isolates credentials from disk-based XSS. |
| `src/Api/apiHandlers.js` | Built-in | Axios request/response interceptors | Centralized dynamic token injection and expired session trapping. |
| `date-fns` | ^3.6.0 | Timestamp calculations | Reliable millisecond comparison for token expiry buffers. |

### Supporting & Testing
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@testing-library/react` | ^16.3.2 | Component & hook testing | Verifying token state in React tree. |
| Jest / RTL DOM matchers | ^6.9.1 | Assertion library | Mocking `sessionStorage` and timer ticks (`jest.useFakeTimers()`). |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-memory + `sessionStorage` fallback | `localStorage` | `localStorage` persists across tabs and disk reboots, exposing tokens to persistent XSS theft. |
| In-memory + `sessionStorage` fallback | HttpOnly Cookies | HttpOnly cookies are immune to JS reads but require backend API support for SameSite/CORS cookie forwarding. |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Token Lifecycle Diagram

```text
 User Logs In (Login.js)
          │
          ▼
   `tokenManager.setToken(token)`
   ├── 1. Store in module variable: `inMemoryToken = token`
   ├── 2. Save obfuscated fallback: `sessionStorage.setItem("_enc_tk", btoa(token))`
   ├── 3. Schedule silent refresh: `scheduleRefresh(token)`
   └── 4. Dispatch event: `window.dispatchEvent("auth:token-change")`
          │
          ├───────────────────────────────────────────────────────┐
          ▼                                                       ▼
 Outgoing HTTP Request (apiHandlers.js)             Timer Reaches (exp - 60s)
   Reads `tokenManager.getToken()`                  Fires "auth:refresh-required"
   Injects `Authorization: Bearer <token>`          Refreshes token silently
```

### Pattern 1: Memory-First Retrieval with Fallback
```javascript
getToken: () => {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window === "undefined" || !window.sessionStorage) return null;

  const fallback = sessionStorage.getItem("_enc_tk");
  if (fallback) {
    try {
      inMemoryToken = atob(fallback);
      return inMemoryToken;
    } catch (e) {
      inMemoryToken = fallback;
      return inMemoryToken;
    }
  }
  return null;
}
```

### Pattern 2: Silent Refresh Timer Scheduling
```javascript
scheduleRefresh: (token) => {
  if (!token) return;
  const payload = tokenManager.decodePayload(token);
  if (!payload?.exp) return;

  const expiresInMs = payload.exp * 1000 - Date.now();
  // Fire refresh 60 seconds before expiration, minimum 10 seconds
  const refreshNoticeMs = Math.max(expiresInMs - 60000, 10000);

  if (tokenExpiryTimeout) clearTimeout(tokenExpiryTimeout);

  if (expiresInMs > 0) {
    tokenExpiryTimeout = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:refresh-required"));
      }
    }, refreshNoticeMs);
  }
}
```

### Anti-Patterns to Avoid
- **Direct `sessionStorage` Writes in Components:** Directly invoking `sessionStorage.setItem("token", ...)` bypasses the memory cache, refresh scheduler, and subscriber dispatchers.
- **Plaintext Storage in `localStorage`:** Never store JWT tokens, decoded claims, or sensitive signing artifacts in `localStorage`.
- **Silent Timer Overflows:** JavaScript `setTimeout` delays larger than 2,147,483,647 ms (approx. 24.8 days) overflow a 32-bit integer, executing immediately. Always guard against overflow.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT payload decoding | Complex base64 parser | `tokenManager.decodePayload` | URL-safe base64 replacement and UTF-8 URI component decoding handles Unicode characters correctly. |
| Inactivity timeouts | Ad-hoc mouse move listeners | `idle-session-timeout` | Handles tab focus, debounce, and cross-window events reliably. |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Multi-Tab Storage Event Synchronization
**What goes wrong:** A user logs out in Tab A, but Tab B continues sending requests with stale credentials.  
**Why it happens:** In-memory variables are isolated per tab and do not automatically know when another tab updates storage.  
**How to avoid:** Listen to `window.addEventListener("storage", handleStorageChange)` in `App.js` to synchronize `isToken` state when `sessionStorage` or auth keys change.

### Pitfall 2: Premature Expiry During Network Delays
**What goes wrong:** An in-flight request fails with 401 because the token expired during transit.  
**Why it happens:** Refresh was scheduled too close to the expiration timestamp (e.g. 5 seconds before).  
**How to avoid:** Schedule refresh with a generous buffer (60 seconds prior to expiration) to ensure network latency does not cause race conditions.
</common_pitfalls>

---

*Phase 1 research completed on 2026-10-24*
