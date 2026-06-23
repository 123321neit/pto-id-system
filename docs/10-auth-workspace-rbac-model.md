# 10. Auth, Workspace and RBAC Model

# PTO ID System

# Архитектурная модель пользователей, рабочих пространств, приглашений, членства и ролей

Статус: draft access and tenant-boundary specification for review before Database Schema V1.

Дата фиксации: 2026-05-26.

Источник архитектурных принципов: `docs/PROJECT_MEMORY.md`.

Основание модели: `docs/06-data-model-v1.md`, `docs/08-document-types-catalog.md`, `docs/09-aggregate-boundaries-and-invariants.md`, ADR 0001-0005.

Supersession note, 2026-05-29:

```text
docs/19-sharing-and-access-model-v1.md supersedes this document for MVP implementation scope.
```

The role matrix and membership/RBAC governance described here are deferred. MVP access must use owner-based workspace/certificate-library sharing, opaque share codes and capability-based grants from `docs/19-sharing-and-access-model-v1.md`. Tenant/workspace isolation, invite-token safety, auditability and revocation principles from this document remain useful background where they do not conflict with `docs/19`.

---

## 1. Purpose

Этот документ определяет access model PTO ID System до проектирования физической базы данных. Он отвечает, кто является пользователем SaaS-продукта, в какой изолированной области пользователь работает с исполнительной документацией и почему право выполнить действие зависит от членства в конкретном workspace, а не от глобального свойства аккаунта.

Документ фиксирует:

- модель физического лица, создающего аккаунт;
- автоматическое создание личного рабочего пространства;
- модель совместной работы организаций;
- приглашения и вступление в организационный workspace;
- membership-owned role and permission baseline;
- tenant isolation, audit and security constraints;
- коммерчески жизнеспособную основу для индивидуальных и командных тарифов.

Спецификация намеренно не содержит кода, SQL, таблиц, API, endpoint design, выбора стека, миграций, инфраструктуры, frontend implementation или billing implementation.

### 1.1 Relationship to prior documents

Предыдущие документы используют термин `TenantContext` как обязательную границу изоляции, но оставляют authentication and RBAC design открытыми. В настоящей спецификации эта граница конкретизируется:

```text
Workspace = tenant boundary for business data and workspace-scoped authorization
```

`Personal Workspace` и `Organization Workspace` являются двумя видами одного tenant boundary. Это уточняет access domain; оно не изменяет принципы structured data, typed documents, registry projection, snapshots, template versioning или package builds.

### 1.2 Decision status

Документ разделяет:

- **Inherited rule** - уже принятое правило, например обязательная tenant isolation.
- **Access baseline** - предлагаемое решение настоящей спецификации, которое должно быть подтверждено до Database Schema V1.
- **Open question** - политика, которую нельзя молча решить схемой хранения или реализацией.

Обязательные исходные предпосылки для access baseline заданы владельцем проекта:

1. Пользователь регистрируется как физическое лицо.
2. После регистрации автоматически создаётся `Personal Workspace`.
3. Пользователь становится `Owner` своего `Personal Workspace`.
4. Пользователь может одновременно состоять в нескольких `Organization Workspace`.
5. Вступление в `Organization Workspace` осуществляется через приглашения.
6. Права принадлежат `Membership`, а не `User` напрямую.
7. Ссылка-приглашение не содержит прав; роль и ограничения определяются сохранённым `Invite` и итоговым `Membership`.
8. Tenant isolation обязательна.

---

## 2. Design Goals

Модель должна обеспечить:

- полноценную работу одиночного инженера ПТО сразу после регистрации;
- совместную работу команды без смешивания данных разных организаций;
- один пользовательский аккаунт для нескольких рабочих пространств;
- понятное управление доступом без глобальных ролей, случайно открывающих чужие документы;
- безопасное приглашение коллег с контролируемой ролью и сроком действия;
- защиту оригиналов сертификатов, схем, персональных данных и historical outputs;
- возможность последующих коммерческих тарифов без переделки domain ownership;
- достаточную определённость access boundaries перед физическим проектированием.

Модель не должна:

- превращать `User` в владельца всех данных, которые он когда-либо видел;
- смешивать личные и организационные объекты в один tenant;
- превращать legal company/profile data документации в систему доступа;
- давать ссылке приглашения самостоятельную authority beyond stored invite;
- подменять domain access choices удобством будущей реализации.

---

## 3. Multi-Tenant Principles

### 3.1 Workspace as tenant boundary

Каждый объект, документ, сертификат, исполнительная схема, шаблон workspace scope, реестр, комплект, snapshot и generated artifact принадлежит ровно одному `Workspace` / tenant context, если отдельная будущая политика явно не установит иной строго контролируемый сценарий.

`Workspace` отвечает за:

- границу видимости domain data;
- membership and authorization context;
- владение workspace-scoped libraries and configuration;
- будущий commercial entitlement context without defining billing implementation.

### 3.2 Identity is not tenant ownership

`User` является глобальной идентичностью физического лица. Один и тот же `User` может иметь несколько независимых memberships.

```text
User identity != permission to access every workspace the user knows about
```

При выполнении workspace action всегда требуется active membership in that workspace and sufficient role/permission.

### 3.3 Isolation invariants

| Invariant | Rule |
| --- | --- |
| Workspace-scoped ownership | Business entity belongs to one workspace boundary. |
| Membership-gated access | User reads or changes workspace data only through active membership and permitted operation. |
| No implicit cross-workspace reuse | An entity in one workspace is not linkable from another workspace merely because the same user belongs to both. |
| No identity-based bypass | Ownership of a user account does not bypass membership checks in an organization workspace. |
| Projection/output isolation | Registry projections, package snapshots and generated exports remain inside the source workspace access boundary. |
| Evidence privacy | Uploaded originals and representative personal data are protected by the same workspace boundary and role policy. |

### 3.4 Company profile versus organization workspace

`Organization Workspace` is a collaboration and tenant boundary. `CompanyProfile`,
`ObjectTemplate` assignments and frozen manual/released output values describe
organizations appearing in construction documentation; the legacy
`ObjectCompanySnapshot` name is not the normal linked-act source.

They are not automatically the same concept:

- a personal user may prepare documents containing a contractor `CompanyProfile`;
- an organization workspace may contain profiles for several project parties;
- legal requisites in a document do not grant workspace membership;
- membership in a workspace does not silently rewrite historical organization snapshots.

---

## 4. User Model

### 4.1 User identity

`User` represents one natural person who creates and operates an account. The account is not itself a company and not a tenant containing domain data.

Conceptual user information includes:

- identity and authentication-facing account state;
- verified or verification-pending email identity as required by future security policy;
- display/profile information for operating the product;
- account lifecycle state;
- relations to memberships and invitations.

This specification does not select identity provider, credential method, session implementation or authentication protocol.

### 4.2 What User owns

`User` owns personal identity/account preferences needed to sign in and navigate workspaces. It does not directly own authorization to organization data.

The user is related to:

- exactly one automatically created personal workspace membership under the baseline;
- zero or more organization workspace memberships;
- invites issued to an email identity and accepted into memberships;
- audit attribution as an actor.

### 4.3 No global business role

The roles `Owner`, `Admin`, `PTO Engineer`, `Foreman` and `Viewer` are workspace membership roles. A user may be:

- `Owner` in their personal workspace;
- `PTO Engineer` in one organization;
- `Viewer` in another organization.

No workspace data permission is derived from a globally assigned user role.

### 4.4 Platform operations are outside workspace RBAC

Earlier master context referenced a generic `admin`. This access baseline refines that ambiguity:

- `Admin` in this document is a workspace membership role only;
- a future platform-support or system-operations role is outside organization workspace RBAC;
- no platform support access to tenant documents is silently approved here;
- any future privileged support access to real files or personal data requires explicit privacy, audit and security policy.

---

## 5. Workspace Model

`Workspace` is the user-visible working environment and the domain tenant boundary. Both workspace kinds provide the same core PTO document capabilities; their collaboration and governance rules differ.

### 5.1 Personal Workspace

`Personal Workspace` is automatically created for a newly registered natural person.

Baseline rules:

- it has exactly one founding `Owner`: the registering user;
- it is a full-featured tenant for objects, typed documents, certificates, schemes, registries, packages and templates allowed by product entitlement;
- it does not depend on belonging to an organization;
- organization invite workflow does not grant membership to a personal workspace in this baseline;
- its data remain separate from every organization workspace, including organizations joined by the same user.

### 5.2 Organization Workspace

`Organization Workspace` is a tenant boundary for a collaborating team.

Baseline rules:

- it is created by an authorised natural-person user under future product entitlement rules;
- the creator becomes its initial `Owner`;
- additional users join by stored invitations and memberships;
- it contains its own objects, evidence libraries, workspace templates, outputs and audit context;
- a user may participate in multiple organization workspaces concurrently;
- organization membership never grants access to the user's personal workspace.

### 5.3 Workspace kind comparison

| Aspect | Personal Workspace | Organization Workspace |
| --- | --- | --- |
| Initial creation | Automatic on registration | Explicit creation by an eligible user |
| Initial role | Registering user is `Owner` | Creating user is `Owner` |
| Main purpose | Full independent work by one engineer | Collaborative work of a team |
| Joining | Not invite-based in baseline | Through `Invite` and resulting `Membership` |
| Domain capabilities | Full PTO domain capabilities | Full PTO domain capabilities |
| Data isolation | Separate tenant boundary | Separate tenant boundary |
| Commercial posture | Individual offering | Team/organization offering |

### 5.4 Workspace-owned data

The workspace boundary encloses, conceptually:

- `Object` and `FolderTree`;
- `Document` and document revision/autosave/lock context;
- `Certificate` and quality evidence originals;
- `ExecutiveScheme`;
- `CompanyProfile`, object snapshots and representative data in workspace scope;
- `Template` versions available within the workspace;
- `RegistryProjection`, `RegistryOverride`, `Package` and snapshots;
- generated artifacts and workspace activity/audit records.

It does not make these concepts children of one giant aggregate; their boundaries remain those established in `docs/09-aggregate-boundaries-and-invariants.md`.

---

## 6. Membership Model

### 6.1 Membership purpose

`Membership` is the stored relation that grants one user a role in one workspace.

```text
Permission = active Membership in target Workspace + allowed role operation + applicable scope policy
```

### 6.2 Cardinality and independence

- A user can belong to several workspaces simultaneously.
- A workspace can have several memberships where its kind permits collaboration.
- Each membership belongs to exactly one user and one workspace.
- A role change in one membership has no effect on memberships in other workspaces.
- Leaving or being removed from one organization does not remove the user's account or personal workspace.

### 6.3 Membership conceptual state

Membership must be able to express:

- target workspace and member user identity;
- assigned role;
- active, suspended, removed or other future lifecycle state;
- origin/provenance, such as ownership at creation or accepted invite;
- role-change and removal audit requirements.

No physical fields or persistence mechanism are specified here.

### 6.4 Membership invariants

| Invariant | Requirement |
| --- | --- |
| Role ownership | Workspace rights are defined by membership, never by a role in URL or global user flag. |
| Workspace scope | A membership authorises only its own workspace. |
| Personal owner guarantee | The registering user retains an Owner membership in the personal workspace under baseline; deletion/transfer policy is open. |
| Organization ownership continuity | An organization workspace must not be left without an accountable Owner under the baseline. |
| Audited mutation | Invite acceptance, role changes, suspensions and removals are auditable access events. |

---

## 7. Registration Flow

### 7.1 New user baseline flow

1. A natural person starts registration and supplies the identity information required by the future authentication policy.
2. The system establishes a `User` account after the applicable identity/verification step.
3. The system automatically creates one `Personal Workspace` for that user.
4. The system creates an active `Membership` connecting the user to the personal workspace with role `Owner`.
5. The user enters a full personal working context capable of creating PTO objects and documentation.

### 7.2 Initial role

The initial membership is:

```text
Personal Workspace founder -> Owner
```

It is not a global `Owner` role and confers no access to any later organization workspace.

### 7.3 Invited registration interaction

When an unregistered person arrives through a valid organization invitation, registration still creates the personal workspace and Owner membership first. Joining the invited organization then creates a separate organization membership after invite validation and acceptance.

This keeps the invariant that every account is usable independently of an employer or invited organization.

---

## 8. Invite Model

### 8.1 Purpose and scope

`Invite` is a stored authorization offer to join an `Organization Workspace` under controlled conditions. It is not a permission-bearing URL and not a membership until accepted.

An invite conceptually owns:

- target organization workspace;
- issuing actor and audit context;
- intended membership role;
- lifecycle status;
- expiry and revocation state;
- usage mode and usage limit where applicable;
- email binding where applicable;
- opaque token verification context.

### 8.2 Invite token rule

The invite link contains only an opaque token or token reference sufficient to find and verify a stored invite. It must not embed trusted role, workspace permissions or editable authorization claims in the URL.

```text
Invite URL token -> stored Invite -> accepted Membership role
```

### 8.3 Expiration and revocation

- Every invite has an expiration policy; a stale invitation cannot create membership.
- An authorized `Owner` or `Admin` can revoke an unused invite according to role rules.
- Revocation prevents future acceptance and is auditable.
- Expiration and revocation do not remove a membership already created by successful acceptance; membership removal is a separate action.

### 8.4 Single-use invites

Single-use invitation is the default and preferred baseline for inviting a known collaborator:

- it creates at most one membership;
- it becomes consumed after successful acceptance;
- it should normally be bound to the intended email identity;
- it can grant any non-Owner invited role permitted by the invitation policy.

Direct invitation into `Owner` is not assumed by this baseline; ownership transfer/additional-owner policy remains a governance decision.

### 8.5 Multi-use invites

Multi-use invitation is a controlled onboarding option for an organization, not a default security posture.

Baseline restrictions:

- it must have explicit expiration and revocation;
- it must have explicit intended role and any usage cap or onboarding policy;
- it cannot grant `Owner` or `Admin` under this baseline;
- it may grant `PTO Engineer`, `Foreman` or `Viewer` only when an organization explicitly chooses broader onboarding;
- it produces one independently revocable membership per accepting user;
- whether multi-use links enter first commercial scope remains an open product/security decision.

### 8.6 Email-bound invites

An email-bound invite may be accepted only by a user account matching the intended verified email identity under future authentication policy.

Email-bound single-use invites are required baseline for inviting `Admin` and are the default for known team members. The precise verification mechanics remain outside this architecture document.

### 8.7 Invite restrictions

An invite cannot:

- authorize access before acceptance creates an active membership;
- cross workspace boundaries;
- silently replace an existing membership role;
- expose rights through mutable URL parameters;
- bypass suspension/removal rules;
- grant access to a personal workspace under the organization invite model.

---

## 9. Join Flow

### 9.1 User has no account

1. Invitee opens a valid invite link.
2. The system validates that the stored invite is available for acceptance, without granting data access yet.
3. Invitee registers as a natural person.
4. Registration creates the invitee's personal workspace and `Owner` membership.
5. The invite is validated again against expiry, revocation, usage and email-binding requirements.
6. Invitee accepts joining the organization workspace.
7. A separate organization `Membership` is created with the role stored by the invite.
8. The invite consumption/audit state is updated according to its usage mode.

### 9.2 User already has an account

1. Authenticated user opens or accepts a valid invite.
2. The system checks the user's identity against email binding and invite validity.
3. On explicit acceptance, a membership in the organization workspace is created with the stored intended role.
4. Existing personal and other organization memberships are unchanged.
5. The membership and invite acceptance event become auditable.

### 9.3 Existing membership handling

An invite does not silently elevate or duplicate an existing organization membership. If an invitee already belongs to the target workspace:

- access continues through the existing membership;
- any role change must be an explicit authorized membership-management action;
- attempted invite acceptance and resolution should be traceable where security/audit policy requires.

---

## 10. Role Model

### 10.1 Workspace roles

| Role | Purpose | Baseline posture |
| --- | --- | --- |
| `Owner` | Accountable controller of a workspace | Full workspace governance and domain authority; organization must retain ownership continuity. |
| `Admin` | Delegated workspace administrator | Manages team/access and domain configuration, subject to ownership restrictions. |
| `PTO Engineer` | Primary professional operator | Creates and manages executive documentation and outputs; no membership governance. |
| `Foreman` | Contributing field/work participant | Contributes drafts/evidence within allowed work scope; restricted release/governance powers. |
| `Viewer` | Read-only participant | Views authorised workspace content and permitted outputs without mutation. |

### 10.2 Role naming refinement

Prior context referenced `PTO` and `foreman` informally. This specification uses `PTO Engineer` and `Foreman` as membership roles and adds `Owner`, `Admin` and `Viewer` to cover SaaS workspace governance and read-only access.

### 10.3 Owner versus Admin

Both roles can operate domain data and routine access administration. `Owner` additionally represents accountable ownership:

- control of ownership-sensitive workspace actions;
- protection against leaving an organization without an owner;
- future commercial/subscription accountability where approved.

Whether organizations support more than one `Owner`, ownership transfer or recovery is an open governance question.

### 10.4 Scope restrictions within roles

This document defines workspace-level role baseline. Future object/folder/project assignment restrictions may narrow what a `PTO Engineer`, `Foreman` or `Viewer` can see or change inside an organization, but must never broaden access across workspaces.

---

## 11. Permission Principles

1. **Membership is authoritative.** Workspace permission is evaluated through an active membership.
2. **Least authority by role.** Roles grant only operations needed for their purpose.
3. **Tenant check before domain action.** A valid document operation still fails access control if it crosses workspace boundary.
4. **Source owners remain authoritative.** Permission to view or edit a registry does not grant independent editing of upstream domain fields beyond permitted commands to their owners.
5. **Released history is protected.** A role allowed to correct a document does so through revision rules; no role may overwrite immutable package snapshots or used template versions.
6. **Original files and personal data are sensitive.** View/download/replace access may be narrower than ordinary metadata visibility once privacy policies are ratified.
7. **Access administration is separate from professional work.** `PTO Engineer` can prepare documentation but cannot invite users or assign roles by default.
8. **Operational locks follow editing authority.** A user without editing permission cannot acquire an editing lock; lock override requires a separately authorized policy.
9. **No URL authority.** Invite links initiate validation; stored invite and created membership establish rights.
10. **Audit important access changes.** Security-sensitive and historically important actions must be attributable.

---

## 12. Permission Matrix

### 12.1 Meaning of matrix actions

| Marker | Meaning |
| --- | --- |
| `Manage` | Create, edit, archive or execute relevant domain lifecycle action, subject to invariants and future fine-grained policies. |
| `Contribute` | Create/upload/edit draft or assigned working content; cannot perform governance or unrestricted release-sensitive actions. |
| `View` | Read permitted content and generated outputs; sensitive downloads may require privacy policy. |
| `Administer` | Manage membership/access configuration for this resource family. |
| `No` | Not permitted by baseline role. |

### 12.2 Resource permission baseline

| Resource / action family | Owner | Admin | PTO Engineer | Foreman | Viewer |
| --- | --- | --- | --- | --- | --- |
| Objects: create/configure/archive | Manage | Manage | Manage working objects | View assigned/permitted objects | View permitted objects |
| Documents: create/edit/finalize/revise | Manage | Manage | Manage | Contribute drafts/allowed inputs; release authority not granted by baseline | View |
| Certificates/quality evidence: upload/confirm/link/replace-policy action | Manage | Manage | Manage | Contribute upload/link candidates; cannot silently confirm/replace historical evidence | View permitted evidence |
| Executive schemes: upload/metadata/link/supersession action | Manage | Manage | Manage | Contribute uploads/links in allowed scope | View |
| Registries: configure overrides/generate/export | Manage | Manage | Manage | View generated/current permitted projection; no source/override management | View |
| Packages: configure/build/rebuild/download | Manage | Manage | Manage | View/download permitted output; no composition/build authority baseline | View/download permitted output |
| Templates: create/version/activate workspace variants | Manage | Manage | Use/select permitted versions for documents; no version administration | Use assigned form through document contribution only | View rendered output |
| Users/memberships: list/manage roles/remove/suspend | Administer including ownership-sensitive actions | Administer except ownership-sensitive restrictions | No administration | No | No |
| Invites: issue/revoke/set invite role/policy | Administer | Administer subject to no Owner grant policy | No | No | No |

### 12.3 Domain invariants still apply to powerful roles

`Owner` and `Admin` are not exempt from domain rules:

- they cannot edit a used `TemplateVersion`;
- they cannot turn registry rows into source data;
- they cannot silently overwrite historical evidence or package snapshots;
- they cannot link data across workspaces outside a future approved policy;
- they cannot auto-approve OCR/AI results merely by role.

### 12.4 Matters intentionally not finalized by the matrix

The matrix does not yet decide:

- object/folder-level assignments within organization workspaces;
- exact ability of a foreman to edit particular typed fields or upload originals;
- whether a viewer may download all originals or only generated artifacts;
- lock override authority;
- release/approval workflow beyond the established `final` revision model;
- external guest or customer-review roles.

---

## 13. Workspace Ownership Rules

### 13.1 Ownership meaning

Workspace ownership is governance over the tenant boundary, not ownership of a person's identity and not permission to violate domain history.

An `Owner` can conceptually:

- establish and govern workspace membership;
- delegate `Admin`, `PTO Engineer`, `Foreman` and `Viewer` access;
- manage workspace-level domain settings and templates;
- undertake future commercial/accountability operations once designed.

### 13.2 Personal ownership

The newly registered user is the owner of the automatically created personal workspace. The system must preserve the user's ability to work independently even when organization memberships later expire or are removed.

### 13.3 Organization ownership continuity

An organization workspace must always have an accountable owner under the baseline. Removing, suspending or leaving as the last owner cannot proceed silently.

Policies for:

- multiple owners;
- ownership transfer;
- owner recovery;
- organization deletion/archival;
- subscription lapse and data export;

remain decisions to ratify before or alongside any commercial lifecycle design.

---

## 14. Cross-Workspace Isolation Rules

### 14.1 Prohibited leakage

Without a separately approved transfer/sharing policy, the following are prohibited:

- reading an object, document, evidence original, scheme or package from another workspace;
- linking a `Certificate`, `ExecutiveScheme`, `TemplateVersion`, representative profile or company library item across workspaces;
- using membership in workspace A to generate outputs from workspace B;
- showing cross-workspace results in search or registry projections beyond navigation metadata expressly permitted later;
- copying data from personal to organization workspace as if it were the same source entity;
- using an invitation for one workspace to enter another workspace.

### 14.2 Same user in multiple workspaces

A user working in multiple organizations can switch contexts, but does not merge them. The same user's memberships do not create cross-workspace ownership, reference or file reuse.

### 14.3 Future transfer or copy

Real workflows may later require copying an object setup, template or evidence from personal work into an organization. Such behavior is not approved by this baseline. It requires an explicit policy for:

- copy versus reference semantics;
- provenance and audit;
- permission from source and destination workspaces;
- privacy and legal treatment of originals and personal data;
- historical snapshots after transfer.

---

## 15. Personal Workspace Rules

### 15.1 Full professional capability

An ordinary PTO engineer who has no employer workspace must be able to perform meaningful end-to-end work in their personal workspace:

- create construction objects and folder structures;
- create and revise typed documents;
- maintain company/object snapshots as applicable;
- upload and link quality evidence and executive schemes;
- build registry projections and packages;
- use/version permitted templates;
- retain audit/provenance required for their outputs.

Personal workspace is not a demo, inbox or waiting room for joining an organization.

### 15.2 Collaboration boundary

The baseline does not use organization invites to add other users into a personal workspace. Whether personal workspaces later support collaboration, conversion to organization workspaces, transfer/export or paid limits is a commercial/product decision.

### 15.3 Personal and organization separation

When a personal user joins an organization:

- personal objects remain personal workspace data;
- organization objects remain organization workspace data;
- any reuse or migration requires a separately designed copy/transfer process;
- loss of organization membership does not delete personal work.

---

## 16. Organization Workspace Rules

### 16.1 Collaboration purpose

An organization workspace permits multiple natural-person users to work within a shared tenant boundary under memberships. Its shared data are the workspace's controlled domain data, not personal property copied into every member account.

### 16.2 Membership administration

- Creator receives initial `Owner` membership.
- `Owner` and permitted `Admin` memberships may issue/revoke invites and administer non-owner roles.
- `PTO Engineer`, `Foreman` and `Viewer` have no invite or role-administration authority by baseline.
- Removing a member removes future access through that membership but cannot erase that person's audit attribution in historical actions.

### 16.3 Organization is not legal party inference

Organization workspace identity must not automatically be rendered as contractor/customer/developer in documentation. Documents use approved `CompanyProfile` and snapshots, because a workspace may prepare documentation for different parties or projects.

---

## 17. Workspace Switching

### 17.1 Active context

A multi-workspace user needs a clear active workspace context before acting on business data. Switching workspace changes the tenant boundary in which lists, searches, objects, uploads, generated outputs and access operations are evaluated.

### 17.2 Switching principles

- Active context must be visible to the user in future UX design, without defining that UI here.
- A switch never copies or merges data.
- Drafts, links, uploads and generation requests are evaluated in the selected workspace.
- Direct navigation to an entity still requires membership in that entity's workspace.
- Audit records identify both actor and workspace context for relevant actions.

### 17.3 Cross-workspace overview

The product may later show a navigation-level list of workspaces and permitted summary indicators. It must not expose document or evidence content across boundaries without authorization and an explicit design.

---

## 18. Audit Requirements

### 18.1 Access and workspace events

At minimum, architecture must support attributable audit history for:

- account registration and personal workspace creation;
- organization workspace creation;
- invite issue, revocation, expiration handling and successful acceptance;
- membership creation, role change, suspension, removal and owner-sensitive governance;
- failed or rejected invite acceptance where security policy requires tracking;
- workspace-context changes only where needed for meaningful security/audit, without requiring logging every navigation action.

### 18.2 Domain-sensitive events under RBAC

Existing domain audit requirements remain and should be attributed to membership/workspace context when performed:

- object and document lifecycle operations;
- released document revisions;
- evidence upload, confirmation, replacement/supersession and download policy-sensitive events;
- scheme upload/replacement actions;
- template version creation/use;
- registry overrides and package builds;
- lock override if later allowed;
- export/download of sensitive originals or package artifacts where privacy policy requires it.

### 18.3 Historical actor retention

Removing a membership must not remove attribution for actions performed while it was valid. Audit history is historical evidence of actor, workspace context, role/action authority and relevant target.

---

## 19. Security Principles

1. Authentication establishes a user identity; authorization requires workspace membership.
2. Tenant isolation applies to all source data, originals, projections, snapshots and generated artifacts.
3. An invite token is a secret entry reference, not a permission payload.
4. Stored invite state controls intended role, validity, email binding, usage and revocation.
5. Sensitive roles use controlled invitations; `Admin` invitation is email-bound and single-use under the baseline.
6. `Owner` assignment/transfer is not delegated to an ordinary invite link without a ratified governance policy.
7. Removed or suspended membership denies future access without erasing history.
8. Access to original evidence files and personal representative information requires privacy-conscious permission policy.
9. Future support/admin or emergency access must be explicit, narrowly authorised and audited; it is not implied by workspace `Admin`.
10. Security policy must preserve the architectural domain invariants: no output overwrite, no source-field edits through projections, no cross-tenant links.

---

## 20. SaaS Commercial Readiness

### 20.1 Individual user

The personal workspace allows an independent engineer to register and begin real work without organization setup. Future individual subscription/limits can attach to entitlement policy without changing document ownership or access boundaries.

### 20.2 Small organization

A small organization can use one organization workspace with an owner, a limited number of engineers/foremen/viewers and controlled invitations. It gains shared libraries and outputs while remaining isolated from each member's personal data.

### 20.3 Large organization

A large organization requires the same tenant boundary and membership basis, while later policies may add:

- multiple administrative owners or governed ownership transfer;
- finer object/team scopes;
- centralized identity provisioning;
- stricter audit/export/privacy controls;
- commercial seat/entitlement governance.

These features should extend memberships and policy; they must not replace tenant isolation or domain ownership.

### 20.4 User in several organizations

Consultants or engineers working for multiple parties use one natural-person account with independent memberships. This supports SaaS sale to real professional workflows without forcing duplicate identities or mixing commercial tenants.

### 20.5 Entitlement versus authorization

Commercial entitlement answers whether a workspace may use a product capability or number of seats. RBAC answers whether a member may perform an action inside an entitled workspace.

```text
Entitlement != Membership authorization
```

Subscription plans, payment processing, seat counts, trials and usage limits are intentionally not designed here.

---

## 21. Future Enterprise Considerations

The following extensions may later be required, but are not accepted as first-scope behavior:

- managed organization ownership recovery and multiple-owner policy;
- single sign-on, directory provisioning or enterprise identity lifecycle;
- custom roles or fine-grained object/folder/team assignments;
- external customer/reviewer/guest access;
- time-limited access beyond invitations;
- data export, workspace conversion, merger or transfer between tenants;
- organization retention/legal hold and administrator audit reporting;
- platform support access with strict privacy controls;
- regional/compliance/data residency requirements;
- commercial licensing, billing, seats and procurement flows.

Any enterprise extension must preserve membership-scoped authorization, tenant isolation, historical provenance and evidence privacy unless a new explicitly approved principle replaces one of them.

---

## 22. Open Questions

### 22.1 Workspace lifecycle and ownership

1. May a user create multiple personal workspaces, or exactly one throughout account lifecycle?
2. May a personal workspace later be converted or copied into an organization workspace, and with what provenance?
3. Can an organization workspace have multiple owners, and what are transfer/recovery rules?
4. What happens to access and retained outputs when an organization workspace is archived, deleted or loses commercial entitlement?

### 22.2 Invitations and membership governance

1. Are multi-use invitations included in the first commercial scope or deferred until security/abuse controls are detailed?
2. Which verification requirements apply before accepting an email-bound invite?
3. Can an existing member's role be changed through a new invite, or only through explicit membership administration as proposed?
4. Are temporary/scheduled memberships needed for subcontractors or reviewers?

### 22.3 Fine-grained permissions

1. Do organization roles apply to the entire workspace or must objects/folders be assignable in the first scope?
2. Which exact document fields/actions may a `Foreman` contribute?
3. Can `Viewer` download certificate/scheme originals and full packages, or only view selected generated outputs?
4. Which role may override document locks and under what audit/justification policy?
5. Is a separate reviewer/customer role required later?

### 22.4 Privacy and sharing

1. What privacy/access rules govern original evidence files and representative personal data?
2. May evidence, templates or company/representative profiles ever be copied or shared between workspaces?
3. What export/retention policy applies when a member leaves an organization or a workspace subscription ends?
4. What controlled platform-support access, if any, is permitted for customer support or security incidents?

### 22.5 Commercial policy

1. Which capabilities and limits differ between personal and organization offerings?
2. How are seats counted when one user participates in multiple organization workspaces?
3. Are trials, read-only retention states or ownership handover needed for lapsed organizations?

---

## 23. Decisions Required Before Database Schema V1

The following access decisions must be ratified or explicitly deferred before physical Database Schema V1 is treated as approved:

| Decision gate | Proposed access baseline | Required confirmation |
| --- | --- | --- |
| Tenant boundary terminology | `Workspace` is the tenant boundary for domain data and workspace-scoped authorization; it refines `TenantContext`. | Confirm naming and that every business aggregate/output is workspace-scoped. |
| User identity | User represents one natural person and has no global business-data role. | Confirm account identity/lifecycle assumptions before persistence design. |
| Personal workspace | Registration automatically creates one full-capability personal workspace and Owner membership. | Confirm lifecycle, entitlement and any future collaboration/conversion policy. |
| Organization workspace | Collaboration tenant created explicitly; creator becomes Owner; members join through invites. | Confirm creation/ownership governance. |
| Membership authority | Rights belong only to active membership in the target workspace. | Confirm membership lifecycle and role-change rules. |
| Role baseline | `Owner`, `Admin`, `PTO Engineer`, `Foreman`, `Viewer` with matrix in this document. | Ratify operation scope and whether fine-grained object assignments are needed initially. |
| Invite authority | URL contains opaque token only; stored invite defines workspace/role/conditions; acceptance creates membership. | Confirm token lifecycle and security requirements without encoding rights in links. |
| Invite policies | Single-use/email-bound known-user invite default; controlled non-admin multi-use invite may be supported. | Decide first-scope invite modes and restrictions. |
| Ownership continuity | Organization workspace is not allowed to lose accountable ownership silently. | Decide multiple-owner, transfer and recovery policy. |
| Cross-workspace isolation | Same user in multiple workspaces cannot implicitly share/link/copy domain data. | Define any approved copy/transfer/export scenarios. |
| Evidence/privacy access | Originals and personal data require role-limited and auditable access. | Define download, retention and platform-support access policy. |
| Audit | Access/membership/invite and sensitive domain operations retain workspace-scoped attribution. | Select mandatory event set and retention policy. |
| SaaS entitlement boundary | Entitlement is separate from membership authorization. | Define later subscription/seat/lapse rules without changing tenant isolation. |

Until these decisions are ratified, this document is the draft access and tenant-boundary baseline for further architectural review. It is not authorization to select a database, implement authentication, create API contracts or start application code.
