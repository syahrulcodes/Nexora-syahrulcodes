import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background
        "bg-main": "var(--bg-main)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-sidebar": "var(--bg-sidebar)",
        "bg-card": "var(--bg-card)",
        "bg-elevated": "var(--bg-elevated)",
        // Text
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        // Border
        border: "var(--border)",
        // Accents
        "accent-sage": "var(--accent-sage)",
        "accent-blue": "var(--accent-blue)",
        "accent-beige": "var(--accent-beige)",
        "accent-teal": "var(--accent-teal)",
        // Status
        "status-success": "var(--status-success)",
        "status-warning": "var(--status-warning)",
        "status-error": "var(--status-error)",
        "status-info": "var(--status-info)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease forwards",
        "slide-in-left": "slideInLeft 0.2s ease forwards",
        "scale-in": "scaleIn 0.15s ease forwards",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
}

export default config
