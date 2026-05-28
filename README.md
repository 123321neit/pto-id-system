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

## Current next step

На основании Tech Stack and Implementation Strategy V1 подготовлен финальный pre-scaffold gate документ:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

Документ фиксирует жесткие правила первого repository bootstrap/scaffold: preconditions, architecture invariants, allowed conceptual structure, backend/frontend/shared package rules, PostgreSQL + Prisma, NestJS, React + Vite + TS, Redis/BullMQ, S3-compatible storage abstraction, CI/dev gates, forbidden shortcuts and architecture-violation criteria.

Текущий следующий этап:

```text
Review docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

Actual coding/scaffold may begin only after explicit acceptance of `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` and a separate first scaffold task. Feature coding remains blocked until scaffold is accepted.
