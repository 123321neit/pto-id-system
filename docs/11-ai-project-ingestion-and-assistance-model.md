# 11. AI Project Ingestion and Assistance Model

# PTO ID System

# Архитектурная модель загрузки проектной документации и AI-assisted анализа ИД

Статус: draft specification for review before Database Schema V1.

Дата фиксации: 2026-05-27.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание модели: `docs/06-data-model-v1.md`, `docs/09-aggregate-boundaries-and-invariants.md`, `docs/10-auth-workspace-rbac-model.md`, ADR 0001-0005.

---

## 1. Purpose

Этот документ определяет архитектурную модель, в которой пользователь может загрузить проектную документацию объекта, а будущий AI-помощник сможет анализировать её для подготовки исполнительной документации и поиска возможных ошибок.

Документ фиксирует:

- роль project source materials в object workspace;
- границу между загруженным исходным файлом, структурированными данными и AI proposals;
- допустимые сценарии извлечения сведений и выявления несоответствий;
- правила пользовательского подтверждения, privacy, tenant isolation и audit;
- связи проектных материалов с `Object`, `ProjectDrawingSet`, typed documents и evidence;
- scope, который следует учесть перед проектированием Database Schema V1.

Спецификация намеренно не содержит кода, SQL, физической схемы хранения, API/endpoint design, выбора AI/OCR provider, выбора модели, инфраструктуры или новых зависимостей.

### 1.1 Decision status

Документ разделяет:

- **Inherited rule** - ранее принятое правило: structured data являются source of truth, AI/OCR работает только как assistant, а tenant isolation обязательна.
- **Ingestion baseline** - предлагаемая модель project files, proposal workflow, traceability и связей, которую необходимо учесть до Database Schema V1.
- **Open question** - вопрос продукта, безопасности или domain ownership, который нельзя решить молча будущей реализацией.

Ingestion baseline:

1. Every uploaded project file belongs to a `Workspace` and an `Object`; файл без object/tenant context не может участвовать в AI-assisted ИД.
2. Uploaded project documentation является source material and provenance, но не становится единственным source of truth системы.
3. Source of truth для работы продукта остаётся confirmed structured data и explicit domain relations.
4. AI/OCR создаёт только proposals и findings; ни одно извлечённое значение, связь, документ или validation outcome не утверждается автоматически.
5. Пользователь подтверждает extracted data перед тем, как оно станет active structured data или повлияет на выпускаемую документацию.
6. Every AI result must be traceable and auditable: должно быть возможно понять, из какого файла/фрагмента возникло предложение, кто его принял или отклонил и во что оно превратилось.

Эти правила расширяют уже принятые ADR 0001-0005 и принцип `AI = assistant only`; новый ADR на этом этапе не требуется.

---

## 2. Why Project Upload Matters

Исполнительная документация создаётся не в вакууме. Инженер ПТО опирается на рабочую документацию, чертежи, спецификации, обозначения систем, участков и материалов. Без project source materials система может автоматизировать оформление известных данных, но не может помочь сопоставить то, что должно быть выполнено по проекту, с тем, что документируется как выполненное.

Project upload нужен, чтобы в будущем:

- быстро найти основания для АОСР и актов испытаний;
- предложить список работ и проектных ссылок из проектной документации;
- сопоставить заявленные работы, сертификаты и исполнительные схемы с проектным basis;
- выявить пропуски или противоречия до сборки комплекта ИД;
- уменьшить ручной перенос обозначений систем, зон, этажей, осей и листов;
- сохранить происхождение предложений и замечаний для проверки инженером.

Project upload не превращает PTO ID System в CAD, BIM, систему проектирования или универсальное файловое хранилище. Система помогает готовить и проверять ИД, используя загруженный проект как контролируемый source material.

---

## 3. Project Source Materials Model

### 3.1 Conceptual roles

Модель различает исходный файл, его классификацию, предложение AI и подтверждённые structured data.

| Concept | Purpose | Ownership / rule |
| --- | --- | --- |
| `ProjectSourceFile` | Загруженный пользователем файл проектной документации | Scoped to exactly one `Workspace` and one `Object`; original file is retained according to future retention policy. |
| `ProjectSourceClassification` | Пользовательская или подтверждённая классификация файла: drawing, specification, explanatory material и т.п. | Не должна автоматически устанавливаться AI как утверждённый факт. |
| `ProjectSourceReference` | Явная ссылка доменной сущности или предложения на файл/лист/фрагмент | Обеспечивает provenance; не переносит ownership доменной сущности к файлу. |
| `AIExtractionProposal` | Предложение structured values или relations, извлечённых из source file | Proposal only; требует user confirmation до применения. |
| `AIConsistencyFindingProposal` | Предложение о возможной ошибке, пропуске или расхождении | Finding for review; не является автоматически доказанной ошибкой или blocking validation. |
| `ProposalSourceCitation` | Указание источника предложения: файл, лист/страница, область или текстовый фрагмент, если доступно | Обязательно для review и audit настолько детально, насколько позволяет source format. |
| Confirmed structured target | `ProjectDrawingSet`, typed document payload, evidence link или иное утверждённое поле | Source of truth только после явного действия authorized user и domain validation. |

Названия являются концептуальными и не утверждают будущие таблицы, payload format или API.

### 3.2 Core boundary rules

- Project source files должны быть привязаны к `Workspace` и `Object` при загрузке или до начала какой-либо обработки.
- Project source file не является `ExecutiveScheme` автоматически: рабочий проект и фактическая исполнительная схема имеют разный смысл.
- Project source file не является `Certificate`: проектная спецификация может потребовать документ качества, но не заменяет фактически загруженное evidence.
- Файл может служить provenance для текущего `ProjectDrawingSet` или проектных ссылок document-owned work statement, но released documents сохраняют необходимые resolved references в собственной revision history.
- Изменение, замена или уточнение project file не должно тихо переписывать already released `DocumentRevisionSnapshot`, evidence или `PackageSnapshot`.
- AI analysis читает только файлы и structured context, доступные в том же authorized workspace/object scope.

### 3.3 Conceptual review lifecycle

| Stage | Meaning | Allowed outcome |
| --- | --- | --- |
| Upload | Пользователь добавил project source material в object context | Файл доступен по access policy; structured domain state ещё не изменён. |
| Classification | Пользователь определяет или проверяет тип/назначение материала | Confirmed classification may guide later review. |
| Processing | OCR/AI анализирует допустимый source material по утверждённой policy | Только proposals/findings with provenance. |
| Review | Пользователь видит предложение рядом с источником и context | Accept, edit-and-accept, reject or leave unresolved. |
| Confirmation | Authorized user подтверждает значение или связь | Подтверждённое изменение применяется к соответствующему domain owner с audit. |
| Reassessment | Source file, structured data или linked document changed | Existing proposal may be stale; released history is not silently rewritten. |

---

## 4. Supported Future Source Types

Поддержка source type означает будущую возможность хранить материал в project context и, после отдельного решения, анализировать его. Она не означает, что любой формат входит в MVP или что его содержимое автоматически преобразуется в domain data.

| Future source type | Potential purpose | Constraints |
| --- | --- | --- |
| PDF project documentation | Основной читаемый набор проектных материалов, разделов и листов | PDF remains source material; extracted facts require confirmation. |
| DWG/DXF | Машиночитаемые чертежи и привязки в будущем | Future scope only; система не становится CAD и не выбирает CAD processing approach здесь. |
| DOCX/XLSX | Спецификации, ведомости и сопровождающие таблицы | Source content can suggest values only; exported/editable office file is not source of truth. |
| Scanned PDFs | Бумажные/сканированные проектные листы | Требуют OCR-quality review; низкое качество повышает необходимость ручной проверки. |
| Specifications | Состав материалов, оборудования, обозначений и требований к evidence | Может предложить expected certificates/material usages, но не доказывает факт применения. |
| Drawings | Листы, узлы, системы, оси, этажи, зоны и design references | Могут поддерживать project references и checks against actual documentation; не являются executive scheme. |

---

## 5. AI Assistant Role

AI assistant предназначен для ускорения анализа, а не для замены инженерного решения. Его роль:

- читать permitted project source materials и существующие structured data объекта;
- создавать удобные для проверки proposals по значениям, связям и спискам документов;
- показывать источник каждого предложения;
- находить потенциальные gaps и inconsistencies;
- помогать навигации по проекту и подготовке черновой структуры ИД;
- повторно проверять proposals/findings после изменения confirmed data или источников.

AI assistant не является участником подписания, автором проектной документации, экспертом, утверждающим соответствие, либо владельцем aggregate state.

---

## 6. AI Is Assistant Only, Not Source of Truth

Fundamental rule:

```text
AI/OCR output = proposal, never approved domain fact
SOURCE OF TRUTH = confirmed structured data and explicit relations
```

Uploaded project documentation сохраняет значение исходного основания и provenance. Однако файл, его OCR-текст и ответ AI не становятся единственным source of truth для создаваемых документов, связей или проверок.

Практические следствия:

- предложенный AI перечень АОСР не создаёт АОСР автоматически;
- извлечённый drawing code не заменяет confirmed `ProjectDrawingSet` field автоматически;
- найденное упоминание сертификата не создаёт `Certificate` и не удовлетворяет evidence requirement;
- предполагаемое расхождение не становится validation error без review/approved rule;
- AI не изменяет final documents, revision history, registry projection source fields или package snapshots;
- confidence score, если он когда-либо используется, помогает prioritization review, но не заменяет подтверждение.

---

## 7. User Confirmation Rules

### 7.1 Confirmation is mandatory

Пользователь должен явно подтвердить extracted data до его использования как active structured data. Это относится как минимум к:

- идентификаторам и атрибутам рабочих чертежей;
- системам, зонам, этажам, осям, участкам и design references;
- descriptions of work proposed for an AOSR or testing act;
- material/equipment references and expected quality documents;
- links between project materials and typed documents/evidence/schemes;
- результатам проверки completeness или inconsistency, если они влияют на workflow.

### 7.2 Confirmation effect

Confirmation означает осознанную domain operation соответствующего owner, а не утверждение всего AI response целиком:

- пользователь видит proposed value, target field/relation and cited source;
- пользователь может принять предложение, исправить его перед принятием или отклонить;
- подтверждение требует роли/permission для изменения соответствующего target в workspace;
- обычные domain invariants продолжают применяться после подтверждения;
- подтверждение released document content подчиняется revision rules;
- принятие предложения фиксируется в audit с actor, target и source provenance.

### 7.3 Bulk review guardrail

Будущий bulk confirmation может быть полезен, но не должен скрывать ответственность пользователя. Он допустим только при сохранении просмотра источников, понятного списка изменяемых structured targets, permission checks, validation и audit каждой принятой группы изменений.

---

## 8. AI Extraction Proposals

AI/OCR может предлагать structured values и relations, если предложение показывает исходный source context и остаётся неподтверждённым до действия пользователя.

| Proposal category | Possible proposed content | Potential confirmed target |
| --- | --- | --- |
| Project identity/reference | Раздел, шифр, наименование, номер/лист drawing set | `ProjectDrawingSet` in `ObjectDocumentationContext` |
| Engineering structure | Система, подсистема, зона, этаж, помещение, оси, отметки | Object/document structured context according to later approved model |
| Work basis | Наименование скрытых работ, участки, проектные ссылки | `AOSR` document-owned work statement or future approved work context |
| Testing basis | Испытываемая система/участок и cited project requirements | `TestAct` typed draft fields after user review |
| Specification item | Материал, оборудование, марка, expected supporting document | Proposed `MaterialUsage`/evidence expectation; not proof of application |
| Drawing relation | Связь работы или документа с листом/узлом проекта | Explicit project reference in the owning typed document |
| Scheme comparison context | Project reference against which an executive scheme may be reviewed | Link/context for reviewed comparison; not automatic scheme approval |

Every extraction proposal should conceptually carry:

- the source file identity and workspace/object context;
- the target concept it proposes to affect;
- proposed value or relation;
- source citation adequate for human verification;
- processing/proposal status and staleness context;
- review result, actor and time once acted upon.

---

## 9. AI Error Detection Proposals

AI may surface potential issues as reviewable findings. It must describe why a finding arose and what sources were compared; it must not assert engineering compliance on its own.

| Finding category | Example comparison | Required user treatment |
| --- | --- | --- |
| Missing evidence candidate | Specification indicates required material/equipment, while linked documents have no matching confirmed certificate | Review applicability and upload/link/confirm evidence if required. |
| Work versus drawing mismatch | AOSR work statement refers to system/zone not found or inconsistent with cited drawing | Engineer verifies drawing and corrects structured data or dismisses finding. |
| Missing project reference | Typed document draft contains work with no cited project basis | User adds verified reference or records why not applicable. |
| Inconsistent identifiers | Drawing code, system name, axes or floor differ across project file and document fields | User chooses correct confirmed value and preserves explanation where needed. |
| Package completeness warning | Required-by-confirmed-rules document/evidence appears absent from package context | Existing package/readiness policy determines action after review. |
| Version/staleness warning | A newer project source material exists after proposals or released document references were captured | User assesses whether a new document revision or review is required. |

An AI finding is not automatically:

- an `ERROR` that blocks a document;
- proof that the project is defective;
- proof that performed works are wrong;
- an authorization to create, revise, remove or relink documents;
- a substitute for approved validation rules and professional review.

---

## 10. Links Between Project Files and Domain Concepts

Project files participate through explicit scoped relations and proposal provenance. They do not absorb the lifecycle of typed documents or evidence.

| Domain concept | Permitted relationship to project source files | Ownership and confirmation rule |
| --- | --- | --- |
| `Object` | Every project file is uploaded in the context of one object within one workspace | `Object` supplies scope/context; it must not become a giant aggregate containing every processing history. |
| `ProjectDrawingSet` | Source files may represent or substantiate working drawing sets and sheets | Draft baseline remains object-owned `ProjectDrawingSet`; proposed fields/relations need confirmation. |
| `WorkItem` / document-owned work statement | AI may suggest work descriptions, locations and project references from drawings/specifications | In current baseline the typed `Document` owns its asserted work; no implicit standalone `WorkItem` is created. |
| `AOSR` | Project files may be cited as basis for concealed works and may produce draft suggestions | `AOSR` remains a typed `Document`; only user-approved structured content enters its payload/revision. |
| `TestAct` | Project requirements may suggest tested subject/reference or completeness checks | `TestAct` remains a typed `Document`; result/conclusion cannot be inferred or approved by AI. |
| `Certificate` | Specifications may indicate expected certificate/evidence for material or equipment | A project file is not a certificate; `Certificate` still requires its own physical evidence file and confirmed metadata. |
| `ExecutiveScheme` | AI may compare an as-built scheme context against project drawings or suggest project references | Project drawing is not an executive scheme; scheme file/metadata and any acted-on finding remain separately controlled. |

Cross-link guardrails:

- all linked items must belong to the same workspace unless a future approved transfer/sharing policy says otherwise;
- object scope must be verified where a relation is object-specific;
- acceptance of an AI-proposed link is an attributable user operation;
- released document/package provenance cannot be silently changed because a project file or AI conclusion changed later.

---

## 11. Possible AI Use Cases

| Use case | Assistant output | Human/domain gate |
| --- | --- | --- |
| Suggest AOSR list from project | Candidate concealed works with cited sheets/specifications and suggested grouping | User decides which typed documents to create and confirms content. |
| Detect missing certificates | Candidate expected evidence not yet linked/found for documented material or equipment | User verifies requirement and provides or links actual `Certificate`. |
| Detect mismatch between works and drawings | Finding describing conflicting system, zone, location, code or cited sheet | User confirms correction/dismissal; released change follows revision rules. |
| Suggest project references | Candidate drawing/specification references for an act | User accepts references into structured typed document data. |
| Suggest systems/zones/floors/axes | Candidate structured location/context values from project materials | User verifies terminology and target scope before saving. |
| Check package completeness | Findings that confirmed document/evidence expectations may not be satisfied | Package readiness uses approved rules and acknowledged review outcomes. |
| Warn about inconsistencies | Review list of duplicated, conflicting or stale references | Warning remains traceable; AI never self-resolves it. |

---

## 12. Privacy and Security Rules

Project documentation can include sensitive technical, commercial, contractual and personal information. Its processing must follow these architectural rules:

1. Project files are sensitive workspace data, not public training or demo material by default.
2. Contents must not be transmitted to an external AI/OCR service without a separately approved data-processing, consent, privacy and retention policy.
3. No AI provider, model, deployment mode or processing location is selected by this document.
4. Only the minimum authorized project/object context needed for the requested analysis may be made available for processing.
5. Source files, extracted text, previews, proposals, findings and cited fragments inherit access restrictions of their workspace/object source.
6. Access to originals and potentially sensitive extracted content may require narrower permissions than access to ordinary derived lists.
7. Retention, deletion, replacement and incident-response policy must account for source files and AI-derived review material without destroying necessary audit/provenance.
8. Public samples, demonstrations or support materials must not expose real project contents or personal/company requisites without approved handling.

---

## 13. Tenant and Workspace Isolation

The access baseline of `docs/10-auth-workspace-rbac-model.md` applies fully to project ingestion and AI assistance.

| Isolation concern | Mandatory rule |
| --- | --- |
| File ownership | Each `ProjectSourceFile` belongs to exactly one workspace and one object context. |
| Processing scope | AI/OCR may read only files and structured context accessible to the acting membership in the active workspace. |
| Proposal ownership | Proposals/findings remain in the same workspace/object scope as their sources and intended targets. |
| Linking | A proposal cannot link to a document, certificate, scheme or drawing context in another workspace. |
| Search/retrieval | Project content and AI findings cannot surface in another workspace search or assistant context. |
| Copy/transfer | Copying a project file or derived proposal between workspaces is deferred until an explicit provenance/privacy/audit policy exists. |
| Permissions | User confirmation requires authority to modify the proposed target; permission to upload/read is not by itself permission to approve domain changes. |

The fact that the same natural-person user belongs to multiple workspaces does not relax these isolation rules.

---

## 14. Audit Requirements

AI-assisted work must be explainable to the engineer and historically attributable. Architecture must support audit for:

- upload, replacement/supersession, archive and policy-sensitive access/download of project source files;
- workspace, object, source type and user-confirmed classification associated with a file;
- request or initiation of OCR/AI processing, to the level required by future security policy;
- identity/version of the source material used for a proposal and sufficient cited location/provenance;
- generated extraction proposals and inconsistency findings, including status such as pending, accepted, edited-and-accepted, rejected or stale;
- user confirmation or rejection, acting membership, time and resulting structured target/relation;
- changes to released typed documents resulting from accepted proposals, through existing revision audit rules;
- completeness or inconsistency findings acknowledged or dismissed in a documentation/package workflow;
- failed or denied cross-workspace/access attempts where security policy requires recording.

Audit must allow a later reviewer to distinguish:

```text
what the uploaded project said
what AI proposed
what the user confirmed
what structured data and released outputs ultimately recorded
```

---

## 15. What AI Is Forbidden to Do

AI/OCR is forbidden to:

- automatically approve extracted data, links, findings or validation outcomes;
- make an uploaded project file, OCR text or AI response the sole source of truth;
- create or finalize AOSR, TestAct or other typed documents without user confirmation;
- create a satisfied `Certificate` relation from a specification mention without actual evidence file and confirmation;
- treat a project drawing as `ExecutiveScheme` or silently substitute one for the other;
- rewrite confirmed structured fields, released revisions, registry source data or package snapshots;
- issue engineering approval, compliance conclusion or signature on behalf of the user;
- suppress a discrepancy merely because it conflicts with another AI suggestion;
- read, correlate, search, suggest links to or reveal data across workspace boundaries;
- process project file contents outside an approved privacy/data-processing policy;
- select its own provider, model, implementation technology, API or storage design through this architecture document.

---

## 16. MVP Scope

For the first product scope that eventually implements this architecture, the minimum responsible capability is:

- allow permitted users to attach project documentation to the correct `Workspace` and `Object` context;
- distinguish project source files from certificates, executive schemes and generated outputs;
- support PDF project documentation as the initial project source material category for human reference;
- preserve user-entered classification and source references to `ProjectDrawingSet`/typed documents;
- establish the proposal-only, user-confirmed and audited model for any AI/OCR assistance that is later enabled;
- make project-ingestion concepts visible in Database Schema V1 planning even if actual AI processing is deferred.

MVP scope does not require automated AI/OCR extraction to ship with initial object/document workflows. It requires that future assistance cannot be bolted on in a way that bypasses source-of-truth, isolation, confirmation or audit rules.

---

## 17. Deferred Scope

Explicitly deferred:

- selection of any AI/OCR provider, model, service arrangement or processing jurisdiction;
- physical data model, SQL, API contracts, storage engine, file pipeline, queues or dependencies;
- actual OCR/extraction/error-detection implementation and quality thresholds;
- DWG/DXF ingestion, rendering, semantic parsing or CAD/BIM integrations;
- advanced DOCX/XLSX parsing and scanned-PDF OCR workflow;
- automatic creation of document sets from project files;
- reusable `WorkItem` promotion or new project-document aggregate boundaries beyond ratified decisions;
- project revision/approval/supersession workflow and long-term retention rules;
- cross-workspace transfer/share of project originals or AI results;
- legally significant approvals, digital signatures or autonomous compliance checking.

---

## 18. Open Questions

### 18.1 Domain and workflow

1. Which project source materials are mandatory or most valuable for the first real object workflow: full PDF set, individual sheets or specifications?
2. How does a user distinguish current project revision, superseded material and supplementary material without making source files a new uncontrolled truth?
3. Which exact extracted fields may populate `ProjectDrawingSet`, and which belong only inside document-owned project references?
4. Which confirmed rules determine when a missing certificate or missing scheme is a warning versus a blocking validation finding?
5. Does any validated workflow eventually require a reusable `WorkItem` or independent lifecycle/versioning for `ProjectDrawingSet`?

### 18.2 Review, quality and audit

1. What citation granularity is necessary for PDFs, scanned pages, specifications and eventual drawing formats?
2. Which users/roles may upload, run processing, confirm extracted data, dismiss findings and see originals?
3. How are stale proposals identified after a replacement project file or change to structured target data?
4. What minimum audit history and retention period are required for AI-assisted decisions used in released documents or packages?
5. How should UI distinguish an AI hint, an acknowledged warning and a domain validation error?

### 18.3 Privacy and processing

1. What data-processing/consent policy is required before any real project content is submitted to AI/OCR?
2. May processing ever occur outside the tenant-controlled environment, and under which customer controls?
3. Which project contents require masking, narrower access, retention limits or prohibited processing?
4. Is any controlled export/copy of sources and proposals between workspaces acceptable?

---

## 19. Impact on Future Database Schema V1

Database Schema V1 is now expected as `docs/12-database-schema-v1.md` and must be designed only after the pre-schema decisions in documents 09-11 have been reviewed and either ratified or explicitly deferred.

Without prescribing SQL, tables or implementation, future schema design must account conceptually for:

| Schema concern to address later | Architectural requirement from this document |
| --- | --- |
| Project source identity and scoping | Uploaded project files have mandatory `Workspace` and `Object` ownership/context. |
| Source type and provenance | Files can be classified and cited as source materials without becoming domain truth automatically. |
| Relations to domain owners | Explicit connections can exist to `ProjectDrawingSet`, document-owned work/project references, `AOSR`, `TestAct`, `Certificate` expectation context and `ExecutiveScheme` comparison context. |
| Proposal separation | AI extraction proposals and error-detection findings are separate from confirmed structured target data. |
| Confirmation workflow | User decision, permissions, resulting domain change and proposal status must be representable and auditable. |
| Source citation/traceability | A finding/proposal can retain identity of source material and reviewable citation context. |
| Staleness/reassessment | Later changes to source or structured data cannot silently alter released history and may require proposal reassessment. |
| Privacy/access isolation | Original files, extracted content, proposals and findings follow workspace isolation and sensitive-access policy. |
| Audit | Processing, review, acceptance/rejection and impact on domain data can be attributed historically. |

This schema impact does not approve a physical design. It establishes the domain and governance questions that a future schema must not omit.
