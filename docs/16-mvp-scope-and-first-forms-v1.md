# 16. MVP Scope and First Forms V1

# PTO ID System

# Product scope for the first production-usable delivery

Статус: product/MVP-scope specification for review before technology selection and implementation strategy.

Дата фиксации: 2026-05-28.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание: `docs/07-aosr-domain-specification.md`, `docs/08-document-types-catalog.md`, `docs/12-database-schema-v1.md`, `docs/13-domain-lifecycle-immutability-validation-v1.md`, `docs/14-backend-api-architecture-v1.md`, `docs/15-api-command-readmodel-contracts-v1.md`, ADR 0001-0005, sample analyses.

Этот документ фиксирует первый реалистичный product scope PTO ID System. Он не является техническим заданием на код, SQL, API, OpenAPI, ORM, frontend scaffold, deployment или выбор стека.

Неприкосновенные принципы:

- MVP must work without AI/OCR;
- `SOURCE OF TRUTH = STRUCTURED DATA`;
- DOCX, PDF, ZIP, registry exports and packages are generated artifacts;
- `AOSR` is the first mandatory first-class typed form;
- certificate and executive scheme references require physical original files;
- registry is a derived projection;
- package build is snapshot-based and asynchronous by architecture;
- the product must not become ERP, ECM, Google Drive, generic document builder or enterprise coordination platform.

---

## 1. Purpose and Scope

Этот MVP document нужен, чтобы остановить расползание scope перед выбором стека и началом implementation planning. Предыдущие документы описали архитектурную модель шире, чем первая production delivery. Здесь фиксируется минимальный продукт, который действительно можно выпустить, проверить на реальных инженерах ПТО и развивать дальше без поломки архитектуры.

MVP в этом документе означает:

- первая production-usable версия для подготовки ограниченного комплекта исполнительной документации по объекту;
- end-to-end workflow вокруг АОСР, документов качества, исполнительных схем, реестра и package output;
- достаточно функций, чтобы инженер ПТО мог не возвращаться в ручной Word/Excel как главный source of truth для поддерживаемого сценария;
- строго ограниченный набор typed forms и правил validation;
- UX, который помогает начать работу, но не превращает систему в обучающий комбайн или enterprise suite.

В MVP не входит:

- полная автоматизация всей исполнительной документации;
- все типы актов испытаний;
- акт технической готовности как generated typed form;
- полноценный документооборот согласований;
- ЭЦП/юридически значимое подписание;
- AI/OCR как обязательная часть продукта;
- generic file drive, generic task manager, generic form builder или template marketplace;
- выбор stack/provider/database/renderer/queue/storage.

Если feature не нужна для первого end-to-end АОСР package workflow, она по умолчанию deferred.

---

## 2. MVP Product Goal

Первая версия решает одну прикладную проблему: инженер ПТО должен быстро собрать корректный, проверяемый и воспроизводимый пакет исполнительной документации по скрытым работам без ручного дублирования данных между актами, сертификатами, схемами, реестром и архивом файлов.

Основной пользовательский workflow должен быть production-usable:

1. Создать workspace и объект.
2. Настроить минимальные данные объекта, папки, numbering и участников.
3. Загрузить документы качества в certificate library.
4. Загрузить исполнительные схемы как file-backed items.
5. Создать, заполнить, проверить и финализировать АОСР.
6. Связать АОСР с сертификатами и схемами.
7. Получить generated DOCX/PDF АОСР.
8. Сформировать реестр из source data.
9. Собрать package snapshot.
10. Скачать registry export and ZIP package.

Пользователь должен уметь полностью завершить поддерживаемый сценарий: от пустого объекта до downloadable комплекта, где АОСР, сертификаты, схемы и реестр согласованы между собой.

MVP не должен обещать закрытие всех реальных ситуаций ПТО. Он должен честно закрыть один узкий, но ценный поток: hidden works documentation package for small/medium construction workflows.

---

## 3. Primary User

Основной пользователь MVP:

```text
инженер ПТО
```

Контекст использования:

- small/medium construction workflow;
- ОВиК/ВК as initial discipline focus;
- одиночная работа в personal workspace;
- small team collaboration через organization workspace and simple invites;
- несколько объектов, но без enterprise-level coordination;
- подготовка документов для сдачи заказчику, технадзору или внутреннему контролю.

MVP не является:

- enterprise coordination platform;
- корпоративным ECM;
- системой контроля задач строительной компании;
- инструментом снабжения, финансов, планирования или договорного учета;
- replacement for CAD/BIM/design systems.

Первый продукт должен ощущаться как рабочее место инженера ПТО: объект, папки, акты, сертификаты, схемы, реестр, комплект.

---

## 4. First Supported Document Types

### Mandatory first-class typed form

`AOSR` / АОСР является обязательной first-class form MVP.

Для АОСР MVP обязан поддержать:

- typed structured payload;
- draft/final/revision baseline;
- numbering and date;
- participants;
- work description and location;
- project/reference basis;
- material/equipment usage;
- certificate links;
- executive scheme links;
- attachments list;
- validation findings;
- DOCX/PDF generation;
- registry projection;
- package inclusion.

### Evidence and outputs included in MVP

Следующие категории входят в MVP, но не являются typed acts:

| Category | MVP status | Scope |
| --- | --- | --- |
| Certificate / Declaration / Passport | Included as certificate library evidence kinds | Physical original file + required metadata + links to AOSR/materials/package. |
| ExecutiveScheme | Included as file-backed evidence | PDF/file + structured metadata + AOSR/package links. |
| Registry | Included as derived projection and export | Built from object, AOSR, certificates, schemes, drawing sets and allowed overrides. |
| Package | Included as package configuration/build/snapshot | Registry + certificates + AOSR outputs + schemes, ordered and downloadable. |

### Limited/deferred typed acts

`TestAct` family is deferred from first production delivery as generated/finalizable typed forms unless a later scope review narrows it to exactly one concrete form with approved payload, template and validation.

`TechnicalReadinessAct` is deferred.

No generic `TestAct`, no name-only subtype and no free-form generated act are allowed in MVP to fill this gap. If a real pilot requires manually prepared external test documents, they may be handled outside the first typed workflow until a controlled evidence/attachment policy is approved; they must not become a generic document builder.

---

## 5. AOSR MVP Scope

АОСР is the center of MVP. The first release should make one AOSR workflow boringly reliable before adding more acts.

### 5.1 Mandatory AOSR blocks

MVP AOSR must include these blocks:

| Block | MVP requirement |
| --- | --- |
| Header | Document type, number, date, object, status/revision, template context. |
| Object context | Object name/address and output-relevant object/company values needed by the form. |
| Participants | Structured participant roles, organizations, positions, names, authority and display order. |
| Work | Description of concealed works, system/discipline, location, execution period and conclusion/subsequent works permission. |
| Project basis | Project drawing set reference and optional normative/PPR rendered references. |
| Materials/equipment | Document-owned material/equipment usage rows where the act claims applied items. |
| Certificates | Explicit links from material/equipment usage to file-backed certificate library items. |
| Executive schemes | Optional/conditional links to file-backed executive schemes. |
| Attachments | Ordered list of linked certificates/schemes and approved attachment captions. |
| Validation | Explainable `ERROR`/`WARNING` findings for draft, finalization and package readiness. |
| Generated output | DOCX/PDF from structured data and exact template version. |

### 5.2 Mandatory fields for finalization

The following fields are required before an AOSR can become `final` in MVP:

| Field group | Required MVP fields |
| --- | --- |
| Identity | `document_type = AOSR`, `object_id`, document number, document date. |
| Numbering | numbering scope, prefix if used, sequence, suffix if used, rendered number. |
| Object | object name and address or equivalent approved object display values. |
| Work | non-empty work description, engineering system/discipline, rendered location, execution period, acceptance/conclusion text. |
| Location | at least one meaningful location representation: axes, elevation, floor/zone, room/section or explicit rendered location text. |
| Project basis | at least one project/reference basis line; preferred source is `ProjectDrawingSet`. |
| Participants | required participant snapshots for the selected MVP AOSR form, including role, organization, position, name, authority/caption and display order. |
| Template | selected usable AOSR `TemplateVersion` for generated output. |
| Certificates | every printed quality-document number/reference must point to a confirmed certificate library item with retained physical original file. |
| Schemes | every printed/attached scheme reference must point to an `ExecutiveScheme` with retained physical original file. |

### 5.3 Optional fields in MVP

These fields are supported but should not become blocking unless the selected form later requires them:

- detailed material category;
- brand/model;
- manufacturer;
- quantity and unit;
- batch/lot;
- material-specific application location;
- additional normative references;
- PPR reference;
- additional information/notes;
- optional participant blocks;
- NRS/registry number where applicable;
- attachment captions;
- page count for certificates/schemes;
- free note for registry row.

### 5.4 Certificate linking

MVP certificate linking rules:

- certificate number in AOSR output cannot be typed as standalone truth;
- every displayed certificate/declaration/passport reference must link to a certificate library item;
- the certificate library item must have a physical original file;
- metadata used in output must be confirmed by the user;
- certificate validity is checked against AOSR document date, not current date;
- expiry relative to AOSR date is a `WARNING` in baseline, not an automatic blocker;
- missing file-backed certificate for a displayed quality-document reference is an `ERROR`;
- one certificate may be reused by multiple AOSR documents inside the same workspace scope.

### 5.5 Executive scheme linking

MVP executive scheme rules:

- AOSR can link zero, one or many executive schemes;
- executive scheme is optional unless the selected form/work rule explicitly requires it;
- if a scheme is printed as an attachment/reference, it must exist as an `ExecutiveScheme` item with physical file;
- `ExecutiveScheme` is not `ProjectDrawingSet`;
- scheme metadata used in output comes from structured scheme fields;
- changed scheme file is represented by new item or later supersession policy, not silent overwrite.

### 5.6 Participants

MVP supports the standard AOSR participant structure from the sample analysis:

- representative of technical customer / construction control;
- representative of the person carrying out construction;
- representative of construction control of the person carrying out construction;
- representative of the person who performed the concealed works;
- representative of construction control of the person who performed the works;
- other representatives participating in inspection.

For first delivery, the product should avoid a heavy organization directory. It needs enough object-level defaults and document-level overrides to produce a valid AOSR:

- participant role;
- organization;
- position;
- full/rendered name;
- authority basis;
- authority number/date/details when used;
- optional NRS/registry number;
- caption/subtitle;
- display order;
- ability to include multiple names in one role block if the form requires it.

The exact required participant roles for the first template must be accepted during review of this document or during template review before implementation.

### 5.7 Work description

MVP work description must support:

- free rendered description of concealed works;
- structured system/discipline selection where available;
- work type text;
- execution period start and end date;
- location fields and rendered location;
- conclusion/permission for subsequent works;
- additional notes.

Reusable `WorkItem` aggregate is not part of MVP. Work meaning belongs to the typed AOSR payload.

### 5.8 Axes/elevations/location

MVP should support lightweight location structure:

- axes, for example `13-22/А-Д`;
- elevation, for example `-3,600`;
- floor/zone/room/section;
- rendered location text.

Blocking rule for MVP:

- final AOSR needs a human-understandable rendered location;
- separate axes/elevation fields are encouraged but not required for every act if rendered location text is sufficient for the selected form;
- no CAD/BIM geometry, drawing coordinate extraction or spatial model is included.

### 5.9 Dates

MVP AOSR date rules:

- document date is required;
- execution period start/end is required for the first AOSR form unless the accepted template explicitly omits it;
- certificate validity is evaluated against document date;
- default document date may be current date;
- bulk date changes inside a folder are allowed only as a simple explicit operation if implementation cost is low; otherwise they can wait after first AOSR editor.

### 5.10 Numbering

MVP numbering rules:

- structured number consists of scope, prefix, sequence, suffix and rendered number;
- object-scoped and folder-scoped numbering are supported as product concepts;
- the first implementation should support one simple default policy per object/folder for AOSR;
- user can preview and confirm renumbering;
- collisions are `ERROR`;
- changing number of a final AOSR creates a new revision and makes current package output stale.

Advanced numbering masks, cross-discipline numbering matrices and customer-specific numbering scripts are deferred.

### 5.11 Attachments

MVP attachments are controlled references, not arbitrary drive files.

Included:

- linked certificate/declaration/passport originals through certificate library;
- linked executive scheme originals;
- optional attachment captions/order.

Deferred:

- photo evidence as first-class evidence;
- measurement protocols as typed supporting documents;
- arbitrary extra files folder;
- attachment approval workflow;
- attachment versioning beyond retained file identity.

### 5.12 Validation rules

MVP AOSR validation must include:

| Severity | MVP examples |
| --- | --- |
| `ERROR` | Missing object/date/number/work description/rendered location; missing required participant snapshot for accepted template; printed certificate reference without file-backed certificate; printed scheme attachment without file-backed scheme; numbering collision; missing usable template. |
| `WARNING` | Certificate expired relative to AOSR date; material-certificate applicability unclear; optional scheme absent where often expected but not required; execution period looks inconsistent with document date; current output stale after edits. |
| `INFO` | Certificate expired today but was valid on historical document date; evidence reused by other acts; newer template exists; previous revision remains in historical package. |

Validation explanation UX is part of MVP: findings must tell the user what is wrong, why it matters, and where to fix it.

### 5.13 Generated outputs from AOSR

MVP generated outputs for AOSR:

- DOCX generated from structured data and template version;
- PDF generated from the same released revision/template context;
- preview/read model for editor UX;
- registry row derived from released AOSR data;
- package inclusion by exact released revision.

Manual edits to exported DOCX/PDF are outside source of truth.

---

## 6. First Evidence Scope

### 6.1 Certificate library MVP

Certificate library is mandatory for MVP because AOSR/package cannot be reliable if certificate numbers are only typed into acts.

MVP supports these quality evidence kinds under one certificate library concept:

- certificate of conformity;
- declaration of conformity;
- quality passport;
- technical passport;
- refusal/information/official letter where used as quality evidence.

Required certificate metadata:

- evidence kind;
- physical original file;
- title or coverage/material/equipment description;
- registration number where applicable;
- issuer or issuing organization where applicable;
- manufacturer/declarant where applicable;
- issue date where known/applicable;
- valid until where applicable;
- page count or file page count if used in registry/package;
- confirmation status;
- workspace owner;
- upload/confirmation attribution.

Optional certificate metadata:

- brand/model;
- batch/lot;
- notes;
- supersession relation placeholder;
- source proposal reference if OCR/AI is later enabled.

Rules:

- physical original is required before a certificate can be used in final AOSR output or package;
- no advanced OCR auto-fill dependency in MVP;
- user-entered metadata is acceptable;
- OCR/AI proposals, if later enabled experimentally, remain unconfirmed until user review;
- certificate search and picker must work by key metadata.

### 6.2 Executive schemes MVP

Executive schemes are included as file-backed object evidence.

Required scheme metadata:

- physical original file, usually PDF;
- title;
- registration number if used;
- date;
- object;
- optional folder/system context;
- sheet count where applicable;
- note;
- status/readiness;
- upload/confirmation attribution.

MVP supports:

- upload scheme;
- confirm/edit metadata;
- attach scheme to AOSR;
- include scheme in registry/package;
- search/filter by object, title, number, date and system.

Deferred:

- CAD/DWG/DXF support;
- scheme visual editing;
- OCR extraction from schemes;
- automatic work/scheme matching;
- independent scheme version lifecycle beyond retained file/new item;
- drawing comparison.

---

## 7. Folder and Numbering MVP Rules

MVP folders are object-scoped business folders, not a universal file manager.

Included folder behavior:

- one active folder tree per object;
- create, rename, reorder and move folders;
- place AOSR documents, executive schemes and package views in folders where useful;
- soft archive/delete at product level if feasible;
- selected folder document list with statuses and validation markers.

Simple numbering rules:

- AOSR numbering supports object scope and folder scope;
- default pattern is prefix + sequence + optional suffix;
- rendered number is derived and stored with released revision;
- uniqueness/collision is checked inside chosen scope;
- manual rendered-number free text is not source of truth.

Renumber flow:

1. User selects scope/order.
2. System shows old and proposed numbers.
3. System shows collisions and final-document revision impact.
4. User confirms.
5. Draft documents are updated.
6. Final documents enter revision flow.
7. Current packages/artifacts become stale where affected.

Move flow:

| Move choice | MVP behavior |
| --- | --- |
| Keep numbering | Only placement changes; document number/revision stays unchanged. |
| Recalculate numbering | Destination policy applies; collisions validated; final documents require new revision. |

Deferred numbering complexity:

- customer-specific formula engine;
- multi-level compound numbering rules;
- automatic numbering across unrelated objects;
- numbering by contract/package/customer registry section;
- hidden renumber on drag-and-drop;
- Excel-like manual number column as source of truth.

---

## 8. Package Builder MVP

Package Builder MVP exists to produce a real handover output from supported source data, not to become a universal archive builder.

Included package workflows:

- create package for one object or selected object/folder scope;
- select included final AOSR documents;
- include linked certificate originals;
- include linked executive scheme originals;
- include generated registry output;
- use default order: registry, certificates, acts, executive schemes;
- allow manual drag/drop ordering inside package configuration;
- validate readiness before build/release;
- run package build asynchronously at architecture level;
- create immutable package snapshot on success;
- mark package stale when dependencies change;
- expose build progress/failure in UX;
- provide downloadable outputs.

Registry generation:

- registry is generated from object data, project drawing sets, certificates, AOSR revisions, executive schemes and signer/override settings;
- registry supports ordering, hiding optional rows, notes and signer selection;
- registry overrides cannot change source facts or hide blocking errors.

Document ordering:

- default package order is fixed for MVP;
- user can reorder visible package components;
- ordering is captured in snapshot;
- package output must not rely on "latest" mutable order after release.

Snapshot/release:

- successful build creates immutable snapshot;
- release fixes the snapshot as historical output;
- changed dependencies require new build;
- old snapshots remain explainable and are not rewritten.

Downloadable outputs:

- ZIP package is mandatory;
- generated AOSR DOCX/PDF files are included or downloadable individually;
- registry export is included;
- certificate originals are included;
- executive scheme originals are included.

Deferred package features:

- full cover sheet/opis generation;
- single merged PDF package if it significantly delays MVP;
- package signing;
- package approval route;
- partial incremental rebuild optimizer;
- multi-object packages;
- customer-specific package workflows;
- public share links;
- external document-room publishing.

---

## 9. Generated Output MVP

MVP generated outputs:

| Output | MVP requirement |
| --- | --- |
| AOSR DOCX | Required from released AOSR revision and template version. |
| AOSR PDF | Required from the same source context as DOCX. |
| Registry export | Required as generated registry artifact; exact format may be selected later in tech strategy, but product must support export. |
| ZIP package | Required package download containing selected generated outputs and evidence originals. |

Generated output rules:

- outputs are derived artifacts;
- outputs retain provenance to source revision/snapshot/template;
- outputs can become stale;
- stale output is regenerated, not edited in place;
- manual DOCX/PDF edits do not update structured data;
- template version used for a released output is immutable.

Explicitly not in MVP:

- template marketplace;
- visual template editor;
- arbitrary customer template builder;
- generated output as source of truth;
- direct import of edited DOCX/PDF back into domain data.

---

## 10. AI/OCR MVP Policy

AI/OCR is not required for MVP.

MVP must work fully without AI:

- certificate metadata can be entered manually;
- scheme metadata can be entered manually;
- AOSR fields can be entered manually;
- validation uses confirmed structured data and explicit links;
- package builder does not depend on AI.

AI/OCR can remain optional/deferred:

- OCR-assisted certificate metadata may be considered later as an experimental assistant;
- project-source analysis is deferred;
- scheme OCR is deferred;
- semantic error detection is deferred;
- no provider/model/data-processing decision is made by this document.

Allowed experimental scope, only after privacy/processing policy:

- create proposal for certificate metadata;
- show source/citation/confidence;
- let user accept, edit-and-accept or reject;
- apply accepted values through ordinary domain commands.

Hard prohibitions:

- no autonomous mutation;
- no AI auto-finalization;
- no AI-created certificate link without physical certificate;
- no AI validation override;
- no AI package release;
- no processing real project/customer files without approved privacy/data-processing policy.

---

## 11. Search MVP

Search MVP should help engineers find their own documents quickly. It should not become semantic knowledge mining in first release.

Included search scopes:

- global workspace search across accessible objects;
- object search;
- certificate search;
- document search;
- executive scheme search.

Searchable MVP fields:

- object name/address;
- AOSR number/date/type/status;
- AOSR work description and location text;
- certificate kind, registration number, coverage, issuer, manufacturer and validity dates;
- executive scheme title, number, date and system;
- folder names;
- package title/status;
- registry/package output status where useful.

Search UX:

- results are tenant-scoped;
- results link to authoritative screens;
- search may show stale/index freshness caveat;
- search does not become source of truth;
- inaccessible workspace data must not leak.

Deferred search:

- semantic/vector search;
- OCR text search inside PDFs;
- search across file contents;
- cross-workspace search;
- saved complex filters;
- analytics queries;
- natural-language answer engine.

---

## 12. Collaboration MVP

MVP collaboration supports small teams, not enterprise governance.

Included:

- personal workspace created for individual work;
- organization workspace for small team collaboration;
- workspace invites via stored invitation, not trusted URL role claims;
- simple roles: Owner, Admin, PTO Engineer, Viewer;
- basic membership list and invite revoke/expiry behavior;
- membership-based access to workspace data;
- document lock/autosave concept sufficient to avoid obvious conflicting edits.

Optional/limited:

- Foreman role may remain deferred or map to restricted contributor only after role permissions are explicitly reviewed;
- lock override can wait unless pilot users require it.

Deferred collaboration complexity:

- fine-grained object/folder RBAC;
- approval chains;
- reviewer workflows;
- comments/mentions;
- real-time collaborative editing;
- department/team hierarchy;
- support/admin impersonation;
- external guest portals;
- public sharing;
- cross-workspace copy/transfer policy.

---

## 13. UX and Onboarding MVP

MVP UX priority:

```text
simple, fast, document-centric, not cluttered
```

First-run guidance:

- create/select workspace;
- create first object;
- add minimal object data;
- upload first certificate;
- create first AOSR;
- link certificate/scheme;
- fix validation findings;
- generate first output;
- build first package.

Contextual hints/tooltips:

- explain why certificate must be uploaded before its number appears in AOSR;
- explain difference between project drawing set and executive scheme;
- explain warning versus error;
- explain why final edits create a new revision;
- explain stale package/output state;
- explain numbering scope and renumber impact.

Empty-state guidance:

- empty object dashboard shows next action, not marketing copy;
- empty certificate picker explains upload/confirm certificate;
- empty scheme picker explains upload scheme;
- empty package builder explains selected scope and required final documents;
- empty validation panel says no findings or tells what must be filled first.

Onboarding constraints:

- every onboarding overlay/hint must have "do not show again" or equivalent dismissal;
- experienced users must not suffer from repeated onboarding overlays;
- hints should be contextual and compact;
- no full-screen tutorials blocking routine work after first use;
- validation explanations should be actionable, not legal essays;
- package builder and document editor guidance is required because these are the highest-risk workflows.

The interface should help the user feel "I am assembling executive documentation", not "I am feeding a CRM".

---

## 14. Explicit Non-MVP Features

The following are intentionally excluded from MVP:

- ERP features;
- procurement;
- finance, budgets, invoices and payment tracking;
- contracts management beyond object/company display context;
- generic task management;
- Gantt/project schedule planning;
- warehouse/material stock accounting;
- labor/time tracking;
- CRM;
- HR/personnel management;
- payroll;
- BIM;
- CAD editing;
- DWG/DXF processing;
- design coordination;
- clash detection;
- generic ECM/document management;
- Google Drive-like file hierarchy;
- arbitrary file sharing;
- public document rooms;
- advanced workflow automation;
- approval chains;
- multi-stage review boards;
- legal EDS/e-signature workflow;
- mobile app;
- offline mode;
- desktop sync agent;
- public API/integrations;
- 1C/ERP integrations;
- email ingestion;
- messenger bots;
- automatic import of legacy DOCX/PDF packages;
- DOCX/PDF round-trip editing;
- generic document builder;
- arbitrary JSON form builder;
- template marketplace;
- visual template editor;
- customer template scripting;
- package cover/opis designer;
- all test-act forms at once;
- generated TechnicalReadinessAct;
- photo evidence as first-class typed evidence;
- measurement protocol typed documents;
- reusable material/equipment catalog;
- advanced material applicability engine;
- advanced numbering formula engine;
- semantic/vector search;
- OCR text search inside all PDFs;
- AI autopilot;
- AI auto-fill dependency;
- AI auto-approval;
- AI compliance verdicts;
- deep analytics;
- dashboards for executives;
- risk scoring;
- cross-object reporting;
- enterprise permission model;
- object-level role assignment;
- cross-workspace data transfer;
- billing/subscription management;
- support backoffice tooling.

These exclusions are not a judgment that the features are useless. They are deliberately kept outside first delivery so MVP remains shippable.

---

## 15. MVP Risk Areas

### Implementation risks

- DOCX/PDF generation may become harder than expected.
- Package ZIP assembly with provenance and stale markers can grow too large.
- Numbering/renumber rules can become a hidden product inside the product.
- Validation can over-block real ПТО practice if field requirements are too strict.
- Template versioning can become a technical bottleneck if not designed simply.
- File retention and historical references can conflict with easy delete flows.

### UX risks

- AOSR editor can feel like a database form instead of a document workflow.
- Certificate picker can become slow or confusing without good filters.
- Validation panel can scare users if warnings look like blockers.
- Package builder can become overloaded if it tries to solve all package variants.
- Onboarding overlays can annoy experienced users.
- Users may try to use folders as Google Drive if arbitrary file features are exposed.

### Domain risks

- Required AOSR participant roles may differ by customer/object.
- Some work types may require schemes or test acts that first MVP does not generate.
- Certificate applicability to material usage may require engineering judgment.
- Registry export format may vary by customer.
- TestAct deferral may be acceptable for first AOSR package pilots but must be validated early.

Must validate early:

- first AOSR template and required participant set;
- certificate metadata required for real registry/package;
- executive scheme optional versus mandatory cases;
- package order expected by real users;
- minimum generated outputs users need to hand over;
- whether first pilots can accept TestAct/TechnicalReadinessAct deferral.

---

## 16. MVP Success Criteria

MVP is successful if a real engineer ПТО can complete the supported workflow without using Word/Excel as the master source for AOSR data.

End-to-end workflows that must work:

1. Create personal workspace, organization workspace or use an existing workspace.
2. Create object and minimal object documentation context.
3. Create folder structure for one object.
4. Configure simple AOSR numbering.
5. Upload and confirm certificate/declaration/passport metadata with physical file.
6. Upload and confirm executive scheme metadata with physical file.
7. Create AOSR draft.
8. Fill required AOSR fields.
9. Link certificate and scheme to AOSR.
10. Resolve blocking validation errors.
11. Finalize AOSR.
12. Generate AOSR DOCX and PDF.
13. View generated registry projection.
14. Build package from registry, certificates, AOSR outputs and schemes.
15. Download ZIP package.
16. Edit final AOSR through revision flow and see current package become stale.

Users must successfully generate:

- at least one final AOSR DOCX;
- at least one final AOSR PDF;
- registry export for selected object/package scope;
- ZIP package containing registry, AOSR outputs, certificate originals and scheme originals.

MVP is not successful if:

- certificate numbers can be printed without physical evidence;
- registry becomes the editable source of truth;
- package includes draft/unpublished changed documents as if final;
- AI/OCR is required to finish the workflow;
- users cannot understand validation findings;
- onboarding blocks routine expert usage.

---

## 17. Recommended First Screens

Recommended first screens:

| Screen | MVP purpose |
| --- | --- |
| Workspace/object selection | Choose personal or organization workspace and open object. |
| Object dashboard | Show object status, folders, document counts, validation counts and package freshness. |
| Folder tree | Navigate object-scoped business folders and document/scheme/package placements. |
| AOSR editor | Fill typed fields, participants, materials, certificates, schemes, numbering, dates and validation. |
| Certificate picker | Search/select confirmed certificate evidence by material/date/number/coverage. |
| Certificate library/detail | Upload original, enter/confirm metadata, see usage. |
| Scheme picker | Select object-scoped executive scheme with file readiness. |
| Executive scheme library/detail | Upload original, enter metadata, see usage. |
| Validation panel | Explain errors/warnings, gates and suggested actions. |
| Registry preview | Show derived registry blocks, provenance, ordering, notes and signer selection. |
| Package builder | Select scope/components, order items, validate readiness, build and release snapshot. |
| Generated outputs/download history | Download DOCX/PDF/registry/ZIP and see stale/retained/provenance state. |
| Onboarding/help | First-run guidance, contextual hints, empty states and dismissible tips. |

Avoid separate screens that look like generic admin databases unless they directly support these workflows.

---

## 18. Recommended First Implementation Order

This is product sequencing, not a stack or code plan.

Suggested sequence:

1. Workspace/object baseline: personal workspace, organization workspace skeleton, object creation and object selection.
2. Object setup: object name/address, simple company/object context, participant defaults, project drawing set basics.
3. Folder tree: object-scoped folders and selected folder list.
4. Certificate library: upload physical file, manual metadata, confirmation, picker search.
5. Executive schemes: upload physical file, manual metadata, confirmation, picker search.
6. AOSR editor foundation: create draft, number/date, work description, location, execution period, participants and conclusion.
7. AOSR evidence links: material/equipment rows, certificate linking, scheme linking and attachment order.
8. AOSR validation: errors/warnings, validation panel and finalization gate.
9. AOSR generated output: DOCX/PDF from released revision and template version.
10. Registry projection: derived rows from object, AOSR, certificates, schemes and drawing set; allowed ordering/notes/signer only.
11. Package builder: scope, ordering, readiness validation, async build concept, immutable snapshot and ZIP download.
12. Staleness/revision flow: edit final AOSR, publish new revision, stale current package/output.
13. Basic search: object/document/certificate/scheme metadata search.
14. Small team invites and simple roles.
15. Onboarding/hints polish across editor, picker, validation and package builder.

Dependencies:

- AOSR finalization depends on certificate library, scheme library, participants and template baseline.
- Registry depends on final AOSR revisions and evidence metadata.
- Package depends on registry, generated AOSR outputs and file-backed evidence.
- Search can wait until source screens exist.
- AI/OCR waits until core manual workflow is production-usable.

What can wait:

- TestAct generated forms;
- TechnicalReadinessAct;
- advanced package variants;
- advanced role policy;
- OCR/AI;
- template marketplace/editor;
- mobile/offline;
- integrations and analytics.

---

## 19. Next Architecture Step

Recommended next document after review and acceptance of this MVP scope:

```text
docs/17-tech-stack-and-implementation-strategy-v1.md
```

That document should select implementation strategy only after product scope is accepted. It may compare stack options and implementation sequencing, but it must preserve:

- structured source of truth;
- typed AOSR first;
- file-backed evidence;
- derived registry;
- snapshot-based packages;
- AI optional/deferred;
- no ERP/ECM/generic builder expansion.

---

## 20. Final Gate

MVP scope must be accepted before stack selection and implementation planning.

This document still does not authorize:

- production coding;
- backend/frontend scaffold;
- SQL/DDL/migrations;
- ORM schema;
- OpenAPI/routes;
- dependency installation;
- database/provider/storage/queue/renderer/AI provider choice.

After this document:

```text
Review docs/16-mvp-scope-and-first-forms-v1.md.
If accepted, proceed to docs/17-tech-stack-and-implementation-strategy-v1.md.
```

If review attempts to add broad platform features, default answer should be defer unless the feature is required for the first AOSR-to-package production workflow.
