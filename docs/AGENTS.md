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
Backend/API Architecture V1 documented in docs/14-backend-api-architecture-v1.md; it requires review before API Command/Read Model Contracts V1
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

Открытыми остаются command/read-model field contracts, concrete typed forms/required fields, retention/privacy/RBAC details, template/rendering/storage/queue implementation, AI processing policy/provider и physical database/API transport design.

Следующий архитектурный review должен рассмотреть и принять либо скорректировать:

```text
docs/14-backend-api-architecture-v1.md
```

Только после его принятия допускается переход к `docs/15-api-command-readmodel-contracts-v1.md`. Backend/API Architecture V1 не разрешает писать production code, backend scaffold, SQL/migrations/ORM schema, backend/frontend implementation или выбирать инфраструктуру.
