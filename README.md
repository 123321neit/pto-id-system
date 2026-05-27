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
- `docs/14-backend-api-architecture-v1.md`

## Current next step

На основании lifecycle/immutability/validation follow-up следующим архитектурным этапом подготовлен conceptual Backend/API Architecture V1:

```text
docs/14-backend-api-architecture-v1.md
```

Документ переводит принятые правила в modular-monolith boundaries, explicit domain commands, UI-oriented read models, consistency/versioning/validation boundaries и async flows для комплектов, artifacts и AI proposals. Он сохраняет structured source of truth, file-backed evidence, derived registry и editable-through-revision `final`, не выбирая production SQL, ORM, framework, database, storage, queue, renderer или AI provider.

Текущий следующий этап:

```text
Review docs/14-backend-api-architecture-v1.md; proceed to API Command/Read Model Contracts V1 only if accepted
```

Backend/API Architecture V1 по-прежнему не разрешает coding, backend scaffold, SQL/migrations/ORM schema или выбор инфраструктуры. Следующий документ после успешного review:

```text
docs/15-api-command-readmodel-contracts-v1.md
```
