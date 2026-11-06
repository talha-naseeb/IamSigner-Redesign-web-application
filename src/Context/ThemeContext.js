import React, { createContext, useContext, useState, useEffect } from "react";
import {
  applyPaletteToDocument,
  applyThemeToDocument,
  getInitialPalette,
  getInitialTheme,
  getStoredTheme,
  persistTheme,
  isPaletteName,
  isThemeName,
  PALETTE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  THEMES,
} from "./themeUtils";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => getInitialTheme());
  const [palette, setPaletteState] = useState(() => getInitialPalette());

  useEffect(() => {
    applyThemeToDocument(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyPaletteToDocument(palette);
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, palette);
      sessionStorage.setItem(PALETTE_STORAGE_KEY, palette);
    } catch {}
  }, [palette]);

  // Live auto-update when system color scheme changes, IF no manual preference is stored
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Auto-update only if user has not stored an explicit choice
      const stored = getStoredTheme();
      if (!stored) {
        const nextTheme = e.matches ? THEMES.dark : THEMES.light;
        setThemeState(nextTheme);
        applyThemeToDocument(nextTheme);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Listen to cross-tab storage updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e) => {
      if (e.key === THEME_STORAGE_KEY && isThemeName(e.newValue)) {
        setThemeState(e.newValue);
        applyThemeToDocument(e.newValue);
      }
      if (e.key === PALETTE_STORAGE_KEY && isPaletteName(e.newValue)) {
        setPaletteState(e.newValue);
        applyPaletteToDocument(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const switchThemeWithoutTransition = (nextTheme) => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    applyThemeToDocument(nextTheme);
    persistTheme(nextTheme);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        root.classList.remove("theme-switching");
      });
    });
  };

  const setTheme = (nextTheme) => {
    setThemeState((prevTheme) => {
      const resolvedTheme = typeof nextTheme === "function" ? nextTheme(prevTheme) : nextTheme;
      if (!isThemeName(resolvedTheme) || resolvedTheme === prevTheme) {
        return prevTheme;
      }
      switchThemeWithoutTransition(resolvedTheme);
      return resolvedTheme;
    });
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const switchPaletteWithoutTransition = (nextPalette) => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    applyPaletteToDocument(nextPalette);
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, nextPalette);
      sessionStorage.setItem(PALETTE_STORAGE_KEY, nextPalette);
    } catch {}
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        root.classList.remove("theme-switching");
      });
    });
  };

  const setPalette = (nextPalette) => {
    setPaletteState((prevPalette) => {
      const resolvedPalette = typeof nextPalette === "function" ? nextPalette(prevPalette) : nextPalette;
      if (!isPaletteName(resolvedPalette) || resolvedPalette === prevPalette) {
        return prevPalette;
      }
      switchPaletteWithoutTransition(resolvedPalette);
      return resolvedPalette;
    });
  };

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, palette, setPalette }}>{children}</ThemeContext.Provider>;
};
