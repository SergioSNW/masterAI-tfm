# Master Plan & Execution Roadmap — MasterAI Casting Platform

## 1. Project Context & Directives for OpenCode
You are executing the development of a Master's Thesis project: a Multi-Platform Casting System. The repository is already scaffolded with a strict Clean Architecture pattern (Entities, Use Cases, Repositories, Adapters) deployed as a monorepo.

Before generating code for the upcoming phases, you MUST adhere to the following strategic architectural directives:

### Directive A: Serverless Storage Constraint (CRITICAL)
The backend API is deployed using Vercel Serverless Functions. Vercel environments have a read-only filesystem (the `/tmp` directory is ephemeral and unreliable for storage).
* **DO NOT** implement local disk storage (e.g., saving to `/uploads` with Multer).
* **Implementation:** For the strict 5MB academic demo limit, video submissions must be parsed into memory (e.g., as a `Buffer` or `Base64` string) and either stored directly in a PostgreSQL `bytea` column OR streamed immediately to an external S3-compatible bucket (like Cloudflare R2).

### Directive B: Unified Actor UI (React Native / Expo)
To optimize development time and maintain a single codebase for the Actor experience, we are bypassing a separate React SPA for the actors.
* **Implementation:** The Actor application will be built entirely in `/apps/mobile` using **React Native and Expo**.
* Because Expo natively supports web compilation, this single codebase will serve as both the native mobile application and the browser-based web demo for the final presentation.

### Directive C: Live Documentation
The platform will feature a `/docs` route within the Director Web App.
* **Implementation:** This route will render markdown files using the same glass-morphism UI design. This is a high-priority feature, as this repository directly supports an ongoing "build in public" technical content strategy aimed at professional engineering networks.

### Directive D: Scope Protection
Core functionality (The "Happy Path") must be secured before touching complex relational data. The Director must be able to create a casting, the Actor must be able to upload a video, and the Director must be able to view it. Collaborative features are isolated to the final phase.

---

## 2. Execution Phases

### Phase 1 — Actor Management (Director Web App)
- `GET /api/actors` + `POST /api/actors/create` serverless endpoints
- Actor list view with search bar (by name, email) — wire to real API, replace mock data
- Create actor form (name, email, phone, profile picture URL) validated with Zod
- `CreateActorUseCase` + `ListActorsUseCase` in core layer

### Phase 2 — Manual Video Upload (Serverless Optimized)
- Upload modal on Round detail view: actor selector → file picker (.mp4/.mov) → 5MB client check → progress bar → notes → submit
- `POST /api/submissions/upload` — multipart handled entirely in memory (Buffer/Base64 — no disk storage)
- Store video as PostgreSQL `bytea` or stream to S3-compatible bucket
- Server-side 5MB enforcement

### Phase 3 — Actor App (Expo)
- Single `apps/mobile` codebase (React Native + Expo)
- Compiles to both Expo Go (native) and web (demo presentation)
- Flows: Browse Open Castings → Record/Upload Video → Track Status → View Feedback
- Unique upload link per casting (invite-only, no open browsing)

### Phase 4 — Live Documentation
- `/docs` route inside the director web app
- Glass-morphism UI rendering: architecture overview, ERD, tech stack, full API reference
- Supports the "build in public" content strategy

### Phase 5 — Polish & UX
- Wire all remaining views to live API (eliminate all mock data)
- Loading skeletons, error toasts, empty states
- Responsive layout

### Phase 6 — Collaborative Features (Bonus — after happy path is solid)
- **Invite creatives** to a project — `POST /api/projects/invite`, `ProjectCollaborator` entity
- **Internal comments** on submissions — `Comment` model, visible to the project team only
- **Star/Favourite** toggle on submission cards — persisted to DB, filtered view
- **Actor-visible feedback** — `GET /api/submissions/:id/feedback` endpoint
- **Role status broadcast** — when casting moves to `cast`/`offer`, notify all submitters
- **"Tape watched" tracking** — mark submissions as viewed, expose to actor

---

## 3. Current Status

| Phase | Status |
|-------|--------|
| Foundation (Core/Infra/API scaffold) | ✅ Complete |
| Phase 1 — Actor Management | 🔨 In progress |
| Phase 2 — Manual Video Upload | ⏳ Pending |
| Phase 3 — Actor App (Expo) | ⏳ Pending |
| Phase 4 — Live Documentation | ⏳ Pending |
| Phase 5 — Polish & UX | ⏳ Pending |
| Phase 6 — Collaborative Features | ⏳ Pending |
