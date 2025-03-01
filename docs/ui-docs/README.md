# 📘 Project Documentation (Chatsky UI Docs)

This directory contains the documentation built with [Nextra](https://nextra.site) — a static documentation generator for Next.js.

## 🚀 Installation & Setup

1. Install dependencies

`bun install`

2. Run locally

`bun run dev`

The documentation will be available at `http://localhost:8000`.

## 📂 Project Structure

```
src/
├── components/ # Additional components
├── icons/ # Project icons
├── pages/ # Main application pages
│ ├── docs/ # Documentation section
│ │ ├── nodes/ # Subsection of documentation
│ │ ├── \_meta.ts # Metadata for the documentation structure
│ │ ├── index.mdx # Main documentation page
│ │ ├── deliver.mdx
│ │ ├── inspect.mdx
│ │ ├── installation.mdx
│ │ ├── quick_start.mdx
│ │ ├── settings.mdx
│ │ ├── skill_basics.mdx
│ │ ├── \_app.tsx # Global Next.js settings
│ │ ├── \_document.tsx # Custom Document for Next.js
├── styles/ # Project styles
├── bun.lockb # Bun dependencies lock file
├── eslint.config.mjs # ESLint configuration
├── next.config.ts # Next.js configuration
├── package.json # Dependencies file
├── postcss.config.mjs # PostCSS configuration
├── README.md # Project documentation
├── tailwind.config.ts # TailwindCSS configuration
├── theme.config.tsx # Nextra theme configuration
└── tsconfig.json # TypeScript configuration
```

## 📦 Building Static Files

The documentation is generated as static files using Next.js with the `output:"export"` setting.

To build the project, run:

`bun run build`

The output files will be placed in the `out/` directory.

## 🚀 Deployment on GitHub Pages

The project is deployed on GitHub Pages.
To export the documentation as static files and deploy it, run:

`bun run build`

After that, the files in the `out/` directory can be uploaded to the repository for deployment.

## 🛠 Useful Commands

    •	bun run dev — start in development mode
    •	bun run start — start in production mode
    •	bun run build — build the project and export static files
    •	bun run lint — check the code
