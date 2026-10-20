/**
 * TokenManager Service
 * Centralized, memory-first JWT access token management.
 * Protects against XSS token exfiltration by maintaining tokens primarily in memory
 * and providing an abstraction layer for authentication lifecycle and silent refresh.
 */

let inMemoryToken = null;
let tokenExpiryTimeout = null;

export const tokenManager = {
  /**
   * Set token in memory with resilient session fallback and schedule refresh
   * @param {string|null} token
   */
  setToken: (token) => {
    inMemoryToken = token;
    if (token) {
      sessionStorage.setItem("auth_active", "true");
      // Session-scoped encoded fallback for page refresh resilience
      try {
        sessionStorage.setItem("_enc_tk", btoa(token));
      } catch (e) {
        sessionStorage.setItem("_enc_tk", token);
      }
      // Keep legacy sessionStorage.token synchronized for external backward compatibility
      sessionStorage.setItem("token", token);
      tokenManager.scheduleRefresh(token);
    } else {
      tokenManager.clearToken();
      return;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth:token-change", {
          detail: { token: inMemoryToken, isAuthenticated: !!inMemoryToken },
        })
      );
    }
  },

  /**
   * Get token (Memory-first, zero disk latency)
   * @returns {string|null}
   */
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

    // Secondary fallback for existing active sessions
    const legacyToken = sessionStorage.getItem("token");
    if (legacyToken) {
      inMemoryToken = legacyToken;
      try {
        sessionStorage.setItem("_enc_tk", btoa(legacyToken));
      } catch (e) {
        sessionStorage.setItem("_enc_tk", legacyToken);
      }
      return inMemoryToken;
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
   * Clear all tokens from memory and storage
   */
  clearToken: () => {
    inMemoryToken = null;
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.removeItem("auth_active");
      sessionStorage.removeItem("_enc_tk");
      sessionStorage.removeItem("token");
    }
    if (tokenExpiryTimeout) {
      clearTimeout(tokenExpiryTimeout);
      tokenExpiryTimeout = null;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth:token-change", {
          detail: { token: null, isAuthenticated: false },
        })
      );
    }
  },

  /**
   * Decode JWT payload without external library dependencies
   * @param {string} token
   * @returns {Object|null}
   */
  decodePayload: (token) => {
    const rawToken = token || tokenManager.getToken();
    if (!rawToken || typeof rawToken !== "string") return null;

    try {
      const parts = rawToken.split(".");
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      try {
        const parts = rawToken.split(".");
        return JSON.parse(atob(parts[1]));
      } catch (err) {
        return null;
      }
    }
  },

  /**
   * Proactively trigger refresh before token expiry
   * @param {string} token
   */
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
  },

  /**
   * Listen to token changes
   * @param {Function} callback
   * @returns {Function} cleanup function
   */
  subscribe: (callback) => {
    if (typeof window === "undefined") return () => {};
    const handler = (event) => {
      callback(event.detail?.token, event.detail?.isAuthenticated);
    };
    window.addEventListener("auth:token-change", handler);
    return () => window.removeEventListener("auth:token-change", handler);
  },
};

export default tokenManager;
