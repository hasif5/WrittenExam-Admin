# CLAUDE.md - Admin Panel

Scoped guidance for the **`admin/`** subproject (its own nested git repo). For product domain,
spec precedence (**the booklet wins**), and cross-cutting decisions, read the **root `../CLAUDE.md`
first** - it is the source of truth; this file only covers the admin frontend.

## What this is

A standalone **staff-only** SPA for the Engineer's Written Evaluation Platform, built against the
Phase 1 + Phase 1.5 backend API. Non-staff accounts cannot log in here. The public
student/examiner `web/` app is a separate, not-yet-built project.

## Stack

- **Vite + React 18 + TypeScript.** UI: **Mantine v7** + **Mantine React Table v2** (MRT).
  **No Tailwind, no shadcn** - use Mantine components (the author dislikes shadcn; avoid it).
- **Server state:** TanStack Query. **Forms:** React Hook Form + Zod.
- **Rich content:** `@mantine/tiptap` (TipTap) with inline **KaTeX** math.
- **Routing:** react-router-dom. **Dates:** dayjs.
- **API types:** generated from the backend OpenAPI schema via `openapi-typescript`.

## Commands (run from `admin/`)

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` (`tsc -b && vite build`) |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Tests | `npm run test` (vitest) |
| Regenerate API types | `npm run gen:api` (needs backend running on `127.0.0.1:8000`) |
| Format | `npm run format` |

`tsconfig` has `noUnusedLocals` + `noUnusedParameters` on, so unused imports/locals fail the
build - keep it clean. After changing backend request/response shapes, run `npm run gen:api`.

## Structure (`src/`)

- `api/` - `client.ts` (typed fetch + auth header + single-flight refresh-on-401), `schema.d.ts`
  (generated, do not hand-edit), `types.ts` (shared aliases over `Schemas`), `queries/*` (TanStack
  Query hooks per domain).
- `auth/` - `session.ts` (framework-agnostic token store), `AuthContext`/`useAuth`, `ProtectedRoute`,
  `RequirePermission` (route-level permission guard), `LoginPage`.
- `app/` - `providers.tsx`, `router.tsx`, `theme.ts` (theme registry), `appearance.ts` +
  `AppearanceProvider.tsx` (appearance state), `global.css`.
- `components/` - shared UI (`DataTable` MRT wrapper, `PageHero`, `ErrorState`, `AssetImage`, etc.).
- `assets/heroes/` - per-page hero banners (1K Nano Banana art, optimized to webp) + `index.ts` registry.
- `features/` - one folder per surface (`users`, `roles`, `taxonomy`, `question-bank`,
  `examiner-apps`, `examiners`, `deletion-queue`, `dashboard`). The Question Bank drawer is a
  thin composition root (`QuestionEditorDrawer`) over extracted sub-editors
  (`QuestionTaxonomyFields`, `ChildQuestionList`/`ChildQuestionEditor`, `childDoc.ts`).
- `layout/` - `AppShell`, `Sidebar`, `navigation.ts` (single nav model).
- `lib/` - `constants.ts`, `format.ts`, `notify.ts`, `confirm.ts`, `errors.ts`, `usePagination.ts`.

## Auth + RBAC (frontend)

- **Login:** email + password. Access token in memory + refresh token in `localStorage`;
  single-flight refresh-on-401. `loadMe` rejects non-staff (`is_staff === false`).
- **Permissions:** `/users/me` returns the operator's effective `permissions` + `is_staff`.
  `useAuth().can(permission)` is the gate helper (super-admin holds all). Gate **nav** (filter
  `NAV_SECTIONS` by `item.permission` in `Sidebar`), **routes** (`<RequirePermission permission=...>`
  in `router.tsx`), and **actions** (buttons/row actions) with `can(...)`. Show a clean
  access-restricted panel rather than a broken 403.
- **Roles & Permissions page** (`features/roles`, `rbac.manage`): manage staff role templates +
  the permission matrix. The super-admin role is locked (full access, read-only). Phone roles
  (student/examiner/pool) are web-side and not shown.

## Theming / appearance (extensible)

- **One inheritable root theme.** `app/theme.ts` exports `baseTheme` (the single Mantine theme every
  page inherits via the one `MantineProvider`). Never create per-page themes - extend `baseTheme`.
- **Appearances are a registry.** `APP_THEMES: Record<Appearance, { label, theme, colorScheme }>`
  maps each appearance to a theme override + the forced Mantine colour scheme (`"light" | "dark"`).
  Current entries: **Light**, **Dark** (both use `baseTheme`), **Colorful** (`colorfulTheme` = `baseTheme`
  + vivid `rainbow` primary, rides the light scheme). `APPEARANCE_ORDER` controls switcher order;
  `DEFAULT_APPEARANCE` is the first-run default.
- **To add a new appearance:** add a colour tuple + (optional) `mergeThemeOverrides(baseTheme, ...)`
  theme in `theme.ts`, add one `APP_THEMES` entry + its `Appearance` union member + `APPEARANCE_ORDER`
  slot. The switcher, persistence, and `data-app-theme` hook pick it up automatically - no other code.
- **State + wiring:** `AppearanceProvider` owns the selected appearance, persists it to
  `localStorage` (`wep_admin_appearance`), sets `data-app-theme` on `<html>`, and renders the root
  `MantineProvider` with `forceColorScheme`. `useAppearance()` exposes `appearance` / `setAppearance`;
  `components/ThemeSwitcher` is the menu (auto-built from the registry).
- **Page hero standard.** Every top-level page opens with `<PageHero title description? actions? image />`
  (replaces the old plain `PageHeader`). Heroes are one cohesive illustration per surface in **matching
  dark + light variants** (`<name>-dark.webp` / `<name>-light.webp`), keyed via `HEROES` in
  `assets/heroes/index.ts` as `{ dark, light }`. `PageHero` reads the active appearance's colour scheme
  (`APP_THEMES[appearance].colorScheme`) to pick the variant and flip its left-to-right scrim + text
  colour (navy scrim + white text in dark; white scrim + dark text in light/colorful). Add a page hero
  by dropping both webp variants in `assets/heroes/`, adding one `HEROES` entry, and passing it.
- **Scheme-specific surfaces** belong in `global.css`, keyed by `[data-mantine-color-scheme="..."]`
  (light/dark) and `[data-app-theme="colorful"]` (playful rainbow header accent, page wash, sidebar
  tint). Drive page chrome from CSS vars (`--app-shell-bg`, `--app-scrollbar-thumb`, `--login-form-bg`)
  so a new appearance only overrides variables, not component code.

## Conventions

- **File length cap (always maintained).** No source file may exceed **400 lines** (hard cap);
  **target under 300**. When a component/module nears the cap, split it by responsibility (extract
  sub-components, hooks, or helpers) rather than growing a "god file". **Exempt:** the generated
  `src/api/schema.d.ts` and lockfiles. `tsconfig` already fails on unused locals/imports; treat the
  line cap with the same discipline. Do not push a file already near the limit over it - refactor first.
- **User taxonomy (standardized):** the **Users page is split into two tabs** - "Frontend Users"
  (phone-based students/examiners/pool, default, fetched with `user_type=frontend`) and
  "Staff & Admins" (email-based admin accounts, `user_type=staff`, with create-staff + manage-roles).
  Keep these populations separate whenever surfacing users; never mix them in one list.
- **Mantine `Drawer`/`Modal` titles:** never pass a heading (`<Title>`) into the `title` prop - the
  wrapper already renders an `<h2>`, so a nested heading triggers `validateDOMNesting`. Use
  `<Text component="span" fw={600} fz="lg">` or a plain string.
- **Passage with child questions (Phase 1.6):** authoring a `passage_with_children` (compared via
  the `PASSAGE_WITH_CHILDREN` constant, never the literal) renders a reorderable list of child
  editors below the stem; the whole tree saves in one composite create/update (children embedded in
  the `QuestionCreate`/`QuestionUpdate` body, D5). Children carry no taxonomy selects (inherited
  server-side, D6); each child is keyed by a stable `localId` so reorder/remove never scrambles
  editor instances; per-child (and stem) image attach is edit-mode-only (D7). The Question Bank list
  uses `DataTable` row expansion (`enableExpanding` + `getSubRows={(row) => row.children}`) and
  gates New/Edit/Delete behind `useAuth().can("question_bank.write")`. `DataTable` exposes generic
  expansion pass-throughs (`enableExpanding`/`getSubRows`/`renderDetailPanel`/`enableExpandAll`) -
  keep table-specific logic in the page, not the wrapper. See
  `../docs/phase-1-6-passage-child-questions-plan.md`.
- **File header (branding) - required on every source file.** Leading `//` comment block with:
  one-line purpose, `File:` path relative to `admin/`, `Author: Hasif Ahmed <xmart@live.com>
  (www.hasif.info)`, `Created: <YYYY-MM-DD>`. Place it above any TypeScript triple-slash directive.
  Existing headers (some use `(www.hasif.info)` only) need not be normalized. Never alter or
  co-author the author.
- **Sole author:** Hasif Ahmed. Never add co-author trailers to commits.
- **No emojis** in source files.
- **Shell:** the author's primary env is Windows 11 PowerShell - `&&` is unsupported there.
- **Docs:** project `.md` docs live under `../docs/`; this `CLAUDE.md` is the only sanctioned root
  markdown for this subproject. Do not create per-task summary `.md` files unless asked.
- **Up-to-date framework docs:** use the context7 MCP for current React/Mantine/TanStack Query docs.
- **UI work:** use Mantine; do not introduce shadcn.
