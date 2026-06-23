# 08. Document Types Catalog

# PTO ID System

# Каталог типов документов, evidence items, projections и package outputs

Статус: draft catalog for review.

Дата фиксации: 2026-05-26.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Связанные спецификации: `docs/06-data-model-v1.md`, `docs/07-aosr-domain-specification.md`, ADR 0001-0007 и sample analyses.

Object-template amendment note, 2026-06-22: active acts follow ADR 0007.
Linked acts resolve template-owned participant/company data through
`ObjectTemplate`; manual acts use one complete snapshot; released revisions
freeze exact resolved output. A participant snapshot mentioned below is a
release/manual boundary, not a mandatory copy in every working act.

---

## 1. Purpose

Этот документ формирует предметный каталог видов исполнительной документации PTO ID System для MVP-oriented design и последующего расширения. Он отвечает на два разных вопроса:

1. Какие документальные сущности и выходы система должна понимать в предметной области.
2. Какие из них являются typed documents внутри `Document`, а какие остаются evidence items, derived projections или package artifacts.

Каталог не утверждает физическую реализацию и намеренно не содержит кода, SQL, API, стека, инфраструктуры, миграций или frontend design.

### 1.1 What this catalog does not silently decide

Проект уже фиксирует АОСР как первый полностью описанный typed document и признаёт необходимость актов испытаний, сертификатов, схем, реестров и комплектов. Однако точный набор первых видов актов испытаний ещё не ратифицирован владельцем проекта.

Поэтому в этом каталоге используются статусы:

- **MVP baseline** - категория необходима для целевого MVP согласно master context;
- **MVP typed baseline** - тип уже имеет достаточную предметную основу для первого typed contract;
- **MVP candidate** - тип соответствует заявленной области MVP, но его включение и payload требуют подтверждения;
- **Deferred** - тип признан нужным для расширения либо обнаружен в источниках, но не должен считаться утверждённым первым объёмом.

---

## 2. Document Type Principles

### 2.1 Normative architectural rules

Все категории каталога подчиняются уже принятым правилам:

1. `SOURCE OF TRUTH = STRUCTURED DATA`.
2. Акт является typed document с известной семантикой, а не произвольным файлом или generic form.
3. `Registry` является derived projection, а экспорт реестра - generated artifact.
4. `Certificate`, `Declaration` и `Passport`, используемые как документы качества, должны иметь физический evidence file.
5. Проверка срока действия документа качества выполняется относительно даты документа, который на него ссылается.
6. `final` typed document исправляется через новую revision.
7. Использованная `TemplateVersion` неизменяема.
8. `Package` собирается асинхронно и фиксируется snapshot-based.
9. `Object` задаёт контекст, но не является giant aggregate для всех документов и файлов.
10. OCR/AI предоставляет proposals, а подтверждение critical metadata остаётся у пользователя.

### 2.2 Catalog scope versus `DocumentType`

Термин "тип документа" в пользовательской практике включает акты, схемы, документы качества, реестры и комплекты. В доменной модели они классифицируются по-разному:

| Category | Domain meaning | Stored truth owner |
| --- | --- | --- |
| Typed act | Документ с typed payload, lifecycle and revisions | `Document` aggregate. |
| Evidence item | Физический подтверждающий файл + structured metadata | Independent evidence aggregate, such as `Certificate` or `ExecutiveScheme`. |
| Projection | Сформированное представление состава документов | `RegistryProjection`, derived from source entities. |
| Package artifact | Собранный зафиксированный output | `Package` / immutable `PackageSnapshot`. |

Следствие: наличие категории в этом каталоге не означает, что она становится значением `Document.document_type`.

### 2.3 Immutable type and explicit relationships

- Typed document получает type при создании и не превращается в другой type.
- Специализированный акт испытаний не маскируется строкой вида испытания в generic document без утверждённого typed contract.
- Evidence items связываются с acts явно, а их номера не заменяют relation.
- Registry and package read typed/evidence data; они не владеют source values.

---

## 3. MVP Document Types

### 3.1 MVP-oriented catalog

| Type / category | Classification | MVP status | Why it is in MVP-oriented catalog |
| --- | --- | --- | --- |
| `AOSR` / АОСР | Typed document | MVP typed baseline | Основной акт скрытых работ; формализован отдельной спецификацией. |
| `TestAct` / акты испытаний | Typed document family | MVP baseline family; forms to ratify | ОВиК/ВК требуют актов испытаний, но точные формы открыты. |
| `HydraulicTestAct` / акт гидравлического испытания | Specialized typed act candidate | MVP candidate | Прямо упомянут как возможный вид испытаний для ВК/ОВиК. |
| `PressureTestAct` / акт опрессовки | Specialized typed act candidate | MVP candidate | Практически значим для систем; payload/включение требуют подтверждения. |
| `FlushingAct` / акт промывки | Specialized typed act candidate | MVP candidate | Прямо упомянут в family актов испытаний; exact scope не утверждён. |
| `ExecutiveScheme` / исполнительная схема | Evidence item | MVP baseline | Фактическая схема нужна в документации/реестре/package. |
| `Certificate` / сертификат | Quality evidence item/family | MVP baseline | Подтверждает материалы; physical file обязателен. |
| `Declaration` / декларация | Quality evidence kind under certificate library | MVP baseline evidence kind | Присутствует в реальном примере реестра и перечне документов качества. |
| `Passport` / паспорт | Quality evidence kind under certificate library | MVP baseline evidence kind | Паспорт качества/технический паспорт входят в документы качества. |
| `Registry` / реестр | Derived projection + generated output | MVP baseline | Нужен для состава ИД, но не является source of truth. |
| `Package` / комплект ИД | Package configuration + snapshot/artifact | MVP baseline | Целевой собранный результат документации. |

### 3.2 MVP boundary caution

`HydraulicTestAct`, `PressureTestAct` и `FlushingAct` включены как candidates внутри уже заявленного направления "акты испытаний", а не как окончательно утверждённая первая поставка. До ратификации нельзя считать, что MVP обязан включать все три формы одновременно или что одна может заменить другую.

---

## 4. Deferred Document Types

### 4.1 Known deferred types

| Type | Classification | Reason for deferral | What is known now |
| --- | --- | --- | --- |
| `TechnicalReadinessAct` / акт технической готовности | Typed document candidate | Обнаружен в sample registry, но typed schema не определена | Должен иметь number/date/work/system/participants/revision and registry participation once specified. |
| Pneumatic testing act | Specialized `TestAct` candidate | Упомянут как возможный вид испытания, но не запрошен как first catalog core | Требует предметных параметров и обязательности. |
| Tightness/leak test act | Specialized `TestAct` candidate | Возможен для систем, exact form не утверждена | Не заменяется generic test string without schema. |
| Individual equipment testing act | Specialized `TestAct` candidate | Относится к оборудованию; scope MVP не решён | Потребуются equipment and measured-result semantics. |
| Photo evidence document | Evidence/attachment candidate | Упомянут как возможное приложение АОСР, ownership не утверждён | Не считается typed act без отдельной спецификации. |
| Test protocol / measurement record | Evidence or typed supporting document candidate | Граница attachment versus typed document открыта | Может поддерживать будущие test acts. |

### 4.2 Deferral rule

Deferred type нельзя реализовать как произвольный JSON или свободный generated form только из-за отсутствия текущей спецификации. Для его включения требуется typed/evidence classification, payload, validation, projection and package rules.

---

## 5. Type Classification

### 5.1 Classification register

| Type | Purpose | Classification | Source of truth | Aggregate/lifecycle owner | Derived? |
| --- | --- | --- | --- | --- | --- |
| `AOSR` | Освидетельствовать скрытые работы | Typed document | Structured `AOSRPayload`, number/date, links and revision snapshots | `Document` | No |
| `TestAct` | Фиксировать испытание и заключение | Typed document family | Structured testing payload for selected concrete form | `Document` | No |
| `HydraulicTestAct` | Фиксировать гидравлическое испытание | Specialized typed document candidate | Future approved hydraulic test payload | `Document` if ratified | No |
| `PressureTestAct` | Фиксировать опрессовку | Specialized typed document candidate | Future approved pressure test payload | `Document` if ratified | No |
| `FlushingAct` | Фиксировать промывку системы | Specialized typed document candidate | Future approved flushing payload | `Document` if ratified | No |
| `TechnicalReadinessAct` | Фиксировать техническую готовность системы | Typed document candidate | Future typed payload | `Document` if specified | No |
| `ExecutiveScheme` | Подтвердить фактически выполненное решение | Evidence item | Structured metadata plus physical scheme file | `ExecutiveScheme` aggregate | No |
| `Certificate` | Подтвердить качество/соответствие | Quality evidence aggregate/family | Confirmed metadata plus physical original file | `Certificate` aggregate | No |
| `Declaration` | Подтвердить соответствие декларацией | Kind of quality evidence item | Confirmed declaration metadata plus physical file | `Certificate` aggregate model | No |
| `Passport` | Подтвердить качество/характеристики паспортом | Kind of quality evidence item | Confirmed passport metadata plus physical file | `Certificate` aggregate model | No |
| `Registry` | Показать состав ИД и сформировать реестр | Derived projection/output | Upstream aggregates + snapshots + allowed overrides | `RegistryProjection` / output context | Yes |
| `Package` | Собрать комплект ИД | Package configuration and snapshot artifact | Package configuration + exact source revision/file provenance | `Package` aggregate/context | Output is derived |

### 5.2 Evidence family terminology

В текущей модели `Certificate` служит umbrella concept для документов качества. `Declaration` и `Passport` не объявляются typed acts: они являются видами file-backed quality evidence в Certificate Library. Нужна ли в будущем более общая терминология, например `QualityEvidenceDocument`, остаётся открытым вопросом и не меняет текущих правил evidence.

### 5.3 Test act family terminology

`TestAct` обозначает family typed documents. Каталог рассматривает `HydraulicTestAct`, `PressureTestAct` и `FlushingAct` как специализированные candidate contracts, потому что их предметные поля различаются. Решение о том, моделировать ли family через отдельные immutable document types или утверждённую общую основу с строгими subtypes, остаётся на последующую ратификацию.

### 5.4 Per-type domain profile

| Type | Main fields / structured content | Key relationships | MVP obligation status | Individual open question |
| --- | --- | --- | --- | --- |
| `AOSR` | Number, date, work/location/period, project refs, materials, participants, conclusion, links, revision | WorkItem, MaterialUsage, quality evidence, ExecutiveScheme, TemplateVersion, Registry, Package | MVP typed baseline | Which exact form-specific fields and participant roles block finalization? |
| `TestAct` | Tested subject, test kind/method, parameters, results, date/time, participants, conclusion | System/work, related acts/schemes/evidence, TemplateVersion, Registry, Package | MVP baseline family | Which concrete forms constitute first MVP scope? |
| `HydraulicTestAct` | Tested system, hydraulic method, applicable measured values, duration/result/conclusion, participants | TestAct family, system/work, related evidence/schemes/package | MVP candidate | What parameters and acceptance criteria are mandatory in the approved form? |
| `PressureTestAct` | Tested system/section, pressurization basis, target/actual values, hold/result/conclusion, participants | TestAct family, system/work, instruments/evidence where required, package | MVP candidate | Is it a distinct form from hydraulic testing in initial domain scope? |
| `FlushingAct` | Flushed system/section, method/medium where required, period/result/conclusion, participants | TestAct family, system/work, protocols/evidence where required, package | MVP candidate | Which result/protocol evidence is obligatory? |
| `TechnicalReadinessAct` | Expected number/date, system, readiness subject, findings/conclusion, participants; schema not approved | Preceding acts/schemes and Registry/Package once specified | Deferred candidate | Must it enter MVP and what is its typed payload? |
| `ExecutiveScheme` | Title, registration number, date, sheet count, note, original file and context metadata | Object/folder/system, works, acts, Registry, Package | MVP baseline evidence | When is a scheme mandatory for each act/work type and how is replacement modeled? |
| `Certificate` | Evidence kind, registration number, coverage, manufacturer/issuer, dates/validity, page/file, confirmation state | MaterialUsage/acts, Registry, Package | MVP baseline evidence | Is a broader quality-evidence aggregate name needed later? |
| `Declaration` | Declaration identifier, declared product/equipment, declarant/issuer, applicable dates, original file | MaterialUsage/acts, Registry, Package through evidence model | MVP baseline evidence kind | Which declaration-specific validity/coverage fields are mandatory? |
| `Passport` | Passport kind/reference, product/equipment, manufacturer, pages/file, relevant dates/metadata | MaterialUsage/acts, Registry, Package through evidence model | MVP baseline evidence kind | Do quality and technical passports require distinct kinds/rules? |
| `Registry` | Scope, resolved blocks/rows, ordering/overrides, signer and provenance for output | Projects/snapshots, typed acts, evidence, schemes, Package | MVP baseline derived projection | Which concrete registries/exports are first MVP deliverables? |
| `Package` | Scope, inclusion policy, order, build status, snapshot, artifacts and provenance | Registry, exact act revisions, evidence originals, scheme files | MVP baseline package context/output | What completeness requirements and output variants define readiness? |

---

## 6. Typed Payload Rules

### 6.1 Universal typed document contract

Каждый typed act (`AOSR`, утверждённый `TestAct` subtype и будущий `TechnicalReadinessAct`) должен иметь:

- immutable document type;
- object and folder context;
- system/discipline context where applicable;
- document number and document date;
- lifecycle status and revision;
- structured payload, соответствующий семантике type;
- representative snapshots where the form records participants/signers;
- explicit links to related work, evidence and supporting documents where applicable;
- selected `TemplateVersion` for released output;
- validation result and generated artifact provenance.

### 6.2 Payload rules by typed act

| Typed act | Minimum conceptual payload | Cannot be substituted by |
| --- | --- | --- |
| `AOSR` | Concealed work, location, period, project references, materials/evidence links, participants, subsequent work conclusion, attachments | A DOCX template or arbitrary text document. |
| `TestAct` family | Tested subject, method/type, parameters, actual results, time/date, participants, instruments where applicable, conclusion and links | Free-form "test description" without type validation. |
| `HydraulicTestAct` | Test subject/system, hydraulic method/basis, pressure or applicable measured parameters, duration/result/conclusion, participants and supporting refs | Generic `TestAct` until its required hydraulic fields are approved. |
| `PressureTestAct` | Pressurized subject, method/basis, target/actual pressure or applicable values, holding/result/conclusion and participants | A name-only subtype without field rules. |
| `FlushingAct` | System/section flushed, method/medium where applicable, completion/results/acceptance, participants and supporting refs | Unstructured attachment note. |
| `TechnicalReadinessAct` | To be specified from domain review; at minimum identity, assessed system, number/date, findings/conclusion and participants are expected | Implementation before schema approval. |

### 6.3 Evidence item contract

Evidence items are structured but do not inherit typed-act payload rules:

| Evidence type | Required content baseline | File rule |
| --- | --- | --- |
| `Certificate` | Kind, registration number where applicable, coverage, issuer/manufacturer, issuance/validity metadata, confirmation state | Physical original required before evidence use. |
| `Declaration` | Kind = declaration, registration identifier, declared product/equipment, issuer/declarant/validity metadata as applicable | Physical declaration file required. |
| `Passport` | Kind = passport/technical passport, identified product/equipment, manufacturer, document reference and page/file metadata | Physical passport file required. |
| `ExecutiveScheme` | Title, registration number, date, sheet count/note, object/folder/system and relations | Physical scheme file required for registry/package inclusion. |

### 6.4 Non-payload categories

`Registry` and `Package` do not receive act payloads:

- `Registry` resolves rows and blocks from source entities and `RegistryOverride`.
- `Package` stores scope/order/build/snapshot provenance and includes exact revisions/files.

---

## 7. Validation Rules by Document Type

### 7.1 Universal validation semantics

| Level | Meaning |
| --- | --- |
| `ERROR` | Blocks release/inclusion where required evidence or typed integrity is missing. |
| `WARNING` | Requires attention or acknowledgement, but does not automatically block under current accepted rule. |
| `INFO` | Explains state, provenance, reuse or historical validity without declaring failure. |

### 7.2 AOSR

| Level | Baseline findings |
| --- | --- |
| `ERROR` | Missing object/number/date/work description; missing required resolved participant data for an approved form at release; certificate text without file-backed relation; linked scheme stated as attachment without file; missing usable template for released output. |
| `WARNING` | Certificate expired relative to AOSR date; material/evidence applicability unclear; scheme expected in practice but not mandated by ratified form; earlier output is stale after content change. |
| `INFO` | Evidence valid on historical document date despite later expiry; certificate reused elsewhere; snapshot differs from current profile; previous revision exists in historical package. |

Complete AOSR draft validation is defined in `docs/07-aosr-domain-specification.md`.

### 7.3 TestAct family

| Level | Candidate findings pending subtype ratification |
| --- | --- |
| `ERROR` | Missing tested subject, test type/method, date, measured/result values required by the selected concrete form, conclusion or required resolved participant data at release; released output lacking template version. |
| `WARNING` | Referenced supporting evidence/scheme is incomplete where its obligation is not yet approved; values require engineering review; changed source makes output stale. |
| `INFO` | Related acts/evidence included; prior revision remains in package history. |

### 7.4 HydraulicTestAct

| Level | Candidate findings |
| --- | --- |
| `ERROR` | No tested system/section, no hydraulic test parameters or result/conclusion after the subtype is approved, or required signed context missing. |
| `WARNING` | Measurement/supporting-document completeness uncertain until the first form is ratified; unexpected but not prohibited values need review. |
| `INFO` | Relation to AOSR/work/scheme shown for traceability. |

### 7.5 PressureTestAct

| Level | Candidate findings |
| --- | --- |
| `ERROR` | No pressurized subject, required pressure/result/conclusion data absent after form approval. |
| `WARNING` | Acceptance parameters or instrument references require review where the form is not yet fixed. |
| `INFO` | Historical revision/package provenance or related work links. |

### 7.6 FlushingAct

| Level | Candidate findings |
| --- | --- |
| `ERROR` | No flushed system/section or no result/conclusion after typed form approval. |
| `WARNING` | Method/medium/supporting protocol expected but required status not ratified. |
| `INFO` | Relationship to system, test family and package composition. |

### 7.7 TechnicalReadinessAct

| Level | Status |
| --- | --- |
| `ERROR` | Cannot be finalized under this catalog until its typed contract and required fields are approved. |
| `WARNING` | Appearance in imported/reference registry indicates required domain analysis. |
| `INFO` | Recognized as an act type from sample material. |

### 7.8 Quality evidence: Certificate, Declaration and Passport

| Level | Findings applying to quality evidence items |
| --- | --- |
| `ERROR` | Missing physical original when used in act/registry/package; missing identity kind; unconfirmed OCR metadata required for released output. |
| `WARNING` | Expired on referencing document date; product/material applicability needs human confirmation; replacement/supersession ambiguity. |
| `INFO` | Expired today but valid on referencing historical date; reused by several acts; included in historical package snapshot. |

### 7.9 ExecutiveScheme

| Level | Findings |
| --- | --- |
| `ERROR` | Scheme is referenced or included without physical file; required scheme missing once requirement is ratified. |
| `WARNING` | Scheme expected but obligation open; replacement/version ambiguity after historical use. |
| `INFO` | Used by several acts or included in a package snapshot. |

### 7.10 Registry and Package

| Type | `ERROR` | `WARNING` | `INFO` |
| --- | --- | --- | --- |
| `Registry` | Projection attempts to display referenced evidence lacking required source/file; required block cannot resolve from sources | Projection stale or rows suppressed/overridden for review | Generated from named sources/snapshot with overrides |
| `Package` | Required source revision/artifact/evidence file missing for build scope | Snapshot stale after dependency changes; non-blocking findings exist in included docs | Build/snapshot provenance, cached current snapshot, historical outputs |

---

## 8. Registry Behavior by Document Type

### 8.1 Registry invariants

`Registry` is derived projection. Values are read from type owners and may be arranged by approved overrides; a registry row never becomes the only storage of a document's meaning.

### 8.2 Registry mapping

| Type | Registry block / representation | Exported values baseline | Registry must not own |
| --- | --- | --- | --- |
| `AOSR` | Acts block | Display type, work description, rendered number, date, note/scope where configured | Work payload, number/date, revisions, evidence links. |
| `TestAct` family | Acts block | Concrete act display name, tested subject/result description as form allows, number/date/note | Test payload or status transitions. |
| `HydraulicTestAct` | Acts block if ratified | Hydraulic act caption, system/section, number/date, note | Test parameters/results. |
| `PressureTestAct` | Acts block if ratified | Pressure-test caption, system/section, number/date, note | Pressure acceptance values. |
| `FlushingAct` | Acts block if ratified | Flushing caption, system/section, number/date, note | Flush result data. |
| `TechnicalReadinessAct` | Acts block once specified | Act caption, system, number/date, note | Unspecified payload. |
| `ExecutiveScheme` | Executive schemes block | Title, registration number, date, sheet count, note | Scheme metadata or file. |
| `Certificate` | Quality documents block | Kind/name, coverage, issuer, dates, registration number, page/file presence | Certificate metadata/file. |
| `Declaration` | Quality documents block | Declaration kind, product/equipment, issuer/date/validity, registration number | Declaration evidence source. |
| `Passport` | Quality documents block | Passport kind, product/equipment/manufacturer, reference/pages | Passport evidence source. |
| `Registry` | Entire projection | Header, contractor, drawing set, evidence, acts, schemes, signer | Upstream source data. |
| `Package` | Optional package composition/output context | Inclusion/order/readiness, if a package-oriented registry is produced | Included source revision/content. |

### 8.3 Override rule

Overrides may adjust registry presentation, including order, inclusion/hiding, notes and selected signer. They do not create, rewrite or validate source document content independently of its owner.

---

## 9. Package Behavior by Document Type

### 9.1 Default output order

Уже принятый default ordering:

1. Registry output.
2. Certificates, declarations, passports and other quality evidence.
3. Typed acts.
4. Executive schemes.

### 9.2 Package inclusion register

| Type | Inclusion in package | Included form | Staleness trigger |
| --- | --- | --- | --- |
| `AOSR` | By selected scope and final revision | Generated artifact from exact revision/template | New revision, evidence/attachment relation or output template change. |
| `TestAct` family | By selected scope after concrete type ratification | Generated artifact from exact revision/template | New revision or related evidence/template change. |
| `HydraulicTestAct` | Candidate inclusion as act | Generated act artifact | Same as typed act after ratification. |
| `PressureTestAct` | Candidate inclusion as act | Generated act artifact | Same as typed act after ratification. |
| `FlushingAct` | Candidate inclusion as act | Generated act artifact | Same as typed act after ratification. |
| `TechnicalReadinessAct` | Deferred until schema approval | Future generated act artifact | Rules deferred. |
| `Certificate` | Included when selected/referenced by scope | Original evidence file | File/confirmed metadata/link or inclusion change. |
| `Declaration` | Included as quality evidence | Original declaration file | Same evidence dependency rule. |
| `Passport` | Included as quality evidence | Original passport file | Same evidence dependency rule. |
| `ExecutiveScheme` | Included when in scope or required as attachment | Original scheme file | File/metadata/link or inclusion change. |
| `Registry` | Included as leading generated output by default | Registry artifact from sources/overrides | Any projected source or override change. |
| `Package` | Container/result rather than included source | Snapshot and merged/archived outputs | Any dependency/order/scope change creates need for new build. |

### 9.3 Snapshot rule

Package output must record exact included document revisions, evidence file identities, registry result, ordering and template/artifact provenance. Dependency change stales a current output for a new build; it does not overwrite an immutable historical snapshot.

---

## 10. Template Requirements by Document Type

### 10.1 Template principles

- A rendered act or registry output must identify its `TemplateVersion`.
- After first use in released output, a `TemplateVersion` is immutable.
- A new customer form or changed form is a new version/binding, not silent mutation.
- Template requirements describe rendering contracts only; no template engine is selected here.

### 10.2 Template register

| Type | Template need | Required rendering coverage | Status/open aspect |
| --- | --- | --- | --- |
| `AOSR` | Required for released rendered act | Header, participants, work, materials/evidence references, schemes/attachments, conclusion/signatures | First detailed domain spec exists; exact customer form to approve. |
| `TestAct` family | Required per approved concrete rendered act | Tested subject, method/parameters/results, participants, conclusion/links | Forms not yet ratified. |
| `HydraulicTestAct` | Candidate dedicated version or governed subtype template | Hydraulic-specific measured/result presentation | Choice awaits payload/form approval. |
| `PressureTestAct` | Candidate dedicated version or governed subtype template | Pressure-test parameters/conclusion | Choice awaits payload/form approval. |
| `FlushingAct` | Candidate dedicated version or governed subtype template | Flushing method/result/conclusion | Choice awaits payload/form approval. |
| `TechnicalReadinessAct` | Future required template | To be established from specification | Deferred. |
| `Certificate`, `Declaration`, `Passport` | No generation template needed for original evidence; registry display template applies | Original file is preserved; metadata can render in registry | Whether covers/previews are generated is open. |
| `ExecutiveScheme` | No act-generation template for original scheme; registry/package presentation applies | Original file plus metadata row/caption | Generated covers/assembly details open. |
| `Registry` | Required for exported registry artifact | Blocks, columns, ordering, signer and overrides | Registry export form variants to specify. |
| `Package` | Output assembly/presentation rules rather than source-document template | Ordering, covers/opisi if later required, generated outputs provenance | Package cover/opis forms open. |

---

## 11. Snapshot/Revision Requirements

### 11.1 Typed documents

| Type group | Revision behavior | Snapshot must preserve |
| --- | --- | --- |
| `AOSR` | Final content edits create new revision | Number/date, structured payload, exact resolved participant output, evidence/scheme links and provenance, validation, TemplateVersion and artifact provenance. |
| Approved `TestAct` types | Must follow final-edit-through-revision principle | Typed test data, participants, links, validation, template/artifact provenance. |
| `TechnicalReadinessAct` | Must follow principle if later defined as typed act | Exact contents deferred until schema exists. |

### 11.2 Evidence items

| Evidence type | Historical requirement |
| --- | --- |
| `Certificate`, `Declaration`, `Passport` | Physical file and output-relevant confirmed metadata used by a document/package must not be silently overwritten or removed from historical provenance. |
| `ExecutiveScheme` | Used physical scheme file and output metadata must be traceable; replacement/version policy remains open. |

### 11.3 Projections and packages

| Type | Snapshot/revision meaning |
| --- | --- |
| `Registry` | Current projection can recalculate; registry output captured in historical package remains tied to source snapshot/provenance. |
| `Package` | Every successful build creates immutable snapshot; current staleness does not delete past result. |

### 11.4 Autosave and operational state

Autosave snapshot and document lock behavior apply to editable typed acts but do not create released revisions merely through heartbeat or draft recovery activity. Exact draft-revision policy remains open.

---

## 12. Relationships Between Document Types

### 12.1 Relationship matrix

| Source type | Relationship | Target type | Meaning / rule |
| --- | --- | --- | --- |
| `AOSR` | references evidence for materials/equipment | `Certificate` / `Declaration` / `Passport` | Link renders evidence identity; physical file required. |
| `AOSR` | may reference/as attach | `ExecutiveScheme` | Scheme supports factual work; obligation conditional until ratified. |
| `AOSR` | may relate to test evidence/documentation | `TestAct` subtype | Exact requirement by work/form remains open. |
| `TestAct` subtype | tests work/system associated with | `AOSR` / shared `WorkItem` | Acts may cover related work; does not merge document identities. |
| `HydraulicTestAct` | is candidate specialized form of | `TestAct` family | Requires approved typed payload. |
| `PressureTestAct` | is candidate specialized form of | `TestAct` family | Requires approved typed payload. |
| `FlushingAct` | is candidate specialized form of | `TestAct` family | Requires approved typed payload. |
| `TechnicalReadinessAct` | may summarize/confirm readiness after | Acts and schemes | Relation and required preceding documents deferred. |
| `Registry` | projects | All selected acts/evidence/schemes | Rows/blocks derive from sources and overrides. |
| `Package` | includes exact outputs/files of | Registry, acts, evidence and schemes | Snapshot records source revision/file provenance and order. |

### 12.2 No accidental hierarchy

The catalog does not assert that:

- evidence items are typed `Document` acts;
- registry rows are documents;
- package content owns source act data;
- a generic `TestAct` can be released without an approved concrete payload;
- all candidate test acts are required for the first MVP release.

---

## 13. Open Questions

### 13.1 MVP selection

1. Какие concrete test acts входят в первый рабочий MVP: `HydraulicTestAct`, `PressureTestAct`, `FlushingAct` или иной ограниченный набор?
2. Нужен ли `TechnicalReadinessAct` в MVP, учитывая его присутствие в sample registry?
3. Требуются ли отдельные kinds/typed entries для писем качества, протоколов и иных документов evidence помимо certificate/declaration/passport?

### 13.2 Type boundaries

1. Должны ли specialized testing acts быть отдельными immutable `DocumentType` либо строго типизированными variants внутри approved `TestAct` family contract?
2. Следует ли переименовать umbrella `Certificate` aggregate в более широкий `QualityEvidenceDocument`, сохранив file-backed rule?
3. Когда supporting protocol становится typed document, а когда остаётся attachment/evidence item?

### 13.3 Validation and relationships

1. Каковы обязательные fields and blocking validation для каждого concrete test act?
2. Какие documents/evidence обязательны для готовности package по каждой системе ОВиК/ВК?
3. Когда наличие схемы, паспорта или declaration является hard requirement для конкретного act/work type?
4. Какие relationships должны связывать `TechnicalReadinessAct` с preceding acts/schemes?

### 13.4 Templates and lifecycle

1. Какие первые approved forms/templates нужны для candidate test acts and registry?
2. Требуются ли package covers/opisi как отдельные generated output templates?
3. Какова replacement/supersession policy evidence files, участвовавших в released documents/packages?
4. Какие дополнительные lifecycle states нужны для typed acts beyond `draft`, `final`, `archived`, `deleted`?

### 13.5 Decisions not introduced by this catalog

Каталог не утверждает окончательный MVP type list и не изменяет архитектурные принципы проекта. Он систематизирует уже признанные категории и выставляет candidate/deferred status там, где существующая документация оставляет выбор открытым. Любое утверждение новых обязательных forms или изменение source-of-truth, registry, template or package principles потребует отдельной фиксации согласно policy проекта.
