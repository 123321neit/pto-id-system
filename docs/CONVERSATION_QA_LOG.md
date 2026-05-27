# CONVERSATION_QA_LOG
# PTO ID System
# Consolidated decisions from user/assistant discussion
# Version: 2026-05-27-DOMAIN-LIFECYCLE-IMMUTABILITY-VALIDATION-V1

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

Статус решения: draft access and tenant-boundary baseline before Database Schema V1. Он конкретизирует уже обязательную tenant isolation и не изменяет ADR 0001-0005.

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
