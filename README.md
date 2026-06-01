# PTO ID System

Web-система автоматизации исполнительной документации для инженеров ПТО.

Текущий статус:

```text
FIRST ALLOWED INFRASTRUCTURE BOOTSTRAP SCAFFOLD ACCEPTED; CANONICAL ADR BASELINE ACCEPTED; BACKEND MODULE ARCHITECTURE SKELETON INTRODUCED; FIRST TECHNICAL FRONTEND-BACKEND STATUS SLICE INTRODUCED; DATABASE FOUNDATION TECHNICAL SLICE INTRODUCED; OBJECT STORAGE FOUNDATION TECHNICAL SLICE INTRODUCED; AUTH SHARING IMPLEMENTATION PLAN ADDED; USER IDENTITY SKELETON INTRODUCED; GLOBAL SYSTEM ADMIN MARKER INTRODUCED; OWNED WORKSPACE BASELINE INTRODUCED
```

В репозитории принят первый разрешённый scaffold. Это только infrastructure/bootstrap
foundation: workspace, tooling, app shells, shared placeholders, env/config foundation
and CI quality gates. Backend module boundaries are now introduced as an
architecture skeleton only.

The first technical vertical slice now proves that the React shell can call the
NestJS technical `/health` endpoint through `VITE_API_BASE_URL` and consume the
shared technical response type from `packages/shared-types`. This slice is only
for infrastructure verification and CI/build/test confidence.

The database foundation technical slice adds Prisma generation wiring, an empty
Prisma schema with only `generator` and `datasource`, and an infrastructure-only
technical database health boundary. `InfrastructureModule` is explicit, not
global, and is currently imported only by technical health composition. This
slice intentionally has no domain models, migrations, business tables,
repositories, CRUD APIs or domain readiness semantics.

The object storage foundation technical slice adds an infrastructure-only
object storage health boundary and S3-compatible configuration adapter skeleton.
Runtime health checks are config-only and report `configured` or `unconfigured`
for storage, avoiding brittle CI/network coupling. This slice intentionally has
no uploads, downloads, file metadata, evidence files, generated artifacts,
provider URLs in health, Prisma models, migrations, repositories, CRUD APIs or
business storage behavior.

The user identity skeleton adds a framework-free `Actor` primitive and a
workspace-owned current actor resolver utility/port for future commands and
queries. It fails closed for missing or disabled actors and grants no business
access. This is not login, registration, session/cookie/JWT/OAuth, Prisma user
storage, an API route or frontend auth UI.

The global system admin marker adds an optional deployment/config-driven
`SYSTEM_ADMIN_ACTOR_ID` and a framework-free workspace `admin-path` utility that
can identify the one configured active actor for future admin-only paths. Missing
config means no actor is system admin. The marker is not workspace ownership,
not a business access bypass, not a role/capability on `Actor`, not an API route,
not an admin panel and not auth/session implementation.

The owned workspace baseline adds a TypeScript-only `OwnedWorkspace` primitive
and framework-free owner-only access utilities. Owner checks return
leakage-safe `NOT_FOUND_OR_NOT_AUTHORIZED` denial for missing, disabled,
non-owner or wrong-scope access. This is not workspace persistence, not a Prisma
model, not a route/controller, not a frontend screen, not share codes/grants and
not a system-admin bypass.

Production feature coding remains blocked.

Главный источник знаний проекта:

```text
docs/PROJECT_MEMORY.md
```

Перед любой работой по проекту обязательно прочитать:

- `docs/PROJECT_MEMORY.md`
- `docs/CONVERSATION_QA_LOG.md`
- `docs/AGENTS.md`
- `docs/19-sharing-and-access-model-v1.md`
- `docs/20-auth-sharing-implementation-plan-v1.md`
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`
- `docs/samples/registry-ventilation-example.md`
- `docs/samples/aosr-example-analysis.md`

Главный принцип:

```text
SOURCE OF TRUTH = STRUCTURED DATA
```

DOCX/PDF/реестры/комплекты являются производными артефактами и должны генерироваться из структурированных данных.

## Canonical ADR baseline

ADR baseline accepted. The canonical ADR files are now authoritative references
for future implementation work:

- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`

Future implementation must comply with these ADRs. They consolidate existing
architecture decisions only and do not permit feature coding.

## MVP focus

- ОВиК
- ВК
- российская исполнительная документация
- АОСР как первая обязательная first-class form
- акты испытаний только после отдельной ратификации concrete forms
- сертификаты
- исполнительные схемы
- реестры
- комплекты ИД
- MVP должен быть usable without AI/OCR

## Non-goals

Система не является:

- ERP;
- BIM;
- CAD;
- Google Docs;
- CRM;
- generic document constructor;
- enterprise document management system;
- файловым менеджером.

## Created architecture documents

Уже созданы:

- `docs/06-data-model-v1.md`
- `docs/07-aosr-domain-specification.md`
- `docs/08-document-types-catalog.md`
- `docs/09-aggregate-boundaries-and-invariants.md`
- `docs/10-auth-workspace-rbac-model.md`
- `docs/11-ai-project-ingestion-and-assistance-model.md`
- `docs/12-database-schema-v1.md`
- `docs/13-domain-lifecycle-immutability-validation-v1.md`
- `docs/14-backend-api-architecture-v1.md`
- `docs/15-api-command-readmodel-contracts-v1.md`
- `docs/16-mvp-scope-and-first-forms-v1.md`
- `docs/17-tech-stack-and-implementation-strategy-v1.md`
- `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`
- `docs/19-sharing-and-access-model-v1.md`
- `docs/20-auth-sharing-implementation-plan-v1.md`
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`

## Access-model amendment

```text
docs/19-sharing-and-access-model-v1.md supersedes docs/10-auth-workspace-rbac-model.md for MVP implementation scope
```

MVP access uses owner-based workspace/certificate-library sharing, share codes
and capability grants instead of the previous RBAC role matrix. Future
workspace/session work must follow `docs/19`.

`docs/20-auth-sharing-implementation-plan-v1.md` is the safe phased plan for
future implementation of that access model. It starts with user identity
skeleton, then system admin marker, owned workspace baseline, workspace share
codes/grants, and certificate library share codes/grants. It is documentation
only and does not add schema, migrations, routes, auth or sharing code.

## Current guardrail

На основании Tech Stack and Implementation Strategy V1 и pre-scaffold gate документа:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

создан и принят первый инфраструктурный scaffold.

Scaffold включает:

- `pnpm` workspace root;
- strict TypeScript baseline;
- ESLint, Prettier, Vitest and local CI-equivalent checks;
- `apps/web` React + TypeScript + Vite shell;
- `apps/api` NestJS shell with technical `/health` endpoint only;
- `packages/shared-types` technical placeholder types;
- `packages/shared-config` typed env validation foundation;
- env example files for development, test and production;
- architecture guardrails for import boundaries and infrastructure portability;
- GitHub Actions CI for scaffold quality checks.
- canonical backend module skeleton in `apps/api/src`:
  `shared-kernel`, `infrastructure`, `workspace`, `documents`, `evidence`,
  `registry`, `packages`, `ai`, and `health`.
- first technical frontend-backend status slice: typed `/health` response,
  frontend fetch utility, placeholder status panel and focused tests.
- database foundation technical slice: Prisma generation wiring, empty
  `apps/api/prisma/schema.prisma` with no models, infrastructure database
  health port/adapter, and optional technical database dependency status in
  `/health` through explicit non-global module wiring.
- object storage foundation technical slice: infrastructure-only storage health
  port/adapter skeleton, env-driven S3-compatible config boundary, and optional
  technical storage dependency status in `/health` through the same explicit
  non-global module wiring.
- user identity skeleton: shared-kernel actor primitive plus workspace current
  actor resolver port/utility and tests, with no auth/session/provider/API
  implementation and no business authorization.
- global system admin marker: optional `SYSTEM_ADMIN_ACTOR_ID` config plus
  workspace `admin-path` marker utility and tests, with no admin routes, admin
  UI, Prisma model, business access bypass, workspace ownership, share grants or
  auth/session implementation.
- owned workspace baseline: TypeScript-only owned workspace primitive plus
  owner-only access utilities and tests, with no persistence, Prisma model,
  migrations, routes/controllers, frontend UI, sharing, grants or admin bypass.

The backend module skeleton includes module boundaries, README ownership notes,
placeholder tokens/ports, `apps/api/src/ARCHITECTURE.md`, and ESLint import
guardrails. It intentionally does not include business/domain implementation.

The technical status, database foundation and object storage foundation slices
intentionally do not add product screens, domain readiness, business commands,
CRUD APIs, OpenAPI, domain database state, file APIs or real use cases. They
exist only to validate frontend -> backend connectivity, shared types,
env-driven API/storage configuration, Prisma client generation and
infrastructure health boundaries.

GitHub Actions CI is committed at `.github/workflows/ci.yml`. It runs on
`push` and `pull_request` with Node 22, Corepack, `pnpm install
--frozen-lockfile`, and `corepack pnpm ci:check`. It does not require
production secrets, deploy, run AI/OCR, or generate production artifacts.

Local quality command:

```bash
corepack pnpm ci:check
```

The scaffold intentionally does not include:

- AOSR implementation;
- certificates implementation;
- package builder implementation;
- migrations;
- OpenAPI;
- auth implementation;
- login/register/session/cookie/JWT/OAuth implementation;
- admin panel, admin routes/controllers or support tenant browsing;
- uploads, download APIs or business file storage implementation;
- queue workers;
- document generation;
- AI/OCR;
- CRUD APIs;
- domain Prisma models or business database tables;
- business validation or domain logic.

Canonical ADR baseline is now accepted. Future implementation tasks must comply
with canonical ADR 0001-0005 in `docs/adr/`.

Feature coding remains blocked until a separate explicit feature/database/API
task is requested and checked against the ADR baseline, `docs/19` access model
`docs/20` phased plan, and project memory.

Recommended next step: review this Phase 3 owned workspace baseline, then
request a separate, narrow Phase 4 workspace share codes task from `docs/20`.
Domain schema, migrations, AOSR, packages, uploads/file APIs, queues, sharing
codes/grants and AI remain separate explicit tasks.
