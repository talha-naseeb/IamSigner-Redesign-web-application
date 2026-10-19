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
});
