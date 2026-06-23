# AGENTS.md

# Instructions for Codex / ChatGPT / Cursor / other AI agents

Перед любой работой по проекту PTO ID System агент обязан прочитать:

1. `docs/PROJECT_MEMORY.md`
2. `docs/CONVERSATION_QA_LOG.md`
3. `docs/19-sharing-and-access-model-v1.md`
4. `docs/20-auth-sharing-implementation-plan-v1.md`
5. `docs/adr/0001-structured-data-source-of-truth.md`
6. `docs/adr/0002-typed-document-domain-model.md`
7. `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
8. `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
9. `docs/adr/0005-modular-monolith-and-bounded-contexts.md`
10. `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`
11. `docs/adr/0007-document-defaults-suggestions-and-controlled-updates.md`
12. `docs/adr/0008-section-scoped-id-and-section-templates.md`
13. `docs/samples/registry-ventilation-example.md`
14. `docs/samples/aosr-example-analysis.md`

---

## Hard rules

1. Не начинать кодинг без явного задания пользователя.
2. Не ломать принцип `SOURCE OF TRUTH = STRUCTURED DATA`.
3. Не делать DOCX/PDF source of truth.
4. Не делать реестр standalone editable document.
5. Не делать generic document constructor.
6. Не хранить сертификаты только строками в актах.
7. Не делать Package Builder synchronous.
8. Не делать OCR auto-approve.
9. Не менять template version после использования.
10. Не превращать Object в giant aggregate.
11. Не делать uploaded project documentation или AI result единственным source of truth.
12. Не делать AI/OCR обязательным для MVP.
13. Не раздувать MVP в ERP, ECM, Google Drive, generic builder или enterprise platform.
14. Не нарушать accepted ADR baseline 0001-0007 in `docs/adr/`.
15. Не реализовывать сложный RBAC для MVP: access model первого scope описан в `docs/19-sharing-and-access-model-v1.md`.
16. Не начинать auth/sharing implementation без phased sequence из `docs/20-auth-sharing-implementation-plan-v1.md`.
17. Не делать object-owned certificate/organization/representative libraries.
18. Не принимать free-text signatories, organizations or certificates as final act data.
19. Разрешать изменениям глобальных reusable libraries обновлять только active
    `linked` acts через `SectionTemplate`; не позволять им менять manual acts,
    released revisions или issued packages.
20. Не копировать template-owned defaults в каждый linked act и не создавать
    partial overrides: working act либо полностью `linked`, либо полностью
    `manual` с одним complete snapshot.
21. Не превращать предложенную или автоматическую нумерацию в обязательное ограничение.
22. Не трактовать папки ИД как фиксированный набор месяцев или периодов:
    пользователь задаёт произвольное имя папки, а список папок принадлежит
    выбранному разделу ИД.
23. Не проектировать будущий рабочий шаблон актов как object-level
    `ObjectTemplate`: ADR 0008 переносит его на `SectionTemplate` /
    `настройки шаблона раздела`.
24. Не собирать итоговую ИД по объекту по умолчанию: canonical final ID scope
    is one user-defined documentation section.

---

## Required behavior

Если задача затрагивает архитектурное решение:

- сначала предложить архитектурный план;
- указать риски;
- при необходимости создать/обновить ADR;
- только потом писать код.

Если пользователь просит “быстро сделать MVP”, агент должен проверить, не нарушит ли это master architecture.

---

## Current next step

Текущий этап:

```text
First allowed infrastructure/bootstrap scaffold accepted; canonical ADR baseline accepted; backend module architecture skeleton introduced; first technical frontend-backend status slice introduced; database foundation technical slice introduced; object storage foundation technical slice introduced; auth sharing implementation plan added; user identity skeleton introduced; global system admin marker introduced; owned workspace baseline introduced; future SectionTemplate backend contract documented; document creation context backend contract slice introduced; ADR 0008 section-scoped ID accepted
```

Разрешённый scaffold ограничен:

- `pnpm` workspace setup;
- React + TypeScript + Vite shell in `apps/web`;
- NestJS shell in `apps/api`;
- technical health endpoint only;
- shared placeholder packages;
- strict TypeScript, lint, format, test and build tooling;
- env/config validation foundation;
- local CI-equivalent quality gates.
- canonical `apps/api/src` backend module skeleton:
  `shared-kernel`, `infrastructure`, `workspace`, `documents`, `evidence`,
  `registry`, `packages`, `ai`, and `health`;
- `apps/api/src/ARCHITECTURE.md` with ownership, dependency direction,
  source-of-truth, revision/package, and infrastructure isolation rules;
- ESLint backend import guardrails against sibling module internals,
  direct infrastructure access from bounded modules, and provider leakage.
- first technical vertical slice proving frontend -> backend connectivity:
  placeholder UI status panel, `VITE_API_BASE_URL` API configuration, typed
  shared technical health response and focused tests.
- database foundation technical slice:
  empty Prisma schema with `generator` and `datasource` only, Prisma client
  generation wiring, infrastructure-only database health port/adapter, mocked
  DB health tests and technical `/health` dependency status through explicit
  non-global module wiring.
- object storage foundation technical slice:
  infrastructure-only object storage health port/adapter skeleton,
  S3-compatible env-driven config boundary, mocked storage health tests and
  technical `/health` dependency status through explicit non-global module
  wiring.
- user identity skeleton:
  framework-free `Actor` primitive, workspace current actor resolver
  port/utility and unit tests. It fails closed and grants no business access.
- global system admin marker:
  optional `SYSTEM_ADMIN_ACTOR_ID` config and framework-free workspace
  `admin-path` marker utility. Missing config means no admin; disabled actors
  fail closed; the marker is not a role, capability, workspace owner, business
  access bypass, route, UI, Prisma model or auth/session implementation.
- owned workspace baseline:
  TypeScript-only `OwnedWorkspace` primitive and owner-only access utilities.
  Missing/disabled/non-owner/wrong-scope access returns leakage-safe
  `NOT_FOUND_OR_NOT_AUTHORIZED`; no Prisma model, migration, route/controller,
  frontend UI, share code, share grant, RBAC matrix or system-admin bypass is
  implemented.
- document creation context backend contract slice:
  framework-free `documents` application read contract for
  `read_document_creation_context`. It requires an explicit allowed workspace
  access decision before object/section/folder lookup, supports user-defined
  documentation sections, user-defined ID folders, approved document type
  reads, current `SectionTemplate` summary, section/folder package scope and
  proposal-only numbering. It has no Nest controller, HTTP route, DTO
  serialization, OpenAPI, Prisma model/schema, migration, repository,
  persistence adapter, draft creation, number reservation or production document
  storage.

The technical status, database foundation and object storage foundation slices are not product
implementation. They must not be expanded into domain readiness, АОСР,
certificates, registry, package builder, auth, domain database schema,
uploads, file metadata, download APIs, queues, AI/OCR, CRUD APIs or OpenAPI
without a new explicit task.

`InfrastructureModule` is not global. The current approved import path is
`HealthModule -> InfrastructureModule` for technical health composition only.
Domain bounded modules must not import infrastructure.

GitHub Actions CI добавлен в `.github/workflows/ci.yml`. Он запускается на
`push` и `pull_request`, использует Node 22, Corepack, `pnpm install
--frozen-lockfile` и `corepack pnpm ci:check`. CI не требует production secrets,
не деплоит, не запускает AI/OCR и не генерирует production artifacts.

Local `ci:check` remains the active quality gate.

Feature coding remains blocked. Future implementation tasks must comply with
accepted ADR 0001-0007 in `docs/adr/`.

Запрещено в рамках текущего scaffold:

- AOSR implementation;
- certificates implementation;
- package builder implementation;
- domain Prisma models or migrations;
- OpenAPI;
- real auth;
- admin routes/controllers, admin UI or support tenant browsing;
- uploads, download APIs or business file storage implementation;
- queue workers;
- document generation;
- AI/OCR;
- CRUD APIs;
- business database tables;
- business validation or domain logic.

Следующий guardrail:

```text
Any separate feature/database/API task must comply with accepted ADR 0001-0007
```

Recommended next step: review Phase 3 owned workspace baseline, then request a
separate, explicitly scoped Phase 4 workspace share codes task from
`docs/20`. Do not start AOSR, domain Prisma models, migrations, uploads/file
APIs, queues, package generation, OpenAPI, sharing codes/grants, AI/OCR, or
domain validation without a new task.

`docs/12-database-schema-v1.md` по прямому заданию применяет baseline decisions из `docs/09-aggregate-boundaries-and-invariants.md` по:

- `FolderTree`;
- `WorkItem`;
- `ProjectDrawingSet`;

Она сохраняла открытыми для review вопросы lifecycle, validation, package readiness, reusable representative/material boundaries, exact `RegistryOverride` scope, evidence retention and replacement.

Access model amendment `docs/19-sharing-and-access-model-v1.md` supersedes `docs/10-auth-workspace-rbac-model.md` for MVP implementation scope. MVP access now uses:

- one global system admin, separate from business collaboration;
- regular users owning their own workspaces/project data and certificate libraries;
- opaque share codes / invite codes;
- persistent resource-scoped grants after authenticated acceptance;
- explicit capabilities instead of roles;
- default view-only access and default deny when capability is missing.

Previous membership/RBAC role matrix, `Foreman` active behavior, organization governance and fine-grained RBAC are deferred. Workspace isolation, no cross-workspace leakage, revocation and audit remain mandatory.

Implementation plan `docs/20-auth-sharing-implementation-plan-v1.md` defines
the required future sequence:

1. user identity skeleton;
2. global system admin marker;
3. owned workspace baseline;
4. workspace share codes;
5. workspace share grants;
6. certificate library share codes;
7. certificate library share grants.

No future task should skip ahead to share grants, certificate-library sharing,
Prisma domain models, migrations or routes unless the user explicitly scopes
that phase and its tests.

Current Phase 1 identity skeleton, Phase 2 admin marker and Phase 3 owned
workspace baseline are not auth implementation or product workspace
implementation: no login, register, password auth, magic links, OAuth,
sessions/cookies/JWT, Prisma user model, API routes, controllers, frontend auth
UI, persistent workspace creation, share codes or grants. The admin marker is
admin-path only and must not be checked inside normal business owner/grant
utilities.

Schema V1 отражает ingestion baseline из `docs/11-ai-project-ingestion-and-assistance-model.md` по:

- Workspace/Object ownership of uploaded project files;
- proposal-only AI/OCR processing and user confirmation;
- links to `ProjectDrawingSet`, document-owned work, typed documents and evidence;
- source citations, traceability and audit;

Privacy/data-processing policy, access to project originals and concrete AI processing scope остаются открытыми.

`docs/13-domain-lifecycle-immutability-validation-v1.md` документирует V1 policy по:

- editable-through-revision `final` documents и immutable historical revisions;
- `Certificate`/`ExecutiveScheme` lifecycles и file-backed evidence protection;
- section/folder numbering, renumber, move and folder-clone strategies;
- `ERROR`/`WARNING` gates и certificate validation by document date;
- presentation-only `RegistryOverride`;
- async deterministic package snapshots и dependency manifest;
- proposal-only AI/OCR review flow;
- `FolderTree` as business collection boundary.

`docs/14-backend-api-architecture-v1.md` применяет эти policy на conceptual application/API уровне через:

- modular monolith first и domain-first application modules;
- explicit command families без CRUD-first API;
- UI-oriented read models для АОСР, сертификатов, схем, реестра, комплекта и AI review;
- future `SectionTemplate`, user-defined sections, user-defined ID folders,
  section/folder-scoped document creation, numbering proposal and linked/manual
  АОСР command boundaries;
- atomic revision/snapshot boundaries, eventual derived work, optimistic versioning and idempotency;
- backend-authoritative validation, workspace authorization и async package/artifact/AI flows.

`docs/15-api-command-readmodel-contracts-v1.md` детализирует conceptual contract level через:

- common command envelope, results, named errors and async operation outcome;
- expected-version and idempotency rules для mutable/dangerous commands;
- `SectionTemplate` command/read contracts for repeated section-level print
  values, global-library assignments, manual snapshot transition, template
  copy and section/folder creation context;
- typed document, folder/numbering, evidence, registry, package, artifact, AI/OCR and invite command semantics;
- screen-specific read models and validation finding contract;
- workspace/object authorization scope and leakage protection.

`docs/16-mvp-scope-and-first-forms-v1.md` фиксирует первый product scope:

- АОСР является mandatory first-class typed form MVP;
- `TestAct` и `TechnicalReadinessAct` не входят в первую production delivery как generated/finalizable typed forms без отдельной ратификации;
- certificate library и executive schemes входят как file-backed evidence;
- registry остается derived projection, а package builder собирает snapshot-based outputs;
- generated outputs MVP: DOCX, PDF, registry export and ZIP package;
- onboarding/contextual hints, empty states, "do not show again" and validation explanation UX являются частью MVP;
- MVP must be usable without AI/OCR; AI/OCR остается optional/deferred and proposal-only.

`docs/17-tech-stack-and-implementation-strategy-v1.md` фиксирует practical implementation direction:

- frontend: React + TypeScript + Vite, React Hook Form, TanStack Query/Table, controlled UI primitives and backend-authoritative validation UX;
- backend: TypeScript on Node.js LTS with NestJS modular monolith, command/query HTTP JSON API and domain-first modules;
- persistence: PostgreSQL first, likely Prisma-style TypeScript ORM/query layer after bootstrap, with explicit transactions and controlled JSONB usage;
- async: Redis/BullMQ workers for package builds, DOCX/PDF/ZIP generation, future AI/OCR and indexing;
- files: domain-scoped originals/artifacts in local dev storage and S3-compatible production storage; generic drive abstraction remains forbidden;
- generation: DOCX templates rendered from structured data, PDF conversion in workers, ZIP packages from immutable manifests;
- search: PostgreSQL relational/full-text/trigram first; semantic/vector search deferred;
- AI/OCR: optional, provider-abstracted, async proposal-only and never autonomous.

`docs/18-initial-repository-bootstrap-and-development-rules-v1.md` фиксирует final pre-scaffold gate:

- first coding/scaffold requires explicit acceptance of docs/18 and a separate first scaffold task;
- first scaffold is limited to tooling/app shells/shared config and MUST NOT include production features, Prisma schema, migrations, OpenAPI, real auth/uploads/queue/storage/generation or AI/OCR;
- architecture invariants include structured data source of truth, typed AOSR first, registry derived, package snapshots immutable, AI proposal-only, modular monolith first and no cross-workspace leakage;
- infrastructure portability/no server lock-in is mandatory: provider-specific assumptions, absolute server paths, hardcoded hosts and provider SDK leakage outside infrastructure adapters are forbidden;
- docs/16 has implementation precedence over older docs/08 TestAct candidate wording;
- canonical ADR baseline is accepted and ADR 0001-0007 in `docs/adr/` are authoritative implementation references;
- Foreman active permissions are blocked without separate approval;
- first AOSR template participant requirements must not be hardcoded before template review.

Открытыми остаются exact first AOSR template baseline/participant requirements, retention/privacy/share-grant details, physical migrations/ORM schema/OpenAPI and production implementation. Зафиксированный SectionTemplate contract now has only one narrow framework-free `read_document_creation_context` application slice. It must not be interpreted as approval to implement routes, controllers, DTO serialization, OpenAPI, Prisma/domain schema, migrations, repositories, queues, storage, renderer, draft creation, number reservation or persistence mapping.

Следующий отдельный implementation task должен проверяться против:

```text
accepted ADR 0001-0007 in docs/adr/ and docs/20-auth-sharing-implementation-plan-v1.md when auth/sharing is involved
```

Feature coding остается заблокированным без отдельного явного задания; нельзя писать production features, SQL/migrations/ORM schema, OpenAPI, real auth/uploads/queue/storage/generation, AI/OCR или deployment files без отдельного разрешения.
