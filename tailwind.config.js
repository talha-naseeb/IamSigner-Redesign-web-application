/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  corePlugins: {
    // Keep legacy browser defaults stable while routes move onto the shared UI layer.
    preflight: false,
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--modern-border, hsl(var(--border, 214.3 31.8% 91.4%)))",
        input: "var(--modern-border, hsl(var(--input, 214.3 31.8% 91.4%)))",
        ring: "var(--modern-primary, hsl(var(--ring, 222.2 84% 4.9%)))",
        background: "var(--modern-bg, hsl(var(--background, 0 0% 100%)))",
        foreground: "var(--modern-text, hsl(var(--foreground, 222.2 84% 4.9%)))",
        primary: {
          DEFAULT: "var(--modern-primary, #6366f1)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--modern-raised, #f1f5f9)",
          foreground: "var(--modern-text, #0f172a)",
        },
        destructive: {
          DEFAULT: "var(--modern-danger, #ef4444)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--modern-raised, #f1f5f9)",
          foreground: "var(--modern-muted, #64748b)",
        },
        accent: {
          DEFAULT: "var(--modern-raised, #f1f5f9)",
          foreground: "var(--modern-text, #0f172a)",
        },
        card: {
          DEFAULT: "var(--modern-card, #ffffff)",
          foreground: "var(--modern-text, #0f172a)",
        },
      },
      borderRadius: {
        lg: "var(--modern-radius-lg, 12px)",
        md: "var(--modern-radius-md, 8px)",
        sm: "var(--modern-radius-sm, 6px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
