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
Review/ratification of docs/09-aggregate-boundaries-and-invariants.md, docs/10-auth-workspace-rbac-model.md and docs/11-ai-project-ingestion-and-assistance-model.md
```

`docs/09-aggregate-boundaries-and-invariants.md` имеет статус draft. Перед Database Schema V1 нельзя молча принять draft decisions по:

- `FolderTree`;
- `WorkItem`;
- `ProjectDrawingSet`;
- `RepresentativeProfile`;
- material catalog;
- `RegistryOverride` scope;
- evidence retention;
- RBAC/privacy.

`docs/10-auth-workspace-rbac-model.md` имеет статус draft. Перед Database Schema V1 нельзя молча принять draft decisions по:

- `Workspace` as tenant boundary;
- automatic `Personal Workspace` creation and ownership lifecycle;
- organization membership and invite policy;
- role permission matrix;
- cross-workspace copy/transfer/export;
- audit, evidence access and privacy;
- SaaS entitlement boundaries.

`docs/11-ai-project-ingestion-and-assistance-model.md` имеет статус draft. Перед Database Schema V1 нельзя молча принять draft decisions по:

- Workspace/Object ownership of uploaded project files;
- proposal-only AI/OCR processing and user confirmation;
- links to `ProjectDrawingSet`, document-owned work, typed documents and evidence;
- source citations, traceability and audit;
- privacy/data-processing policy and access to project originals.

Рекомендованный следующий документ только после ратификации aggregate boundary, auth/workspace/RBAC и AI project ingestion/assistance decisions:

```text
docs/12-database-schema-v1.md
```

До такой ратификации не проектировать физическую БД и API.
