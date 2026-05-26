# 06. Data Model V1

# PTO ID System

# Формальная концептуальная модель данных и границы агрегатов

Статус: первая архитектурная спецификация для обсуждения и последующей детализации.

Дата фиксации: 2026-05-26.

Источник истины для решений: `docs/PROJECT_MEMORY.md`.

Связанные решения: ADR 0001-0005, анализ АОСР и пример реестра вентиляции.

---

## 1. Purpose

### 1.1 Назначение документа

Этот документ переводит принятые продуктовые и архитектурные принципы PTO ID System в первую формальную концептуальную модель данных. Его задача - определить, какие доменные объекты существуют, кто владеет их жизненным циклом, где проходят границы согласованности и какие данные являются первичными либо производными.

Документ нужен как основание для следующих этапов:

- проверки полноты доменной модели с инженером ПТО;
- детализации typed documents для MVP;
- уточнения aggregate boundaries;
- последующего проектирования физического хранения;
- последующего проектирования backend-модулей и пользовательских сценариев.

### 1.2 Что этот документ фиксирует

Data Model V1 фиксирует:

- модель объектов, папок, работ, документов, сертификатов, схем, шаблонов, реестров и комплектов;
- минимально необходимые aggregate roots;
- ownership и lifecycle responsibilities;
- различие live data, snapshots, revisions и generated artifacts;
- правила ссылок между документами и подтверждающими файлами;
- модель производных представлений: registry и package output;
- границы MVP и перечень отложенных решений.

### 1.3 Что этот документ не делает

Этот документ намеренно не содержит:

- SQL или иной язык описания схемы данных;
- ORM-модели;
- выбора базы данных или типа хранилища;
- API, endpoints или transport contracts;
- выбора frontend/backend стека;
- кода, инфраструктуры, CI/CD или deployment design;
- финальной реализации template engine, OCR или package build queue.

### 1.4 Нормативная основа

Модель подчиняется следующим уже принятым правилам:

1. `SOURCE OF TRUTH = STRUCTURED DATA`.
2. DOCX, PDF, ZIP, реестры и комплекты являются generated artifacts или derived projections.
3. Реестр не является source of truth.
4. Документы ИД моделируются как typed documents.
5. Сертификат не может быть простой строкой в акте: необходим library item с физическим файлом.
6. Срок действия сертификата проверяется относительно даты документа.
7. `final` документ можно исправлять с повышением revision.
8. Использованная template version неизменяема.
9. Package Builder выполняется асинхронно и формирует snapshots.
10. `Object` не превращается в giant aggregate.
11. OCR/AI предлагает данные, но не утверждает их автоматически.

---

## 2. Modeling Principles

### 2.1 Structured data first

Каждое значимое понятие исполнительной документации должно иметь структурированное представление: объект, организация, представитель, работа, документ, сертификат, схема, комплект или шаблон. Внешний вид печатного документа не определяет место хранения смысла.

Практическое следствие: номер АОСР, дата, состав работ, связь с сертификатом и схема должны существовать независимо от сформированного DOCX/PDF.

### 2.2 Typed domain model

Документ получает тип при создании и не меняет его в течение жизненного цикла. Тип определяет смысл полей, валидацию, представление, участие в реестре и генерацию артефактов.

Поддержка расширяемых полей допустима только внутри типизированного контракта, когда она не уничтожает проверяемые связи и обязательные данные.

### 2.3 Explicit relationships over embedded text

Ссылки между актом, работой, материалом, сертификатом, схемой и комплектом должны быть явными. Отрендеренный текст может содержать номер сертификата или название схемы, но этот текст является отображением связи, а не её заменой.

### 2.4 Historical reproducibility

Исполнительная документация должна оставаться объяснимой спустя время. Изменение карточки организации, шаблона, действующего сертификата или текущих настроек не должно переписывать исторически сформированный документ или комплект без явной новой revision/build.

### 2.5 Separation of live entities and snapshots

Live entities применяются для текущей работы и переиспользования: профиль компании, сертификат в библиотеке, шаблон до использования. Snapshot фиксирует набор значений для исторического вывода: реквизиты организации на объекте, revision документа, состав комплекта и provenance generated artifact.

### 2.6 Projection instead of duplication

Реестры, списки готовности, описи комплектов и warnings строятся из source entities. Проекция может быть сохранена или кэширована для скорости, но она не приобретает право переписывать источник истины.

### 2.7 Aggregate autonomy

Агрегат должен защищать собственные инварианты, а не владеть всей системой. `Object` задаёт контекст объекта, но документы, сертификаты, схемы, шаблоны и комплекты живут отдельными жизненными циклами и соединяются ссылками.

### 2.8 Tenant isolation

Все business data принадлежат tenant context. Ссылка между сущностями допустима только в рамках разрешённой tenant-области. Точный RBAC ещё проектируется, но отсутствие детализации ролей не отменяет изоляцию данных.

### 2.9 File-backed evidence

Подтверждающие документы и схемы имеют физические оригиналы. Metadata без файла недостаточны для сертификата или исполнительной схемы, которая должна войти в передаваемый комплект.

### 2.10 No accidental technology decisions

Концептуальная модель описывает содержание и обязанности, а не способ реализации. Термины `aggregate`, `snapshot`, `projection` и `file` в документе не выбирают СУБД, объектное хранилище, очередь задач или framework.

---

## 3. Aggregate Roots

### 3.1 Классификация границ

Data Model V1 различает три категории:

- **принятый aggregate root** - следует напрямую из зафиксированных правил и нужен для защиты самостоятельного жизненного цикла;
- **кандидат aggregate root** - необходим как понятие, но точная транзакционная граница должна быть подтверждена позднее;
- **не aggregate root** - значение, snapshot, связь или projection, не владеющие самостоятельной доменной жизнью.

### 3.2 Реестр корневых агрегатов

| Aggregate root | Статус в V1 | Назначение | Главные инварианты |
| --- | --- | --- | --- |
| `TenantContext` | Концептуальная граница | Изоляция данных организации/аккаунта | Межtenant-ссылки запрещены, кроме специально решённых системных сценариев. |
| `Object` | Принят | Рабочий контекст строительного объекта | Идентичность объекта, привязка систем, object snapshots и настройки; не владеет всеми документами. |
| `FolderTree` | Кандидат внутри object context | Организация документов по папкам/периодам | Один объект, отсутствие циклов, правила move/duplicate/soft delete. |
| `CompanyProfile` | Принят как library aggregate | Переиспользуемый профиль организации | Изменение профиля не изменяет существующие object snapshots. |
| `RepresentativeProfile` | Кандидат как library aggregate | Переиспользуемые данные представителя | Переиспользование с возможностью object/document snapshots и временных представителей. |
| `Document` | Принят | Typed исполнительный документ | Immutable type, structured payload, lifecycle, revision, связи и template binding. |
| `Certificate` | Принят | Library item документа качества | Обязательный original file, подтверждённые metadata, переиспользуемые ссылки. |
| `ExecutiveScheme` | Принят | Фактическая исполнительная схема | File + structured metadata, отдельная от проектных чертежей. |
| `Template` | Принят как отдельный контекст | Шаблон и его версии | Использованная version immutable. |
| `Package` | Принят как отдельный контекст | Задание и snapshots комплекта ИД | Async snapshot-based build, dependency invalidation, порядок вывода. |

### 3.3 Concepts that are not aggregate roots in V1

| Concept | Почему не является корнем |
| --- | --- |
| `RegistryProjection` | Производное чтение из source entities и overrides, не самостоятельная истина. |
| `RegistryOverride` | Настройка конкретного представления/комплекта, владеется scope реестра или package configuration. |
| `GeneratedArtifact` | Выход операции генерации с provenance; владеется revision/template/package output context. |
| `DocumentLock` | Операционная lease-сущность редактирования, не изменяет данные документа. |
| `MaterialUsage` | Факт использования внутри work/document context; точная граница зависит от уточнения `WorkItem`. |
| `ObjectCompanySnapshot` | Замороженное значение организации на объекте, принадлежащее object context. |
| `DocumentRevisionSnapshot` | Историческая фиксация состояния документа, принадлежащая Document. |
| `PackageSnapshot` | Результат сборки, принадлежащий Package. |

---

## 4. Aggregate Boundaries

### 4.1 Object boundary

`Object` отвечает за идентичность и постоянный контекст строительного объекта:

- наименование, адрес и object-level attributes;
- инженерные системы/разделы, используемые на объекте;
- выбранные company snapshots и object representative defaults;
- связь с `ProjectDrawingSet`;
- настройки нумерации и bindings шаблонов на уровне объекта;
- связь с корнем папочной структуры.

`Object` не должен содержать внутри как вложенные mutable collections:

- все документы;
- все сертификаты;
- все исполнительные схемы;
- package snapshots;
- версии шаблонов;
- generated artifacts.

Эти данные адресуются через `object_id` и самостоятельные агрегаты либо проекции. Иначе любая работа с актом потребует менять гигантский объект и нарушит принятый guardrail.

### 4.2 Folder tree boundary

Folder tree представляет пользовательскую классификацию внутри одного объекта, например раздел, год, месяц или комплект работ. Он отвечает за:

- иерархию папок;
- позицию и порядок узлов;
- перенос папки внутри объекта;
- стратегию дублирования папочной структуры;
- soft deletion и восстановление структуры.

Папка не владеет документом: изменение папки документа меняет размещение/ссылку, но жизненный цикл, type, payload и revision документа остаются обязанностью `Document`.

Дублирование папки является доменной командой и может инициировать создание новых документов с выбранной стратегией: копирование связей, сброс дат, продолжение или пересчёт нумерации, сброс статусов. Точная форма clone strategy требует отдельного уточнения.

### 4.3 Company and representative boundaries

`CompanyProfile` является редактируемой библиотечной карточкой организации для будущего использования. При выборе компании для объекта создаётся `ObjectCompanySnapshot`, который хранит реквизиты, необходимые для документов и реестров данного объекта.

Это разделяет:

- текущие данные организации в библиотеке;
- исторически используемые данные организации на объекте;
- eventual document/package snapshots.

`RepresentativeProfile` может аналогично давать значения по умолчанию. Документ должен уметь сохранять отображаемые данные представителя либо snapshot/override, потому что состав подписантов, должность, полномочия и порядок должны воспроизводиться для конкретного акта.

### 4.4 Document boundary

`Document` защищает:

- неизменность типа;
- status и правила переходов;
- document number и document date;
- typed payload;
- связи с WorkItem/MaterialUsage/Certificate/ExecutiveScheme;
- выбранную template version;
- revision history;
- validation state и причины warnings/errors;
- provenance generated artifacts документа.

Операции над другим агрегатом не должны молча переписывать published revision документа. Например, изменение `Certificate` metadata после выпуска требует явного решения о влиянии на существующий документ и package snapshots.

### 4.5 Certificate boundary

`Certificate` отвечает за original evidence file и metadata документа качества. Он может использоваться несколькими документами. Включение сертификата в акт выражается ссылкой, а не копией номера в typed payload без library item.

Если физический файл использован в историческом документе или package snapshot, его нельзя бесследно заменить. Модель замены, supersession и retention остаётся детализацией следующего этапа, но инвариант сохранения доказательности обязателен.

### 4.6 ExecutiveScheme boundary

`ExecutiveScheme` владеет оригинальным файлом схемы и metadata фактического исполнения. Он может быть связан с несколькими работами или документами объекта.

`ExecutiveScheme` не является:

- редактируемым CAD-чертежом;
- `ProjectDrawingSet`;
- строкой текста в реестре.

### 4.7 Template boundary

`Template` объединяет версии формы одного назначения. `TemplateVersion` после первого фактического использования документом или generated artifact не редактируется. Выбор другой формы является новым binding или новой версией, но не тихим изменением прежнего вывода.

### 4.8 Package boundary

`Package` управляет сборкой комплекта ИД:

- scope комплекта;
- ordering и пользовательские package/registry overrides;
- build requests;
- snapshot результата;
- generated aggregate artifacts;
- статус сборки, ошибки и invalidation.

`Package` читает published/current data зависимостей и формирует фиксированный snapshot. Он не становится владельцем исходного `Document`, `Certificate` или `ExecutiveScheme`.

### 4.9 Projection and operational boundaries

`RegistryProjection` вычисляется из source aggregates и override configuration. `DocumentLock` управляет правом редактировать документ в текущей сессии; heartbeat lock не порождает revision. OCR/AI suggestions относятся к workflow подтверждения metadata и не обновляют source entities до ручного подтверждения.

---

## 5. Entity Catalog

### 5.1 Tenant and user context

| Entity | Role | Required conceptual attributes | Lifecycle note |
| --- | --- | --- | --- |
| `TenantContext` | Область изоляции данных | identity, display context, status | Детали коммерческой subscription model не входят в V1. |
| `User` | Участник работы в tenant | identity, tenant relation, status | Authentication/RBAC design отложен. |
| `RoleAssignment` | Право пользователя выполнять операции | user, role, scope | `admin`, `PTO`, `foreman` известны как роли, правила уточняются. |

### 5.2 Object organization

| Entity | Role | Required conceptual attributes | Lifecycle note |
| --- | --- | --- | --- |
| `Object` | Строительный объект | name, address, status, tenant, object settings | Создаётся пользователем; archive/delete policy уточняется. |
| `EngineeringSystem` | Раздел/система объекта | code, name, discipline, object relation | MVP фокус: ОВиК и ВК. |
| `Folder` | Узел бизнес-структуры | title, object, parent, ordering, deleted state | Move/duplicate/soft delete, без владения документами. |
| `ProjectDrawingSet` | Рабочая проектная документация | name, drawing code, section, sheet count, organization snapshot/ref, note | Положение внутри Object или отдельной границы требует утверждения. |
| `NumberingPolicy` | Настройки нумерации | scope, prefix, sequence behavior, suffix, renumber policy | Может задаваться object/folder scope. |

### 5.3 Companies and people

| Entity | Role | Required conceptual attributes | Lifecycle note |
| --- | --- | --- | --- |
| `CompanyProfile` | Библиотека организаций | legal/short name, requisites, addresses, director, authority, SRO/contacts | Mutable library source для новых uses. |
| `ObjectCompanySnapshot` | Реквизиты компании, принятые для объекта | rendered legal data, contract/work/SRO and representative basis data | Immutable historical value относительно изменений profile. |
| `RepresentativeProfile` | Переиспользуемый представитель | organization relation, position, full name, authority, optional NRS, contact | Модель глобальности/tenant scope уточняется. |
| `ObjectRepresentativeBinding` | Дефолт представителя на объекте | role, representative or entered data, ordering, subtitle | Может быть overridden документом. |
| `DocumentRepresentativeSnapshot` | Отображаемый участник конкретного документа | role, rendered organization/person/authority, ordering, subtitle | Должен сохранять воспроизводимый акт. |
| `RegistrySignerSnapshot` | Подписант конкретного registry output | rendered name, position, organization, authority and caption | Может отличаться от подписантов актов. |

### 5.4 Works, documents and links

| Entity | Role | Required conceptual attributes | Lifecycle note |
| --- | --- | --- | --- |
| `WorkItem` | Работа или выполненный участок | type/description, system, location, execution period, drawing references | Степень нормализации в MVP открыта. |
| `Document` | Корень typed document | type, number, date, status, revision, object/folder, template binding | Type immutable; final editable through new revision. |
| `AOSRPayload` | Данные АОСР | work, representatives, project refs, materials, certificates, schemes/applications, permissions/notes | Typed value/entity set внутри `Document`. |
| `TestActPayload` | Данные акта испытаний | tested object, method, parameters/results, participants, conclusion, links | Specific forms требуют уточнения. |
| `TechnicalReadinessActPayload` | Данные акта технической готовности | not yet fixed | Тип выявлен sample-реестром, schema deferred. |
| `DocumentCertificateLink` | Связь документа с сертификатом | document, certificate, usage/purpose, ordering, display context | Certificate file обязателен. |
| `DocumentSchemeLink` | Связь документа со схемой | document, scheme, purpose, ordering | Ссылка может участвовать в приложениях/реестре. |
| `DocumentWorkLink` | Связь документа с работой | document, work, relation type | АОСР освидетельствует работу; акт испытаний проверяет объект/участок. |

### 5.5 Materials and evidence

| Entity | Role | Required conceptual attributes | Lifecycle note |
| --- | --- | --- | --- |
| `Material` | Идентифицируемый материал/оборудование | name, brand/type, manufacturer, category, measurement unit, normative data | Полноценный catalogue в MVP ещё не принят. |
| `MaterialUsage` | Применение материала в работе | description/ref, work/document context, quantity if used, batch, location, use date | Certificate должен подтверждать именно использование. |
| `Certificate` | Документ качества | type, registration number, dates, issuer, manufacturer/coverage, file, confirmation state | Shared library aggregate. |
| `CertificateConfirmation` | Результат ручной проверки metadata | confirmer, confirmed fields/state, confirmation time | OCR без подтверждения не активирует source metadata. |

### 5.6 Schemes, files, templates and outputs

| Entity | Role | Required conceptual attributes | Lifecycle note |
| --- | --- | --- | --- |
| `ExecutiveScheme` | Фактическая исполнительная схема | title, number, date, sheet count, note, file, object/folder | Новая редакция файла моделируется явно. |
| `FileAsset` | Физически сохранённый файл | identity, purpose/type, ownership/ref, original/generation marker, integrity metadata | Physical storage technology deferred. |
| `Template` | Семейство шаблонов | document/output purpose, scope, status | Global/object variants допустимы. |
| `TemplateVersion` | Конкретная версия формы | template relation, version identity, usage state, rendering contract | Immutable after use. |
| `GeneratedArtifact` | Сгенерированный результат | artifact type, source revision/snapshot, template version, file identity, generated time | Не source of truth; regeneration possible where policy permits. |

### 5.7 Projections, packages and operations

| Entity | Role | Required conceptual attributes | Lifecycle note |
| --- | --- | --- | --- |
| `RegistryProjection` | Вычисленное представление реестра | scope, resolved rows/blocks, provenance, freshness | Не первичная entity. |
| `RegistryOverride` | Печатная/порядковая настройка projection | scope, ordering, inclusion/hiding, notes, signer choice | Не меняет source fields. |
| `Package` | Конфигурация комплекта ИД | object/scope, ordering, inclusion policy, status | Владеет builds/snapshots, не исходными документами. |
| `PackageBuild` | Асинхронная попытка сборки | requested scope/version, progress, status, failure information | Job semantics без выбора технологии. |
| `PackageSnapshot` | Зафиксированный состав и результат комплекта | dependency identities/revisions, ordering, output files, build time | Immutable historical build result. |
| `DocumentRevisionSnapshot` | Зафиксированное document state | revision, payload state, references, template binding, validation state | Обеспечивает audit и воспроизводимость. |
| `AutosaveSnapshot` | Последнее сохранённое рабочее состояние | document/editor context, payload state, saved time | Не равно published revision без lifecycle action. |
| `DocumentLock` | Lease редактирования | document, user/session, locked/expires/heartbeat markers | Operational state, не document revision. |
| `OCRExtractionProposal` | Результат извлечения из файла | file/certificate/scheme context, proposed fields, confidence/status | Active data только после подтверждения. |
| `ActivityEvent` | История действий | actor, action, target, moment, context | Перечень обязательных событий уточняется. |

---

## 6. Value Objects

Value objects описывают значения без самостоятельного жизненного цикла. Они входят в агрегаты или snapshots и сравниваются по содержимому.

### 6.1 Identification and display values

| Value object | Meaning | Notes |
| --- | --- | --- |
| `DocumentNumber` | Номер документа | Содержит prefix, sequence, suffix и rendered representation. |
| `RegistrationNumber` | Номер сертификата/схемы/проектного комплекта | Не подменяет ссылку на entity. |
| `DocumentType` | Тип typed document | После создания документа immutable. |
| `ArtifactType` | DOCX, PDF, registry output, package PDF/ZIP и иные выходы | Не является выбором технологии генерации. |
| `DisplayOrder` | Порядок вывода элементов | Применим к представителям, строкам, вложениям и package ordering. |

### 6.2 Date and lifecycle values

| Value object | Meaning | Notes |
| --- | --- | --- |
| `DocumentDate` | Дата документа ИД | Является базой certificate validity check. |
| `ExecutionPeriod` | Даты выполнения работ | Отличается от даты оформления акта. |
| `ValidityPeriod` | Срок действия сертификата | Проверяется относительно DocumentDate. |
| `RevisionNumber` | Номер revision документа | Увеличивается при изменении final document; политика draft уточняется. |
| `LifecycleStatus` | Состояние entity | Точный полный перечень ещё нуждается в детализации. |

### 6.3 Location, system and work values

| Value object | Meaning | Notes |
| --- | --- | --- |
| `ObjectAddress` | Адрес строительного объекта | Может входить в snapshots вывода. |
| `WorkLocation` | Зона выполнения | Может содержать этаж, помещение, оси, отметку или участок. |
| `EngineeringSystemRef` | Ссылка/идентификатор системы | ОВиК/ВК и уточнённая система. |
| `WorkDescription` | Отображаемое описание работы | В MVP может сочетать structured components и rendered text. |
| `DrawingReference` | Ссылка на рабочую документацию/шифр | Может указывать на ProjectDrawingSet и textual normative refs. |

### 6.4 Organization and person values

| Value object | Meaning | Notes |
| --- | --- | --- |
| `OrganizationRequisites` | ИНН, КПП, ОГРН, адреса и наименование | В snapshot фиксируется историческая форма. |
| `AuthorityBasis` | Основание полномочий | Приказ, доверенность, устав и связанные реквизиты. |
| `RepresentativeCaption` | Подстрочный/печатный текст роли | Default может редактироваться в document context. |
| `SignerIdentity` | Рендеримые имя, должность и организация | Используется snapshot для документа/реестра. |

### 6.5 Validation and provenance values

| Value object | Meaning | Notes |
| --- | --- | --- |
| `ValidationFinding` | Warning или error с причиной | Warning для certificate validity может не блокировать продолжение. |
| `GenerationProvenance` | Набор source revisions/templates/snapshots вывода | Нужен для объяснимости generated artifact. |
| `DependencyFingerprint` | Концептуальный набор зависимостей build | Способ вычисления не определяется в V1. |
| `OCRProposalField` | Предложенное AI/OCR значение с состоянием проверки | Не active metadata до подтверждения. |

---

## 7. Ownership Rules

### 7.1 Core ownership table

| Data or behavior | Owner | Consumers | Ownership rule |
| --- | --- | --- | --- |
| Object name/address/settings | `Object` | Documents, registry, package | Не редактируется только в projection или output. |
| Company reusable profile | `CompanyProfile` | Object creation/settings | Изменения применимы к будущим choices, не к историческим snapshots. |
| Company data used on object | `ObjectCompanySnapshot` under object context | Registry, documents, packages | Исторические реквизиты выводятся из snapshot. |
| Engineering system definitions | `Object` context / system entity | Works, documents, schemes | Точная каталогизация требует детализации, scope всегда object/tenant. |
| Folder hierarchy | `FolderTree` in object context | UI placement, documents | Папка хранит placement, не document payload. |
| Work meaning | `WorkItem` or typed work portion pending refinement | AOSR, tests, schemes, registry | Степень самостоятельности WorkItem уточняется; связи должны быть явными. |
| Typed document data | `Document` | Registry, package, generation | Source changes создают/обновляют revision по lifecycle rules. |
| Certificate original and metadata | `Certificate` | Documents, registry, package | Номер в rendered form берётся через link к entity с файлом. |
| Scheme original and metadata | `ExecutiveScheme` | Documents, registry, package | Не хранится только текстом в акте/реестре. |
| Working drawing set | `ProjectDrawingSet` in object documentation context | AOSR, registry | Не путать с фактической схемой. |
| Template definition/version | `Template` | Document generation, registry/package output | Used version immutable. |
| Registry rows | `RegistryProjection` | UI/export/package | Derived only; not source owner. |
| Registry ordering/visibility/note | `RegistryOverride` in projection/package scope | Registry output | Не владеет primary document/certificate data. |
| Package configuration and output | `Package` | User/download/audit | Package stores snapshots/results, source aggregates remain autonomous. |
| Generated DOCX/PDF/ZIP | Generating document/package context via `GeneratedArtifact` | User/download/package | File provenance must identify source revisions/template/snapshot. |
| Autosave content | `Document` editing workflow | Editor recovery | Structured payload snapshot, not DOCX. |
| Edit lease | `DocumentLock` operational scope | Editor | Heartbeats do not revise document. |

### 7.2 Cross-aggregate reference rules

- Ссылки должны быть tenant-safe и, где требуется, object-safe.
- Удаление/архивирование referenced entity не должно разрушать historical snapshot без явной retention policy.
- Изменение source entity не должно незаметно переписывать published package snapshot.
- Projection может читать несколько агрегатов, но не владеть их изменениями.
- Package snapshot должен фиксировать revision/identity каждого включённого источника.

---

## 8. Lifecycle Ownership

### 8.1 Object and supporting setup lifecycle

`Object` создаётся как рабочий контекст проекта. При его настройке пользователь выбирает или вводит организации и представителей, после чего система формирует object-level snapshots/default bindings. Системы, папочная структура, project drawing sets и правила нумерации уточняются в рамках объекта.

Архивирование/удаление объекта должно учитывать, что внутри context существуют документы и evidence files; hard delete до retention/privacy решения не допускается как архитектурная предпосылка.

### 8.2 Document lifecycle

Зафиксированный базовый lifecycle:

| Status | Meaning | Permitted conceptual behavior |
| --- | --- | --- |
| `draft` | Рабочее состояние документа | Может быть неполным; autosave сохраняет structured state. |
| `final` | Провалидированная опубликованная revision | Доступна генерация/включение в package; правка разрешена через новую revision. |
| `archived` | Документ исключён из активной работы, но хранится исторически | Policy восстановления/использования уточняется. |
| `deleted` | Soft-deleted state / trash | Hard delete регулируется retention policy. |

В ранних документах встречались кандидаты `in_review`, `approved`, `issued`, `needs_regeneration`, `superseded`. Они не удалены из рассмотрения, но не считаются утверждённым lifecycle V1 до отдельного решения.

### 8.3 Certificate lifecycle

Certificate lifecycle должен различать:

- загрузку original file;
- наличие metadata;
- OCR proposal, если применимо;
- ручное подтверждение metadata;
- использование в документе/комплекте;
- возможное supersession/архивирование;
- soft deletion при отсутствии запрета от historical references.

Сертификат не считается пригодным для ссылки как полноценное доказательство, если отсутствует физический файл. Метаданные, полученные OCR, до подтверждения не считаются verified source values.

### 8.4 Executive scheme lifecycle

Схема загружается как file-backed entity, получает metadata и связи с работами/документами. Если фактический файл изменился, это должно быть отражено новой entity или явной будущей версионной моделью. Молчаливая замена файла исторической схемы недопустима.

### 8.5 Template lifecycle

Template может получать версии до их использования. Как только конкретная `TemplateVersion` участвовала в формировании документа или output, она становится immutable. Дальнейшее изменение формы создаёт следующую version и не меняет historical artifact provenance.

### 8.6 Package lifecycle

Package задаёт scope и ordering, затем инициирует asynchronous build. Успешный build создаёт immutable `PackageSnapshot`. Изменение зависимости делает актуальный output устаревшим для нового выпуска, но не удаляет исторический snapshot.

---

## 9. Derived Projections

### 9.1 Definition

Derived projection - это представление данных, собираемое из aggregate roots и snapshots для работы пользователя, проверки полноты или вывода. Проекция может быть рассчитана заранее, сохранена или экспортирована, но не является первичным владельцем исходных значений.

### 9.2 Required projections

| Projection | Purpose | Source aggregates |
| --- | --- | --- |
| `RegistryProjection` | Реестр документации объекта/комплекта | Object snapshots, ProjectDrawingSet, Documents, Certificates, ExecutiveSchemes, RegistryOverrides. |
| `PackageContentsProjection` | Видимый состав собираемого комплекта | Package configuration, registry projection, documents/artifacts, evidence files. |
| `DocumentListProjection` | Навигация по объекту/папке и статусам | Object, Folder placement, Documents. |
| `CompletenessProjection` | Недостающие файлы, validation findings и readiness | Documents, links, Certificates, Schemes, templates, package requirements. |
| `StaleArtifactProjection` | Какие output устарели после изменений | revisions, template versions, package snapshots, artifact provenance. |

### 9.3 Projection edit principle

Редактирование из projection UI допустимо только как команда исходному владельцу. Например:

- изменение даты акта из строки реестра должно изменять `Document`;
- привязка сертификата должна создать `DocumentCertificateLink` к существующему `Certificate`;
- смена порядка в печатном реестре должна изменить `RegistryOverride`, а не переписать документ.

### 9.4 No reverse authority from exported files

Экспортированный DOCX, PDF или XLSX не возвращает изменения в модель автоматически. Импорт изменённого внешнего файла требует отдельного архитектурного решения и не входит в Data Model V1.

---

## 10. Snapshot Model

### 10.1 Why snapshots exist

Snapshots фиксируют состояние данных там, где дальнейшие изменения live entities не должны менять исторический результат или где необходима воспроизводимость выпуска.

### 10.2 Snapshot catalog

| Snapshot | Created when | Contains | Why needed |
| --- | --- | --- | --- |
| `ObjectCompanySnapshot` | Компания связывается с объектом или явно обновляется на объекте | Реквизиты, адреса, директор/основание, SRO, contract/work context where used | Старый объект не меняется при правке company library. |
| `DocumentRepresentativeSnapshot` | Представители включаются в revision документа | Rendered person/organization/authority/role/order | Акт воспроизводит подписантов и подписи того состояния. |
| `DocumentRevisionSnapshot` | Revision документа фиксируется согласно lifecycle action | Typed payload, document number/date, links, validation result, template version | Final edit и история документа становятся объяснимыми. |
| `AutosaveSnapshot` | Во время редактирования draft/current document | Текущее structured editor state | Восстановление работы без создания file-based source of truth. |
| `PackageSnapshot` | Успешно завершена сборка комплекта | Ordering, included revisions/files, registry result, template/artifact provenance | Скачивание и объяснение исторического комплекта. |
| `GeneratedArtifactProvenance` | Создан DOCX/PDF/ZIP output | Source revision/snapshot identity and template version | Повторная генерация и анализ расхождений. |

### 10.3 Snapshot immutability

Исторический snapshot не редактируется для отражения новых данных. При необходимости нового результата создаётся новая revision либо новый package build/snapshot. Пользователь может менять текущие данные и собирать новый комплект, но прошлый зафиксированный результат должен сохранять собственное происхождение.

### 10.4 Snapshot invalidation

Invalidation означает, что snapshot больше не является актуальным для нового выпуска, а не то, что исторический snapshot удаляется.

Package snapshot должен считаться требующим нового build при изменении:

- включённого document revision;
- certificate relation или подтверждающего файла;
- executive scheme или её included file;
- registry override/order;
- template version/binding, используемой новым output;
- object/company snapshot, если он должен отражаться в новом комплекте;
- package scope или inclusion rules.

---

## 11. Revision Model

### 11.1 Document revision

`revision` идентифицирует содержательное состояние typed document. Модель обязана поддерживать историю изменений документа, особенно после достижения `final`.

Принятое правило:

```text
final document is editable; changing it produces the next revision
```

### 11.2 Revision triggers

Операции, которые должны считаться содержательным изменением revision:

- изменение полей typed payload;
- изменение document date или rendered number, если документ уже зафиксирован/выпущен;
- изменение связей с сертификатами, схемами или работами;
- изменение зафиксированных представителей/подписантов документа;
- смена template binding для нового представления документа;
- изменение validation-relevant данных.

Точный момент повышения revision у незавершённого draft и при частых autosave остаётся открытым. Autosave не должен автоматически создавать лавину published revisions.

### 11.3 Revision consequences

При изменении final revision:

- новый документ должен пройти validation;
- ранее сформированные артефакты не описывают автоматически новую revision;
- package snapshots, которые должны включать обновлённый документ, помечаются устаревшими/требующими rebuild;
- история должна показывать, какая revision участвовала в каком package snapshot.

### 11.4 Version distinctions

| Concept | What it versions | Not equivalent to |
| --- | --- | --- |
| `DocumentRevision` | Содержание typed document | Template version, package snapshot, autosave state. |
| `TemplateVersion` | Форму вывода | Document content revision. |
| `PackageSnapshot` | Состав и output build комплекта | Текущие source entities после дальнейших изменений. |
| `AutosaveSnapshot` | Рабочее промежуточное состояние | Published/final revision. |
| `Certificate supersession/version` | Пока не утверждено формально | Не должно решаться молчаливой заменой original file. |

---

## 12. File Ownership Model

### 12.1 File categories

| File category | Examples | Source/derived status | Conceptual owner |
| --- | --- | --- | --- |
| Uploaded evidence original | PDF сертификата, декларации, паспорта | Primary evidence attached to structured entity | `Certificate`. |
| Uploaded factual scheme | PDF исполнительной схемы | Primary evidence attached to structured entity | `ExecutiveScheme`. |
| Template original/version content | Form used to render documents | Source for generation under template lifecycle | `TemplateVersion`. |
| Generated document output | DOCX/PDF акта | Derived artifact | `DocumentRevision` + `TemplateVersion` provenance. |
| Generated registry output | Реестр в DOCX/PDF/XLSX | Derived artifact | Registry generation/package context. |
| Generated package output | PDF/ZIP комплекта | Derived snapshot artifact | `PackageSnapshot`. |

### 12.2 File ownership invariants

- FileAsset должен быть связан с owner context и tenant context.
- Certificate без original file не может быть полноценным подтверждающим документом для акта/комплекта.
- ExecutiveScheme должна иметь сохранённый файл, если включается в реестр или package.
- Generated artifact не заменяет structured source data.
- File used by a historical revision/snapshot cannot be silently overwritten.
- Storage implementation, integrity strategy, retention and access mechanics требуют дальнейшего решения.

### 12.3 AI/OCR processing rule

OCR/AI может читать file content только в рамках будущей утверждённой privacy/data processing policy. Результат извлечения создаёт proposal, а не подтверждённые metadata. Пользователь обязан подтвердить критичные значения до их использования как verified fields.

---

## 13. Certificate Model

### 13.1 Role in the domain

Certificate - самостоятельный library aggregate документа качества. Он подтверждает материал, изделие, оборудование или партию и может использоваться несколькими актами и комплектами внутри допустимого tenant scope.

Под именем Certificate в концептуальной модели понимаются:

- сертификат соответствия;
- декларация о соответствии;
- паспорт качества;
- технический паспорт;
- исходящее/отказное/информационное письмо;
- иной подтверждающий документ качества.

### 13.2 Required certificate information

| Information group | Conceptual fields |
| --- | --- |
| Identity | certificate identity, document kind, registration number |
| Coverage | material/equipment/product description, manufacturer, optional batch/coverage |
| Issuance | issuer, issue date, validity end if applicable |
| Evidence | original file reference, page count if known |
| Verification | OCR state, user confirmation state, warnings/errors |
| Lifecycle | tenant scope, timestamps, archive/soft delete/supersession state to be detailed |

### 13.3 Link to materials and acts

Сертификат не должен подтверждать абстрактную строку в документе. Желаемая смысловая цепочка:

```text
WorkItem / AOSR material usage -> Certificate link -> Certificate original file
```

Если полноценный `Material` catalog не войдёт в MVP, typed payload АОСР всё равно должен хранить конкретное применение/описание материала и связь с существующим `Certificate`.

### 13.4 Mandatory file rule

Нельзя:

- вручную вписать registration number в АОСР и считать certificate relation выполненной;
- показать сертификат в registry/package, если file evidence отсутствует;
- удалить или заменить evidence file без учёта документов и snapshots, где он участвовал.

Можно:

- отрендерить номер и название сертификата в акте на основе связи;
- использовать один подтверждённый certificate item в нескольких документах;
- показывать warning, если applicability требует проверки.

### 13.5 Validity rule

Срок сертификата оценивается относительно даты документа, который использует сертификат, а не относительно даты просмотра системы.

Следствия:

- документ, оформленный в период действия сертификата, не становится автоматически невалидным после истечения срока в будущем;
- при создании/изменении документа с датой вне срока система должна сформировать finding;
- согласно принятому решению такая просрочка рассматривается как warning, не автоматический hard block, пока не принято более строгое domain rule.

### 13.6 OCR and confirmation

OCR может предложить номер, даты, производителя, issuer, coverage и page count. До пользовательского подтверждения эти значения не должны использоваться как verified source data для финального документа или проверки комплекта.

---

## 14. Executive Scheme Model

### 14.1 Meaning

`ExecutiveScheme` описывает фактическую исполнительную схему или съёмку, подтверждающую выполненные работы. Она является evidence entity с файлом и структурированными metadata.

### 14.2 Required information

| Information group | Conceptual fields |
| --- | --- |
| Identity | scheme identity, title, registration number |
| Context | tenant, object, folder, engineering system/zone where applicable |
| Date/output | scheme date, sheet count, note |
| Evidence | uploaded file reference |
| Relationships | linked WorkItems and Documents |
| Lifecycle | created/updated/archive/delete metadata; replacement policy requires detailing |

### 14.3 Difference from ProjectDrawingSet

| Concept | Meaning | Typical registry location |
| --- | --- | --- |
| `ProjectDrawingSet` | Рабочая/проектная документация, на основании которой выполнялись работы | Блок комплекта рабочих чертежей. |
| `ExecutiveScheme` | Документ фактически выполненного результата | Блок исполнительных схем и съёмок. |

Смешение этих понятий приведёт к ошибочному реестру и неверным связям АОСР.

### 14.4 Initial scope

В первой модели metadata схемы вводятся вручную. Система не является CAD и не редактирует чертёж. OCR/AI-анализ схем, формальный versioning и автоматическое извлечение привязок относятся к deferred scope.

---

## 15. Package Model

### 15.1 Purpose

`Package` представляет комплект исполнительной документации, который пользователь собирает для контроля, передачи или архивирования. Это не папка файлов, а конфигурация и история сборок из проверяемых source entities.

### 15.2 Package configuration

Package configuration должна выражать:

- объект и scope, например раздел/папка/подбор документов;
- правила inclusion документов, сертификатов и схем;
- выбранный registry presentation/overrides;
- пользовательский ordering;
- выбранные output expectations;
- статус актуальности последнего build.

### 15.3 Default order

Принятый порядок по умолчанию:

1. Реестр.
2. Сертификаты и документы качества.
3. Акты.
4. Исполнительные схемы.

Пользователь может изменять порядок посредством package ordering, не меняя ownership исходных сущностей.

### 15.4 Build workflow

Package Builder должен концептуально выполнить:

1. Определить scope и включаемые source entities.
2. Проверить наличие необходимых original files и validation findings.
3. Построить registry projection с overrides.
4. Выбрать unique included certificate files.
5. Получить generated document artifacts для нужных document revisions/template versions.
6. Включить executive scheme files.
7. Применить ordering.
8. Сформировать output artifacts.
9. Сохранить immutable `PackageSnapshot` с provenance.

### 15.5 Async and snapshot rules

- Build является asynchronous background operation на уровне архитектуры.
- UI должен впоследствии уметь показывать status/progress/failure/retry, но механизм реализации не выбирается здесь.
- Успешный build создаёт snapshot.
- Если dependencies не изменились, допустимо выдавать ранее построенный актуальный snapshot.
- При изменении dependencies старый snapshot остаётся историческим, а для актуального вывода нужен новый build.

### 15.6 Dependency set

На актуальность package влияют:

- included document revisions;
- certificate entities/files и links;
- executive schemes/files;
- object/company/signer snapshots, используемые в output;
- registry overrides;
- package order и inclusion;
- template versions;
- generated artifact provenance.

---

## 16. Registry Projection Model

### 16.1 Registry status

Реестр является derived projection и может быть включён в package как generated artifact. Он должен быть пересобираемым и объяснимым из source entities.

### 16.2 Registry block specification

| Registry block | Required source | Expected output meaning |
| --- | --- | --- |
| Object header | `Object` and applicable object values | Объект, адрес, вид работ/раздел. |
| Contractor/company | `ObjectCompanySnapshot` and related object settings | Организации, договорные/СРО/руководящие реквизиты. |
| Working drawings | `ProjectDrawingSet` | Комплект рабочих чертежей, шифр и количество листов. |
| Quality documents | `Certificate` entities selected by scope/links | Сертификаты, декларации, паспорта и файлы подтверждения. |
| Acts | Typed `Document` revisions | Названия документов, rendered number, date, notes/status where displayed. |
| Executive schemes | `ExecutiveScheme` entities | Названия, регистрационные номера, даты и notes. |
| Registry signer | `RegistrySignerSnapshot` | Лицо, подписывающее данный реестр. |

### 16.3 Registry color semantics from source sample

| Color mapping | Data block | Modeling implication |
| --- | --- | --- |
| Жёлтый | Object data | Значения принадлежат объекту и не вводятся заново в каждой строке. |
| Красный | Certificates/quality documents | Строки должны иметь evidence-backed `Certificate` source. |
| Серый | Acts | Строки происходят из typed document revisions. |
| Зелёный | Executive schemes/drawings | Строки происходят из `ExecutiveScheme`. |
| Тёмно-красный | Registry signer | Значение происходит из selected signer snapshot. |

### 16.4 RegistryOverride boundary

Override разрешает управлять presentation:

- порядок строк/секций;
- включение или скрытие строки;
- печатное примечание;
- выбранный signer;
- ordering в конкретном package.

Override не может:

- создать отсутствующий certificate file;
- изменить дату/номер документа только в реестре;
- переписать реквизиты company snapshot;
- заменить metadata схемы вместо изменения source entity.

### 16.5 Freshness and rebuild

После изменения source entity projection должна быть рассчитана заново для актуального output. Сохранённый registry artifact внутри historical package snapshot остаётся привязанным к snapshot; он не переписывается вслед за текущими данными.

---

## 17. Relationships Matrix

### 17.1 Structural and organizational relationships

| From | Relationship | To | Cardinality intent | Ownership / rule |
| --- | --- | --- | --- | --- |
| `TenantContext` | contains/isolates | `Object` | one-to-many | Каждый object находится в tenant boundary. |
| `TenantContext` | contains/isolates | `CompanyProfile` | one-to-many | Library organisation не пересекает tenant без отдельного решения. |
| `TenantContext` | contains/isolates | `Certificate` | one-to-many | Certificate reuse ограничено tenant policy. |
| `Object` | configures | `EngineeringSystem` | one-to-many | Системы объекта используются works/documents/schemes. |
| `Object` | organizes through | `Folder` | one-to-many tree | Folder belongs to one object; no cross-object move. |
| `Object` | captures | `ObjectCompanySnapshot` | one-to-many as roles require | Snapshot используется historic output. |
| `CompanyProfile` | originates values for | `ObjectCompanySnapshot` | one-to-many | Последующее изменение profile не propagates automatically. |
| `Object` | refers to | `ProjectDrawingSet` | one-to-many candidate | Boundary remains to be ratified. |

### 17.2 Document and evidence relationships

| From | Relationship | To | Cardinality intent | Ownership / rule |
| --- | --- | --- | --- | --- |
| `Object` | contextualizes | `Document` | one-to-many | Document separate aggregate with `object_id`. |
| `Folder` | places | `Document` | one-to-many | Placement only; no lifecycle ownership. |
| `Document` | has typed data | typed payload | exactly one by type | Payload contract defined by immutable document type. |
| `Document` | represents/closes/tests | `WorkItem` | many-to-many or context-dependent | Relation type required; detailed cardinality open. |
| `Document` | cites/uses | `Certificate` | many-to-many | Via link; Certificate must have original file. |
| `MaterialUsage` | is evidenced by | `Certificate` | many-to-many | Validity assessed for document context. |
| `Document` | references | `ExecutiveScheme` | many-to-many | Scheme retains independent lifecycle/file. |
| `ExecutiveScheme` | confirms | `WorkItem` | many-to-many candidate | Exact requirement by document type open. |
| `Document` | renders with | `TemplateVersion` | one selected version per output context | Used version immutable. |

### 17.3 Revision, artifact and package relationships

| From | Relationship | To | Cardinality intent | Ownership / rule |
| --- | --- | --- | --- | --- |
| `Document` | produces history of | `DocumentRevisionSnapshot` | one-to-many | Revision captures document state/provenance. |
| `DocumentRevisionSnapshot` | generates | `GeneratedArtifact` | one-to-many | Artifact output is derived. |
| `TemplateVersion` | participates in | `GeneratedArtifact` | one-to-many | Artifact records chosen version. |
| `Package` | starts | `PackageBuild` | one-to-many | Build is asynchronous attempt. |
| `PackageBuild` | creates on success | `PackageSnapshot` | one successful result per attempt conceptually | Snapshot immutable. |
| `PackageSnapshot` | includes | `DocumentRevisionSnapshot` | many-to-many | Includes exact revisions, not moving latest pointers only. |
| `PackageSnapshot` | includes evidence | `Certificate`/file and `ExecutiveScheme`/file | many-to-many | Provenance identifies included files. |
| `PackageSnapshot` | includes output of | `RegistryProjection` | one or more outputs | Registry result reflects dependencies at build time. |
| `PackageSnapshot` | stores | `GeneratedArtifact` | one-to-many | Output files of build. |

### 17.4 Operational relationships

| From | Relationship | To | Rule |
| --- | --- | --- | --- |
| `DocumentLock` | leases editing of | `Document` | TTL/heartbeat; no revision on heartbeat. |
| `AutosaveSnapshot` | temporarily captures | `Document` editing state | Structured recovery state; publication semantics separate. |
| `OCRExtractionProposal` | proposes metadata for | `Certificate` or future `ExecutiveScheme` | Human confirmation before active source fields. |
| `ActivityEvent` | records action on | Domain target | Audit event detail remains to be specified. |

---

## 18. MVP Scope

### 18.1 Domain capabilities included in Data Model V1 baseline

MVP-oriented modeling baseline includes:

- isolated tenant-aware data boundary as an architectural invariant;
- construction object context;
- object-level systems for ОВиК and ВК;
- business folder organization and placement of documents;
- company profile with object company snapshots;
- typed `Document` base model;
- АОСР as first deeply described typed document;
- basic support for acts of testing as typed document family, pending exact forms;
- certificate library with original file requirement and date-relative validation;
- executive schemes as file-backed structured entities;
- working drawing set as a distinct concept;
- numbering, document date, representatives and revisions;
- registry derived projection and presentation overrides;
- package definition, async build principle and snapshots;
- templates with immutable used versions;
- generated artifact provenance;
- snapshot-based autosave and document locks as required interaction concepts;
- activity history and OCR confirmation concepts at architectural level.

### 18.2 What V1 is ready to enable next

После пользовательской проверки этого документа можно детализировать:

- typed payload contract АОСР;
- candidate aggregate boundary choices;
- exact MVP document list;
- invariants and validation catalog;
- status transitions and revision triggers;
- conceptual event/invalidation map.

Это ещё не означает разрешение автоматически выбирать БД, backend stack или API.

---

## 19. Deferred Scope

### 19.1 Implementation and technology choices

До отдельного решения отложены:

- физическая схема хранения и любые SQL/ORM decisions;
- тип базы данных, object storage и queue technology;
- backend/frontend framework;
- API/transport model;
- deployment, Docker и CI/CD;
- PDF/DOCX generation technology;
- search indexing implementation.

### 19.2 Domain details requiring validation

Отложены до уточнения с пользователем:

- полный набор typed documents MVP и конкретные виды актов испытаний;
- typed payload акта технической готовности;
- обязательность отдельного `Material` catalog;
- степень нормализации WorkItem/location/normative documentation;
- точный lifecycle statuses и validation blocking rules;
- detailed RBAC;
- граница `ProjectDrawingSet`;
- модель замены/версий certificates и executive schemes;
- формальная модель signatures и юридически значимого подписания.

### 19.3 Advanced product functionality

Не входит в текущий scope:

- collaborative real-time editing beyond locks;
- offline mode;
- ЭЦП;
- import legacy DOCX/PDF as data source;
- BIM, CAD или ERP integrations;
- external/public API;
- automatic OCR/AI approval;
- универсальный конструктор документов;
- ERP/DMS/file-manager functionality.

---

## 20. Open Questions

### 20.1 Questions requiring product/domain confirmation

1. Какие точные типы документов помимо АОСР должны войти в первый работающий набор: какие виды актов испытаний и нужен ли `TECHNICAL_READINESS_ACT` в первом scope?
2. Какие поля АОСР должны быть обязательными errors, а какие дают warnings?
3. Нужен ли полноценный каталог материалов/оборудования в MVP или достаточно structured `MaterialUsage` в документе со ссылкой на Certificate Library?
4. Какой уровень структуры нужен для мест выполнения работ: свободный rendered text, оси/отметки/этажи как отдельные значения или оба слоя?
5. Какой набор representatives/signature blocks обязателен для АОСР и каждого типа акта?

### 20.2 Questions requiring boundary decisions

1. Является ли `FolderTree` отдельным aggregate root либо частью ограниченного `Object` aggregate с отдельными document references?
2. Где проходит boundary `ProjectDrawingSet`: внутри ObjectDocumentationSettings или как самостоятельный aggregate?
3. Следует ли `WorkItem` сделать отдельным aggregate либо typed entity внутри work-document workflows на первом этапе?
4. Каким образом хранятся snapshots representatives на уровне object/document/registry без ненужного дублирования, но с исторической воспроизводимостью?
5. Какая модель replacement/supersession нужна certificate file и executive scheme file после участия в package?

### 20.3 Questions requiring lifecycle decisions

1. Нужны ли состояния `in_review`, `approved`, `issued`, `superseded` и `needs_regeneration` в document lifecycle либо часть из них является projection state?
2. Когда для draft создаётся новая revision, а когда достаточно обновить autosave snapshot?
3. Как пользователь видит и разрешает lock timeout/override/conflict?
4. Должен ли warning о certificate expiry когда-либо становиться hard error для конкретных document types или требований заказчика?
5. Как оформляется явное обновление ObjectCompanySnapshot, если реквизиты на активном объекте действительно нужно изменить?

### 20.4 Questions required before generation/storage design

1. Какой rendering contract должен связывать typed payload, template version, HTML preview и DOCX/PDF outputs?
2. Какие dependency changes вызывают mandatory rebuild package, а какие только informational warning?
3. Какие historical artifacts должны храниться обязательно и каков срок retention?
4. Как должна быть устроена privacy policy для оригиналов и возможной OCR/AI обработки?
5. Какой минимальный audit trail нужен для юридически и практически полезной истории ИД?

### 20.5 Completion criterion for this stage

Data Model V1 считается готовой основой для следующей детализации после проверки владельцем проекта по следующим пунктам:

- состав MVP document types;
- статус candidate aggregate boundaries;
- обязательные поля/валидации АОСР;
- правила lifecycle/revision/package invalidation;
- допустимый scope дальнейшего архитектурного документа.

До такой проверки документ является подробной формализацией текущих принятых решений, но не разрешением начинать реализацию приложения.
