# PTO ID System

Web-система автоматизации исполнительной документации для инженеров ПТО.

Текущий статус:

```text
SYSTEM ARCHITECTURE DESIGN
```

Проект пока не находится на стадии кодинга.

Главный источник знаний проекта:

```text
docs/PROJECT_MEMORY.md
```

Перед любой работой по проекту обязательно прочитать:

- `docs/PROJECT_MEMORY.md`
- `docs/CONVERSATION_QA_LOG.md`
- `docs/AGENTS.md`
- `docs/samples/registry-ventilation-example.md`
- `docs/samples/aosr-example-analysis.md`

Главный принцип:

```text
SOURCE OF TRUTH = STRUCTURED DATA
```

DOCX/PDF/реестры/комплекты являются производными артефактами и должны генерироваться из структурированных данных.

## MVP focus

- ОВиК
- ВК
- российская исполнительная документация
- АОСР
- акты испытаний
- сертификаты
- исполнительные схемы
- реестры
- комплекты ИД

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

## Current next step

Review conceptual Database Schema V1 выявил обязательный follow-up по lifecycle, исторической неизменности, numbering, validation, package determinism и AI review flow:

```text
docs/13-domain-lifecycle-immutability-validation-v1.md
```

Документ сохраняет structured source of truth, file-backed evidence, derived registry и editable-through-revision `final`, оставаясь conceptual/storage-neutral без выбора production SQL, ORM, API или application stack.

Текущий следующий этап:

```text
Review docs/13-domain-lifecycle-immutability-validation-v1.md; proceed to Backend/API Architecture only if accepted
```

До такого review нельзя начинать Backend/API Architecture и тем более считать утверждёнными production database mapping, API contracts, backend/frontend implementation, migrations или инфраструктуру.
