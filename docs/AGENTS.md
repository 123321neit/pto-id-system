# AGENTS.md
# Instructions for Codex / ChatGPT / Cursor / other AI agents

Перед любой работой по проекту PTO ID System агент обязан прочитать:

1. `docs/PROJECT_MEMORY.md`
2. `docs/CONVERSATION_QA_LOG.md`
3. `docs/samples/registry-ventilation-example.md`
4. `docs/samples/aosr-example-analysis.md`

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
Tech Stack and Implementation Strategy V1 documented in docs/17-tech-stack-and-implementation-strategy-v1.md; it requires review before initial repository bootstrap and development rules
```

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

Открытыми остаются review/acceptance docs/17, exact first AOSR template baseline/participant requirements, retention/privacy/RBAC details, exact bootstrap/tooling rules in docs/18, physical migrations/ORM schema/OpenAPI and production implementation.

Следующий архитектурный review должен рассмотреть и принять либо скорректировать:

```text
docs/17-tech-stack-and-implementation-strategy-v1.md
```

Только после его принятия допускается переход к `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`. Coding/scaffold остается заблокированным до принятия и `docs/17`, и `docs/18`; нельзя писать production code, backend/frontend scaffold, source folders, package manifests, SQL/migrations/ORM schema, OpenAPI, Docker/CI или deployment files.
