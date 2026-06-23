# 14. Backend/API Architecture V1

# PTO ID System

# Модульная application/API architecture для подготовки исполнительной документации

Статус: conceptual backend/API architecture specification for review before API Command/Read Model Contracts V1.

Дата фиксации: 2026-05-27.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание: `docs/12-database-schema-v1.md`, `docs/13-domain-lifecycle-immutability-validation-v1.md`, ADR 0001-0007, анализ АОСР и реестра.

Access amendment note, 2026-05-29:

```text
docs/19-sharing-and-access-model-v1.md supersedes role/membership RBAC for MVP implementation scope.
```

Backend/API access design for MVP must use owner-based sharing, share codes and explicit grant capabilities. Any command/read-model language below that assumes `Membership` roles is deferred historical context unless it matches the capability-grant model in `docs/19`.

Object-template amendment note, 2026-06-22:

Backend commands/read models for active acts must follow ADR 0007. Linked acts
resolve template-owned data through global libraries and `ObjectTemplate`;
manual acts own one complete snapshot; released revisions/packages freeze exact
output separately. Older `adopt_company_snapshot` and
`configure_representative_defaults` command names are noncanonical; exact
physical template commands remain deferred to a separate backend contract task.

Этот документ описывает backend как набор доменных application-модулей, команд, read models, validation и consistency boundaries. Он не является разрешением писать production code и не выбирает transport, framework, database, storage, job runner, renderer либо AI/OCR technology.

Неприкосновенные принципы:

- confirmed structured domain data and explicit links are source of truth;
- generated DOCX/PDF/ZIP являются derived artifacts;
- `RegistryProjection` является derived projection, а не editable master record;
- `Certificate` и `ExecutiveScheme` являются file-backed evidence roots;
- исправление `final` документа выполняется только через новую revision;
- released document revisions и released package snapshots immutable;
- AI/OCR results остаются proposals до явного accept/edit/reject пользователем;
- `FolderTree` организует business collection объекта, а не универсальные файлы.

---

## 1. Purpose and Scope

### 1.1 Что утверждает этот документ

Backend/API Architecture V1 утверждает application-level форму системы:

- начать с modular monolith, в котором границы модулей соответствуют PTO workflow и владельцам доменных инвариантов;
- изменять состояние только через explicit commands с авторизацией, validation, audit и version checks;
- предоставлять UI query/read models для экранов объекта, АОСР, выбора сертификатов/схем, реестра, комплекта и AI review;
- отделять атомарные изменения source state от асинхронного формирования derived outputs, поиска и AI/OCR;
- сохранять tenant boundary `Workspace` для каждой команды, проекции, задачи и скачиваемого результата;
- зафиксировать, какие backend boundaries должны быть детализированы следующим контрактным документом.

### 1.2 Чего этот документ не утверждает

Этот документ не утверждает:

- production code, backend scaffold, frontend scaffold или deployment shape;
- SQL, migrations, ORM entities либо physical persistence mapping;
- конкретные HTTP routes, request/response schemas или OpenAPI;
- framework, programming language, database vendor, storage provider, queue technology либо renderer;
- AI/OCR provider, processing jurisdiction, retention/privacy policy либо auto-processing реальных файлов;
- полный fine-grained RBAC, billing, subscription либо entitlement model;
- состав первой финализируемой формы за пределами уже утвержденного typed-document policy.

### 1.3 Связь с Schema V1 и lifecycle policy

`docs/12-database-schema-v1.md` определяет conceptual storage owners и связи: workspace isolation, typed documents, evidence, derived registry, package snapshots, artifacts, sources/proposals и audit.

`docs/13-domain-lifecycle-immutability-validation-v1.md` определяет application policies, которые backend обязан исполнять: editable-through-revision `final`, historical immutability, numbering strategies, validation gates, safe `RegistryOverride`, deterministic async packages и proposal-only AI/OCR.

Настоящий документ не переписывает эти решения. Он отвечает на следующий вопрос: какие модули, команды, read models и consistency boundaries должны применять эти правила, прежде чем проектировать точные API contracts.

---

## 2. Backend Architecture Principles

| Principle | V1 interpretation for PTO ID System |
| --- | --- |
| Modular monolith first | Первый backend проектируется как единое развертываемое приложение с явными модульными ownership boundaries. Будущее разделение возможно только по подтвержденной нагрузке или организационной причине. |
| Domain-first application services | Application operations выражают действия инженера ПТО: финализировать АОСР, подтвердить сертификат, собрать комплект, принять AI proposal. Они не маскируют domain rules за generic repositories. |
| Explicit commands | Каждая mutation имеет намерение, actor, workspace/object context, expected version при необходимости, validation effect, audit outcome и правила idempotency. |
| No CRUD-first API | Нельзя предоставлять интерфейс вида «обновить любую запись/строку/таблицу». Update допустим только как domain command к owning aggregate или working typed content. |
| No generic document builder | Backend обслуживает утвержденные typed documents. АОСР знает материалы, сертификаты, схемы, представителей, дату и номер; произвольный конструктор форм не заменяет этот смысл. |
| No generic file drive | Upload разрешается для конкретной роли файла: certificate original, executive scheme original, project source или template/artifact input согласно будущему contract. `FolderTree` не становится хранилищем произвольных вложений. |
| No hidden artifact mutations | Upload/download/export DOCX/PDF/ZIP не импортирует изменения обратно в structured state. Изменение источника выполняется отдельной командой. |
| No hidden AI mutations | OCR/AI создаёт proposal/finding; только явная пользовательская команда может применить проверенное значение к сертификату, проектной ссылке или typed document. |
| Immutable released evidence trail | Ревизии, package manifests и использованные file/template references нельзя обновлять «по месту» для показа актуальной версии. |
| Practical UI reads | Query side возвращает модели рабочих экранов ПТО, а не нормализованные таблицы для ручной сборки интерфейсом. |

---

## 3. Bounded Backend Modules

Модули ниже обозначают logical application boundaries внутри modular monolith. Это не требование отдельных сервисов, пакетов кода или physical schemas. Один command coordinator может оркестрировать несколько модулей, но owner инварианта остаётся явным.

### 3.1 Identity/Account

| Aspect | Definition |
| --- | --- |
| Responsibility | Идентичность физического пользователя и account lifecycle, необходимый для owner/grant-based доступа в MVP. |
| Owns | Account identity, базовое состояние аккаунта, подтверждение identity согласно будущей auth policy. |
| Does not own | Business resources, grant capabilities, объекты, документы, evidence либо billing. |
| Main commands | `register_account`, `confirm_account_identity`, `disable_account` после отдельной policy; registration инициирует создание personal workspace через согласованную orchestration. |
| Main read models | Current account header, accessible workspace switch context через Workspace/Tenant, identity state needed for invite acceptance. |

### 3.2 Workspace/Tenant

| Aspect | Definition |
| --- | --- |
| Responsibility | Tenant boundary and owner-based sharing/authorization context for MVP. |
| Owns | Owned workspace/resource scope, share codes, accepted share grants, grant capabilities and access audit inputs for MVP. |
| Does not own | Account identity, содержимое объектов/документов, fine-grained RBAC, organization governance or commercial entitlement. |
| Main commands | `create_owned_workspace`, `create_workspace_share_code`, `accept_workspace_share_code`, `rotate_workspace_share_code`, `revoke_workspace_share_grant`, `update_grant_capabilities` after policy. |
| Main read models | Workspace switcher, connected workspaces, owner grant list, share-code state and effective capabilities for subsequent commands. |

### 3.3 ObjectDocumentationContext

| Aspect | Definition |
| --- | --- |
| Responsibility | Рабочий контекст строительного объекта: объект, engineering systems, `ObjectTemplate` assignments, project drawing sets and numbering/template settings. |
| Owns | Object identity/settings, object-template references plus object-specific labels/groups/order/repeated texts, `ProjectDrawingSet` как owned entity and applicable numbering configuration. |
| Does not own | Document revisions, evidence originals, исполнительные схемы, registry projection rows, package snapshots либо project-source AI proposals. |
| Main commands | `create_object`, `update_object_context`, future explicit object-template assignment commands, `create_or_update_project_drawing_set`, `configure_numbering_policy`, `archive_object`. Exact template commands are deferred to the dedicated backend contract step. |
| Main read models | Object dashboard header, object template/settings view, resolved library assignments, drawing-set summary and readiness inputs. |

### 3.4 FolderTree

| Aspect | Definition |
| --- | --- |
| Responsibility | Object-scoped business grouping документов, схем и package views: разделы, участки, периоды и порядок размещения. |
| Owns | Folder nodes, hierarchy, placements, sibling order, business clone/move operation outcome. |
| Does not own | Typed document content/lifecycle, evidence files, package build contents, произвольную файловую библиотеку. |
| Main commands | `create_folder`, `rename_folder`, `move_folder_node`, `move_folder_item` с `keep_numbering`/`recalculate_numbering`, `clone_folder` with strategy, `archive_folder`, `restore_folder`. |
| Main read models | Folder tree/navigation, selected folder document list, clone preview, move/renumber impact preview. |

### 3.5 TypedDocuments

| Aspect | Definition |
| --- | --- |
| Responsibility | Typed act workflow, первым полным примером которого является АОСР: working data, links, number/date, participants, revisions и release lifecycle. |
| Owns | `Document` identity/type/status, working typed content, released revisions, document-owned material/work assertions and links to selected evidence/schemes, revision triggers. |
| Does not own | Certificate/scheme originals, registry rows, generated binaries, package manifests, generic arbitrary document definitions. |
| Main commands | `create_document`, `update_working_document`, `finalize_document`, `revise_document`, `publish_revised_document`, `archive_document`, `restore_document`, `attach_certificate`, `detach_certificate`, `attach_executive_scheme`, `detach_executive_scheme`, `renumber_documents`. |
| Main read models | Document editor view, revision/history view, finalization impact preview, document list status cells and related validation summary. |

### 3.6 EvidenceLibrary

| Aspect | Definition |
| --- | --- |
| Responsibility | Библиотека документов качества: сертификаты, декларации, паспорта и допустимые evidence types с обязательным physical original. |
| Owns | Certificate identity, confirmed metadata, binding to original file identity, confirmation/supersession/archive lifecycle and historical-use protection checks. |
| Does not own | АОСР material usage, generated certificate pages, registry display ordering, AI-extracted value до принятия. |
| Main commands | `upload_certificate`, `confirm_certificate`, `correct_or_supersede_certificate`, `archive_certificate`, `restore_certificate`; участвует в validation команды `attach_certificate`. |
| Main read models | Certificate picker, certificate library/detail view, usage history, expiry-for-document-date indication and supersession history. |

### 3.7 ExecutiveSchemes

| Aspect | Definition |
| --- | --- |
| Responsibility | Исполнительные схемы как подтверждение фактически выполненных работ: file-backed item с structured metadata и связями использования. |
| Owns | Scheme identity, original file reference, title/registration date/number/sheet metadata, confirm/supersede/archive lifecycle. |
| Does not own | `ProjectDrawingSet`, CAD editing, document revision content, package composition либо registry source substitutions. |
| Main commands | `upload_executive_scheme`, `confirm_executive_scheme`, `supersede_executive_scheme`, `archive_executive_scheme`, `restore_executive_scheme`. |
| Main read models | Executive scheme picker/detail view, scheme usage/history, object/folder scheme list and missing-file/readiness state. |

### 3.8 RegistryProjection

| Aspect | Definition |
| --- | --- |
| Responsibility | Вычислять реестр из объекта, frozen/current applicable document revisions, evidence, schemes, drawing set, signer snapshot and safe overrides. |
| Owns | Registry scope/configuration, versioned presentation-only `RegistryOverride`, signer selection/snapshot where output captures it, projection freshness/result references when retained. |
| Does not own | Номер/дату акта, certificate metadata/file, scheme metadata/file, company source facts либо validation truth. |
| Main commands | `configure_registry_override`, `select_registry_signer`, `request_registry_refresh` when retained/cached; source corrections делегируются owning commands. |
| Main read models | Registry preview, row provenance/source navigation, override editor with allowed fields, freshness/readiness indicators. |

### 3.9 PackageBuilder

| Aspect | Definition |
| --- | --- |
| Responsibility | Настраивать состав комплекта ИД, оркестрировать async build и выпускать immutable package snapshots с dependency manifest. |
| Owns | Package configuration/order, build attempts/status/progress/failure, successful immutable snapshots, manifest, release state and current/stale assessment. |
| Does not own | Source document/evidence/scheme content, renderer implementation, queue technology, registry source data. |
| Main commands | `configure_package`, `request_package_build`, `retry_package_build`, `cancel_package_build` if supported later, `release_package_snapshot`, `archive_package`. |
| Main read models | Package builder view, package readiness summary, build progress/failure view, snapshot/download history and stale impact view. |

### 3.10 Templates

| Aspect | Definition |
| --- | --- |
| Responsibility | Управлять families and versions форм для typed documents, registry and package output без выбора rendering engine. |
| Owns | Template identity, immutable-after-use template version, availability/retirement state and object/default binding configuration. |
| Does not own | Generated file bytes, document structured content, конкретный renderer либо arbitrary document builder behavior. |
| Main commands | `create_template_version`, `publish_template_version`, `bind_template_version`, `retire_template_version`; изменение used version запрещается. |
| Main read models | Applicable template picker, binding/settings view, template-version history and affected-output/stale indication. |

### 3.11 GeneratedArtifacts

| Aspect | Definition |
| --- | --- |
| Responsibility | Регистрировать generation requests/results для DOCX/PDF/ZIP и их provenance/freshness, сохраняя derived-only nature. |
| Owns | Artifact request/status, generated output identity, exact source revision/template/projection/snapshot references, stale/retained marker and access metadata to be specified later. |
| Does not own | Source content, evidence original lifecycle, renderer/storage vendor, импорт ручных правок exported DOCX/PDF. |
| Main commands | `request_generated_artifact`, `mark_generation_succeeded`, `mark_generation_failed`, `mark_artifact_stale`, `retain_released_artifact` as internal application outcomes. |
| Main read models | Generated artifacts/download history, artifact status/provenance detail, stale/retained output badges. |

### 3.12 ProjectSourceIngestion

| Aspect | Definition |
| --- | --- |
| Responsibility | Принимать project source files объекта для reference/provenance и будущей обработки, не превращая их в confirmed project/document facts. |
| Owns | Uploaded source identity, workspace/object scope, source classification after explicit confirmation, source provenance/reference lifecycle. |
| Does not own | `ProjectDrawingSet` confirmed fields, certificate/executive scheme identity, AI findings, document content либо cross-workspace sharing. |
| Main commands | `upload_project_source_file`, `classify_project_source`, `supersede_project_source_file`, `archive_project_source_file`, `request_source_processing` through AI module. |
| Main read models | Object source-file library, source detail/citations view, source processing state and link provenance view. |

### 3.13 AIReviewProposals

| Aspect | Definition |
| --- | --- |
| Responsibility | Управлять async extraction/findings и обязательным human review до применения к domain owner. |
| Owns | Assistance request/run status, proposal/finding, citations, confidence/explanation, processing identity/version, review decision and staleness. |
| Does not own | Confirmed certificate/document/project values, formal domain validation findings автоматически, privacy/provider policy еще до её утверждения. |
| Main commands | `create_ai_processing_request`, `create_ai_proposal`/`create_ai_finding` as async results, `review_ai_proposal`, `accept_ai_proposal`, `edit_and_accept_ai_proposal`, `reject_ai_proposal`, `dismiss_ai_finding`, `mark_ai_proposal_stale`; acceptance dispatches a normal owner command. |
| Main read models | AI review queue, proposal comparison/review view, source citation view, processing history and accepted-result provenance. |

### 3.14 Validation

| Aspect | Definition |
| --- | --- |
| Responsibility | Исполнять explainable domain policies для draft feedback, finalization, package readiness, build и release. |
| Owns | Validation rule vocabulary/evaluation outcome contract and gate decisions; retained summaries associated with releases/builds where required. |
| Does not own | Исправление source data, AI suggestions as facts, UI-only hiding of findings либо customer-specific rules до утверждения. |
| Main commands | `request_document_validation`, `request_package_readiness_validation`; synchronous gate invocation внутри `finalize_document`, `request_package_build` and `release_package_snapshot`. |
| Main read models | Validation panel, finalization blockers/warnings, package readiness report, finding provenance and acknowledgement context. |

### 3.15 Search/Indexing

| Aspect | Definition |
| --- | --- |
| Responsibility | Давать tenant-safe поиск по объектам, актам, сертификатам, схемам и допустимым metadata, допускающий eventual updates. |
| Owns | Derived searchable representation/index freshness and query result composition, after search scope/privacy is defined. |
| Does not own | Domain truth, original-file visibility permissions, validation, OCR text exposure by default. |
| Main commands | `request_reindex`/`mark_search_source_changed` as internal eventual operations; user search itself is query. |
| Main read models | Search results with object/type/status/freshness context and links to authoritative screens. |

### 3.16 Audit/Activity

| Aspect | Definition |
| --- | --- |
| Responsibility | Фиксировать attributable business activity and security-relevant outcomes across workspace operations. |
| Owns | Append-oriented activity/audit events and references to actor membership, target, command/result and provenance. |
| Does not own | Domain entity state, extensive sensitive contents in logs, operational telemetry retention before policy. |
| Main commands | `record_activity_event` as application outcome for commands/jobs; audit records are not user-editable mutation targets. |
| Main read models | Activity/audit feed for workspace/object/document/package and trace from proposal/build/revision to actor/outcome. |

### 3.17 Cross-module orchestration rule

Команда может затрагивать несколько owners, но не размывает ownership. Например, `finalize_document` принадлежит `TypedDocuments`, invokes authoritative `Validation`, фиксирует release/audit, после успеха сообщает `RegistryProjection`, `PackageBuilder`, `GeneratedArtifacts` and `Search/Indexing` об изменении. Она не позволяет этим derived modules переписать released content.

---

## 4. API Style

API в этом документе означает application contract независимо от будущего transport.

| Rule | Consequence |
| --- | --- |
| Command/query separation | Mutations выражаются commands; reads получают специально собранные read models и не изменяют состояние. |
| REST-like URLs допустимы | Resource-oriented location может помочь навигации, но mutation именуется намерением: finalize, revise, confirm, supersede, build, release, accept/reject proposal. |
| No raw table CRUD | Клиент не отправляет «update registry row», «patch package snapshot» или «create arbitrary file record». Он вызывает команду владельца доменного смысла. |
| UI-optimized reads | Editor получает payload, links, revision/version and validation; certificate picker получает пригодность к конкретной дате документа; package screen получает readiness/build status. |
| Idempotency on dangerous commands | Upload completion, finalization, release, package build request, invitation acceptance and AI proposal acceptance require duplicate-safe behavior. |
| Optimistic concurrency | Commands, изменяющие mutable aggregate/configuration, проверяют ожидаемую версию; конфликт не замалчивается last-write-wins. |
| Server-side authority | UI может предварительно показывать ошибки и impacts, но только backend решает authorization, domain validation, version conflict, release/build acceptance and tenant scope. |
| Explicit async contracts | Build, generation, indexing и AI processing возвращают operation identity/status, а не притворяются завершившимися synchronous save. |
| Scoped identity | Every command/query carries or derives authoritative workspace context; ids не дают доступа вне membership boundary. |

В следующем документе потребуется определить command payload/result semantics и read-model fields. Список HTTP endpoints до этого не нужен и не должен подменять domain design.

---

## 5. Core Command Families

Command families ниже фиксируют intent, owner и обязательный effect. Они не являются перечнем URLs или wire payloads.

### 5.1 Typed document lifecycle

| Command family | PTO intent | Required backend effect |
| --- | --- | --- |
| `create_document` | Создать новый АОСР либо другой утвержденный typed act в объекте/папке. | Проверить workspace/object/folder/type, создать `DRAFT` identity and working state; type immutable. |
| `update_working_document` | Сохранить введенные work/material/participant/date/number values черновика. | Version-check working state, сохранить structured content, дать draft validation feedback; не создать release. |
| `finalize_document` | Опубликовать готовый акт для реестра/комплекта. | Атомарно выполнить finalization validation и создать immutable released revision только без `ERROR`. |
| `revise_document` / `publish_revised_document` | Исправить уже final АОСР и позднее опубликовать исправление. | Создать новую working revision, сохранить old released revision, invalidate affected current outputs; новая публикация проходит полный gate. |
| `archive_document` / `restore_document` | Скрыть документ из текущей работы или вернуть. | Не уничтожать historical revisions/package references; проверить access and lifecycle conflict. |

### 5.2 Evidence and scheme links from documents

| Command family | PTO intent | Required backend effect |
| --- | --- | --- |
| `attach_certificate` / `detach_certificate` | Привязать документ качества к материалу АОСР либо снять связь. | Изменить only working document relation; проверить same workspace, confirmed evidence/file availability; final edit follows revision rule. |
| `attach_executive_scheme` / `detach_executive_scheme` | Указать схему как приложение/подтверждение акта. | Изменить only working document relation; `AVAILABLE` file-backed scheme required at final gate. |

### 5.3 EvidenceLibrary lifecycle

| Command family | PTO intent | Required backend effect |
| --- | --- | --- |
| `upload_certificate` | Добавить PDF/файл сертификата, декларации или паспорта. | Создать file-backed unconfirmed evidence item в workspace; no automatic active metadata. |
| `confirm_certificate` | Проверить metadata и разрешить выбор в актах. | Зафиксировать confirmed user-reviewed metadata and attribution. |
| `supersede_certificate` | Заменить документ качества для будущего применения. | Создать explicit replacement path; сохранить previously referenced original/file and history. |
| `archive_certificate` / `restore_certificate` | Убрать из active picker/вернуть. | Не нарушить released links/snapshots; physical removal outside V1. |

### 5.4 ExecutiveScheme lifecycle

| Command family | PTO intent | Required backend effect |
| --- | --- | --- |
| `upload_executive_scheme` | Добавить фактическую исполнительную схему объекта. | Создать scheme with physical original in object scope and draft metadata. |
| `confirm_executive_scheme` | Сделать проверенную схему доступной для акта/комплекта. | Confirm required metadata/file and reviewer attribution. |
| `supersede_executive_scheme` | Зафиксировать новую версию фактической схемы для будущего использования. | New file-backed item/replacement reference; old referenced original remains. |
| `archive_executive_scheme` / `restore_executive_scheme` | Управлять active selection. | Сохранить historical use and package reproducibility. |

### 5.5 Folder and numbering workflow

| Command family | PTO intent | Required backend effect |
| --- | --- | --- |
| `move_folder_item` with `keep_numbering` | Переместить акт между business folders без смены номера. | Атомарно изменить placement; content/revision не изменяются при отсутствии иных правок. |
| `move_folder_item` with `recalculate_numbering` | Переместить акт и применить numbering policy новой папки. | Validate collision; изменить working content либо начать final revision; invalidate outputs where relevant. |
| `clone_folder` with numbering strategy | Скопировать период, например `Октябрь -> Ноябрь`. | Создать new draft document identities with `copy`, `continue` or `reset` strategy; не копировать published status/history. |
| `renumber_documents` | Массово упорядочить номера актов. | Preview impacts/collisions, require confirmation, apply explicit document changes; final documents get new working revisions. |

### 5.6 Validation, registry, package and generated output

| Command family | PTO intent | Required backend effect |
| --- | --- | --- |
| `request_validation` | Проверить черновик, finalization readiness или package readiness. | Evaluate authoritative domain policy for requested scope; return explainable findings/gate outcome. |
| `configure_registry_override` | Изменить порядок, видимость допустимой строки, note или signer выбора реестра. | Version-check configuration; reject source-field substitutions and error suppression; mark affected current output stale. |
| `request_package_build` | Собрать комплект ИД из выбранного состава. | Validate readiness, freeze intended inputs for attempt, start async operation; source aggregates remain unchanged. |
| `release_package_snapshot` | Выпустить успешно собранный комплект. | Authorize and gate release; atomically mark exact immutable built snapshot released/retained with warning context where applicable. |
| `request_generated_artifact` | Получить DOCX/PDF акта либо output реестра/комплекта. | Pin source revision/template/context and start generation; never write artifact back into sources. |

### 5.7 Source ingestion and AI/OCR review

| Command family | PTO intent | Required backend effect |
| --- | --- | --- |
| `upload_project_source_file` | Загрузить проектный PDF/чертеж/спецификацию к объекту. | Retain scoped original/reference; не создавать confirmed drawing/document facts. |
| `create_ai_processing_request` | Попросить extraction либо поиск возможных несоответствий. | Start authorized async operation only under later approved processing policy; outputs are proposals/findings. |
| `create_ai_proposal` / `create_ai_finding` | Зафиксировать async результат извлечения или проверки для review. | Create `PENDING` advisory result with citation/confidence/model/version provenance; confirmed structured state не меняется. |
| `review_ai_proposal` | Открыть proposal с source citation and confidence. | Query/review state only unless explicit decision sent. |
| `accept_ai_proposal` / `edit_and_accept_ai_proposal` | Применить проверенное предложение. | Атомарно record decision and dispatch ordinary domain command with its validation/version/revision consequences. |
| `reject_ai_proposal` / `dismiss_ai_finding` | Отклонить suggestion. | Record review outcome; confirmed structured state unchanged. |

### 5.8 Membership and roles

| Command family | PTO intent | Required backend effect |
| --- | --- | --- |
| `invite_member` | Пригласить коллегу в organization workspace. | Store offer/role/expiry/revocation rules server-side; ссылка не несет trusted authorization. |
| `accept_invite` | Вступить в workspace. | Atomically validate invite and create/activate membership idempotently. |
| `revoke_invite` | Отозвать неприемлемое/неактуальное приглашение. | Prevent later acceptance; retain audit outcome. |
| `change_membership_role` | Сменить полномочия участника. | Enforce future governance/owner safety; affect only target workspace; record audit. |

---

## 6. Read Model Families

Read models являются query contracts для задач пользователя, а не отражением storage tables.

| Read model | Primary user task | Must combine/show |
| --- | --- | --- |
| Workspace switcher | Переключиться между личной и организационными областями. | Membership role/status, workspace display/status, pending invitation signals without cross-tenant content. |
| Object dashboard | Оценить состояние объекта. | Folder/document/package summary, validation warning/error counts, latest activity, source/AI pending review indicators. |
| Folder tree/document list | Работать с разделами и актами по периоду/системе. | Hierarchy/placement, typed document number/date/status/revision/stale markers, schemes/packages and permitted actions. |
| Document editor view | Заполнить или исправить АОСР. | Working typed content, latest released revision identity, expected version, numbering, participants, material/evidence links, schemes, template choice, autosave/lock context later and validation. |
| Certificate picker | Выбрать подтверждающий документ для материала. | Confirmed physical-file availability, issuer/number/coverage, applicability indication evaluated against current document date, usage/superseded/archive state. |
| Executive scheme picker | Добавить фактическую схему к акту/комплекту. | Scheme metadata/file readiness, object/system context, usage and supersession status. |
| Registry preview | Просмотреть формируемый реестр. | Projection blocks, source provenance per row, override version, signer selection, validation/readiness/staleness; edits route to owners or allowed override command. |
| Package builder view | Собрать и выпустить комплект. | Selected documents/evidence/schemes/registry, order, readiness, exact current/latest snapshot state, build progress/failure and stale reasons. |
| Validation panel | Исправить ошибки до публикации/сборки. | `ERROR`/`WARNING`, rule explanation, affected source/navigation, gate scope and allowed acknowledgement where policy permits. |
| Generated artifacts/download history | Скачать нужный output и понять его актуальность. | Artifact kind/status, exact revision/snapshot/template provenance, available/stale/retained marker, generation failure/retry context. |
| AI review queue | Проверить извлеченные AI/OCR значения и findings. | Pending/stale proposals, source citation, proposed vs existing values, confidence/model/version provenance and explicit accept/edit/reject actions. |
| Activity/audit feed | Объяснить, кто и что изменил. | Actor membership, command/outcome, object/target, revision/build/proposal references and time; sensitive contents minimized. |
| Search results | Быстро найти акт, сертификат или схему. | Tenant-filtered result kind/object/folder/status, authoritative destination, staleness/index recency indication if needed. |

---

## 7. Transaction and Consistency Boundaries

### 7.1 Что должно быть atomic

| Operation | Atomic requirement |
| --- | --- |
| Create document | Document identity, initial working typed state and permitted placement создаются согласованно либо не создаются. |
| Finalize document | Проверка version/gate и создание immutable released revision с обновлением latest release/status выполняются как одна authoritative transition. |
| Edit final / begin revision | Создание новой working revision и фиксация факта unpublished changes выполняются без перезаписи старой release; invalidation notices may follow eventual delivery. |
| Accept invite | Проверка действительности stored invite, consumption rule and membership creation не допускают повторного/противоречивого доступа. |
| Confirm/supersede evidence | Новое confirmed/supersession state не может появиться без retained original reference and historical protection decision. |
| Configure override | New override version is committed as one presentation configuration; no partial row ordering that silently changes source data. |
| Successful package snapshot creation | После успешного resolve/build immutable manifest, included outputs and snapshot identity фиксируются согласованно. |
| Release package snapshot | Release decision касается exact already-built immutable snapshot and retained output references; no mutable latest lookup. |
| Accept AI proposal | Review decision и resulting normal domain command должны быть связаны: предложение не считается applied без validated owner mutation. |

### 7.2 Что может быть eventual

| Process | Why eventual is acceptable | Constraint |
| --- | --- | --- |
| Registry projection rebuild/cache | Реестр derived and rebuildable. | UI должен видеть freshness/stale marker; final/package gate resolves authoritative dependencies. |
| Package build execution | Generation/merge/files may be long-running. | Snapshot appears only after successful resolved manifest; source state not mutated. |
| Generated artifact creation | DOCX/PDF/ZIP generation is derived work. | Request pins source inputs; output failure does not lose source truth. |
| Search index update | Search serves discovery, not publication truth. | Tenant isolation and link to authoritative state обязательны. |
| AI/OCR processing and proposal generation | Это assistance workflow. | No confirmed mutation until explicit user command. |
| Activity feed presentation refresh | Audit write accompanies command; feed materialization may lag. | Critical command result must return authoritative outcome without waiting for feed UI. |
| Stale notification propagation | Multiple derived views may need refresh. | A build/release command re-evaluates readiness, so stale propagation lag cannot permit invalid release. |

### 7.3 Required workflow examples

- Finalizing an АОСР creates its immutable released revision atomically; generated PDF may follow asynchronously from the pinned revision/template.
- Editing a final АОСР starts a new working revision and invalidates current package suitability; old revision and released package remain intact.
- A package build is asynchronous; successful snapshot creation with resolved manifest is atomic at completion, and release is an explicit later command.
- Registry projection can be recalculated from owning sources and an exact override version; it is never edited as a source table.
- Search indexing is eventual and cannot be used as evidence that a certificate or release exists.
- AI proposals and findings are eventual and advisory until reviewed.
- Generated artifact creation is eventual and cannot mutate document/evidence source data.

---

## 8. Concurrency and Versioning

| Concern | V1 backend rule |
| --- | --- |
| Optimistic locking | Mutable domain/configuration commands carry expected aggregate/configuration version; stale write returns conflict with current reference for re-read. |
| Document working revision version | Draft edits, attachment changes, numbering and corrections target one current working state version. Autosave may be specified later but cannot overwrite a newer accepted edit silently. |
| Published revision immutability | Released revision cannot be PATCHed, re-finalized in place or altered by registry/package/artifact work. Correction creates next working/released revision. |
| Evidence file reference freeze | Certificate/scheme original referenced by released revision or package manifest stays identifiable and retained; replacement supplies a new explicit reference for future use. |
| Package snapshot manifest immutability | Successful snapshot manifest and included order/files are fixed; `RELEASED` adds release meaning/retention, not permission to alter contents. |
| Registry override version | Every meaningful configuration change creates a version visible to projection/build; historical output names the exact used version. |
| Template version | Used template version is immutable; a changed form is a new version and may make current desired output require regeneration. |
| Stale markers | Documents with unpublished changes, projections/artifacts built from older sources and packages affected by changed dependencies expose stale/rebuild-required markers. Marker changes do not rewrite historical contents. |
| Locks UX | Editing lock acquisition, heartbeat, override experience and conflict presentation remain later frontend/API-contract detail, subject to optimistic version authority and ADR 0004 no-history-rewrite rules. |

Concurrency policy does not turn document editing into collaborative realtime editing. The baseline remains one controlled working edit path with explicit conflict handling and immutable release history.

---

## 9. Validation Architecture in Backend

### 9.1 Validation as domain policy

`Validation` является backend domain policy service, а не UI helper. UI can preview findings, but publication/build decisions invoke authoritative current rule evaluation inside command handling.

| Validation scope | Purpose | Gate rule |
| --- | --- | --- |
| Draft validation | Дать инженеру раннюю обратную связь при заполнении АОСР, выборе сертификата/схемы и номера. | Draft может быть сохранён с `ERROR`/`WARNING`; finding visible. |
| Finalization validation | Проверить exact working revision перед публикацией документа. | Any relevant `ERROR` blocks released revision; warnings remain visible/captured according to contract. |
| Package readiness validation | Проверить selection/order, final document revisions, evidence originals, schemes, registry configuration and templates до/во время build request. | Blocking errors prevent release-ready build flow; no override bypass. |
| Build/release validation | Проверить resolved manifest/files/artifacts at actual build completion and release decision. | Missing/inconsistent dependency fails or blocks release; exact outcome recorded with snapshot. |

### 9.2 Error and warning semantics

- `ERROR` означает нарушение domain invariant или невозможность подтвердить обязательный source/file/dependency; он блокирует релевантную finalization/build/release operation.
- `WARNING` означает объяснимый риск, который baseline позволяет принять; он не блокирует автоматически и может требовать later acknowledgement policy.
- AI/OCR finding не становится domain `ERROR` или `WARNING` сам по себе; formal rule evaluates confirmed data.
- `RegistryOverride` cannot suppress an `ERROR`, превратить draft в final или скрыть required evidence для обхода readiness.

### 9.3 Required PTO validation examples

| Case | Baseline outcome |
| --- | --- |
| АОСР выводит номер сертификата без связанного confirmed certificate original | `ERROR`. |
| В комплект включена схема без retained physical original | `ERROR`. |
| АОСР с отсутствующим required typed field после утверждения формы | `ERROR`. |
| Package выбирает draft либо unpublished changed document вместо required release | `ERROR`. |
| Certificate expired relative to the document date of the referring АОСР | `WARNING` under current baseline. |
| Certificate expired today but was valid on historical document date | Не становится ошибкой только из-за текущей даты. |
| New template version exists while selected released revision intentionally uses frozen old version | `WARNING` or informational indicator according to later contract, not silent migration. |

Критическое правило:

```text
certificate expiry is evaluated against document date, not current date
```

---

## 10. Package Build Backend Flow

`PackageBuilder` поддерживает практический workflow комплекта ИД: реестр, сертификаты, акты и исполнительные схемы с пользовательским ordering.

| Step | Backend action | Required guarantee |
| --- | --- | --- |
| 1. Request build | Authorized member requests build for one package configuration/version. | Duplicate request handled idempotently where key supplied; package/source not mutated. |
| 2. Validate readiness | Resolve selected scope and invoke authoritative validation. | Missing physical certificate/scheme, non-final document or unsafe registry override blocks usable build. |
| 3. Resolve manifest | Select exact document revisions, certificate/scheme original references, registry override/signer/projection inputs, template versions, object snapshots and ordering. | Manifest uses pinned dependencies, not future `latest` values. |
| 4. Enqueue/run build | Start async execution independent of future technology. | Expose `QUEUED`/`RUNNING` progress and accountable request; failures do not create false successful snapshot. |
| 5. Generate artifacts | Generate document/registry/package derived outputs and include original evidence files as configured. | Generated artifacts cite exact sources; originals remain unchanged. |
| 6. Store package snapshot | On full success commit snapshot, items, artifact references and immutable dependency manifest. | Snapshot content and order immutable from creation. |
| 7. Expose result/failure | Make built snapshot/downloads or actionable failure visible. | User understands missing dependency/generation issue without manual source corruption. |
| 8. Release snapshot | User with permission publishes selected built result. | Release validates exact snapshot context and retains historical output; no rebuild-in-place. |
| 9. Mark stale after changes | Subsequent revision, replacement, override/order/template/context change affects current suitability. | Previous snapshot remains explainable/downloadable according to access policy; a new desired package requires new build. |

Default PTO order remains registry, certificates, acts, executive schemes unless configuration changes it explicitly.

---

## 11. Generated Artifact Backend Flow

Generated artifact is an output record and file reference, never an editing channel.

| Rule | Backend consequence |
| --- | --- |
| No source mutation | Upload/download/manual change of exported DOCX/PDF/ZIP does not update АОСР, certificate, scheme, registry or package source state. |
| Explicit source inputs | Each generation request identifies the source released revision or explicit permitted preview state, exact template version, projection/override context or package snapshot as applicable. |
| Async generation | Request may complete later with status/progress/failure; failure does not invalidate valid source data. |
| Provenance | Available artifact retains source/template/snapshot/projection references required to explain its content. |
| Retained released outputs | Artifacts used in released document/package output are retained as historical outputs under later retention policy. |
| Stale handling | Source/configuration changes mark current-use artifact stale or require a new artifact; existing retained artifact bytes are not rewritten. |
| Access policy deferred | Who may preview/download originals versus derived artifacts remains later authorization/privacy/API detail; all access remains workspace-scoped. |

Для live editing допустимый later preview flow должен читать structured working data; он не превращает DOCX generation в save mechanism.

---

## 12. AI/OCR Backend Flow

AI/OCR workflow должен ускорять разбор project sources, сертификатов и схем, не принимать инженерные решения вместо пользователя.

| Step | Backend action | Constraint |
| --- | --- | --- |
| Ingest source/evidence file | User uploads a project source, certificate original or scheme original through its owning workflow. | File has workspace/object or workspace library scope; it is not automatically confirmed metadata. |
| Request processing | Authorized command starts extraction/finding job under approved future processing policy. | Provider, privacy, consent, access and retention remain open; no real external processing is approved by this document. |
| Produce proposals/findings | Async result records proposed fields/relations or possible inconsistencies. | Store source citations, confidence/explanation, model/extractor/provider/version identity when processing exists, timestamps and status. |
| Review | User sees proposal against existing confirmed data/source citation. | No mutation from merely viewing or generating result. |
| Accept/edit and accept | Authorized user explicitly approves value/relation, optionally correcting it. | Acceptance becomes a normal domain command of the target owner with authorization, validation, expected version, revision/invalidation and audit rules. |
| Reject/dismiss | User explicitly rejects proposal/finding. | Confirmed domain state unchanged; outcome remains traceable subject to retention policy. |
| Source/target changes | Proposed value becomes outdated before decision. | Mark `STALE`; never auto-apply against a newer source/target. |

Hard boundaries:

- no auto-approval or silent application of extracted values;
- no AI-created certificate relation without retained physical certificate file;
- no inferred conversion of a project drawing into `ExecutiveScheme`;
- no AI rewrite of a released document revision or package snapshot;
- no cross-workspace retrieval, processing or linking;
- privacy/provider/retention and allowed real-file processing remain explicitly open.

---

## 13. Authorization and Tenant Boundary

| Requirement | Backend/API consequence |
| --- | --- |
| Workspace scope on every operation | Every command/query resolves one authoritative workspace/resource scope before accessing business data, processing state, files or outputs. |
| Owner/grant-based authorization | MVP permission comes from resource owner status or a resource-scoped share grant capability from `docs/19`, not from a global user flag or client-supplied role. |
| Object-level context | Object-scoped modules also check that folders, documents, schemes, sources, registry/package and AI context refer to the same object when required. |
| Stored share/invite state | Code acceptance relies on persisted target resource, capabilities, validity, expiration and revocation; a link/token never carries trusted rights. |
| No cross-workspace leakage | Reads, search results, file references, build jobs, proposals, audit feeds and error detail cannot reveal another workspace's objects or file existence. |
| Derived data remains scoped | Projection, artifact and index entry inherits tenant boundary from authoritative source; derived status is not a shortcut around authorization. |
| Fine-grained RBAC deferred | Precise role matrix behavior is deferred; MVP uses explicit grant capabilities and default deny. |

Authorization failures must be handled consistently without exposing whether an inaccessible identifier exists in another workspace.

---

## 14. Error Handling and Idempotency

### 14.1 Error families

| Error family | Meaning for caller | Examples |
| --- | --- | --- |
| Domain validation error | Command intent is understood but invariant/gate is not satisfied. | Missing certificate original, non-final act in package, unsafe registry override, numbering collision. |
| Conflict/version error | Mutable target changed since caller read it or transition is no longer applicable. | Stale document working version, changed override/package configuration, already superseded evidence. |
| Not found / not authorized | Requested target cannot be safely accessed in caller scope. | Cross-workspace id, missing object access, inaccessible original file; response policy must avoid leakage. |
| Async job failure | Accepted operation could not produce derived result. | Generation/build/extraction failure with safe actionable reason and retry eligibility. |
| Duplicate/idempotent result | Same dangerous intent is submitted again. | Repeated finalize, build request, release, invitation acceptance, upload completion or proposal acceptance. |
| Policy unavailable/deferred | Workflow cannot be enabled until an open policy is approved. | External AI processing of real source material without privacy/data-processing policy. |

### 14.2 Idempotency and retry rules

- Commands creating releases, snapshots, uploaded-file completion, invites/memberships or accepted proposals must support an idempotency key or equivalent command identity in the later contract.
- Repeating an identical successful command must return the established result or a clearly equivalent outcome, never create duplicate revisions/releases/memberships.
- Retrying async build/generation/processing creates or identifies an accountable attempt; it cannot silently mutate an earlier successful immutable snapshot/artifact.
- Conflict errors require re-read and a new intentional command; retry must not ignore version checks.
- Domain validation failures are not transient retries: the user fixes owning structured data or changes an allowed configuration.
- Async failure detail must be user-actionable but may not reveal sensitive file contents or provider internals beyond future logging/security policy.

---

## 15. Backend/API Non-Goals for V1

Backend/API Architecture V1 explicitly does not provide:

- SQL schema, DDL or database-specific constraints;
- migrations or seed data;
- ORM entities, repositories or persistence adapters;
- concrete API route list;
- OpenAPI specification or transport DTOs yet;
- frontend state model, component tree or lock UX;
- renderer/DOCX/PDF/PDF-merge implementation;
- storage provider, bucket/layout or file delivery mechanism;
- queue/job technology or deployment topology;
- AI/OCR provider, prompts, model choice or processing agreement;
- billing/subscription/entitlement design;
- generic document builder, generic file drive or automatic AI approval;
- production code, dependencies, scaffolding, Docker or CI configuration.

---

## 16. Backend/API Readiness Checklist

### 16.1 What this document makes ready

После review Backend/API Architecture V1 следующий этап сможет опираться на:

- modular-monolith module boundaries and ownership for accounts, tenants, objects, folders, typed documents, evidence, schemes, registry, packages, templates, artifacts, project sources, AI review, validation, search and audit;
- command-first mutation vocabulary для АОСР lifecycle, certificate/scheme evidence, numbering/folders, package output, AI review and membership flows;
- UI-oriented read model families for the real engineer workflow;
- atomic versus eventual consistency boundaries and async operation expectations;
- optimistic versioning, immutable released references, stale markers and authoritative validation;
- tenant-safe authorization and idempotent/error behavior requirements;
- preserved open decisions that implementation is not permitted to guess.

### 16.2 What remains open before implementation

Before implementation planning or code, further design/review must resolve or deliberately defer:

- exact command inputs, results, idempotency/version fields and read-model field contracts;
- concrete finalizable AOSR/TestAct/TechnicalReadinessAct forms and blocking required fields;
- detailed roles/permissions, original-file downloads, lock override, invite/ownership governance and audit retention;
- evidence/project-source retention, supersession, privacy and cross-workspace export/copy policy;
- template binding/rendering and package readiness customer-specific rules;
- search visibility/indexed-content policy and stale UX;
- AI/OCR allowed source scope, provider/consent/privacy/retention and who may review/apply;
- later physical persistence, storage, async execution, renderer, API transport and frontend decisions.

### 16.3 Recommended next document and gate

Рекомендуемый следующий документ после review:

```text
docs/15-api-command-readmodel-contracts-v1.md
```

Он должен детализировать command/query contracts and error/version/idempotency semantics без преждевременного выбора production stack, SQL/ORM, provider or implementation.

```text
Review docs/14-backend-api-architecture-v1.md;
proceed to API Command/Read Model Contracts V1 only if accepted.
```

Настоящий этап по-прежнему не разрешает coding, SQL, migrations, ORM schema, backend scaffold, frontend implementation либо инфраструктурный выбор.
