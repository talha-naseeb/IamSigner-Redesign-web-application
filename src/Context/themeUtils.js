export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME = "light";
export const PALETTE_STORAGE_KEY = "iam-signer-palette";
export const DEFAULT_PALETTE = "concept-2";
export const THEMES = {
  light: "light",
  dark: "dark",
};
export const PALETTES = {
  concept2: "concept-2",
  management: "management",
};

export const isThemeName = (theme) => Object.values(THEMES).includes(theme);
export const isPaletteName = (palette) => Object.values(PALETTES).includes(palette);

export const getSystemTheme = (matchMediaRef = typeof window !== "undefined" ? window.matchMedia : undefined) => {
  if (typeof matchMediaRef !== "function") return DEFAULT_THEME;
  return matchMediaRef("(prefers-color-scheme: dark)").matches ? THEMES.dark : DEFAULT_THEME;
};

export const cleanupLegacyThemeStorage = (storage = typeof localStorage !== "undefined" ? localStorage : undefined) => {
  if (!storage) return;
  const legacyKeys = ["iamsigner_theme_mode", "iamsigner_theme_palette"];
  legacyKeys.forEach((key) => {
    try {
      if (storage.getItem(key)) {
        storage.removeItem(key);
      }
    } catch {
      // Storage access blocked or restricted
    }
  });
};

export const getInitialTheme = ({ storage = typeof localStorage !== "undefined" ? localStorage : undefined, matchMediaRef } = {}) => {
  cleanupLegacyThemeStorage(storage);
  const storedTheme = storage?.getItem(THEME_STORAGE_KEY);
  if (isThemeName(storedTheme)) return storedTheme;
  return getSystemTheme(matchMediaRef);
};

export const getInitialPalette = ({ storage = typeof localStorage !== "undefined" ? localStorage : undefined } = {}) => {
  const storedPalette = storage?.getItem(PALETTE_STORAGE_KEY);
  return isPaletteName(storedPalette) ? storedPalette : DEFAULT_PALETTE;
};

export const applyThemeToDocument = (theme, documentRef = typeof document !== "undefined" ? document : undefined) => {
  const nextTheme = isThemeName(theme) ? theme : DEFAULT_THEME;
  documentRef?.documentElement?.setAttribute("data-theme", nextTheme);
  return nextTheme;
};

export const applyPaletteToDocument = (palette, documentRef = typeof document !== "undefined" ? document : undefined) => {
  const nextPalette = isPaletteName(palette) ? palette : DEFAULT_PALETTE;
  documentRef?.documentElement?.setAttribute("data-palette", nextPalette);
  return nextPalette;
};
