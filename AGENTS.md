# Repository Guidelines

## Project Structure & Module Organization
- SolidStart app using file-based routing in `src/routes/` (`index.jsx`, `[...404].jsx`). Add new routes as `.jsx` files; route names map to paths.
- App shell lives in `src/app.jsx` (don't touch) with global styles in `src/app.css`. Client and server entrypoints are `src/entry-client.jsx` (don't touch) and `src/entry-server.jsx` (don't touch).
- Reusable UI belongs in `src/components/` (RetryInputs form controls, NumberInput primitives in `UI.jsx`, chart visualization helpers, and the shared `Header.jsx`). Keep middleware and HTTP headers in `src/middlewares.mjs`.
- Static assets go in `public/`; build output and Firebase deploy artifacts land in `.output/` (server functions + public assets per `firebase.json`).

## Build, Test, and Development Commands
- Install: `npm install` (uses `package-lock.json`; Node >= 22).
- Local dev: `npm run dev` (starts Vinxi/SolidStart dev server with hot reload).
- Production build: `npm run build` (generates `.output/` for Firebase hosting/functions).
- Version info: `npm run version` (prints Vinxi/SolidStart versions).

## Coding Style & Naming Conventions
- ES modules with JSX; prefer 2-space indentation, trailing semicolons, and double-quoted strings to match existing files.
- Components use `PascalCase` filenames and exports; helpers and hooks use `camelCase`.
- Route files are colocated under `src/routes/` and should default-export the page component.
- Keep global CSS in `src/app.css`; prefer utility-first classes (Tailwind is available) for new styling, adding minimal custom rules when utilities fall short.
- Use the shared Tailwind + DaisyUI stack from `src/app.css` and reuse primitives like `NumberInput`/`Navbar` in `src/components/UI.jsx` whenever possible to keep interactions consistent.

## Testing Guidelines
- No automated test suite is present yet. When adding features, introduce colocated tests such as `feature.test.jsx` near the code (Vitest/Playwright are good fits).
- Until tests exist, manually verify via `npm run dev`, checking key routes (`/`, 404) and any new flows you add.

## Commit & Pull Request Guidelines
- Git history is minimal; use clear, imperative commit subjects (e.g., `Add timeout chart view`, `Harden cache headers`). Group related changes per commit.
- PRs should include: brief summary of changes, linked issue (if any), screenshots for UI updates, and manual test notes/steps so reviewers can reproduce.

## Security & Deployment Notes
- `src/middlewares.mjs` sets caching and security headers; keep or extend rather than removing. Firebase hosting (`firebase.json`) mirrors similar headers—validate they remain aligned after changes.
- Deploy artifacts come from `.output/public` (hosting) and `.output/server` (functions). Ensure builds succeed before proposing deployment changes.

## Project configuration files (don't touch)
- `firebase.json` and `.firebaserc` configures Firebase hosting and functions; (do not modify)
- `package.json` and `package-lock.json` defines project metadata, dependencies, and scripts; (do not modify)
- `jsconfig.json` configures JavaScript language features and paths; (do not modify)
- `app.config.js` configures application settings and environment variables for SolidStart; (do not modify)
