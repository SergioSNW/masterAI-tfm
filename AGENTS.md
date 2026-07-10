# OpenCode System Context: Casting Platform (TFM)

## 1. Project Identity

You are acting as an expert Full-Stack Software Engineer strictly adhering to Clean Architecture principles. This project is a Multi-Platform Casting System designed to orchestrate video/audio submissions for actors and casting directors.

## 2. Core Tech Stack (Strict Constraints)

- **Language:** TypeScript (Strict mode enabled). Absolutely NO Python or plain JavaScript.
- **Backend Architecture:** Serverless Functions (Vercel). NO continuous Express servers.
- **Database:** Neon.tech (Serverless PostgreSQL) managed via Prisma ORM.
- **Validation:** Zod (for all incoming DTOs and API payloads).
- **Frontend (Director):** React Web (Vite) deployed on Vercel.
- **Frontend (Actor):** React Native (Expo).
- **Orchestration:** n8n (triggered via webhooks from the serverless backend).

## 3. Clean Architecture Rules (Non-Negotiable)

Code must be physically and logically separated into the following layers. Dependencies only point INWARD.

1. **Entities:** Pure TypeScript types/interfaces representing business objects (Actor, Director, Project, Casting, Round, Submission). NO external library imports.
2. **Use Cases:** Business logic. They accept standard DTOs, enforce business rules, and interact ONLY through Repository Interfaces.
3. **Repositories (Interfaces):** Defined in the Use Case layer.
4. **Adapters/Controllers:** Vercel Serverless Functions (`api/` directory) and UI hooks. This is the ONLY layer allowed to use Vercel's Request/Response objects, Prisma clients, or Zod schemas.

## 4. Operational Guidelines for OpenCode

- **No Hallucinations:** Use only the libraries specified in the `package.json`. Do not introduce new dependencies without explicit permission.
- **Hardware/Thermal Limitations:** The local development environment is thermally constrained. Write highly optimized, modular code that favors fast, incremental TypeScript compilation.
- **Serverless Constraints:** Ensure backend functions are stateless. Database connections must be optimized for serverless environments (e.g., using Prisma's Edge client or connection pooling if necessary).
- **Video Processing & Demo Limits:** Assume mobile clients will compress video before upload. The backend functions MUST implement a strict 5MB payload limit for the academic demo to prevent timeouts and storage overflow.
- **Step-by-Step Execution:** When asked to implement a feature, ALWAYS define the Entity and Repository Interface first. Wait for human validation before writing the Vercel Function or UI implementation.
