import React, { createContext, useContext, useState, useEffect } from "react";
import {
  applyPaletteToDocument,
  applyThemeToDocument,
  getInitialPalette,
  getInitialTheme,
  isPaletteName,
  isThemeName,
  PALETTE_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "./themeUtils";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => getInitialTheme());
  const [palette, setPaletteState] = useState(() => getInitialPalette());

  useEffect(() => {
    applyThemeToDocument(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    applyPaletteToDocument(palette);
    localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  }, [palette]);

  const switchThemeWithoutTransition = (nextTheme) => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    applyThemeToDocument(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
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
    localStorage.setItem(PALETTE_STORAGE_KEY, nextPalette);
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
