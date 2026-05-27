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
Conceptual Database Schema V1 created in docs/12-database-schema-v1.md; review required before Backend/API Architecture
```

`docs/12-database-schema-v1.md` по прямому заданию применяет baseline decisions из `docs/09-aggregate-boundaries-and-invariants.md` по:

- `FolderTree`;
- `WorkItem`;
- `ProjectDrawingSet`;

Она сохраняет открытыми для review вопросы reusable representative/material boundaries, exact `RegistryOverride` scope, evidence retention and replacement.

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

Следующий архитектурный review должен подтвердить или явно отложить оставшиеся domain/policy choices из Schema V1 перед следующим документом:

```text
Backend/API Architecture
```

До такого review не писать production SQL/migrations, API/backend/frontend implementation и не выбирать инфраструктуру.
