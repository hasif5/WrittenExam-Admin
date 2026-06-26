# Admin Panel — Engineer's Written Evaluation Platform

> Author: Hasif Ahmed (xmart@live.com, www.hasif.info)

A standalone Vite + React + TypeScript single-page app for staff (admin / finance).
It connects to the Phase 1 FastAPI backend and wires up every Phase 1 admin surface:
users & roles, the account-deletion queue, examiner applications, the examiner roster,
taxonomy (sections / subjects / chapters), the Question Bank (rich text + LaTeX +
image assets), and permissioned asset preview/upload.

Plan of record: `../docs/admin-panel-plan.md`. Backend contract: `../docs/api-endpoint-list.md` (BUILT).

## Stack

- Vite + React 18 + TypeScript (SPA, no SSR).
- Mantine v7 + Mantine React Table v2 (Mantine-only styling; no Tailwind).
- TanStack Query v5 (server state) + a small in-memory auth context (session state).
- React Router v7, React Hook Form + Zod (login / staff create).
- `@mantine/tiptap` (TipTap) with an inline KaTeX math node for question content + solution.
- Type-safe API: types generated from the backend OpenAPI schema via `openapi-typescript`,
  consumed by a thin typed `fetch` client (`src/api/client.ts`).

## Prerequisites

- Node 18+ and npm.
- The Phase 1 backend running locally (brew-native PostgreSQL; see `../backend/README.md`),
  serving `http://127.0.0.1:8000`, with at least one staff account
  (`python -m app.scripts.bootstrap`).

## Setup

PowerShell users: `&&` is unsupported — run commands separately or chain with `;`.

```
cd admin
npm install
copy .env.example .env        # macOS/Linux: cp .env.example .env
# set VITE_API_BASE_URL=http://localhost:8000 (default)

# generate API types from the running backend (backend must be up)
npm run gen:api               # openapi-typescript -> src/api/schema.d.ts

npm run dev                   # http://localhost:5173
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server (http://localhost:5173) |
| `npm run gen:api` | Regenerate `src/api/schema.d.ts` from `http://127.0.0.1:8000/openapi.json` |
| `npm run build` | Type-check + production build |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit/integration) |
| `npm run format` | Prettier |

## Auth & session

- Login posts email + password to `/auth/login`. The access token is held **in memory**;
  the refresh token is stored in `localStorage`.
- On load (fresh tab/reload) the app silently refreshes via `/auth/token/refresh` before
  rendering protected routes.
- A 401 triggers a **single-flight** refresh + one retry of the original request; if refresh
  fails the session is cleared and the user is redirected to `/login`.
- The app is **staff-only**: a successful login must include the `admin` or `finance` role,
  otherwise it is rejected and the session cleared.

## Notes / gotchas

- **Permissioned assets:** `GET /assets/{id}` requires the `Authorization` header, so a plain
  `<img src>` will not load. The `AssetImage` component fetches the bytes via the typed client
  and renders an object URL.
- **CORS:** in backend debug mode all origins are allowed, so the dev server works out of the
  box. For a non-debug/staging backend, add this app's origin to the backend CORS allow-list
  (config-only; no new endpoint).
- **Scope:** only Phase 1 surfaces are built. Later domains (courses, evaluation, finance,
  reports) appear as disabled sidebar placeholders — no data screens and no invented endpoints.
