<!--
Sync Impact Report:
Version: 1.0.0 → 1.0.1 (translate constitution to English)
Modified principles: All principle descriptions translated from Japanese to English
Added sections: N/A
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - No changes needed (already in English)
  ✅ spec-template.md - No changes needed (already in English)
  ✅ tasks-template.md - No changes needed (already in English)
Follow-up TODOs: None
-->

# Just Chat Constitution

## Core Principles

### I. Type Safety First

Prioritize type safety in all TypeScript implementations.

- Define types explicitly; prohibit use of `any` type (use `unknown` with proper type guards when absolutely necessary)
- Annotate all function parameters and return values with types
- Leverage generics to ensure type reusability and safety
- Enable strict mode for rigorous type checking

**Rationale**: Chat applications involve multiple data flows including message transmission and user management. Type safety prevents runtime errors and enables safe refactoring and feature additions.

### II. Single Responsibility Architecture

Implement both backend and frontend with architecture following the Single Responsibility Principle.

- Each module/component MUST have a single responsibility
- Clearly define inter-layer dependencies and prohibit circular references
- Separate business logic from presentation logic
- Clearly separate data access layer (Prisma), business logic layer, and API layer

**Rationale**: Single Responsibility Principle clarifies each module's role, improving testability, maintainability, and extensibility to handle increasing chat application complexity.

### III. Container-First Infrastructure

Containerize FE, BE, and DB each using Docker.

- Each service MUST have its own Dockerfile
- Manage development environment centrally with docker-compose
- Thoroughly externalize configuration through environment variables
- Control inter-container communication through network settings

**Rationale**: Containerization ensures development environment consistency, simplifies deployment, and eliminates environment discrepancies.

### IV. Monorepo Organization

Organize FE and BE in a monorepo structure.

- Manage common development tools (mise, etc.) at root directory
- Leverage package manager workspace features
- Share common type definitions and configurations appropriately
- Enable independent build and test execution for each service

**Rationale**: Monorepo facilitates type definition sharing between frontend and backend, enabling efficient development while maintaining consistency.

### V. Figma-Driven Frontend

Leverage Figma MCP server for frontend screen implementation.

- Prioritize code generation from designs
- Clearly map Figma design system to code components
- Adjust generated code to comply with type safety and architecture principles
- Establish update process for design changes

**Rationale**: Minimizes design-code divergence while achieving efficient UI implementation and consistency maintenance.

## Technical Constraints

### Technology Stack

- Frontend: Next.js (Web-based), TypeScript
- Backend: Express.js, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Containers: Docker, Docker Compose
- Toolchain: mise

### Code Quality Standards

- Maintain code quality through ESLint and Prettier
- Maintain zero type errors
- Maintain zero build errors
- Remove unused imports and code

### Performance Requirements

- Frontend: Initial render time < 2 seconds
- Backend: API response time p95 < 200ms
- Database: Optimize queries (avoid N+1 problems)

## Development Workflow

### Branch Strategy

- main branch MUST always be in a deployable state
- Feature development occurs on branches with feature/ prefix
- Conduct code reviews through Pull Requests

### Code Review Requirements

- All code changes MUST be reviewed through PRs
- Verify compliance with type safety principles
- Verify no violations of Single Responsibility Principle
- Verify appropriate tests are added (when applicable)

### Testing Strategy

- Unit tests: Validate business logic (as needed)
- Integration tests: Validate API endpoints (as needed)
- E2E tests: Validate user flows (as needed)
- Implement tests appropriately based on functional requirements

## Governance

### Amendment Process

Changes to this constitution MUST follow this process:

1. Document the proposed change
2. Analyze impact scope (templates, existing code impact)
3. Obtain team consensus
4. Update version (semantic versioning)
5. Synchronize related templates and documents

### Versioning Policy

- MAJOR: Backward incompatible principle removals or redefinitions
- MINOR: New principle/section additions or material expansions
- PATCH: Clarifications, wording fixes, typo corrections, non-semantic refinements

### Compliance Review

- Verify compliance with this constitution in all PR/reviews
- Deviations from principles MUST be justified and documented
- Complexity introductions MUST be recorded with alternative consideration results

### Runtime Guidance

For detailed implementation guidance, refer to the project README.md and each template file.

---

**Version**: 1.0.1 | **Ratified**: 2025-11-07 | **Last Amended**: 2025-11-07
