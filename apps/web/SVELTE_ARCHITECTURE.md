# LibreLingo Web App - SvelteKit Architecture

This document describes the current `apps/web` SvelteKit application structure, the routing conventions in use, and the cleanup status for the migrated Svelte codebase.

## Overview

The web app is a SvelteKit application built with:
- SvelteKit `^2.0.0`
- Svelte `^5.0.0`
- Vite `^5.4.11`
- TypeScript and modern module syntax

Root app config is in `apps/web/package.json`, and the web app entrypoint is `apps/web/src/routes`.

## Core SvelteKit structure

### Layout and app shell

- `apps/web/src/routes/+layout.svelte`
  - Defines the shared app shell, global CSS imports, page loader indicator, and root styles.
  - Uses a theme map to set CSS custom properties for the whole app.

- `apps/web/src/routes/+layout.ts`
  - Loads internationalization resources using `svelte-i18n`.
  - Runs in the browser and initializes `locale` from `window.navigator.language`.

- `apps/web/src/routes/+page.svelte`
  - The home page route (`/`).
  - Rendered inside the layout with `<slot />`.

- `apps/web/src/routes/_error.svelte`
  - Custom error page used by SvelteKit for unhandled route errors.

### Page routes

The app uses SvelteKit filesystem-based routing.

Static page routes:
- `/imprint` → `apps/web/src/routes/imprint/+page.svelte`
- `/privacy` → `apps/web/src/routes/privacy/+page.svelte`

Dev and admin routes:
- `/dev` → `apps/web/src/routes/dev/index.svelte`

Course routing:
- `/course` redirects to `/` via `apps/web/src/routes/course/+page.server.js`
- `/course/[courseName]` → `apps/web/src/routes/course/[courseName]/+page.svelte`
- `/course/[courseName]/skill/[skillName]` → `apps/web/src/routes/course/[courseName]/skill/[skillName]/+page.svelte`
- `/course/[courseName]/skill/[skillName]/introduction` → `apps/web/src/routes/course/[courseName]/skill/[skillName]/introduction/+page.svelte`

### Server-side loading

Several routes use `+page.server.ts` to load content on the server.

Examples:
-- `course/+page.server.js` (redirects)

These server loaders replace the old Sapper `preload()` pattern and are the correct place for file-system or markdown import work.

## Component organization

Shared UI components live under `apps/web/src/components`.
- Reusable page sections and UI elements are kept here.
- `MarkDownPage.svelte` is used to render markdown-driven pages such as About, License, and Terms of Service.
- `Footer.svelte` contains the `/devtools` link and standard legal footer links.

There is also a `lluis` package used for shared Svelte components, imported with aliases such as `lluis/Content.svelte`.

## Current cleanup status

### Removed legacy Sapper artifacts

The migration has removed old Sapper entrypoints and legacy route files.
- `apps/web/src/client.js` ✓
- `apps/web/src/server.js` ✓
- `apps/web/src/service-worker.js` ✓
- `apps/web/src/routes/about.svelte` ✓
- `apps/web/src/routes/license.svelte` ✓
- `apps/web/src/routes/tos.svelte` ✓
- `apps/web/src/routes/devtools.svelte` ✓

### Removed outdated routes

- `apps/web/src/routes/dev-typography.svelte` ✓

This page was a development typography showcase and is no longer referenced anywhere in the active app.

### Remaining legacy markers to consider later

- Deprecated CSS variables and component names in `apps/web/src/routes/+layout.svelte`
- Deprecated components inside `apps/web/src/components/Deprecated*`
- Any unused legacy markup or routes discovered during future refactor work

## Development workflow

Recommended commands from `apps/web/package.json`:
- `npm install` from repo root
- `cd apps/web`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run check`

The `predev`/`prebuild` scripts run `prepareCourses` first, ensuring required course assets are generated before starting the dev server or building.

## Notes for contributors

- When adding a new page route, use a directory with `+page.svelte` rather than a top-level legacy `.svelte` file in `src/routes`.
- For server-side data loading, add a `+page.server.ts` file next to the page.
- Keep page components small and move shared UI into `src/components`.
- Avoid server-only code in `+page.svelte`; use `+page.server.ts` for filesystem access or file imports.

## How to verify the current web app structure

1. Confirm `apps/web/src/routes/+layout.svelte` and `+layout.ts` exist.
2. Confirm static page routes live under their own `+page.svelte` directories.
3. Confirm dynamic course routes use `[courseName]` and `[skillName]` segments.
4. Confirm there are no legacy Sapper route files left in `apps/web/src/routes`.

This file is a living reference for the `apps/web` SvelteKit application.
