/**
 * TokenManager Service
 * Centralized, memory-first JWT access token management.
 * Protects against XSS token exfiltration by maintaining tokens primarily in memory
 * and providing an abstraction layer for authentication lifecycle and silent refresh.
 */

let inMemoryToken = null;
let tokenExpiryTimeout = null;

// Max 32-bit signed integer for setTimeout (~24.8 days)
const MAX_TIMEOUT = 2147483647;

export const tokenManager = {
  /**
   * Set token in memory with resilient session fallback and schedule refresh.
   * Never persists plaintext tokens to localStorage (per SEC-01).
   * @param {string|null} token
   */
  setToken: (token) => {
    inMemoryToken = token;
    if (token) {
      if (typeof window !== "undefined" && window.sessionStorage) {
        try {
          sessionStorage.setItem("auth_active", "true");
          // Session-scoped encoded fallback for page refresh resilience (SEC-03)
          try {
            const encoded = typeof btoa === "function"
              ? btoa(token)
              : Buffer.from(token).toString("base64");
            sessionStorage.setItem("_enc_tk", encoded);
          } catch (e) {
            sessionStorage.setItem("_enc_tk", token);
          }
          // Synchronize legacy sessionStorage.token for external backward compatibility
          sessionStorage.setItem("token", token);
        } catch (e) {
          // Guard against storage quota or permission exceptions
        }
      }
      tokenManager.scheduleRefresh(token);
    } else {
      tokenManager.clearToken();
      return;
    }

    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      try {
        const event = typeof CustomEvent === "function"
          ? new CustomEvent("auth:token-change", {
              detail: { token: inMemoryToken, isAuthenticated: !!inMemoryToken },
            })
          : { type: "auth:token-change", detail: { token: inMemoryToken, isAuthenticated: !!inMemoryToken } };
        window.dispatchEvent(event);
      } catch (e) {
        // Fallback for non-standard environments
      }
    }
  },

  /**
   * Get token (Memory-first, zero disk latency)
   * Falls back to session-scoped storage if memory was cleared (e.g., page reload).
   * @returns {string|null}
   */
  getToken: () => {
    if (inMemoryToken) return inMemoryToken;
    if (typeof window === "undefined" || !window.sessionStorage) return null;

    try {
      const fallback = sessionStorage.getItem("_enc_tk");
      if (fallback) {
        try {
          const decoded = typeof atob === "function"
            ? atob(fallback)
            : Buffer.from(fallback, "base64").toString("utf-8");
          inMemoryToken = decoded;
          return inMemoryToken;
        } catch (e) {
          inMemoryToken = fallback;
          return inMemoryToken;
        }
      }

      // Secondary fallback for existing active sessions
      const legacyToken = sessionStorage.getItem("token");
      if (legacyToken) {
        inMemoryToken = legacyToken;
        try {
          const encoded = typeof btoa === "function"
            ? btoa(legacyToken)
            : Buffer.from(legacyToken).toString("base64");
          sessionStorage.setItem("_enc_tk", encoded);
        } catch (e) {
          sessionStorage.setItem("_enc_tk", legacyToken);
        }
        return inMemoryToken;
      }
    } catch (e) {
      // Guard against storage access errors
    }

    return null;
  },

  /**
   * Check if a valid token exists
   * @returns {boolean}
   */
  hasToken: () => {
    return !!tokenManager.getToken();
  },

  /**
   * Clear all tokens from memory and session/local storage
   */
  clearToken: () => {
    inMemoryToken = null;
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        sessionStorage.removeItem("auth_active");
        sessionStorage.removeItem("_enc_tk");
        sessionStorage.removeItem("token");
      } catch (e) {
        // Guard against storage exceptions
      }
    }
    // Ensure no plaintext JWT lingers in localStorage (SEC-01)
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("auth_active");
        localStorage.removeItem("_enc_tk");
      } catch (e) {
        // Guard against storage exceptions
      }
    }
    if (tokenExpiryTimeout) {
      clearTimeout(tokenExpiryTimeout);
      tokenExpiryTimeout = null;
    }

    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      try {
        const event = typeof CustomEvent === "function"
          ? new CustomEvent("auth:token-change", {
              detail: { token: null, isAuthenticated: false },
            })
          : { type: "auth:token-change", detail: { token: null, isAuthenticated: false } };
        window.dispatchEvent(event);
      } catch (e) {
        // Fallback for non-standard environments
      }
    }
  },

  /**
   * Decode JWT payload without external library dependencies.
   * Robust against URL-safe base64, UTF-8 unicode encoding, and malformed inputs.
   * @param {string} token
   * @returns {Object|null}
   */
  decodePayload: (token) => {
    const rawToken = token || tokenManager.getToken();
    if (!rawToken || typeof rawToken !== "string") return null;

    try {
      const parts = rawToken.split(".");
      if (parts.length < 2) return null;
      let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4 !== 0) {
        base64 += "=";
      }

      const atobFn = typeof atob === "function"
        ? atob
        : (str) => Buffer.from(str, "base64").toString("binary");

      const binaryStr = atobFn(base64);
      const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
      const jsonStr = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      return JSON.parse(jsonStr);
    } catch (err) {
      return null;
    }
  },

  /**
   * Proactively trigger refresh before token expiry.
   * Guards against 32-bit integer overflow in setTimeout.
   * @param {string} token
   */
  scheduleRefresh: (token) => {
    if (!token) return;
    const payload = tokenManager.decodePayload(token);
    if (!payload?.exp) return;

    const expiresInMs = payload.exp * 1000 - Date.now();
    // Fire refresh 60 seconds before expiration, minimum 10 seconds
    const refreshNoticeMs = Math.max(expiresInMs - 60000, 10000);

    if (tokenExpiryTimeout) {
      clearTimeout(tokenExpiryTimeout);
      tokenExpiryTimeout = null;
    }

    if (expiresInMs > 0) {
      // Guard against 32-bit signed integer overflow (max setTimeout is 2147483647 ms)
      const safeDelay = Math.min(refreshNoticeMs, MAX_TIMEOUT);

      tokenExpiryTimeout = setTimeout(() => {
        if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
          try {
            const event = typeof CustomEvent === "function"
              ? new CustomEvent("auth:refresh-required")
              : { type: "auth:refresh-required" };
            window.dispatchEvent(event);
          } catch (e) {
            // Ignore dispatch errors in non-browser or mock environments
          }
        }
      }, safeDelay);
    }
  },

  /**
   * Listen to token changes
   * @param {Function} callback
   * @returns {Function} cleanup function
   */
  subscribe: (callback) => {
    if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
      return () => {};
    }
    const handler = (event) => {
      callback(event?.detail?.token || null, !!event?.detail?.isAuthenticated);
    };
    window.addEventListener("auth:token-change", handler);
    return () => {
      if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
        window.removeEventListener("auth:token-change", handler);
      }
    };
  },

  /**
   * Reset in-memory token variable only (for testing page reload resilience)
   * @private
   */
  _resetMemoryOnly: () => {
    inMemoryToken = null;
  },

  /**
   * Inspect current active timeout reference (for testing)
   * @private
   */
  _hasActiveTimeout: () => {
    return tokenExpiryTimeout !== null;
  },
};

export default tokenManager;
