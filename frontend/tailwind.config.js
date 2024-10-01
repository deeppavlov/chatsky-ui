import { nextui } from "@nextui-org/react"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
    "./src/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "bg-secondary": "var(--bg-secondary)",
        "fg-secondary": "var(--fg-secondary)",
        "condition-input-handle": "var(--condition-input-handle)",
        "condition-output-handle": "var(--condition-output-handle)",
        border: "var(--border)",
        text: "var(--text)",
        "btn-black": "var(--btn-black)",
        "round-btn-shadow": "var(--round-btn-shadow)",
        "double-active": "var(--double-active)",
        "double-inactive": "var(--double-inactive)",
        "success-background": "var(--success-background)",
        "success-foreground": "var(--success-foreground)",
        "error-foreground": "var(--error-foreground)",
        "error-background": "var(--error-background)",
        "info-foreground": "var(--info-foreground)",
        "info-background": "var(--info-background)",
        "condition-default": "var(--condition-default)",
        node: "var(--node)",
        "node-header": "var(--node-header)",
        "node-selected": "var(--border-node-selected)",
        "header-btn-hover": "var(--header-btn-hover)",
        "border-darker": "var(--border-darker)",
        "status-green": "var(--status-green)",
        "f-card-trash": "var(--flow-card-trash-btn)",
        "contrast-border": "var(--contrast-border)",
        chat: "var(--chat-background)",
        "btn-accent": "var(--btn-accent)",
        "input-background": "var(--input-background)",
        "input-background-disabled": "var(--input-background-disabled)",
        "input-foreground": "var(--input-foreground)",
        "input-border": "var(--input-border)",
        "input-border-focus": "var(--input-border-focus)",
        "input-border-error": "var(--input-border-error)",
        "table-background": "var(--table-background)",
      },
      borderRadius: {
        node: "16px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        in: {
          "0%": { opacity: "0", transform: "translateY(-10px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        out: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-10px) scale(0.95)" },
        },
      },
      animation: {
        "open": "open 0.2s ease forwards",
        "close": "close 0.2s ease forwards",
        "fade-in": "fade-in 0.2s ease forwards",
        "fade-out": "fade-out 0.2s ease forwards",
        "zoom-in": "zoom-in 0.2s ease forwards",
        "zoom-out": "zoom-out 0.2s ease forwards",
        "in": "in 0.2s ease forwards",
        "out": "out 0.2s ease forwards",
      },
    },
  },
  darkMode: ["class", "class"],
  plugins: [
    import("tailwindcss-children"),
    nextui({
      layout: {
        boxShadow: {
          small: "0px 0px 5px 0px rgb(0 0 0 / 0.01), 0px 2px 5px 0px rgb(0 0 0 / 0.06)",
          medium: "0px 0px 5px 0px rgb(0 0 0 / 0.01), 0px 2px 5px 0px rgb(0 0 0 / 0.06)",
          large: "0px 0px 5px 0px rgb(0 0 0 / 0.01), 0px 2px 5px 0px rgb(0 0 0 / 0.06)",
        },
      },
      themes: {
        dark: {
          colors: {
            background: "#212121",
            content1: "#212121",
            overlay: "#121212",
            success: "#00CC99",
            danger: "#FF3333",
          },
        },
        light: {
          colors: {
            background: "#fff",
            content1: "#fff",
            overlay: "#f8fafc",
            success: "#00CC99",
            danger: "#FF3333",
          },
        },
      },
    }),
    import("tailwindcss-animate"),
  ],
}
