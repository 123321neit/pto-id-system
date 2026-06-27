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

### Q: Являются ли периодическая ИД и итоговая ИД хранимыми бизнес-сущностями?

A: Нет.

Периодическая ИД и итоговая ИД — generated views/packages, которые строятся из текущих документов, реестровых проекций, сертификатов и документов объекта. Период содержит документы, реестр периода и действие `Сформировать периодическую ИД`; объект содержит действие `Сформировать итоговую ИД`.

Формирование всегда использует текущее состояние. Если документы изменились, повторное формирование даёт обновлённый состав. Нельзя вводить `closed period`, `issued`, `locked package` или package persistence как доменные состояния только ради этого UX. Historical ZIP storage, если понадобится, находится вне доменной модели и не становится source of truth.

### Q: Есть ли отдельный объектный реестр ИД?

A: Нет.

В period-first workflow нет standalone object registry как бизнес-сущности или отдельной редактируемой страницы.

Реестр существует только как:

1. `Period registry` — производная проекция документов конкретного периода.
2. `Final registry` — производная проекция документов всех периодов внутри Final ID.

`Periodic ID` строится на period registry. `Final ID` строится на final registry. Оба реестра всегда пересобираются из текущих документов и не хранят собственные editable rows. Будущие типы актов должны попадать в эти реестры через metadata документа (`code`, `title`, etc.), а не через AOSR-only ветвления.

Что не вводится этим решением:

- standalone object registry nav/page/entity;
- editable registry rows;
- closed period status;
- issued/locked package state;
- package or registry persistence;
- backend/API/Prisma/generation behavior.

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
Request any separate feature/database/API/storage/generation task explicitly and check it against PROJECT_MEMORY and accepted ADRs in docs/adr/.
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

Статус решения: first narrow implementation slice after `docs/20`. Historical next phase after this slice was Phase 2 global system admin marker.

---

## 36. Phase 2 Global System Admin Marker

### Q: What is the smallest safe Phase 2 slice after the user identity skeleton?

A: Реализован global system admin marker only.

Добавлено:

- optional deployment/config key `SYSTEM_ADMIN_ACTOR_ID`;
- framework-free workspace `admin-path` utility for checking whether the
  resolved actor is the single configured active global system admin;
- tests for missing config, regular actor denial, configured active actor allow,
  configured disabled actor denial, multiple configured ids rejection and ignored
  client-supplied admin/role/capability claims.

Решение:

- missing admin config means no actor is system admin;
- exactly one admin actor id may be configured;
- disabled/unavailable actor cannot be system admin;
- admin marker is not a role, capability, workspace owner or share grant;
- normal business owner/grant access utilities must not check this marker.

Что не было введено:

- no admin routes/controllers;
- no admin panel or frontend admin UI;
- no support tenant browsing;
- no owner/grant bypass in business flows;
- no workspace access implementation;
- no share codes or grants;
- no Prisma `User`/`SystemAdmin` model or migrations;
- no auth/session/login/register implementation;
- no business API and no RBAC roles.

Статус решения: narrow Phase 2 marker slice after `docs/20`. Historical next
phase after this slice was Phase 3 owned workspace baseline.

---

## 37. Phase 3 Owned Workspace Baseline

### Q: What is the smallest safe Phase 3 slice after the global system admin marker?

A: Реализован owned workspace baseline only.

Добавлено:

- TypeScript-only `OwnedWorkspace` primitive and branded `OwnedWorkspaceId`;
- owner-only access utilities with leakage-safe `NOT_FOUND_OR_NOT_AUTHORIZED`
  denial;
- child-scope guard requiring workspace ownership before document/object/folder
  child lookup;
- tests for owner access, non-owner denial, guessed child ids not resolved
  before ownership verification, missing/disabled actor fail-closed behavior,
  system admin marker not accepted as owner and ignored RBAC role/capability/
  membership claims.

Решение:

- owner id is the only Phase 3 workspace authority;
- disabled or missing actors fail closed through existing current actor
  resolution;
- normal owner checks do not consult `SYSTEM_ADMIN_ACTOR_ID`;
- child ids must not be looked up until workspace owner access is verified;
- old `Membership`/role/capability matrix is not used for authorization.

Что не было введено:

- no Prisma schema changes or migrations;
- no API routes/controllers;
- no frontend UI;
- no auth/session/login/register implementation;
- no share codes or grants;
- no certificate library sharing;
- no admin support tenant browsing or business bypass;
- no AOSR/certificate/registry/package implementation.

Статус решения: narrow Phase 3 skeleton after `docs/20`. Next phase requires a
separate Phase 4 workspace share codes task.

---

## 38. Global Reusable Libraries and Act Snapshots

### Q: Где должны жить переиспользуемые сертификаты, организации и представители, и как защитить уже сформированные акты от будущих изменений справочников?

A: Принято решение: certificates, organizations and representatives are global user-level reusable libraries.

Objects do not own separate copies of those libraries. Objects store links, assignments or bindings to global entities, with object-specific details where needed. The same representative can have different role, position, authority basis/order and organization relation on different objects.

Acts should not accept free-text signatories, organizations or certificates as the final data model. Correct flow:

- search the global library;
- select an existing entity;
- or create a new entity from the search flow;
- newly created entity goes into the global library first;
- then it is linked/assigned to the current object or act.

Уточнение 2026-06-22: это первоначальное snapshot-решение superseded для
active working acts by ADR 0007. Linked acts resolve organization and
representative data live through `ObjectTemplate`; a full snapshot is created
only by an explicit whole-act manual switch. Released revisions/packages
separately freeze exact resolved values. Certificate use remains an explicit
relation to global file-backed evidence and freezes exact identity/values/file
provenance on release.

Certificates are global. Objects do not own certificate libraries. Acts select materials/certificates from the global certificate library, and final ID registries/packages derive used certificates from acts and deduplicate them by referenced certificate identity/provenance.

Статус решения: accepted architecture decision, recorded in `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md` and consolidated into `docs/PROJECT_MEMORY.md`. No backend/API, Prisma/schema/migration, upload, OCR/AI, generation or production business logic was introduced by this documentation step.

---

## 39. Frontend demo wording alignment with ADR 0006

### Q: Как убрать из frontend mock ощущение, что подписанта можно добавить как свободный act-only текст, не реализуя production data model?

A: Выполнена frontend-only корректировка wording/flow в текущем демо.

Решение:

- AOSR signatory creation now uses `Создать представителя и назначение`;
- submit action now uses `Создать и добавить в акт`;
- helper historically explained a global representative, object assignment and
  act snapshot; ADR 0007 later supersedes the automatic snapshot part, so the
  assignment remains live for linked acts;
- the mock no longer exposes the checkbox/mental model of adding a
  representative only to the act versus also keeping it on the object;
- simplified in-memory behavior now creates an object assignment before adding
  the assignment to the current act;
- existing search/select from object representative assignments into the act is
  preserved;
- global organization and representative mock forms no longer use HTML
  `required` attributes;
- empty fields remain allowed, because future print forms should leave
  manual-fill lines instead of blocking saving.

Что не было введено:

- no production data model;
- no real snapshot persistence;
- no backend/API behavior;
- no Prisma/schema/migrations;
- no auth/session;
- no uploads;
- no OCR/AI;
- no DOCX/PDF/ZIP generation;
- no production AOSR business logic.

Статус решения: frontend mock wording and form-behavior alignment only.

---

## 40. Frontend-only period-scoped AOSR creation and numbering foundation

### Q: Как должен работать `Создать документ -> АОСР` в period-first mock до backend/persistence?

A: Выполнен frontend-only in-memory mock.

Решение:

- `Создать документ -> АОСР` создает новый blank AOSR draft только в React
  memory;
- draft назначается в выбранный период;
- draft появляется в списке документов периода;
- draft появляется в AOSR document tree;
- draft appears in the selected period and, after the later period document UX
  cleanup, does not auto-open the editor;
- empty fields are allowed and do not block edit/preview;
- overview/final ID counts update where they derive from the in-memory draft
  list;
- no backend, API, localStorage, Prisma/schema/migrations, upload, OCR/AI,
  DOCX/PDF/ZIP generation or persistence is involved.

Initial frontend-only numbering helper accepted:

- numbering is per document type;
- helper supports global numbering per object or numbering restarted per
  period;
- current AOSR mock mode is global by object;
- current template is `{prefix}{number}{suffix}`;
- current AOSR prefix is `ОВ-`, suffix is empty;
- existing `ОВ-1` and `ОВ-2` produce proposed next number `ОВ-3`;
- create panel shows `Предлагаемый номер: ОВ-3`;
- manual number edit and numbering settings UI are deferred.

Статус решения: frontend mock only. No production AOSR creation, numbering
policy, backend/API behavior, persistence or generation was introduced.

---

## 41. Historical document-default suggestion model (superseded for template-owned data)

### Q: Как должны работать объектовые значения по умолчанию для новых АОСР и существующих документов?

A: Исторически было принято правило:

```text
Параметры по умолчанию -> Предложение -> Самостоятельный документ
```

Object-level values are now described in the UI as `Параметры по умолчанию`.
They are copied into newly created documents as suggestions. They are not live
settings that silently mutate existing drafts.

Решение для frontend mock:

- `defaultUnderTitleText` belongs to the object default parameters;
- a new AOSR draft copies current `defaultUnderTitleText` into document-owned
  `underTitleText`;
- `defaultComplianceStatement` belongs to object default parameters;
- a new AOSR draft copies current `defaultComplianceStatement` into
  document-owned point 6 text;
- existing drafts keep their document-owned values when defaults change;
- the AOSR editor shows `По параметрам по умолчанию` when the document value
  still matches the current default;
- the editor shows `Изменено в документе` when the document value differs;
- each field can be edited directly in the document;
- each field can explicitly restore the current default through
  `Вернуть из параметров по умолчанию`;
- empty values remain allowed.

Future numbering follows the same architecture rule: automatic numbering is a
suggestion, document numbers can be edited or left empty, manual numbers do not
mutate the sequence, existing documents are not automatically renumbered, and
deleted numbers are not reused by default. Numbering settings UI is not
implemented in this sprint.

Статус решения: frontend history only. ADR 0007 later replaced this rule for
template-owned active-act data with strict linked/manual behavior. Individual
act fields and numbering remain act-owned; template-owned values are not copied
as independent per-field defaults and do not support partial overrides.

---

## 42. Historical printable-value snapshot audit (superseded for template-owned data)

### Q: Должен ли Codex ограничиться проектной документацией и порядком организаций, или нужно проверить весь редактор АОСР на live-связи с объектом?

A: Нужно проверять весь редактор и preview. Принцип `Параметры по умолчанию -> Предложение -> Самостоятельный документ` относится не к отдельным полям, а ко всем значениям, которые попадают в печатный документ.

Решение для frontend mock:

- printed object name is stored in the AOSR draft;
- project documentation is stored in the AOSR draft;
- header organization blocks and order are stored in the AOSR draft;
- under-title text and point 6 text remain document-owned;
- printed form title metadata is snapshotted into the draft;
- selected material certificates store printable snapshots in the draft;
- selected object documents store printable snapshots in the draft;
- preview reads these printable values from the selected draft, not from live
  object defaults;
- object defaults remain live only for settings, comparison/status hints,
  explicit restore actions and proposal/search sources.

Статус решения: frontend history only. ADR 0007 supersedes document-owned
copies for active template data. Linked acts resolve through
`ObjectTemplate + libraries`; manual acts use one complete snapshot; released
revisions/packages freeze their own exact output. Certificate and object-file
relations remain explicit act-owned links with release provenance.

---

## 43. Object-template automatic AOSR numbering

### Q: Как должна работать автоматическая нумерация, если пользователь может вручную изменить номер акта?

A: Настройка нумерации принадлежит шаблону объекта. Для АОСР пользователь
выбирает сквозную последовательность по объекту или отдельную
последовательность в каждой папке, а также задаёт префикс и суффикс.

Отображаемый номер не является источником автоматической последовательности.
Для автоматически созданного акта хранится отдельная выданная позиция. Поэтому:

- ручной номер при создании не занимает автоматическую позицию;
- ручная правка номера существующего автоматически пронумерованного акта не
  освобождает и не сдвигает его позицию;
- предыдущие и следующие номера не меняются;
- пустой ручной номер разрешён;
- изменение правила шаблона влияет на предложения для новых актов, но не
  перенумеровывает существующие акты.

Текущая реализация — frontend-only in-memory mock. Backend reservation,
concurrent collision handling, persistence and explicit bulk renumber flow не
реализованы.

---

## 44. Canonical working-act snapshot boundaries

### Q: Когда рабочий акт читает live-данные, а когда хранит snapshot?

A: Действует ADR 0007:

- глобальные организации и представители являются reusable current-data
  sources;
- `ObjectTemplate` хранит ссылки/назначения и object-specific labels, groups,
  order and repeated texts;
- linked act не хранит template snapshot и разрешает текущие значения через
  `global libraries -> ObjectTemplate`;
- только явное переключение всего акта в manual mode создаёт один полный
  `manualTemplateSnapshot`;
- partial template-field overrides запрещены;
- individual act data не переключает template mode;
- certificate остаётся глобальным file-backed evidence relation, а не строкой
  или object-owned copy;
- release фиксирует immutable `DocumentRevisionSnapshot` с exact resolved
  output values and evidence provenance;
- issued package фиксирует immutable `PackageSnapshot` и не читает `latest`
  вместо исторических dependencies.

Поэтому библиотечная правка может обновить active linked preview, но не меняет
manual act, released revision или issued package. Это уточнение документации не
реализует backend/API/schema/persistence/generation.

---

## 45. Dynamic ID folders in the frontend mock

### Q: Папки ИД обязаны быть заранее заданными месяцами или пользователь создаёт их сам?

A: Пользователь создаёт произвольное количество папок и сам задаёт название.

- `Сентябрь 2026` и `Октябрь 2026` являются только seeded demo content;
- folder id больше не ограничен union двух заранее известных значений;
- sidebar и directory читают текущий in-memory folder state;
- пустой объект показывает явный CTA `Создать папку`;
- создание требует непустого отображаемого имени, сразу открывает новую папку и
  не создаёт document автоматически;
- первый документ создаётся отдельно внутри выбранной папки;
- registry/intermediate ID остаются derived views папки;
- итоговая ИД агрегирует документы всех папок.

Это frontend-only in-memory mock. Backend/API, Prisma/schema/migrations,
persistence/localStorage, generation и production folder lifecycle не введены.

---

## 46. Object template UX summary in the frontend mock

### Q: Что нужно пользователю видеть перед редактированием детальных разделов шаблона объекта?

A: Сначала нужно показать компактную сводку самого шаблона и live-chain, чтобы
пользователь понимал, что меняет объектовые данные, а не отдельный акт.

Решение для frontend mock:

- модалка `Шаблон объекта` начинается со сводки
  `Библиотеки -> шаблон объекта -> linked-акты`;
- сводка показывает количество блоков организаций, групп/участников
  представителей и текущий пример номера;
- раздел организаций объясняет, что глобальная организация получает роль,
  порядок и печатный контекст в шаблоне объекта;
- раздел представителей объясняет, что глобальный представитель назначается на
  объект через группу/роль, должность, основание и подстрочный текст;
- linked-акты продолжают читать текущие данные через шаблон объекта;
- manual/released outputs остаются snapshot boundaries согласно ADR 0007.

Это UX/copy/layout step only. Backend/API, Prisma/schema/migrations,
persistence, generation и production template lifecycle не реализованы.

---

## 47. Future backend contract for object template and folders

### Q: Что именно должен зафиксировать следующий backend-контракт перед persistence/API?

A: Нужно зафиксировать conceptual command/read-model contract для уже принятой
модели frontend mock, не реализуя backend.

Контракт зафиксирован в `docs/14-backend-api-architecture-v1.md` и
`docs/15-api-command-readmodel-contracts-v1.md`:

- object workspace uses user-defined ID folders, not fixed month/period enum;
- `read_document_creation_context` is a query-only contract for the
  `Создать документ` selector and does not create a draft or reserve a number;
- `create_document` validates workspace/object/folder/type and creates a
  linked working draft in the selected folder;
- `ObjectTemplate` owns repeated object-level print values, organization
  assignments, representative groups and numbering policy;
- linked acts resolve current printable values through
  `global libraries -> ObjectTemplate`;
- manual mode is one explicit whole-act transition to a complete
  `manualTemplateSnapshot`;
- partial template-field overrides remain invalid;
- final/released documents freeze exact resolved output in immutable
  `DocumentRevisionSnapshot`;
- released packages freeze exact dependencies in immutable `PackageSnapshot`.

Это документационный backend-contract step only. Он не добавляет routes,
controllers, OpenAPI, DTO, Prisma/schema/migrations, SQL, repositories,
persistence, queues, file storage, renderer or production backend code.

---

## 48. First backend slice for document creation context

### Q: Что именно вошло в пункт 5 после фиксации backend contract?

A: Вошёл первый узкий framework-free backend application slice для
`read_document_creation_context`.

Реализовано:

- `apps/api/src/documents/application/document-creation-context.ts`;
- focused backend tests for the creation-context contract;
- explicit access-decision-before-object/section/folder-lookup behavior;
- leakage-safe `NOT_FOUND_OR_NOT_AUTHORIZED` denial;
- support for arbitrary user-defined section and ID folder names;
- approved document type read model;
- selected section/folder and current `SectionTemplate` summary;
- live chain `global_libraries -> section_template -> linked_working_document`;
- ID package scope: intermediate ID by folder, final ID by section;
- proposal-only next number with no reservation and no sequence mutation;
- `documentCreationContextReadPort` token for future canonical wiring.

Не реализовано:

- Nest controller / HTTP route;
- OpenAPI / DTO serialization;
- Prisma schema/model/migration;
- repository or persistence adapter;
- draft creation;
- number reservation;
- frontend integration;
- production AOSR/document creation behavior;
- uploads, storage, queues, renderer or generation.

---

## 49. Section-scoped ID and section template settings

### Q: Если на одном объекте есть вентиляция, отопление, водоснабжение и другие разделы, должны ли они быть папками ИД?

A: Нет. `Вентиляция`, `Отопление`, `Водоснабжение`, `ОВ`, `ВК`, `Система В1`
and similar user names are documentation sections, not ordinary ID folders.

Canonical hierarchy:

```text
Object
  -> DocumentationSection
      -> SectionTemplate / настройки шаблона раздела
      -> ID folders
          -> documents
```

Правила:

- пользователь сам создаёт разделы и задаёт им названия;
- разделы не являются fixed enum;
- пользователь работает внутри выбранного раздела;
- папки ИД создаются внутри раздела;
- промежуточная ИД собирается по папке внутри раздела;
- итоговая ИД собирается по разделу, а не по объекту целиком по умолчанию;
- live template для актов принадлежит разделу и называется
  `Настройки шаблона раздела`;
- future implementation term is `SectionTemplate`, not `ObjectTemplate`;
- linked acts resolve through
  `global libraries -> SectionTemplate -> linked act`.

Шаблон раздела можно копировать в другой раздел того же объекта или вообще в
раздел другого объекта. Копирование переносит:

- repeated template texts;
- numbering policy;
- links/assignments to global organization and representative libraries;
- section-specific labels, roles, ordering, groups and subscripts.

Копирование не переносит:

- папки;
- документы/черновики;
- released revisions;
- manual snapshots;
- issued packages/final ID;
- generated artifacts;
- сами записи глобальных библиотек.

Это architecture/backend-contract correction only. Frontend section UI,
Prisma/schema/migrations, routes/controllers, persistence, template-copy
storage, uploads, generation and production package behavior are still not
implemented.

---

## 50. Frontend-only section workspace UX

### Q: Что появилось в интерфейсе после принятия разделов ИД?

A: Object workspace now has a visible frontend-only section layer:

```text
Object
  -> Раздел ИД
      -> Настройки шаблона раздела
      -> Папки ИД
          -> Документы
```

Добавлено:

- навигация `Разделы ИД`;
- демонстрационные разделы `Вентиляция` и `Отопление`;
- создание пользовательского раздела;
- создание папки внутри выбранного раздела;
- открытие документов и создание АОСР внутри выбранного раздела/папки;
- подписи linked-актов как `По шаблону раздела` в объектном workspace;
- `Настройки шаблона раздела` вместо object-level template wording;
- копирование настроек шаблона раздела в другой demo-раздел;
- итоговая ИД и финальный реестр по выбранному разделу.

Ограничения:

- this is frontend-only in-memory mock behavior;
- no backend route/controller/API was added;
- no Prisma schema/model/migration was added;
- no persistence, repository, template-copy command or localStorage was added;
- cross-object copy is represented as intended UX, not implemented production
  behavior;
- no real package-builder, released snapshot, DOCX/PDF/ZIP generation or number
  reservation exists yet.

---

## 51. Section model architecture cleanup after frontend section UX

### Q: Какие архитектурные замечания после section-scoped frontend commit были устранены?

A: The frontend mock was tightened without adding production features:

- `DemoDocumentationSection` now includes `code`, optional `description` and
  `templateSettingsId`;
- mock folders are now `DemoIdFolder` in `object-id-folders.ts`, not
  `DemoObjectPeriod` in `object-periods.ts`;
- AOSR drafts now carry explicit `sectionId`, `folderId` and
  `sectionTemplateSettingsId`;
- numbering uses `global-section` and `restart-per-folder` scopes;
- numbering helper can receive `sectionId`, so documents from another section
  do not affect selected-section numbering;
- final package helpers now expose section-scoped names:
  `buildSectionFinalPackageModel` and `buildSectionIdPackageOverviewModel`;
- intermediate package helper is named `buildIntermediateIdPackageModel`;
- frontend mock introduced `DemoSectionTemplateSettings` and `SectionTemplate`
  as canonical names, keeping `DemoAosrObjectDefaults` / `objectTemplate` only
  as standalone demo compatibility aliases.

Still not implemented:

- backend/API routes;
- Prisma models or migrations;
- persistence or repositories;
- real cross-object template copy;
- document move between sections/folders;
- number reservation;
- production package-builder, released package snapshots or DOCX/PDF/ZIP
  generation.
