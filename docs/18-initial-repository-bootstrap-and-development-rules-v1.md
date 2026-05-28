# 18. Initial Repository Bootstrap and Development Rules V1

# PTO ID System

# Final implementation gate before the first scaffold

Status: pre-scaffold governance specification.

Date fixed: 2026-05-28.

Source of authority: `docs/PROJECT_MEMORY.md`, `docs/16-mvp-scope-and-first-forms-v1.md`, `docs/17-tech-stack-and-implementation-strategy-v1.md`, canonical ADR 0001-0005 in `docs/adr/`.

This document is the last architecture gate before repository bootstrap. It defines enforceable rules for the first scaffold and early development. It does not create code, scaffold, packages, migrations, ORM schema, OpenAPI, Docker, CI or runtime configuration.

---

## 1. Purpose and Scope

This document defines the rules that MUST be followed when the project moves from architecture documentation to the first repository bootstrap.

It fixes:

- coding preconditions;
- allowed first scaffold scope;
- monorepo structure rules;
- backend/frontend/shared package guardrails;
- database, migration, queue, storage and API restrictions;
- infrastructure portability requirements;
- CI and development quality gates;
- anti-corruption rules against scope creep;
- forbidden shortcuts;
- definition of architecture violation.

This document does not authorize feature coding by itself. It authorizes only a future bootstrap plan after it is reviewed and accepted.

This document MUST NOT be interpreted as permission to:

- generate source code now;
- create folders now;
- install dependencies now;
- create `package.json` or lock files now;
- create Prisma schema or migrations now;
- write OpenAPI now;
- create deployment files now;
- implement AOSR, auth, storage, queue or generation now.

---

## 2. Preconditions Before Coding

Coding MAY begin only after all conditions below are true:

1. `docs/17-tech-stack-and-implementation-strategy-v1.md` is accepted.
2. This document is accepted.
3. The repository baseline is clean and no unrelated changes are mixed into the scaffold commit.
4. Required architecture documents are present or their absence is resolved as described below.
5. The first scaffold task explicitly names what it may create.
6. The first scaffold task explicitly confirms that feature implementation remains out of scope unless separately authorized.

Before the first scaffold, the implementer MUST verify the existence of:

- `README.md`;
- `docs/PROJECT_MEMORY.md`;
- `docs/16-mvp-scope-and-first-forms-v1.md`;
- `docs/17-tech-stack-and-implementation-strategy-v1.md`;
- `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`;
- `docs/adr/0001-structured-data-source-of-truth.md`;
- `docs/adr/0002-typed-document-domain-model.md`;
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`;
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`;
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`.

ADR 0001-0005 are now the canonical physical ADR baseline. If any canonical ADR file above is missing, coding MUST NOT proceed. A documentation-only corrective step MUST restore/create the missing canonical ADR files from the accepted project memory before implementation continues.

`docs/16-mvp-scope-and-first-forms-v1.md` has implementation-scope precedence over older documents, including `docs/08-document-types-catalog.md`. Any older wording that treats `TestAct` as MVP candidate/family MUST NOT expand the first implementation scope. The first scaffold MUST target AOSR-first MVP only.

---

## 3. Architectural Invariants That Implementation Must Preserve

Implementation MUST preserve these invariants at all times:

- source of truth is structured data;
- DOCX, PDF, registry exports and ZIP packages are generated artifacts;
- AOSR is the first mandatory typed form;
- `TestAct` and `TechnicalReadinessAct` MUST NOT be implemented as first generated/finalizable typed forms;
- typed documents MUST NOT become generic JSON documents;
- document type is immutable after creation;
- registry is a derived projection;
- package build is asynchronous and snapshot-based;
- successful package snapshots are immutable;
- released document revisions are immutable;
- used template versions are immutable;
- certificate and executive scheme references require physical originals;
- AI/OCR is optional and proposal-only;
- MVP MUST work without AI/OCR;
- backend starts as a modular monolith;
- microservices are forbidden for MVP;
- no generic document builder;
- no generic file manager;
- no generic CRUD API;
- no silent mutation of source data from generated artifacts;
- no DOCX/PDF roundtrip import into structured truth;
- no cross-workspace data leakage.

Any implementation that weakens one of these invariants is an architecture violation.

---

## 4. Repository Bootstrap Rules

The first bootstrap MUST be minimal and mechanical.

It MAY create only the agreed repository structure, package manager setup, TypeScript tooling, lint/format/test baseline and empty app/package entry points required to run development checks.

The first bootstrap MUST NOT include:

- production features;
- domain entities beyond placeholder/module names;
- Prisma schema;
- migrations;
- OpenAPI;
- real API routes beyond health/dev smoke checks if explicitly approved;
- real auth implementation;
- file upload implementation;
- queue worker implementation;
- document generation implementation;
- seed data for business entities;
- sample customer/project data;
- AI/OCR code;
- deployment infrastructure.

Every bootstrap commit MUST be reviewable as infrastructure setup only. If a file contains business logic, it is outside first bootstrap scope unless the task explicitly approved it.

---

## 5. Monorepo Structure Rules

The allowed monorepo structure is conceptual until scaffold is explicitly requested.

The first scaffold MAY use this shape:

```text
apps/
  web/
  api/
  worker/

packages/
  contracts/
  domain/
  config/

templates/
  aosr/
  registry/
  package/

docs/
```

Rules:

- `apps/web` is the React + Vite + TypeScript app.
- `apps/api` is the NestJS modular monolith HTTP API.
- `apps/worker` is the background worker runtime for BullMQ jobs.
- `packages/contracts` is for shared command/read-model/value vocabulary.
- `packages/domain` is for framework-free domain helpers, rule codes and pure validation vocabulary.
- `packages/config` is for shared TypeScript/lint/test configuration only if useful.
- `templates` is for template source assets only; generated artifacts MUST NOT be committed there.

The first scaffold MUST NOT create extra packages for speculative future reuse.

Generated files, uploaded files, local storage contents, build outputs and package ZIPs MUST NOT be committed.

---

## 6. Backend Scaffold Rules

The backend scaffold MUST follow the accepted stack:

```text
NestJS + TypeScript on Node.js LTS
```

The backend MUST be organized around application modules and command/query boundaries, not database tables.

Allowed initial backend module placeholders:

- Workspace/Tenant;
- Object;
- FolderTree;
- TypedDocuments;
- EvidenceLibrary;
- ExecutiveSchemes;
- RegistryProjection;
- PackageBuilder;
- Templates;
- GeneratedArtifacts;
- Validation;
- Search;
- Audit.

AIReviewProposals MAY exist only as an empty future module placeholder if explicitly useful. It MUST NOT process files or call providers in MVP bootstrap.

Backend scaffold MUST NOT:

- expose generic CRUD controllers;
- expose repository/table endpoints;
- implement generic document update endpoints;
- implement package build synchronously;
- implement AI/OCR processing;
- implement Foreman-specific active permissions;
- hardcode final AOSR participant requirements before first template review;
- import Prisma types into public API contracts as authority;
- make generated artifacts writable source data.

Any health endpoint or development smoke endpoint MUST be explicitly marked as technical and MUST NOT imply business API design.

---

## 7. Frontend Scaffold Rules

The frontend scaffold MUST follow the accepted stack:

```text
React + Vite + TypeScript
```

The first frontend scaffold MAY include:

- app shell placeholder;
- routing placeholder if selected;
- lint/test/dev tooling;
- basic error boundary placeholder;
- minimal design tokens or CSS baseline;
- no business screens unless explicitly approved.

The frontend scaffold MUST NOT include:

- landing page as the primary product surface;
- fake CRM dashboard;
- generic file manager UI;
- generic document builder UI;
- spreadsheet-like registry editor;
- AI assistant UI;
- hardcoded AOSR participant requirements before template review;
- fake data that implies unsupported TestAct/TechnicalReadinessAct scope.

Frontend state rules:

- server state MUST be planned around TanStack Query;
- form implementation MUST be planned around React Hook Form;
- table implementation MUST be planned around TanStack Table where a table is needed;
- client validation is allowed for UX but backend validation remains authoritative.

---

## 8. Shared Package Rules

Shared packages MUST stay small and purpose-specific.

`packages/contracts` MAY contain:

- command names;
- read-model type vocabulary;
- error/result vocabulary;
- validation finding vocabulary;
- enum-like value objects agreed by docs;
- API-independent type definitions.

`packages/domain` MAY contain:

- pure helpers;
- stable validation rule codes;
- domain constants;
- framework-free domain types;
- no NestJS imports;
- no Prisma imports;
- no browser imports.

Shared packages MUST NOT:

- become a dumping ground for application services;
- expose database schema as API contract;
- define generic document builder abstractions;
- define cross-workspace shortcuts;
- contain generated client code before API contracts are accepted.

---

## 9. Environment and Secrets Rules

Environment configuration MUST be explicit and safe.

The first scaffold MAY define example environment variable names only if needed for local development documentation.

Rules:

- real secrets MUST NOT be committed;
- `.env` files with real values MUST NOT be committed;
- `.env.example` MAY contain placeholder names and safe dummy values;
- environment validation MUST fail closed for required runtime secrets;
- local defaults MUST NOT silently point to production resources;
- storage, database, Redis and session secrets MUST be environment-driven.
- public URLs, file download URLs, CORS origins and app base URLs MUST be environment/config driven.

Secrets MUST NOT be embedded in source code, tests, docs examples with real values, templates or CI config.

---

## 10. Infrastructure Portability / No Server Lock-in

PTO ID System MUST NOT be hard-wired to one VPS, PaaS, cloud, server, region or hosting provider.

Deployment provider is replaceable. Moving the system to another server/provider MUST require configuration, environment changes and storage/data migration, not rewriting domain logic, backend modules, frontend code or package generation.

Rules:

- deployment provider MUST be treated as infrastructure, not product architecture;
- server-specific assumptions are forbidden in domain and application code;
- database connection, Redis connection, object storage endpoint/bucket/region, public URLs, file download URL behavior, CORS origins, session secrets and app base URLs MUST be environment/config driven;
- local, development, staging and production environments MUST differ by configuration, not by long-lived code branches;
- S3-compatible storage adapter MUST hide provider details from domain/application services;
- provider SDKs MUST NOT leak into domain services, command handlers, validation rules, package builder domain logic, frontend code or shared contracts;
- provider SDKs are allowed only inside narrow infrastructure adapters;
- generated artifact links MUST be resolved through storage/download service, not stored as permanent server-local paths;
- public download links MUST be derived from current storage/download configuration and access policy;
- background workers MUST read database, Redis, storage and public URL configuration from the environment/config layer;
- no absolute server filesystem paths may be stored as durable domain references;
- no hardcoded IP, domain, hostname, bucket, region, CDN URL or provider-specific URL may appear in application code;
- no feature may depend on a provider-specific filesystem layout, reverse proxy path or machine-local path outside the infrastructure layer.

Forbidden examples:

- storing `/var/www/pto/uploads/file.pdf` as a generated artifact URL;
- hardcoding `https://current-server.example.com/files/...` in generated manifests;
- importing an S3/AWS/MinIO/provider SDK directly into a domain module;
- branching application logic with `if production provider is X`;
- making package generation depend on a fixed server directory;
- embedding CORS origins, base URLs or download hosts in source code.

Acceptable portability cost:

- changing environment variables;
- migrating PostgreSQL data;
- migrating object storage contents;
- migrating Redis/queue state according to operational policy;
- updating DNS or app base URL configuration;
- re-running workers against the new configuration.

Unacceptable portability cost:

- rewriting domain modules;
- rewriting command/query handlers;
- rewriting frontend business logic;
- rewriting generated artifact provenance model;
- changing package manifest semantics;
- changing document generation logic because the server/provider changed.

---

## 11. File Storage Rules

File storage implementation MUST preserve domain meaning.

Allowed direction:

```text
local development storage adapter + S3-compatible object storage abstraction
```

Rules:

- every stored file MUST have a domain role;
- file metadata MUST be stored separately from bytes;
- storage keys MUST be system-generated;
- user-visible filename MUST NOT be access authority;
- certificate originals MUST be file-backed;
- executive scheme originals MUST be file-backed;
- generated artifacts MUST reference exact source context;
- historical originals/artifacts MUST NOT be overwritten;
- deletion MUST respect retention policy.

Forbidden:

- generic drive/folder abstraction;
- user-path-driven storage authority;
- overwriting a file used by a released revision or package snapshot;
- treating uploaded project files as confirmed domain facts;
- storing generated artifacts as source truth.
- storing generated artifact links as permanent server-local paths.

---

## 12. Queue and Async Rules

The accepted async direction is:

```text
Redis + BullMQ
```

Initial scaffold MAY include worker process structure only if explicitly approved.

Rules:

- package build MUST be asynchronous;
- document generation MUST be asynchronous once implemented;
- ZIP generation MUST be asynchronous once implemented;
- AI/OCR processing MUST be asynchronous if ever enabled;
- queue state alone MUST NOT be business truth;
- durable async operation records MUST be stored in PostgreSQL when operation implementation begins;
- retries MUST be idempotent or create traceable new attempts;
- successful immutable snapshots/artifacts MUST NOT be overwritten by retry.

The worker MUST NOT mutate source aggregates as a side effect of derived output generation.

---

## 13. Database Rules

The accepted database direction is:

```text
PostgreSQL + Prisma
```

Prisma is the approved first ORM/migration tool unless a later accepted document changes it.

Rules:

- database design MUST remain relational first;
- JSONB MAY be used only for controlled structured payloads, snapshots, manifests and provenance;
- tenant ownership MUST be explicit or safely inherited through enforced parent relationships;
- workspace isolation MUST be enforceable in every query and command;
- immutable revisions/snapshots MUST be modeled explicitly;
- generated artifacts MUST reference source revision/template/package context;
- database records MUST NOT be shaped around generic file-manager or generic document-builder concepts.

The first scaffold MUST NOT create Prisma schema until the task explicitly authorizes database bootstrap.

---

## 14. Migration Rules

Migrations are blocked until a separate implementation task authorizes them.

When migrations become allowed, they MUST:

- be generated through Prisma or reviewed SQL consistent with Prisma workflow;
- be small and named by domain intent;
- be reviewed before commit;
- avoid destructive operations without explicit approval;
- preserve historical package/document reproducibility;
- include rollback/recovery thinking where destructive or structural;
- not introduce speculative tables for deferred features.

Migrations MUST NOT:

- encode unsupported `TestAct` or `TechnicalReadinessAct` MVP scope;
- create generic document tables that bypass typed payload rules;
- create generic file-drive tables;
- hide workspace ownership in JSON;
- create AI/OCR tables as required MVP infrastructure unless separately approved.

---

## 15. API Rules

The API MUST follow the accepted command/query direction:

```text
HTTP JSON command/query API with command-named mutations
```

Rules:

- mutations MUST express domain intent;
- reads MUST return screen-oriented read models;
- dangerous commands MUST support idempotency;
- mutable owner updates MUST use expected versions;
- authorization MUST derive from server-side session and active membership;
- errors MUST avoid cross-workspace existence leakage;
- validation failures MUST return explainable findings;
- async commands MUST return operation identity/status, not pretend synchronous completion.

Forbidden API shapes:

- generic table CRUD;
- generic document patch;
- update registry row as source truth;
- upload arbitrary file into folder;
- synchronous package build endpoint;
- AI accept/apply without human decision;
- endpoint that imports DOCX/PDF edits back into structured source data.

OpenAPI MUST NOT be written before concrete API contracts are ready and approved.

---

## 16. Validation Rules

Validation MUST be backend-authoritative.

Implementation MUST distinguish:

- boundary/shape validation;
- domain validation;
- draft feedback;
- finalization gate;
- package readiness gate;
- package build/release gate.

Rules:

- `ERROR` blocks the relevant gate;
- `WARNING` does not block by baseline unless later policy changes it;
- certificate expiry is evaluated by document date;
- printed certificate references require file-backed certificate relations;
- printed/attached scheme references require file-backed executive schemes;
- numbering collisions are blocking errors;
- registry overrides MUST NOT hide domain errors;
- AI findings MUST NOT become formal validation findings without an approved domain rule.

Validation result MUST support explanation:

- severity;
- stable code;
- source entity;
- affected field or relation;
- blocking gate;
- suggested action;
- provenance/evaluated version.

---

## 17. Generated Artifact Rules

Generated artifacts include DOCX, PDF, registry exports and package ZIPs.

Rules:

- artifacts are derived outputs;
- artifact generation MUST pin exact source context;
- AOSR generated output MUST come from structured AOSR data and `TemplateVersion`;
- package ZIP MUST come from immutable package snapshot manifest;
- generated artifacts MAY become stale;
- historical retained artifacts MUST NOT be edited in place;
- generated artifact links MUST be resolved through storage/download service;
- generated artifacts MUST NOT store permanent server-local absolute paths as authoritative links;
- manual edits to downloaded DOCX/PDF MUST NOT mutate source data;
- failed generation MUST produce operation failure, not partial source mutation.

Template rules:

- used `TemplateVersion` is immutable;
- first AOSR template requirements MUST be reviewed before hardcoding final participant requirements;
- missing template placeholder/binding MUST fail generation visibly;
- visual template editor is deferred.

---

## 18. AI/OCR Implementation Restrictions

AI/OCR is not part of required MVP execution.

Rules:

- MVP MUST work without AI/OCR;
- no AI/OCR provider integration in first scaffold;
- no API keys or provider SDKs in first scaffold;
- no autonomous source mutation;
- no automatic certificate confirmation;
- no automatic AOSR field acceptance;
- no automatic scheme linking;
- no automatic package release;
- no AI suppression of validation errors;
- no vector database in first scaffold.

If AI/OCR is later implemented, it MUST:

- run asynchronously;
- create proposals/findings only;
- retain citations/provenance/provider/model version;
- require human review;
- apply accepted data only through ordinary domain commands;
- follow approved privacy/data-processing policy.

---

## 19. Testing and CI Rules

The first scaffold MUST include basic quality gates if tooling is created.

Minimum intended gates:

- typecheck;
- lint;
- format check;
- unit test command;
- build command for each scaffolded app/package where meaningful.

CI rules:

- CI MUST run the same checks as local development;
- CI MUST fail on type errors, lint errors and test failures;
- CI MUST NOT require production secrets;
- CI MUST NOT deploy automatically from early scaffold;
- CI MUST NOT run real AI/OCR processing;
- CI MUST NOT upload generated artifacts outside controlled test output.

Early tests SHOULD prioritize:

- pure domain helpers;
- validation rule codes;
- command/result vocabulary;
- workspace-scope guard helpers;
- generation manifest helpers once implemented.

No test may encode unsupported first-scope TestAct behavior.

---

## 20. Logging/Audit Rules

Logging and audit are separate concerns.

Application logs SHOULD support debugging:

- request id;
- command id;
- workspace id where safe;
- object id where safe;
- async operation id;
- job id;
- error code/stage.

Logs MUST NOT dump:

- raw uploaded file contents;
- secrets;
- full personal data payloads;
- full document payloads unless explicitly sanitized for local debugging.

Audit records are domain history and MUST later cover:

- document finalization/revision;
- certificate confirmation/supersession;
- scheme confirmation/supersession;
- package build/release;
- generated artifact creation/failure;
- invite issuance/acceptance/revocation;
- AI proposal review if enabled.

Scaffold MUST NOT fake audit compliance. If audit is not implemented, it MUST be clearly absent, not simulated.

---

## 21. Security Baseline

Security baseline for first implementation:

- browser sessions MUST use secure HTTP-only cookie direction;
- roles MUST be resolved server-side from active membership;
- client-provided role claims MUST NOT be trusted;
- workspace id MUST be enforced on every command/query;
- object id MUST be enforced for object-scoped workflows;
- `NOT_FOUND_OR_NOT_AUTHORIZED` style leakage protection MUST be used where existence disclosure is unsafe;
- upload handling MUST validate size/type before accepting real files;
- signed URLs or streamed downloads MUST be scoped and time-limited when implemented;
- CORS MUST be restrictive;
- CORS origins MUST be configuration-driven and MUST NOT be hardcoded in application code;
- app base URLs, public URLs and download hosts MUST be configuration-driven;
- CSRF protection MUST be considered for cookie-auth mutations;
- rate limiting MUST be considered for auth and upload endpoints.

Foreman role rule:

- `Foreman` MAY appear as documented role vocabulary only if needed.
- Active Foreman permission behavior MUST NOT be implemented without separate approval.
- Foreman MUST NOT accidentally inherit PTO Engineer write permissions through default role fallbacks.

---

## 22. Forbidden Shortcuts

The following shortcuts are forbidden:

- using DOCX/PDF as source of truth;
- importing edited DOCX/PDF back into source data;
- storing certificate numbers as plain text without file-backed certificate relation;
- treating executive schemes as arbitrary attachments;
- making registry rows editable source records;
- building package synchronously in an HTTP request;
- mutating documents during package build;
- overwriting historical originals or generated artifacts;
- hardcoding absolute server paths, IPs, domains, hostnames, bucket names or provider URLs in application code;
- letting provider SDKs leak outside narrow infrastructure adapters;
- storing generated artifact links as permanent server-local paths;
- using JSONB as untyped document storage;
- using generic CRUD controllers;
- creating a generic document builder;
- creating a generic file manager;
- implementing `TestAct` as name-only subtype;
- implementing `TechnicalReadinessAct` without approved typed payload;
- hardcoding first AOSR participant requirements before template review;
- creating broad admin bypasses;
- leaking cross-workspace existence through errors or counts;
- adding AI/OCR dependency to MVP;
- adding microservices to solve local module boundaries;
- adding Kubernetes, Elasticsearch or vector DB before accepted need;
- adding payment/billing/CRM/task-management features in scaffold.

---

## 23. Explicitly Deferred Features

Deferred features MUST NOT appear in first scaffold except as documentation references:

- `TestAct` generated/finalizable forms;
- `TechnicalReadinessAct`;
- visual template builder;
- template marketplace;
- customer-specific template editor;
- generic document constructor;
- generic file drive;
- advanced RBAC/object-level permissions;
- active Foreman workflow;
- approvals/signatures/EDS;
- offline-first mode;
- real-time collaborative editing;
- AI/OCR provider integration;
- vector/semantic search;
- Elasticsearch/OpenSearch;
- billing/subscription/entitlement system;
- mobile app;
- BIM/CAD integration;
- procurement, finance, CRM or task-management modules.

Deferred does not mean impossible. It means implementation requires separate approval and usually a new specification.

---

## 24. Initial Development Sequence

After this document is accepted, implementation MUST proceed in this order unless a later accepted plan changes it:

1. Repository bootstrap only.
2. Development quality gates.
3. Minimal web/api/worker app startup checks.
4. Session/auth and personal workspace skeleton.
5. Workspace/object isolation skeleton.
6. Domain-scoped file asset foundation.
7. Certificate library manual metadata and confirmation.
8. Executive scheme library manual metadata and confirmation.
9. AOSR draft editor vertical slice.
10. AOSR validation and finalization/revision.
11. AOSR DOCX/PDF generation prototype.
12. Derived registry preview/export.
13. Package builder async snapshot/ZIP.
14. Pilot polish, onboarding hints and reliability work.

The first serious product demo MUST be AOSR-focused, not a dashboard, generic file manager or AI assistant.

---

## 25. First Allowed Scaffold Scope

The first scaffold may include only:

- package manager/workspace setup;
- TypeScript baseline;
- lint/format/test tooling;
- React + Vite app shell;
- NestJS app shell;
- worker app shell;
- shared config package if needed;
- empty or placeholder contracts/domain packages;
- local development scripts;
- CI checks for typecheck/lint/test/build if explicitly requested;
- documentation update describing how to run checks.

The first scaffold MUST NOT include:

- business feature implementation;
- database schema;
- migrations;
- OpenAPI;
- real auth;
- real uploads;
- real queue jobs;
- real storage adapter;
- real AOSR form;
- generated artifact pipeline;
- AI/OCR code;
- deployment infrastructure.

If the first scaffold task needs any item outside this list, it MUST explicitly name the exception and justify why it is not feature implementation.

---

## 26. Definition of "Architecture Violation"

An architecture violation is any implementation, scaffold, dependency, API shape, data model, UI pattern or shortcut that contradicts accepted project invariants.

Examples:

- source data lives only in DOCX/PDF;
- registry becomes editable source table;
- package build edits documents;
- generated artifacts overwrite historical outputs;
- file storage behaves like a generic drive;
- domain/application code depends on a specific server, host, provider SDK or absolute path;
- generated artifact URLs are stored as permanent server-local paths;
- API exposes generic CRUD over domain tables;
- workspace authorization is optional or client-trusted;
- document type can change after creation;
- TestAct is implemented before concrete approval;
- Foreman receives active permissions without approval;
- AOSR participant requirements are hardcoded before template review;
- AI/OCR mutates confirmed source data automatically;
- cross-workspace existence is leaked through errors, search or counts;
- migrations introduce generic document/file structures;
- frontend encourages unsupported Excel-like source editing.

When an architecture violation is found:

1. Stop the implementation path that introduced it.
2. Document the violation and affected files.
3. Revert or correct only the violating change, preserving unrelated user work.
4. If the desired change is intentional, create/review an ADR or specification before coding continues.

---

## 27. Final Gate Before Real Feature Coding

After this document is accepted, the project may proceed to a separate first scaffold task.

Real feature coding is still not allowed until:

- the first scaffold task is explicitly requested;
- first scaffold scope is limited to Section 25 or approved exceptions;
- development quality gates exist and pass;
- no production feature code is hidden in scaffold;
- no database/migration/API/document-generation shortcut is introduced;
- infrastructure portability/no server lock-in rules are preserved;
- ADR presence/replacement issue is resolved;
- `docs/16` precedence over older TestAct candidate wording is respected;
- Foreman active permissions remain unimplemented;
- first AOSR template/participant requirements are not hardcoded before review.

Once the scaffold is accepted, feature coding MUST start with the sequence in Section 24 and MUST preserve the invariants in Section 3.
