# 12. Database Schema V1

# PTO ID System

# Первая концептуальная схема данных для structured executive documentation platform

Статус: conceptual schema specification for review before Backend/API Architecture.

Дата фиксации: 2026-05-27.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание модели: `docs/06-data-model-v1.md`, `docs/07-aosr-domain-specification.md`, `docs/08-document-types-catalog.md`, `docs/09-aggregate-boundaries-and-invariants.md`, `docs/10-auth-workspace-rbac-model.md`, `docs/11-ai-project-ingestion-and-assistance-model.md`, ADR 0001-0005.

---

## 1. Purpose

Этот документ проектирует первую концептуальную Database Schema V1 для PTO ID System. Он переводит принятые принципы и требуемые baseline-границы в каталог логических таблиц, связей, ограничений и ожидаемых access paths, достаточный для следующего обсуждения Backend/API Architecture.

В этой спецификации слово **table** означает логически сохраняемый набор записей с owner и инвариантами. Документ намеренно не выбирает физическую СУБД, способ сериализации structured blocks, ORM, миграции, storage provider, API или application stack.

Schema V1 должна позволить представить:

- изолированные personal и organization workspaces;
- memberships, invites and audit attribution;
- object workspace и отдельный `FolderTree`;
- typed `Document`, первым полностью описанным payload которого является `AOSR`;
- file-backed quality evidence и исполнительные схемы;
- project source materials и proposal-only AI assistance;
- immutable released revisions, template versions after use and package snapshots;
- derived registry and generated artifact provenance.

### 1.1 Baseline decisions applied by this schema

По прямому требованию к настоящей схеме она использует следующие границы как baseline V1:

1. `Workspace` является tenant boundary.
2. `User` не владеет business data напрямую; доступ следует из `Membership`.
3. `Invite` хранится серверно, а URL несёт только opaque token/reference.
4. `Object` не поглощает документы, evidence, outputs и jobs как giant aggregate.
5. `FolderTree` является отдельным object-scoped aggregate root.
6. Самостоятельный `WorkItem` aggregate root в baseline отсутствует.
7. `ProjectDrawingSet` является owned entity `ObjectDocumentationContext`.
8. `Document` является typed aggregate root.
9. `AOSRPayload` хранится как structured data, а не как DOCX.
10. `Certificate` и `ExecutiveScheme` требуют physical file.
11. `RegistryProjection` является derived representation, а `RegistryOverride` хранит только presentation/configuration.
12. `Package` является asynchronous and snapshot-based.
13. `GeneratedArtifact` никогда не является source of truth.
14. AI/OCR outputs существуют только как proposals/findings до подтверждения пользователем.
15. Uploaded project documentation является source material/provenance, но не единственным source of truth.

Эти пункты конкретизируют ранее установленные guardrails и не требуют нового ADR, поскольку не заменяют принципы ADR 0001-0005.

### 1.2 Out of scope

Документ не содержит и не разрешает автоматически создавать:

- production SQL, DDL или migrations;
- ORM entities or repository implementation;
- backend/frontend code;
- API endpoints or transport payloads;
- `package.json`, зависимости, Dockerfile или CI;
- database vendor, queue, storage engine, template engine или AI provider choice.

---

## 2. Schema Design Principles

### 2.1 Ownership and truth

| Principle | Schema consequence |
| --- | --- |
| Structured data is source of truth | Typed payload, confirmed metadata and explicit links хранят смысл; outputs только ссылаются на источники. |
| Typed documents | `Document` имеет immutable type и type-specific payload tables; generic document blob не является baseline. |
| Explicit owner | Каждая таблица относится к aggregate owner, owned entity, snapshot, projection, artifact, proposal или audit record. |
| Snapshot reproducibility | Released revisions и successful package builds фиксируют использованные значения и file identities, а не плавающие latest links. |
| Projection is not ownership | Materialized or cached registry result, если он появится, остаётся derived and rebuildable. |

### 2.2 Workspace isolation

Каждая business-owned, snapshot, proposal, output и audit запись имеет `workspace_id` либо однозначно наследует его от обязательного parent, который также проверяется при каждой связи. В таблицах ниже `workspace_id` показывается явно там, где он нужен для tenant-safe lookups, constraints, authorization или audit clarity.

Запрещены implicit cross-workspace references между:

- objects, folders and documents;
- evidence and schemes;
- templates scoped to a workspace;
- source files, proposals and confirmed targets;
- registry/package outputs and artifacts.

Controlled copy/transfer в будущем означает создание новых destination-owned records с provenance, а не снятие tenant boundary.

### 2.3 Root versus owned and derived records

| Classification | Schema treatment |
| --- | --- |
| Aggregate root | Имеет собственную identity/lifecycle row и защищает свои изменения. |
| Owned entity | Имеет identity только внутри owner scope; не переносит lifecycle к потребителю. |
| Immutable snapshot | Создаётся при release/build и больше не изменяется как historical truth. |
| Operational state | Lock/job status поддерживает workflow, но не меняет content сам по себе. |
| Proposal/finding | Отдельно от confirmed target; acceptance создаёт domain command/audit, а не превращает proposal в owner. |
| Derived projection/artifact | Может быть пересчитан/регенерирован; provenance указывает sources. |

### 2.4 Common conceptual fields

Названия ниже являются архитектурным vocabulary, а не готовым DDL.

| Field concept | Meaning |
| --- | --- |
| `id` | Stable identity within the owning model. |
| `workspace_id` | Mandatory tenant identity for scoped data. |
| `object_id` | Mandatory object context where data relate to one construction object. |
| `status` | Lifecycle or processing state defined by the owning aggregate. |
| `created_at`, `created_by_membership_id` | Attribution for creation where domain/audit relevant. |
| `updated_at` | Current mutable record update marker; not a revision substitute. |
| `deleted_at` | Soft-delete marker where lifecycle permits deletion. |
| `released_at`, `released_by_membership_id` | Attribution for immutable released state. |
| `source_*` / `provenance_*` | Explanation of origin; never a license to rewrite the referenced source. |

### 2.5 Deletion and history

Soft deletion is the baseline for mutable business records. A record or file referenced by a released revision or package snapshot cannot be physically erased or overwritten without a later approved retention/supersession policy that preserves historical provenance.

### 2.6 Table family overview

| Family | Primary purpose | Owner class |
| --- | --- | --- |
| Workspace and access | Tenant boundary and authorization context | Workspace/access aggregates |
| Object and FolderTree | Object setup and user organization | Separate roots |
| Companies and representatives | Reusable context and fixed display values | Library/root plus snapshots |
| Project sources and AI | Provenance and human-review workflow | Object-scoped sources/proposals |
| Documents and AOSR | Typed executive documents | `Document` root |
| Evidence and schemes | Physical supporting materials | Independent roots |
| Templates and outputs | Reproducible rendering | Template root/derived artifacts |
| Registry and package | Derived view and immutable builds | Projection / Package root |
| Revisions and audit | History and accountability | Snapshot/audit records |

---

## 3. Workspace / Tenant Tables

### 3.1 `workspace`

`workspace` is the tenant anchor for all business data.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `workspace_id` | Stable tenant identity. |
| `workspace_kind` | `PERSONAL` or `ORGANIZATION`. |
| `display_name` | User-visible workspace name. |
| `status` | Active/archived or later approved lifecycle state. |
| `founding_user_id` | Identity initiating creation; does not grant access without membership. |
| `created_at` | Creation audit input. |
| `archived_at` | Nullable lifecycle marker; hard delete policy deferred. |

Invariants:

- Every workspace-scoped business aggregate belongs to exactly one `workspace`.
- A personal workspace is created as part of the registration flow and paired with its founding Owner membership.
- An organization workspace must not silently lose accountable Owner membership.
- Workspace identity is not the legal organization displayed in documents.

### 3.2 `workspace_setting`

Optional scoped configuration for domain defaults that do not belong to an individual document or package.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `workspace_setting_id` | Setting record identity. |
| `workspace_id` | Owner tenant. |
| `setting_kind` | Typed setting category, not arbitrary source document data. |
| `structured_value` | Validated configuration appropriate to `setting_kind`. |
| `status` | Current/retired marker. |

This table must not become a generic bucket for document payload, permissions or unknown future product behavior.

---

## 4. User / Membership / Invite Tables

### 4.1 `user_account`

`user_account` represents a natural-person identity, not a business-data tenant.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `user_id` | Global account identity. |
| `email_identity` | Authentication-facing identity according to later auth policy. |
| `email_verification_state` | Needed for invitation policy where applicable. |
| `display_name` | Personal product profile value. |
| `account_status` | Account lifecycle state. |
| `created_at` | Registration marker. |

`user_account` does not contain `workspace_role`, ownership of documents, or direct permission to any object/file.

### 4.2 `membership`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `membership_id` | Authorization relation identity. |
| `workspace_id` | Authorized tenant. |
| `user_id` | Natural-person account. |
| `role` | `OWNER`, `ADMIN`, `PTO_ENGINEER`, `FOREMAN`, `VIEWER`. |
| `status` | Active/suspended/removed or later ratified states. |
| `origin_kind` | Personal founder, organization creator, accepted invite or later approved origin. |
| `origin_invite_id` | Nullable reference to consumed invite. |
| `created_at`, `ended_at` | Access lifecycle markers. |

Invariants:

- Authorization for workspace business actions is derived from an active `membership`.
- One user may have independent memberships in multiple workspaces.
- A membership's role never authorizes another workspace.
- Removal does not erase the membership identity from historical audit attribution.

### 4.3 `invite`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `invite_id` | Stored invitation identity. |
| `workspace_id` | Target `ORGANIZATION` workspace. |
| `issued_by_membership_id` | Issuing authorized member in the same workspace. |
| `intended_role` | Role offered on successful acceptance; Owner invitation not baseline. |
| `usage_mode` | Single-use baseline or explicitly enabled multi-use policy. |
| `usage_limit`, `usage_count` | Nullable controlled-use metadata. |
| `bound_email_identity` | Nullable or required for protected roles according to invite policy. |
| `token_verification_reference` | Verifier/digest/reference for an opaque URL token; trusted rights are not in URL. |
| `expires_at`, `revoked_at`, `consumed_at` | Lifecycle restrictions. |
| `status` | Issued/consumed/revoked/expired representation. |

Invariants:

- An invite URL contains only an opaque token/reference and reveals no trusted role claim.
- Invite acceptance never silently changes an existing membership role.
- Stored invite validity is checked before a membership is created.

### 4.4 `invite_acceptance`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `invite_acceptance_id` | Attempt/result identity. |
| `invite_id` | Stored offer evaluated. |
| `user_id` | Account attempting or completing acceptance. |
| `created_membership_id` | Nullable result of successful acceptance. |
| `outcome` | Accepted/rejected/expired/revoked/already-member or approved vocabulary. |
| `occurred_at` | Audit time. |

This record supports governance/audit; it is not itself access authority.

---

## 5. Object Tables

### 5.1 `object`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `object_id` | Construction object identity. |
| `workspace_id` | Tenant owner. |
| `name`, `address` | Current object identity/display data. |
| `status` | Active/archived/soft-deleted baseline. |
| `discipline_scope` | Current object focus where explicitly configured. |
| `created_by_membership_id` | Actor attribution in the same workspace. |
| `created_at`, `updated_at`, `deleted_at` | Lifecycle markers. |

`object` holds context, not arrays of documents, certificates, schemes, packages or artifact bytes.

### 5.2 `engineering_system`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `engineering_system_id` | Object-local system identity. |
| `workspace_id`, `object_id` | Same tenant/object owner. |
| `code`, `name`, `discipline` | Structured classification, for example ОВиК/ВК. |
| `status` | Current/retired marker. |

System values used in a released act are captured in document revision context; later changes do not rewrite old acts.

### 5.3 `object_documentation_context`

Limited object-owned settings boundary for common project basis and output defaults.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `object_documentation_context_id` | One bounded documentation-settings context. |
| `workspace_id`, `object_id` | Owner identity. |
| `status` | Current/archived marker. |
| `created_at`, `updated_at` | Configuration lifecycle. |

It owns `ProjectDrawingSet` entries and object-level defaults; it does not own file-backed executive schemes or typed document revisions.

### 5.4 `project_drawing_set`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `project_drawing_set_id` | Owned entity identity. |
| `workspace_id`, `object_id`, `object_documentation_context_id` | Owner scope. |
| `drawing_name`, `drawing_code`, `section` | Working/project drawing identification. |
| `sheet_count`, `note` | Display information for registry/references. |
| `company_snapshot_id` | Nullable reference to relevant object company snapshot. |
| `status` | Current/retired marker; independent approval/version lifecycle is not introduced. |

`project_drawing_set` is not `ExecutiveScheme`, not a physical as-built evidence entity and not an independent aggregate root in V1.

### 5.5 `numbering_policy`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `numbering_policy_id` | Policy identity. |
| `workspace_id`, `object_id` | Scope boundary. |
| `scope_kind`, `scope_reference_id` | Object or folder-scoped policy, subject to later command design. |
| `document_type` | Typed-document applicability. |
| `prefix`, `suffix`, `sequence_rule` | Number generation inputs. |
| `status` | Active/retired marker. |

Changing a number of an already final document is a `Document` revision command, never a folder or registry mutation.

---

## 6. FolderTree Tables

### 6.1 `folder_tree`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `folder_tree_id` | Aggregate root identity. |
| `workspace_id`, `object_id` | Exactly one object scope. |
| `status` | Active/archived marker. |
| `created_at`, `updated_at` | Tree lifecycle markers. |

There is one active tree baseline per object unless a later workspace UX decision introduces multiple trees.

### 6.2 `folder_node`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `folder_node_id` | Node identity inside tree. |
| `folder_tree_id`, `workspace_id`, `object_id` | Redundant tenant/object scope for safe relation checks. |
| `parent_folder_node_id` | Nullable parent within the same tree. |
| `title` | Business folder label. |
| `display_order` | Sibling ordering. |
| `status`, `deleted_at` | Soft deletion/restoration state. |

Constraints:

- A node cannot reference itself or create an ancestor cycle.
- Parent and child share the same `folder_tree`, `workspace` and `object`.
- A move cannot cross an object boundary.

### 6.3 `folder_placement`

Placement is owned by `FolderTree`; it does not transfer lifecycle ownership of the placed target.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `folder_placement_id` | Placement identity. |
| `folder_tree_id`, `folder_node_id` | Owning navigation location. |
| `workspace_id`, `object_id` | Scope checks. |
| `placeable_kind` | Allowed scoped concept such as `DOCUMENT`, `EXECUTIVE_SCHEME` or `PACKAGE`. |
| `placeable_id` | Identity of an entity in the same workspace/object when object-specific. |
| `display_order` | Ordering within folder. |
| `status`, `deleted_at` | Placement soft deletion. |

Moving a document changes `folder_placement`, not its typed content. A simultaneous renumber is a separate document command.

### 6.4 Folder duplication representation

Folder duplication is a domain operation rather than a mandatory persisted aggregate. If asynchronous or resumable duplication is later required, a `folder_clone_operation` operational record may store chosen clone strategy and outcomes. It must never silently duplicate final revisions or evidence originals.

---

## 7. Company and Representative Tables

### 7.1 `company_profile`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `company_profile_id` | Reusable company library identity. |
| `workspace_id` | Library tenant scope. |
| `legal_name`, `short_name` | Current company names. |
| `tax_and_registration_details` | Typed requisite block appropriate to later contract. |
| `legal_address`, `actual_address` | Current addresses. |
| `director_and_authority` | Current representative authority context. |
| `sro_and_contact_details` | Current optional business details. |
| `status`, `deleted_at` | Library lifecycle. |

Changes affect later selections only unless an explicit object update creates a new applicable snapshot.

### 7.2 `object_company_snapshot`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `object_company_snapshot_id` | Immutable snapshot identity. |
| `workspace_id`, `object_id` | Object owner scope. |
| `source_company_profile_id` | Nullable origin reference. |
| `party_role` | Contractor/customer/designer or later approved object role. |
| `display_requisites` | Frozen structured requisites for object/document output. |
| `contract_work_sro_context` | Frozen object-specific display values where used. |
| `captured_at`, `captured_by_membership_id` | Snapshot provenance. |
| `supersedes_snapshot_id` | Nullable explicit adoption of updated object context. |

Snapshots are not updated in place to follow a live company profile.

### 7.3 `representative_profile`

Schema V1 reserves a workspace-scoped reusable representative library because the product memory requires reusable representatives, while released output continues to rely on snapshots.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `representative_profile_id` | Reusable profile identity. |
| `workspace_id` | Tenant scope. |
| `company_profile_id` | Nullable current organization relation. |
| `full_name`, `position` | Current reusable person display details. |
| `authority_basis`, `optional_registry_details` | Current authority/NRS data. |
| `contact_details` | Optional current metadata. |
| `status`, `deleted_at` | Profile lifecycle. |

This table is a convenience source for future selections; it is never the source for an already released signature block.

Whether this reusable library is required in the first implemented scope, and whether it ever becomes an independently governed aggregate, remains a review question; immutable output snapshots are required either way.

### 7.4 `object_representative_binding`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `object_representative_binding_id` | Object default identity. |
| `workspace_id`, `object_id` | Owner scope. |
| `representative_profile_id` | Nullable reusable origin. |
| `participant_role` | Default semantic role. |
| `default_display_values` | Editable object-level default. |
| `display_order`, `status` | Default organization. |

### 7.5 Released representative snapshots

`document_representative_snapshot` and `registry_signer_snapshot` are specified in Sections 10, 16 and 19 because they belong to released document or registry/package output context, not to live profile ownership.

---

## 8. Project Source File Tables

### 8.1 `project_source_file`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `project_source_file_id` | Project-source identity. |
| `workspace_id`, `object_id` | Mandatory same-tenant/object scope. |
| `file_asset_id` | Physical uploaded original in `file_asset`. |
| `source_kind` | User-confirmed type such as project PDF, drawing or specification. |
| `title`, `description` | Human-oriented description. |
| `classification_state` | Unclassified/proposed/confirmed state. |
| `uploaded_by_membership_id`, `uploaded_at` | Provenance. |
| `status` | Active/archived/superseded/soft-deleted vocabulary to ratify. |
| `supersedes_project_source_file_id` | Nullable explicit provenance; full revision policy remains open. |

Invariants:

- No source file participates in project assistance without `workspace_id`, `object_id` and physical file asset.
- A source file is neither a `Certificate` nor an `ExecutiveScheme`.
- Replacement never silently rewrites released document or package provenance.

### 8.2 `project_source_classification`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `project_source_classification_id` | Classification decision identity. |
| `project_source_file_id`, `workspace_id`, `object_id` | Source scope. |
| `classification_kind`, `structured_labels` | Confirmed categorization. |
| `state` | Proposed/confirmed/rejected. |
| `confirmed_by_membership_id`, `confirmed_at` | Nullable human confirmation. |

If a classification originated from AI, the proposal remains recorded separately in Section 9 before this confirmed target is written.

### 8.3 `project_source_reference`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `project_source_reference_id` | Provenance relation identity. |
| `workspace_id`, `object_id` | Same source/target scope. |
| `project_source_file_id` | Referenced original. |
| `target_kind`, `target_id` | Confirmed domain target or revision context. |
| `citation_location` | Human-reviewable page/sheet/fragment reference where available. |
| `relation_purpose` | Basis/reference/comparison or later typed vocabulary. |
| `confirmed_by_membership_id`, `confirmed_at` | Attributable confirmation. |

This relation proves provenance; it does not make a file the owner of confirmed document data.

---

## 9. AI Proposal / Finding Tables

### 9.1 `assistance_processing_run`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `assistance_processing_run_id` | Processing request/result context. |
| `workspace_id`, `object_id` | Isolation boundary. |
| `project_source_file_id` | Source analysed, when project ingestion is involved. |
| `requested_by_membership_id`, `requested_at` | Authorized initiation. |
| `processing_purpose` | Extraction, consistency review or later allowed purpose. |
| `status` | Requested/running/completed/failed/cancelled representation. |
| `processing_policy_reference` | Future approved policy/provider/context provenance; not provider choice here. |

Actual AI/OCR execution is deferred; these records define the boundary required if assistance is enabled.

### 9.2 `ai_extraction_proposal`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `ai_extraction_proposal_id` | Proposal identity. |
| `assistance_processing_run_id`, `workspace_id`, `object_id` | Source scope. |
| `target_kind`, `target_field_or_relation_kind` | Proposed destination semantics. |
| `proposed_structured_value` | Reviewable candidate content. |
| `confidence_or_explanation` | Optional review aid, never approval. |
| `status` | Pending/accepted/edited-and-accepted/rejected/stale. |
| `reviewed_by_membership_id`, `reviewed_at` | Human action only. |
| `resulting_target_reference` | Nullable confirmed record created/changed by domain command. |

### 9.3 `ai_consistency_finding_proposal`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `ai_finding_id` | Reviewable finding identity. |
| `assistance_processing_run_id`, `workspace_id`, `object_id` | Scope. |
| `finding_kind` | Missing evidence candidate, mismatch, completeness or stale reference candidate. |
| `finding_explanation` | Human-reviewable basis. |
| `suggested_severity` | Advisory only; not domain validation outcome. |
| `status` | Pending/acknowledged/dismissed/stale/converted-by-confirmed-rule. |
| `reviewed_by_membership_id`, `reviewed_at` | Human review attribution. |

### 9.4 `proposal_source_citation`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `proposal_source_citation_id` | Citation identity. |
| `workspace_id`, `object_id` | Isolation boundary. |
| `proposal_kind`, `proposal_id` | Extraction or finding proposal. |
| `project_source_file_id` | Original cited source. |
| `citation_location`, `citation_excerpt_reference` | Page/sheet/region/text locator where permitted. |
| `citation_role` | Basis/comparison/evidence-expectation context. |

### 9.5 Proposal invariants

- Proposal and finding tables are never confirmed domain tables.
- User confirmation requires a valid membership permission for the target owner.
- Accepted proposals produce explicit target-domain changes and audit events.
- A released document is changed only through its revision rules.
- A changed source or target may mark pending/accepted review context stale; it does not rewrite history.
- No cross-workspace AI context, retrieval or linking is permitted.

---

## 10. Document Core Tables

### 10.1 `document`

`document` is the stable aggregate identity for a typed act.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `document_id` | Stable document identity. |
| `workspace_id`, `object_id` | Mandatory tenant/object context. |
| `document_type` | Immutable type, initially including `AOSR`; test types require ratified contracts. |
| `lifecycle_status` | `DRAFT`, `FINAL`, `ARCHIVED`, `DELETED` baseline. |
| `current_working_content_id` | Nullable pointer to current editable structured content. |
| `latest_released_revision_id` | Nullable pointer to latest released snapshot. |
| `created_by_membership_id`, `created_at` | Creation provenance. |
| `updated_at`, `deleted_at` | Current aggregate lifecycle markers. |

Constraints:

- `document_type` cannot change after creation.
- Document and all content/links share the same `workspace_id` and `object_id`.
- Folder placement is provided by `folder_placement`, not owned content in `document`.

### 10.2 `document_content`

Logical parent for structured editable content and released content instances. It avoids treating autosave or generated files as the document itself.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `document_content_id` | Content state identity. |
| `document_id`, `workspace_id`, `object_id` | Owner scope. |
| `content_role` | `WORKING` or `RELEASED_REVISION`. |
| `document_number_values`, `document_date` | Structured identity values for this content. |
| `content_status` | Editable/released/superseded marker. |
| `revision_number` | Required only for released revision content. |
| `template_version_id` | Required for released rendered output where a template is used. |
| `immutable_from` | Required for released revision content; absent on current mutable working content. |

The later physical design may normalize fields further, but it must preserve the distinction between mutable working content and immutable released content.

### 10.3 `document_validation_finding`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `document_validation_finding_id` | Finding identity. |
| `document_content_id`, `workspace_id`, `object_id` | Evaluated content. |
| `finding_level` | `ERROR`, `WARNING`, `INFO`. |
| `rule_code`, `message`, `related_target_reference` | Explainable rule result. |
| `acknowledged_by_membership_id`, `acknowledged_at` | Nullable warning handling. |
| `evaluated_at` | Validation provenance. |

AI findings do not enter this table as validation outcomes unless an authorized, approved domain workflow applies a formal rule.

### 10.4 `document_lock`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `document_lock_id` | Operational lease identity. |
| `workspace_id`, `document_id` | Tenant-safe locked target. |
| `membership_id`, `session_reference` | Authorized editing holder. |
| `locked_at`, `heartbeat_at`, `expires_at`, `released_at` | Lease state. |
| `override_audit_reference` | Nullable future authorized override provenance. |

Lock acquire/heartbeat/release/expiry never creates a document revision or package invalidation by itself.

---

## 11. AOSR Payload Tables

`AOSR` is a typed payload owned by one `document_content` whose parent `document.document_type = AOSR`. Released instances are immutable through their released `document_content`.

### 11.1 `aosr_payload`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `document_content_id` | One-to-one owner reference and payload identity. |
| `workspace_id`, `object_id`, `document_id` | Tenant/document safety. |
| `work_description` | Structured/renderable description of concealed works. |
| `work_location_values` | Typed location components plus rendered value as required. |
| `execution_period` | Work execution dates where applicable. |
| `acceptance_conclusion` | Result/permission for subsequent works and notes. |
| `additional_information` | Typed optional AOSR-specific information under approved form. |

This payload is structured source data. It does not contain a DOCX/PDF as editable master.

### 11.2 `aosr_system_reference`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `aosr_system_reference_id` | Relation identity. |
| `document_content_id`, `workspace_id`, `object_id` | Payload scope. |
| `engineering_system_id` | Object-local source reference. |
| `rendered_snapshot_value` | Captured output value when content is released. |
| `display_order` | Order if multiple systems appear. |

### 11.3 `aosr_project_reference`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `aosr_project_reference_id` | Project/normative reference identity. |
| `document_content_id`, `workspace_id`, `object_id` | Owner scope. |
| `reference_kind` | Drawing set, normative document, PPR or controlled kind. |
| `project_drawing_set_id` | Nullable object-owned confirmed drawing set. |
| `project_source_reference_id` | Nullable confirmed provenance citation. |
| `rendered_reference_value` | Content displayed in this AOSR state. |
| `display_order` | Document-owned output order. |

### 11.4 `aosr_material_usage`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `aosr_material_usage_id` | Document-owned material/equipment use identity. |
| `document_content_id`, `workspace_id`, `object_id` | Owner scope. |
| `usage_kind` | Material/equipment classification. |
| `name`, `brand_model`, `manufacturer` | Claimed installed/used item values. |
| `quantity_and_unit`, `batch_lot` | Nullable applicability fields. |
| `application_location` | Nullable more specific use location. |
| `display_order` | Rendering order. |

There is no independent `WorkItem` or required reusable material catalog in V1 baseline; this table keeps the asserted usage with the act.

### 11.5 `aosr_material_certificate_link`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `aosr_material_certificate_link_id` | Evidence relation identity. |
| `aosr_material_usage_id`, `document_content_id` | Document-owned purpose/context. |
| `workspace_id`, `object_id` | Same-scope checks. |
| `certificate_id` | Independent file-backed evidence owner. |
| `relation_purpose`, `display_order` | Why/how certificate is represented. |
| `rendered_evidence_snapshot` | Output-relevant confirmed values for released content. |

An AOSR cannot satisfy a quality-document reference by a manually typed registration number without this relation to a certificate with its physical file.

### 11.6 `aosr_scheme_link` and `aosr_attachment_reference`

| Table | Required conceptual content | Rule |
| --- | --- | --- |
| `aosr_scheme_link` | `document_content_id`, `executive_scheme_id`, purpose, caption, order, output snapshot values | A cited/attached scheme requires its physical file. |
| `aosr_attachment_reference` | `document_content_id`, typed attachment purpose, file-backed/domain target, caption, order | Certificate and scheme originals remain owned by their own aggregates. |

### 11.7 `document_representative_snapshot`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `document_representative_snapshot_id` | Participant display identity in content/revision. |
| `document_content_id`, `workspace_id`, `object_id` | Owning document content. |
| `participant_role` | Semantic AOSR/form role. |
| `source_binding_or_profile_reference` | Nullable origin provenance only. |
| `display_organization`, `display_position`, `display_name` | Frozen displayed participant values. |
| `authority_values`, `caption`, `display_order` | Frozen authority/signature block values. |

For released AOSR content this record is immutable even if profile/default values later change.

---

## 12. TestAct Candidate Tables

Acts of testing belong to the MVP-oriented document family, but concrete forms and blocking fields remain unratified. Schema V1 reserves typed structures without allowing an untyped generic act to ship silently.

### 12.1 `test_act_payload_candidate`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `document_content_id` | Parent typed content, only when approved `document_type` contract exists. |
| `workspace_id`, `object_id`, `document_id` | Scope. |
| `test_act_subtype` | Candidate concrete contract such as hydraulic, pressure or flushing after ratification. |
| `tested_subject_values` | Structured tested system/section/equipment context. |
| `method_or_basis` | Testing method/normative basis. |
| `execution_time_values` | Applicable testing date/time. |
| `result_conclusion` | Structured result/conclusion. |

### 12.2 Candidate owned detail tables

| Candidate table | Purpose | Activation rule |
| --- | --- | --- |
| `test_act_parameter_candidate` | Named target/actual measured parameters and units. | Required set must be defined by approved subtype. |
| `test_act_participant_snapshot_candidate` | Released participant/signature values. | Same snapshot principle as AOSR after form approval. |
| `test_act_supporting_reference_candidate` | Related schemes, evidence, instruments, documents or project basis. | Link requirements must follow approved subtype validation. |

### 12.3 Candidate constraints

- No generic `TEST_ACT` can be finalized merely because these tables exist.
- `HydraulicTestAct`, `PressureTestAct` and `FlushingAct` require ratified payload and template/validation rules before release.
- `TechnicalReadinessAct` remains deferred and does not acquire a payload table by implication.
- Once approved, final testing-act content follows the same revision, artifact and package snapshot rules as AOSR.

---

## 13. Certificate / Evidence Tables

### 13.1 `certificate`

`certificate` is the quality-evidence root, including declarations, passports and controlled quality-document kinds.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `certificate_id` | Evidence identity. |
| `workspace_id` | Library tenant scope. |
| `evidence_kind` | Certificate/declaration/passport/approved letter kind. |
| `registration_number` | Confirmed identifier where applicable. |
| `coverage_description`, `manufacturer`, `issuer` | Confirmed evidence meaning. |
| `issue_date`, `valid_until` | Confirmed validity inputs where applicable. |
| `page_count` | Confirmed metadata where used. |
| `confirmation_status` | Draft/unconfirmed/confirmed or approved vocabulary. |
| `status`, `deleted_at` | Evidence lifecycle with historical protection. |

### 13.2 `certificate_original_file`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `certificate_original_file_id` | Binding identity. |
| `certificate_id`, `workspace_id` | Evidence owner scope. |
| `file_asset_id` | Physical original file. |
| `binding_status` | Active/superseded/retained marker once policy is ratified. |
| `uploaded_by_membership_id`, `uploaded_at` | Provenance. |
| `supersedes_binding_id` | Nullable future explicit replacement path. |

Invariants:

- A certificate referenced in a final document, registry output requiring evidence, or package must have a retained physical original.
- Silent replacement of a historically used original is forbidden.

### 13.3 `certificate_metadata_confirmation`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `certificate_confirmation_id` | Confirmation action identity. |
| `certificate_id`, `workspace_id` | Target scope. |
| `proposed_source_reference` | Nullable OCR/AI proposal origin. |
| `confirmed_field_values` | Values accepted or corrected by user. |
| `confirmed_by_membership_id`, `confirmed_at` | Attribution. |

### 13.4 Certificate validity usage

Validity outcome belongs to the referring document content/revision, represented through `document_validation_finding` and evidence link snapshots. A certificate does not become globally invalid solely because today's date passes `valid_until`.

---

## 14. ExecutiveScheme Tables

### 14.1 `executive_scheme`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `executive_scheme_id` | Scheme aggregate identity. |
| `workspace_id`, `object_id` | Tenant/object scope. |
| `title`, `registration_number`, `scheme_date` | Structured scheme metadata. |
| `sheet_count`, `note` | Output metadata. |
| `engineering_system_id` | Nullable object-local context. |
| `status`, `deleted_at` | Lifecycle markers. |
| `created_by_membership_id`, `created_at` | Provenance. |

### 14.2 `executive_scheme_original_file`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `executive_scheme_original_file_id` | File binding identity. |
| `executive_scheme_id`, `workspace_id`, `object_id` | Owner scope. |
| `file_asset_id` | Required physical original. |
| `binding_status`, `supersedes_binding_id` | Explicit replacement provenance only if later policy enables it. |
| `uploaded_by_membership_id`, `uploaded_at` | Attribution. |

### 14.3 Scheme constraints

- A scheme linked as evidence or included in a package has a physical original file.
- `ExecutiveScheme` and `ProjectDrawingSet` cannot be used interchangeably.
- On the initial baseline, a changed scheme is represented as a new file-backed entity or later explicit supersession; it is not silently overwritten.
- Any scheme-to-document relationship is owned by document content or package snapshot, not by a mutable registry row.

---

## 15. Template / TemplateVersion Tables

### 15.1 `template`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `template_id` | Form family identity. |
| `workspace_id` | Nullable only if later approved system-provided template scope exists; workspace variant remains isolated. |
| `template_purpose` | Typed document, registry or later approved output purpose. |
| `document_type` | Required for typed-document templates where applicable. |
| `display_name`, `status` | Family metadata. |

### 15.2 `template_version`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `template_version_id` | Immutable-used version identity. |
| `template_id` | Owning form family. |
| `version_label` | Human/audit version value. |
| `rendering_contract_reference` | Structured form contract metadata without choosing engine. |
| `status` | Draft/available/used/retired representation. |
| `first_used_at` | Once populated, version content is immutable. |
| `created_by_membership_id`, `created_at` | Provenance in workspace scope. |

If a future platform-provided template has no tenant owner, that exception concerns only the reusable form offering: an object's binding, released revision and generated output remain in exactly one workspace scope.

### 15.3 `template_version_asset`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `template_version_asset_id` | Version-to-file binding identity. |
| `template_version_id` | Owner version. |
| `file_asset_id` | Physical template source if that output method uses a file. |
| `asset_purpose` | Template source/supporting asset purpose. |

### 15.4 `object_template_binding`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `object_template_binding_id` | Default binding identity. |
| `workspace_id`, `object_id` | Object scope. |
| `document_type_or_output_purpose` | Binding applicability. |
| `template_version_id` | Available version chosen as default. |
| `status` | Active/retired. |

Released document content and generated artifacts capture their exact version rather than relying only on a mutable default.

---

## 16. RegistryProjection / RegistryOverride Tables

### 16.1 `registry_scope`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `registry_scope_id` | Configuration/output scope identity. |
| `workspace_id`, `object_id` | Tenant/object scope. |
| `package_id` | Nullable package-specific scope. |
| `scope_definition` | Selected object/folder/document range represented conceptually. |
| `status` | Active/archived. |

### 16.2 `registry_override`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `registry_override_id` | Presentation configuration identity. |
| `registry_scope_id`, `workspace_id`, `object_id` | Owner scope. |
| `created_by_membership_id`, `updated_at` | Authored configuration provenance. |
| `status` | Active/retired. |

### 16.3 `registry_override_item`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `registry_override_item_id` | Instruction identity. |
| `registry_override_id` | Owner configuration. |
| `override_kind` | Ordering, inclusion/hiding, printable note, section setting or signer selection. |
| `projected_target_reference` | Row/section/source identity to present, not edit. |
| `presentation_value` | Allowed presentation/configuration value. |
| `display_order` | Output order where applicable. |

`registry_override_item` may not store a corrected act number/date, certificate metadata, scheme metadata or company requisites as a substitute for their owners.

### 16.4 `registry_signer_snapshot`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `registry_signer_snapshot_id` | Output signer identity. |
| `registry_scope_id`, `workspace_id`, `object_id` | Output scope. |
| `source_representative_reference` | Nullable origin. |
| `display_name`, `display_position`, `display_organization` | Captured values. |
| `authority_values`, `caption` | Output-specific signer content. |
| `captured_at` | Snapshot provenance. |

### 16.5 `registry_projection_result`

Optional retained result/cache/output input for a calculation, always derived.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `registry_projection_result_id` | Derived calculation identity. |
| `registry_scope_id`, `workspace_id`, `object_id` | Source scope. |
| `applied_override_id` | Presentation input. |
| `dependency_reference_set` | Identities/revisions/snapshots used. |
| `calculated_at`, `freshness_status` | Derived lifecycle. |

### 16.6 `registry_projection_row`

If retained for output or performance, each row carries resolved source provenance and never becomes primary owner data.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `registry_projection_row_id` | Derived row identity. |
| `registry_projection_result_id` | Parent calculation. |
| `row_block_kind` | Object/company/drawings/quality documents/acts/schemes/signer. |
| `source_reference` | Upstream aggregate/revision/evidence identity. |
| `resolved_display_values` | Rendered projection values at calculation time. |
| `display_order` | Calculated/presentation order. |

---

## 17. Package / PackageSnapshot Tables

### 17.1 `package`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `package_id` | Package aggregate identity. |
| `workspace_id`, `object_id` | Tenant/object scope. |
| `title`, `purpose` | Human/output context. |
| `scope_definition` | Intended inclusion scope. |
| `registry_scope_id` | Registry configuration for package where applicable. |
| `status` | Current/archived/stale-facing aggregate status. |
| `created_by_membership_id`, `created_at`, `updated_at` | Provenance. |

### 17.2 `package_component_selection`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `package_component_selection_id` | Current inclusion/ordering instruction. |
| `package_id`, `workspace_id`, `object_id` | Owner scope. |
| `component_kind`, `component_reference` | Document/evidence/scheme/registry component selection. |
| `inclusion_mode` | Explicit inclusion/exclusion or approved rule. |
| `display_order` | User-defined ordering. |

This is configuration, not a successful historical build result.

### 17.3 `package_build`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `package_build_id` | Async attempt identity. |
| `package_id`, `workspace_id`, `object_id` | Owner scope. |
| `requested_by_membership_id`, `requested_at` | Trigger attribution. |
| `status` | Queued/running/succeeded/failed/cancelled model. |
| `progress_summary`, `failure_summary` | Operational user feedback without choosing job technology. |
| `started_at`, `completed_at` | Execution history. |

Build is asynchronous by architecture. It reads sources and creates a snapshot; it never mutates included source aggregates.

### 17.4 `package_snapshot`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `package_snapshot_id` | Immutable successful build identity. |
| `package_id`, `package_build_id`, `workspace_id`, `object_id` | Build provenance. |
| `scope_snapshot`, `ordering_snapshot` | Captured configuration/result. |
| `registry_projection_result_id` | Captured registry result where included. |
| `built_at`, `built_by_membership_id` | Attribution. |
| `freshness_status` | Current/stale marker for convenience; snapshot content remains immutable. |

### 17.5 `package_snapshot_item`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `package_snapshot_item_id` | Included item identity. |
| `package_snapshot_id`, `workspace_id`, `object_id` | Snapshot scope. |
| `item_kind` | Registry artifact, document revision artifact, certificate original, executive scheme original or allowed package output. |
| `source_reference` | Exact revision/evidence/file/projection identity. |
| `file_asset_id` / `generated_artifact_id` | Exact included file or output identity. |
| `display_order` | Frozen package order. |
| `provenance_values` | Output-relevant resolved metadata. |

### 17.6 `package_snapshot_dependency`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `package_snapshot_dependency_id` | Dependency identity. |
| `package_snapshot_id` | Historical result. |
| `dependency_kind`, `dependency_reference` | Exact revision/file/template/snapshot/override/source used. |
| `captured_dependency_state` | Fingerprint or values adequate to detect change later, implementation deferred. |

### 17.7 Package invariants

- Successful snapshots are immutable.
- Dependency changes mark an output stale for current use and require a new async build; they do not rewrite a prior snapshot.
- A package includes exact released document revisions and evidence file identities, not only pointers to latest mutable sources.
- Missing required physical evidence cannot be masked by package configuration.

---

## 18. GeneratedArtifact / FileAsset Tables

### 18.1 `file_asset`

`file_asset` identifies a physical retained file without choosing storage technology.

| Conceptual column | Meaning / constraint |
| --- | --- |
| `file_asset_id` | Physical file identity. |
| `workspace_id` | Mandatory tenant scope for business files. |
| `object_id` | Nullable where library/workspace file is not object-specific. |
| `file_role` | Uploaded evidence original, executive scheme original, project source original, template asset or generated output. |
| `media_type`, `original_filename`, `size_metadata` | File description. |
| `integrity_reference` | Future integrity/checksum provenance without choosing mechanism. |
| `storage_reference` | Opaque storage locator under later storage design. |
| `created_by_membership_id`, `created_at` | Attribution. |
| `retention_status`, `deleted_at` | Protected lifecycle marker. |

### 18.2 `generated_artifact`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `generated_artifact_id` | Derived output identity. |
| `workspace_id`, `object_id` | Source/output scope. |
| `artifact_kind` | Document DOCX/PDF, registry output, package PDF/ZIP or approved output. |
| `file_asset_id` | Physical generated file where retained. |
| `generation_status`, `generated_at` | Output lifecycle. |
| `template_version_id` | Exact rendering form where applicable. |
| `document_revision_id` | Nullable exact typed document release origin. |
| `package_snapshot_id` | Nullable package output origin. |
| `registry_projection_result_id` | Nullable registry output origin. |
| `stale_at` | Current-use convenience marker; output history remains. |

### 18.3 `artifact_source_reference`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `artifact_source_reference_id` | Provenance edge identity. |
| `generated_artifact_id`, `workspace_id` | Derived artifact scope. |
| `source_kind`, `source_reference` | Exact source revision/snapshot/file/template/override. |
| `source_role` | Render/include/registry/dependency purpose. |

### 18.4 File/artifact invariants

- Generated artifacts cannot be edited back into source data automatically.
- Original evidence and original project files are distinct from generated outputs.
- Historical file assets included by released revisions or package snapshots cannot be silently overwritten/deleted.
- Access to original files may be more restricted than access to derived output; policy remains to specify.

---

## 19. Revision / Snapshot Tables

### 19.1 `document_revision_snapshot`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `document_revision_id` | Released revision identity. |
| `document_id`, `document_content_id` | Exact released structured state. |
| `workspace_id`, `object_id` | Tenant/object scope. |
| `revision_number` | Monotonically meaningful document release number within document. |
| `release_status` | Released/final or later approved lifecycle marker. |
| `template_version_id` | Exact form for released output. |
| `validation_summary` | Captured release validation outcome/acknowledgements. |
| `released_by_membership_id`, `released_at` | Attribution. |

The payload/link/snapshot rows attached to released `document_content` are immutable components of this revision.

### 19.2 `autosave_snapshot`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `autosave_snapshot_id` | Recovery identity. |
| `document_id`, `document_content_id`, `workspace_id`, `object_id` | Working target. |
| `structured_working_state_reference` | Complete recoverable draft state conceptually. |
| `saved_by_membership_id`, `saved_at` | Provenance. |
| `recovery_status` | Latest/replaced/restored or approved operational vocabulary. |

Autosave is not a final revision and does not by itself invalidate package outputs.

### 19.3 Snapshot catalog and ownership

| Snapshot | Owner | Immutable after | Purpose |
| --- | --- | --- | --- |
| `object_company_snapshot` | `Object` | Capture/adoption | Stable object organization values. |
| `document_representative_snapshot` on released content | `DocumentRevisionSnapshot` | Release | Stable participant/signature display. |
| `document_revision_snapshot` and its released typed content | `Document` | Release | Reproducible act truth. |
| `registry_signer_snapshot` captured for output | Registry/package output context | Output capture | Reproducible registry signer. |
| `package_snapshot` and its items/dependencies | `Package` | Successful build | Reproducible complete output. |
| Artifact provenance | Generating revision/snapshot | Artifact generation | Explain derived files. |

### 19.4 Revision triggers

A new revision of an already final document is required for changes to its number/date, typed payload, output-relevant object/project values, participant snapshots, material/evidence or scheme/attachment links, released template binding or release-relevant validation acknowledgement.

Lock heartbeat, current registry presentation-only override, viewing/downloading and a package rebuild using an unchanged exact revision do not by themselves create a document revision.

---

## 20. Activity / Audit Tables

### 20.1 `activity_event`

| Conceptual column | Meaning / constraint |
| --- | --- |
| `activity_event_id` | Audit/history identity. |
| `workspace_id` | Tenant context of domain action. |
| `actor_user_id`, `actor_membership_id` | Historical actor and authorization context; nullable system actor only under later policy. |
| `event_kind` | Typed event vocabulary. |
| `target_kind`, `target_id` | Primary acted-on entity/snapshot/output. |
| `object_id` | Nullable related object context. |
| `occurred_at` | Time of event. |
| `event_summary` | Safe explanatory structured metadata. |
| `related_provenance_reference` | Nullable proposal/build/revision/file linkage. |

### 20.2 Mandatory event families represented in V1

| Event family | Examples |
| --- | --- |
| Workspace/access | Personal/organization workspace creation, invite issue/revoke/accept, membership role/status change. |
| Object/setup | Object creation/update, object company snapshot adoption, drawing-set change, folder operations when material. |
| Document/revision | Typed document creation, finalization, revision, archive/delete/restore, critical warning acknowledgement. |
| Evidence/scheme | File upload, metadata confirmation, relation changes, allowed replacement/supersession action. |
| AI assistance | Processing request, proposal generation state, acceptance/edit/rejection/dismissal/staleness. |
| Templates/artifacts | Template version creation/first use, document/registry artifact generation. |
| Registry/package | Override change, build request/success/failure, snapshot creation, staleness marking. |
| Sensitive access | Original-file download/access or denied access where privacy/security policy requires it. |

### 20.3 Audit invariants

- Historical attribution retains `actor_membership_id` after membership removal.
- Audit records describe operations; they do not become editable owners of domain values.
- Sensitive excerpts or project content must not be copied into broad logs without privacy policy.
- Lock heartbeats may be operational telemetry rather than permanent business activity; retention is deferred.

---

## 21. Key Relationships

### 21.1 Tenant and object relationships

| From | To | Cardinality intent | Rule |
| --- | --- | --- | --- |
| `workspace` | `membership` | one-to-many | Authorization only inside matching workspace. |
| `user_account` | `membership` | one-to-many | No direct business-data ownership. |
| `workspace` | `invite` | one-to-many for organization | Invite acceptance creates membership. |
| `workspace` | `object` | one-to-many | Object cannot cross tenant. |
| `object` | `folder_tree` | one-to-one active baseline | Separate root with object scope. |
| `object` | `object_documentation_context` | one bounded context | Owns drawing set entries. |
| `object_documentation_context` | `project_drawing_set` | one-to-many | Owned, not independent root. |

### 21.2 Document and context relationships

| From | To | Cardinality intent | Rule |
| --- | --- | --- | --- |
| `object` | `document` | one-to-many | Document is separate root in same workspace. |
| `folder_tree` | `document` via `folder_placement` | optional placement | Folder does not own content. |
| `document` | `document_content` | working plus released states | Released content immutable. |
| `document` | `document_revision_snapshot` | zero-to-many | Exact release history. |
| `document_content(AOSR)` | `aosr_payload` | exactly one | Required typed content for AOSR. |
| `aosr_payload` | `aosr_material_usage` | zero-to-many | Document-owned work/equipment claims. |
| `aosr_material_usage` | `certificate` via link | zero-to-many subject to validation | Physical certificate file required when invoked. |
| `aosr_payload` | `executive_scheme` via link | zero-to-many | Physical scheme file required when cited. |
| `document_content` | `document_representative_snapshot` | form-dependent many | Frozen upon release. |

### 21.3 Source, proposal and confirmation relationships

| From | To | Rule |
| --- | --- | --- |
| `project_source_file` | `file_asset` | Required physical original and same workspace. |
| `project_source_file` | `assistance_processing_run` | Processing stays in its workspace/object scope. |
| `assistance_processing_run` | proposals/findings | Only reviewable outputs. |
| proposal/finding | `proposal_source_citation` | Traceable source location where available. |
| accepted proposal | confirmed owner record | Created/changed by authorized domain action plus audit, not by automatic copy. |

### 21.4 Output relationships

| From | To | Rule |
| --- | --- | --- |
| `template` | `template_version` | Used version immutable. |
| `document_revision_snapshot` | `generated_artifact` | Artifact names exact released source and template. |
| `registry_scope` / overrides | `registry_projection_result` | Result remains derived. |
| `package` | `package_build` | Async attempt. |
| successful `package_build` | `package_snapshot` | Immutable result. |
| `package_snapshot` | snapshot items/dependencies | Exact revisions/files/projections/templates captured. |
| generated outputs/originals | `file_asset` | File identity and retention/provenance controlled. |

---

## 22. Constraints and Invariants

### 22.1 Tenant and access constraints

| ID | Constraint |
| --- | --- |
| `SCH-001` | Every business aggregate, source file, proposal, revision, projection result, package and artifact is owned by exactly one `workspace`. |
| `SCH-002` | A relation across business tables is valid only when workspace scopes match, unless a future explicit copy/transfer model creates a new destination record. |
| `SCH-003` | `user_account` has no direct business-data role; an active `membership` is required for workspace action. |
| `SCH-004` | Invite URLs carry opaque token/reference only; stored `invite` state determines role and validity. |

### 22.2 Object, folder and setup constraints

| ID | Constraint |
| --- | --- |
| `SCH-010` | `object` is context root, not owner of independent document/evidence/template/package lifecycle histories. |
| `SCH-011` | Each active `folder_tree` is scoped to one object; nodes cannot form cycles or move across objects. |
| `SCH-012` | Folder placement changes cannot silently change document content, number or revision. |
| `SCH-013` | `project_drawing_set` belongs to `object_documentation_context` and is never substituted for `executive_scheme`. |
| `SCH-014` | No separate `work_item` aggregate table is introduced in Schema V1; asserted work belongs to typed content. |

### 22.3 Document and evidence constraints

| ID | Constraint |
| --- | --- |
| `SCH-020` | `document.document_type` is immutable. |
| `SCH-021` | A released document revision and its payload/link/snapshot content are immutable; correction creates the next revision. |
| `SCH-022` | `AOSR` uses structured payload tables and explicit links; DOCX/PDF cannot hold canonical content. |
| `SCH-023` | A quality evidence reference displayed/used by an act requires a `certificate` with retained physical original file. |
| `SCH-024` | An executive scheme referenced/included as evidence requires a retained physical original file. |
| `SCH-025` | Certificate validity finding is evaluated against referring `document_date`; expiry is warning-level under existing baseline unless later strengthened. |

### 22.4 Template, registry, package and artifact constraints

| ID | Constraint |
| --- | --- |
| `SCH-030` | `template_version` cannot change after first released/output use. |
| `SCH-031` | `registry_projection_result` and rows are derived; `registry_override` stores presentation/configuration only. |
| `SCH-032` | `package_build` is asynchronous conceptually and successful `package_snapshot` is immutable. |
| `SCH-033` | Package snapshots include exact revisions and file identities; source change makes current output stale rather than rewriting history. |
| `SCH-034` | `generated_artifact` is derived and cannot be imported back as source without a separately designed process. |

### 22.5 AI, source and audit constraints

| ID | Constraint |
| --- | --- |
| `SCH-040` | A project source upload remains source material/provenance; confirmed structured owner data remain operational truth. |
| `SCH-041` | AI/OCR output is recorded only as proposal/finding until authorized confirmation and owner validation. |
| `SCH-042` | Proposals/findings and citations retain the same workspace/object scope as source and intended target. |
| `SCH-043` | Acceptance/rejection and resulting domain action are attributable through audit. |
| `SCH-044` | Historical audit/provenance cannot disappear merely because membership is later removed or content becomes stale. |

---

## 23. Indexing Considerations

This section defines expected lookup and integrity needs, not a physical indexing implementation.

### 23.1 Tenant-first access paths

Most business queries must start with `workspace_id`, and object-focused flows additionally with `object_id`. Future physical indexes or partition/security strategy must make tenant checks natural rather than optional filters.

| Query family | Conceptual access key |
| --- | --- |
| Workspace objects and libraries | `workspace_id` plus lifecycle/status. |
| Object documents/folders/schemes/sources | `workspace_id`, `object_id`, status/type. |
| Document history | `workspace_id`, `document_id`, revision number/release time. |
| Package status/history | `workspace_id`, `object_id`, `package_id`, build/snapshot time. |
| Audit timeline | `workspace_id`, object/target, occurred time. |

### 23.2 Integrity-oriented uniqueness/lookups

| Concern | Conceptual requirement |
| --- | --- |
| Membership duplication | Avoid multiple simultaneously active equivalent memberships for one user/workspace unless governance later permits it intentionally. |
| Personal workspace creation | Registration flow identifies the user's baseline personal workspace and Owner membership consistently. |
| Invite token resolution | Efficient secure lookup by token verifier/reference and validity state, never by trusted URL role fields. |
| Folder hierarchy | Efficient parent/children/order traversal and cycle-safe move validation within object tree. |
| Document numbering | Check uniqueness/collision according to later ratified numbering scope and document lifecycle. |
| Template immutability | Find usages of a version before any attempted mutation. |
| File retention | Find released revisions/package snapshots referencing an original before replacement/delete action. |

### 23.3 Projection, processing and build lookups

| Concern | Conceptual access path |
| --- | --- |
| Registry calculation | Resolve scope to documents revisions, evidence, schemes, drawing sets and override items. |
| Package invalidation | Locate snapshots depending on changed revision/file/template/override or output-visible object snapshot. |
| AI review queue | Find pending/stale proposals/findings by workspace/object/source/status. |
| Project provenance | Find citations and confirmed target relations for one source file. |
| Generated artifact freshness | Locate artifacts from source revision/snapshot/template and mark stale current usage. |

### 23.4 Search intentionally deferred

Full-text/search indexes, OCR text indexing and cross-entity search UX are not selected here. Any eventual search index must enforce workspace isolation and must not expose source-file or sensitive extracted content across membership boundaries.

---

## 24. MVP Scope

Schema V1 establishes conceptual storage coverage for the responsible first product architecture:

- `Workspace`, `User`, `Membership` and stored opaque-token `Invite` boundary;
- `Object`, `EngineeringSystem`, separate `FolderTree` and folder placements;
- `CompanyProfile`, object company snapshots, representative defaults and released participant snapshots;
- object-owned `ProjectDrawingSet`;
- typed `Document` identity, structured content, validation, locks, autosave and immutable released revisions;
- full structured `AOSR` payload, material usages and explicit evidence/scheme links;
- file-backed `Certificate` evidence family and `ExecutiveScheme`;
- `Template`/immutable-used `TemplateVersion`;
- derived registry scopes/results and presentation-only overrides;
- async `PackageBuild` and immutable `PackageSnapshot`;
- `FileAsset`, `GeneratedArtifact`, provenance and activity/audit foundations;
- Workspace/Object-scoped project source PDFs for retained human reference/provenance;
- proposal/finding tables sufficient to prevent future AI/OCR assistance from bypassing confirmation and audit.

The presence of AI proposal tables in the conceptual schema does not require AI processing in the first shipped workflow. It reserves the correct truth and review boundary.

### 24.1 Candidate within MVP-oriented architecture

`TestAct` family is acknowledged as MVP-oriented, but concrete first subtype payloads, templates and validation must be ratified before finalizable test-act records are exposed. Candidate tables document the expected typed extension point only.

---

## 25. Deferred Scope

The following are explicitly deferred beyond Database Schema V1:

- physical database selection, production DDL, migrations, ORM and repository mapping;
- API/service boundaries, endpoint contracts, auth protocol and frontend state;
- physical file storage, integrity implementation, queue/job implementation and output renderer;
- concrete `TestAct` subtype selection and `TechnicalReadinessAct` schema;
- reusable standalone `WorkItem` aggregate and full material/equipment catalogue;
- independent approval/version lifecycle for `ProjectDrawingSet`;
- evidence/scheme/source-file replacement, supersession, retention and legal hold policy;
- complete document status/approval/signature/ЭЦП workflow;
- fine-grained object/folder assignments, original-download permissions, support access and commercial entitlements;
- multi-use invitation first-scope decision, ownership transfer/recovery and cross-workspace copy/export;
- AI/OCR provider, processing jurisdiction, extraction implementation, privacy consent and real-content processing;
- CAD/BIM/DWG/DXF integration, legacy document import, full-text search and public API;
- template engine, DOCX/PDF generation, PDF merge and package covers/opisi.

No deferred choice may be introduced in implementation merely because this conceptual schema provides a place to discuss it.

---

## 26. Open Questions

These questions should be answered, explicitly deferred or converted into later design constraints before Backend/API Architecture and implementation planning are approved.

### 26.1 Domain and typed document scope

1. Which exact `TestAct` subtypes and approved templates enter the first implemented scope?
2. Is `TechnicalReadinessAct` required in MVP, and what is its typed payload?
3. Which AOSR participant roles, location fields, project references, schemes and quality-document links are blocking requirements for finalization?
4. Is a reusable material/equipment catalogue needed initially, or are document-owned `MaterialUsage` rows sufficient?

### 26.2 Lifecycle, snapshots and evidence

1. What exact draft-to-release/revision workflow sits alongside autosave, and are states beyond `draft`, `final`, `archived`, `deleted` required?
2. What replacement/supersession and retention policy applies to certificate, scheme and project-source originals after historical use?
3. Which warnings may block package readiness for a particular customer/form while preserving the current certificate-expiry baseline?
4. What minimum historical audit retention and access is legally/practically required?

### 26.3 Access, privacy and tenant governance

1. Are multi-use invites deferred or supported initially, and what email-verification, expiration and abuse controls apply?
2. How are organization ownership transfer/recovery, multiple owners and entitlement lapse handled?
3. Which `Foreman`/`Viewer` actions are permitted for drafts, generated outputs and sensitive original files?
4. Is any cross-workspace copy/export permitted, with what provenance and destination ownership?
5. What privacy/security policy governs representative personal data, originals, audit and platform support access?

### 26.4 Project ingestion and AI assistance

1. Which PDF project materials are supported first, and how are replacements/current revisions presented to users?
2. What source citation granularity and staleness rules are sufficient for proposals and findings?
3. Which roles may upload, request processing, accept proposed values, dismiss findings or view extracted content?
4. What approved data-processing policy is required before real project material may be sent to any AI/OCR processing?
5. Which AI-assisted findings, if ever, become formal domain validation rules after human/product approval?

### 26.5 Backend/API architecture inputs

1. Which aggregate commands and transaction boundaries are required to enforce tenant-safe links, release revisions and snapshot builds?
2. Which query/read models are needed for folder navigation, registry freshness, package readiness and AI review queues?
3. How should an API expose immutable snapshots and stale outputs without permitting edits to derived/historical data?
4. Which implementation-neutral constraints from this schema must become authorization, validation and concurrency contracts?

Until these questions are addressed at the appropriate level, Schema V1 is the conceptual persistence boundary for further architecture work, not permission to implement a production database or application.
