# MadriBuild

Marketing site for MadriBuild, a web application development agency. Single-page, dark by
default, built with React and deployed to Firebase Hosting.

## Stack

| Concern    | Choice                                     |
| ---------- | ------------------------------------------ |
| Build      | Vite 8                                     |
| UI         | React 19 + TypeScript (strict)             |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`)      |
| State      | Zustand 5                                  |
| Motion     | Framer Motion 13                           |
| Icons      | Lucide React                               |
| Hosting    | Firebase Hosting                           |

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on <http://localhost:5173>.

## Scripts

| Script              | Does                                                      |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                                  |
| `npm run typecheck` | Type-check without emitting                                |
| `npm run build`     | Type-check, then produce a production build in `dist/`     |
| `npm run preview`   | Serve the production build locally                         |
| `npm run deploy`    | Build and deploy to Firebase Hosting                       |

## Project structure

```
src/
  App.tsx                  Section composition and skip link
  main.tsx                 React entry point
  index.css                Tailwind import + brand tokens (@theme)
  components/
    ui/                    Presentational primitives: Button, Container, SectionHeader, Logo
    shared/Reveal.tsx      Shared scroll-reveal motion wrapper
    features/              Page sections: Header, Hero, Services, Workflow, Founders, Contact, Footer
  data/                    Content: services, workflow steps, founders, navigation
  hooks/                   useHasScrolled, useThemeSync, useDismissableLayer
  lib/                     cn() helper, theme helpers, inquiry API
  store/useUIStore.ts      Global UI state
public/founders/           Founder photographs
```

Brand colours, typography, and voice are documented in [BRAND.md](BRAND.md).

## Conventions

- Named exports only; no default exports.
- Imports use the `@/` alias, never relative `../../` paths.
- Zustand is read with atomic selectors — `useUIStore((state) => state.theme)`, never a
  destructured whole-store read — so components only re-render on the slice they use.
- Only genuinely global UI state lives in the store. Form fields, validation errors, and
  submission status stay local to the component that owns them.

## Deploying to Firebase Hosting

The site deploys to Firebase project `madridev-119f7`.

1. Sign in if you have not already:

```bash
firebase login
```

2. Build and deploy:

```bash
npm run deploy
```

[firebase.json](firebase.json) serves `dist/` as a single-page app: every route rewrites to
`/index.html`, hashed files under `/assets/**` get a one-year immutable cache, and
`index.html` is served `no-cache` so a deploy takes effect immediately.

## Wiring up the contact form

`submitProjectInquiry` in [src/lib/api.ts](src/lib/api.ts) currently resolves locally and
logs the payload in development — nothing is sent anywhere yet. Replace its body with a
call to a Cloud Function, a Firestore write, or a form service. The component contract
(`ProjectInquiry` in, `InquiryResult` out) is all the form depends on, so no UI changes are
needed.

## Replacing the placeholder content

- Founder names, roles, and bios: [src/data/founders.ts](src/data/founders.ts)
- Services: [src/data/services.ts](src/data/services.ts)
- Process steps: [src/data/workflow.ts](src/data/workflow.ts)
- Nav links, contact email, socials: [src/data/navigation.ts](src/data/navigation.ts)
