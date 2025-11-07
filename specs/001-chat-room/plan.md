# Implementation Plan: リアルタイムチャットルーム

**Branch**: `001-chat-room` | **Date**: 2025-11-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-chat-room/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

WebSocketを使用したリアルタイムチャットルームの実装。ユーザーは名前を入力するだけでアカウント登録なしでチャットに参加でき、メッセージはデータベースに永続化されます。フロントエンドはNext.js、バックエンドはExpress.js、データベースはPostgreSQLとPrisma ORMを使用し、すべてDockerコンテナで実行されます。

## Technical Context

**Language/Version**: TypeScript (Node.js LTS)
**Primary Dependencies**:
- Frontend: Next.js, WebSocket Client
- Backend: Express.js, ws (WebSocket library), Prisma Client
**Storage**: PostgreSQL (via Prisma ORM)
**Testing**: Jest (unit/integration), Playwright (E2E) or NEEDS CLARIFICATION
**Target Platform**: Web application (Docker containers)
**Project Type**: Web (frontend + backend monorepo)
**Performance Goals**:
- Message delivery < 1 second
- API response p95 < 200ms
- Frontend initial render < 2 seconds
**Constraints**:
- Support 1-20 concurrent users
- Message history: latest 100 messages on join
- Session persistence: 30 minutes after disconnect
**Scale/Scope**:
- 2 entities (User, Message)
- 3 main user flows (join, send message, disconnect)
- Single chat room

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Type Safety First ✓

- All TypeScript code will use strict mode
- No `any` types (use `unknown` with type guards when necessary)
- All function parameters and returns will have explicit type annotations
- Shared types between frontend and backend will be defined in common location

### II. Single Responsibility Architecture ✓

- Backend layers: Data access (Prisma) → Business logic → API
- Frontend layers: Components → Services → State management
- WebSocket handling will be isolated in dedicated service modules
- No circular dependencies between layers

### III. Container-First Infrastructure ✓

- Frontend container: Next.js application
- Backend container: Express.js with WebSocket server
- Database container: PostgreSQL
- docker-compose.yml for orchestration
- Environment variables for configuration

### IV. Monorepo Organization ✓

- Project root manages mise toolchain
- Backend and frontend as separate directories
- Shared type definitions in common location
- Independent build/test for each service

### V. Figma-Driven Frontend ⚠️

- Initial implementation will focus on functional MVP
- UI components will be implemented with basic styling
- Figma integration can be applied in future iterations

**Status**: PASS - All core principles satisfied

**Post-Phase 1 Re-evaluation** (2025-11-07):
- ✓ Type safety confirmed: Shared TypeScript types defined in contracts
- ✓ Architecture layers validated: Clear separation in project structure
- ✓ Container structure confirmed: All three services have independent Dockerfiles
- ✓ Monorepo organization confirmed: mise toolchain at root, independent services
- ⚠️ Figma-driven frontend: Deferred to future iteration, functional MVP prioritized

**Final Status**: APPROVED - Ready for Phase 2 (tasks generation)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/           # Prisma schema and types
│   ├── services/         # Business logic (user, message, session)
│   ├── websocket/        # WebSocket server and handlers
│   ├── api/              # HTTP API routes (if needed)
│   └── index.ts          # Application entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── tests/
│   ├── unit/             # Service layer tests
│   └── integration/      # WebSocket integration tests
├── Dockerfile
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # UI components
│   │   ├── ChatRoom/     # Main chat interface
│   │   ├── MessageList/  # Message display
│   │   ├── MessageInput/ # Message input form
│   │   └── UserList/     # Online users list
│   ├── services/         # WebSocket client, API client
│   ├── hooks/            # React hooks for chat functionality
│   └── types/            # TypeScript type definitions
├── tests/
│   ├── unit/             # Component tests
│   └── e2e/              # Playwright E2E tests
├── Dockerfile
├── package.json
└── tsconfig.json

shared/
└── types/                # Shared TypeScript types between FE/BE
    ├── user.ts
    ├── message.ts
    └── websocket.ts

docker-compose.yml
mise.toml
```

**Structure Decision**: Web application monorepo structure selected. Backend and frontend are separated with independent build processes. Shared types directory enables type safety across the stack. Each service has its own Dockerfile for containerization.

## Complexity Tracking

No violations - all constitution principles are satisfied.
