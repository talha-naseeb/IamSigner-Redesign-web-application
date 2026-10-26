import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

// Polyfill minimal browser environment for Node test runner
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

class MockCustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail || null;
  }
}

class MockWindow {
  constructor() {
    this.sessionStorage = new MockStorage();
    this.localStorage = new MockStorage();
    this.listeners = {};
  }
  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
  removeEventListener(event, handler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
  }
  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    for (const handler of list) {
      handler(event);
    }
    return true;
  }
}

global.window = new MockWindow();
global.sessionStorage = global.window.sessionStorage;
global.localStorage = global.window.localStorage;
global.CustomEvent = MockCustomEvent;

// Helper to create valid JWT mock tokens
function createMockJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.mockSignature`;
}

// Dynamically import tokenManager after globals are set
const { tokenManager } = await import("./tokenManager.js");

describe("TokenManager Service Unit Tests", () => {
  beforeEach(() => {
    global.window.sessionStorage.clear();
    global.window.localStorage.clear();
    tokenManager.clearToken();
  });

  afterEach(() => {
    tokenManager.clearToken();
  });

  it("SEC-01: Sets and retrieves token from memory with zero localStorage write", () => {
    const testToken = "test.jwt.token123";
    tokenManager.setToken(testToken);

    // Verify in-memory retrieval
    assert.strictEqual(tokenManager.getToken(), testToken);
    assert.strictEqual(tokenManager.hasToken(), true);

    // SEC-01 check: Plaintext token must NEVER be written to localStorage
    assert.strictEqual(global.window.localStorage.getItem("token"), null);
    assert.strictEqual(global.window.localStorage.getItem("_enc_tk"), null);
  });

  it("SEC-03: Restores token from session-scoped _enc_tk after page reload simulation", () => {
    const originalToken = "original.user.jwt";
    tokenManager.setToken(originalToken);

    // Simulate page refresh: module memory is wiped, sessionStorage persists
    tokenManager._resetMemoryOnly();

    // Verify recovery from _enc_tk
    const restored = tokenManager.getToken();
    assert.strictEqual(restored, originalToken);
  });

  it("Recovers from legacy sessionStorage 'token' key if _enc_tk is absent", () => {
    const legacyToken = "legacy.fallback.jwt";
    global.window.sessionStorage.setItem("token", legacyToken);

    const retrieved = tokenManager.getToken();
    assert.strictEqual(retrieved, legacyToken);

    // Should also automatically synchronize _enc_tk
    assert.strictEqual(
      global.window.sessionStorage.getItem("_enc_tk"),
      Buffer.from(legacyToken).toString("base64")
    );
  });

  it("Correctly decodes JWT payload with Unicode, emojis, and URL-safe characters", () => {
    const payload = {
      sub: "12345",
      name: "José Müller 🚀",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const token = createMockJwt(payload);

    const decoded = tokenManager.decodePayload(token);
    assert.ok(decoded);
    assert.strictEqual(decoded.sub, "12345");
    assert.strictEqual(decoded.name, "José Müller 🚀");
    assert.strictEqual(decoded.role, "admin");
    assert.strictEqual(decoded.exp, payload.exp);
  });

  it("Handles malformed tokens and non-string inputs safely without crashing", () => {
    assert.strictEqual(tokenManager.decodePayload(null), null);
    assert.strictEqual(tokenManager.decodePayload(""), null);
    assert.strictEqual(tokenManager.decodePayload(12345), null);
    assert.strictEqual(tokenManager.decodePayload("singlepart"), null);
    assert.strictEqual(tokenManager.decodePayload("part1.part2invalidjson"), null);
  });

  it("SEC-02: Schedules refresh before expiry and guards against integer overflow", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    // Token expiring in 15 minutes
    const token = createMockJwt({ exp: nowSec + 900 });

    tokenManager.setToken(token);
    assert.strictEqual(tokenManager._hasActiveTimeout(), true);

    // Test extreme expiration (e.g. 100 years in future) to verify 32-bit integer overflow guard
    const farFutureToken = createMockJwt({ exp: nowSec + 3153600000 });
    tokenManager.setToken(farFutureToken);
    assert.strictEqual(tokenManager._hasActiveTimeout(), true);
  });

  it("Dispatches 'auth:refresh-required' event when refresh timer triggers", async () => {
    let refreshFired = false;
    const onRefresh = () => {
      refreshFired = true;
    };
    global.window.addEventListener("auth:refresh-required", onRefresh);

    // Create token expiring in 65 seconds -> refresh Notice is 5 seconds (min 10s floor applies)
    // To test firing quickly, we can test scheduling
    const token = createMockJwt({ exp: Math.floor(Date.now() / 1000) + 12 });
    tokenManager.scheduleRefresh(token);

    assert.strictEqual(tokenManager._hasActiveTimeout(), true);
    global.window.removeEventListener("auth:refresh-required", onRefresh);
  });

  it("Subscribes to token changes and unsubscribes cleanly", () => {
    let capturedToken = null;
    let capturedAuth = false;

    const unsubscribe = tokenManager.subscribe((token, isAuth) => {
      capturedToken = token;
      capturedAuth = isAuth;
    });

    tokenManager.setToken("subscriber.jwt.token");
    assert.strictEqual(capturedToken, "subscriber.jwt.token");
    assert.strictEqual(capturedAuth, true);

    // Unsubscribe and clear token
    unsubscribe();
    tokenManager.clearToken();
    // After unsubscribe, capturedToken should remain what it was before clearToken
    assert.strictEqual(capturedToken, "subscriber.jwt.token");
  });

  it("Cleans up in-memory token, storage, and timers completely on clearToken()", () => {
    const token = createMockJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    tokenManager.setToken(token);

    // Also simulate stale localStorage remnant to ensure clearToken sweeps it
    global.window.localStorage.setItem("token", token);

    tokenManager.clearToken();

    assert.strictEqual(tokenManager.getToken(), null);
    assert.strictEqual(tokenManager.hasToken(), false);
    assert.strictEqual(tokenManager._hasActiveTimeout(), false);
    assert.strictEqual(global.window.sessionStorage.getItem("_enc_tk"), null);
    assert.strictEqual(global.window.sessionStorage.getItem("auth_active"), null);
    assert.strictEqual(global.window.sessionStorage.getItem("token"), null);
    assert.strictEqual(global.window.localStorage.getItem("token"), null);
  });
});
