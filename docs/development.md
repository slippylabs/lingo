# Development Guide

This document explains the current development workflow for the LibreLingo repository.
It is focused on the code paths and commands that work right now.

## Repository overview

This repo is a monorepo with a JavaScript/TypeScript frontend and Python tooling for course content.

- `apps/web` — the main Svelte web application.
- `apps/answer-corrector` — a supporting package used by the web app.
- `apps/lluis` — shared UI primitives used in the web app.
- `courses` — YAML course definitions and course metadata.
- `scripts` — helper scripts for exporting, installing, and generating course data.
- `docs` — static documentation sources.

## Key concepts

### Frontend

The app is built with Svelte and Vite. The main web app is located in `apps/web`.

- Page routes are under `apps/web/src/routes`.
- Shared UI components are under `apps/web/src/components`.
- The course loader and runtime data APIs are in `apps/web/src/course-client`.
- Course data is consumed from `apps/web/src/courses` after export.
- Markdown and introduction pages are rendered via `apps/web/src/components/MarkDownPage.svelte`.

### Course content

Courses are authored in YAML under the top-level `courses` folder. These are exported into JSON and static assets for the web app.

- `scripts/exportAllYamlCourses.sh` exports all YAML courses.
- `scripts/exportYamlCourse.sh` exports a single course.
- `apps/web/scripts/prepareCourses.js` prepares the exported courses before development or build.

## Installing dependencies

This repository uses npm workspaces at the root and a dedicated web workspace at `apps/web`.

From the repository root:

```bash
npm install
```

This installs dependencies for the root workspace and packages under `apps/*`.

If you need Python tooling for course export or docs, install `pdm` separately and run:

```bash
pdm install
```

## Running the web app locally

From the root repository, use the workspace alias:

```bash
npm run web-serve
```

This runs the web app in development mode and should open it at:

```text
http://localhost:5173
```

If you want to run from the `apps/web` folder directly, use:

```bash
cd apps/web
npm run dev
```

## Preparing and exporting courses

The web app expects course data in JSON format. If you change course YAML, export it before testing.

### Export all courses

```bash
npm run exportAllCourses
```

### Export a single course

```bash
npm run exportCourse spanish-from-english
```

### Install external courses

If you need the set of external courses configured in the repo, run:

```bash
npm run installAllExternalCourses
```

For a single course install, use the `apps/web` script:

```bash
cd apps/web
npm run installCourse -- <course-name>
```

## Useful npm scripts

From the root repo:

- `npm run web-serve` — run the frontend dev server.
- `npm run export` — run the web export build.
- `npm run test` — run Jest tests.
- `npm run lint` — lint the repository and check formatting.
- `npm run format` — format files with ESLint and Prettier.
- `npm run docs` — serve docs via MkDocs.
- `npm run docs:build` — build static docs.

From `apps/web`:

- `npm run dev` — start the Vite dev server.
- `npm run build` — build the web app.
- `npm run preview` — preview the built app.
- `npm run prepareCourses` — prepare exported courses before dev and build.
- `npm run check` — run Svelte type checks.
- `npm run lint` — run Prettier and ESLint inside the web app.

## How code is organized

### Routing and pages

Routes are file-based, using SvelteKit/Sapper conventions in `apps/web/src/routes`.

- `course/[courseName]` handles a course overview.
- `course/[courseName]/skill/[skillName]/introduction` renders skill introduction pages.

### Components

Common UI pieces live in `apps/web/src/components` and `apps/lluis`.

- `SkillCard.svelte` renders each skill tile.
- `MarkDownPage.svelte` renders Markdown content with the site styles.
- `NavBar.svelte` is the navigation header.

### Course data loader

The loader in `apps/web/src/course-client/index.ts`:

- loads course metadata
- finds skills and introduction markdown
- normalizes course paths for server/client
- parses Markdown to HTML for introduction pages

## Developing updates

1. Install dependencies.
2. Export or update courses if you changed YAML.
3. Run `npm run web-serve`.
4. Edit routes, components, or course-client code.
5. Reload the browser and verify changes.

### Fixing introduction page styling

Introduction pages use `MarkDownPage.svelte`.
If you need a similar visual style to the course page, update the component and pass a CSS class from the route.

## Notes

- The repo is a monorepo with workspace-aware npm commands.
- The current developer docs are here in `docs/development.md`.
- The `docs` folder contains static documentation and is served with MkDocs via `npm run docs`.
