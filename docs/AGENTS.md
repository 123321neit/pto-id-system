# AGENTS.md
# Instructions for Codex / ChatGPT / Cursor / other AI agents

Перед любой работой по проекту PTO ID System агент обязан прочитать:

1. `docs/PROJECT_MEMORY.md`
2. `docs/CONVERSATION_QA_LOG.md`
3. `docs/adr/0001-structured-data-source-of-truth.md`
4. `docs/adr/0002-typed-document-domain-model.md`
5. `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
6. `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
7. `docs/adr/0005-modular-monolith-and-bounded-contexts.md`
8. `docs/samples/registry-ventilation-example.md`
9. `docs/samples/aosr-example-analysis.md`

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
14. Не нарушать canonical ADR baseline 0001-0005 in `docs/adr/`.

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
First allowed infrastructure/bootstrap scaffold accepted; canonical ADR baseline accepted; backend module architecture skeleton introduced
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

GitHub Actions CI добавлен в `.github/workflows/ci.yml`. Он запускается на
`push` и `pull_request`, использует Node 22, Corepack, `pnpm install
--frozen-lockfile` и `corepack pnpm ci:check`. CI не требует production secrets,
не деплоит, не запускает AI/OCR и не генерирует production artifacts.

Local `ci:check` remains the active quality gate.

Feature coding remains blocked. Future implementation tasks must comply with
canonical ADR 0001-0005 in `docs/adr/`.

Запрещено в рамках текущего scaffold:

- AOSR implementation;
- certificates implementation;
- package builder implementation;
- Prisma schema or migrations;
- OpenAPI;
- real auth;
- uploads/storage implementation;
- queue workers;
- document generation;
- AI/OCR;
- CRUD APIs;
- database models;
- business validation or domain logic.

Следующий guardrail:

```text
Any separate feature/database/API task must comply with canonical ADR 0001-0005
```

Recommended next step: request a separate, explicitly scoped backend
application skeleton task for workspace/session isolation foundations. Do not
start AOSR, Prisma, migrations, storage/uploads, queues, package generation,
OpenAPI, AI/OCR, or domain validation without a new task.

`docs/12-database-schema-v1.md` по прямому заданию применяет baseline decisions из `docs/09-aggregate-boundaries-and-invariants.md` по:

- `FolderTree`;
- `WorkItem`;
- `ProjectDrawingSet`;

Она сохраняла открытыми для review вопросы lifecycle, validation, package readiness, reusable representative/material boundaries, exact `RegistryOverride` scope, evidence retention and replacement.

Schema V1 также применяет access baseline из `docs/10-auth-workspace-rbac-model.md` по:

- `Workspace` as tenant boundary;
- automatic `Personal Workspace` creation and Owner membership;
- organization membership and invite policy;
- role permission matrix;

Ownership continuity, detailed permissions, cross-workspace copy/transfer/export, audit/evidence privacy and SaaS entitlement details остаются открытыми.

Schema V1 отражает ingestion baseline из `docs/11-ai-project-ingestion-and-assistance-model.md` по:

- Workspace/Object ownership of uploaded project files;
- proposal-only AI/OCR processing and user confirmation;
- links to `ProjectDrawingSet`, document-owned work, typed documents and evidence;
- source citations, traceability and audit;

Privacy/data-processing policy, access to project originals and concrete AI processing scope остаются открытыми.

`docs/13-domain-lifecycle-immutability-validation-v1.md` документирует V1 policy по:

- editable-through-revision `final` documents и immutable historical revisions;
- `Certificate`/`ExecutiveScheme` lifecycles и file-backed evidence protection;
- object/folder numbering, renumber, move and folder-clone strategies;
- `ERROR`/`WARNING` gates и certificate validation by document date;
- presentation-only `RegistryOverride`;
- async deterministic package snapshots и dependency manifest;
- proposal-only AI/OCR review flow;
- `FolderTree` as business collection boundary.

`docs/14-backend-api-architecture-v1.md` применяет эти policy на conceptual application/API уровне через:

- modular monolith first и domain-first application modules;
- explicit command families без CRUD-first API;
- UI-oriented read models для АОСР, сертификатов, схем, реестра, комплекта и AI review;
- atomic revision/snapshot boundaries, eventual derived work, optimistic versioning and idempotency;
- backend-authoritative validation, workspace authorization и async package/artifact/AI flows.

`docs/15-api-command-readmodel-contracts-v1.md` детализирует conceptual contract level через:

- common command envelope, results, named errors and async operation outcome;
- expected-version and idempotency rules для mutable/dangerous commands;
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
- canonical ADR baseline is accepted and ADR 0001-0005 in `docs/adr/` are authoritative implementation references;
- Foreman active permissions are blocked without separate approval;
- first AOSR template participant requirements must not be hardcoded before template review.

Открытыми остаются exact first AOSR template baseline/participant requirements, retention/privacy/RBAC details, physical migrations/ORM schema/OpenAPI and production implementation.

Следующий отдельный implementation task должен проверяться против:

```text
canonical ADR 0001-0005 in docs/adr/
```

Feature coding остается заблокированным без отдельного явного задания; нельзя писать production features, SQL/migrations/ORM schema, OpenAPI, real auth/uploads/queue/storage/generation, AI/OCR или deployment files без отдельного разрешения.
