import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyThemeToDocument,
  applyPaletteToDocument,
  getInitialTheme,
  getInitialPalette,
  isThemeName,
  isPaletteName,
  cleanupLegacyThemeStorage,
  THEMES,
  PALETTES,
  THEME_STORAGE_KEY,
  PALETTE_STORAGE_KEY,
} from "./themeUtils.js";

const createMockStorage = (initialItems = {}) => {
  const store = { ...initialItems };
  const removed = [];
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      removed.push(key);
      delete store[key];
    },
    getRemoved: () => removed,
    getStore: () => store,
  };
};

const createMockDocument = () => {
  const attributes = {};
  return {
    documentElement: {
      setAttribute: (name, value) => {
        attributes[name] = value;
      },
      getAttribute: (name) => attributes[name],
    },
    getAttributes: () => attributes,
  };
};

describe("Theme & Palette Engine Unit Tests (UI-03)", () => {
  describe("Theme Name Validation", () => {
    it("recognizes valid light and dark themes", () => {
      assert.strictEqual(isThemeName(THEMES.light), true);
      assert.strictEqual(isThemeName(THEMES.dark), true);
    });

    it("rejects invalid theme names", () => {
      assert.strictEqual(isThemeName("midnight"), false);
      assert.strictEqual(isThemeName("sepia"), false);
      assert.strictEqual(isThemeName(null), false);
      assert.strictEqual(isThemeName(undefined), false);
    });
  });

  describe("Palette Name Validation", () => {
    it("recognizes valid concept-2 and management palettes", () => {
      assert.strictEqual(isPaletteName(PALETTES.concept2), true);
      assert.strictEqual(isPaletteName(PALETTES.management), true);
    });

    it("rejects invalid palette names", () => {
      assert.strictEqual(isPaletteName("neon"), false);
      assert.strictEqual(isPaletteName(null), false);
    });
  });

  describe("Initial Theme Resolution", () => {
    it("restores valid dark theme from storage", () => {
      const storage = createMockStorage({ [THEME_STORAGE_KEY]: "dark" });
      assert.strictEqual(getInitialTheme({ storage }), "dark");
    });

    it("restores valid light theme from storage", () => {
      const storage = createMockStorage({ [THEME_STORAGE_KEY]: "light" });
      assert.strictEqual(getInitialTheme({ storage }), "light");
    });

    it("falls back to default light theme when storage has invalid value", () => {
      const storage = createMockStorage({ [THEME_STORAGE_KEY]: "invalid-theme" });
      assert.strictEqual(getInitialTheme({ storage }), "light");
    });

    it("detects system dark preference when storage is empty", () => {
      const storage = createMockStorage();
      const matchMediaRef = (query) => ({
        matches: query.includes("dark"),
      });
      assert.strictEqual(getInitialTheme({ storage, matchMediaRef }), "dark");
    });

    it("falls back to light when matchMedia indicates light preference", () => {
      const storage = createMockStorage();
      const matchMediaRef = () => ({ matches: false });
      assert.strictEqual(getInitialTheme({ storage, matchMediaRef }), "light");
    });
  });

  describe("Initial Palette Resolution", () => {
    it("restores valid management palette from storage", () => {
      const storage = createMockStorage({ [PALETTE_STORAGE_KEY]: "management" });
      assert.strictEqual(getInitialPalette({ storage }), "management");
    });

    it("restores valid concept-2 palette from storage", () => {
      const storage = createMockStorage({ [PALETTE_STORAGE_KEY]: "concept-2" });
      assert.strictEqual(getInitialPalette({ storage }), "concept-2");
    });

    it("falls back to default concept-2 when storage is empty or invalid", () => {
      const storage = createMockStorage({ [PALETTE_STORAGE_KEY]: "unknown" });
      assert.strictEqual(getInitialPalette({ storage }), "concept-2");
    });
  });

  describe("Document Attribute Application", () => {
    it("applies data-theme to document element", () => {
      const doc = createMockDocument();
      applyThemeToDocument("dark", doc);
      assert.strictEqual(doc.documentElement.getAttribute("data-theme"), "dark");
    });

    it("falls back to default theme if invalid theme applied", () => {
      const doc = createMockDocument();
      applyThemeToDocument("invalid", doc);
      assert.strictEqual(doc.documentElement.getAttribute("data-theme"), "light");
    });

    it("applies data-palette to document element", () => {
      const doc = createMockDocument();
      applyPaletteToDocument("management", doc);
      assert.strictEqual(doc.documentElement.getAttribute("data-palette"), "management");
    });

    it("falls back to default palette if invalid palette applied", () => {
      const doc = createMockDocument();
      applyPaletteToDocument("invalid", doc);
      assert.strictEqual(doc.documentElement.getAttribute("data-palette"), "concept-2");
    });
  });

  describe("Legacy Storage Cleanup", () => {
    it("removes legacy iamsigner_theme_mode and iamsigner_theme_palette keys", () => {
      const storage = createMockStorage({
        iamsigner_theme_mode: "dark",
        iamsigner_theme_palette: "management",
        [THEME_STORAGE_KEY]: "dark",
      });

      cleanupLegacyThemeStorage(storage);

      assert.strictEqual(storage.getItem("iamsigner_theme_mode"), null);
      assert.strictEqual(storage.getItem("iamsigner_theme_palette"), null);
      assert.strictEqual(storage.getItem(THEME_STORAGE_KEY), "dark");
      assert.deepStrictEqual(storage.getRemoved(), [
        "iamsigner_theme_mode",
        "iamsigner_theme_palette",
      ]);
    });
  });
});
