# Architecture & OpenCode Context: Casting Platform (TFM)

**Workspace Name:** `masterai-tfm`

## 1. Project Identity & Purpose

This project is a Multi-Platform Casting System developed as a Master's Thesis in AI Development. It orchestrates video/audio submissions for actors and casting directors.

You (OpenCode) are acting as an expert Full-Stack Software Engineer. Your primary directive is to write highly optimized, modular code strictly adhering to Clean Architecture principles. The code must be tailored for local development environments with thermal and hardware constraints (optimizing for fast TypeScript compilations) and deployed to serverless environments.

## 2. Core Tech Stack (Strict Constraints)

- **Language:** TypeScript (Strict mode enabled). Absolutely NO Python or plain JavaScript.
- **Backend Architecture:** Serverless Functions (Vercel). NO continuous Express servers. NO Next.js boilerplate; we maintain a strict boundary between client and server.
- **Database:** Neon.tech (Serverless PostgreSQL) managed via Prisma ORM.
- **Validation:** Zod (for all incoming DTOs and API payloads).
- **Frontend (Director):** React Web (Vite) deployed as an SPA.
- **Frontend (Actor):** React Native (Expo).
- **Orchestration:** n8n (triggered via webhooks from the serverless backend).
- **Video Storage Constraint:** Max 24GB total. Strict compression and TTL (Time-To-Live) cleanup required. Max payload per video is capped at 5MB for the academic demo.

## 3. Clean Architecture Folder Structure

The workspace is organized as a monorepo to isolate core business logic from infrastructure and UI frameworks. Dependencies only point INWARD.

    /masterai-tfm
    │
    ├── /api                      # Vercel Serverless Functions (The Adapters/Controllers)
    │   ├── /castings             # e.g., POST api/castings/create.ts
    │   └── /submissions          # e.g., POST api/submissions/upload.ts
    │
    ├── /packages                 # Shared logic (The Core)
    │   ├── /core                 # NO EXTERNAL LIBRARIES ALLOWED HERE
    │   │   ├── /entities         # Pure TS: Actor.ts, Casting.ts, Submission.ts
    │   │   ├── /use-cases        # Pure TS: SubmitVideoUseCase.ts, CloseRoundUseCase.ts
    │   │   └── /repositories     # Pure TS Interfaces: ICastingRepository.ts
    │   │
    │   └── /infrastructure       # The implementations (External world)
    │       ├── /database         # Prisma schema, migrations, and PrismaClient
    │       ├── /storage          # Local compression logic / 5MB limit enforcers
    │       └── /n8n              # Webhook trigger services
    │
    ├── /apps                     # The Frontends
    │   ├── /web                  # React + Vite (Director Dashboard)
    │   └── /mobile               # React Native + Expo (Actor App)
    │
    ├── architecture.md           # This file (System Prompt & Architecture)
    ├── package.json              # Root workspace file (npm workspaces)
    └── vercel.json               # Vercel configuration for the /api routing

## 4. Architectural Rules (Non-Negotiable)

1. **Entities & Use Cases:** Must be pure TypeScript. They accept standard DTOs, enforce business rules (e.g., one submission per actor per round), and interact ONLY through Repository Interfaces.
2. **Adapters/Controllers:** The `api/` directory and UI hooks are the ONLY layers allowed to use Vercel's Request/Response objects, Prisma clients, or Zod schemas.
3. **Stateless Backend:** Ensure backend functions are stateless. Database connections must be optimized for serverless environments.
4. **No Hallucinations:** Use only the libraries specified in the project. Do not introduce new dependencies without explicit human permission.

---

## 5. OpenCode Instructions: Initialization & Next Steps

**Immediate Task (Step 1):**
Your first task is to bootstrap the `/packages/core` directory.

1. Define the core **Entities** (`Project`, `Casting`, `Round`, `Submission`, `Actor`, `Director`) in strict TypeScript.
2. Define the **Repository Interfaces** (e.g., `ICastingRepository`, `ISubmissionRepository`) that the Use Cases will rely on.

**Execution Constraint:** Do NOT proceed to generate Use Cases, Prisma schemas, or UI components until the human developer has explicitly reviewed and approved the Entities and Interfaces.

**Next Steps (Awaiting Human Approval):**

- **Step 2:** Write the Use Cases (Business Logic) inside `/packages/core/use-cases`.
- **Step 3:** Setup `/packages/infrastructure` (Prisma schema and Zod validation).
- **Step 4:** Implement the Serverless Adapters in the `/api` directory.
- **Step 5:** Scaffolding the React (Vite) and React Native (Expo) apps in `/apps`.
