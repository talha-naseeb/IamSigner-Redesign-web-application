import test from "node:test";
import assert from "node:assert/strict";
import { clearWorkflowStorage, WORKFLOW_STORAGE_KEYS } from "./workflowStorage.js";

test("clearWorkflowStorage removes all workflow keys from localStorage and sessionStorage", () => {
  const mockStorage = () => {
    const store = new Map();
    return {
      setItem: (k, v) => store.set(k, String(v)),
      getItem: (k) => store.get(k) ?? null,
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
      get size() {
        return store.size;
      },
      has: (k) => store.has(k),
    };
  };

  globalThis.localStorage = mockStorage();
  globalThis.sessionStorage = mockStorage();

  // Populate mock storage with workflow keys and non-workflow keys
  WORKFLOW_STORAGE_KEYS.forEach((key) => {
    localStorage.setItem(key, "test-value");
    sessionStorage.setItem(key, "test-value");
  });
  localStorage.setItem("theme", "dark");
  sessionStorage.setItem("user-pref", "123");

  clearWorkflowStorage();

  // Verify workflow keys are removed
  WORKFLOW_STORAGE_KEYS.forEach((key) => {
    assert.equal(localStorage.getItem(key), null);
    assert.equal(sessionStorage.getItem(key), null);
  });

  // Verify non-workflow keys remain intact
  assert.equal(localStorage.getItem("theme"), "dark");
  assert.equal(sessionStorage.getItem("user-pref"), "123");
});
