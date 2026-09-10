# ARCHITECTURE_TEXTBOOK.md

# Multi-Platform Casting System — Comprehensive Architecture Reference

> **Project:** MasterAI TFM (Master's Thesis in AI Development)
> **Domain:** Multi-Platform Video Casting System
> **Version:** 0.1.0
> **Last Updated:** September 2026

---

## Table of Contents

1. [Introduction and Purpose](#1-introduction-and-purpose)
2. [High-Level System Overview](#2-high-level-system-overview)
3. [Monorepo Architecture and Workspace Strategy](#3-monorepo-architecture-and-workspace-strategy)
4. [Domain-Driven Design: The Clean Core](#4-domain-driven-design-the-clean-core)
5. [Entity Catalogue](#5-entity-catalogue)
6. [Repository Pattern and Interface Segregation](#6-repository-pattern-and-interface-segregation)
7. [Use Case Layer: Business Logic Encapsulation](#7-use-case-layer-business-logic-encapsulation)
8. [The Result Type: Functional Error Handling](#8-the-result-type-functional-error-handling)
9. [Infrastructure Layer](#9-infrastructure-layer)
10. [Database Schema and ORM](#10-database-schema-and-orm)
11. [Input Validation with Zod](#11-input-validation-with-zod)
12. [Serverless API Layer](#12-serverless-api-layer)
13. [Technology Stack Deep Dive](#13-technology-stack-deep-dive)
14. [Frontend: Director Dashboard (React + Vite)](#14-frontend-director-dashboard-react--vite)
15. [Frontend: Actor Mobile App (Expo / React Native)](#15-frontend-actor-mobile-app-expo--react-native)
16. [Design System: visionOS-Inspired Glassmorphism](#16-design-system-visionos-inspired-glassmorphism)
17. [Data Flow: Complete Request Lifecycle](#17-data-flow-complete-request-lifecycle)
18. [State Management Strategy](#18-state-management-strategy)
19. [Testing Strategy](#19-testing-strategy)
20. [Deployment and DevOps](#20-deployment-and-devops)
21. [Project Directory Reference](#21-project-directory-reference)
22. [Appendix A: API Endpoint Reference](#appendix-a-api-endpoint-reference)
23. [Appendix B: Dependency Graph](#appendix-b-dependency-graph)
24. [Appendix C: Configuration Files](#appendix-c-configuration-files)

---

## 1. Introduction and Purpose

This document serves as the definitive architectural reference for the Multi-Platform Casting System, a software system developed as part of a Master's Thesis in AI Development. The system is designed to orchestrate the video casting workflow: casting directors create projects, define roles, manage audition rounds, and review actor submissions — all through a multi-platform interface comprising a web-based director dashboard and a mobile actor application.

### 1.1 Problem Domain

The traditional casting process in film, television, and theater involves:

1. **Project creation** — A director defines a production (e.g., "The Crown — Season 3").
2. **Casting definition** — For each production, specific roles are defined (e.g., "Lady Victoria", "Margaret").
3. **Rounds** — Each casting goes through audition rounds with deadlines (e.g., "Self-Tape Submission", "Callback").
4. **Submissions** — Actors upload video auditions in response to open rounds.
5. **Review** — Directors review submissions, leave comments, shortlist or reject candidates.

This system digitizes and automates this workflow with a clean, modern, multi-platform architecture that separates business logic from infrastructure concerns.

### 1.2 Design Principles

The architecture adheres to the following non-negotiable principles:

- **Clean Architecture (Hexagonal/Ports & Adapters):** Business logic is completely isolated from databases, frameworks, and UI.
- **TypeScript Strict Mode:** Every package compiles under `strict: true`, ensuring compile-time safety across the entire codebase.
- **Serverless First:** The backend is composed of stateless Vercel Serverless Functions with zero persistent server processes.
- **Zero Auth for Demo:** For the academic presentation, no authentication or session management is implemented.
- **Local-First Storage Constraints:** No local disk dependency on the serverless runtime — actor video submissions upload directly to Cloudinary, round attachments upload directly to Vercel Blob, and only the resulting URL ever reaches the database. A legacy Base64-in-Postgres path still exists for director-side manual uploads (see §10.5).
- **Multi-Platform Parity:** Both the web director dashboard and the mobile actor app share the same design language and API contract.

---

## 2. High-Level System Overview

The system is composed of five logical layers, each implemented as a separate npm workspace within a single monorepo:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                                                             │
│  ┌──────────────────┐          ┌──────────────────────────┐ │
│  │   apps/web       │          │   apps/mobile            │ │
│  │   Director Dash  │          │   Actor App              │ │
│  │   React + Vite   │          │   Expo SDK 54 + RN       │ │
│  └────────┬─────────┘          └──────────┬───────────────┘ │
│           │                               │                  │
│           │           HTTP / JSON         │                  │
│           └───────────────┬───────────────┘                  │
│                           │                                  │
├───────────────────────────┼──────────────────────────────────┤
│                        API LAYER                             │
│                           │                                  │
│                    ┌──────┴──────┐                           │
│                    │  api/       │                           │
│                    │  27 Vercel  │                           │
│                    │  Functions  │                           │
│                    └──────┬──────┘                           │
│                           │                                  │
├───────────────────────────┼──────────────────────────────────┤
│                  INFRASTRUCTURE LAYER                        │
│                           │                                  │
│              ┌────────────┴────────────┐                     │
│              │ packages/infrastructure │                     │
│              │ Prisma + Zod + Repos    │                     │
│              └────────────┬────────────┘                     │
│                           │                                  │
├───────────────────────────┼──────────────────────────────────┤
│                       CORE LAYER                             │
│                           │                                  │
│              ┌────────────┴────────────┐                     │
│              │    packages/core        │                     │
│              │  Entities + Use Cases   │                     │
│              │  Repository Interfaces  │                     │
│              │  ZERO dependencies      │                     │
│              └─────────────────────────┘                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     DATA LAYER                              │
│                                                             │
│              ┌─────────────────────────┐                     │
│              │   Neon.tech PostgreSQL   │                     │
│              │   8 Prisma Models        │                     │
│              └─────────────────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Component Summary

| Component | Workspace | Technology | Purpose |
|-----------|-----------|------------|---------|
| Core | `packages/core` | Pure TypeScript | Entities, use cases, repository interfaces |
| Infrastructure | `packages/infrastructure` | Prisma, Zod | Database access, validation, repository implementations |
| API | `api/` | Vercel Serverless | 28 HTTP endpoints (27 routed through one function, plus a dedicated Cloudinary signing function) bridging clients to business logic |
| Web Dashboard | `apps/web` | React 19, Vite 6 | Director-facing SPA with glassmorphism UI |
| Mobile App | `apps/mobile` | Expo SDK 54, React Native | Actor-facing cross-platform app |
| Database | External | Neon.tech PostgreSQL | Managed serverless PostgreSQL |

### 2.2 Data Flow Summary

```
User Action (Browser/Mobile)
    → Frontend Service Layer (fetch wrapper)
        → Vercel Serverless Function (api/)
            → Zod Schema Validation (infrastructure)
                → Use Case Execution (core)
                    → Repository Call (core interface → infrastructure impl)
                        → Prisma ORM → PostgreSQL (Neon.tech)
                    ← Result<T, E> returned
                ← Validation errors caught
            ← Use case result (success or business error)
        ← HTTP Response (JSON)
    ← UI State Update
```

---

## 3. Monorepo Architecture and Workspace Strategy

### 3.1 Why a Monorepo?

A monorepo (as opposed to a polyrepo with separate Git repositories) was chosen for several architectural reasons:

1. **Atomic cross-package changes:** A change to an entity in `packages/core` can immediately be validated across the infrastructure, API, and both frontends without publishing intermediate packages.
2. **Shared TypeScript configuration:** All packages share the same `tsconfig.json` base with `strict: true`, ensuring type safety across boundaries.
3. **Simplified dependency management:** A single `npm install` resolves all dependencies across all workspaces.
4. **Co-located tests:** Unit tests, integration tests, and E2E tests live alongside the code they test.

### 3.2 Workspace Configuration

The root `package.json` defines five workspaces using npm's native workspace support:

```json
{
  "name": "masterai-tfm",
  "private": true,
  "workspaces": [
    "packages/core",
    "packages/infrastructure",
    "api",
    "apps/web",
    "apps/mobile"
  ]
}
```

Each workspace is a self-contained package with its own `package.json`, `tsconfig.json`, and test configuration. npm resolves inter-workspace dependencies through symlinks — for example, `@masterai/infrastructure` depends on `@masterai/core`, and npm creates a symlink from `node_modules/@masterai/core` to the local `packages/core` directory.

### 3.3 Dependency Flow Rules

The dependency graph follows strict Clean Architecture rules — dependencies point **inward** toward the core:

```
apps/web ────────────────────────> api ─────> infrastructure ─────> core
apps/mobile ─────────────────────> api ─────> infrastructure ─────> core
api ─────────────────────────────> infrastructure ─────> core
infrastructure ───────────────────> core
core ────────────────────────────> (nothing — zero external dependencies)
```

**Critical rule:** `packages/core` has **zero runtime dependencies**. It is pure TypeScript. This means:

- Core entities can be imported by any package without pulling in Prisma, Zod, React, or any other library.
- Core use cases can be tested with a simple in-memory mock repository — no database, no HTTP, no browser needed.
- The core layer can be extracted and reused in any other TypeScript project with zero modifications.

### 3.4 Root Scripts

The root `package.json` provides workspace-aware scripts:

```json
{
  "scripts": {
    "prisma:generate": "npm run prisma:generate -w packages/infrastructure",
    "prisma:migrate": "npm run prisma:migrate -w packages/infrastructure",
    "dev:web": "npm run dev -w apps/web",
    "build:web": "npm run build -w apps/web",
    "dev:mobile": "npm run start -w apps/mobile",
    "dev:mobile:web": "npm run web -w apps/mobile",
    "test": "npm run test -w packages/core && npm run test -w packages/infrastructure && npm run test -w apps/web",
    "test:core": "npm run test -w packages/core",
    "test:infra": "npm run test -w packages/infrastructure",
    "test:web": "npm run test -w apps/web",
    "test:e2e": "npx playwright test --config e2e/playwright.config.ts",
    "test:all": "npm test && npm run test:e2e"
  }
}
```

The `-w <workspace>` flag tells npm to execute the command inside the specified workspace directory, ensuring correct module resolution.

---

## 4. Domain-Driven Design: The Clean Core

### 4.1 Architectural Philosophy

The core package (`packages/core`) is the heart of the system. It embodies the principles of **Domain-Driven Design (DDD)** and **Clean Architecture** (also known as Hexagonal Architecture or Ports and Adapters).

The central insight of Clean Architecture is that **business rules should be the most stable part of a software system.** UI frameworks change. Databases are replaced. Even programming languages evolve. But the business rules — "a project belongs to a director," "only pending submissions can be reviewed," "a round must be open to accept submissions" — remain constant.

By isolating these rules in a framework-free core, the system gains:

1. **Testability:** Business logic can be tested with pure unit tests, no mocking frameworks, no database fixtures, no browser automation.
2. **Portability:** If the team decides to replace Prisma with Drizzle ORM, or PostgreSQL with MongoDB, only the infrastructure package changes. The core remains untouched.
3. **Clarity:** A new developer reading `packages/core` immediately understands the business domain without wading through framework boilerplate.
4. **Reusability:** The core could power a CLI tool, a WebSocket server, a mobile-only offline app, or a third-party integration — all without modification.

### 4.2 Layer Responsibilities

| Layer | Location | What It Contains | What It Cannot Import |
|-------|----------|------------------|-----------------------|
| **Entities** | `packages/core/entities/` | TypeScript interfaces and status unions | Anything outside core |
| **Repository Interfaces** | `packages/core/repositories/` | `I*Repository` contracts | Any concrete implementation |
| **Use Cases** | `packages/core/use-cases/` | Business logic classes, DTOs, `Result<T>` | Prisma, Zod, React, Express, fetch |
| **Validation** | `packages/infrastructure/validation/` | Zod schemas for API payloads | Core use case internals |
| **Repository Impls** | `packages/infrastructure/repositories/` | Prisma-backed implementations of core interfaces | UI code, API handlers |
| **API Handlers** | `api/` | Vercel serverless functions | UI code, Prisma directly (must use repos) |
| **Frontend** | `apps/web`, `apps/mobile` | React/Expo UI components | Prisma, Zod directly (must use API layer) |

### 4.3 The Inversion of Control Pattern

The dependency inversion at the repository level is the architectural linchpin. Here is how it works:

**Step 1 — Core defines the interface (the "port"):**

```typescript
// packages/core/repositories/IProjectRepository.ts
import type { Project } from '../entities'

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>
  findByDirectorId(directorId: string): Promise<Project[]>
  create(project: Project): Promise<Project>
  update(project: Project): Promise<Project>
  delete(id: string): Promise<void>
}
```

**Step 2 — Core use cases depend on the interface (not the implementation):**

```typescript
// packages/core/use-cases/projects/CreateProjectUseCase.ts
export class CreateProjectUseCase {
  constructor(
    private readonly projectRepo: IProjectRepository,    // <-- interface
    private readonly directorRepo: IDirectorRepository,   // <-- interface
  ) {}

  async execute(dto: CreateProjectDTO): Promise<Result<Project>> {
    const director = await this.directorRepo.findById(dto.directorId)
    if (!director) {
      return { ok: false, error: new Error('Director not found') }
    }
    // ... create and save project
  }
}
```

**Step 3 — Infrastructure provides the concrete implementation (the "adapter"):**

```typescript
// packages/infrastructure/repositories/PrismaProjectRepository.ts
import type { Project } from '@masterai/core'
import type { IProjectRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } }) as Promise<Project | null>
  }
  // ... other methods
}
```

**Step 4 — The API handler wires everything together (the "composition root"):**

```typescript
// api/submissions/upload.ts
import { ManualUploadSchema } from '@masterai/infrastructure'
import { ManualUploadUseCase } from '@masterai/core'
import { PrismaSubmissionRepository, PrismaRoundRepository, PrismaActorRepository } from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const parsed = ManualUploadSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const useCase = new ManualUploadUseCase(
    new PrismaSubmissionRepository(),
    new PrismaRoundRepository(),
    new PrismaActorRepository(),
  )

  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    return res.status(400).json({ error: result.error.message })
  }
  return res.status(201).json(result.data)
}
```

Notice how the use case knows nothing about Prisma. The API handler knows nothing about business rules. The entity knows nothing about databases. Each layer has a single responsibility.

---

## 5. Entity Catalogue

Entities are pure TypeScript interfaces representing the business domain's core objects. They have no decorators, no annotations, no framework dependencies — just type definitions.

### 5.1 Actor

```typescript
// packages/core/entities/Actor.ts
export interface Actor {
  id: string
  email: string
  name: string
  profilePictureUrl?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}
```

Represents an actor registered in the system. Actors are the users who submit video auditions. The `email` field is unique and serves as the primary lookup key.

### 5.2 Director

```typescript
// packages/core/entities/Director.ts
export interface Director {
  id: string
  email: string
  name: string
  company?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}
```

Represents a casting director who creates and manages projects. In the demo, directors operate without authentication.

### 5.3 Project

```typescript
// packages/core/entities/Project.ts
export type ProjectStatus = 'draft' | 'active' | 'closed'

export interface Project {
  id: string
  directorId: string
  title: string
  description?: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}
```

A project is the highest-level organizational unit. It represents a production (e.g., "The Crown — Season 3") and belongs to exactly one director. Projects have a lifecycle: `draft` → `active` → `closed`.

### 5.4 Casting

```typescript
// packages/core/entities/Casting.ts
export type CastingStatus = 'open' | 'closed' | 'cancelled'

export interface Casting {
  id: string
  projectId: string
  roleName: string
  description?: string
  requirements?: string
  status: CastingStatus
  activePhase: string
  createdAt: Date
  updatedAt: Date
}
```

A casting represents a specific role within a project. A project can have multiple castings (e.g., "Lady Victoria", "Margaret"). Each casting defines a role name, optional description, and optional requirements (e.g., "British accent required"). The `activePhase` field (a free-text label, e.g. "First Round", "Callbacks", "Offer") is set via `UpdateCastingPhaseUseCase` and drives the phase dropdown in the director dashboard.

### 5.5 Round

```typescript
// packages/core/entities/Round.ts
export type RoundStatus = 'pending' | 'open' | 'closed'

export interface Round {
  id: string
  castingId: string
  name: string
  description?: string
  deadline?: Date
  order: number
  status: RoundStatus
  createdAt: Date
  updatedAt: Date
}
```

A round represents an audition phase within a casting. For example, "Self-Tape Submission" might be round 1, and "Callback" round 2. The `order` field determines sequencing. The `deadline` field is optional — if set, submissions after the deadline are rejected.

### 5.6 Submission

```typescript
// packages/core/entities/Submission.ts
export type SubmissionStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected'

export interface Submission {
  id: string
  roundId: string
  actorId: string
  videoUrl?: string
  thumbnailUrl?: string
  notes?: string
  status: SubmissionStatus
  feedback?: string
  transcript?: string
  aiScore?: number
  aiFeedback?: string
  createdAt: Date
  updatedAt: Date
}
```

A submission is the central transactional entity — it represents an actor's video audition for a specific round. The `videoUrl` stores a Cloudinary secure URL for actor-portal submissions (`CreateSubmissionUseCase`), or a Base64-encoded data URL for the legacy director-side manual upload path (`ManualUploadUseCase`, see §7.3). Submissions progress through statuses: `pending` → `reviewed` → `shortlisted` or `rejected`. The `transcript`, `aiScore`, and `aiFeedback` fields are populated by `GenerateAIAnalysisUseCase` (Whisper transcription + GPT-4o-mini scoring, see §7.5).

### 5.7 Comment

```typescript
// packages/core/entities/Comment.ts
export interface Comment {
  id: string
  submissionId: string
  authorName: string
  content: string
  createdAt: Date
  updatedAt: Date
}
```

Comments allow directors (and other team members) to leave textual notes on specific submissions. Each comment is attributed to an author by name (no authentication system in the demo).

### 5.8 Attachment

```typescript
// packages/core/entities/Attachment.ts
export interface Attachment {
  id: string
  roundId: string
  url: string
  fileName: string
  fileType: string
  fileSize: number
  createdAt: Date
}
```

Attachments are files associated with rounds (not submissions). They represent supplementary materials such as sides, reference images, or instructional documents. The `url` field stores a Vercel Blob URL — files are uploaded client-side directly to Blob storage via a signed token (`POST /api/upload`), then the resulting URL is attached to the round through `AddAttachmentUseCase`. `fileSize` enforces a 50MB limit at the use case level. Attachments are removed via `RemoveAttachmentUseCase` (`DELETE /api/rounds/attachment/:id`).

### 5.9 Entity Relationship Diagram

```
Director (1) ──────< (N) Project
                            │
                            │ directorId
                            ▼
Project (1) ───────< (N) Casting
                              │
                              │ projectId
                              ▼
Casting (1) ───────< (N) Round
                          │    │
                          │    └────< (N) Attachment
                          │
                          └────────< (N) Submission
                                        │
                                        ├──< (N) Comment
                                        │
                                        └──> (1) Actor
```

---

## 6. Repository Pattern and Interface Segregation

### 6.1 Why Interfaces?

Repository interfaces in `packages/core/repositories/` serve as contracts. They define **what** operations are available without specifying **how** they are implemented. This achieves several goals:

1. **Substitutability:** A `PrismaProjectRepository` can be replaced by an in-memory repository for tests, a REST proxy for distributed systems, or a localStorage adapter for offline-first apps.
2. **Testability:** Use cases accept interfaces, so tests can provide minimal mock implementations that throw on unexpected calls.
3. **Compile-time safety:** TypeScript enforces that any class implementing `IProjectRepository` provides all required methods with correct signatures.

### 6.2 Repository Interface Catalogue

| Interface | Key Methods | Purpose |
|-----------|-------------|---------|
| `IActorRepository` | `findById`, `findByEmail`, `findMany(search?)`, `create`, `update`, `delete` | Actor persistence |
| `IDirectorRepository` | `findById`, `findByEmail`, `create`, `update`, `delete` | Director persistence |
| `IProjectRepository` | `findById`, `findByDirectorId`, `create`, `update`, `delete` | Project CRUD |
| `ICastingRepository` | `findById`, `findByProjectId`, `create`, `update`, `delete` | Casting CRUD |
| `IRoundRepository` | `findById`, `findByCastingId`, `create`, `update`, `delete` | Round CRUD |
| `ISubmissionRepository` | `findById`, `findByRoundId`, `findByActorId`, `create`, `update`, `delete` | Submission CRUD |
| `ICommentRepository` | `findById`, `findBySubmissionId`, `create`, `delete` | Comment CRUD |
| `IAttachmentRepository` | `findById`, `findByRoundId`, `create`, `delete` | Attachment CRUD |

### 6.3 Example: IProjectRepository

```typescript
import type { Project } from '../entities'

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>
  findByDirectorId(directorId: string): Promise<Project[]>
  create(project: Project): Promise<Project>
  update(project: Project): Promise<Project>
  delete(id: string): Promise<void>
}
```

The interface uses the entity type `Project` directly — it does not import Prisma types, database row types, or any other infrastructure concept. This is intentional: the repository interface exists in the core layer and must remain free of external dependencies.

### 6.4 Interface Segregation in Practice

Note the different granularities:

- `ICommentRepository` and `IAttachmentRepository` have **no update method** — comments are immutable (created or deleted, never edited) and attachments are write-once.
- `ISubmissionRepository` has `findByActorId` — enabling the "one submission per actor per round" check without loading all submissions.
- `IActorRepository` has `findMany(search?)` — enabling search functionality without polluting other repositories.

Each interface is tailored to the minimum set of operations its consumers actually need, following the Interface Segregation Principle.

---

## 7. Use Case Layer: Business Logic Encapsulation

### 7.1 Use Case Structure

Every use case in this system follows a consistent structural pattern:

```typescript
export class SomeUseCase {
  constructor(
    private readonly repoA: IRepoA,
    private readonly repoB: IRepoB,
  ) {}

  async execute(dto: SomeDTO): Promise<Result<SomeReturnType>> {
    // 1. Validate preconditions
    // 2. Enforce business rules
    // 3. Construct entity
    // 4. Persist via repository
    // 5. Return Result
  }
}
```

Key structural elements:

1. **Constructor injection:** Repositories are injected through the constructor, not imported directly. This makes use cases testable and framework-agnostic.
2. **DTO (Data Transfer Object):** Each use case defines its own input type. DTOs are plain interfaces co-located with the use case, not shared entity types.
3. **Result return type:** All use cases return `Promise<Result<T>>`, never throw exceptions. Errors are values, not control flow.

### 7.2 Complete Use Case Catalogue

| # | Use Case | Domain | Injected Repositories | Business Rules |
|---|----------|--------|----------------------|----------------|
| 1 | `CreateProjectUseCase` | Projects | IProjectRepository, IDirectorRepository | Director must exist |
| 2 | `ListProjectsUseCase` | Projects | IProjectRepository | — |
| 3 | `CloseProjectUseCase` | Projects | IProjectRepository | Ownership check, not already closed |
| 4 | `UpdateProjectStatusUseCase` | Projects | IProjectRepository | Project exists |
| 5 | `CreateCastingUseCase` | Castings | ICastingRepository, IProjectRepository | Project must be active |
| 6 | `CloseCastingUseCase` | Castings | ICastingRepository | Not already closed |
| 7 | `UpdateCastingPhaseUseCase` | Castings | ICastingRepository | Casting exists |
| 8 | `CreateRoundUseCase` | Rounds | IRoundRepository, ICastingRepository | Casting must be open |
| 9 | `OpenRoundUseCase` | Rounds | IRoundRepository | Only pending rounds can be opened |
| 10 | `CloseRoundUseCase` | Rounds | IRoundRepository | Only open rounds can be closed |
| 11 | `CreateActorUseCase` | Actors | IActorRepository | Email uniqueness |
| 12 | `GetActorUseCase` | Actors | IActorRepository | Actor exists — backs the actor's own profile/settings view |
| 13 | `ListActorsUseCase` | Actors | IActorRepository | Optional search filter |
| 14 | `UpdateActorUseCase` | Actors | IActorRepository | Actor exists |
| 15 | `DeleteActorUseCase` | Actors | IActorRepository | Actor exists |
| 16 | `SubmitVideoUseCase` | Submissions | ISubmissionRepository, IRoundRepository, IActorRepository | Round open, not past deadline, actor exists, one per actor per round |
| 17 | `CreateSubmissionUseCase` | Submissions | ISubmissionRepository, IRoundRepository, ICastingRepository, IActorRepository | Actor-portal path: submission from a Cloudinary `videoUrl` |
| 18 | `ManualUploadUseCase` | Submissions | ISubmissionRepository, IRoundRepository, IActorRepository | All above + 5MB limit + .mp4/.mov/.webm only |
| 19 | `ReviewSubmissionUseCase` | Submissions | ISubmissionRepository | Only pending submissions can be reviewed |
| 20 | `GenerateAIAnalysisUseCase` | Submissions | ISubmissionRepository, IRoundRepository, ICastingRepository, IAIAnalysisService | Submission must have a video; maps AI service errors to typed results |
| 21 | `CreateCommentUseCase` | Comments | ICommentRepository, ISubmissionRepository | Non-empty content, submission exists |
| 22 | `ListCommentsUseCase` | Comments | ICommentRepository, ISubmissionRepository | Submission exists |
| 23 | `AddAttachmentUseCase` | Attachments | IAttachmentRepository, IRoundRepository | Round exists, non-empty name, 50MB limit |
| 24 | `ListAttachmentsUseCase` | Attachments | IAttachmentRepository, IRoundRepository | Round exists |
| 25 | `RemoveAttachmentUseCase` | Attachments | IAttachmentRepository | Attachment exists |

### 7.3 Deep Dive: ManualUploadUseCase

The `ManualUploadUseCase` is the most complex use case in the system. It handles the scenario where a video file is uploaded directly as Base64 data:

```typescript
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm']
const MAX_SIZE_BYTES = 5 * 1024 * 1024  // 5MB

export class ManualUploadUseCase {
  constructor(
    private readonly submissionRepo: ISubmissionRepository,
    private readonly roundRepo: IRoundRepository,
    private readonly actorRepo: IActorRepository,
  ) {}

  async execute(dto: ManualUploadDTO): Promise<Result<Submission>> {
    // 1. File extension validation
    const ext = dto.fileName.toLowerCase().slice(dto.fileName.lastIndexOf('.'))
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { ok: false, error: new Error(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`) }
    }

    // 2. File size validation (Base64 is ~33% larger than binary)
    const decodedSize = Math.round((dto.videoData.length * 3) / 4)
    if (decodedSize > MAX_SIZE_BYTES) {
      return { ok: false, error: new Error(`File exceeds 5MB limit`) }
    }

    // 3. Round existence and status check
    const round = await this.roundRepo.findById(dto.roundId)
    if (!round) return { ok: false, error: new Error('Round not found') }
    if (round.status !== 'open') return { ok: false, error: new Error('Round is not open for submissions') }

    // 4. Deadline check
    if (round.deadline && new Date() > round.deadline) {
      return { ok: false, error: new Error('Submission deadline has passed') }
    }

    // 5. Actor existence check
    const actor = await this.actorRepo.findById(dto.actorId)
    if (!actor) return { ok: false, error: new Error('Actor not found') }

    // 6. One submission per actor per round
    const existing = await this.submissionRepo.findByRoundId(dto.roundId)
    if (existing.find(s => s.actorId === dto.actorId)) {
      return { ok: false, error: new Error('Actor already submitted to this round') }
    }

    // 7. Construct data URL and persist
    const mime = mimeForExtension(dto.fileName)
    const dataUrl = `data:${mime};base64,${dto.videoData}`
    const submission: Submission = {
      id: crypto.randomUUID(),
      roundId: dto.roundId,
      actorId: dto.actorId,
      videoUrl: dataUrl,
      notes: dto.notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.submissionRepo.create(submission)
    return { ok: true, data: created }
  }
}
```

This use case demonstrates several business rule categories:

- **Input validation:** File extension whitelist, size limit
- **Invariant enforcement:** Round must be open, deadline not passed, actor must exist
- **Uniqueness constraint:** One submission per actor per round (enforced at application level, not database level)
- **Data transformation:** Raw Base64 → data URL with MIME type

All of these rules live in the core layer. If the team decides to change the allowed file types, only this use case file needs to change.

### 7.4 Deep Dive: ReviewSubmissionUseCase

The `ReviewSubmissionUseCase` illustrates the state machine enforcement pattern:

```typescript
export class ReviewSubmissionUseCase {
  constructor(private readonly submissionRepo: ISubmissionRepository) {}

  async execute(dto: ReviewSubmissionDTO): Promise<Result<Submission>> {
    const submission = await this.submissionRepo.findById(dto.submissionId)
    if (!submission) {
      return { ok: false, error: new Error('Submission not found') }
    }

    // State machine enforcement: only pending submissions can transition
    if (submission.status !== 'pending') {
      return { ok: false, error: new Error('Only pending submissions can be reviewed') }
    }

    const updated: Submission = {
      ...submission,
      status: dto.status,
      feedback: dto.feedback ?? submission.feedback,
      updatedAt: new Date(),
    }

    const saved = await this.submissionRepo.update(updated)
    return { ok: true, data: saved }
  }
}
```

The key business rule here is the **state transition guard:** `submission.status !== 'pending'`. This prevents a submission from being reviewed twice or modified after being shortlisted/rejected. This is a simple but effective form of state machine enforcement within business logic.

### 7.5 Deep Dive: GenerateAIAnalysisUseCase

Added after the initial happy-path phases, this use case demonstrates the pattern for integrating an external AI service behind a core-layer interface (`IAIAnalysisService`), keeping OpenAI entirely out of the core and infrastructure layers:

```typescript
export class GenerateAIAnalysisUseCase {
  constructor(
    private readonly submissionRepo: ISubmissionRepository,
    private readonly roundRepo: IRoundRepository,
    private readonly castingRepo: ICastingRepository,
    private readonly aiService: IAIAnalysisService,
  ) {}

  async execute(dto: GenerateAIAnalysisDTO): Promise<Result<Submission>> {
    const submission = await this.submissionRepo.findById(dto.submissionId)
    if (!submission) return { ok: false, error: new Error('Submission not found') }
    if (!submission.videoUrl) return { ok: false, error: new Error('Submission has no video to analyze') }

    const round = await this.roundRepo.findById(submission.roundId)
    const casting = round ? await this.castingRepo.findById(round.castingId) : null

    const analysis = await this.aiService.analyzeAudio(submission.videoUrl, casting?.requirements ?? undefined)

    const updated: Submission = {
      ...submission,
      transcript: analysis.transcript,
      aiScore: analysis.score,
      aiFeedback: analysis.feedback,
      updatedAt: new Date(),
    }
    return { ok: true, data: await this.submissionRepo.update(updated) }
  }
}
```

The concrete implementation, `OpenAIAnalysisService` (`api/ai/OpenAIAnalysisService.ts`), lives in the API layer — not infrastructure — because it's a third-party service adapter, not a database concern. It:

1. Fetches the submission's video (a Cloudinary URL) as a `Response` stream.
2. Transcribes it with OpenAI's Whisper (`whisper-1`).
3. Sends the transcript, plus the casting's `requirements`, to GPT-4o-mini with a JSON-mode system prompt asking for `{ score: 0-100, feedback: string }`.
4. Maps OpenAI/network failures to a typed `AIServiceError` with an appropriate HTTP status (429 for rate limits, 502/503 for upstream failures, 400 for bad auth), which `POST /api/analyze` translates directly into the response status code.

This keeps the AI provider swappable: a different `IAIAnalysisService` implementation (a local model, a different provider) could replace `OpenAIAnalysisService` without touching `GenerateAIAnalysisUseCase` or any other use case.

---

## 8. The Result Type: Functional Error Handling

### 8.1 Definition

```typescript
// packages/core/use-cases/types.ts
export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E }
```

This is a **discriminated union** (also known as a tagged union or sum type). It represents one of two possible outcomes:

- **Success:** `{ ok: true, data: <value> }`
- **Failure:** `{ ok: false, error: <error> }`

### 8.2 Why Not Exceptions?

Traditional error handling with `throw`/`try-catch` has several problems in a layered architecture:

1. **Hidden control flow:** A thrown exception can propagate through multiple layers, making it difficult to trace the error path.
2. **Unchecked errors:** TypeScript/JavaScript exceptions are not part of the type signature. A function that throws looks the same as one that doesn't.
3. **Framework coupling:** Some frameworks (Express, Vercel) handle errors differently. Exceptions can crash serverless functions if not caught.

The `Result` type solves all three:

1. **Explicit control flow:** Every call site must handle both success and failure.
2. **Type-safe:** The compiler enforces that error paths are handled. You cannot accidentally ignore a failed result.
3. **Framework-agnostic:** The use case returns a `Result`, and the API handler decides how to map it to an HTTP status code.

### 8.3 Usage in API Handlers

```typescript
const result = await useCase.execute(parsed.data)
if (!result.ok) {
  return res.status(400).json({ error: result.error.message })
}
return res.status(201).json(result.data)
```

The mapping is straightforward:
- `result.ok === false` → HTTP 400 with error message
- `result.ok === true` → HTTP 200/201 with data

---

## 9. Infrastructure Layer

### 9.1 Purpose

The infrastructure package (`packages/infrastructure`) provides concrete implementations of the abstractions defined in the core layer. It is the only layer that imports external libraries (Prisma Client, Zod) and bridges the gap between pure business logic and the real world.

### 9.2 Components

The infrastructure package contains three sub-modules:

| Sub-module | Location | Purpose |
|------------|----------|---------|
| **Database** | `database/` | Prisma schema, client singleton, migration scripts |
| **Validation** | `validation/` | Zod schemas for all API payloads |
| **Repositories** | `repositories/` | Prisma-backed implementations of core interfaces |

### 9.3 Prisma Client Singleton

```typescript
// packages/infrastructure/database/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

This pattern is critical for serverless environments. In a traditional server, you create a single PrismaClient instance and reuse it across requests. In serverless functions, each invocation is a separate process, and the module scope is reset between invocations — **unless** you cache the client on `globalThis`. This pattern ensures connection pooling works correctly across warm invocations.

### 9.4 Repository Implementation Pattern

Each Prisma repository follows the same structural pattern:

```typescript
import type { Project } from '@masterai/core'
import type { IProjectRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } }) as Promise<Project | null>
  }

  async findByDirectorId(directorId: string): Promise<Project[]> {
    return prisma.project.findMany({ where: { directorId } }) as Promise<Project[]>
  }

  async create(project: Project): Promise<Project> {
    return prisma.project.create({ data: project }) as Promise<Project>
  }

  async update(project: Project): Promise<Project> {
    return prisma.project.update({ where: { id: project.id }, data: project }) as Promise<Project>
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } })
  }
}
```

Note the `as Promise<Project>` type assertions. Prisma's generated types are close to — but not identical to — the core entity types. The assertion bridges this gap. In a production system, a more rigorous mapping layer (DTO ↔ Entity) would be warranted, but for the academic demo, the structural similarity makes direct casting safe.

---

## 10. Database Schema and ORM

### 10.1 Database Choice: Neon.tech PostgreSQL

The system uses **Neon.tech** as its database provider — a serverless PostgreSQL service that scales to zero when idle. This choice was made for several reasons:

1. **Serverless compatibility:** Neon's connection pooling works with Vercel Serverless Functions without requiring a separate connection pooler like PgBouncer.
2. **Free tier:** The academic demo runs on Neon's free tier, eliminating hosting costs.
3. **PostgreSQL features:** Full SQL support, JSONB for future flexibility, and mature ecosystem.
4. **Prisma support:** Prisma has first-class PostgreSQL support with excellent type generation.

### 10.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 10.3 Model Definitions

The schema defines 8 models with the following relationships:

**Actor Model:**
```prisma
model Actor {
  id                String   @id @default(uuid())
  email             String   @unique
  name              String
  profilePictureUrl String?
  phone             String?
  bio               String?
  agency            String?
  availability      String   @default("Available")
  preferredRoles    String?
  castingStage      String   @default("Pending")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  submissions Submission[]
}
```

**Director Model:**
```prisma
model Director {
  id                String   @id @default(uuid())
  email             String   @unique
  name              String
  profilePictureUrl String?
  company           String?
  phone             String?
  bio               String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  projects Project[]
}
```

**Project Model:**
```prisma
model Project {
  id          String   @id @default(uuid())
  directorId  String
  title       String
  description String?
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  director Director  @relation(fields: [directorId], references: [id])
  castings Casting[]
}
```

**Casting Model:**
```prisma
model Casting {
  id           String   @id @default(uuid())
  projectId    String
  roleName     String
  description  String?
  requirements String?
  status       String   @default("open")
  activePhase  String   @default("First Round")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id])
  rounds  Round[]
}
```

**Round Model:**
```prisma
model Round {
  id          String    @id @default(uuid())
  castingId   String
  name        String
  description String?
  deadline    DateTime?
  order       Int
  status      String    @default("pending")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  casting     Casting      @relation(fields: [castingId], references: [id])
  submissions Submission[]
  attachments Attachment[]
}
```

**Submission Model:**
```prisma
model Submission {
  id           String   @id @default(uuid())
  roundId      String
  actorId      String
  videoUrl     String?
  thumbnailUrl String?
  notes        String?
  status       String   @default("pending")
  feedback     String?
  transcript   String?
  aiScore      Int?
  aiFeedback   String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  round Round @relation(fields: [roundId], references: [id])
  actor Actor @relation(fields: [actorId], references: [id])

  comments Comment[]
}
```

**Comment Model:**
```prisma
model Comment {
  id           String   @id @default(uuid())
  submissionId String
  authorName   String
  content      String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  submission Submission @relation(fields: [submissionId], references: [id])
}
```

**Attachment Model:**
```prisma
model Attachment {
  id        String   @id @default(uuid())
  roundId   String
  url       String
  fileName  String
  fileType  String
  fileSize  Int
  createdAt DateTime @default(now())

  round Round @relation(fields: [roundId], references: [id])
}
```

`videoUrl` and `transcript`/`aiScore`/`aiFeedback` are nullable because a submission's video may not have been analyzed yet, or (in the manual-upload path) the entity is created before analysis is requested. `Attachment.url` and `Attachment.fileType` mirror the entity in `packages/core/entities/Attachment.ts` — attachments are stored as Vercel Blob URLs, not raw file bytes.

### 10.4 Relationship Summary

| Relationship | Type | Foreign Key | Cascade |
|--------------|------|-------------|---------|
| Director → Projects | 1:N | `directorId` | Restrict |
| Project → Castings | 1:N | `projectId` | Restrict |
| Casting → Rounds | 1:N | `castingId` | Restrict |
| Round → Submissions | 1:N | `roundId` | Restrict |
| Round → Attachments | 1:N | `roundId` | Restrict |
| Actor → Submissions | 1:N | `actorId` | Restrict |
| Submission → Comments | 1:N | `submissionId` | Restrict |

### 10.5 Data Storage: Two Video Paths, One URL Column

The project went through two iterations on video/file storage, and both still coexist in the codebase:

1. **Early approach — Base64 in PostgreSQL.** Video files and attachments were parsed into Base64 and stored directly in PostgreSQL `String` columns, avoiding file system dependencies (incompatible with serverless), external storage services, CDN configuration, and signed URL management. This is still how the legacy director-side manual upload works (`ManualUploadUseCase`, `POST /api/submissions/upload`): the client Base64-encodes a video client-side, the server checks the decoded size against a strict 5MB limit, and the resulting `data:` URL is stored directly in `Submission.videoUrl`.

2. **Current approach — external URLs.** As the actor-facing upload flow matured, video submissions moved to **Cloudinary**: the client requests a signed upload signature from `POST /api/cloudinary/sign`, uploads the video directly to Cloudinary, and only the resulting secure URL is sent to `POST /api/submissions` (`CreateSubmissionUseCase`) and stored in `Submission.videoUrl`. Round attachments (documents/images) followed the same pattern but with **Vercel Blob**: a signed token from `POST /api/upload`, a direct client-to-Blob upload, and only the URL stored in `Attachment.url`.

In both current cases, the database only ever stores a URL string — the video/file bytes never pass through the serverless function or the database. `videoUrl` and `url` are typed as plain `String`/`String?` columns precisely because they hold either a Base64 data URL (legacy path, small files) or an external URL (Cloudinary/Blob, unbounded by the 5MB/50MB use-case-level limits that only apply to their respective paths).

---

## 11. Input Validation with Zod

### 11.1 What is Zod?

Zod is a TypeScript-first schema validation library. It provides a concise, composable API for defining data shapes and validating runtime values against those shapes. Unlike class-validator or Joi, Zod schemas are fully type-inferred — you write the schema once and get both runtime validation and static TypeScript types.

### 11.2 Validation Schema Catalogue

Each API endpoint has a corresponding Zod schema in `packages/infrastructure/validation/`:

| File | Schemas | Purpose |
|------|---------|---------|
| `actors.ts` | `CreateActorSchema` | Validate actor creation payloads |
| `projects.ts` | `CreateProjectSchema`, `CloseProjectSchema` | Validate project operations |
| `castings.ts` | `CreateCastingSchema`, `CloseCastingSchema` | Validate casting operations |
| `rounds.ts` | `CreateRoundSchema`, `OpenRoundSchema`, `CloseRoundSchema` | Validate round operations |
| `submissions.ts` | `SubmitVideoSchema`, `ManualUploadSchema`, `ReviewSubmissionSchema` | Validate submission operations |
| `comments.ts` | `CreateCommentSchema`, `ListCommentsSchema` | Validate comment operations |
| `attachments.ts` | `AddAttachmentSchema`, `ListAttachmentsSchema` | Validate attachment operations |

### 11.3 Example: CreateActorSchema

```typescript
import { z } from 'zod'

export const CreateActorSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional(),
  profilePictureUrl: z.string().url().optional(),
})
```

### 11.4 Example: ManualUploadSchema

```typescript
export const ManualUploadSchema = z.object({
  roundId: z.string().uuid(),
  actorId: z.string().uuid(),
  videoData: z.string().min(1, 'Video data is required'),
  fileName: z.string().min(1, 'File name is required').max(200),
  notes: z.string().max(2000).optional(),
})
```

### 11.5 Validation in API Handlers

Zod schemas are used at the API boundary, before the use case is invoked:

```typescript
const parsed = ManualUploadSchema.safeParse(req.body)
if (!parsed.success) {
  return res.status(400).json({ error: parsed.error.flatten() })
}

// parsed.data is now type-safe and can be passed to the use case
const result = await useCase.execute(parsed.data)
```

The `.safeParse()` method returns a discriminated union:
- `{ success: true, data: T }` — validation passed, data is typed
- `{ success: false, error: ZodError }` — validation failed, errors are structured

### 11.6 Why Zod Over Alternatives?

| Alternative | Disadvantage Compared to Zod |
|-------------|------------------------------|
| class-validator | Requires decorators, class instantiation, reflection metadata |
| Joi | No TypeScript type inference — you define the schema AND the type separately |
| Yup | Similar API but weaker TypeScript support, less composable |
| io-ts | Functional but verbose, smaller community |

Zod provides the best balance of type inference, composability, and developer experience for a TypeScript-first project.

---

## 12. Serverless API Layer

### 12.1 What is a Serverless Function?

A serverless function is a piece of code that runs in response to an HTTP request, without requiring a long-running server process. On Vercel, each function is deployed as a separate endpoint, and the platform handles scaling, routing, and cold starts.

### 12.2 A Single Hand-Rolled Router, Not File-Based Routing

Early in the project the plan was Vercel's usual file-based convention — one file per endpoint under `api/` (`api/actors/create.ts` → `POST /api/actors/create`, etc.). That was abandoned: `api/router.ts` is now **one Vercel function** that implements its own tiny regex router and dispatches every request itself.

```typescript
// api/router.ts
function defineRoute(method: string, path: string, handler: Handler): Route {
  const paramNames: string[] = []
  const pattern = path.replace(/:([a-zA-Z]+)/g, (_, name) => {
    paramNames.push(name)
    return '([^/]+)'
  })
  return { method, match: new RegExp(`^${pattern}$`), paramNames, handler }
}

const routes: Route[] = [
  defineRoute('GET', '/api/actors', listActors),
  defineRoute('POST', '/api/actors/create', createActor),
  defineRoute('PUT', '/api/actors/:id', updateActor),
  // ...27 routes total, see §12.4
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
  for (const route of routes) {
    if (route.method !== req.method) continue
    const m = pathname.match(route.match)
    if (!m) continue
    const params = Object.fromEntries(route.paramNames.map((name, i) => [name, m[i + 1]]))
    return route.handler(req, res, params)
  }
  return res.status(404).json({ error: `Not found: ${req.method} ${pathname}` })
}
```

`vercel.json` (§12.5) rewrites every `/api/*` request except `/api/cloudinary/*` to `/api/router`, so this one function fields nearly the entire API surface. `POST /api/upload` (Vercel Blob) and `POST /api/cloudinary/sign` remain genuinely separate Vercel functions — they're listed alongside the routed endpoints in §12.4's table but aren't matched by `defineRoute`.

The tradeoff: a single function means a single cold start and a single `10s` timeout budget shared however many concurrent requests land on it, and route dispatch is a linear scan rather than the platform's own routing table. For 27 routes at academic-demo traffic levels this is a non-issue; it would be worth splitting back out (or moving to a real router library) if traffic ever justified per-route scaling.

### 12.3 Handler Pattern

Each route handler in `api/router.ts` follows the same structure:

```typescript
async function createActor(req: VercelRequest, res: VercelResponse) {
  const parsed = CreateActorSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const useCase = new CreateActorUseCase(new PrismaActorRepository())
  const result = await useCase.execute(parsed.data)

  if (!result.ok) return res.status(409).json({ error: result.error.message })
  return res.status(201).json(result.data)
}
```

The pattern is: (1) validate with Zod, (2) instantiate the use case with fresh repository instances, (3) execute and branch on `result.ok`. There's no shared middleware layer — each handler repeats this shape inline, which keeps every handler readable in isolation at the cost of some repetition.

### 12.4 Complete API Endpoint Reference

All routes below except `/api/upload` and `/api/cloudinary/sign` are handled by the single regex-based router in `api/router.ts` (see §12.2); those two are their own Vercel functions.

| # | Method | Path | Use Case | Description |
|---|--------|------|----------|-------------|
| 1 | POST | `/api/upload` | — (Vercel Blob `handleUpload`) | Signed token for a direct-to-Blob document/attachment upload |
| 2 | GET | `/api/actors` | ListActorsUseCase | List actors with optional search |
| 3 | POST | `/api/actors/create` | CreateActorUseCase | Register a new actor |
| 4 | GET | `/api/actors/:id` | GetActorUseCase | Fetch a single actor — backs the actor's own profile/settings view |
| 5 | PUT | `/api/actors/:id` | UpdateActorUseCase | Update an actor's profile |
| 6 | DELETE | `/api/actors/:id` | DeleteActorUseCase | Delete an actor |
| 7 | GET | `/api/projects` | ListProjectsUseCase | List all projects |
| 8 | POST | `/api/projects/create` | CreateProjectUseCase | Create a new project |
| 9 | POST | `/api/projects/close` | CloseProjectUseCase | Close a project |
| 10 | PUT | `/api/projects/:id/status` | UpdateProjectStatusUseCase | Update a project's status |
| 11 | GET | `/api/dashboard` | — (direct Prisma query) | Full director dashboard tree (projects → castings → rounds → submissions) |
| 12 | GET | `/api/castings` | — (direct Prisma query) | List open castings with current round; `?actorId=` includes that actor's submission |
| 13 | POST | `/api/castings/create` | CreateCastingUseCase | Create a casting for a project |
| 14 | POST | `/api/castings/close` | CloseCastingUseCase | Close a casting |
| 15 | PUT | `/api/castings/:id/phase` | UpdateCastingPhaseUseCase | Move a casting to a different phase |
| 16 | POST | `/api/rounds/create` | CreateRoundUseCase | Create an audition round |
| 17 | POST | `/api/rounds/open` | OpenRoundUseCase | Open a pending round |
| 18 | POST | `/api/rounds/close` | CloseRoundUseCase | Close an open round |
| 19 | POST | `/api/rounds/attachment` | AddAttachmentUseCase | Attach an already-uploaded Blob file to a round |
| 20 | GET | `/api/rounds/attachments` | ListAttachmentsUseCase | List attachments for a round |
| 21 | DELETE | `/api/rounds/attachment/:id` | RemoveAttachmentUseCase | Remove an attachment |
| 22 | POST | `/api/submissions` | CreateSubmissionUseCase | Create a submission from a Cloudinary video URL (actor portal) |
| 23 | POST | `/api/submissions/upload` | ManualUploadUseCase | Upload a video submission (Base64, director-side legacy path) |
| 24 | POST | `/api/submissions/review` | ReviewSubmissionUseCase | Review/shortlist/reject a submission |
| 25 | POST | `/api/submissions/comment` | CreateCommentUseCase | Add a comment to a submission |
| 26 | GET | `/api/submissions/comments` | ListCommentsUseCase | List comments for a submission |
| 27 | POST | `/api/analyze` | GenerateAIAnalysisUseCase | Run Whisper + GPT-4o-mini analysis on a submission |
| 28 | GET | `/api/cloudinary/sign` | — (Cloudinary SDK) | Signed upload signature for actor video submissions |

### 12.5 Vercel Configuration

```json
{
  "framework": null,
  "buildCommand": "npm run build:web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "npm install --legacy-peer-deps",
  "rewrites": [
    { "source": "/api/cloudinary/(.*)", "destination": "/api/cloudinary/$1" },
    { "source": "/api/(.*)", "destination": "/api/router" },
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Key configuration points:
- **No explicit `functions.maxDuration`:** the project relies on Vercel's platform default (10s on Hobby), rather than configuring it explicitly — worth revisiting if video uploads start timing out.
- **`rewrites`:** the Cloudinary rewrite is listed first so it isn't swallowed by the general `/api/(.*)` → `/api/router` rule; everything else non-API falls through to the SPA's `index.html`.
- **`installCommand: npm install --legacy-peer-deps`:** required because of a React 19 peer-dependency mismatch somewhere in the dependency tree (see the `fix: react 19.1.0 parity for Vercel strict install` commit).
- **`outputDirectory`:** the production build of the web dashboard is served as static assets.

---

## 13. Technology Stack Deep Dive

### 13.1 TypeScript (v5.7+)

**What it is:** A typed superset of JavaScript that compiles to plain JavaScript.

**Role in this project:** Every single source file in the project is TypeScript. The `strict: true` compiler option is enabled across all workspaces, which enables:

- `strictNullChecks`: Prevents null/undefined runtime errors
- `noImplicitAny`: Forces explicit type annotations
- `strictFunctionTypes`: Prevents unsafe function parameter contravariance
- `noUncheckedIndexedAccess`: Array/object index access returns `T | undefined`

**Why over plain JavaScript:** For a Clean Architecture project, TypeScript is essential. Entity interfaces, repository contracts, and use case signatures rely on types for documentation and compile-time safety. Without TypeScript, the repository pattern would lose its type-safety guarantees.

### 13.2 React (v19)

**What it is:** A JavaScript library for building user interfaces, maintained by Meta.

**Role in this project:** Powers the director dashboard (`apps/web`) and, via React Native, the actor mobile app (`apps/mobile`).

**Why over alternatives:**
- **vs. Vue:** React's ecosystem is larger, and React Native provides a direct path to mobile.
- **vs. Angular:** Angular's opinionated structure would conflict with the Clean Architecture approach; React is unopinionated and composable.
- **vs. Svelte:** Svelte's compiler-based approach is excellent but has a smaller ecosystem and no native mobile story.

### 13.3 Vite (v6)

**What it is:** A next-generation frontend build tool that provides instant dev server startup and fast HMR (Hot Module Replacement).

**Role in this project:** Bundles and serves the director dashboard (`apps/web`). Configured with the `@vitejs/plugin-react` plugin for JSX/TSX support.

**Why over alternatives:**
- **vs. Webpack:** Vite's dev server is dramatically faster due to native ESM serving — no bundling step during development.
- **vs. Create React App:** CRA is deprecated and no longer maintained. Vite is its spiritual successor.
- **vs. Turbopack:** Turbopack is still in development; Vite is production-stable.

### 13.4 Expo SDK 54

**What it is:** A framework and platform for universal React applications. Expo provides a managed workflow for building, testing, and deploying React Native apps without requiring native code knowledge.

**Role in this project:** Powers the actor mobile app (`apps/mobile`). Provides:

- **expo-router:** File-based routing (similar to Next.js for React Native)
- **expo-file-system:** Local file storage for profile persistence and attachment handling
- **expo-image-picker:** Camera/gallery access for video submission
- **expo-sharing:** Native sharing API for opening attachments
- **expo-font:** Custom font loading

**Why over bare React Native CLI:** Expo's managed workflow eliminates the need to configure Android/iOS build tools manually. It also provides EAS (Expo Application Services) for cloud builds.

### 13.5 Prisma (v6)

**What it is:** A next-generation ORM for Node.js and TypeScript. Prisma provides:

- A schema-first approach to database modeling
- Auto-generated TypeScript types from the schema
- A type-safe query builder
- Migration management

**Role in this project:** Provides the database access layer in `packages/infrastructure`. The Prisma schema (`schema.prisma`) defines all 8 models, and `prisma generate` produces the TypeScript client used by the repository implementations.

**Why over alternatives:**
- **vs. TypeORM:** Prisma's schema-first approach and auto-generated types are significantly more type-safe.
- **vs. Drizzle ORM:** Drizzle is excellent but has a smaller ecosystem and less mature migration tooling.
- **vs. Knex.js (raw query builder):** Knex requires manual type definitions for every query result; Prisma generates them automatically.

### 13.6 Zod (v3.24)

**What it is:** A TypeScript-first schema validation library with static type inference.

**Role in this project:** Validates all incoming API payloads before they reach the use case layer. Every Zod schema produces a TypeScript type that matches the expected shape.

**Why over alternatives:** See [Section 11.6](#116-why-zod-over-alternatives).

### 13.7 Vercel

**What it is:** A cloud platform for frontend frameworks and static sites, providing serverless functions, edge functions, and static hosting.

**Role in this project:**

- **Serverless Functions:** The `api/` directory is deployed as Vercel Serverless Functions. Each file becomes an endpoint.
- **Static Hosting:** The director dashboard (`apps/web/dist`) is served as static assets.
- **Edge Network:** Global CDN distribution for low-latency access.
- **Environment Variables:** `DATABASE_URL` for Neon.tech connection string, `EXPO_PUBLIC_API_URL` for mobile app API base URL.

**Why over alternatives:**
- **vs. AWS Lambda + API Gateway:** Vercel provides a simpler DX with file-based routing, automatic deployments, and built-in preview environments.
- **vs. Netlify:** Netlify's serverless functions are less mature, and Vercel's framework support (especially for Next.js/React) is superior.
- **vs. Self-hosted Express:** A persistent server would require managing infrastructure, scaling, and connection pooling — all handled by Vercel's platform.

### 13.8 Neon.tech

**What it is:** A serverless PostgreSQL service that separates storage and compute, scaling to zero when idle.

**Role in this project:** Provides the PostgreSQL database backing the Prisma ORM. The connection string is stored as `DATABASE_URL` in Vercel's environment variables.

**Why over alternatives:**
- **vs. Supabase:** Supabase is excellent but wraps PostgreSQL with additional services (auth, storage) that this project doesn't need.
- **vs. PlanetScale:** PlanetScale uses MySQL, which has weaker JSON support and no PL/pgSQL.
- **vs. Railway/Render:** These are general-purpose platforms, not purpose-built for serverless database patterns.
- **vs. Traditional PostgreSQL on a VPS:** Requires manual connection pooling, scaling, and backup management.

### 13.9 Vitest (v4)

**What it is:** A blazing-fast unit test framework powered by Vite. It provides a Jest-compatible API with native TypeScript and ESM support.

**Role in this project:** Runs unit and integration tests for:

- `packages/core` (84 tests, 25 files) — pure business logic tests, one file per use case
- `packages/infrastructure` (36 tests, 1 file) — Zod schema validation tests
- `apps/web` (101 tests, 20 files) — service-layer, component, and context tests with Testing Library

**Why over Jest:**
- **ESM support:** Vitest has native ESM support without configuration. Jest requires experimental flags or transform configuration.
- **Speed:** Vitest leverages Vite's esbuild transform, which is 10-100x faster than Jest's Babel transform.
- **Compatibility:** Vitest is API-compatible with Jest, making migration trivial.

### 13.10 Playwright (v1.61)

**What it is:** A browser automation framework by Microsoft. It provides cross-browser testing capabilities with a modern API.

**Role in this project:** Runs end-to-end (E2E) tests against the director dashboard in headless Chromium. The test file `e2e/core-flow.spec.ts` contains 11 tests covering:

- Sidebar navigation
- Project listing and detail views
- Casting and round navigation
- Review modal interactions
- Stats bar verification
- Actor creation via modal

**Why over alternatives:**
- **vs. Cypress:** Playwright supports multiple browsers (Chromium, Firefox, WebKit) in a single test run. Cypress is Chromium-only in its free tier.
- **vs. Selenium:** Selenium's WebDriver protocol is slower and less reliable than Playwright's CDP connection.
- **vs. Puppeteer:** Puppeteer is Chromium-only; Playwright is cross-browser by design.

### 13.11 Jest + jest-expo

**What it is:** Jest is a JavaScript testing framework. jest-expo is a Jest preset that configures Jest for React Native projects using Expo.

**Role in this project:** Runs unit tests for the mobile app (`apps/mobile`). The test files cover:

- Component rendering (GlassButton, CastingCard, AvatarChip)
- Service logic (castingService, commentService, attachmentService, profileService)

**Why not Vitest for mobile:** React Native's metro bundler has a different module resolution strategy than Vite. jest-expo's preset handles the transformation of React Native modules, Expo modules, and React Navigation dependencies correctly.

### 13.12 React Testing Library (v16) and @testing-library/react-native (v13)

**What they are:** Testing utilities that encourage testing components the way users interact with them — by finding elements by text, role, and label rather than by internal implementation details.

**Role in this project:**

- **Web:** `@testing-library/react` with `@testing-library/jest-dom` provides DOM-specific matchers (`.toBeInTheDocument()`, `.toHaveTextContent()`).
- **Mobile:** `@testing-library/react-native` provides React Native-specific queries (`getByText`, `getByRole`, `fireEvent.press`).

**Why over enzyme:** Enzyme encourages testing component internals (state, props, methods), which leads to brittle tests. Testing Library encourages testing output, which is more resilient to refactoring.

---

## 14. Frontend: Director Dashboard (React + Vite)

### 14.1 Architecture

The director dashboard is a single-page application (SPA) built with React 19 and Vite 6. Routing went through one migration: it originally used hash-based routing via a custom `useHashRoute` hook (to sidestep needing SPA rewrite rules during early development), and now uses **`react-router-dom`'s `BrowserRouter`** — real paths (`/projects`, `/project/:id`, `/casting/:id`, `/round/:id`, `/actors`, `/docs`, `/help`, `/settings`, plus `/` for the persona selector and `/actor`, `/actor/settings` for the actor portal), matched via `<Routes>`/`<Route>` in `App.tsx` and made to work in production by the catch-all rewrite in `vercel.json` (`{ "source": "/(.*)", "destination": "/" }`, see §12.5). The old `useHashRoute` hook has been removed — it was dead code left over from the migration.

The actor persona is a second, sibling `<Routes>` tree inside the same `App.tsx`, rendered instead of the director layout when the path is `/actor` or starts with `/actor/`:

```typescript
<Routes>
  <Route path="/actor" element={<ActorPortalView />} />
  <Route path="/actor/settings" element={<ActorSettingsView />} />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

`ActorSettingsView` mirrors the director's `SettingsView` (§14.4) in layout, but not in data source: the director's profile is a local-only `localStorage` convenience (there's nothing to synchronize — no other user ever reads it), while the actor's settings edit the actual `Actor` row shared with the director-facing actor management UI (`ActorModal`, `ActorsView`) — fetched via the (previously missing) `GET /api/actors/:id` and saved through the existing `PUT /api/actors/:id` (`UpdateActorUseCase`). "Which actor" resolves the same way the actor portal itself does: the `VITE_ACTOR_ID` env var (default `'a1'`), since there's still no authentication (§1.2) — the demo has one implicit actor identity per deployment, not a login.

### 14.2 Routing Strategy

```typescript
// apps/web/src/main.tsx
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)

// apps/web/src/App.tsx
<Routes>
  <Route path="/projects" element={<ProjectsRoute />} />
  <Route path="/project/:id" element={<ProjectDetailRoute />} />
  <Route path="/casting/:id" element={<CastingDetailRoute />} />
  <Route path="/round/:id" element={<RoundDetailRoute />} />
  <Route path="/actors" element={<ActorsView />} />
  <Route path="/docs" element={<DocsView />} />
  <Route path="/help" element={<HelpView />} />
  <Route path="/settings" element={<SettingsView />} />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

`App.tsx` also branches on the URL *before* rendering `<Routes>`: `/` renders `PersonaSelector` (director vs. actor), and `/actor*` renders a separate, simpler shell with its own nested `<Routes>` for `ActorPortalView`. Each entity-detail route (`ProjectDetailRoute`, `CastingDetailRoute`, `RoundDetailRoute`) is a thin wrapper that reads `:id` via `useParams`, resolves the entity from `ProjectContext`, and redirects to `/projects` if it isn't found — this is also what fixed an earlier bug where these routes didn't exist at all and every URL fell through to the projects list.

### 14.3 Application State

`App.tsx` owns the top-level project tree, fetched once on mount via `fetchDashboard()` (`GET /api/dashboard`); `ProjectContext` (React Context, not Redux/Zustand) then distributes it and its mutators (`addProject`, `addCasting`, `addRound`, `updateRoundStatus`, …) to the routed views:

```typescript
export default function App() {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
      .then(setProjects)
      .catch((err) => { setLoadError(...); setProjects([]) })
  }, [])

  // ...renders <ProjectProvider initial={projects}><Routes>...</Routes></ProjectProvider>
}
```

State management is intentionally minimal: React's built-in `useState` plus one Context provider — no Redux, no Zustand. The `ActorContext` (used by the actor-management views) follows the same pattern independently.

### 14.4 Service Layer

Each domain has a corresponding service file in `apps/web/src/services/`:

| Service | File | Purpose |
|---------|------|---------|
| API client | `api.ts` | Shared `get`/`post`/`put`/`del` fetch wrapper |
| Actor | `actorService.ts` | Fetch (list/single)/create/update/delete actors via API, with local fallback for list/create/update/delete (not the single-actor fetch used by settings) |
| Project | `projectService.ts` | Create projects and fetch the dashboard tree, with local fallback |
| Casting | `castingService.ts` | Create castings, update phase |
| Round | `roundService.ts` | Create rounds, open/close |
| Submission | `submissionService.ts` | Fetch/upload submissions, trigger AI analysis, review |
| Comment | `commentService.ts` | Fetch/create comments |
| Attachment | `attachmentService.ts` | Fetch/add/remove round attachments |
| Cloudinary | `cloudinaryService.ts` | Request a signed upload signature for video uploads |
| Profile | `profileService.ts` | Read/write director profile to localStorage |

Most services implement a **graceful fallback** pattern — if the API call fails (e.g., no backend running, or a validation error), the service falls back to in-memory/local state so the UI doesn't just go blank. This is convenient for offline development, but it's also a known rough edge: because failures are swallowed (`.catch(() => null)`), a real backend error can look identical to "not connected to a backend" from the UI's perspective. Some newer flows (e.g. the dashboard load, casting/round creation in `App.tsx`) surface errors via `sonner` toasts instead, which is the direction the rest of the app should probably move in:

```typescript
export async function createActor(input: CreateActorInput): Promise<ActorDTO> {
  const newActor: ActorDTO = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const result = await post<ActorDTO>('/actors/create', input).catch(() => null)
  if (result) {
    localActors.push(result)
    return result
  }
  localActors.push(newActor)
  return newActor
}
```

This ensures the demo works even without a running backend — critical for the thesis presentation.

### 14.5 Component Architecture

The dashboard uses a flat component structure:

```
apps/web/src/
├── components/     # Reusable UI components (modals, grids, menus)
│   ├── CreateProjectModal.tsx
│   ├── CreateActorModal.tsx
│   ├── UploadVideoModal.tsx
│   ├── ActorModal.tsx
│   ├── ActorGridView.tsx
│   ├── ActorListView.tsx
│   ├── AZIndex.tsx
│   ├── DashboardHeader.tsx
│   ├── DocumentUploadZone.tsx
│   └── EmptyState.tsx
├── views/          # Page-level components (routed)
│   ├── PersonaSelector.tsx
│   ├── ProjectsView.tsx
│   ├── ProjectDetailView.tsx
│   ├── CastingDetailView.tsx
│   ├── RoundDetailView.tsx
│   ├── ActorsView.tsx
│   ├── ActorPortalView.tsx
│   ├── ActorSettingsView.tsx
│   ├── SettingsView.tsx
│   ├── DocsView.tsx
│   ├── HelpView.tsx
│   └── ApiTestView.tsx
├── context/        # ProjectContext, ActorContext
├── services/       # API client and business services
├── data/           # Mock data (fallback/dev seed, see §14.4)
└── styles/         # Global CSS
```

Components are organized by responsibility: `views/` for full-page/routed layouts, `components/` for reusable pieces, `services/` for data fetching, `context/` for the two React Context providers that replaced prop drilling for shared state.

---

## 15. Frontend: Actor Mobile App (Expo / React Native)

### 15.1 Architecture

The actor app uses Expo SDK 54 with expo-router for file-based routing. The app structure follows Expo's conventions:

```
apps/mobile/
├── app/                    # File-based routes (expo-router)
│   ├── _layout.tsx         # Root Stack layout
│   ├── index.tsx           # Dashboard (home screen)
│   ├── guide.tsx           # Actor guide / FAQ
│   └── casting/
│       └── [id].tsx        # Dynamic casting detail
├── src/
│   ├── theme/              # Design tokens
│   ├── components/         # Reusable UI components
│   └── services/           # API client and business logic
```

### 15.2 Routing

expo-router uses the file system as the routing table:

- `app/index.tsx` → `/` (home screen)
- `app/guide.tsx` → `/guide`
- `app/casting/[id].tsx` → `/casting/:id` (dynamic segment)

Navigation between screens uses:

```typescript
import { router } from 'expo-router'

// Navigate to a casting detail
router.push(`/casting/${casting.id}`)
```

### 15.3 Design Tokens

The mobile app defines its design tokens in TypeScript (not CSS, since React Native uses `StyleSheet`):

```typescript
// apps/mobile/src/theme/colors.ts
export const colors = {
  bg: {
    primary: '#07070d',
    secondary: '#0c0c14',
  },
  glass: {
    bg: 'rgba(255,255,255,0.04)',
    bgHover: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.08)',
    borderHover: 'rgba(255,255,255,0.14)',
  },
  text: {
    primary: 'rgba(255,255,255,0.92)',
    secondary: 'rgba(255,255,255,0.55)',
    tertiary: 'rgba(255,255,255,0.32)',
  },
  accent: {
    1: '#6366f1',
    2: '#a855f7',
    3: '#ec4899',
  },
  status: {
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
  },
} as const

export const radii = { sm: 8, md: 14, lg: 20, xl: 28 } as const
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const
```

These tokens mirror the CSS custom properties defined in the web dashboard's `globals.css`, ensuring visual consistency across platforms.

### 15.4 Component Library

The mobile app has a small, focused component library:

| Component | Purpose |
|-----------|---------|
| `GlassCard` | Container with glassmorphism styling (translucent background, border) |
| `GlassButton` | Themed button with primary/ghost/disabled variants |
| `CastingCard` | Card displaying casting info with gradient accents |
| `AvatarChip` | Actor avatar with initials, name, and chevron |
| `ProfileSheet` | Bottom sheet modal for profile editing |

### 15.5 Persistence

The mobile app uses `expo-file-system` for local persistence (no AsyncStorage dependency):

```typescript
// apps/mobile/src/services/profileService.ts
import * as FileSystem from 'expo-file-system'
import { directories } from 'expo-file-system'

const PROFILE_FILE = `${FileSystem.documentDirectory}profile.json`

export async function loadProfile(): Promise<ActorDTO> {
  try {
    const info = await FileSystem.getInfoAsync(PROFILE_FILE)
    if (!info.exists) return DEFAULT_PROFILE
    const raw = await FileSystem.readAsStringAsync(PROFILE_FILE)
    return JSON.parse(raw) as ActorDTO
  } catch {
    return DEFAULT_PROFILE
  }
}

export async function saveProfile(profile: ActorDTO): Promise<void> {
  await FileSystem.writeAsStringAsync(PROFILE_FILE, JSON.stringify(profile))
}
```

### 15.6 API Communication

The mobile app's API client uses `EXPO_PUBLIC_API_URL` for the base URL:

```typescript
const API_BASE = process.env.EXPO_PUBLIC_API_URL || ''

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new ApiError(text, res.status)
  }

  return res.json() as Promise<T>
}
```

When `EXPO_PUBLIC_API_URL` is empty (default for local development), the app uses mock data from the service layer.

---

## 16. Design System: visionOS-Inspired Glassmorphism

### 16.1 Design Philosophy

The visual design is inspired by Apple's visionOS design language, characterized by:

1. **Dark theme:** The primary background is near-black (`#07070d`), creating depth and reducing eye strain.
2. **Frosted glass:** UI elements use translucent backgrounds with `backdrop-filter: blur()` to create a layered, spatial effect.
3. **Gradient accents:** The primary accent is a three-stop gradient: indigo (`#6366f1`) → purple (`#a855f7`) → pink (`#ec4899`).
4. **Subtle borders:** Border colors are extremely low-opacity white (`rgba(255,255,255,0.08)`), barely visible but providing structure.
5. **Ambient orbs:** Large, blurred gradient circles float in the background, creating depth and visual interest.

### 16.2 CSS Custom Properties (Web)

```css
:root {
  --bg-primary: #07070d;
  --bg-secondary: #0c0c14;
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-bg-hover: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-hover: rgba(255, 255, 255, 0.14);
  --text-primary: rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-tertiary: rgba(255, 255, 255, 0.32);
  --accent-1: #6366f1;
  --accent-2: #a855f7;
  --accent-3: #ec4899;
  --success: #22c55e;
  --warning: #eab308;
  --danger: #ef4444;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --shadow-glass: 0 8px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
  --transition: 250ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### 16.3 Glassmorphism Pattern (Web)

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
}

.glass-hover {
  transition: var(--transition);
  cursor: pointer;
}
.glass-hover:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glass);
}
```

### 16.4 Glassmorphism Pattern (Mobile)

```typescript
// apps/mobile/src/components/GlassCard.tsx
export function GlassCard({ children, style, hoverable = false, padded = true }: Props) {
  return (
    <View style={[
      styles.card,
      padded && { padding: spacing.lg },
      hoverable && styles.hoverable,
      style,
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass.bg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: 'hidden',
  },
})
```

Note that React Native does not support `backdrop-filter` natively. The glass effect on mobile is achieved through translucent backgrounds with fixed alpha values, creating a similar visual impression.

### 16.5 Typography

The web dashboard uses a system font stack:

```css
--font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif;
```

The mobile app uses the system font:

```typescript
export const fontFamily = 'System'
```

This ensures native performance and platform-appropriate rendering on both iOS and Android.

### 16.6 Animations

The web dashboard includes several CSS animations:

- **Float animation:** Background orbs drift slowly with `translateY` oscillation
- **Slide-up modal:** Modals animate in from below with scale and opacity
- **Staggered entry:** Content sections use incremental `animation-delay` values (50ms, 100ms, 150ms...)

```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

---

## 17. Data Flow: Complete Request Lifecycle

### 17.1 Scenario: Actor Uploads a Video Submission

This section traces the complete data flow from a user action in the mobile app to a database write and back — the actor portal's primary (Cloudinary-based) path, not the legacy Base64 path described in §7.3/§10.5, which the mobile app no longer calls.

**Step 1 — Actor records a self-tape:**

The casting detail screen (`app/casting/[id].tsx`) opens `CameraRecorder`, which records video via `expo-camera`. On "Use This Take," `handleRecorded(uri)` fires.

**Step 2 — Client uploads directly to Cloudinary:**

```typescript
// apps/mobile/src/services/uploadService.ts
export async function uploadVideoToCloudinary(videoUri: string): Promise<string> {
  const { signature, timestamp, folder, apiKey, cloudName } =
    await fetch(`${API_URL}/api/cloudinary/sign`).then(r => r.json())

  const formData = new FormData()
  formData.append('file', { uri: videoUri, type: 'video/mp4', name: 'video.mp4' } as any)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: 'POST',
    body: formData,
  })
  const { secure_url } = await res.json()
  return secure_url
}
```

The video bytes go straight from the phone to Cloudinary — they never pass through the Vercel serverless functions or the database. `api/cloudinary/sign.ts` only returns a short-lived signature (computed from the Cloudinary API secret, which stays server-side); it never sees the video itself.

**Step 3 — Client submits the resulting URL:**

```typescript
// apps/mobile/src/services/submissionService.ts
export async function submitCloudinaryVideo(casting: CastingDTO, videoUrl: string, notes?: string) {
  return post('/submissions', { castingId: casting.id, actorId: ACTOR_ID, videoUrl, notes })
}
```

**Step 4 — The custom router dispatches the request:**

The HTTP POST to `/api/submissions` is rewritten by `vercel.json` to `/api/router` (see §12.5), where the hand-rolled regex router in `api/router.ts` (§12.2) matches it against `defineRoute('POST', '/api/submissions', createSubmission)` — there is no Vercel file-based routing for these endpoints; `api/router.ts` is the only file involved.

**Step 5 — Zod validates the payload:**

```typescript
const parsed = CreateSubmissionSchema.safeParse(req.body)
```

`CreateSubmissionSchema` checks `castingId`/`actorId` are non-empty strings and `videoUrl` is a valid URL. If validation fails, a 400 response with structured error details is returned immediately.

**Step 6 — Use case is instantiated and executed:**

```typescript
const useCase = new CreateSubmissionUseCase(
  new PrismaSubmissionRepository(),
  new PrismaRoundRepository(),
  new PrismaCastingRepository(),
  new PrismaActorRepository(),
)
const result = await useCase.execute(parsed.data)
```

`CreateSubmissionUseCase` executes its business rules:

1. Verifies the casting exists.
2. Verifies the actor exists.
3. Resolves the target round: the casting's currently-open round, falling back to its first round.
4. Ensures one submission per actor per round.

Note this use case takes a `castingId`, not a `roundId` — the actor app only knows which casting it's applying to; the use case resolves which round the submission actually belongs to.

**Step 7 — Repository persists to database:**

```typescript
const created = await this.submissionRepo.create(submission)   // → prisma.submission.create({ data: submission })
```

**Step 8 — Result flows back up:**

```
Database row created
  ← Prisma returns the created record
    ← Repository returns it as a Submission entity
      ← Use case wraps it in { ok: true, data: submission }
        ← API handler serializes to JSON, returns HTTP 201
          ← Mobile app receives the response
            ← UI updates to show the new submission ("Pending Review")
```

A director can later trigger `POST /api/analyze` on this submission to run `GenerateAIAnalysisUseCase` (§7.5) against the same Cloudinary `videoUrl`.

### 17.2 Scenario: Director Reviews a Submission

The web dashboard follows the same pattern:

1. **Director clicks "Shortlist"** on the review modal
2. **`submissionService.ts`** sends `POST /api/submissions/review` with `{ submissionId, status: 'shortlisted' }`
3. **Zod validates** the payload (`ReviewSubmissionSchema`)
4. **`ReviewSubmissionUseCase`** checks the submission exists and is in `pending` status
5. **Repository updates** the submission status in PostgreSQL
6. **Result flows back** — UI updates the submission badge from "Pending" to "Shortlisted"

---

## 18. State Management Strategy

### 18.1 Philosophy

The project deliberately avoids external state management libraries (Redux, Zustand, MobX, Jotai). The rationale:

1. **Sufficient complexity:** The application's state tree is shallow — a list of projects, each containing castings, each containing rounds, each containing submissions. This fits naturally in React's `useState`.
2. **No server-state cache:** There is no complex client-side cache to manage. The API is thin, and the demo uses mock data as the primary source.
3. **Simplicity for presentation:** For a thesis demo, explicit state management is easier to explain and demonstrate than an opaque store.

### 18.2 Web State

The `App.tsx` component holds the entire project tree in a single `useState`:

```typescript
const [projects, setProjects] = useState<Project[]>(mockProjects)
```

Mutations are handled by `setProjects` with immutable update patterns:

```typescript
// Adding a casting to a project
setProjects(prev => prev.map(p =>
  p.id === pid ? { ...p, castings: [...p.castings, c] } : p
))
```

### 18.3 Mobile State

Each screen manages its own local state with `useState` and `useEffect`:

```typescript
const [castings, setCastings] = useState<CastingDTO[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

Data is fetched in `useEffect` hooks with `useCallback` for dependency stability:

```typescript
const load = useCallback(async () => {
  setLoading(true)
  setError(null)
  try {
    const data = await fetchOpenCastings()
    setCastings(data)
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : 'Failed to load castings')
  } finally {
    setLoading(false)
  }
}, [])

useEffect(() => { load() }, [load])
```

### 18.4 Profile State

Director profile (web) and actor profile (mobile) are persisted client-side:

- **Web:** `localStorage` via `profileService.ts`
- **Mobile:** `expo-file-system` via `profileService.ts`

Both services provide `loadProfile()` and `saveProfile()` functions, creating a simple persistence layer without a database.

---

## 19. Testing Strategy

### 19.1 Testing Pyramid

The project implements a four-layer testing strategy:

```
                    ┌──────────┐
                    │   E2E    │  Playwright (11 tests) + Maestro (6 flows, mobile)
                    │          │  Full browser / device automation
                ┌───┴──────────┴───┐
                │  Integration     │  Vitest + Testing Library (101 tests)
                │  (Web Components)│  Component rendering with mocked services
            ┌───┴──────────────────┴───┐
            │    Infrastructure Tests   │  Vitest (36 tests)
            │    (Zod Schema Validation)│  Schema validation correctness
        ┌───┴──────────────────────────┴───┐
        │         Unit Tests               │  Vitest (84 tests) + Jest (35 tests)
        │    (Business Logic + Services)    │  Pure function/class testing
        └──────────────────────────────────┘
```

### 19.2 Layer 1: Core Unit Tests (84 tests)

**Tool:** Vitest with Node environment
**Location:** `packages/core/__tests__/use-cases/`
**Config:** `packages/core/vitest.config.ts`

These are pure unit tests of use case business logic. They use in-memory mock repositories — no database, no HTTP, no browser:

```typescript
// Example: CreateActorUseCase tests use a simple in-memory mock
class MockActorRepository implements IActorRepository {
  private actors: Actor[] = []
  async findById(id: string) { return this.actors.find(a => a.id === id) ?? null }
  async findByEmail(email: string) { return this.actors.find(a => a.email === email) ?? null }
  async create(actor: Actor) { this.actors.push(actor); return actor }
  // ...
}
```

**Test coverage:** All 25 use cases have dedicated test files covering:
- Happy path (successful execution)
- Error conditions (not found, invalid state, constraint violations)
- Edge cases (empty inputs, boundary values)

### 19.3 Layer 2: Infrastructure Tests (36 tests)

**Tool:** Vitest with Node environment
**Location:** `packages/infrastructure/__tests__/validation/`
**Config:** `packages/infrastructure/vitest.config.ts`

These tests validate that Zod schemas correctly accept valid inputs and reject invalid ones:

```typescript
test('CreateActorSchema rejects invalid email', () => {
  const result = CreateActorSchema.safeParse({ email: 'not-an-email', name: 'Test' })
  expect(result.success).toBe(false)
})
```

### 19.4 Layer 3: Web Integration Tests (101 tests)

**Tool:** Vitest + @testing-library/react + jsdom
**Location:** `apps/web/src/__tests__/components/`, `.../views/`, and `.../services/`
**Config:** `apps/web/vitest.config.ts`

These tests render React components in a simulated DOM environment and verify user-visible behavior:

```typescript
test('renders round name and description', async () => {
  render(<RoundDetailView round={mockRound} onBack={vi.fn()} onReview={vi.fn()} />)
  expect(screen.getByText('Self-Tape Submission')).toBeTruthy()
})
```

`__tests__/services/` covers the service layer directly (mocking `./api`'s `get`/`post`/`put`/`del`) rather than through a component: each service's success path, request shape, and — where the service implements one — its local-fallback-on-API-failure behavior.

The setup file (`src/__tests__/setup.ts`) imports `@testing-library/jest-dom` for extended DOM matchers.

### 19.5 Layer 4: Mobile Unit Tests (35 tests)

**Tool:** Jest + jest-expo + @testing-library/react-native
**Location:** `apps/mobile/__tests__/`
**Config:** `apps/mobile/jest.config.js`

These tests validate React Native components and service functions:

```typescript
test('renders the title text', () => {
  const { getByText } = render(<GlassButton title="Submit" onPress={() => {}} />)
  expect(getByText('Submit')).toBeTruthy()
})
```

The `jest-expo` preset handles the transformation of React Native, Expo, and React Navigation modules. The `transformIgnorePatterns` configuration ensures these modules are not excluded from transformation.

### 19.6 Layer 5: End-to-End Tests (11 Playwright tests + 6 Maestro flows)

**Tool:** Playwright with Chromium headless
**Location:** `e2e/core-flow.spec.ts`
**Config:** `e2e/playwright.config.ts`

These tests run against the live browser, navigating the full application:

```typescript
test('clicking a project opens its detail view', async ({ page }) => {
  await page.getByText('The Crown — Season 3').click()
  await expect(page.getByRole('heading', { name: /the crown — season 3/i })).toBeVisible()
  await expect(page.getByText('Lady Victoria')).toBeVisible()
})
```

The Playwright config connects to a pre-started Vite dev server:

```typescript
export default defineConfig({
  use: {
    baseURL: 'http://172.31.14.232:3001',
    viewport: { width: 1440, height: 900 },
    headless: true,
  },
  webServer: process.env.NO_WEB_SERVER ? undefined : {
    command: 'npx vite --port 3001 --host 0.0.0.0',
    port: 3001,
    cwd: 'apps/web',
    reuseExistingServer: true,
  },
})
```

### 19.7 Running the Tests

| Command | What It Runs | Approximate Time |
|---------|-------------|-----------------|
| `npm run test:core` | 84 core unit tests | ~ 2s |
| `npm run test:infra` | 36 infrastructure tests | < 1s |
| `npm run test:web` | 101 web integration tests | ~ 30s |
| `npm run test` | All three above sequentially | ~ 35s |
| `npm run test:e2e` | 11 Playwright E2E tests | ~ 15s |
| `npm run test` (from apps/mobile) | 35 mobile tests | ~ 35s |
| `npm run maestro:test` | 6 Maestro device flows | requires a running simulator/device |
| `npm run test:all` | Everything except Maestro | ~ 50s |

### 19.8 Test Counts Summary

| Workspace | Tool | Files | Tests | Environment |
|-----------|------|-------|-------|-------------|
| packages/core | Vitest | 25 | 84 | Node |
| packages/infrastructure | Vitest | 1 | 36 | Node |
| apps/web | Vitest | 20 | 101 | jsdom |
| apps/mobile | Jest | 9 | 35 | Native (jest-expo) |
| e2e | Playwright | 1 | 11 | Chromium headless |
| apps/mobile/.maestro | Maestro | 6 flows | — | Real device / simulator |
| **Total (automated, non-Maestro)** | | **56** | **265** | |

---

## 20. Deployment and DevOps

### 20.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Vercel Platform                      │
│                                                          │
│  ┌────────────────────┐    ┌──────────────────────────┐ │
│  │  Static Assets     │    │  Serverless Functions    │ │
│  │  apps/web/dist/    │    │  api/**/*.ts             │ │
│  │  (CDN-distributed) │    │  (auto-scaled)           │ │
│  └────────────────────┘    └───────────┬──────────────┘ │
│                                        │                  │
│                                        │  DATABASE_URL    │
│                                        ▼                  │
│                              ┌──────────────────┐        │
│                              │  Neon.tech        │        │
│                              │  PostgreSQL       │        │
│                              └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### 20.2 Build Pipeline

1. **Install:** `npm install` resolves all workspace dependencies
2. **Prisma Generate:** `prisma generate` creates the TypeScript client from the schema
3. **Build Web:** `vite build` bundles the React dashboard into `apps/web/dist/`
4. **Deploy:** Vercel deploys static files to CDN, API functions to serverless
5. **Database:** `prisma migrate deploy` applies pending migrations to Neon.tech

### 20.3 Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Vercel / `.env` | Neon.tech PostgreSQL connection string |
| `EXPO_PUBLIC_API_URL` | Vercel / `.env` | API base URL for the mobile app |
| `NODE_ENV` | Automatic | Controls Prisma logging and caching behavior |

### 20.4 Development Workflow

```bash
# Terminal 1: Director Dashboard
npm run dev:web          # Starts Vite on port 3001

# Terminal 2: Actor Mobile App
npm run dev:mobile       # Starts Expo on port 8081

# Terminal 3: Run tests
npm test                 # Core + Infrastructure + Web tests
npx jest --no-cache      # Mobile tests (from apps/mobile/)
npm run test:e2e         # Playwright E2E tests

# Terminal 4: Database management
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Run database migrations
```

---

## 21. Project Directory Reference

```
masterai-tfm/
├── .gitignore
├── AGENTS.md                       # AI agent instructions
├── ARCHITECTURE_TEXTBOOK.md        # This document
├── README.md                       # Project overview, setup, demo instructions
├── architecture.md                 # Early architecture notes
├── master_plan.md                  # Execution roadmap
├── package.json                    # Root workspace config
├── package-lock.json
├── tsconfig.json                   # Root TS config
├── vercel.json                     # Vercel deployment config
├── .env.example                    # DATABASE_URL, OPENAI_API_KEY, Cloudinary, Blob token
│
├── packages/
│   ├── core/                       # @masterai/core — PURE TYPESCRIPT
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── index.ts                # Barrel exports
│   │   ├── entities/                # 8 entity interfaces
│   │   ├── repositories/           # 8 repository interfaces
│   │   ├── services/                # IAIAnalysisService
│   │   ├── use-cases/               # 25 use case classes
│   │   └── __tests__/               # 84 tests, 25 files
│   │
│   ├── database/                   # @masterai/database
│   │   ├── package.json
│   │   ├── src/client.ts           # PrismaClient singleton
│   │   └── prisma/
│   │       ├── schema.prisma       # 8 database models
│   │       └── seed.ts             # Demo data seed script
│   │
│   └── infrastructure/             # @masterai/infrastructure
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── index.ts
│       ├── validation/              # 20 Zod schemas, 7 files
│       ├── repositories/           # 8 Prisma implementations
│       └── __tests__/              # 36 tests
│
├── api/                             # 28 endpoints, mostly through one router (§12.2)
│   ├── package.json
│   ├── tsconfig.json
│   ├── router.ts                   # 27 routes dispatched from one Vercel function
│   ├── router.mjs                  # esbuild output (gitignored, built at deploy time)
│   ├── ai/OpenAIAnalysisService.ts # Whisper + GPT-4o-mini adapter
│   └── cloudinary/sign.ts          # Standalone signed-upload function
│
├── apps/
│   ├── web/                        # Director Dashboard
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── vitest.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── App.tsx             # Root SPA, react-router-dom routes
│   │       ├── main.tsx            # BrowserRouter mount
│   │       ├── styles/globals.css  # visionOS glassmorphism design system
│   │       ├── context/            # ProjectContext, ActorContext
│   │       ├── data/mock.ts        # Fallback/dev seed data
│   │       ├── services/           # 10 API service modules
│   │       ├── components/         # ~10 reusable components (modals, grids)
│   │       ├── views/              # 12 routed views
│   │       └── __tests__/          # 101 tests, 20 files (incl. service-layer tests)
│   │
│   └── mobile/                     # Actor App
│       ├── package.json
│       ├── app.json                # Expo config (expo-router plugin root: ./app)
│       ├── index.js                # Explicit entry (expo-dev-client compatibility)
│       ├── jest.config.js
│       ├── metro.config.js
│       ├── babel.config.js
│       ├── .maestro/                # 6 device-flow E2E specs
│       ├── app/                    # expo-router file routes
│       │   ├── _layout.tsx
│       │   ├── index.tsx           # Dashboard
│       │   ├── guide.tsx           # FAQ
│       │   └── casting/[id].tsx    # Casting detail + recording flow
│       ├── src/
│       │   ├── theme/colors.ts     # Design tokens
│       │   ├── components/         # 6 reusable components (incl. CameraRecorder)
│       │   └── services/           # 8 service modules
│       └── __tests__/              # 35 tests, 9 files
│
└── e2e/                             # Playwright E2E + manual simulation scripts
    ├── playwright.config.ts
    ├── core-flow.spec.ts           # 11 browser tests
    ├── simulate-submission.ts      # Scripted API walkthrough of the submission flow
    └── simulate-document-upload.ts # Scripted API walkthrough of the attachment flow
```

---

## Appendix A: API Endpoint Reference

This appendix gives request/response shapes for the same 28 endpoints listed in §12.4; treat §12.4 as the index and this as the schema detail.

| # | Method | Path | Request Body | Response | Status Codes |
|---|--------|------|-------------|----------|-------------|
| 1 | POST | `/api/upload` | multipart, handled by `@vercel/blob`'s `handleUpload` (`clientPayload`: `{fileType, fileSize, fileName}`) | Blob client token payload | 200, 400 |
| 2 | GET | `/api/actors?search=` | — | `Actor[]` | 200 |
| 3 | POST | `/api/actors/create` | `{name, email, phone?}` | `Actor` | 201, 400 |
| 4 | GET | `/api/actors/:id` | — | `Actor` | 200, 404 |
| 5 | PUT | `/api/actors/:id` | Partial actor fields | `Actor` | 200, 400, 404 |
| 6 | DELETE | `/api/actors/:id` | — | `{id, deleted: true}` | 200, 404 |
| 7 | GET | `/api/projects` | — | `Project[]` | 200 |
| 8 | POST | `/api/projects/create` | `{directorId (uuid), title, description?}` | `Project` | 201, 400 |
| 9 | POST | `/api/projects/close` | `{projectId, directorId}` | `Project` | 200, 400 |
| 10 | PUT | `/api/projects/:id/status` | `{status: 'draft'\|'active'\|'closed'}` | `Project` | 200, 400, 404 |
| 11 | GET | `/api/dashboard` | — | `Project[]` (nested castings → rounds → submissions) | 200 |
| 12 | GET | `/api/castings?actorId=` | — | `Casting[]` (open only, with current round + that actor's submission) | 200 |
| 13 | POST | `/api/castings/create` | `{projectId, roleName, description?, requirements?}` | `Casting` | 201, 400 |
| 14 | POST | `/api/castings/close` | `{castingId}` | `Casting` | 200, 400 |
| 15 | PUT | `/api/castings/:id/phase` | `{activePhase}` | `Casting` | 200, 400, 404 |
| 16 | POST | `/api/rounds/create` | `{castingId, name, description?, deadline?, order}` | `Round` | 201, 400 |
| 17 | POST | `/api/rounds/open` | `{roundId (uuid)}` | `Round` | 200, 400 |
| 18 | POST | `/api/rounds/close` | `{roundId (uuid)}` | `Round` | 200, 400 |
| 19 | POST | `/api/rounds/attachment` | `{roundId, fileName, fileType, url, fileSize}` | `Attachment` | 201, 400 |
| 20 | GET | `/api/rounds/attachments?roundId=` | — | `Attachment[]` | 200 |
| 21 | DELETE | `/api/rounds/attachment/:id` | — | `{id, removed: true}` | 200, 404 |
| 22 | POST | `/api/submissions` | `{castingId, actorId, videoUrl, notes?}` | `Submission` | 201, 400 |
| 23 | POST | `/api/submissions/upload` | `{roundId (uuid), actorId (uuid), videoData (base64), fileName, notes?}` | `Submission` | 201, 400 |
| 24 | POST | `/api/submissions/review` | `{submissionId (uuid), status: 'reviewed'\|'shortlisted'\|'rejected', feedback?}` | `Submission` | 200, 400 |
| 25 | POST | `/api/submissions/comment` | `{submissionId (uuid), authorName, content}` | `Comment` | 201, 400 |
| 26 | GET | `/api/submissions/comments?submissionId=` | — | `Comment[]` | 200 |
| 27 | POST | `/api/analyze` | `{submissionId}` | `Submission` (with `transcript`, `aiScore`, `aiFeedback`) | 200, 400, 404, 429, 502, 503 |
| 28 | GET | `/api/cloudinary/sign` | — | `{signature, timestamp, folder, apiKey, cloudName}` | 200, 405, 500 |

---

## Appendix B: Dependency Graph

```
┌────────────────────────────────────────────────────────────────────┐
│                         DEPENDENCY GRAPH                           │
│                                                                    │
│  ┌─────────────┐     ┌─────────────┐     ┌──────────────────────┐ │
│  │  apps/web   │────>│             │     │  packages/core       │ │
│  │  React 19   │     │             │     │  (ZERO deps)         │ │
│  │  Vite 6     │     │             │     │                      │ │
│  └─────────────┘     │             │     │  Entities:           │ │
│                      │             │     │  - Actor             │ │
│  ┌─────────────┐     │             │     │  - Director          │ │
│  │ apps/mobile │────>│             │     │  - Project           │ │
│  │ Expo 54     │     │             │     │  - Casting           │ │
│  │ RN 0.81     │     │             │     │  - Round             │ │
│  └──────┬──────┘     │             │     │  - Submission        │ │
│         │            │             │     │  - Comment           │ │
│         │            │             │     │  - Attachment        │ │
│         │            │             │     │                      │ │
│         │            │  ┌──────────┤     │  Use Cases:          │ │
│         │            │  │   api/   │     │  - 25 total          │ │
│         └───────────>│  │ Vercel   │     │                      │ │
│                      │  │ Serverless│    │  Repo Interfaces:    │ │
│                      │  └────┬─────┘     │  - 8 total           │ │
│                      │       │           │                      │ │
│                      │       │           └──────────┬───────────┘ │
│                      │       │                      │             │
│                      │  ┌────┴──────────────────────┘             │
│                      │  │                                         │
│                      │  │  ┌──────────────────────────────────┐  │
│                      │  │  │  packages/infrastructure         │  │
│                      │  │  │  Prisma 6 + Zod 3                │  │
│                      │  │  │                                   │  │
│                      │  │  │  Prisma Schemas: 8 models         │  │
│                      │  │  │  Zod Schemas: 20 validators       │  │
│                      │  │  │  Repos: 8 implementations         │  │
│                      │  │  └──────────────┬───────────────────┘  │
│                      │  │                 │                       │
│                      │  │                 ▼                       │
│                      │  │  ┌──────────────────────────────────┐  │
│                      │  │  │  Neon.tech PostgreSQL            │  │
│                      │  │  │  Serverless, auto-scaling        │  │
│                      │  │  └──────────────────────────────────┘  │
│                      │  │                                         │
└──────────────────────┴──┴─────────────────────────────────────────┘
```

### External Dependencies (Production)

| Package | Used By | Purpose |
|---------|---------|---------|
| react, react-dom | apps/web | UI rendering |
| react-router-dom | apps/web | Client-side routing (§14.2) |
| sonner | apps/web | Toast notifications |
| react, react-native | apps/mobile | Cross-platform UI |
| expo | apps/mobile | Managed React Native workflow |
| expo-router | apps/mobile | File-based routing |
| expo-camera | apps/mobile | In-app audition recording (§15, `CameraRecorder`) |
| expo-dev-client | apps/mobile | Custom dev client (required alongside expo-camera's native config) |
| expo-file-system | apps/mobile | Local file/base64 access (legacy manual-upload path) |
| expo-image-picker | apps/mobile | Camera/gallery access |
| expo-sharing | apps/mobile | Native sharing |
| @react-navigation/native, /native-stack, /bottom-tabs | apps/mobile | Navigation primitives underlying expo-router |
| @prisma/client | database, infrastructure | Database ORM |
| zod | infrastructure | Schema validation |
| cloudinary | api | Server-side SDK for signed upload requests (`api/cloudinary/sign.ts`) |
| @vercel/blob | api | Direct-to-Blob upload handling (`POST /api/upload`) |
| openai | api | Whisper transcription + GPT-4o-mini scoring (`OpenAIAnalysisService`) |
| react-native-reanimated | apps/mobile | Animations |
| react-native-screens | apps/mobile | Native screen containers |
| react-native-safe-area-context | apps/mobile | Safe area handling |

### Dev Dependencies (Key)

| Package | Used By | Purpose |
|---------|---------|---------|
| typescript | All | Type checking |
| vitest | core, infra, web | Unit and integration testing |
| jest | mobile | Unit testing |
| jest-expo | mobile | React Native test preset |
| @testing-library/react | web | Component testing |
| @testing-library/react-native | mobile | Component testing |
| @playwright/test | e2e | End-to-end browser testing |
| vite | web | Build tool and dev server |
| @vitejs/plugin-react | web | React support for Vite |
| prisma | infrastructure | Schema management and code generation |

---

## Appendix C: Configuration Files

### C.1 Root tsconfig.json

```json
{
  "compilerOptions": {},
  "extends": "expo/tsconfig.base"
}
```

Inherits from Expo's base TypeScript configuration, which sets `strict: true`, `moduleResolution: "bundler"`, and other modern TypeScript defaults.

### C.2 packages/core/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Key choices:
- **`target: "ES2022"`:** Enables top-level await, native `Array.at()`, and other ES2022 features.
- **`module: "ESNext"`:** Emits ESM imports/exports for tree-shaking.
- **`moduleResolution: "bundler"`:** Resolves imports using the bundler algorithm (supports package.json `exports` field).
- **`declaration: true`:** Generates `.d.ts` files for downstream consumers.

### C.3 vitest.config.ts (core and infrastructure)

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
  },
})
```

- **`globals: true`:** Enables `describe`, `it`, `expect` without imports (Jest compatibility).
- **`environment: 'node'`:** Tests run in a Node.js environment (no DOM).

### C.4 vitest.config.ts (web)

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['src/__tests__/setup.ts'],
  },
})
```

- **`environment: 'jsdom'`:** Provides a browser-like DOM in Node.js.
- **`setupFiles`:** Imports `@testing-library/jest-dom` for extended matchers.

### C.5 jest.config.js (mobile)

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
}
```

- **`preset: 'jest-expo'`:** Configures Babel transformation for React Native and Expo modules.
- **`transformIgnorePatterns`:** Ensures React Native, Expo, and navigation modules are transformed (they ship as untranspiled source).

### C.6 playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://172.31.14.232:3001'

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    headless: true,
  },
  webServer: process.env.NO_WEB_SERVER ? undefined : {
    command: 'npx vite --port 3001 --host 0.0.0.0',
    port: 3001,
    cwd: 'apps/web',
    reuseExistingServer: true,
  },
})
```

- **`timeout: 30000`:** Each test has a 30-second timeout.
- **`retries: 1`:** Failed tests are retried once (flaky test tolerance).
- **`NO_WEB_SERVER`:** When set, assumes the dev server is already running.

### C.7 vercel.json

```json
{
  "functions": { "api/**/*.ts": { "maxDuration": 10 } },
  "buildCommand": "npm run build:web",
  "outputDirectory": "apps/web/dist",
  "installCommand": "npm install",
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

---

*This document was generated as part of the Master's Thesis in AI Development — Multi-Platform Casting System.*
*The architecture follows Clean Architecture principles with strict dependency inversion across all layers.*
