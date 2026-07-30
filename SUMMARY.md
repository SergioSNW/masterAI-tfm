# Root Cause Analysis — Casting Platform (TFM)

## Overview

This document catalogs all identified root causes for the four symptoms reported in the SPA (apps/web). Each symptom is traced to specific code locations and systemic patterns.

---

## Symptom 1: Actors are no longer being retrieved from the backend

**Observed:** `GET /api/actors` returns no data. The actors list in the UI is permanently empty.

### Root Causes

| # | Cause | Location | Severity |
|---|-------|----------|----------|
| 1.1 | **Database unavailable** — `listActors` uses `PrismaActorRepository` which requires a working Neon.tech PostgreSQL connection. If the DATABASE_URL is misconfigured or the DB is unreachable, the endpoint returns 500. | `api/_index.ts:165-171` | 🔴 |
| 1.2 | **Prisma Client not regenerated** — The schema was changed (SQLite → PostgreSQL) but `prisma generate` may not have run in the Vercel build. `esbuild` externalizes `@prisma/client`, so a stale/missing generated client causes runtime failure. | `packages/database/package.json:postinstall` + `package.json:build:api` | 🔴 |
| 1.3 | **Silent degradation** — `fetchActors()` catches all API errors with `.catch(() => null)` and returns an empty `localActors` array. The `ActorContext.fetch()` never reaches its `catch` branch, so the user sees no error message. | `actorService.ts:46-56` | 🟡 |

### Why tests pass

- Unit tests mock the use case/repository layer, not the actual database.
- Integration tests (`GET /api/actors`) only check for 200 status and `Array.isArray()` — they don't seed data or verify connectivity.
- E2E tests (`actors.spec.ts`) have no test for the empty-state error path.

---

## Symptom 2: The state of Castings cannot be updated

**Observed:** The phase dropdown in `CastingDetailView` always shows "First Round". Selecting a different phase visually changes it for a moment, then snaps back.

### Root Causes

| # | Cause | Location | Severity |
|---|-------|----------|----------|
| 2.1 | **`activePhase` not in local `Casting` type** — The `Casting` interface in `mock.ts` has no `activePhase` field. The `PhaseDropdown` hardcodes `useState('First Round')` instead of reading from the casting data. | `CastingDetailView.tsx:18` + `mock.ts:33-41` | 🔴 |
| 2.2 | **API call always fails** — `updateCastingPhase()` → `PUT /castings/:id/phase` → `PrismaCastingRepository.updatePhase()`. Same DB connectivity problem as Symptom 1. | `castingService.ts:15-16` + `api/_index.ts:104` | 🔴 |
| 2.3 | **Optimistic rollback on failure** — The dropdown catches the API error and reverts `phase` to the previous value via `setPhase(prev)`. Since every API call fails, every selection snaps back instantly. | `CastingDetailView.tsx:20-31` | 🟡 |
| 2.4 | **No error message** — The `.catch` in `handleChange` only calls `setPhase(prev)` and `toast.error()`, but the toast may not fire if the `await updateCastingPhase()` promise is rejected with a non-catchable error (e.g., network hang before the fetch in `api.ts:7-18` rejects). | `CastingDetailView.tsx:27-29` | 🟡 |

---

## Symptom 3: Projects and Castings are not clickable in the Master view

**Observed:** Clicking a project card (or casting/round card) changes the URL but the same view re-renders. The detail views never appear.

### Root Causes

| # | Cause | Location | Severity |
|---|-------|----------|----------|
| 3.1 | **Missing routes** — `<Routes>` only defines `/actors` and `*` (catch-all → ProjectsView). All project/casting/round navigation URLs match the catch-all, so ProjectsView renders for every click. | `App.tsx:92-95` | 🔴 |
| 3.2 | **Detail views are orphaned** — `ProjectDetailView`, `CastingDetailView`, and `RoundDetailView` are fully implemented but never referenced in any `<Route>`. They are dead code. | All exist as files, never rendered by router | 🔴 |
| 3.3 | **No `<Route path="/project/:id">` or similar** — The navigation `navigate('/project/${id}')` expects react-router to render a matching view, but no such route exists. The catch-all `*` absorbs everything. | `App.tsx:94` | 🔴 |

---

## Symptom 4: SPA routing fails for /docs, /help, /settings navigation

**Observed:** Clicking Docs/Help/Settings in the sidebar changes the URL but always shows the Projects view.

### Root Causes

| # | Cause | Location | Severity |
|---|-------|----------|----------|
| 4.1 | **No routes for sidebar paths** — The nav items at `/docs`, `/help`, `/settings` have no corresponding `<Route>` elements. | `App.tsx:16-22` (nav defined) but `App.tsx:92-95` (no routes for these) | 🔴 |
| 4.2 | **Views imported but unused** — `DocsView`, `HelpView`, and `SettingsView` are imported at the top of `App.tsx` (lines 8-10) but are never passed to any `<Route>`. | `App.tsx:8-10` imported, never rendered | 🔴 |
| 4.3 | **Catch-all route (`*`) matches everything** — Every unrecognized path renders `ProjectsView`, making sidebar navigation completely broken for 3 of 5 nav items. | `App.tsx:94` | 🔴 |

---

## Systemic / Cross-cutting Issues

| # | Issue | Impact | Files Affected |
|---|-------|--------|---------------|
| S.1 | **UUID validation inconsistency** — Some schemas use `z.string().uuid()` for IDs, others use `z.string().min(1)`. Mock data (`p1`, `c1`, `d1`) fails UUID schemas. All uses of UUID schemas with mock IDs will return 400 from the API and silently fall back to local state. | Prevents writing to DB for Creation schemas (CreateProject, CreateCasting, CreateRound) and some mutation schemas (OpenRound, CloseRound, etc.) | `packages/infrastructure/validation/*.ts` — half use uuid, half min(1) |
| S.2 | **Pervasive `.catch(() => null)` pattern** — Every service function silently swallows API errors. The frontend never surfaces backend failures to the user. This makes all 4 symptoms appear as silent broken behavior rather than actionable errors. | Masks all root causes, makes debugging impossible for users | `actorService.ts:46,73`, `projectService.ts:18`, `CastingDetailView.tsx:25`, `RoundDetailView.tsx:100` |
| S.3 | **No offline/demo fallback** — When the database is unavailable, the mock data (`mock.ts`) should serve as a fallback. But the app only uses mock data at the top level (in `App.tsx` via `useState(mockProjects)`) — all CRUD operations try the API first and only fall back to empty state or mock-patterned local arrays. | Empty UI with no indication of what's wrong | `mock.ts` unused for fallback in most services |
| S.4 | **App state is not shared with detail views** — `ProjectDetailView`, `CastingDetailView`, and `RoundDetailView` receive data only as props from the parent. They have no access to the `ProjectContext` or any global state, so mutations inside detail views are never reflected upstream. | Casting/round changes in detail views are lost when navigating back | `ProjectDetailView.tsx`, `CastingDetailView.tsx`, `RoundDetailView.tsx` — all prop-driven |

---

## Revised Preliminary Conclusions

1. **Project creation "works" only through local fallback.** The API call always fails (mock `directorId: 'd1'` fails `CreateProjectSchema.directorId` UUID check, or DB unreachable), but the `.catch` in `App.tsx.handleProjectCreate` creates a local project with a timestamp-based ID. The user sees the new project in the list even though no data reaches the database.

2. **All other operations fail silently or not at all.** Actor list is empty (API 500 → `.catch` → empty fallback). Phase changes roll back (API fails → optimistic revert). Detail views never mount (no routes). Sidebar nav renders wrong views (catch-all route).

3. **The fix requires both code changes and environment configuration:**
   - **Routes** must be added for project detail, casting detail, round detail, docs, help, and settings.
   - **Zod UUID schemas** must be relaxed for mock-data compatibility during demo/development, OR mock data must use real UUIDs.
   - **Error handling** should surface backend failures to the user instead of silently degrading.
   - **Database** must be seeded with matching data or the app must have a proper offline/demo mode.

4. **The router is the most impactful single fix** — adding the 6 missing routes would immediately make ~70% of the app navigable (Symptoms 3 & 4 would be fully resolved). The remaining symptoms (1, 2) would then be visible as data issues rather than routing issues, making them easier to debug.
