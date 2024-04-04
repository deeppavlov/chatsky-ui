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
      },
      borderRadius: {
        node: "16px",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: "#212121",
            content1: "#212121",
          },
        },
        light: {
          colors: {
            background: "#fff",
            content1: "#fff",
          },
        },
      },
    }),
  ],
}
