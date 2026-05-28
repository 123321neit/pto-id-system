# PTO ID System

Web-система автоматизации исполнительной документации для инженеров ПТО.

Текущий статус:

```text
FIRST ALLOWED INFRASTRUCTURE BOOTSTRAP SCAFFOLD ACCEPTED; CANONICAL ADR BASELINE ACCEPTED
```

В репозитории принят первый разрешённый scaffold. Это только infrastructure/bootstrap
foundation: workspace, tooling, app shells, shared placeholders, env/config foundation
and CI quality gates.

Production feature coding remains blocked.

Главный источник знаний проекта:

```text
docs/PROJECT_MEMORY.md
```

Перед любой работой по проекту обязательно прочитать:

- `docs/PROJECT_MEMORY.md`
- `docs/CONVERSATION_QA_LOG.md`
- `docs/AGENTS.md`
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`
- `docs/samples/registry-ventilation-example.md`
- `docs/samples/aosr-example-analysis.md`

Главный принцип:

```text
SOURCE OF TRUTH = STRUCTURED DATA
```

DOCX/PDF/реестры/комплекты являются производными артефактами и должны генерироваться из структурированных данных.

## Canonical ADR baseline

ADR baseline accepted. The canonical ADR files are now authoritative references
for future implementation work:

- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`

Future implementation must comply with these ADRs. They consolidate existing
architecture decisions only and do not permit feature coding.

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
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`

## Current guardrail

На основании Tech Stack and Implementation Strategy V1 и pre-scaffold gate документа:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

создан и принят первый инфраструктурный scaffold.

Scaffold включает:

- `pnpm` workspace root;
- strict TypeScript baseline;
- ESLint, Prettier, Vitest and local CI-equivalent checks;
- `apps/web` React + TypeScript + Vite shell;
- `apps/api` NestJS shell with technical `/health` endpoint only;
- `packages/shared-types` technical placeholder types;
- `packages/shared-config` typed env validation foundation;
- env example files for development, test and production;
- architecture guardrails for import boundaries and infrastructure portability;
- GitHub Actions CI for scaffold quality checks.

GitHub Actions CI is committed at `.github/workflows/ci.yml`. It runs on
`push` and `pull_request` with Node 22, Corepack, `pnpm install
--frozen-lockfile`, and `corepack pnpm ci:check`. It does not require
production secrets, deploy, run AI/OCR, or generate production artifacts.

Local quality command:

```bash
corepack pnpm ci:check
```

The scaffold intentionally does not include:

- AOSR implementation;
- certificates implementation;
- package builder implementation;
- Prisma schema;
- migrations;
- OpenAPI;
- auth implementation;
- uploads/storage implementation;
- queue workers;
- document generation;
- AI/OCR;
- CRUD APIs;
- database models;
- business validation or domain logic.

Canonical ADR baseline is now accepted. Future implementation tasks must comply
with canonical ADR 0001-0005 in `docs/adr/`.

Feature coding remains blocked until a separate explicit feature/database/API
task is requested and checked against the ADR baseline and project memory.
