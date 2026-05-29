# 19. Sharing and Access Model V1

# PTO ID System

# Owner-based access, share codes and capability grants for MVP

Статус: architecture amendment superseding complex RBAC for MVP implementation scope.

Дата фиксации: 2026-05-29.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание модели: `docs/06-data-model-v1.md`, `docs/09-aggregate-boundaries-and-invariants.md`, `docs/10-auth-workspace-rbac-model.md`, `docs/11-ai-project-ingestion-and-assistance-model.md`, `docs/12-database-schema-v1.md`, `docs/14-backend-api-architecture-v1.md`, `docs/15-api-command-readmodel-contracts-v1.md`, `docs/16-mvp-scope-and-first-forms-v1.md`, `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`, canonical ADR 0001-0005.

---

## 1. Purpose

This document fixes the MVP access architecture after a product decision: complex RBAC is not needed for the first product scope. MVP access uses a simple owner-based sharing model:

- one global system admin for operational administration;
- regular users own their workspaces, project data and certificate libraries;
- access to another user is granted through share codes / invite codes;
- default permission is view-only;
- owner selects specific capabilities for a specific code;
- accepted code creates a persistent share grant scoped to a specific owner resource.

This is a conceptual architecture document. It does not add code, Prisma schema, migrations, API routes, auth implementation, sharing implementation, certificate library implementation or UI implementation.

## 2. Why Complex RBAC Is Removed From MVP

Previous architecture documents described membership roles such as `Owner`, `Admin`, `PTO Engineer`, `Foreman` and `Viewer`. That role matrix is too heavy for MVP:

- first users need quick owner-controlled sharing, not enterprise governance;
- `Foreman` workflow is not confirmed for first scope;
- fine-grained RBAC would expand API, UI, tests and audit before product need is proven;
- owner-selected capabilities are easier to explain and safer to operate;
- default view-only access reduces accidental write exposure.

MVP decisions:

- no fine-grained RBAC for MVP;
- no `Foreman` role in MVP;
- no `Owner/Admin/PTO Engineer/Viewer` role matrix in MVP;
- previous membership/RBAC governance is deferred;
- `docs/10-auth-workspace-rbac-model.md` is superseded for MVP implementation scope by this document.

## 3. Core Access Model

MVP access has only three authorization concepts:

| Concept | Meaning |
| --- | --- |
| `Global System Admin` | Exactly one operational/admin user controlled by deployment/config. Separate from business collaboration. |
| `Regular User` | Authenticated user who owns their own workspaces/project data and certificate libraries. |
| `Share Grant` | Capability-based access to a specific owner resource after accepting a valid share code. |

Authorization rule:

```text
Allow action only when actor is resource owner,
or global system admin through a separate admin path,
or holder of a resource-scoped grant with the required capability.
```

Missing capability means default deny.

## 4. Global System Admin

System admin is not a normal business collaborator.

Rules:

- exactly one operational/admin user is expected initially;
- admin identity is controlled by deployment/config;
- system admin can inspect, support and administer the system through a separate admin path;
- system admin does not replace resource owner;
- system admin does not become owner of user workspaces or certificate libraries;
- system admin path is separate from owner/user sharing;
- multi-admin governance is not implemented in MVP.

System admin access must be audited separately from owner/grantee actions.

## 5. Regular Users And Data Ownership

Regular users own:

- their workspaces/project databases;
- objects and folder trees inside those workspaces;
- typed documents, revisions and generated artifacts in owned scope;
- certificate libraries and certificate evidence files;
- registry/package configuration and outputs in owned scope;
- share codes and grants they issue for owned resources.

A user seeing another owner's resource through a grant does not become owner and cannot delegate access unless a future explicit capability is designed.

## 6. Owner-Based Workspace Access

Workspace/project database access is issued by the owner. It is not organization membership RBAC in MVP.

Rules:

- owner creates a workspace collaboration code;
- owner selects capabilities before sharing;
- authenticated user accepts the code;
- accepted code creates persistent `WorkspaceShareGrant`;
- every workspace command/query checks owner or grant capability;
- grant scope is limited to the target owner workspace/project database;
- grant cannot reveal unrelated workspaces or the grantee's private workspace data.

This preserves workspace isolation while removing the role matrix.

## 7. Share Codes / Invite Codes

Share codes are controlled entry mechanisms, not authorization payloads.

Requirements:

- opaque and non-guessable;
- stored token/reference is hashed or otherwise safe;
- no raw permanent tokens stored;
- no secrets in URLs if avoidable;
- UI may show copyable code/link;
- code is accepted only by authenticated user;
- expired or revoked code cannot be accepted;
- accepted code creates persistent access record;
- owner can revoke grants;
- owner can rotate/regenerate code.

Rotation rule:

```text
Rotating a share code invalidates future acceptance of the old code
but does not automatically revoke existing accepted grants.
```

Existing accepted grants are revoked only by explicit grant revocation. A future "rotate and revoke all" action must be separately designed with UI confirmation and audit.

## 8. Default View-Only Rule

Default permission is view-only.

For workspace collaboration, view-only means read access to the connected workspace shell, folder tree, signatories and documents according to selected view capabilities.

For certificate library sharing, the default sharing preset is view/use only: the grantee may view the shared library and use shared certificates in their own documents when `use_certificates_in_documents` is part of the selected default preset.

All mutation, package build, export, evidence replacement or configuration actions require explicit capabilities.

## 9. Workspace Collaboration Sharing Flow

1. User 1 opens owned workspace/project database.
2. User 1 clicks `Совместная работа`.
3. System shows share code/link and capability toggles.
4. Toggles start in view-only posture.
5. User 1 enables only needed capabilities.
6. User 1 sends code/link.
7. User 2 signs in or creates account.
8. User 2 enters/opens code.
9. System validates code, expiry, revocation and resource scope.
10. User 2 explicitly accepts connection.
11. System creates `WorkspaceShareGrant`.
12. User 2 sees connected workspace clearly marked as owned by User 1 with current access level.

Acceptance does not copy ownership, merge workspaces or grant unrelated access.

## 10. Workspace Collaboration Capabilities

| Capability | Meaning |
| --- | --- |
| `view_workspace` | See target workspace/project database shell and metadata. |
| `view_folder_tree` | See folder hierarchy and placement. |
| `view_signatories` | See representatives/signatories needed to understand documents. |
| `view_documents` | Read typed documents, previews and validation state. |
| `edit_documents` | Edit existing documents through normal document rules. |
| `create_documents` | Create new typed documents in the shared workspace. |
| `edit_signatories` | Edit representatives/signatory data in allowed shared scope. |
| `edit_folder_tree` | Create, rename, move or soft-delete folder tree nodes according to domain rules. |
| `build_packages` | Trigger package builds/rebuilds in shared workspace. |
| `export_generated_artifacts` | Export generated documents, registries or package artifacts. |

Guardrails:

- editing final/released documents still follows revision rules;
- grants cannot bypass validation;
- grants cannot mutate package snapshots;
- grants cannot hide registry/domain errors;
- grants cannot access unrelated workspaces;
- grants cannot bypass template/evidence/package/AI/OCR guardrails.

## 11. Certificate Library Sharing Flow

Certificate library sharing is separate from workspace collaboration.

1. User 1 opens owned certificate library.
2. User 1 opens certificate library sharing/connect flow.
3. User 1 creates certificate library share code.
4. User 1 selects certificate library capabilities.
5. Default posture is view/use only.
6. User 2 signs in and enters/opens code.
7. System validates code, expiry, revocation and library scope.
8. User 2 accepts connection.
9. System creates `CertificateLibraryShareGrant`.
10. User 2 sees connected library as owned by User 1.
11. User 2 can use shared certificates in own documents only if grant has `use_certificates_in_documents`.

Shared library access is not workspace access.

## 12. Certificate Library Capabilities

| Capability | Meaning |
| --- | --- |
| `view_certificate_library` | See shared certificate cards and metadata allowed by policy. |
| `use_certificates_in_documents` | Link/use shared certificates in grantee's own documents while preserving provenance. |
| `add_certificates` | Add certificate items/files to owner's shared library if explicitly allowed. |
| `edit_certificate_cards` | Edit certificate metadata/cards according to evidence confirmation rules. |
| `archive_certificates` | Archive certificate items without erasing historical provenance. |
| `replace_certificate_files` | Replace/supersede certificate files only through explicit evidence rules. |

Guardrails:

- certificate file-backed evidence invariant remains;
- certificate number without physical file remains `ERROR`;
- shared certificate source owner remains original owner unless explicit copy/export is later implemented;
- using shared certificate preserves provenance/source owner/library reference;
- archive/replace cannot silently break released documents or package snapshots.

## 13. Difference Between Workspace Sharing And Certificate Library Sharing

| Aspect | Workspace collaboration sharing | Certificate library sharing |
| --- | --- | --- |
| Shared resource | Owner's workspace/project database | Owner's certificate library |
| Main purpose | Collaborate on objects, folders, documents, signatories, packages and exports | Reuse or maintain quality evidence cards/files |
| Default access | View-only | View/use-only |
| Persistent grant | `WorkspaceShareGrant` | `CertificateLibraryShareGrant` |
| Document editing | Explicit workspace capability only | Not granted by library access |
| Package build/export | Explicit workspace capability only | Not granted by library access |
| Certificate provenance | Reads certificates used by shared workspace | Source owner remains original library owner |
| Cross-workspace effect | Does not open unrelated workspaces | Does not open owner's workspace |

The flows must have separate UI, records and access checks.

## 14. Grant Lifecycle

| State | Meaning |
| --- | --- |
| `code_created` | Owner created code with capability set, expiry and scope. |
| `code_active` | Code can be accepted. |
| `code_expired` | Code cannot be accepted after expiry. |
| `code_revoked` | Owner invalidated code. |
| `grant_accepted` | Authenticated user accepted code and persistent grant was created. |
| `grant_active` | Grant can authorize scoped actions. |
| `grant_capabilities_changed` | Owner changed capabilities for an existing grant. |
| `grant_revoked` | Owner revoked accepted grant. |

Code lifecycle and grant lifecycle are related but separate.

## 15. Revocation Rules

- owner can revoke unused codes;
- owner can revoke accepted grants;
- revoked code cannot be accepted;
- revoked grant denies future access;
- revocation does not delete audit history;
- revocation does not erase historical actor attribution;
- revocation does not mutate documents, package snapshots, registry results or artifacts created while grant was active.

System admin may have separate emergency/admin revocation tools, but those are not normal collaboration features.

## 16. Expiration And Rotation Rules

Expiration:

- every code should have expiration policy;
- expired code cannot create a new grant;
- expiration does not automatically revoke existing accepted grants unless explicit code policy says so before issuance.

Rotation:

- owner can regenerate/rotate code;
- previous code stops accepting new users;
- existing grants stay active by default;
- owner may revoke individual grants separately;
- bulk revoke on rotation is deferred unless explicitly designed.

## 17. Audit Requirements

Audit must record:

- share code creation;
- code capability set at creation;
- code expiration and rotation;
- code revocation;
- failed acceptance where security policy requires;
- grant acceptance with actor, owner, target resource and capabilities;
- grant capability change;
- grant revocation;
- use of write capabilities;
- package build/export through a grant;
- certificate add/edit/archive/replace through a grant;
- system admin access through separate admin path.

Audit must distinguish owner, grantee and system admin actions.

## 18. Security Requirements

- default deny when capability missing;
- no raw permanent tokens stored;
- token/reference stored hashed or otherwise safe;
- no secrets in URLs if avoidable;
- all access checks resource-scoped;
- share grants are not global permissions;
- queries require view capability;
- commands require owner status or explicit capability;
- no generic CRUD access;
- direct object/document/certificate IDs cannot bypass scope checks;
- revocation must affect session/cache behavior;
- authorization failures must not reveal unrelated resource existence.

## 19. No Cross-Workspace Leakage

Workspace isolation remains mandatory.

- workspace grant applies only to target owner workspace/project database;
- certificate library grant applies only to target certificate library;
- access to one owner resource does not reveal other owner resources;
- grantee's workspace remains isolated from owner's workspace;
- shared certificate use preserves provenance without copying source item into grantee ownership;
- search, registry, package builder, AI/OCR context and exports filter by owner/grant scope;
- cross-workspace links require explicit grant-supported relation and provenance rule.

## 20. Interaction With Evidence / Certificates

Sharing does not weaken evidence rules:

- certificate number without physical file remains `ERROR`;
- certificate library item remains file-backed evidence;
- OCR/AI metadata remains proposal until confirmed;
- certificate expiry validation remains date-relative to document date;
- replacing evidence files used historically cannot silently rewrite released documents or package snapshots;
- using shared certificate preserves source owner, source library reference and certificate provenance;
- future copy/export of shared certificates requires explicit ownership, retention and provenance policy.

## 21. Interaction With AOSR And Typed Documents

- `view_documents` permits reading/previews according to scope;
- `create_documents` permits only approved typed documents, not generic documents;
- `edit_documents` works through document rules, validation and locks;
- final/released document changes create revisions;
- grants cannot change `DocumentType`;
- grants cannot use missing certificate numbers as satisfied evidence;
- grants cannot bypass AOSR participant, project reference, material usage or validation rules.

## 22. Interaction With Registry And Packages

- registry remains derived projection;
- grant cannot hide registry/domain errors;
- source fields displayed in registry change only through owner aggregate commands and required capabilities;
- package build remains async and snapshot-based;
- `build_packages` can trigger build/rebuild but cannot mutate source documents/evidence outside other capabilities;
- grants cannot mutate `PackageSnapshot`;
- package exports require `export_generated_artifacts`;
- package snapshot provenance must show actor and whether action was owner or grantee.

## 23. Interaction With AI/OCR

- AI/OCR remains assistant-only;
- grant may allow viewing project sources, OCR proposals or AI findings only when view scope and privacy policy allow it;
- accepting AI/OCR proposals requires capability to change target owner aggregate;
- AI/OCR cannot use grant context to read unrelated workspaces/libraries;
- AI/OCR cannot auto-approve extracted metadata, document content, links or findings;
- audit preserves source citation, actor and grant context.

## 24. UI/UX Requirements

Workspace UI:

- button label: `Совместная работа`;
- owner sees share code/link and capability toggles;
- default toggles communicate view-only state;
- User 2 enters code to connect;
- UI clearly shows whose workspace is connected;
- UI clearly shows current access level and whether user can edit or only view;
- owner can see grants and revoke access.

Certificate library UI:

- separate share/connect flow from workspace collaboration;
- UI clearly shows whose certificate library is connected;
- UI shows whether user can only view/use or can add/edit/archive/replace;
- document editor shows when certificate comes from shared library and preserves provenance.

UI must not imply that certificate library sharing grants workspace access, or that workspace sharing grants unrelated library access.

## 25. Backend/API Implications

- replace role matrix with explicit capability checks;
- commands check owner or grant capability;
- queries enforce view capability;
- no generic CRUD access;
- share grants are not global permissions;
- system admin path is separate;
- access decisions include resource type, owner id, target id and required capability;
- write commands run domain validation after authorization;
- authorization cannot bypass revision, snapshot, evidence, registry or AI/OCR guardrails;
- effective capabilities may be exposed to UI without exposing secret token material.

This document does not create endpoints.

## 26. Database Implications

Conceptual entities to account for later:

- `User`;
- `SystemAdmin` marker/config;
- `OwnedWorkspace`;
- `WorkspaceShareCode`;
- `WorkspaceShareGrant`;
- `CertificateLibrary`;
- `CertificateLibraryShareCode`;
- `CertificateLibraryShareGrant`;
- `GrantCapability`;
- `GrantAuditEvent`.

Important:

- do not write Prisma schema yet;
- do not add migrations yet;
- physical persistence, indexes, constraints and token hashing details belong to a later database/API amendment;
- accepted grants and code records must support auditability, revocation, expiration and capability changes.

## 27. Deferred Features

- fine-grained RBAC;
- `Foreman` role;
- `Owner/Admin/PTO Engineer/Viewer` role matrix;
- multi-admin platform governance;
- multi-owner workspace governance;
- organization membership administration;
- object/folder/team assignment policies;
- external reviewer/customer roles;
- delegated grant administration by non-owner users;
- SSO/directory provisioning;
- bulk rotate-and-revoke policy;
- certificate copy/export between owners;
- enterprise audit dashboards and legal hold;
- commercial entitlement/seat governance beyond access checks.

## 28. Migration From Previous RBAC Assumptions

- `docs/10-auth-workspace-rbac-model.md` is superseded for MVP implementation scope by this document;
- previous membership/RBAC role matrix is deferred;
- `Foreman` is not in MVP;
- workspace `Owner/Admin/PTO Engineer/Viewer` role matrix is not implemented for MVP;
- invite stored authorization state concept remains, simplified into share code plus capability grant model;
- workspace isolation remains accepted;
- audit and revocation remain required;
- source-of-truth, evidence, registry, package and AI/OCR decisions are unchanged.

Implementation-scope documents, including `docs/16-mvp-scope-and-first-forms-v1.md` and `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`, must reference this document for MVP access model instead of the superseded RBAC matrix.

## 29. Open Questions

- Should MVP share codes be single-use, multi-use or configurable?
- What default expiration should workspace collaboration codes use?
- What default expiration should certificate library codes use?
- Should owner update capabilities on existing grants, or revoke/reissue?
- Which certificate metadata/files are visible under `view_certificate_library` if privacy tightens?
- Does default certificate library sharing include `use_certificates_in_documents`, or should view-only and use be separate presets?
- Which write-capability uses require owner notification?
- What exact session/cache invalidation mechanism enforces revocation?
- What is the system admin audit retention and support-access policy?

These questions must be answered before code/schema/API implementation, but they do not restore complex RBAC for MVP.

## 30. Acceptance Criteria

- complex RBAC is removed from MVP access scope;
- global system admin is separate from owner/user sharing;
- regular users own their workspaces/project data and certificate libraries;
- workspace collaboration and certificate library sharing are separate flows;
- default access is view-only or view/use-only as specified;
- capabilities replace roles for share grants;
- share codes are opaque, non-guessable and safely stored;
- accepted code creates persistent resource-scoped grant;
- owner can revoke grants and rotate/regenerate codes;
- rotation behavior for existing grants is explicit;
- workspace isolation and no cross-workspace leakage are preserved;
- audit covers grant lifecycle and write-capability use;
- evidence/certificate file invariant remains;
- source-of-truth, typed documents, registry projection, package snapshots and AI/OCR assistant-only decisions remain unchanged;
- no Prisma schema, migrations, routes, auth implementation or business implementation are introduced by this architecture amendment.
