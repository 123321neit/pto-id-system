# 15. API Command/Read Model Contracts V1

# PTO ID System

# Conceptual command, query and async-operation contracts for executive documentation workflows

Статус: conceptual contract specification for review before MVP Scope and First Forms V1.

Дата фиксации: 2026-05-27.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание: `docs/12-database-schema-v1.md`, `docs/13-domain-lifecycle-immutability-validation-v1.md`, `docs/14-backend-api-architecture-v1.md`, ADR 0001-0007, анализ АОСР и реестра.

Access amendment note, 2026-05-29:

```text
docs/19-sharing-and-access-model-v1.md supersedes membership/RBAC command contracts for MVP implementation scope.
```

MVP command/read contracts for access must use owner-based sharing, share codes and explicit grant capabilities. Membership/role contract language below is deferred historical context unless a later non-MVP governance document reintroduces it.

Object-template amendment note, 2026-06-22: working document contracts must
expose strict `linked`/`manual` template mode under ADR 0007. Linked mode stores
references and resolves current `ObjectTemplate`/library data; an explicit
whole-act switch creates one complete manual snapshot; finalization freezes a
separate immutable released output. Partial template-field overrides are not a
valid command surface.

Этот документ описывает семантику application contracts: какие намерения выражают команды, какие версии и idempotency expectations они используют, какие UI-oriented reads нужны пользователю и как выглядят validation/error/async outcomes. Он не является API transport specification и не разрешает начинать implementation.

Неприкосновенные принципы:

- confirmed structured domain data and explicit links являются source of truth;
- DOCX, PDF, ZIP и registry/package outputs являются derived artifacts;
- `RegistryProjection` вычисляется из owners и presentation-only overrides;
- `Certificate` и `ExecutiveScheme` остаются file-backed evidence roots;
- `final` документ корректируется следующей working/released revision, а не изменением historical revision;
- successful package snapshots, released document revisions, used template versions и frozen historical references immutable;
- AI/OCR creates proposals/findings only until explicit human acceptance;
- every command and read remains workspace-scoped and tenant-safe.

---

## 1. Purpose and Scope

### 1.1 Что утверждает этот документ

API Command/Read Model Contracts V1 утверждает conceptual application contract layer:

- common envelope and result vocabulary для domain commands;
- version, idempotency, validation, invalidation, audit and async-operation expectations;
- intent-level command contracts для typed documents, folders/numbering, evidence, registry, packages, generated artifacts, AI/OCR proposals and workspace invitations;
- UI-oriented read model composition for the main PTO screens;
- shared validation finding and error vocabulary;
- authorization scope rules, которые должны быть соблюдены будущим transport/application design.

`payload` в настоящем документе означает смысл входных данных команды, а `result` означает смысл authoritative outcome. Это не JSON schema, DTO, route или storage row.

### 1.2 Чего этот документ не утверждает

Документ не утверждает:

- production code, backend/frontend scaffold, packages, dependencies or deployment;
- concrete API routes, HTTP verbs, RPC names, OpenAPI, serialization or pagination protocol;
- SQL, migrations, ORM schema, indexes or physical transaction implementation;
- framework, runtime, database, queue, storage, renderer, template engine or AI/OCR provider;
- окончательные typed fields первой АОСР/TestAct form, кроме уже принятых conceptual requirements;
- fine-grained RBAC, original-file privacy/download policy, retention/legal hold, billing or entitlement rules;
- approval, signature or ЭЦП workflow beyond the documented revision/release baseline.

### 1.3 Связь с `docs/14`

`docs/14-backend-api-architecture-v1.md` утверждает modules, owners, command-first style, read-model families, consistency boundaries and asynchronous derived flows.

Настоящий документ делает следующий шаг: для перечисленных command families он определяет conceptual input/result semantics, expected version and idempotency behavior, stale/invalidation effects, async results, error names and fields visible in UI reads. Он применяет owners и invariants `docs/14`, не заменяет их и не выбирает их реализацию.

---

## 2. Contract Principles

| Principle | Contract rule |
| --- | --- |
| Command/query separation | Command меняет authoritative state или запрашивает async derived work; query возвращает read model и никогда не выполняет скрытую mutation. |
| Command intent over CRUD | Клиент просит `finalize_document`, `confirm_certificate` или `request_package_build`, а не редактирует произвольную таблицу, registry row или file record. |
| Workspace/object scoped contracts | Каждый контракт выполняется в одном authoritative `workspace_id`; object-owned workflows дополнительно проверяют один `object_id`. |
| `expected_version` for mutable state | Команда, изменяющая working aggregate/configuration, предъявляет прочитанную версию; silent last-write-wins запрещён. |
| `idempotency_key` for dangerous commands | Release, build/generation request, upload completion, acceptance, bulk mutation and other duplicate-sensitive intent must be replay-safe. |
| Server validation authoritative | Client preview помогает UX, но только authoritative handling определяет permissions, version conflict, validation gate and resulting revision/snapshot. |
| Read models serve UI screens | Reads объединяют данные для задачи инженера ПТО и provenance/actions; они не являются dumps of storage tables. |
| Historical references do not float | Results and reads name exact released revisions, template versions, evidence references and package snapshots where history matters. |
| Derived work does not mutate sources | Registry refresh, artifact generation, package build, AI/OCR and indexing consume pinned source/context and cannot rewrite confirmed owner data. |
| Explainable failure and staleness | Findings, rejected intents, failed operations and stale outputs expose safe reasons and user navigation back to owning data. |

---

## 3. Common Command Envelope

Common envelope is the semantic context of a command. Future authentication/transport may supply part of it out of band; no contract permits a client to assert trusted permissions by sending a role.

| Field concept | Required when | Semantics |
| --- | --- | --- |
| `workspace_id` | Every command | Tenant boundary in which actor membership, targets, files, jobs and output references are resolved. |
| `object_id` | Object-scoped command | Construction object context; all referenced folders/documents/schemes/packages/sources must belong to this same object where their owner is object-specific. |
| `object_id` omitted | Workspace library/access command where appropriate | For example a workspace-level certificate library item or organization invite; omission never permits cross-workspace resolution. |
| Actor access context | Every authorized command | Authoritative owner status or share-grant capability is resolved server-side for the target resource; client-supplied role/capability claims are never authority. |
| `command_id` | Every accepted command outcome | Stable attempt/correlation identity used for audit and tracing; it may be generated on acceptance if the caller did not provide an allowed request identity. |
| `idempotency_key` | Dangerous/retriable command; optional only where explicitly unnecessary | Caller intent identity within an actor/workspace/command scope. Identical replay returns the established outcome; conflicting reuse is rejected. |
| `expected_version` | Mutation of an existing mutable owner/configuration | Version observed by the caller for the exact target being changed, such as document working state, folder tree, override or package configuration. |
| `reason` / `comment` | Optional unless a later policy requires it | Human explanation captured for consequential corrections, supersession, release, role change or override; it does not bypass validation. |
| `client_correlation_id` | Optional | Client-side workflow tracing value echoed safely in outcomes/operations; it is neither idempotency nor authority. |

Additional envelope rules:

- A command may carry more than one named expected version only when it intentionally mutates more than one mutable owner, for example a confirmed bulk renumber plan; each protected target must be explicit.
- References in a payload are identifiers to resolve inside the envelope scope, never proof of visibility or permission.
- Read-only preview queries may accept observed version/scope filters but do not acquire command identity merely by being queried.
- Commands resulting from accepted AI/OCR proposals use the ordinary target command envelope and retain the originating proposal reference for audit.

---

## 4. Common Command Result

A successfully handled command returns an authoritative conceptual result. A result may be synchronous state change or accepted asynchronous work; it is not evidence that a derived output exists until its operation succeeds.

| Result field | Semantics |
| --- | --- |
| `command_id` | Accepted/evaluated command identity for audit and retry tracing. |
| `status` | Outcome vocabulary: `APPLIED`, `ACCEPTED_ASYNC`, `NO_CHANGE_IDEMPOTENT`, or an explicit rejected/error response described in Section 5. |
| `affected_ids` | Target identities created, changed, linked, archived, restored, released or evaluated, typed by entity meaning. |
| `new_versions` | New mutable owner/configuration versions and/or immutable revision/snapshot identities created by successful handling. |
| `validation_findings` | Explainable `ERROR`/`WARNING` results evaluated for this intent or gate; a blocked command returns findings with its error. |
| `stale_or_invalidated_outputs` | Known current-use artifacts, projections, packages, proposals or indexes requiring refresh/rebuild after a valid source change. Historical contents are not rewritten. |
| `async_operation_id` | Present when accepted work continues asynchronously, such as build, generation, source processing or indexing. |
| `audit_activity_reference` | Reference to attributable business/security activity outcome when the command is audit-relevant. |
| `client_correlation_id` | Echoed optional tracing context where supplied and safe. |

Result rules:

- `finalize_document` and `publish_revised_document` return the exact immutable released revision identity, not only a current document status.
- Package success is learned from an async operation/read model and exact `package_snapshot_id`; accepting `request_package_build` alone does not create a snapshot.
- A validation-blocked command does not return a fake new version, release or snapshot.
- A repeated idempotent success returns the originally established affected ids/references or a semantically equivalent pointer to them.

---

## 5. Error Contract

Errors are application semantics independent of transport status mapping. Every error may include `command_id`/correlation where safe, an actionable message, safe target reference and relevant findings/current-version hint without leaking inaccessible records.

| Error code | Meaning | Required safe detail / caller response |
| --- | --- | --- |
| `VALIDATION_ERROR` | Domain invariant or requested gate is not satisfied. | Return blocking findings and affected owning field/relation where authorized; caller fixes source/configuration rather than blind retry. |
| `VERSION_CONFLICT` | A mutable target/configuration changed after the caller read it or the transition no longer applies. | Return safe target kind and current version/read-required signal; caller re-reads and deliberately resubmits. |
| `NOT_FOUND_OR_NOT_AUTHORIZED` | Target does not exist in the permitted scope or may not be disclosed to this actor. | Do not distinguish existence outside authorized workspace/object; expose no foreign metadata/file presence. |
| `IDEMPOTENCY_CONFLICT` | Same idempotency key is reused for a materially different command payload/scope. | Identify conflicting command/key scope safely; caller must not treat it as a second valid intent. |
| `ASYNC_OPERATION_FAILED` | Previously accepted build/generation/processing/index operation failed to produce its promised derived result. | Return operation identity, safe failure reason and retry eligibility; no source rollback/mutation is implied. |
| `POLICY_NOT_CONFIGURED` | Workflow depends on a policy deliberately not approved/configured yet. | For example real AI/OCR processing without approved data-processing policy; no implicit provider/use is allowed. |
| `UNSUPPORTED_DOCUMENT_TYPE` | A requested typed document/subtype cannot perform the intent under an approved contract. | Prevent generic finalization of an unratified `TestAct`/other form; direct caller to supported type/scope information. |
| `UNSAFE_OVERRIDE` | Registry/package presentation configuration attempts to substitute source facts or suppress a required error/dependency. | Identify rejected override field/category where authorized; correction must use the owning domain command. |
| `FILE_REQUIRED` | A physical original/reference required for evidence, scheme, source processing or output is missing/unavailable. | Identify required file role and owning entity when authorized; it is a blocking finding at applicable final/package gate. |

An AI suggested inconsistency is not automatically `VALIDATION_ERROR`. It becomes a formal finding only when evaluated by an approved authoritative domain rule over confirmed state.

---

## 6. Async Operation Contract

Async operations describe lengthy or eventual work for package build, artifact generation, AI/OCR/source processing and search indexing. The same vocabulary may later support registry refresh when a retained projection is calculated asynchronously.

| Field | Semantics |
| --- | --- |
| `operation_id` | Stable identity of one accepted asynchronous operation/attempt. |
| `kind` | `PACKAGE_BUILD`, `ARTIFACT_GENERATION`, `SOURCE_AI_OCR_PROCESSING`, `SEARCH_INDEXING`, or later approved derived operation kind. |
| `workspace_id`, `object_id` | Authoritative scope; `object_id` present where operation is object-related. |
| `requested_by_membership_id`, `requested_at` | Attribution of the initiating command. |
| `source_context_references` | Exact package configuration version, revision/template/projection/source-file references or indexing source set read by the attempt where applicable. |
| `status` | `QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `CANCELLED` only where cancellation is later supported. |
| `progress` | Safe progress stage/summary and optional coarse measure; never a mutable source-data channel. |
| `result_references` | Resulting package snapshot/artifact/proposal/finding/index freshness references on success. |
| `failure_reason` | User-actionable safe failure classification/message on failure. |
| `retry_eligibility` | Whether a retry may be requested and whether changed inputs require a new intent/key. |
| `completed_at` | Terminal outcome time where completed. |
| `audit_activity_reference` | Trace to initiation/completion/failure activity where applicable. |

Async invariants:

- An accepted operation records work to perform, not a completed output.
- Execution reads pinned or accountable source context and creates derived results only.
- Package build never finalizes/edit documents, fixes evidence, changes registry source facts or updates package configuration.
- Artifact generation never imports a DOCX/PDF edit into source structured data.
- AI/OCR processing produces proposals/findings with provenance, never confirmed data.
- Indexing updates discoverability only, never release/readiness truth.
- Retry creates a traceable new attempt or returns the same accepted attempt under idempotent replay; it cannot mutate a successful immutable snapshot/artifact in place.

---

## 7. Typed Document Command Contracts

These contracts apply to approved typed acts. `AOSR` is the fully modeled first example; unratified `TestAct`/`TechnicalReadinessAct` cannot be finalized by treating them as generic payloads.

| Command | Intent and payload semantics | Result semantics | Version / idempotency / effects |
| --- | --- | --- | --- |
| `create_document` | Select approved `document_type`, one `object_id`, optional valid folder placement, initial act-owned structured values, numbering intent/policy and `ObjectTemplate`/form-template references. New acts start `linked` unless an explicit later policy says otherwise. | New `document_id`, initial `DRAFT` linked working state/version, placement and initial draft findings. | Idempotency required when creation may be retried; validates scope/type; never creates released revision or automatic template snapshot. |
| `update_working_document` | Replace or edit act-owned typed working values: number/date, typed blocks, project/material/evidence context and allowed form-template choice. In linked mode, template-owned participant/company fields are read-only resolved data. | Updated working version, autosave/save marker as later detailed, draft validation feedback and stale effects only if it is unpublished work after a final release. | Requires `expected_version`; draft may persist with findings; cannot create partial template overrides or mutate released revision. |
| `switch_document_template_mode_to_manual` | Explicitly resolve the complete current `ObjectTemplate`/library state and switch the whole template-owned section to manual. | Manual working version plus one complete `manualTemplateSnapshot`. | Requires expected working/template versions, confirmation and idempotency; never creates scattered per-field overrides. |
| `return_document_to_object_template` | Explicitly discard the working manual template state and resume linked resolution from the current object template. | Linked working version and current resolved template context; released history remains unchanged. | Requires expected version and confirmation; must not mutate any prior released revision. |
| `finalize_document` | Request publication of exact current act-owned content plus resolved linked or complete manual template context and selected form-template/version. | On success new immutable `document_revision_id`, exact resolved participant/company output and evidence provenance, `FINAL` state/latest released reference, captured validation summary and invalidated derived-current references. | Requires expected working version and idempotency key; authoritative finalization blocks on any relevant `ERROR`. |
| `revise_document` | Begin an editable correction path for a `FINAL` document from an explicit latest released revision, optionally with reason. | New working revision context/version with `has_unpublished_changes`; former released revision remains exact history. | Requires lifecycle/version check and idempotency; marks affected current desired package/artifact suitability stale without changing historical snapshot. |
| `publish_revised_document` | Publish corrected working revision after full finalization validation. | New immutable released revision as latest, prior revisions retained, findings and invalidations returned. | Requires expected working version and idempotency; same gate as initial finalization. |
| `archive_document` | Remove a document from active work without deleting its released provenance. | Archived lifecycle/version and current-work impact. | Requires expected document lifecycle version and idempotency for retry; cannot remove historical package/revision references. |
| `restore_document` | Return an archived document to the applicable active state. | Restored identity/lifecycle version and any readiness/stale markers. | Requires expected lifecycle version and idempotency; does not silently publish unpublished changes. |
| `attach_certificate` | Attach a `CONFIRMED` file-backed certificate to a specific working material/evidence relation in a typed document. | Changed working version, relation identity, findings including validity against `document_date`. | Requires document expected version; final document first uses revision workflow; `FILE_REQUIRED`/validation if physical evidence unavailable. |
| `detach_certificate` | Remove a certificate relation from working document content for an explicit material/purpose. | Changed working version and new findings/readiness effects. | Requires expected version; cannot rewrite historical released link or remove retained original from an existing snapshot. |
| `attach_executive_scheme` | Link an `AVAILABLE` file-backed scheme to working document purpose/attachment order. | Changed working version, relation identity and findings. | Requires expected version; same object scope and file presence required; final edit follows revision workflow. |
| `detach_executive_scheme` | Remove scheme relation from working content. | Changed working version and readiness effects. | Requires expected version; historical released/package relations stay frozen. |

Typed document rules:

- `document_type` is immutable after creation.
- Output-visible change to a final document occurs in a new working/released revision, including number/date, payload, participants, certificate/scheme links and released template context.
- Certificate expiry is evaluated against the referring document date and is `WARNING` under the current baseline; absence of required file-backed evidence is blocking.
- Locks/autosave UX remains to be detailed; neither lock heartbeat nor read/preview creates a released revision.

---

## 8. Numbering and Folder Command Contracts

Folders organize business work inside one object; they do not own document content or turn into a general file drive. Numbering values remain structured: scope/policy, prefix, sequence, suffix and rendered value.

| Command | Intent and payload semantics | Result semantics | Rules / effects |
| --- | --- | --- | --- |
| `create_folder` | Create a business folder under an optional same-tree parent with title/order in one object. | New folder identity and tree version. | Requires expected tree version where tree already exists; prevents cross-object parent/cycle. |
| `rename_folder` | Change display title of one existing folder. | New tree/folder version. | Does not change document payload, numbering or release by itself. |
| `move_folder_item` with `keep_numbering` | Move a permitted placed item to a destination folder/order while retaining a document's current number. | Updated placement/tree version and unchanged document version unless separately altered. | Same object only; result states that numbering/revision was preserved. |
| `move_folder_item` with `recalculate_numbering` | Move document and apply destination numbering policy using an explicit recalculation intent. | Updated placement plus planned/applied document working version(s), collisions/findings and invalidations. | Requires applicable tree and document versions; final affected document uses a new working revision; no silent renumber. |
| `clone_folder` with `copy_numbering` | Copy folder structure and selected document/link/date behavior, giving new drafts copied numbering only where no collision occurs. | New folder/new draft document ids, assigned number values, unresolved findings if blocked. | Idempotency required; never copies final/released history as published results. |
| `clone_folder` with `continue_numbering` | Copy selected structure/content as drafts and allocate continued sequence in chosen scope. | New draft ids and assigned structured numbers. | Validates scope/collisions and selected link-copy semantics. |
| `clone_folder` with `reset_numbering` | Copy selected structure/content as drafts with policy-defined reset numbering. | New draft ids and assigned structured numbers. | Validates collision and leaves copies non-final. |
| `preview_renumber_impact` | Query/projection of proposed ordering, scope/policy and target documents before mutation. | Proposed old/new numbers, collisions, final-doc revision impacts and package/artifact invalidations. | Query only; does not reserve numbers, change versions or prove later command will succeed. |
| `renumber_documents` | Confirm an explicit reviewed numbering plan for selected documents. | Changed working versions/new working revisions for final documents, findings, invalidated outputs and activity reference. | Expected versions for plan/scope and affected mutable targets; idempotency required; cannot edit registry rows or historical packages. |

---

## 9. Evidence Command Contracts

Evidence commands operate on independent file-backed roots. An evidence number is never sufficient without its physical original reference. Detailed retention, legal deletion and sensitive-file access remain open; the contracts below prohibit silent historical overwrite now.

### 9.1 Certificate commands

| Command | Intent and payload semantics | Result semantics | Rules / effects |
| --- | --- | --- | --- |
| `upload_certificate` | Register an uploaded quality-document original with evidence kind and optional unconfirmed metadata in one workspace library. | New certificate/file-backed item in `UPLOADED_UNCONFIRMED`, file reference and optional async processing operation. | Idempotency required for upload completion; upload alone does not make metadata selectable for final evidence use. |
| `confirm_certificate` | User reviews and confirms required structured metadata for the retained file. | `CONFIRMED` evidence version, reviewer attribution and picker availability. | Requires expected evidence version; optional AI proposal provenance does not replace confirmation. |
| `correct_certificate_metadata` | Correct current-use confirmed metadata with reason/provenance. | Explicit new current metadata/version or a required supersession outcome under later retention policy; invalidated current outputs identified. | Must not rewrite values frozen in released revisions/snapshots; if safe correction versus replacement is policy-dependent, return `POLICY_NOT_CONFIGURED` until defined. |
| `supersede_certificate` | Introduce replacement evidence/original for future use and relate it to the former item. | New/replacement evidence reference, former item `SUPERSEDED` for active selection as permitted, historical use retained. | Requires expected source/replacement versions and idempotency; never replaces historical file identity in place. |
| `archive_certificate` | Hide evidence from active current selection. | Archived version and usage/readiness impacts. | Historical references remain available; existing affected working documents surface findings. |
| `restore_certificate` | Return archived evidence to eligible selection state. | Restored current version and picker state. | Requires version/access check; does not automatically repair or publish documents. |

### 9.2 Executive scheme commands

| Command | Intent and payload semantics | Result semantics | Rules / effects |
| --- | --- | --- | --- |
| `upload_executive_scheme` | Register object-scoped physical scheme file with draft metadata. | New scheme in `DRAFT`, retained file reference and optional processing operation. | Same workspace/object required; no conversion from project drawing by inference. |
| `confirm_executive_scheme` | User confirms required structured metadata and file readiness. | Scheme becomes `AVAILABLE` with reviewer attribution/version. | Requires expected scheme version; selectable for working documents/packages after validation. |
| `correct_executive_scheme_metadata` | Correct output-relevant current-use metadata with explicit reason. | New current version or policy-required superseding item, with affected current outputs marked stale. | Cannot alter historical released/snapshot values; policy-dependent correction may be rejected until defined. |
| `supersede_executive_scheme` | Introduce changed actual scheme as new file-backed current candidate. | Replacement relation/new item and retained old historical scheme. | Requires version/idempotency; no silent original overwrite. |
| `archive_executive_scheme` | Remove a scheme from active selection. | Archived version and dependent readiness effects. | Does not destroy released or package references. |
| `restore_executive_scheme` | Re-enable archived scheme where lifecycle permits. | Restored version and availability/readiness state. | Does not mutate linked released revisions. |

---

## 10. Registry Command Contracts

Registry remains a derived projection. The commands below change only a versioned presentation/output configuration or request calculation; corrections of source facts use their owners.

| Command | Intent and payload semantics | Result semantics | Version / effects |
| --- | --- | --- | --- |
| `configure_registry_override` | Apply allowed row/section presentation instructions to one registry scope: inclusion/hiding where permitted, ordering, printable note and allowed package display configuration. | New `registry_override_version`, changed presentation instructions, rejected unsafe fields if any, projection/artifact/package stale effects. | Requires expected override version and idempotency for retry; `UNSAFE_OVERRIDE` for source substitution/error suppression. |
| `select_registry_signer` | Choose an eligible signer source/display context for a registry output and capture it when output/snapshot is made. | New configuration/version or signer snapshot reference where immediately captured, with stale output effects. | Does not edit representative/company source facts; requires expected override/config version. |
| `request_registry_refresh` | Recalculate or refresh a derived preview/result from an exact scope and override version where retained projection is needed. | Current derived result or accepted async operation identity/freshness reference. | No source mutation; idempotency applies if operation is queued/retriable. |

Allowed override surface in V1:

| Allowed field/operation | Limitation |
| --- | --- |
| `hidden` / inclusion toggle | Permitted only for optional presentation and never to hide a blocking required dependency or domain error. |
| `sort_order` | May order visible certificate, act, scheme or section representations without changing source order/value. |
| `note` | Printable presentation note that cannot contradict source facts. |
| `signer_selection` | Selects an eligible registry signer context; output captures exact signer snapshot. |
| `package_display_config` | Controls presentation/grouping/order in applicable output only. |

Forbidden source-fact changes include document type/number/date/status/revision/work, certificate identity/number/issuer/validity/file, scheme identity/title/number/date/file, company requisites, required attachment state, validation outcome and template version claimed by an existing artifact. `custom_display_title` remains deferred by lifecycle policy.

---

## 11. Package Command Contracts

`Package` is mutable desired configuration; a `PackageBuild` is an asynchronous attempt; a successful `PackageSnapshot` is an immutable result. Default order remains registry, certificates, acts, executive schemes unless the user explicitly configures another order.

| Command | Intent and payload semantics | Result semantics | Version / idempotency / stale behavior |
| --- | --- | --- | --- |
| `configure_package` | Create/update intended scope, selected components, inclusion and ordering, registry scope/override choice and applicable output context. | New package configuration version, draft readiness summary and invalidated current suitability of prior snapshots where changed. | Existing mutation requires expected configuration version; does not alter any selected source entity. |
| `request_package_readiness_validation` | Evaluate current package configuration and authoritative current dependencies before build/release. | Validation report with findings, gate outcome, dependency/stale summary and evaluated configuration version. | Read/evaluation contract; never fixes sources or creates snapshot. |
| `request_package_build` | Build from one explicit package configuration version and resolvable exact source dependencies. | `ACCEPTED_ASYNC` with `operation_id`; later success exposes new immutable `package_snapshot_id` and artifacts. | Idempotency required; readiness `ERROR` blocks usable request/outcome; source owners unchanged. |
| `retry_package_build` | Retry a failed/cancelled eligible build attempt using accountable input context or explicitly refreshed configuration. | New/reused operation identity with linkage to previous failure. | Requires retry eligibility and idempotency; cannot modify an earlier successful snapshot. |
| `release_package_snapshot` | Publish/retain one already successfully built exact snapshot. | Snapshot release status/reference, captured validation/warnings and retained output/audit references. | Idempotency required; validates exact snapshot and relevant release policy; contents/manifest remain immutable. |
| `archive_package` | Remove mutable package configuration from active workflow. | Archived package configuration version and preserved build/snapshot history. | Requires expected package version; historical snapshots/downloads retained subject to later access/retention policy. |

Stale/invalidation rules:

- A change to selected document released revision, evidence/scheme reference or metadata relevant to output, package order/scope, registry override/signer context, resolved object-template output or form-template choice makes an earlier current-use result unsuitable and requires a new build for current output.
- A stale marker describes comparison with current desired configuration; it never rewrites the immutable manifest or bytes of a historical snapshot.
- Build resolves exact revisions, physical original references, form-template versions, registry input/override version, frozen released object/company values, ordering and validation provenance into the snapshot manifest.

---

## 12. Generated Artifact Command Contracts

Generated artifacts are requested outputs such as document DOCX/PDF, registry output and package output. They are not a write channel into documents, evidence or package sources.

| Command/read | Intent and payload/read semantics | Result/read semantics | Rules |
| --- | --- | --- | --- |
| `request_generated_artifact` | Request an artifact kind from explicit source context: released document revision or permitted preview state, exact template version, registry projection/override context or package snapshot. | Accepted async operation or already equivalent available result under idempotent policy; later artifact identity/status. | Idempotency required for generation intent where duplicates matter; output cannot mutate sources. |
| Artifact status/read | Read one artifact/operation accessible in workspace/object scope. | `REQUESTED`, `GENERATING`, `AVAILABLE`, `FAILED`, `STALE` or `RETAINED`; provenance, download availability and safe retry guidance. | Query only; access/privacy for originals versus outputs remains policy work. |

Artifact provenance must identify as applicable:

- `source_document_revision_id` or explicitly marked non-released preview input;
- `template_version_id`;
- `registry_scope` and exact `registry_override_version` / derived result reference;
- `package_snapshot_id`;
- exact generated operation and retained file/output identity.

Retention/staleness rules:

- Available artifact from a changed source/configuration may be marked `STALE` for current use; it is not modified.
- Artifact included in a released document/package historical context may be `RETAINED` under the historical guarantee.
- Generation failure yields an operation failure and retry eligibility; it does not invalidate otherwise valid source data.
- Exported or manually edited artifact is never imported back into structured truth by this contract.

---

## 13. AI/OCR Proposal Command Contracts

AI/OCR assistance is optional future behavior constrained by human review and an approved processing/privacy policy. Uploading or processing project source materials does not confirm domain facts.

| Command / async result | Intent and payload semantics | Result semantics | Rules / effects |
| --- | --- | --- | --- |
| `upload_project_source_file` | Upload one object-scoped source original with user-described purpose/type where known. | New retained `project_source_file_id`, file reference and unprocessed/unclassified state. | Requires physical file and same workspace/object; idempotent upload completion; not certificate/scheme/confirmed drawing set. |
| `request_source_processing` | Ask for permitted extraction or consistency-analysis purpose for explicit source files/context. | Accepted AI/OCR async `operation_id` or `POLICY_NOT_CONFIGURED`. | Idempotency required; no real processing is implicitly approved by this design document. |
| `create_ai_proposal` as async result | Persist a proposed structured field/relation/value from processing. | `proposal_id`, `PENDING` state, citations, confidence/explanation, model/extractor/version and source/run provenance. | System-result contract only; confirmed owner is unchanged. |
| `create_ai_finding` as async result | Persist an advisory possible mismatch/missing evidence/completeness issue. | `finding_id`, pending advisory state, citations/explanation/provenance. | Not a formal validation `ERROR`/`WARNING` by itself. |
| `accept_ai_proposal` | Accept an unchanged pending proposal for an explicit target owner/action. | Review decision plus resulting ordinary domain command outcome/reference. | Requires target expected version and idempotency; acceptance is not complete unless owner mutation validates/applies. |
| `edit_and_accept_ai_proposal` | User corrects the proposed value/relation and accepts that corrected target intent. | `EDITED_AND_ACCEPTED`, submitted corrected value provenance and resulting ordinary command outcome. | Same authorization/version/validation/invalidation rules as manual owner change. |
| `reject_ai_proposal` | Reject extraction proposal. | Rejected review status and audit reference. | No confirmed source mutation. |
| `dismiss_ai_finding` | Dismiss/resolve advisory finding for review purposes. | Dismissed status and attribution. | Cannot suppress an independently evaluated formal validation finding. |
| `mark_stale` | Mark pending/provenance context outdated because source/target changed. | `STALE` proposal/finding/reference state. | May be system-driven after owner change; never auto-applies or silently rewrites old accepted history. |

Proposal/finding read context always includes source citations where available, processing provenance and current target comparison. No cross-workspace retrieval/linking, AI-created evidence relation without a physical certificate file, inferred project-drawing promotion to `ExecutiveScheme`, or AI rewrite of released history is permitted.

---

## 14. Workspace/Sharing Command Contracts

These contracts are superseded for MVP by the owner-based sharing model in `docs/19-sharing-and-access-model-v1.md`. The table below defines the replacement access command semantics for first-scope implementation planning.

| Command | Intent and payload semantics | Result semantics | Rules |
| --- | --- | --- | --- |
| `create_workspace_share_code` | Owner creates opaque code for one owned workspace/project database with selected capabilities, expiry and usage policy. | New share code reference/state and auditable creation record. | Token/reference carries no trusted rights; default capability posture is view-only. |
| `accept_workspace_share_code` | Authenticated user accepts one valid workspace share code. | Persistent `WorkspaceShareGrant`, effective capabilities and audit reference. | Validates expiry/revocation/scope; never grants unrelated workspace access. |
| `rotate_workspace_share_code` | Owner regenerates code for future acceptance. | Previous code no longer accepts new users; new code reference/state is created. | Existing accepted grants remain active unless explicitly revoked. |
| `revoke_workspace_share_grant` | Owner revokes accepted workspace grant. | Revoked grant state and audit reference. | Historical actor attribution remains; future access denied. |
| `create_certificate_library_share_code` | Owner creates opaque code for one certificate library with selected capabilities. | New library share code reference/state and audit. | Default posture is view/use only according to `docs/19`. |
| `accept_certificate_library_share_code` | Authenticated user accepts valid library code. | Persistent `CertificateLibraryShareGrant`, effective capabilities and audit reference. | Does not grant workspace access; preserves source owner/provenance. |
| `update_grant_capabilities` | Owner changes capability set for an existing grant if policy permits. | New grant capability version and audit reference. | Default deny for missing capability; owner may instead revoke/reissue. |

Fine-grained RBAC is deferred: MVP permissions derive from owner status or explicit grant capabilities and are evaluated server-side.

---

## 15. Read Model Contracts

Read models are composed views for real screens and decisions. Each read carries authoritative `workspace_id`, permitted object context where relevant, current/stale/version cues and only actions visible under authorization policy. They do not expose storage-table editing.

| Read model | Required composition / fields visible to the task |
| --- | --- |
| Workspace switcher | Owned and connected workspace id/display kind/name/status, owner identity where relevant, effective grant capabilities and safe pending/connected indicators; no other workspace content leakage. |
| Object dashboard | Object id/name/status/discipline context, document/folder/package counts, validation `ERROR`/`WARNING` counts, latest package freshness/build state, pending AI/source work and recent safe activity summary. |
| Folder tree/document list | Folder hierarchy/order/status/version, selected-folder placement list, document type/number/date/lifecycle/latest revision/working-change marker, scheme/package representation, validation/stale badges and permitted commands. |
| Document editor view | Document identity/type/status, working content and expected working version, latest released revision, strict linked/manual template mode, resolved participant/company context with source provenance, certificate/material/scheme links, selected form-template context, draft/final findings, unpublished/stale impacts and later lock/autosave state. |
| Certificate picker | Candidate certificate id/kind/confirmed metadata/file availability/status/supersession, matching material/coverage cues, applicability finding evaluated for current document date, usage summary and permission to attach/view. |
| Executive scheme picker | Scheme identity/title/number/date/system/sheet metadata, physical-file availability, lifecycle/supersession/usage, same-object context, applicability findings and allowed attach action. |
| Registry preview | Registry scope, source blocks/rows with provenance navigation, exact override version and signer context, ordering/hidden/note surface, validation/readiness and freshness/stale state; source facts route to owner screens. |
| Package builder view | Package identity/configuration version/title/scope, selected component order, exact referenced releases/evidence/schemes/registry config, readiness findings, current/latest snapshot state, async operation progress/failure/retry, release/download/stale indicators. |
| Validation panel | Validation context/gate/evaluated version, findings as Section 16 records, blocking summary, affected source navigation, proposed permitted correction action and later acknowledgement control if policy enables it. |
| Generated artifacts/download history | Artifact kind/status, operation, exact source revision/template/projection/snapshot provenance, generated/retained/stale/failure markers, safe download visibility and retry eligibility. |
| AI review queue | Proposal/finding identity/status/kind, source/run citations, proposed versus current target values, confidence/explanation/model/extractor/version provenance, target staleness/version cue and permitted accept/edit/reject/dismiss actions. |
| Activity/audit feed | Event identity/time, actor membership display appropriate to policy, command/outcome, target/object references, revision/build/proposal/artifact linkage and minimized sensitive detail. |
| Search results | Tenant-filtered result kind/id/title or canonical identifier, object/folder context, lifecycle/status/freshness, validation/stale cue where useful, index freshness caveat and link to authoritative read model. |

Read model guarantees:

- A query cannot be used to patch a row, bypass a gate or apply an AI proposal.
- A read may combine current and historical context but labels which identity/version/snapshot is displayed.
- Registry rows, package items and search index entries carry source/provenance links rather than becoming owners.
- Picker/read authorization cannot expose the existence of foreign workspace items through error detail or counts.

---

## 16. Validation Finding Contract

Formal findings are produced by authoritative domain validation. AI findings may be shown nearby in UI but remain advisory proposal records unless an approved rule evaluates confirmed data.

| Field | Semantics |
| --- | --- |
| `finding_id` | Stable finding identity within a validation evaluation or retained release/build context. |
| `severity` | `ERROR` or `WARNING`. `ERROR` blocks its relevant gate; `WARNING` does not block under baseline. |
| `code` | Stable domain rule code, for example missing required file, numbering collision or certificate validity-at-document-date finding. |
| `message` | Human-readable explanation suitable for an engineer and safe for the authorized context. |
| `source_entity` | Owning entity/revision/configuration evaluated, not a derived row substituted as truth. |
| `affected_field_or_relation` | Typed field/link/dependency to correct or inspect when applicable. |
| `blocking_gate` | `NONE_DRAFT_FEEDBACK`, `DOCUMENT_FINALIZATION`, `PACKAGE_READINESS`, `PACKAGE_BUILD` or `PACKAGE_RELEASE` as applicable. |
| `suggested_action` | Navigation/command intent that may address the finding; never an automatic data mutation. |
| `provenance` | Evaluation rule/version/context/time and exact document date/dependency/reference required to explain the outcome. |
| `acknowledgement_status` | Absent/not-enabled in baseline unless later policy enables acknowledgements for warnings; acknowledgement can never dismiss `ERROR`. |

Required baseline examples:

| Situation | Finding outcome |
| --- | --- |
| Act cites/prints a quality-document number without confirmed retained certificate original | `ERROR`, relevant final/package gate blocked; may correspond to `FILE_REQUIRED` on command. |
| Included executive scheme has no retained physical original | `ERROR` at applicable document/package gate. |
| Selected package includes a draft or unpublished corrected document where final release is required | `ERROR`. |
| Numbering collision in selected scope | `ERROR` for publication/renumber/build where number must be unique. |
| Certificate is expired on the referring document date | `WARNING` under current baseline. |
| Certificate is expired today but was valid on historical document date | No expiry error merely because current date advanced. |
| AI suggests a missing certificate | Advisory AI finding until confirmed data are evaluated by a formal rule. |

---

## 17. Versioning and Idempotency Rules

### 17.1 Version/reference meanings

| Versioned/reference concept | Rule |
| --- | --- |
| Document working version | Mutable concurrency token for draft/current correction content and links. Every accepted working change produces a new expected value for subsequent mutation. |
| Document released revision id | Immutable identity of successfully finalized structured content, links, participant/template/output context and captured validation; correction creates a different released revision id. |
| Registry override version | Immutable reference to one applied presentation/configuration state; any meaningful override/signer configuration change creates a new visible version. |
| Package configuration version | Mutable intended selection/order/scope version used for readiness and build intent; source/config changes require re-evaluation. |
| Package snapshot immutable id | Identity produced by a successful build from an exact manifest; release/stale assessment cannot change its contents. |
| Template version | Exact rendering contract/form version; once used for output/release it is not mutated and future changes create a new version. |
| Evidence file reference | Exact certificate/scheme physical-original identity/binding captured by document revisions or snapshots; replacement is explicit and does not float old history. |
| Source/proposal target version | A pending proposal is accepted only against a still-applicable target/source context or is marked stale. |

### 17.2 Idempotency behavior

- An `idempotency_key` is scoped at least by workspace, authorized actor/context and command kind; object/target scope is included when applicable.
- Repeating the same key with materially identical intent returns `NO_CHANGE_IDEMPOTENT` or the original `APPLIED`/`ACCEPTED_ASYNC` outcome and exact created references.
- Reusing the same key for a different target, payload, expected version or materially different input returns `IDEMPOTENCY_CONFLICT`.
- Required idempotent intents include creation susceptible to resubmission, upload completion, document finalization/publication, bulk renumber/clone, evidence supersession, package build/retry/release, generated artifact request, source processing, AI proposal acceptance and invite acceptance.
- Version conflict is not resolved by replaying an idempotency key with altered data. The caller re-reads and sends a new deliberate intent.
- A failed async attempt may be retried only according to `retry_eligibility`; retry is traceable and never transforms an immutable successful result.

---

## 18. Authorization Scope Rules

| Scope rule | Contract consequence |
| --- | --- |
| Every command/query is workspace scoped | Authoritative active membership for `workspace_id` is resolved before any business target, file, derived result, audit or search access. |
| Object scope where relevant | Folders, documents, schemes, project source files, registry scopes, packages, object outputs and their AI/read context must share one permitted `object_id`. |
| No cross-workspace ids | A payload cannot link/copy/reference an id from another tenant merely because it is syntactically valid or guessed. Future controlled copy/export must create destination-owned data under separate policy. |
| Leakage protection | Missing target and inaccessible target are exposed as `NOT_FOUND_OR_NOT_AUTHORIZED`; operations, pickers, search, files and error detail reveal no foreign existence. |
| Owner/grant is authority context | A `User` identity or submitted role is insufficient; MVP permissions derive from ownership or accepted resource-scoped grant capabilities. |
| Derived output inherits source scope | Registry projections, snapshots, artifacts, AI results, index results and audit views cannot relax tenant/object access. |
| Fine-grained RBAC remains deferred | Per-role action/download/release/review/lock-override rules are not MVP behavior and must not be inferred here. |

---

## 19. Non-Goals

API Command/Read Model Contracts V1 explicitly does not provide or authorize:

- production code;
- backend or frontend scaffold;
- OpenAPI specification;
- concrete routes, verbs, RPC or transport protocol;
- SQL, DDL, migrations or database schema changes;
- ORM models/repositories;
- framework/runtime or frontend implementation;
- database, queue, storage, renderer, template engine or AI/OCR provider choice;
- generic CRUD API, generic document constructor or general-purpose file drive;
- automatic AI approval, silent evidence overwrite or mutation of derived/historical outputs;
- final MVP form selection, complete RBAC, privacy/retention/legal policy or billing design.

---

## 20. Readiness Checklist and Next Step

### 20.1 What this document makes ready for review

- [x] Common command envelope identifies workspace/object/membership context, command/idempotency, expected version and correlation/comment semantics.
- [x] Common results, errors and async operations expose versions, findings, invalidations, output/provenance and retry-safe behavior.
- [x] Typed document contracts preserve editable-through-revision `final` and immutable released revisions.
- [x] Folder/numbering contracts make move/clone/renumber effects explicit and prevent silent number changes.
- [x] Evidence contracts require physical originals and prohibit historical silent overwrite.
- [x] Registry contracts admit only presentation/configuration overrides and forbid source-fact changes.
- [x] Package and artifact contracts preserve async derived work, immutable snapshots and stale/current distinction.
- [x] AI/OCR contracts preserve proposal-only results, citations, explicit human decision and ordinary owner-command application.
- [x] Workspace/sharing contracts preserve owner/grant-based authority while leaving fine-grained RBAC deferred.
- [x] Screen-specific read models, validation findings, version/idempotency and authorization rules are described without routes or storage implementation.

### 20.2 Questions intentionally still open

- Which exact AOSR and first test-act forms, fields, participants, templates and blocking validations enter MVP?
- Which warning acknowledgements or customer-specific package readiness constraints are permitted?
- What evidence/project-source correction, retention, original-download, privacy and legal-hold policy applies?
- What exact share-code defaults, grant capability update policy, revocation/session behavior and cross-workspace export rules apply?
- Which source formats and AI/OCR processing/privacy/provider policy may ever be enabled?
- What later transport, persistence, rendering, async execution, search and frontend implementation will realize accepted contracts?

### 20.3 Recommended next document and gate

Рекомендуемый следующий документ после review:

```text
docs/16-mvp-scope-and-first-forms-v1.md
```

Он должен определить первый practical MVP scope и конкретные typed forms/field-validation boundaries, не используя неутвержденные implementation choices.

```text
Review docs/15-api-command-readmodel-contracts-v1.md;
proceed to MVP Scope and First Forms V1 only if accepted.
```

Настоящий этап по-прежнему не разрешает писать production code, backend/frontend scaffold, SQL, migrations, ORM schema, OpenAPI либо выбирать framework, database, queue, storage, renderer или AI provider.
