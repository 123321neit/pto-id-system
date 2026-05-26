# 09. Aggregate Boundaries and Invariants

# PTO ID System

# Формальная спецификация ownership, consistency boundaries и обязательных инвариантов

Статус: draft specification for review before Database Schema V1.

Дата фиксации: 2026-05-26.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание модели: `docs/06-data-model-v1.md`, `docs/07-aosr-domain-specification.md`, `docs/08-document-types-catalog.md`, ADR 0001-0005.

---

## 1. Purpose

Этот документ фиксирует границы агрегатов PTO ID System до проектирования физической базы данных. Его цель - сделать явными domain ownership, инварианты и разрешённые связи, чтобы последующее хранение не превратило derived output, evidence files или object workspace в случайные источники истины.

Документ отвечает:

- какие сущности являются aggregate roots;
- какие данные являются owned entities, value objects, snapshots, operational state или projections;
- какой owner управляет жизненным циклом данных;
- какие правила должны защищаться при любой будущей реализации;
- какие содержательные изменения создают document revision;
- какие зависимости делают текущий package snapshot устаревшим;
- какие cross-aggregate references допустимы, а какие запрещены.

Спецификация намеренно не содержит кода, SQL, API design, выбора базы данных, выбора стека, миграций, зависимостей или инфраструктурных решений.

### 1.1 Decision status

Документ разделяет:

- **Inherited rule** - правило уже принято master context или ADR и только применяется здесь.
- **Boundary baseline** - draft-решение этой спецификации, необходимое для подготовки Database Schema V1 и требующее ратификации владельцем проекта.
- **Open question** - вопрос, который нельзя молча решить физической схемой.

Новые boundary baseline decisions в этом документе:

1. `FolderTree` принимается как самостоятельный object-scoped aggregate root, а не вложенная mutable коллекция `Object`.
2. Самостоятельный aggregate root `WorkItem` не вводится в Database Schema V1 baseline: смысл выполненной работы, необходимый акту, остаётся structured data typed `Document`; выделение reusable `WorkItem` отложено до подтверждения shared-work workflows.
3. `ProjectDrawingSet` размещается как owned entity в ограниченном `ObjectDocumentationContext`, а не как `ExecutiveScheme` и не как отдельный aggregate root в baseline.

Эти решения конкретизируют уже принятое правило `Object is NOT a giant aggregate`; они не изменяют ADR 0001-0005.

---

## 2. Why This Document Exists Before Database Schema

Физическая модель хранения неизбежно закрепляет предположения о владении данными. Если начать её до boundary specification, легко случайно:

- вложить все документы, файлы и outputs в один `Object`;
- сделать registry row местом хранения даты или номера акта;
- хранить номер сертификата без evidence file;
- дать package snapshot владеть изменяемыми источниками;
- смешать рабочие чертежи с исполнительной схемой;
- трактовать технический lock как изменение document content;
- создать reusable work entity без подтверждённого пользовательского процесса.

### 2.1 Required outcome before storage design

До Database Schema V1 необходимо знать не таблицы и поля хранения, а смысловые границы:

| Question before storage | Required domain answer |
| --- | --- |
| Кто меняет номер, дату и payload акта? | Только `Document`, через typed contract и revision rules. |
| Кто хранит файл сертификата и его подтверждённые metadata? | `Certificate`. |
| Что включает комплект? | Exact revisions/files/provenance, зафиксированные `PackageSnapshot`. |
| Может ли строка реестра обновить исходное поле сама по себе? | Нет; она либо вычисляется, либо инициирует команду owner aggregate. |
| Что хранит объект? | Контекст и owned settings, но не independent document/evidence/package lifecycles. |
| Что делать с ещё не подтверждённой общей моделью работ? | Сохранить work meaning в typed document baseline, не создавать преждевременный root. |

### 2.2 Gate to Database Schema V1

Этот draft должен быть просмотрен и его boundary baseline decisions должны быть подтверждены или исправлены до физического проектирования. Физическая модель не должна сама отвечать на открытые domain questions удобством хранения.

---

## 3. Aggregate Design Principles

### 3.1 Inherited architectural principles

| Principle | Boundary consequence |
| --- | --- |
| `SOURCE OF TRUTH = STRUCTURED DATA` | Aggregate state and explicit relations dominate DOCX/PDF/XLSX/ZIP output. |
| Typed Documents | `Document` owns immutable type and type-specific payload; generic document storage is prohibited. |
| Registry is Derived Projection | `RegistryProjection` reads aggregates; it never owns primary act/evidence fields. |
| Certificate requires physical file | `Certificate` cannot fulfil an act/package relation without original evidence file. |
| Certificate validation by document date | Validity finding belongs to document usage context, not to current-day registry viewing. |
| Final documents editable through revision | Published content changes produce a new `DocumentRevisionSnapshot`, not overwritten history. |
| Immutable Template Versions | `Template` owns versions; used versions cannot be mutated for prior outputs. |
| Async Snapshot-Based Package Builder | `Package` owns build configuration and immutable results, not source content. |
| Object is NOT a giant aggregate | Documents, evidence, templates and package history remain autonomous. |
| OCR/AI assistant only | Extraction proposals do not become verified aggregate state without human confirmation. |

### 3.2 Aggregate boundary criteria

An aggregate root is justified where data has:

- an independent lifecycle and invariant set;
- changes that should be validated together;
- historical or evidence responsibilities;
- multiple consumers that must reference rather than embed mutable copies;
- a need to prevent another context from rewriting its source state.

An item is not a root merely because it appears as a row, block, file or screen in the UI.

### 3.3 Consistency versus coordination

An aggregate enforces its own immediate invariants. Cross-aggregate completeness, registry freshness and package readiness are coordinated checks over references and snapshots. This distinction avoids merging every dependency into one aggregate merely because outputs use it together.

### 3.4 Ownership categories

| Category | Meaning |
| --- | --- |
| Aggregate root | Owner of identity, lifecycle and protected invariants. |
| Owned entity | Identifiable part whose lifecycle is controlled by one root/context. |
| Value object | Content value without independent lifecycle. |
| Snapshot | Immutable captured state owned by the releasing/building root. |
| Reference | Explicit relation to another owner; never permission to rewrite it. |
| Projection | Rebuildable read/output model derived from owners and allowed overrides. |
| Operational entity | Coordination state such as a lease; does not revise business content. |

---

## 4. Aggregate Roots Overview

### 4.1 Aggregate root baseline

| Aggregate root / boundary | Status for pre-schema baseline | Owns | Does not own |
| --- | --- | --- | --- |
| `TenantContext` | Inherited isolation boundary | Permission/isolation context conceptually | Domain payload of every aggregate as nested state. |
| `Object` | Inherited accepted root | Object identity, settings and object-owned snapshots/defaults | Documents, quality evidence originals, schemes, template versions or package snapshots. |
| `FolderTree` | **Boundary baseline: root** | Object-local folder hierarchy and placement organization | Content lifecycle/revisions of placed documents or evidence. |
| `CompanyProfile` | Inherited accepted library root | Reusable current company profile | Existing object/document snapshots. |
| `Document` | Inherited accepted root | Typed act identity, payload, links, lifecycle and revisions | Certificate/scheme originals or package builds. |
| `Certificate` | Inherited accepted root | Quality evidence original file and confirmed metadata | Document payload or registry row content. |
| `ExecutiveScheme` | Inherited accepted root | As-built scheme original file and metadata | Project drawing set or document revisions. |
| `Template` | Inherited accepted root/context | Template family and `TemplateVersion` lifecycle | Document content or generated-output history owned elsewhere. |
| `Package` | Inherited accepted root/context | Package configuration, builds and immutable snapshots | Included source aggregate lifecycles. |

### 4.2 Not aggregate roots in the baseline

| Concept | Classification | Owner / reason |
| --- | --- | --- |
| `EngineeringSystem` | Owned object-domain entity/value set | Configured in `Object` context; its independent lifecycle is not established. |
| `ObjectCompanySnapshot` | Snapshot/owned entity | Owned by `Object`; freezes company data used on the object. |
| `ObjectRepresentativeBinding` | Owned entity | Defaults controlled by `Object`; released display values move into document snapshots. |
| `ProjectDrawingSet` | **Boundary baseline: owned entity** | Owned by `ObjectDocumentationContext`; no independent lifecycle established. |
| `WorkItem` | **Boundary baseline: no root in V1** | Shared work aggregate is deferred; typed document owns its work statement in baseline. |
| `MaterialUsage` | Document-owned typed entity in baseline | Describes material/equipment claimed by an act and evidence links. |
| `AOSRPayload` / approved test payload | Document-owned typed data | Exists only as the content contract of one `Document`. |
| `DocumentCertificateLink` | Document-owned reference entity | Meaning/order of document use; target remains owned by `Certificate`. |
| `DocumentSchemeLink` | Document-owned reference entity | Meaning/order of document use; target remains owned by `ExecutiveScheme`. |
| `DocumentRepresentativeSnapshot` | Immutable snapshot | Owned by a released `DocumentRevisionSnapshot`. |
| `TemplateVersion` | Owned entity | Owned by `Template`; immutable after use. |
| `GeneratedArtifact` | Derived artifact/provenance record | Owned by generating document revision or package snapshot context. |
| `RegistryProjection` | Derived projection | Rebuilt from source roots and scoped overrides. |
| `RegistryOverride` | Owned presentation configuration | Owned by registry/package scope; not primary domain data. |
| `PackageBuild` / `PackageSnapshot` | Package-owned entities/snapshots | Results and job state owned by `Package`. |
| `DocumentLock` | Operational lease | Separate from `Document` content/revision. |
| `OCRExtractionProposal` | Proposal state | May support `Certificate`/scheme workflows; not verified source data. |

### 4.3 Value object baseline

| Value object | Used by | Invariant / ownership meaning |
| --- | --- | --- |
| `DocumentType` | `Document` | Immutable semantic identity of typed payload. |
| `DocumentNumber` | `Document` | Prefix/sequence/suffix/rendered value fixed in released revision. |
| `DocumentDate` | `Document` | Date of act and reference date for certificate validation. |
| `RevisionNumber` | `Document` | Identifies released content state; not autosave or lock state. |
| `LifecycleStatus` | Owning root | Status according to that root's lifecycle; status set remains partly open. |
| `WorkLocation` / `ExecutionPeriod` / `WorkDescription` | Typed `Document` payload in baseline | Values of the work asserted by that act. |
| `RegistrationNumber` | Certificate/scheme/drawing owner | Display identity; never substitutes for relation to owner. |
| `ValidityPeriod` | `Certificate` metadata | Evaluated in referring document date context. |
| `DisplayOrder` | Document, override or package owner as applicable | Order belongs to the context whose output it arranges. |
| `ValidationFinding` | Validating/releasing context | Error/warning/info with reason and relevant source context. |
| `GenerationProvenance` | Generated artifact/snapshot context | Identifies exact source revision/file/template inputs. |
| `DependencyFingerprint` | Package/projection freshness context | Conceptual dependency identity; mechanism is not selected here. |

### 4.4 Boundary decisions that remain outside this baseline

`RepresentativeProfile`, reusable `Material` catalog and possible reusable `WorkItem` root remain candidates. This document specifies enough ownership to prevent premature storage decisions: released documents use their snapshots/typed entries even while reusable library boundaries are later refined.

---

## 5. Object Aggregate Boundary

### 5.1 Purpose and owner responsibility

`Object` is the construction-project context. It establishes the permitted domain scope in which documents, schemes, folders and packages operate.

`Object` owns:

- object identity, name, address, status and object-level attributes;
- configured disciplines/engineering systems needed to classify work;
- `ObjectCompanySnapshot` values selected for the object;
- object representative defaults/bindings;
- object-level numbering and template-binding defaults where applicable;
- `ObjectDocumentationContext`, including owned `ProjectDrawingSet` entries;
- references to the separate folder tree and related roots.

### 5.2 Why Object is not a giant aggregate

`Object` must not contain every mutable item beneath the workspace as internal state. Documents, certificates, schemes, templates and packages have distinct invariants:

| If absorbed into `Object` | Architectural harm |
| --- | --- |
| Document payloads and revisions | Every act edit would mutate a huge shared context and blur typed-document ownership. |
| Certificate files/metadata | A reusable quality document could no longer serve multiple documents/objects cleanly. |
| Scheme originals | Historical evidence replacement and links would be tied to unrelated object edits. |
| Template versions | Immutability after use would compete with ordinary object-settings changes. |
| Package snapshots | Historical builds could be accidentally treated as mutable workspace state. |
| Registry rows | A projection would be promoted into primary object data. |

The object is a context provider, not a consistency transaction enclosing every operation. Independent roots reference its identity and output-relevant snapshots; they do not become children that it rewrites.

### 5.3 Object-owned changes and effects

| Change | Owned by `Object` | Document revision effect | Registry/package effect |
| --- | --- | --- | --- |
| Rename/update current object setting | Yes | Does not rewrite released documents; adopted output changes require new document revision where shown | Current registry/output using live setting becomes stale; package may require rebuild if included value changes. |
| Create/update `ObjectCompanySnapshot` intentionally | Yes | Released revision remains unchanged unless a new document revision adopts it | New registry/package output using changed snapshot must rebuild. |
| Configure engineering system/default | Yes | Does not silently rewrite released typed payload | Recalculate dependent current projections when displayed. |
| Change `ProjectDrawingSet` owned entry | Yes | Existing released document snapshot/reference output not silently changed | Registry/package using current drawing block becomes stale. |

### 5.4 Object prohibitions

`Object` cannot:

- update a final act without a `Document` revision;
- delete evidence files needed by another root;
- edit a used `TemplateVersion`;
- overwrite a `PackageSnapshot`;
- treat registry output as its primary field store.

---

## 6. FolderTree Boundary

### 6.1 Boundary decision

**Boundary baseline:** `FolderTree` is a separate aggregate root scoped to exactly one `Object`.

This resolves the V1 candidate boundary. Although folders appear inside object workspace, their tree operations have their own invariants and may affect many placements without changing object identity or document content.

### 6.2 Why it is separate from Object

- The tree supports move, nesting, duplication, ordering, soft deletion and recovery.
- A subtree operation can touch many folder placements while `Object` settings remain unchanged.
- Document revision should not be created merely because the user reorganizes navigation.
- Keeping it separate prevents routine workspace organization from locking or rewriting object configuration.

### 6.3 Owned state

`FolderTree` owns:

- tree identity linked to one object;
- folder nodes, titles, parent-child relationships and order;
- soft-deleted/restored tree state;
- placement references for documents, schemes or package views where the product uses folder placement;
- clone operation result for hierarchy and requested new-placement actions.

It does not own:

- typed document payload, status or revision;
- certificate original files;
- executive scheme metadata/file lifecycle;
- package snapshots;
- numbering content of an already released document.

### 6.4 Folder invariants

| Invariant | Requirement |
| --- | --- |
| Single-object scope | Every folder node belongs to the same object as its tree. |
| No cycles | A node cannot be its own ancestor or descendant. |
| No cross-object move | Moving a node into another object's tree is prohibited. |
| Placement is not ownership | Placed `Document` remains owned by `Document`. |
| Soft-delete protection | Removing a tree node cannot erase referenced historical documents/snapshots. |
| Clone explicitness | Duplicating a folder does not silently duplicate final documents or evidence; clone choices must be explicit. |

### 6.5 Placement and numbering

Moving a document between folders changes organization, not act content. If a requested move also applies a numbering policy that changes a final document number, that second operation is executed by `Document` and creates a new revision. A folder operation cannot rewrite numbering by itself.

---

## 7. Document Aggregate Boundary

### 7.1 Purpose

`Document` is the aggregate root for each typed executable document, including `AOSR` and any approved concrete testing act. It owns what the act says and which published version is historically meaningful.

### 7.2 Document-owned state

`Document` owns:

- immutable `DocumentType`;
- object context reference and the linkage required for placement resolution; `FolderTree` remains owner of hierarchy/placement assignment;
- `DocumentNumber`, `DocumentDate`, lifecycle status and revision history;
- typed payload such as `AOSRPayload` or an approved test payload;
- in baseline, document-specific work statement and `MaterialUsage` entries;
- reference entities connecting its payload to `Certificate` and `ExecutiveScheme`, including purpose, display order and captions;
- representative/display snapshots used in a released revision;
- validation findings/acknowledgements for the relevant revision;
- selected `TemplateVersion` binding for released output;
- `DocumentRevisionSnapshot`, autosave state associated with editing and generated artifact provenance.

### 7.3 Referenced, not owned

| Referenced concept | Owner | Document's right |
| --- | --- | --- |
| Object context/snapshot inputs | `Object` | Read current values and capture output-relevant released values. |
| Certificate metadata and original file | `Certificate` | Link and snapshot/provenance output values; cannot replace file. |
| Executive scheme metadata and file | `ExecutiveScheme` | Link/include with purpose; cannot rewrite scheme. |
| Template version definition | `Template` | Select a version; cannot mutate a used version. |
| Package build/snapshot | `Package` | Be included by exact revision; cannot update package output. |
| Registry display | `RegistryProjection`/override scope | Be projected; does not store its content there. |

### 7.4 Typed document invariants

- The document type is immutable after creation.
- A typed payload must conform to its approved type contract before `final`.
- A certificate reference in content requires a relation to an evidence-backed `Certificate`.
- A linked/attached scheme displayed as evidence requires a file-backed `ExecutiveScheme`.
- `final` content changes create a new revision and preserve prior revision history.
- A generated act file never becomes the editable source of document content.
- A released revision captures output-relevant representatives, references, validation result and template provenance.

### 7.5 Document-owned work in the baseline

Until a reusable `WorkItem` lifecycle is confirmed, `Document` owns the specific work fact it asserts: work description, location, execution period, project references and material usages required by the act. This allows AOSR to be complete without prematurely assuming one shared work record controls several acts.

If future workflows require shared work planning/closure across many documents and schemes, a separate `WorkItem` root may be introduced through an explicit domain decision; prior document snapshots remain authoritative for released acts.

---

## 8. Certificate Aggregate Boundary

### 8.1 Purpose

`Certificate` is the independent quality-evidence aggregate. The umbrella includes certificate, declaration, passport and approved quality-letter kinds as described in the catalog.

### 8.2 Certificate-owned state

`Certificate` owns:

- evidence identity and evidence kind;
- physical original file identity/provenance;
- confirmed registration number where applicable;
- issuer, manufacturer, coverage/product/material/equipment information;
- issuance and validity metadata;
- page/file metadata used in output;
- OCR proposal and human confirmation state as part of its verification workflow;
- archive, replacement or supersession history once that policy is defined.

### 8.3 Not certificate-owned

`Certificate` does not own:

- which text an act says about a material usage beyond confirmed evidence metadata;
- document lifecycle or revisions;
- validity outcome for every referencing document date;
- registry row order or visibility;
- package inclusion order or snapshots.

The document owns the meaning of its relation to evidence. The package owns the record that a particular evidence file was included.

### 8.4 Certificate invariants

| Invariant | Rule |
| --- | --- |
| Physical evidence | An evidence item used in an act, registry or package must have an original file. |
| Confirmed critical metadata | OCR/AI values are proposals until confirmed by a user. |
| Date-relative validation | Expiry is evaluated in the referring document's `DocumentDate` context. |
| Warning baseline | Expired-on-document-date evidence yields warning under accepted policy unless a later rule strengthens it. |
| Historical preservation | An original file used by a released document/package cannot be silently overwritten or erased. |
| Explicit reuse | Reuse is by relation to the same evidence aggregate within allowed tenant policy, not by copied number text. |

---

## 9. ExecutiveScheme Aggregate Boundary

### 9.1 Purpose

`ExecutiveScheme` is the file-backed evidence aggregate for factual/as-built schemes or surveys. It documents actual performance, not the working design basis.

### 9.2 Scheme-owned state

`ExecutiveScheme` owns:

- scheme identity and object context;
- physical original file;
- title, registration number, date, sheet count and note;
- system/zone context metadata where applicable;
- lifecycle and future explicit replacement/supersession handling.

### 9.3 Relations and ownership

Documents may link to a scheme and capture relation purpose/order in their revisions. A scheme can be projected into registry and included in packages. Reverse views showing documents that use a scheme are derived from explicit links; they do not make the scheme owner of document content.

### 9.4 Scheme invariants

- A scheme included as evidence must have a physical file.
- `ExecutiveScheme` is never `ProjectDrawingSet`.
- Silent overwrite of a file used in historical output is prohibited.
- Scheme metadata cannot be corrected only in a registry row.
- The system does not make the scheme an editable CAD drawing.

---

## 10. Template Aggregate Boundary

### 10.1 Purpose

`Template` owns rendering form families and their versions for documents or generated outputs. It governs reproducibility of appearance, not the subject matter of an act.

### 10.2 Template-owned state

`Template` owns:

- template identity, purpose and permitted scope;
- `TemplateVersion` entries and their form definitions/rendering contracts;
- lifecycle of unused/new versions;
- immutable used-version status.

### 10.3 Template invariants

| Rule | Consequence |
| --- | --- |
| Used `TemplateVersion` is immutable | Changes to a form create a new version. |
| Artifact provenance records template version | Old output remains explainable and reproducible. |
| Template is not typed payload | Template content cannot provide missing structured act meaning. |
| Switching released form is explicit | A newly released document representation uses an explicit revision/binding action. |

### 10.4 Non-ownership

`Template` does not own document fields, validation result, registry source content or package composition. Its versions are referenced in generation provenance.

---

## 11. Package Aggregate Boundary

### 11.1 Purpose

`Package` is the aggregate/context for configuring, building and preserving a комплект ИД. It assembles outputs from other owners; it does not become a folder of mutable masters.

### 11.2 Package-owned state

`Package` owns:

- package identity, object/scope and intended output purpose;
- inclusion policy and explicit selection where used;
- ordering and package-scoped presentation choices;
- registry override configuration associated with this output scope;
- asynchronous `PackageBuild` attempts, status and failure/result history conceptually;
- immutable `PackageSnapshot` created after successful build;
- derived generated package artifact provenance.

### 11.3 What PackageSnapshot fixes

Every successful `PackageSnapshot` must fix:

- package scope and inclusion result at build time;
- ordered list of included components;
- exact `DocumentRevisionSnapshot` identities and corresponding generated artifacts;
- included `Certificate`/quality evidence file identities and output-relevant provenance;
- included `ExecutiveScheme` file identities and output-relevant provenance;
- captured registry result, applied overrides and signer snapshot where output includes it;
- template/artifact provenance required to explain rendered outputs;
- build outcome/time and dependency state sufficient to distinguish historical output from current readiness.

### 11.4 What Package does not own

`Package` does not own or mutate:

- document typed payload, lifecycle or revisions;
- certificate original/metadata lifecycle;
- executive scheme original/metadata lifecycle;
- used template version definitions;
- object source settings or company snapshots;
- registry source rows as primary values.

### 11.5 Package invariants

- Package build is asynchronous and snapshot-based at architectural level.
- A successful snapshot is immutable.
- Staleness requests a new build; it never overwrites historical output.
- A package cannot claim required evidence that lacks its file/source.
- Included acts are exact revisions, not mutable pointers to "latest" only.

---

## 12. RegistryProjection Boundary

### 12.1 RegistryProjection

`RegistryProjection` is a derived representation computed from source roots, snapshots and applicable overrides. It may be displayed, exported or captured in a package result; it is not an aggregate root and never owns source data.

It reads, as needed:

- `Object` and object-owned values;
- `ProjectDrawingSet`;
- typed `Document` revisions;
- `Certificate` quality evidence;
- `ExecutiveScheme`;
- selected signer snapshots;
- package scope and approved `RegistryOverride`.

### 12.2 RegistryOverride

`RegistryOverride` is not the projection itself. It is authored presentation configuration within a registry/package scope, permitting:

- row or section ordering;
- inclusion/hiding for a particular output scope;
- printable notes;
- signer selection;
- presentation ordering aligned with a package.

It is owned by the relevant registry-output or package configuration scope and participates as input to projection generation.

### 12.3 Essential distinction

| Aspect | `RegistryProjection` | `RegistryOverride` |
| --- | --- | --- |
| Nature | Derived read/output model | User-authored presentation configuration |
| Source of truth for act/evidence data | Never | Never |
| Can reorder/hide/note | Resolves result from override | Stores allowed instruction |
| Can change document number/date | No | No |
| Can require regeneration | Recomputed when inputs change | Change makes related registry/package output stale |
| Historical package relevance | Captured result/provenance | Applied override state captured with result |

### 12.4 Registry invariants

- Projection does not duplicate ownership of upstream fields.
- Any source edit initiated through a registry UI must be routed to the proper aggregate.
- Exported registry files are generated artifacts.
- A materialized/cache form remains derived and may be invalidated.

---

## 13. DocumentLock Boundary

### 13.1 Classification

`DocumentLock` is operational lease state associated with editing a `Document`; it is not a content aggregate root, not a document revision and not a snapshot of released business meaning.

### 13.2 Why lock state must not change revision

A lock exists to prevent conflicting edits, not to state what the act contains. Lock acquire, heartbeat, expiry, release and allowed override can occur while payload, number, date, links and output remain identical.

If lock heartbeat changed revision:

- an idle editor would create false content history;
- package outputs would appear stale without business change;
- audit would confuse access coordination with document correction;
- autosave/revision policy would become noisy and unreliable.

### 13.3 Lock rules

| Event | Document revision? | Package invalidation? | Reason |
| --- | --- | --- | --- |
| Acquire editing lock | No | No | Coordination only. |
| Heartbeat / TTL refresh | No | No | Session liveness only. |
| Release / expiry | No | No | No structured content changed. |
| Override lock permission action | No by itself | No by itself | Access action; later content save is evaluated separately. |
| Save changed structured payload under valid lock | According to document lifecycle | If released dependency changes | Content change, not lock event. |

### 13.4 Open operational details

TTL duration, override permissions, conflict UX and lock unit beyond document editing remain for later design. No physical locking or transport design is selected here.

---

## 14. WorkItem Boundary Decision

### 14.1 Boundary baseline decision

For Database Schema V1 baseline, `WorkItem` is **not accepted as a separate aggregate root**. The minimum work meaning required to issue a typed act is owned by that `Document` as structured work content and, where applicable, document-owned `MaterialUsage`.

This is a deliberately conservative decision:

- AOSR must be complete and reproducible without depending on a not-yet-proven planning aggregate.
- Current source materials establish act content and relations, but not a confirmed workflow in which multiple documents edit one canonical work record.
- Making work a root too early risks source-of-truth ambiguity between work edits and released document revisions.

### 14.2 Baseline ownership

| Content | Owner in baseline |
| --- | --- |
| Work description rendered in an act | Typed `Document` payload |
| Location/period asserted by an act | Typed `Document` payload |
| Project drawing references asserted by an act | Typed `Document` payload referring to object-owned drawings where applicable |
| Materials/equipment asserted by an act | `MaterialUsage` inside typed document context |
| Quality evidence relation for asserted usage | Document-owned relation to `Certificate` |

### 14.3 Future promotion condition

A reusable `WorkItem` aggregate should be reconsidered if validated workflows require one work item to:

- exist before any document;
- be closed or tested by multiple acts with independently managed progress/status;
- provide a shared source for schemes/material applications beyond document snapshots;
- be scheduled, divided or revised independently of document editing.

If promoted later, released document revisions continue to own their historic work assertions; they are not rewritten to mirror a changing live work item.

### 14.4 Consequence for current relationships

Documents and schemes may retain explicit context/references necessary for output. The baseline does not authorize a registry or package to create a shared work master implicitly.

---

## 15. ProjectDrawingSet Boundary Decision

### 15.1 Boundary baseline decision

`ProjectDrawingSet` is an owned entity in `ObjectDocumentationContext` for the V1 baseline. It represents working/project drawings provided as the basis for execution and registry display.

It is not:

- `ExecutiveScheme`, which records factual/as-built execution;
- a typed act;
- an independent aggregate root unless future lifecycle/reuse requirements demonstrate that need.

### 15.2 Owned state and consumers

| Aspect | Rule |
| --- | --- |
| Owner | `Object` through limited `ObjectDocumentationContext`. |
| Core content | Drawing title/name, code, section/system, sheet count, organization snapshot/reference and note where used. |
| Consumers | AOSR/project-reference blocks, registry working drawings block and package output context. |
| Released document behavior | A final document captures displayed/reference values in its revision; later drawing-set changes do not rewrite it. |
| Registry behavior | Current projection reads the current object-owned entry; changed values stale current output. |

### 15.3 Why this does not make Object giant

Working drawing entries are object setup/documentation context: they describe common project basis, do not hold independent evidence/revision lifecycle in the current scope, and are small compared with documents, scheme originals or package histories. If they later acquire independent approval/version/reuse workflows, the boundary must be revisited before implementing those features.

---

## 16. Snapshot Ownership Rules

### 16.1 Snapshot register

| Snapshot / captured value | Owner | Created for | Must preserve |
| --- | --- | --- | --- |
| `ObjectCompanySnapshot` | `Object` | Stable object company context | Requisites/authority/contract or SRO values used on object. |
| Document output-relevant object values | `DocumentRevisionSnapshot` | Released act reproducibility | Rendered object/system/project context used in that revision. |
| `DocumentRepresentativeSnapshot` | `DocumentRevisionSnapshot` | Released participants/signatures | Roles, names, organization, authority, captions and order. |
| `DocumentRevisionSnapshot` | `Document` | Published/revisioned typed document state | Number/date, payload, relations, validation, template/output provenance. |
| `AutosaveSnapshot` | Document editing workflow | Draft recovery | Structured editing state; not a released revision. |
| Registry signer/result captured for output | `PackageSnapshot` or registry output context | Reproducible generated registry | Selected signer, overrides and resolved rows/blocks. |
| `PackageSnapshot` | `Package` | Successful package build | Exact revisions, files, registry result, order and provenance. |
| Generated artifact provenance | Generating revision/snapshot context | Explain output | Source snapshot/revision and `TemplateVersion`. |

### 16.2 Snapshot immutability rule

Historical snapshots are append-only conceptual records. A live source may be corrected or replaced through its owner rules, but a prior document revision or package snapshot is not edited to appear as if it had used later values.

### 16.3 Snapshot versus live reference

A draft may read live current object/evidence/template candidates. A released document or successful package must preserve the exact output-relevant state it used. This is why a `Certificate` or company profile remains an independent live entity while published output remains reproducible.

---

## 17. Revision Ownership Rules

### 17.1 Only Document owns document revision

`DocumentRevision` represents a meaningful content state of a typed document. No other aggregate may increment or overwrite a document revision directly.

### 17.2 Revision trigger matrix for a final document

| Change to an already `final` document | New document revision required? | Reason |
| --- | --- | --- |
| Number or date | Yes | Published identity/output and certificate-date context change. |
| Typed payload content, conclusion or testing results | Yes | Business meaning changes. |
| Rendered work/location/period/project reference values | Yes | Asserted work content changes. |
| Material usage | Yes | Claimed installed/used content changes. |
| Certificate link, rendered evidence values or relation purpose/order | Yes | Evidence supporting published content changes. |
| Scheme/attachment link, caption or order shown in act | Yes | Published supporting-document statement changes. |
| Participant snapshot, authority or signature block order | Yes | Released signatory context changes. |
| Selected template version for newly released representation | Yes | Released form provenance changes. |
| Validation-relevant acknowledgement included in release | Yes where release state changes | Release justification changes. |

### 17.3 Changes that do not create document revision by themselves

| Change | Why not a document revision |
| --- | --- |
| Lock acquire/heartbeat/release/expiry | Operational editing coordination only. |
| Autosave of unfinished draft | Recovery state until lifecycle/revision action is defined. |
| Read/download of an artifact | No domain content change. |
| Registry projection recalculation | Derived read update only. |
| Registry override affecting only registry layout/note | Does not alter act content. |
| Package rebuild using same exact revision/files | Package output lifecycle only. |
| Live profile update not adopted by released act | Snapshot protects historic content. |

### 17.4 Evidence corrections and document revision

A later correction to live evidence does not silently rewrite an already released document revision. If current output must display changed evidence data or include a different evidence relation/file, a new document revision and/or new package build is required according to the affected released content.

---

## 18. Invariants Catalog

### 18.1 System-wide invariants

| ID | Invariant | Enforced owner/boundary |
| --- | --- | --- |
| `INV-001` | Structured domain data and explicit relations are source of truth. | All aggregates; outputs remain derived. |
| `INV-002` | No cross-tenant domain reference is allowed without a separately approved policy. | Tenant isolation boundary. |
| `INV-003` | DOCX/PDF/XLSX/ZIP exports cannot mutate source automatically. | Generation/projection boundary. |
| `INV-004` | OCR/AI proposals cannot become confirmed critical metadata automatically. | Evidence confirmation workflow. |

### 18.2 Object and organization invariants

| ID | Invariant | Enforced owner/boundary |
| --- | --- | --- |
| `INV-010` | `Object` owns context/settings only, not all independent lifecycles. | `Object`. |
| `INV-011` | Updates to live company profile do not rewrite existing object/document/package snapshots. | `CompanyProfile` / snapshot owners. |
| `INV-012` | `ProjectDrawingSet` is distinct from `ExecutiveScheme`. | Object/scheme boundaries. |
| `INV-013` | Every folder tree is scoped to one object and contains no cycles. | `FolderTree`. |

### 18.3 Document invariants

| ID | Invariant | Enforced owner/boundary |
| --- | --- | --- |
| `INV-020` | `DocumentType` is immutable for a document. | `Document`. |
| `INV-021` | Final typed content changes are preserved through a new revision. | `Document`. |
| `INV-022` | A released revision keeps output-relevant typed content, links, snapshots and provenance. | `DocumentRevisionSnapshot`. |
| `INV-023` | Document lock activity never creates content revision by itself. | `DocumentLock` boundary. |
| `INV-024` | In V1 baseline an act's work assertion is owned by its typed payload, not by an implicit shared work master. | `Document` / `WorkItem` decision. |

### 18.4 Evidence invariants

| ID | Invariant | Enforced owner/boundary |
| --- | --- | --- |
| `INV-030` | Used certificate/declaration/passport evidence requires an original physical file. | `Certificate`. |
| `INV-031` | Certificate validity for an act is evaluated by the act's document date. | `Document` validation with `Certificate` metadata. |
| `INV-032` | Evidence expiry is warning-level under the accepted baseline unless later strengthened. | Document validation policy. |
| `INV-033` | A scheme included or cited as file-backed evidence requires its physical original. | `ExecutiveScheme` / `Document`. |
| `INV-034` | Historical evidence files/provenance cannot be silently overwritten or erased. | Evidence and snapshot owners. |

### 18.5 Template, registry and package invariants

| ID | Invariant | Enforced owner/boundary |
| --- | --- | --- |
| `INV-040` | A used `TemplateVersion` is immutable. | `Template`. |
| `INV-041` | `RegistryProjection` is derived and cannot own source fields. | Projection boundary. |
| `INV-042` | `RegistryOverride` affects presentation only and cannot correct source data. | Override owner. |
| `INV-043` | Package builds are asynchronous and create immutable snapshots when successful. | `Package`. |
| `INV-044` | `PackageSnapshot` records exact dependencies and does not own their mutable lifecycles. | `Package`. |
| `INV-045` | Dependency change makes current output stale without destroying historical package snapshots. | `Package` invalidation. |

---

## 19. Cross-Aggregate Reference Rules

### 19.1 Allowed reference principles

- A reference identifies the target owner and purpose; it does not transfer ownership.
- Every reference must satisfy tenant isolation and required object scope.
- Released snapshots record output-relevant resolved values/provenance needed for history.
- Reverse lists may be derived from references; they are not duplicate mutable owner state.

### 19.2 Allowed relationships

| Source owner | May reference | Purpose / restriction |
| --- | --- | --- |
| `Document` | `Object` | Required context; output-relevant values captured on release. |
| `Document` | `FolderTree` node | Placement reference only. |
| `Document` | object-owned `ProjectDrawingSet` | Basis/reference values; released display is captured. |
| `Document` | `Certificate` | Quality evidence with existing physical file. |
| `Document` | `ExecutiveScheme` | Supporting scheme/attachment with existing file when asserted. |
| `Document` | `TemplateVersion` | Rendering provenance; used version immutable. |
| `Package` | `DocumentRevisionSnapshot` | Include exact released act state. |
| `Package` | `Certificate`/evidence file | Include exact quality evidence provenance. |
| `Package` | `ExecutiveScheme`/file | Include exact scheme provenance. |
| `RegistryProjection` | Source roots/snapshots/overrides | Read/resolve output only. |
| `DocumentLock` | `Document` | Lease editing only; no content ownership. |

### 19.3 Prohibited relationships and ownership leaks

| Prohibited relation/behavior | Reason |
| --- | --- |
| Registry row as owner of document number/date/payload | Violates derived projection principle. |
| Document embedding a manually typed certificate number as satisfied evidence without relation/file | Violates physical evidence and explicit relation rules. |
| Package editing included source document/evidence metadata | Package is a build/snapshot owner only. |
| Object mutating nested document/evidence/template/package histories | Creates giant aggregate and breaks independent lifecycles. |
| ExecutiveScheme used as ProjectDrawingSet or vice versa | Confuses design basis with factual evidence. |
| Folder placement operation mutating final payload silently | Placement does not own document meaning. |
| Lock heartbeat increasing revision | Operational activity is not business content. |
| OCR proposal directly filling verified released evidence | Violates assistant-only principle. |

---

## 20. Allowed Operations Matrix

| Operation | Responsible owner | Permitted effect | Revision / invalidation note |
| --- | --- | --- | --- |
| Create object context and owned settings | `Object` | Establish context/defaults/drawing entries | No document revision; future outputs consume context. |
| Update object settings for future/current use | `Object` | Change live configuration | Released docs unchanged; outputs using current value may stale. |
| Create/move/soft-delete folder node | `FolderTree` | Change hierarchy/placement | No document revision unless separate document-number change requested. |
| Create typed act draft | `Document` | Create typed payload in object context | Draft lifecycle begins. |
| Finalize valid typed act | `Document` | Capture released revision snapshot | Enables generated artifact/package inclusion. |
| Correct final typed act | `Document` | New revision after validation | Stales dependent current package/registry output. |
| Link quality evidence to document usage | `Document` referencing `Certificate` | Store relation purpose/order after target validity checks | Final content relation change requires revision. |
| Upload/confirm certificate original/metadata | `Certificate` | Make evidence available/verified | Projections/packages depending on changed evidence may stale. |
| Upload scheme metadata/file | `ExecutiveScheme` | Establish scheme evidence | Related outputs update through explicit relations. |
| Create a new template version | `Template` | Add form option | Does not rewrite released output. |
| Select new template for new release | `Document` / output context | Use explicit immutable version | Released document representation change requires revision. |
| Change registry presentation order/note/signer | Override scope | Change projection presentation only | Registry/package output stales; document revision unchanged. |
| Build/rebuild package | `Package` | Create immutable build snapshot | Does not revise included documents. |
| Acquire/refresh/release edit lease | `DocumentLock` | Coordinate editing | No revision or output invalidation. |

---

## 21. Forbidden Operations Matrix

| Forbidden operation | Violated invariant | Correct domain action |
| --- | --- | --- |
| Store edited DOCX/PDF as master document state | `INV-001`, `INV-003` | Update structured typed data and generate new output. |
| Change `DocumentType` of an existing document | `INV-020` | Create a new typed document. |
| Edit a final document in place without revision history | `INV-021`, `INV-022` | Create/record the next revision. |
| Use certificate number without library item and file | `INV-030` | Create/confirm `Certificate`, then link it. |
| Validate certificate only against today's date | `INV-031` | Evaluate in referring `DocumentDate` context. |
| Replace evidence file used historically without provenance | `INV-034` | Follow explicit replacement/supersession policy once ratified. |
| Edit a used template version | `INV-040` | Create a new `TemplateVersion`. |
| Write source corrections into registry override/row | `INV-041`, `INV-042` | Send change to the owning aggregate. |
| Overwrite prior package snapshot on dependency change | `INV-043`, `INV-045` | Mark stale and build a new snapshot. |
| Put documents/evidence/packages inside mutable Object state | `INV-010` | Keep separate roots with references/snapshots. |
| Treat `ProjectDrawingSet` as an as-built scheme file | `INV-012` | Maintain separate object drawing and scheme evidence concepts. |
| Promote an unconfirmed OCR value to published evidence | `INV-004` | Require user confirmation. |
| Increment document revision due solely to lock activity | `INV-023` | Record only operational lease event if needed. |

---

## 22. Package Invalidation Rules

### 22.1 Meaning of invalidation

Package invalidation means that an existing successful snapshot no longer represents the current desired output for the same package scope. It does not delete, rewrite or make historically false the previously built snapshot.

### 22.2 Mandatory stale/rebuild triggers

| Changed dependency | Package effect | Why |
| --- | --- | --- |
| Included `Document` obtains a new released revision | Stale; rebuild required for current output | Included act content/provenance changed. |
| Included document generated artifact/template binding changes for new released output | Stale | Rendered act provenance changed. |
| Included document adds/removes/changes evidence or scheme relation relevant to package | Stale | Composition/evidence basis changed. |
| Included `Certificate` original file or output-relevant confirmed metadata changes through allowed policy | Stale | Quality evidence content/provenance changed. |
| Included `ExecutiveScheme` file or output-relevant metadata changes through allowed policy | Stale | Scheme output/provenance changed. |
| Object/company/drawing/signer snapshot or value used in registry/package output changes | Stale | Output-visible context changed. |
| `RegistryOverride`, package order, inclusion policy or scope changes | Stale | Output composition/presentation changed. |
| Template version used for registry or package-generated output changes | Stale | Rendered output provenance changed. |

### 22.3 Non-triggers by themselves

| Event | Package remains current if no content dependency changes because |
| --- | --- |
| DocumentLock heartbeat/expiry | It does not change source content. |
| Viewing/downloading an artifact | It is read activity. |
| Unused new `TemplateVersion` creation | Included output continues to identify its version. |
| Live profile edit not adopted into any included snapshot/output | Historical/current included inputs have not changed. |
| Registry recomputation producing identical input/result state | No dependency changed. |

### 22.4 Package readiness versus warnings

Whether a warning blocks issuing a particular package remains a domain/policy question. Under current accepted rule, certificate expiry on the document date produces a warning rather than automatic blocking; package output must preserve visible validation/provenance appropriate to later approved policy.

---

## 23. Registry Invalidation Rules

### 23.1 Current projection freshness

Unlike immutable package snapshots, a current registry projection is rebuildable. It becomes stale when any displayed source field or authorised presentation input changes.

### 23.2 Recalculation triggers

| Change | Registry behavior |
| --- | --- |
| Object header/current company/drawing-set value displayed in registry changes | Recalculate corresponding block. |
| Typed document number/date/type/display description/status/revision shown changes | Recalculate acts block. |
| Certificate metadata/file presence/inclusion relevant to block changes | Recalculate quality documents block. |
| ExecutiveScheme metadata/file presence/inclusion changes | Recalculate scheme block. |
| Registry signer choice, row ordering, note or visibility override changes | Recalculate output using new override. |
| Package scope used to define registry content changes | Recalculate scoped registry. |

### 23.3 What is not a source change

Lock/heartbeat state, draft autosave not published/displayed, unused template versions and viewing an export do not alter registry source content by themselves. A UI may show operational indicators separately, but this does not authorize rewriting registry domain blocks.

### 23.4 Exported and snapshotted registry results

An exported current registry is a generated artifact. A registry output captured inside a successful `PackageSnapshot` remains historical and is not recomputed in place when current source data changes; a new package build captures a new result.

---

## 24. Open Questions

### 24.1 Boundaries and reusable domain concepts

1. Should a reusable `WorkItem` aggregate be introduced later after shared closure/testing workflows are validated, and what triggers promotion from document-owned work statements?
2. Does `ProjectDrawingSet` eventually require independent lifecycle/versioning/approval sufficient to promote it from object-owned entity?
3. Should `RepresentativeProfile` be a standalone library aggregate in the first schema, or are object/document snapshots and limited defaults sufficient?
4. Is a reusable `Material`/equipment catalog required in MVP, or are document-owned `MaterialUsage` entries sufficient initially?

### 24.2 Documents and validation

1. Which concrete `TestAct` types enter the first MVP, and is `TechnicalReadinessAct` included?
2. Which AOSR participant roles, scheme requirements, material evidence requirements and location fields are blocking errors?
3. Does a particular customer/form policy ever strengthen certificate-expiry warning to a blocking error?
4. What is the precise draft revision versus autosave policy?

### 24.3 Evidence, templates and retention

1. What explicit replacement/supersession/retention policy applies to certificate and scheme files already used historically?
2. What minimum audit trail is required for evidence confirmation, revision release, template choice and package builds?
3. Which first templates/registry outputs/package covers are required, while preserving immutable version behavior?

### 24.4 Registry, package and access policy

1. What scopes own `RegistryOverride` outside a package-specific output, and which registry exports enter MVP?
2. Which warnings block package readiness, and which are included with acknowledgement?
3. What tenant/object reuse rules apply to evidence shared across projects?
4. What RBAC/privacy rules govern originals, personal data and lock override?

---

## 25. Decisions Required Before Database Schema V1

The following domain decisions must be ratified or explicitly deferred before a physical Database Schema V1 is treated as approved:

| Decision gate | Proposed baseline in this document | Required confirmation |
| --- | --- | --- |
| Aggregate root register | `Object`, `FolderTree`, `Document`, `Certificate`, `ExecutiveScheme`, `Template`, `Package`, supporting `CompanyProfile`; tenant isolation is mandatory | Confirm roots and any first-schema library boundaries such as representatives. |
| Folder organization boundary | Separate object-scoped `FolderTree` root | Confirm move/duplicate/soft-delete scope and whether placement belongs entirely to tree context. |
| Work boundary | Work content owned by typed `Document`; no reusable `WorkItem` root initially | Confirm that first MVP does not require shared work lifecycle. |
| Working drawings boundary | `ProjectDrawingSet` owned by `ObjectDocumentationContext` | Confirm no independent approval/version workflow is required in first scope. |
| Typed document scope | AOSR baseline; testing family candidates remain unratified | Select concrete first document types and their validation contracts. |
| Material/evidence boundary | `MaterialUsage` in typed document and independent file-backed `Certificate` | Decide whether reusable material/equipment catalog is required. |
| Revision/lifecycle policy | Final edits create revisions; draft/autosave detail open | Confirm release statuses and draft revision triggers. |
| Evidence historical policy | No silent overwrite; exact replacement/retention open | Define supersession/retention and audit needs. |
| Registry override ownership | Presentation only; scoped ownership detail open | Define registry/package scopes and MVP export requirements. |
| Package readiness/invalidation | Immutable snapshot and mandatory rebuild triggers listed above | Define warning acceptance/readiness policy. |
| Access/privacy constraints | Tenant-safe relations and AI confirmation required | Define RBAC, cross-object reuse and privacy requirements for originals. |

Until these decisions are ratified, this document is the draft consistency boundary for further discussion, not an instruction to select storage technology or build implementation artifacts.
