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

## Current next step

Следующий архитектурный этап:

```text
Data Model v1 + Aggregate Boundaries
```

Рекомендуемый файл:

```text
docs/06-data-model-v1.md
```
