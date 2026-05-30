# CONVERSATION_QA_LOG
# PTO ID System
# Consolidated decisions from user/assistant discussion
# Version: 2026-05-28-CANONICAL-ADR-BASELINE

Этот файл фиксирует важные вопросы, ответы и решения, которые появились в переписке и проектной памяти. Его цель — не заменить `PROJECT_MEMORY.md`, а сохранить ход принятия решений.

---

## 1. GitHub / Codex workflow

### Q: Как дать доступ к GitHub и разрешить редактировать/создавать файлы?

A: Были рассмотрены варианты GitHub Connector, публичная ссылка/архив и Codex. Позже выяснилось, что в этой сессии GitHub-коннектор может читать метаданные репозитория `123321neit/pto-id-system`, но запись через него запрещена ошибкой `403 Resource not accessible by integration`.

Решение: использовать Codex как агент, который получает готовые файлы/инструкции через чат и загружает их в репозиторий.

---

## 2. Почему нужен master memory

### Q: Стоит ли загрузить в GitHub полную максимальную инструкцию, чтобы будущие агенты могли читать её и писать программу?

A: Да. Для такого проекта это обязательно, потому что знания иначе разбросаны между чатами, файлами, заметками и задачами Codex. Нужен единый master-файл, который станет “конституцией” проекта.

Решение: создать `docs/PROJECT_MEMORY.md` как главный источник знаний проекта.

---

## 3. Почему Codex не должен сам “собрать всё”

### Q: Откуда Codex возьмёт всю существующую документацию? Он же не знает, о чём мы общались.

A: Верно. Codex видит только репозиторий, текущий diff и текст задания. Он не знает всю переписку и ранее принятые решения, если их нет в файлах.

Решение: сначала ChatGPT должен подготовить консолидированный `PROJECT_MEMORY.md` на основе переписки и загруженных проектных файлов, а Codex должен просто положить файл в репозиторий без изменений.

---

## 4. Главный product decision

### Q: Что является source of truth?

A: Structured data.

Не DOCX, не PDF, не файлы и не Word-шаблоны. DOCX/PDF — только generated artifacts.

Решение зафиксировано как фундаментальное: все документы должны быть восстанавливаемы из structured data.

---

## 5. Registry decision

### Q: Реестр — это отдельный редактируемый документ?

A: Нет.

Реестр — derived projection из данных объекта, компании, сертификатов, актов, схем, комплектов рабочих чертежей и override layer.

Пользователь может менять порядок, скрывать строки, добавлять примечания, выбирать подписанта, но не должен напрямую менять source fields, которые принадлежат другим сущностям.

---

## 6. AOSR color logic

### Q: Какие данные в АОСР заполняются один раз, а какие в каждом акте?

A: Из анализа примера АОСР:

- жёлтый — объектные данные, вводятся один раз на объект;
- зелёный — подписанты/представители, вводятся на объект, но могут переопределяться в документе;
- серый — номер акта, auto numbering;
- фиолетовый — дата акта, по умолчанию текущая, но может массово меняться в папке;
- бирюзовый — переменные данные конкретного акта.

---

## 7. Certificate business rule

### Q: Можно ли просто вписать номер сертификата в акт?

A: Нет, если сертификата нет в библиотеке.

Причина: при package build нечего будет прикладывать. Сертификат сначала должен существовать физически как файл + structured metadata.

---

## 8. Certificate validation by date

### Q: Как проверять просроченный сертификат?

A: По дате документа, а не по текущей дате.

Если документ создан в 2023, а сертификат истёк в 2025, документ остаётся валидным. При создании нового документа с просроченным сертификатом система показывает warning, но не блокирует пользователя.

---

## 9. Final document policy

### Q: Final документ должен быть immutable?

A: Нет.

`final` означает validated published revision, но пользователь может исправлять final-документ. При изменении повышается revision и invalidates package snapshots.

---

## 10. Template versioning

### Q: Можно ли менять шаблон после использования?

A: Нет.

Template versions immutable after use. Если форма изменилась, создаётся новая версия шаблона. Старые документы должны скачиваться в старой форме.

---

## 11. Package Builder

### Q: Как собирается комплект ИД?

A: Автоматически и snapshot-based.

Default order:

1. Реестр;
2. Сертификаты;
3. Акты;
4. Исполнительные схемы.

Пользователь может менять порядок вручную через drag & drop. Package build должен быть async background job.

---

## 12. Executive schemes

### Q: Как хранить исполнительные схемы?

A: Как PDF file + structured metadata. На первом этапе metadata вводятся вручную. Если схема изменилась — создаётся новая сущность/новый файл. Не versioning на старте.

---

## 13. ProjectDrawingSet

### Q: Что такое комплект рабочих чертежей в реестре?

A: Это не исполнительная схема. Нужен отдельный concept `ProjectDrawingSet` для блока “Комплект рабочих чертежей”.

Пример: Вентиляция, 369-2025-02-ОВ, 13 листов.

---

## 14. UX principle

### Q: Как должен ощущаться интерфейс?

A: Пользователь должен ощущать: “я работаю с комплектом исполнительной документации”, а не “я заполняю CRM-таблицу”.

---

## 15. Current operational decision

### Q: Что делать дальше?

A: Сначала положить в репозиторий консолидированные файлы:

- `docs/PROJECT_MEMORY.md`;
- `docs/CONVERSATION_QA_LOG.md`;
- примеры/анализ реестра и АОСР;
- инструкцию для Codex/AI agents.

После этого переходить к `Data Model v1 + Aggregate Boundaries`.

---

## 16. Aggregate boundaries before Database Schema V1

### Q: Какие незакрытые границы нужно формально предложить до физической схемы данных?

A: В `docs/09-aggregate-boundaries-and-invariants.md` зафиксирован draft baseline для ратификации:

- `FolderTree` предлагается как отдельный object-scoped aggregate root, потому что hierarchy, move, duplicate и soft delete имеют самостоятельные инварианты и не должны менять content документов или раздувать `Object`;
- самостоятельный `WorkItem` aggregate root для первого scope не вводится: работа, которую утверждает акт, принадлежит typed `Document` payload, пока не подтверждён shared workflow управления работами между несколькими документами/схемами;
- `ProjectDrawingSet` предлагается как owned entity ограниченного `ObjectDocumentationContext`, потому что это общий basis проектной документации объекта, а не file-backed `ExecutiveScheme` с независимым evidence lifecycle;
- `DocumentLock` остаётся operational lease: heartbeat, expiry и release не являются изменением document content и не создают revision.

Статус решения: draft boundary baseline, требующий подтверждения перед утверждением Database Schema V1. Он конкретизирует, но не изменяет принятые ADR 0001-0005.

---

## 17. Auth, workspaces, invitations and RBAC before Database Schema V1

### Q: Какую tenant/access модель нужно заложить, чтобы системой мог пользоваться и самостоятельный инженер, и организация?

A: В `docs/10-auth-workspace-rbac-model.md` зафиксирован draft access baseline для ратификации:

- пользователь создаёт аккаунт как физическое лицо, а после регистрации автоматически получает полноценный `Personal Workspace` и membership `Owner`;
- `Workspace` конкретизирует tenant boundary: personal и organization workspaces изолируют объекты, документы, evidence, шаблоны, реестры, packages и outputs;
- пользователь может состоять одновременно в нескольких `Organization Workspace`, но membership в одном workspace не даёт доступ к другому и не смешивает данные с personal workspace;
- вступление в organization workspace выполняется через stored `Invite`; ссылка содержит opaque token/reference, а роль, expiration, revocation, usage и email binding определяются сохранённым invite;
- права принадлежат `Membership`, а не `User` напрямую; предложены роли `Owner`, `Admin`, `PTO Engineer`, `Foreman`, `Viewer` и permission matrix;
- invitation/membership changes, sensitive access and workspace-scoped domain actions требуют audit attribution;
- коммерческие entitlement/seat/billing rules должны развиваться отдельно от membership authorization.

Открытыми до ратификации остаются ownership transfer/recovery, multi-use invite policy первого scope, fine-grained object permissions, access/download/privacy rules для originals и персональных данных, cross-workspace transfer/export и commercial lifecycle.

Статус решения на момент создания: draft access and tenant-boundary baseline before Database Schema V1. Обновление 2026-05-29: MVP implementation scope superseded by `docs/19-sharing-and-access-model-v1.md`; role matrix and membership/RBAC governance are deferred, while tenant isolation, auditability and revocation remain mandatory.

---

## 18. Project upload for AI-assisted ID and error checking

### Q: Можно ли загрузить проектную документацию, чтобы AI помогал создавать исполнительную документацию и находить ошибки?

A: Да, как будущий assistant workflow с обязательным human confirmation. В `docs/11-ai-project-ingestion-and-assistance-model.md` зафиксирован draft ingestion baseline:

- проектные PDF, чертежи, спецификации и другие future source materials привязываются к конкретным `Workspace` и `Object`;
- uploaded project documentation служит source material и provenance, но не становится единственным source of truth: активная истина системы остаётся в confirmed structured data и explicit relations;
- AI/OCR может предлагать project references, systems/zones/floors/axes, candidate AOSR/work statements, expected certificates и inconsistency findings только как proposals;
- пользователь подтверждает extracted data и proposed links перед их применением к `ProjectDrawingSet`, typed documents, evidence workflows или package/completeness review;
- AI может предлагать проверки missing certificates, mismatch между работами и drawings, completeness и inconsistencies, но не утверждает ошибку, compliance или документ автоматически;
- project originals, proposals, confirmations and findings требуют tenant isolation, privacy policy, source citation, traceability и audit.

Связи с `ProjectDrawingSet`, document-owned work statement, `AOSR`, `TestAct`, `Certificate` и `ExecutiveScheme` должны сохранять существующие ownership boundaries: проектный файл не становится сертификатом или исполнительной схемой, а AI не переписывает released revisions.

Статус решения: draft AI project ingestion and assistance baseline before Database Schema V1. Он развивает уже принятые правила structured source of truth и assistant-only AI/OCR, поэтому не создаёт новый ADR.

---

## 19. Conceptual Database Schema V1

### Q: Какую первую схему хранения следует спроектировать до Backend/API Architecture?

A: В `docs/12-database-schema-v1.md` создана conceptual Database Schema V1, которая применяет заданные baseline-границы предыдущих спецификаций:

- `Workspace` является tenant boundary, `Membership` является источником прав, а stored `Invite` принимает только opaque token/reference из URL;
- `Object` остаётся ограниченным context root, отдельный object-scoped `FolderTree` владеет hierarchy/placement, самостоятельный `WorkItem` root не вводится, а `ProjectDrawingSet` принадлежит `ObjectDocumentationContext`;
- `Document` хранит typed structured content и immutable released revisions; `AOSRPayload` формализован таблицами content/links/snapshots, а `TestAct` оставлен typed candidate до ратификации concrete forms;
- `Certificate` и `ExecutiveScheme` являются file-backed evidence roots; реестр остаётся derived projection с presentation-only overrides; package строится async и сохраняет immutable snapshot;
- project files, AI extraction proposals и consistency findings разделены от confirmed domain state и требуют tenant-safe human confirmation/audit;
- `FileAsset`, `GeneratedArtifact`, snapshot и activity/audit families фиксируют provenance без превращения outputs в source of truth.

Открытыми перед Backend/API Architecture остаются concrete `TestAct`/AOSR validation scope, evidence/source retention and supersession, invite/ownership/privacy rules, package readiness, AI processing policy, transaction/query boundaries и любая physical database/API implementation.

Статус решения: conceptual schema baseline created at user direction. Новый ADR не создаётся, потому что документ применяет, а не изменяет ADR 0001-0005.

---

## 20. Domain lifecycle, immutability and validation follow-up after Schema V1

### Q: Какие domain/policy правила нужно зафиксировать после review Schema V1 перед Backend/API Architecture?

A: В `docs/13-domain-lifecycle-immutability-validation-v1.md` создан conceptual/storage-neutral follow-up, который закрывает выявленные обязательные V1 policies:

- для `AOSR` и будущих утвержденных `TestAct`/`TechnicalReadinessAct` `final` остается редактируемым только через следующую revision; published revision и historical package snapshots immutable;
- `Certificate` и `ExecutiveScheme` имеют file-backed lifecycle: отсутствующий physical certificate file при выводе номера является `ERROR`, а использованные originals не перезаписываются молча;
- numbering является structured value (`prefix`, `sequence`, `suffix`, `rendered_number`) с object/folder scopes, renumber flow, явным выбором при move и стратегиями при folder clone;
- validation выполняется при draft feedback, finalization, package readiness и build; certificate expiry проверяется по дате документа и дает `WARNING` по baseline;
- `RegistryOverride` допускает presentation/configuration (`hidden`, `sort_order`, `note`, signer/package display config), но не меняет source facts и не скрывает domain errors;
- async `PackageBuild` создает immutable snapshot с dependency manifest; изменения dependency требуют нового build/snapshot;
- AI/OCR сохраняет proposals/findings с citations, confidence, extractor/model/version, created/review status и требует явного accept/reject пользователя;
- `FolderTree` остается business collection boundary, не universal file manager и не owner document lifecycle.

Открытыми остаются concrete first typed forms и blocking fields, evidence/project-source retention и privacy/access details, invitation/RBAC/governance policy, template/rendering/storage/queue choices, AI provider/data-processing rules и physical database/API design.

Статус решения: Schema V1 review follow-up documented for review. `Backend/API Architecture` может начаться только после рассмотрения и принятия `docs/13-domain-lifecycle-immutability-validation-v1.md`; код, SQL, migrations и API этим решением не утверждаются.

---

## 21. Backend/API Architecture V1

### Q: Какую backend/API архитектуру нужно зафиксировать после lifecycle follow-up, не начиная реализацию?

A: По прямому переходу владельца проекта к следующему этапу в `docs/14-backend-api-architecture-v1.md` создан conceptual Backend/API Architecture V1:

- первый backend строится как modular monolith с domain-first boundaries для workspace/object, `FolderTree`, typed documents, evidence, schemes, registry, packages, templates, artifacts, project sources, AI review, validation, search and audit;
- mutations описаны explicit commands, а не CRUD операциями над таблицами; reads описаны как UI-oriented models для реальных экранов ПТО;
- workflow АОСР применяет immutable released revision и новую working revision для исправления final; certificate/scheme originals и package manifest сохраняют historical references;
- package build и artifact generation являются async derived flows; registry rebuild, search indexing и AI proposals допускают eventual consistency без подмены source data;
- validation остается authoritative backend policy: `ERROR` blocks relevant gates, `WARNING` не блокирует по baseline, срок сертификата проверяется по дате акта, а `RegistryOverride` не скрывает ошибки;
- AI/OCR сохраняет citations/confidence/model/version и требует explicit accept/edit/reject; acceptance выполняет обычную domain command;
- каждая command/query строго scoped к workspace membership/object context, с version checks, idempotency and audit requirements.

Открытыми остаются exact command/read-model contracts, concrete first typed forms, permissions/privacy/retention, rendering/storage/queue/AI policy and physical API/database implementation.

Статус решения: conceptual backend/API architecture documented for review. Документ не разрешает production code, scaffold, SQL, migrations, ORM либо выбор stack/provider. Следующий этап после его принятия:

```text
docs/15-api-command-readmodel-contracts-v1.md
```

---

## 22. API Command/Read Model Contracts V1

### Q: Какие application-level contracts нужны после Backend/API Architecture, не переходя к коду или OpenAPI?

A: По прямому переходу владельца проекта в `docs/15-api-command-readmodel-contracts-v1.md` создан conceptual API Command/Read Model Contracts V1:

- все команды имеют workspace/object scope, authoritative actor membership context, expected-version semantics для mutable state и idempotency для duplicate-sensitive intent;
- common results возвращают affected identities, new versions/revisions, validation findings, stale/invalidated outputs, async operation and audit references;
- named errors фиксируют validation, conflict, leakage-safe access, idempotency, async failure, unavailable policy, unsupported type, unsafe override and required-file outcomes;
- typed document, numbering/folder, evidence, registry, package, artifact, AI/OCR and invitation commands описаны через payload/result intent без concrete routes или wire DTO;
- package build, artifact generation, AI/OCR/source processing and indexing представлены как async derived operations, которые не меняют source entities;
- read models собраны для рабочих экранов: editor/pickers/registry/package/validation/artifacts/AI/activity/search, а не как table dumps;
- validation findings сохраняют `ERROR`/`WARNING`, blocking gate, provenance and suggested action; срок сертификата оценивается по дате документа;
- tenant boundary сохраняет `NOT_FOUND_OR_NOT_AUTHORIZED` leakage protection и оставляет fine-grained RBAC отдельным вопросом.

Открытыми остаются конкретные первые typed forms и blocking fields, retention/privacy/RBAC/governance, разрешённый AI/OCR processing scope, template/rendering/storage/queue and physical transport/persistence implementation.

Статус решения: conceptual command/read-model contract specification documented for review. Документ не разрешает production code, backend/frontend scaffold, SQL, migrations, ORM schema, OpenAPI или выбор framework/database/queue/storage/renderer/AI provider. Следующий этап после review:

```text
docs/16-mvp-scope-and-first-forms-v1.md
```

---

## 23. MVP Scope and First Forms V1

### Q: Какой первый реально реализуемый production MVP нужно зафиксировать до выбора стека?

A: В `docs/16-mvp-scope-and-first-forms-v1.md` создан product/MVP-scope документ, который сужает первую delivery до АОСР и минимального end-to-end workflow:

- основной пользователь MVP — инженер ПТО в small/medium construction workflow, одиночно или в small team workspace;
- `AOSR` является mandatory first-class typed form;
- `TestAct` family и `TechnicalReadinessAct` не входят в первую production delivery как generated/finalizable typed forms без отдельной ратификации concrete form/payload/template/validation;
- certificate library MVP обязателен: документы качества имеют physical original file and confirmed metadata, а номер сертификата нельзя просто вписать строкой;
- executive schemes MVP входят как file-backed object evidence with manual metadata;
- folder/numbering MVP ограничен object-scoped folders, simple numbering, explicit renumber, and move with keep/recalculate choice;
- package builder MVP включает registry generation, default ordering, manual ordering, snapshot/release and ZIP/downloadable outputs;
- generated output MVP: AOSR DOCX, AOSR PDF, registry export and ZIP package;
- AI/OCR is not required for MVP; MVP must work fully without AI/OCR; any future AI/OCR remains optional, proposal-only and non-autonomous;
- UX/onboarding decision зафиксирован: first-run guidance, contextual hints/tooltips, empty states, validation explanation and "do not show again" behavior, без перегруза experienced users;
- explicit non-MVP list excludes ERP, procurement, finance, generic task management, advanced approvals, mobile/offline, EDS, template marketplace/editor, AI autopilot, generic document builder, deep analytics and platform features.

Открытыми остаются exact first AOSR template baseline, required participant set, retention/privacy/RBAC/governance details and technology/implementation strategy.

Статус решения: product/MVP scope documented for review. Документ не разрешает production code, backend/frontend scaffold, SQL/migrations/ORM schema, OpenAPI или выбор stack/provider/database/storage/queue/renderer/AI provider. Следующий этап после review:

```text
docs/17-tech-stack-and-implementation-strategy-v1.md
```

---

## 24. Tech Stack and Implementation Strategy V1

### Q: Какой pragmatic technology stack и implementation plan выбрать для MVP, не начиная кодинг?

A: В `docs/17-tech-stack-and-implementation-strategy-v1.md` создан implementation-strategy документ для review перед repository bootstrap:

- frontend direction: React + TypeScript + Vite, React Hook Form, TanStack Query/Table, restrained UI primitives and backend-authoritative validation UX;
- backend direction: TypeScript on Node.js LTS, NestJS modular monolith, HTTP JSON command/query API without CRUD-first or OpenAPI-first implementation;
- database direction: PostgreSQL, controlled JSONB usage, explicit transactions, optimistic versions and immutable snapshots, with Prisma-style TypeScript persistence likely during bootstrap;
- async direction: Redis/BullMQ workers for package builds, generated artifacts, future AI/OCR and indexing;
- file/storage direction: domain-scoped local development storage and S3-compatible production storage, with generic drive abstraction explicitly forbidden;
- document generation direction: DOCX templates rendered from structured data, backend PDF conversion, ZIP generation from immutable package manifests;
- search direction: PostgreSQL relational/full-text/trigram first, semantic/vector search deferred;
- AI/OCR direction: optional, provider-abstracted, async proposal-only and never autonomous;
- implementation milestones: bootstrap, workspace/auth skeleton, file asset foundation, certificate/scheme libraries, AOSR editor, finalization/revision, DOCX/PDF prototype, registry, package builder and pilot polish.

Rejected for MVP:

- microservices first;
- event sourcing;
- premature CQRS split;
- generic low-code/document builders;
- heavy BPM/workflow engines;
- offline-first;
- real-time collaborative editing;
- generic drive/file manager;
- AI-autonomous workflows;
- vector database / Elasticsearch first;
- Kubernetes first;
- browser DOCX editor.

Статус решения: implementation strategy documented for review. Документ выбирает practical stack/direction, но не разрешает production code, backend/frontend scaffold, source folders, package manifests, SQL/migrations/ORM schema, OpenAPI, Docker/CI/deployment files или repository bootstrap.

Следующий этап на момент создания `docs/17`:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

Этот этап теперь выполнен созданием `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`.

Текущий следующий этап:

```text
Review docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

Actual coding/scaffold may begin only after explicit acceptance of `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` and a separate first scaffold task. Feature coding remains blocked until that scaffold is accepted.

---

## 25. Initial Repository Bootstrap and Development Rules V1

### Q: Какие жесткие правила должны стоять между accepted architecture и первым scaffold?

A: В `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` создан final pre-scaffold gate:

- coding/scaffold requires acceptance of docs/18 and a separate explicit first scaffold task;
- first scaffold may include only package/workspace setup, TypeScript baseline, lint/format/test tooling, React/Vite shell, NestJS shell, worker shell, shared config/contracts/domain placeholders and CI checks if requested;
- first scaffold must not include production features, Prisma schema, migrations, OpenAPI, real auth, uploads, queue jobs, storage adapter, AOSR form, generation pipeline, AI/OCR or deployment infrastructure;
- implementation must preserve structured data source of truth, typed AOSR first, no generic CRUD/document builder/file manager, registry derived, async immutable package snapshots, AI proposal-only and workspace isolation;
- docs/16 has implementation precedence over older docs/08 TestAct candidate wording;
- ADR 0001-0005 physical file presence must be verified; later documentation-only corrective step accepted canonical ADR files in `docs/adr/`;
- Foreman active permissions are blocked without separate approval;
- first AOSR template participant requirements must not be hardcoded before template review;
- architecture violation criteria and stop/correct process are defined.

Текущий следующий этап:

```text
Review docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

After acceptance, the next allowed action is a separate explicitly scoped first scaffold task. Feature coding remains blocked until that scaffold is accepted.

---

## 26. Infrastructure Portability / No Server Lock-in Amendment

### Q: Как зафиксировать, что PTO ID System не должен быть жестко привязан к одному серверу, VPS, PaaS, cloud или hosting provider?

A: В `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` добавлено правило Infrastructure Portability / No Server Lock-in:

- deployment provider is replaceable;
- moving server/provider should require configuration, environment changes and storage/data migration, not rewriting domain logic, backend modules, frontend or package generation;
- server-specific assumptions are forbidden in domain/application code;
- database, Redis, object storage, public URLs, file download URL behavior, CORS origins, session secrets and app base URLs must be environment/config driven;
- local/dev/staging/prod must differ by configuration, not code branches;
- S3-compatible storage adapter must hide provider details;
- provider SDKs must not leak outside narrow infrastructure adapters;
- generated artifact links must be resolved through storage/download service, not stored as permanent server-local paths;
- hardcoded absolute server paths, IPs, domains, hostnames, buckets, regions, CDN URLs and provider-specific URLs are forbidden in application code.

Статус решения: documentation-only amendment to docs/18. No code, scaffold, Docker, CI, package manifest, source folders, migrations, OpenAPI or ORM schema were introduced by this amendment.

---

## 27. First Allowed Infrastructure Scaffold

### Q: Что разрешено в первом scaffold task и что фактически начато?

A: Пользователь явно обозначил задачу как `ПЕРВЫЙ РАЗРЕШЕННЫЙ SCAFFOLD TASK` и ограничил её infrastructure/bootstrap scaffold.

Созданная основа включает:

- `pnpm` workspace;
- root TypeScript/ESLint/Prettier/Vitest tooling;
- React + TypeScript + Vite shell in `apps/web`;
- NestJS shell in `apps/api`;
- technical `/health` endpoint only;
- `packages/shared-types` and `packages/shared-config` placeholders;
- typed env/config validation foundation;
- dev/test/prod env example structure without committed secrets;
- local CI-equivalent quality gates;
- guardrails for strict TypeScript, import boundaries and infrastructure portability.

GitHub Actions workflow was prepared during the original scaffold implementation
but could not be pushed with the then-current repository credentials because
GitHub rejected workflow-file changes without `workflow` scope. It was later
added in the accepted scaffold CI task as `.github/workflows/ci.yml`.

Current scaffold CI runs on `push` and `pull_request` with Node 22, Corepack,
`pnpm install --frozen-lockfile` and `corepack pnpm ci:check`. It does not
require production secrets, deploy, run AI/OCR or generate production artifacts.

Важно: это не начало production feature coding.

Still forbidden after scaffold:

- AOSR implementation;
- certificate implementation;
- package builder implementation;
- Prisma schema;
- migrations;
- OpenAPI;
- real auth;
- uploads/storage implementation;
- queue workers;
- document generation;
- AI/OCR;
- CRUD APIs;
- database models;
- domain/business validation and domain logic.

Текущий guardrail после scaffold acceptance:

```text
Request any separate feature/database/API/storage/generation task explicitly and check it against PROJECT_MEMORY and canonical ADR 0001-0005.
```

---

## 28. Canonical ADR Baseline

### Q: Как устранить долг, где документы ссылаются на ADR 0001-0005, но canonical ADR set отсутствовал или был не тем набором?

A: Принят documentation-only corrective step: создан официальный canonical ADR baseline в `docs/adr/`:

- `docs/adr/0001-structured-data-source-of-truth.md`;
- `docs/adr/0002-typed-document-domain-model.md`;
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`;
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`;
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`.

Решение:

- ADR 0001-0005 теперь являются authoritative references для будущей implementation work;
- ADR baseline консолидирует уже принятые решения only;
- future implementation must comply with ADRs;
- no server lock-in, AI proposal-only, derived registry, async package build, workspace isolation, no cross-workspace leakage and no provider SDK leakage are explicit cross-cutting constraints in the ADRs;
- старый non-canonical ADR set заменён, чтобы не оставлять ambiguity по ADR 0004/0005.

Что не разрешено этим решением:

- production feature coding;
- MVP scope changes;
- Prisma schema, migrations, OpenAPI, production API/routes or business implementation;
- storage/queue/generation/AI provider implementation.

---

## 29. Backend Module Architecture Skeleton

### Q: Как ввести canonical backend module boundaries, не начиная feature implementation?

A: Создан backend architecture skeleton в `apps/api/src` для NestJS modular
monolith. Это не feature implementation task и не начало доменной реализации.

Созданы boundaries:

- `shared-kernel` — shared primitives/interfaces only;
- `infrastructure` — provider adapter skeleton/tokens/ports only;
- `workspace` — workspace boundary, membership vocabulary and isolation;
- `documents` — typed documents, revisions and finalization lifecycle boundary;
- `evidence` — certificates, executive schemes and file-backed evidence boundary;
- `registry` — derived projections only;
- `packages` — package builds, snapshots, generated artifacts and async orchestration boundary;
- `ai` — proposals/findings only, no autonomous mutation;
- `health` — technical health endpoint only.

Добавлено:

- `apps/api/src/ARCHITECTURE.md`;
- module-level README files with purpose, ownership and forbidden responsibilities;
- placeholder tokens/ports without implementations;
- ESLint import guardrails against sibling-module leakage, direct infrastructure access from bounded modules, and shared-kernel framework/provider leakage.

Что не было введено:

- no AOSR implementation;
- no Prisma schema or migrations;
- no CRUD APIs or OpenAPI contracts;
- no auth, uploads/storage implementation, DB access, queues/workers, package builder, package generation or AI/OCR implementation;
- no controllers/services with domain behavior;
- no real entities, repositories, use cases, validation rules or business logic.

Next expected step recommendation: create a separate, narrow backend
application skeleton task for workspace/session isolation foundations before any
AOSR, database, storage, queue, package, OpenAPI or AI work.

---

## 30. First Technical Frontend-Backend Status Slice

### Q: Как проверить, что frontend, backend, shared types and CI работают вместе, не начиная продуктовую реализацию?

A: Создан первый маленький technical vertical slice.

Он включает:

- existing technical `/health` endpoint in `apps/api`;
- shared technical `TechnicalHealthResponse` in `packages/shared-types`;
- frontend fetch utility using `VITE_API_BASE_URL`;
- minimal placeholder `Backend status` panel in `apps/web`;
- backend health test and frontend technical health client test;
- lockfile/package reference updates for the frontend shared-types dependency.

Решение:

- `/health` остаётся strictly technical endpoint;
- response scope remains `technical`, service remains `api`, status remains `ok`;
- frontend uses only the technical endpoint and env-driven API base URL;
- no hardcoded production URL was introduced;
- this is not business/domain implementation.

Что не было введено:

- no AOSR implementation;
- no certificates, executive schemes, registry or package builder implementation;
- no auth, database, Prisma schema, migrations, uploads/storage, queues,
  AI/OCR, OpenAPI, CRUD APIs, real use cases or domain entities;
- no domain readiness semantics.

Next expected step recommendation: review this technical slice, then request a
separate, explicitly scoped backend application skeleton task for
workspace/session isolation foundations before any product/domain work.

---

## 31. Database Foundation Technical Slice

### Q: Как добавить database foundation, не начиная доменную схему и бизнес-реализацию?

A: Добавлен технический database foundation slice.

Он включает:

- `apps/api/prisma/schema.prisma` with Prisma `generator` and PostgreSQL
  `datasource` only;
- Prisma Client dependency and `prisma:generate` wiring;
- optional technical `db:check` script;
- infrastructure-only database health utility and Prisma adapter under
  `apps/api/src/infrastructure/database/`;
- technical `/health` response dependency status for database:
  `configured`, `unconfigured`, `ok` or `error`;
- explicit non-global module wiring where `HealthModule` imports
  `InfrastructureModule` for technical health composition;
- frontend technical status parser/display update;
- mocked tests for env/config behavior, DB health utility and health response
  shape.

Решение:

- database remains an infrastructure concern;
- infrastructure is not a global Nest module;
- Prisma Client is confined to infrastructure database adapter code;
- `/health` reports only technical dependency status and does not imply domain
  readiness;
- missing `DATABASE_URL` in dev/test is fail-safe and reported as
  `unconfigured`.

Что не было введено:

- no Prisma models;
- no migrations;
- no Workspace/User/Document/Certificate/AOSR tables;
- no domain repositories;
- no CRUD APIs;
- no business validation or product logic;
- no auth, uploads, business file storage, package builder, registry, certificates or AI/OCR
  implementation.

Next expected step recommendation: review the database foundation technical
slice, then request a separate workspace/session isolation skeleton task before
any domain schema, migrations or business feature implementation.

---

## 32. Object Storage Foundation Technical Slice

### Q: Как добавить object storage foundation, не начиная uploads/evidence/business files?

A: Добавлен технический object storage foundation slice.

Он включает:

- infrastructure-only object storage health utility, port re-export and
  S3-compatible adapter skeleton under `apps/api/src/infrastructure/storage/`;
- env-driven storage config boundary using `OBJECT_STORAGE_ENDPOINT`,
  `OBJECT_STORAGE_BUCKET` and `OBJECT_STORAGE_REGION`;
- config-only runtime health behavior: missing storage config reports
  `unconfigured`, complete config reports `configured`;
- optional mocked adapter path in unit tests for future lightweight checks that
  can report `ok` or `error`;
- technical `/health` response dependency status for storage:
  `configured`, `unconfigured`, `ok` or `error`;
- explicit non-global module wiring where `HealthModule` imports
  `InfrastructureModule` for technical health composition;
- frontend technical status parser/display update;
- mocked tests for storage config behavior, storage health utility and health
  response shape.

Решение:

- storage remains infrastructure-only;
- no storage SDK dependency was added in this slice;
- runtime storage health is config-only to avoid brittle CI/network coupling;
- provider details, endpoint, bucket, region, access keys, provider URLs and
  file paths are not exposed in health;
- domain bounded modules still must not import infrastructure or storage SDKs.

Что не было введено:

- no uploads or downloads;
- no certificate files, executive scheme files, document files, package
  artifacts or generated artifacts;
- no file metadata domain models;
- no file paths persisted;
- no Prisma models or migrations;
- no repositories, CRUD APIs, business validation, AOSR, certificates, registry,
  package builder, auth or AI/OCR implementation.

Next expected step recommendation: review this object storage foundation
technical slice, then request a separate workspace/session isolation skeleton
task before any domain schema, uploads/file APIs, migrations or business feature
implementation.

---

## 33. Owner-based sharing instead of complex RBAC for MVP

### Q: Нужен ли сложный RBAC с Owner/Admin/PTO Engineer/Foreman/Viewer matrix в MVP?

A: Нет. Пользователь принял новое product/architecture direction: сложный RBAC не нужен для MVP. Вместо него фиксируется простая owner-based sharing model в `docs/19-sharing-and-access-model-v1.md`.

Решение:

- `docs/19-sharing-and-access-model-v1.md` supersedes `docs/10-auth-workspace-rbac-model.md` for MVP implementation scope;
- no fine-grained RBAC for MVP;
- no `Foreman` role in MVP;
- no `Owner/Admin/PTO Engineer/Viewer` role matrix in MVP;
- exactly one `Global System Admin` is expected initially and is separate from business collaboration;
- regular users own their workspaces/project data and certificate libraries;
- access is issued by owner through opaque share codes / invite codes;
- accepted code creates persistent resource-scoped share grant;
- default access is view-only;
- capabilities replace roles for grants.

Two sharing flows are distinct:

- workspace collaboration access to a user's workspace/project database;
- certificate library sharing for using shared certificates while preserving provenance.

Mandatory guardrails:

- no cross-workspace leakage;
- default deny when capability is missing;
- owner can revoke grants and rotate/regenerate codes;
- code rotation does not automatically revoke existing accepted grants unless a separate explicit action is designed;
- audit grant creation, acceptance, capability change, revocation and write-capability use;
- certificate file-backed evidence invariant remains;
- source-of-truth, typed documents, registry projection, package snapshots and AI/OCR assistant-only decisions are unchanged.

Статус решения: MVP access architecture amendment. Previous RBAC/membership role governance is deferred, while workspace isolation, auditability and revocation remain mandatory.

---

## 34. Auth sharing implementation plan

### Q: Как безопасно перейти от owner-based sharing model к реализации, не добавив сразу auth, Prisma schema, API routes и сложный RBAC?

A: Создан documentation-only implementation plan:

- `docs/20-auth-sharing-implementation-plan-v1.md`.

Он переводит `docs/19-sharing-and-access-model-v1.md` в phased sequence:

1. User Identity Skeleton.
2. Global System Admin Marker.
3. Owned Workspace Baseline.
4. Workspace Share Codes.
5. Workspace Share Grants.
6. Certificate Library Share Codes.
7. Certificate Library Share Grants.

Решение:

- first implementation should start with authenticated actor identity only;
- system admin marker remains separate from business sharing;
- owned workspace access must exist before share codes;
- share codes must be safe and auditable before accepted grants;
- workspace grants and certificate library grants are separate flows;
- access checks use owner/grant/capability, default deny and leakage-safe errors;
- audit, token/code safety, revocation/rotation and tests are required before sharing write access;
- future Prisma entities and API commands are conceptual only until separate implementation tasks.

Что не было введено:

- no code;
- no Prisma schema or migrations;
- no API routes or OpenAPI;
- no auth/session implementation;
- no sharing implementation;
- no technical slice changes.

Статус решения: implementation planning document only. Next coding recommendation is a separate Phase 1 user identity skeleton task scoped by `docs/20`.

---

## 35. Phase 1 User Identity Skeleton

### Q: Что должно войти в самый маленький первый кодовый шаг auth/sharing, чтобы будущие commands/queries могли говорить “current actor”, но без настоящего auth и без бизнес-доступа?

A: Реализован Phase 1 user identity skeleton only.

Добавлено:

- framework-free `Actor` primitive in `shared-kernel`;
- workspace-owned current actor resolver utility and port;
- fail-closed behavior for missing actor;
- fail-closed behavior for disabled actor;
- tests proving request-body-style `user_id`/role/capability claims are ignored;
- tests proving actor identity has no roles/capabilities and no encoded workspace/document/certificate access.

Решение:

- current actor is resolved only from trusted server-side context abstraction;
- actor identity is attribution/precondition only, not business authorization;
- identity alone does not authorize workspace, document, certificate library, package or file access;
- no old RBAC roles are introduced;
- no system admin marker is implemented yet.

Что не было введено:

- no login/register;
- no password auth, magic links, OAuth, sessions, cookies or JWT;
- no Prisma user table or migrations;
- no API routes/controllers/current-user endpoint;
- no frontend auth UI;
- no workspace creation;
- no share codes, grants or certificate sharing;
- no AOSR/certificate/registry/package business logic.

Статус решения: first narrow implementation slice after `docs/20`. Next phase requires a separate Phase 2 global system admin marker task.
