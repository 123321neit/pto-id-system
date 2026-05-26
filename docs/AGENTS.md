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
Review/ratification of docs/09-aggregate-boundaries-and-invariants.md and docs/10-auth-workspace-rbac-model.md
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

Рекомендованный следующий документ только после ратификации aggregate boundary и auth/workspace/RBAC decisions:

```text
docs/11-database-schema-v1.md
```

До такой ратификации не проектировать физическую БД и API.
