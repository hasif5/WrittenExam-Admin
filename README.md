# Admin Panel — Engineer's Written Evaluation Platform

> Author: Hasif Ahmed (xmart@live.com, www.hasif.info)

A standalone Vite + React + TypeScript single-page app for staff (admin / finance).
It connects to the Phase 1 FastAPI backend and wires up every Phase 1 admin surface:
the dashboard, users & roles, the account-deletion queue, examiner applications, the
examiner roster, taxonomy (sections / subjects / chapters), the Question Bank (rich text
+ LaTeX + image assets), and permissioned asset preview/upload.

This is one of several side-by-side repositories in the platform workspace
(`WrittenExam-Admin` here, plus `WrittenExam-Backend`). The `../docs` and `../backend`
paths referenced below resolve only in a full workspace checkout where `admin/`,
`backend/`, and `docs/` sit under the same `Written-Exam-Project` parent directory.

- Plan of record: `../docs/admin-panel-plan.md`
- Backend contract: `../docs/api-endpoint-list.md` (built) — types are generated directly
  from the backend's live OpenAPI schema.

## Stack

- Vite 5 + React 18 + TypeScript 5 (SPA, no SSR).
- Mantine v7 + Mantine React Table v2 for the data grids (Mantine-only styling via
  `postcss-preset-mantine`; no Tailwind).
- TanStack Query v5 for server state; a small framework-agnostic auth/session module plus
  a React `AuthContext` for session state.
- React Router v7; React Hook Form + Zod for the login and staff-create forms.
- `@mantine/tiptap` (TipTap) with a custom inline KaTeX math node for question content and
  solutions.
- Type-safe API: types generated from the backend OpenAPI schema via `openapi-typescript`,
  consumed by a thin typed `fetch` client (`src/api/client.ts`).

## Project structure

```
admin/
├─ index.html                  # SPA shell; pre-paint Mantine colour-scheme bootstrap
├─ vite.config.ts              # Vite + Vitest config (dev port 5173, "@" -> ./src alias)
├─ .env.example                # VITE_API_BASE_URL
└─ src/
   ├─ main.tsx                 # entry: mounts <AppProviders> + <RouterProvider>
   ├─ app/
   │  ├─ providers.tsx         # Mantine + QueryClient + Notifications + Modals + Auth
   │  ├─ router.tsx            # /login (public) + protected AppShell routes
   │  └─ theme.ts              # Mantine theme (brand primary, dark default)
   ├─ auth/
   │  ├─ session.ts            # token manager: access in memory, refresh in localStorage
   │  ├─ AuthContext.tsx       # React bridge; staff-only (admin/finance) gate
   │  ├─ ProtectedRoute.tsx    # redirects to /login when anonymous
   │  ├─ LoginPage.tsx
   │  └─ useAuth.ts
   ├─ api/
   │  ├─ client.ts             # typed fetch client (Bearer, 401 refresh+retry, ApiError)
   │  ├─ schema.d.ts           # GENERATED from backend OpenAPI (npm run gen:api)
   │  ├─ types.ts
   │  └─ queries/              # TanStack Query hooks: assets, examiners, questions, taxonomy, users
   ├─ components/              # AssetImage, DataTable, PageHeader, ErrorState, ColorSchemeToggle
   ├─ features/
   │  ├─ dashboard/
   │  ├─ users/                # users & roles, create staff
   │  ├─ deletion-queue/
   │  ├─ examiner-apps/        # application review drawer
   │  ├─ examiners/            # roster, display fields, fee override, pool membership
   │  ├─ taxonomy/             # sections / subjects / chapters
   │  └─ question-bank/        # rich text + KaTeX math node + image assets
   ├─ layout/                  # AppShell, Sidebar
   ├─ lib/                     # constants, errors, format, notify, confirm, usePagination
   └─ test/setup.ts            # Vitest setup (jest-dom matchers + matchMedia polyfill)
```

## Prerequisites

- Node 18+ and npm.
- The Phase 1 backend running locally on `http://127.0.0.1:8000` (brew-native PostgreSQL;
  see `../backend/README.md`), with at least one staff account
  (`python -m app.scripts.bootstrap`).

## Setup

PowerShell users: `&&` is unsupported — run commands separately or chain with `;`.

```
cd admin
npm install
copy .env.example .env        # macOS/Linux: cp .env.example .env
# VITE_API_BASE_URL defaults to http://localhost:8000

# generate API types from the running backend (backend must be up)
npm run gen:api               # openapi-typescript -> src/api/schema.d.ts

npm run dev                   # http://localhost:5173
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server (http://localhost:5173) |
| `npm run gen:api` | Regenerate `src/api/schema.d.ts` from `http://127.0.0.1:8000/openapi.json` |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only (`tsc -b --noEmit`) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest, single run |
| `npm run test:watch` | Vitest, watch mode |
| `npm run format` | Prettier (write) |

## Architecture

### Auth & session

- Login posts email + password to `/auth/login`. The access token is held **in memory**;
  the refresh token is stored in `localStorage` and rotated on use.
- On load (fresh tab/reload) the app silently refreshes via `/auth/token/refresh`, then
  fetches `/users/me`, before rendering protected routes.
- A 401 triggers a **single-flight** refresh + one retry of the original request; if refresh
  fails the session is cleared and the user is redirected to `/login`.
- The app is **staff-only**: a successful login must include the `admin` or `finance` role,
  otherwise it is rejected and the session cleared.

### Data layer

- Server state is owned by TanStack Query. The shared `QueryClient` retries up to twice but
  **never** retries `401 / 403 / 404`, uses a 30s `staleTime`, and disables refetch on window
  focus.
- Every request goes through the typed client, with request/response shapes pinned to the
  generated OpenAPI schema so they cannot silently drift from the backend.

### Permissioned assets

- `GET /assets/{id}` requires the `Authorization` header, so a plain `<img src>` will not load.
  The `AssetImage` component fetches the bytes via the typed client (`fetchAssetBlob`) and
  renders an object URL, revoking it on unmount.

## Testing

- Vitest in a jsdom environment, with `@testing-library/jest-dom` matchers loaded from
  `src/test/setup.ts`.
- Unit tests cover the session refresh / single-flight logic, API error mapping, pagination,
  and TipTap document conversion. Run once with `npm run test` or in watch mode with
  `npm run test:watch`.

## Notes / gotchas

- **CORS:** in backend debug mode all origins are allowed, so the dev server works out of the
  box. For a non-debug/staging backend, add this app's origin to the backend CORS allow-list
  (config-only; no new endpoint).
- **Scope:** only Phase 1 surfaces are built. Later domains (Courses & Quizzes, Evaluation,
  Wallet & Payouts, Reports) appear as disabled sidebar placeholders — no data screens and no
  invented endpoints.

## License

Proprietary / UNLICENSED. Copyright (c) Hasif Ahmed (xmart@live.com, www.hasif.info).
All rights reserved.
