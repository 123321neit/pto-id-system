# 20. Auth Sharing Implementation Plan V1

# PTO ID System

# Safe phased plan for owner-based identity and sharing implementation

Status: implementation planning document only.

Date fixed: 2026-05-30.

Source of authority: `docs/19-sharing-and-access-model-v1.md`, `docs/10-auth-workspace-rbac-model.md`, `docs/12-database-schema-v1.md`, `docs/14-backend-api-architecture-v1.md`, `docs/15-api-command-readmodel-contracts-v1.md`, `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`, `apps/api/src/ARCHITECTURE.md`, and canonical ADR 0001-0007.

This document is not code, not a Prisma schema, not a migration plan to apply immediately, not an API route list, and not authorization to implement auth or sharing in this task.

---

## 1. Purpose

This document turns the owner-based sharing architecture from `docs/19-sharing-and-access-model-v1.md` into a safe phased implementation plan.

The goal is to make the future coding sequence explicit before any auth, database, Prisma model, API route, frontend screen or sharing behavior is added. The plan protects:

- workspace isolation;
- owner-based access;
- capability grants instead of complex RBAC;
- token/code safety;
- auditability;
- revocation and rotation;
- existing scaffold guardrails.

The plan also states what must not be implemented in each phase, so the first access work does not accidentally become enterprise RBAC, organization governance, generic CRUD or cross-workspace data sharing.

## 2. Current Baseline

Current repository baseline:

- first infrastructure/bootstrap scaffold is accepted;
- backend is a NestJS modular monolith skeleton;
- frontend is a React/Vite technical shell;
- technical `/health` is the only approved backend endpoint;
- Prisma exists only as infrastructure generation wiring with an empty schema;
- object storage exists only as infrastructure health/config boundary;
- no domain Prisma models exist;
- no migrations exist;
- no auth/session implementation exists;
- no sharing implementation exists;
- no business API routes exist;
- no AOSR, certificate, package, upload, generation or AI implementation exists.

Architecture baseline:

- `docs/19-sharing-and-access-model-v1.md` supersedes `docs/10-auth-workspace-rbac-model.md` for MVP implementation scope.
- MVP access uses owner-based resources, opaque share codes and explicit grant capabilities.
- The old `Owner/Admin/PTO Engineer/Foreman/Viewer` role matrix is deferred.
- Workspace isolation, no cross-workspace leakage, audit, revocation, source-of-truth, typed document, evidence, registry, package snapshot and AI proposal-only rules remain mandatory.
- `apps/api/src/ARCHITECTURE.md` keeps `workspace` as the owner of access/isolation contracts and forbids bounded modules from importing infrastructure directly.

## 3. Implementation Goals

The future implementation must proceed in small slices:

1. Establish authenticated user identity without business access shortcuts.
2. Mark exactly one global system admin through a separate operational path.
3. Create owned workspace baseline without collaboration.
4. Add workspace share-code issuance without accepted grants.
5. Add workspace share grants and capability checks.
6. Add certificate library share-code issuance as a separate flow.
7. Add certificate library share grants and certificate provenance checks.

Each phase must be shippable only when tests prove that:

- owner access works;
- missing capability denies;
- revoked access denies;
- unrelated resource ids do not leak existence;
- client-supplied role or capability values are ignored;
- no old RBAC role matrix is reintroduced.

## 4. Explicit Non-Goals

This plan does not authorize:

- code changes in this task;
- Prisma schema changes in this task;
- migrations in this task;
- API routes in this task;
- auth/session implementation in this task;
- sharing implementation in this task;
- certificate library implementation in this task;
- OpenAPI generation;
- generic CRUD endpoints;
- organization membership governance;
- `Foreman` behavior;
- `Owner/Admin/PTO Engineer/Viewer` role matrix;
- fine-grained object/team RBAC;
- SSO or directory provisioning;
- billing, entitlement or seat governance;
- multi-admin platform governance;
- multi-owner workspace governance;
- public unauthenticated share links;
- cross-workspace copy/export of source data;
- storage/download behavior for real files;
- support access to sensitive tenant data without separate policy.

## 5. Phase 1: User Identity Skeleton

Purpose: introduce the minimum authenticated natural-person identity needed for later owner-based access.

What appears later in implementation:

- `User` or equivalent account identity concept;
- server-side current actor resolution;
- account lifecycle states required by future auth policy;
- user-facing identity needed for audit attribution;
- no business permissions on the `User` record itself.

Required behavior:

- authentication establishes actor identity only;
- user identity does not grant access to any workspace, document, certificate library or file;
- server resolves actor identity from trusted session/auth context, never from request body;
- disabled or unavailable account state fails closed;
- audit-capable actor identity is available for later commands.

Not in this phase:

- no share codes;
- no grants;
- no owned workspace mutation beyond what Phase 3 explicitly adds;
- no certificate library access;
- no RBAC roles;
- no system admin data access path beyond Phase 2 marker planning;
- no domain routes outside the authorized slice.

Access checks needed:

- every future protected command/query must require a resolved authenticated actor;
- unauthenticated requests fail before resource lookup;
- authenticated actor alone is insufficient for business resource access.

Tests needed:

- current actor is resolved from server-side auth/session context;
- client-supplied `user_id`, role or capability is ignored;
- unauthenticated access cannot learn whether a workspace or certificate library exists;
- disabled account cannot create owner resources or accept codes.

Exit criteria:

- identity skeleton is usable for audit attribution and later owner checks;
- no workspace sharing behavior exists yet;
- no RBAC role vocabulary is implemented as access authority.

## 6. Phase 2: Global System Admin Marker

Purpose: add a separate operational admin marker without turning admin into a business collaborator or owner.

What appears later in implementation:

- deployment/config controlled global admin identity marker;
- exactly one expected system admin for MVP;
- separate admin-path capability checks;
- separate audit category for system admin actions.

Required behavior:

- system admin identity is not a workspace owner;
- system admin does not receive share grants;
- system admin does not create normal collaboration access through hidden role bypass;
- admin path is visibly separate in code, routes and audit;
- admin support access to tenant content remains blocked unless a later privacy/support policy explicitly allows it.

Not in this phase:

- no multi-admin governance;
- no admin role table;
- no organization admin;
- no business data browsing shortcut;
- no ability to bypass owner/grant checks in normal user flows.

Access checks needed:

- normal workspace/certificate commands ignore system admin marker unless they are explicitly admin-path commands;
- admin-path commands require admin marker and audit reason where policy requires it;
- admin failures must not leak tenant resource existence.

Tests needed:

- regular owner checks do not pass merely because a user id is supplied;
- system admin marker does not create workspace ownership;
- admin path is audited separately;
- non-admin user cannot call admin-only paths.

Exit criteria:

- exactly-one-admin assumption is represented safely;
- admin access cannot masquerade as grant, membership or resource ownership.

## 7. Phase 3: Owned Workspace Baseline

Purpose: establish regular-user owned workspace/project database access without collaboration.

What appears later in implementation:

- `OwnedWorkspace` or equivalent owner-scoped workspace concept;
- owner user id as business access authority for the owned workspace;
- automatic first owned workspace creation if the accepted auth policy requires it;
- workspace switch/read model for owned workspaces only.

Required behavior:

- owner can access own workspace;
- non-owner cannot access the workspace;
- workspace-scoped objects/documents/evidence remain under one owner workspace;
- every workspace query starts from owner/effective-access scope;
- direct guessed ids produce `NOT_FOUND_OR_NOT_AUTHORIZED`;
- old `Membership` role matrix is not used.

Not in this phase:

- no workspace share codes;
- no accepted grants;
- no certificate library sharing;
- no organization workspace membership;
- no role matrix;
- no cross-workspace search;
- no real AOSR/certificate/package domain implementation unless separately authorized.

Access checks needed:

- `isWorkspaceOwner(actor, workspace)` for owner-only baseline commands/queries;
- all child resource lookups must verify the same workspace owner scope before returning data;
- object/document/folder ids must not be resolved before workspace ownership is verified.

Tests needed:

- owner can list/open own workspace;
- user B receives leakage-safe denial for user A workspace;
- guessed document/object/folder ids under another workspace do not disclose existence;
- no code path checks old roles for authorization.

Exit criteria:

- owned workspace access is stable and isolated;
- collaboration remains absent.

## 8. Phase 4: Workspace Share Codes

Purpose: let an owner create, inspect, revoke and rotate workspace share codes without granting access yet.

What appears later in implementation:

- `WorkspaceShareCode`;
- code capability set snapshot;
- hashed token/verifier or safe token reference;
- expiration state;
- revocation state;
- rotation state;
- owner-facing code management read model.

Required behavior:

- only workspace owner can create a code for that workspace;
- code contains no trusted role, capability or owner claims in the URL/client-visible material;
- raw token is never stored permanently;
- default capability posture is view-only;
- selected capabilities must be a whitelist from `docs/19`;
- code lookup must be rate-limited or otherwise abuse-aware in later transport design;
- code lifecycle is audited.

Not in this phase:

- no accepting codes;
- no persistent grants;
- no grantee access;
- no public unauthenticated workspace views;
- no role matrix;
- no certificate library codes.

Access checks needed:

- owner-only for code creation, rotation, revocation and code list;
- code operations must verify target workspace owner before mutation;
- revoked or expired codes cannot be shown as active.

Tests needed:

- non-owner cannot create code for another workspace;
- token is stored only as verifier/hash/reference;
- capability set cannot include unknown capability or old RBAC role;
- rotation invalidates future acceptance of old code in code state;
- code revocation is audited and idempotent where applicable.

Exit criteria:

- codes are safe to create but cannot yet grant access.

## 9. Phase 5: Workspace Share Grants

Purpose: allow authenticated users to accept valid workspace share codes and receive resource-scoped capabilities.

What appears later in implementation:

- `WorkspaceShareGrant`;
- grant capability version/snapshot;
- grant lifecycle status;
- grant acceptance audit event;
- owner grant roster;
- effective access read model for connected workspaces.

Required behavior:

- only authenticated users can accept codes;
- acceptance validates code, expiry, revocation, target scope and usage policy;
- accepted code creates persistent grant scoped to one workspace;
- grant does not copy ownership;
- grant does not expose other owner resources;
- missing capability denies by default;
- owner can revoke grant;
- owner can update capabilities only if policy explicitly allows it; otherwise revoke/reissue;
- all write-capability use is audited.

Workspace capabilities from `docs/19`:

- `view_workspace`;
- `view_folder_tree`;
- `view_signatories`;
- `view_documents`;
- `edit_documents`;
- `create_documents`;
- `edit_signatories`;
- `edit_folder_tree`;
- `build_packages`;
- `export_generated_artifacts`.

Not in this phase:

- no certificate library sharing;
- no delegated grant administration by grantee;
- no group grants;
- no organization roles;
- no object/team RBAC;
- no cross-workspace copy/export.

Access checks needed:

- queries require the relevant view capability;
- commands require the exact write capability plus normal domain validation;
- `build_packages` cannot mutate source documents or evidence unless other capabilities permit those source commands;
- `export_generated_artifacts` cannot bypass artifact/file privacy policy;
- all child ids must be verified inside the grant target workspace.

Tests needed:

- grantee with `view_documents` cannot edit documents;
- grantee with `edit_documents` still cannot edit final history in place;
- grantee with `build_packages` cannot mutate package snapshots;
- revoked grant denies immediately after cache/session refresh boundary;
- grantee cannot see owner unrelated workspace;
- owner can revoke grant without deleting audit attribution;
- code rotation does not revoke existing grant by default.

Exit criteria:

- workspace collaboration works only through explicit resource-scoped capabilities.

## 10. Phase 6: Certificate Library Share Codes

Purpose: add certificate library code issuance as a separate owner flow after workspace grant checks are proven.

What appears later in implementation:

- `CertificateLibrary`;
- `CertificateLibraryShareCode`;
- library code capability set;
- expiration/revocation/rotation state;
- owner-facing certificate library code management read model.

Required behavior:

- certificate library share code is separate from workspace share code;
- library code never grants workspace access;
- owner selects library capabilities from the certificate capability whitelist;
- default posture is view/use only when ratified;
- token safety rules match workspace share codes;
- code lifecycle is audited.

Certificate library capabilities from `docs/19`:

- `view_certificate_library`;
- `use_certificates_in_documents`;
- `add_certificates`;
- `edit_certificate_cards`;
- `archive_certificates`;
- `replace_certificate_files`.

Not in this phase:

- no accepting library codes;
- no grantee library use;
- no certificate copy/export between owners;
- no workspace access through library code;
- no evidence file upload/download behavior unless separately authorized.

Access checks needed:

- owner-only for code creation, rotation, revocation and code list;
- library code operations verify owner library scope first;
- unknown capability or workspace capability cannot be added to library code.

Tests needed:

- workspace code cannot be used as library code;
- non-owner cannot create library code;
- token is stored safely;
- unknown capability is rejected;
- revoke and rotate are audited.

Exit criteria:

- certificate library codes can be managed without granting access yet.

## 11. Phase 7: Certificate Library Share Grants

Purpose: let authenticated users accept certificate library share codes and use shared certificates without weakening evidence provenance.

What appears later in implementation:

- `CertificateLibraryShareGrant`;
- grant capability version/snapshot;
- library grant roster;
- connected library read model;
- shared-certificate provenance link for document use.

Required behavior:

- accepted library code creates grant scoped to one certificate library;
- grant does not open the owner's workspace;
- `view_certificate_library` controls metadata visibility;
- `use_certificates_in_documents` allows linking shared certificate evidence into grantee-owned documents only with provenance;
- add/edit/archive/replace require explicit capabilities and normal evidence rules;
- shared certificate owner/library reference is preserved;
- historical document revisions and package snapshots are not rewritten by certificate changes.

Not in this phase:

- no copying certificate ownership;
- no certificate export between owners;
- no library grant that implicitly opens workspace documents;
- no replacing file-backed evidence through generic upload shortcuts;
- no privacy-sensitive original download rule unless separately approved.

Access checks needed:

- library queries require `view_certificate_library`;
- document linking requires `use_certificates_in_documents` and document owner access;
- file replacement requires `replace_certificate_files` plus evidence supersession rules;
- archive requires `archive_certificates` and must preserve historical provenance.

Tests needed:

- library grant does not reveal owner workspace;
- view-only library grantee cannot link certificate unless use capability is present;
- shared certificate use preserves source owner/library provenance;
- archive/replace cannot break released documents or package snapshots;
- revoked library grant denies future view/use;
- workspace grant cannot be used as certificate library grant.

Exit criteria:

- certificate library sharing is separate, provenance-safe and capability-scoped.

## 12. Capability Check Strategy

Capability checks must be explicit and resource-scoped.

Decision inputs:

- authenticated actor;
- resource type;
- target resource id;
- owner user id;
- required capability;
- system admin path flag when explicitly used;
- command/query kind;
- object/workspace child scope when applicable.

Access order:

1. Resolve authenticated actor.
2. Reject if account is disabled or not eligible.
3. Resolve target only through owner/effective-access scope.
4. Allow owner for owner-owned resource actions.
5. Allow explicit system admin path only for admin commands and audit separately.
6. Otherwise require active grant on the exact resource with the exact capability.
7. Deny missing capability by default.
8. Run domain validation after authorization.

Rules:

- capabilities are not roles;
- capabilities are not accepted from client as authority;
- capabilities cannot be inferred from UI state;
- grant capability sets must be versioned or audited;
- read models may expose effective capabilities for UI affordances, but not token secret material;
- every denial that could reveal another owner resource uses leakage-safe response semantics.

## 13. Audit Strategy

Audit must be designed before write access is enabled.

Audit events needed later:

- user registration or first identity establishment;
- owned workspace creation;
- system admin path action;
- workspace share code creation;
- workspace code rotation;
- workspace code revocation;
- workspace code failed acceptance where security policy requires it;
- workspace grant acceptance;
- workspace grant capability change;
- workspace grant revocation;
- workspace write-capability use;
- package build/export through grant;
- certificate library code creation/rotation/revocation;
- certificate library grant acceptance/capability change/revocation;
- certificate add/edit/archive/replace through grant;
- shared certificate use in a document.

Audit records must distinguish:

- owner action;
- grantee action;
- system admin action;
- target resource type;
- target owner;
- effective capability;
- command id or correlation id;
- safe failure reason when recorded.

Audit records are historical. Revoking access must not delete actor attribution.

## 14. Token/Code Safety

Share codes are entry mechanisms, not permission payloads.

Requirements:

- codes are opaque and non-guessable;
- raw permanent tokens are not stored;
- verifier/hash/reference is stored instead;
- token material is not logged;
- token material is not returned after initial display unless a future policy explicitly allows safe re-display;
- no role/capability claims in URL are trusted;
- no secrets in URLs if avoidable;
- code acceptance requires authenticated user;
- code lookup must be designed for rate limiting and abuse resistance;
- expired or revoked code cannot create grants;
- code id and token secret must be separable where possible;
- transport errors must not reveal owner resource existence.

Open policy before implementation:

- single-use versus multi-use;
- default expiration;
- usage limit;
- whether codes are copied as short codes, links or both;
- whether code display is one-time only;
- owner notification on acceptance.

## 15. Revocation And Rotation Strategy

Code lifecycle and grant lifecycle are separate.

Code revocation:

- prevents future acceptance;
- does not revoke existing accepted grants;
- is owner-only unless system admin path has separate policy;
- is audited.

Code rotation:

- creates a new acceptability secret/reference;
- invalidates future acceptance of old code;
- does not revoke existing grants by default;
- must not silently change existing grant capabilities;
- is audited.

Grant revocation:

- denies future access through that grant;
- preserves audit history;
- does not mutate documents, certificates, registry results, package snapshots or artifacts created while active;
- must invalidate relevant session/cache/effective-capability reads.

Capability changes:

- are deferred unless explicitly implemented with versioning and audit;
- owner may revoke/reissue instead of editing grants;
- any implemented capability change must fail closed for active sessions until effective capabilities refresh.

## 16. API Command/Query Plan

This section lists future conceptual commands and queries only. It does not define routes, DTOs, OpenAPI or implementation.

Phase 1 candidates:

- `get_current_account`;
- `complete_account_identity`;
- `disable_account` only after separate policy.

Phase 2 candidates:

- `get_admin_status` for admin path only;
- `perform_admin_access_action` only after support/privacy policy.

Phase 3 candidates:

- `create_owned_workspace`;
- `get_owned_workspace_switcher`;
- `get_owned_workspace_summary`;
- `archive_owned_workspace` only after lifecycle policy.

Phase 4 candidates:

- `create_workspace_share_code`;
- `list_workspace_share_codes`;
- `revoke_workspace_share_code`;
- `rotate_workspace_share_code`;
- `preview_workspace_share_code_capabilities`.

Phase 5 candidates:

- `accept_workspace_share_code`;
- `list_workspace_share_grants`;
- `get_connected_workspace_switcher`;
- `get_effective_workspace_capabilities`;
- `revoke_workspace_share_grant`;
- `update_workspace_grant_capabilities` only if policy permits.

Phase 6 candidates:

- `create_certificate_library_share_code`;
- `list_certificate_library_share_codes`;
- `revoke_certificate_library_share_code`;
- `rotate_certificate_library_share_code`;
- `preview_certificate_library_share_code_capabilities`.

Phase 7 candidates:

- `accept_certificate_library_share_code`;
- `list_certificate_library_share_grants`;
- `get_connected_certificate_libraries`;
- `get_effective_certificate_library_capabilities`;
- `revoke_certificate_library_share_grant`;
- `use_shared_certificate_in_document`;
- `update_certificate_library_grant_capabilities` only if policy permits.

Every command/query must keep the common contract rules from `docs/15`: server-side authority, expected versions for mutable targets, idempotency for dangerous commands, leakage-safe errors and audit references where applicable.

## 17. Database/Prisma Plan

No Prisma schema changes are made by this document.

Future database work must be a separate task, preceded by a narrow database/API amendment if needed. It must not introduce all entities at once.

Later conceptual entities by phase:

| Phase | Later conceptual entities |
| --- | --- |
| Phase 1 | `User` or account identity record. |
| Phase 2 | Config-backed `SystemAdmin` marker, or audited admin marker record only if policy requires persistence. |
| Phase 3 | `OwnedWorkspace` or owner-scoped workspace record. |
| Phase 4 | `WorkspaceShareCode`, code capability snapshot, code audit relation. |
| Phase 5 | `WorkspaceShareGrant`, grant capability snapshot/version, grant audit relation. |
| Phase 6 | `CertificateLibrary`, `CertificateLibraryShareCode`, library code capability snapshot. |
| Phase 7 | `CertificateLibraryShareGrant`, shared certificate provenance relation, grant audit relation. |
| Cross-cutting | `GrantCapability`, `GrantAuditEvent` or equivalent audit/activity records. |

Database constraints needed later:

- owner id required on owner resources;
- resource type and target id required for share codes/grants;
- token verifier/hash uniqueness;
- active grant uniqueness according to accepted policy;
- expiration/revocation state;
- capability whitelist validation;
- audit attribution to actor and target owner;
- tenant/resource scope columns that make safe access paths natural.

Forbidden database shortcuts:

- no old `Membership` role matrix for MVP access;
- no user-global role as business authority;
- no raw token storage;
- no workspace ids hidden only in JSON;
- no generic permission table that silently becomes RBAC;
- no cross-resource grant that opens all owner resources;
- no business access logic inside Prisma schema comments instead of application checks.

## 18. Frontend Plan

No frontend implementation is added by this document.

Later UI sequence:

1. Current account shell.
2. Owned workspace switcher.
3. System admin path indicator only if admin policy permits.
4. Owner workspace sharing panel labeled `Совместная работа`.
5. Workspace code display with capability toggles defaulting to view-only.
6. Code acceptance screen for authenticated user.
7. Connected workspace marker showing owner and effective capabilities.
8. Owner grant roster with revoke and optional capability management.
9. Separate certificate library sharing panel.
10. Connected certificate library marker and provenance display in document editor.

Frontend guardrails:

- UI toggles are not authority;
- hidden buttons are not authorization;
- connected workspace must be visibly owned by another user;
- certificate library connection must not look like workspace access;
- code secrets must not be persisted in client logs/local storage;
- effective capabilities may control affordances, but backend denial remains authoritative.

## 19. Testing Plan

Tests must be added with each future implementation phase.

Phase 1 tests:

- authenticated actor resolution;
- unauthenticated denial before resource lookup;
- client-supplied identity ignored;
- disabled account fail-closed behavior.

Phase 2 tests:

- exactly one configured system admin marker;
- normal owner/grant checks do not pass through admin marker;
- admin path audit separation;
- non-admin denial.

Phase 3 tests:

- owner can access own workspace;
- non-owner receives `NOT_FOUND_OR_NOT_AUTHORIZED`;
- child id lookup cannot bypass workspace ownership;
- no role matrix authorization path exists.

Phase 4 tests:

- owner-only code creation;
- token verifier/hash storage;
- capability whitelist;
- expiration, revocation and rotation state;
- no access grant is created.

Phase 5 tests:

- authenticated code acceptance;
- expired/revoked code denial;
- grant-scoped view and write checks;
- missing capability denial;
- revoked grant denial;
- rotation does not revoke existing grants by default;
- no cross-workspace search/count/error leakage.

Phase 6 tests:

- library owner-only code creation;
- workspace codes rejected in library flow;
- library capability whitelist;
- token safety parity with workspace codes.

Phase 7 tests:

- library grant does not open workspace;
- `use_certificates_in_documents` required for linking;
- shared certificate provenance preserved;
- archive/replace respects evidence rules;
- revoked library grant denial.

Cross-cutting tests:

- audit event creation for lifecycle and write-capability use;
- idempotency for code acceptance and dangerous commands;
- expected-version conflict for mutable code/grant changes;
- cache/session invalidation after revocation;
- static checks that no old RBAC role matrix is used for MVP access;
- regression tests for no Prisma models/routes being added in documentation-only tasks.

## 20. Forbidden Shortcuts

The following shortcuts are forbidden:

- implementing complex RBAC for MVP;
- implementing `Foreman` permissions;
- implementing `Owner/Admin/PTO Engineer/Viewer` role checks;
- treating `User` as owner of every resource they can see;
- trusting client-supplied capabilities;
- storing raw share tokens;
- putting trusted role/capability data in URLs;
- accepting codes without authenticated user;
- using share code existence errors to reveal resources;
- making certificate library sharing grant workspace access;
- making workspace sharing grant unrelated certificate library access;
- making `build_packages` imply document/evidence edit authority;
- allowing grant checks to bypass domain validation;
- writing generic CRUD endpoints for share records;
- adding all access entities in one large migration;
- adding Prisma models without a separate database task;
- adding OpenAPI/routes before command contracts are explicitly scoped;
- adding support/admin tenant data browsing without privacy/audit policy;
- revoking access by deleting audit history;
- silently copying shared certificates into grantee ownership.

## 21. Acceptance Criteria

This planning document is accepted when it establishes:

- Phase 1 starts with user identity skeleton only;
- global system admin marker is separate from business sharing;
- owned workspace baseline precedes share codes;
- share codes precede accepted grants;
- workspace sharing and certificate library sharing are separate phases;
- future Prisma entities are named conceptually but not implemented;
- future API commands/queries are named conceptually but not implemented;
- access checks are owner/grant/capability based;
- default deny and leakage-safe denial are mandatory;
- audit events are planned before write sharing;
- token/code safety rules are explicit;
- revocation and rotation semantics are explicit;
- frontend work is deferred and authority remains backend-side;
- tests are listed for each phase;
- workspace isolation remains mandatory;
- complex RBAC is not reintroduced;
- no code, schema, migration, route, auth or sharing implementation is added by this document.

## 22. Next Coding Step Recommendation

The next coding step should be a separate, narrow Phase 1 task:

```text
Implement User Identity Skeleton only.
```

That task should explicitly allow only the minimum files needed for authenticated actor resolution and tests. It must not add share codes, grants, certificate library sharing, old RBAC roles, business domain routes, Prisma domain models or migrations unless the task separately authorizes the exact database/API scope.

Before Phase 1 coding begins, the task should restate:

- what auth/session mechanism is allowed for the skeleton;
- whether database persistence is allowed or still deferred;
- what tests prove no business access is granted by identity alone;
- how the skeleton remains compatible with `docs/19` and this plan.
