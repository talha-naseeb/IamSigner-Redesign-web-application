/**
 * @jest-environment node
 */
import { applyThemeToDocument, getInitialTheme, isThemeName } from "./themeUtils";

const createStorage = (themeValue) => ({
  getItem: jest.fn(() => themeValue),
});

const createDocument = () => ({
  documentElement: {
    setAttribute: jest.fn(),
  },
});

describe("themeUtils", () => {
  test("uses stored dark theme when it is valid", () => {
    const storage = createStorage("dark");

    expect(getInitialTheme({ storage })).toBe("dark");
  });

  test("ignores invalid stored theme values", () => {
    const storage = createStorage("midnight");

    expect(isThemeName("midnight")).toBe(false);
    expect(getInitialTheme({ storage })).toBe("light");
  });

  test("applies the selected theme to the document root", () => {
    const doc = createDocument();

    applyThemeToDocument("dark", doc);

    expect(doc.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");
  });

  test("cleans up legacy theme keys from storage on initialization", () => {
    const removeItem = jest.fn();
    const storage = {
      getItem: jest.fn((key) => (key === "iamsigner_theme_mode" ? "light" : null)),
      removeItem,
    };

    getInitialTheme({ storage });

    expect(removeItem).toHaveBeenCalledWith("iamsigner_theme_mode");
  });
});
