# MasterAI Casting Platform

> Master's Thesis (TFM) — Development with AI
> A multi-platform casting system: a director web dashboard and an actor mobile app, sharing one serverless backend.

**Live demo:** [master-ai-tfm.vercel.app](https://master-ai-tfm.vercel.app)
**Full architecture reference:** [ARCHITECTURE_TEXTBOOK.md](./ARCHITECTURE_TEXTBOOK.md)

---

## What this is

Casting directors traditionally juggle email threads, shared drives, and spreadsheets to run auditions. This project digitizes that workflow end to end:

1. A **director** creates a project, defines roles (castings), and opens audition rounds with deadlines.
2. An **actor** browses open castings on their phone, records a self-tape in-app, and submits it.
3. The director reviews submissions — watches the video, reads an **AI-generated transcript and score** (Whisper + GPT-4o-mini), leaves feedback, and shortlists or rejects.

Two front ends, one API, one database:

| | |
|---|---|
| **Director dashboard** | React 19 + Vite SPA, deployed on Vercel |
| **Actor app** | React Native + Expo (SDK 54) — runs natively on iOS/Android and compiles to web from the same codebase |
| **Backend** | Vercel Serverless Functions — a Clean Architecture core with no framework dependencies |
| **Database** | Neon.tech (serverless PostgreSQL) via Prisma |
| **Video/files** | Cloudinary (video) and Vercel Blob (documents), never through the database |
| **AI review** | OpenAI Whisper (transcription) + GPT-4o-mini (scoring), triggered per submission |

No authentication — this is an academic demo meant to be tried without friction; see [ARCHITECTURE_TEXTBOOK.md §1.2](./ARCHITECTURE_TEXTBOOK.md#12-design-principles) for the reasoning.

---

## Try it

### Director dashboard (web)

Open the live deployment, or scan:

<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fmaster-ai-tfm.vercel.app" alt="QR code linking to the director dashboard" width="220" height="220" />

→ [master-ai-tfm.vercel.app](https://master-ai-tfm.vercel.app) — pick **Director** on the landing screen.

### Actor app (mobile)

The actor app is a real Expo app — camera recording, native navigation — built with EAS and installed via QR, same as any app you'd side-load for testing.

| Platform | Status |
|---|---|
| **Android** | Internal-distribution APK via EAS Build. Regenerate before a live demo — EAS artifacts expire after ~30 days — with: `EXPO_TOKEN=<your token> eas build --profile preview --platform android --non-interactive` (run from `apps/mobile`). The command prints an install-page URL; a QR for that page belongs here once generated. |
| **iOS** | No build published yet. Internal/ad-hoc iOS builds only install on devices whose UDID was registered *before* the build — not practical for a panel scanning a QR on their own phones. The realistic options are (a) [TestFlight](https://developer.apple.com/testflight/) via the Apple Developer Program, or (b) deploying the same codebase's `expo export -p web` output (see `apps/mobile`) as a second Vercel target — every phone can open that in a browser, no install or provisioning needed. Neither is set up yet. |

Alternatively, run it yourself:

```bash
npm run dev:mobile        # scan the terminal QR with Expo Go (or your dev client, if you've built one)
npm run dev:mobile:web    # opens in a browser, no phone needed
```

---

## Architecture

Strict Clean Architecture (Entities → Use Cases → Repository Interfaces → Adapters), enforced as a monorepo of npm workspaces:

```
apps/web (React SPA) ─┐
                       ├──> api/ (26 routes, one Vercel function) ──> packages/infrastructure (Prisma + Zod)
apps/mobile (Expo)  ───┘                                                       │
                                                                                ▼
                                                                    packages/core (zero deps)
                                                                    Entities · Use Cases · Repo interfaces
                                                                                │
                                                                                ▼
                                                                    Neon.tech PostgreSQL
```

- **`packages/core`** — 8 entities, 24 use cases, 8 repository interfaces. Pure TypeScript, no imports from anything else in the repo.
- **`packages/infrastructure`** — Prisma repository implementations and 20 Zod validation schemas. The only layer allowed to import Prisma or Zod.
- **`packages/database`** — the Prisma schema, generated client, and seed script.
- **`api/`** — one hand-rolled router (`api/router.ts`) dispatching 26 routes by regex, plus two standalone functions for Cloudinary signing and Vercel Blob uploads.
- **`apps/web`** / **`apps/mobile`** — thin UI layers; all business logic lives in `packages/core`.

Full detail — every entity, every use case, full data-flow walkthroughs, the testing strategy, and the deployment setup — is in **[ARCHITECTURE_TEXTBOOK.md](./ARCHITECTURE_TEXTBOOK.md)**.

---

## Getting started

**Requirements:** Node 20+, npm, a [Neon.tech](https://neon.tech) Postgres database (or any Postgres connection string).

```bash
git clone <this-repo>
cd masterai-tfm
npm install --legacy-peer-deps
```

Copy the environment templates and fill in your own credentials (see below for what each is for):

```bash
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
```

| Variable | Where | Required for |
|---|---|---|
| `DATABASE_URL` | `.env` | Everything — Prisma connects to this |
| `OPENAI_API_KEY` | `.env` | AI submission analysis (`/api/analyze`) |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | `.env` | Actor video uploads |
| `BLOB_READ_WRITE_TOKEN` | `.env` | Round document/attachment uploads (auto-set by Vercel when deployed; only needed locally for `vercel dev`) |
| `EXPO_PUBLIC_API_URL` | `apps/mobile/.env` | Point the mobile app at your own API instead of the deployed one |

Push the schema and seed demo data:

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed -w packages/database
```

Run everything locally:

```bash
npm run dev:all       # web + api + mobile (Metro), concurrently
# or individually:
npm run dev:web        # Vite dev server
npm run dev:api         # vercel dev, serverless functions on :3000
npm run dev:mobile      # Expo, scan with Expo Go
npm run dev:mobile:web  # Expo, opens in a browser
```

---

## Testing

```bash
npm run test          # core + infrastructure + web unit/integration tests
npm run test:core      # 65 tests — use case business logic
npm run test:infra      # 36 tests — Zod schema validation
npm run test:web         # 51 tests — React component/context tests
npm run test:e2e          # 11 Playwright browser tests (needs the web app running)
npm run test:all           # everything above
npm test -w apps/mobile     # 29 tests
npm run maestro:test         # 6 device-flow specs, needs a running simulator/device
```

See [ARCHITECTURE_TEXTBOOK.md §19](./ARCHITECTURE_TEXTBOOK.md#19-testing-strategy) for what each layer covers and why.

---

## Deployment

- **Web + API:** Vercel. `vercel.json` builds `apps/web` and bundles `api/router.ts` with esbuild; pushing to `main` deploys automatically once the project is linked.
- **Mobile:** EAS Build (`eas.json` — `development`, `preview`, `production` profiles). `eas build --profile preview --platform android` (or `ios`) produces an internal-distribution build; see [Try it](#try-it) above for current build status.

---

## Project layout

```
masterai-tfm/
├── packages/
│   ├── core/            # entities, use cases, repository interfaces — zero dependencies
│   ├── database/         # Prisma schema, client, seed script
│   └── infrastructure/    # Prisma repos + Zod schemas
├── api/                  # serverless functions (router.ts is the main one)
├── apps/
│   ├── web/               # director dashboard (React + Vite)
│   └── mobile/              # actor app (Expo + React Native)
└── e2e/                     # Playwright specs + scripted API walkthroughs
```

---

## Status

The happy path — director creates a casting, actor records and submits a self-tape, director reviews it with AI-assisted scoring — is fully wired end to end against a real database, Cloudinary, and OpenAI. See [ARCHITECTURE_TEXTBOOK.md](./ARCHITECTURE_TEXTBOOK.md) for what's implemented, what's a known rough edge (e.g. some API failures still fall back to local state instead of surfacing an error), and the full test suite backing it.
