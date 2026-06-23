# 17. Tech Stack and Implementation Strategy V1

# PTO ID System

# Pragmatic implementation strategy for the first MVP

Status: implementation-strategy specification for review before initial repository bootstrap and development rules.

Date fixed: 2026-05-28.

Source of architectural principles: `docs/PROJECT_MEMORY.md`.

Basis: `docs/12-database-schema-v1.md`, `docs/13-domain-lifecycle-immutability-validation-v1.md`, `docs/14-backend-api-architecture-v1.md`, `docs/15-api-command-readmodel-contracts-v1.md`, `docs/16-mvp-scope-and-first-forms-v1.md`, ADR 0001-0007.

This document chooses a practical implementation direction for the first MVP. It still does not permit production code, scaffold, migrations, ORM schema, OpenAPI, Docker, CI or deployment files.

Non-negotiable principles:

- source of truth remains structured domain data;
- DOCX, PDF, registry exports and ZIP packages are generated artifacts;
- `AOSR` is the first mandatory first-class typed form;
- certificate and executive scheme references remain file-backed;
- registry remains a derived projection;
- package build remains asynchronous and snapshot-based;
- MVP must work without AI/OCR;
- implementation must fit solo/small-team delivery, not a future enterprise fantasy.

---

## 1. Purpose and Scope

This document fixes the recommended technology stack and implementation strategy for the first production-usable MVP of PTO ID System.

It exists to answer practical questions that earlier conceptual documents intentionally left open:

- which boring technologies should be used first;
- how frontend, backend, database, storage, generation and async work should fit together;
- how to implement large validation-heavy forms without turning the project into a generic low-code builder;
- how to generate predictable DOCX/PDF/ZIP outputs while keeping structured data authoritative;
- how to sequence the first coding milestones after the documentation gate is accepted.

This document fixes implementation direction, not implementation artifacts. It does not define:

- actual repository scaffold;
- package manifests;
- installed dependencies;
- source folders;
- production code;
- SQL migrations;
- Prisma schema or ORM entities;
- OpenAPI or concrete route list;
- deployment manifests;
- real AI provider credentials or processing policy.

Those become eligible only after review of this document and after acceptance of `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`.

---

## 2. Implementation Philosophy

PTO ID System should be built with boring, stable and productive technology. The product is complex because the domain is complex: forms, evidence, validation, template versions, package manifests and file-backed history. The implementation should not add novelty on top of that.

Baseline philosophy:

- prefer boring technology over hype;
- build the smallest production-usable MVP around AOSR, certificates, schemes, registry and packages;
- avoid overengineering and platform abstractions that do not serve the first workflow;
- start as a modular monolith with clear domain modules, not distributed services;
- optimize for maintainability by one engineer or a small team;
- keep contracts and types explicit, but do not generate an enterprise contract machine before the first screens exist;
- make AI/OCR optional and secondary;
- prioritize predictable document generation over flashy AI features;
- keep generated files explainable, reproducible and tied to exact source revisions and template versions.

The first implementation should be boring in the best sense: easy to run locally, easy to debug, easy to deploy, and easy to extend without changing the source-of-truth model.

---

## 3. Recommended Frontend Stack

### 3.1 Framework

Recommended frontend framework:

```text
React + TypeScript + Vite
```

Rationale:

- React has the strongest ecosystem for complex forms, tables, drag-and-drop and document-centric product interfaces.
- TypeScript is mandatory because typed document payloads, validation findings, read models and command results must remain understandable across the app.
- Vite keeps the frontend simple and fast without coupling product architecture to a full-stack web framework.
- A separate frontend app keeps the backend modular monolith explicit instead of hiding domain commands inside a page framework.

Next.js is not the recommended first choice for the MVP because server rendering is not the hard part of this product. The hard parts are authenticated workspace state, large forms, validation, uploads, async build progress and generated artifact previews.

### 3.2 UI strategy

Recommended UI strategy:

```text
React component system built from headless primitives plus a small internal design layer
```

Suggested direction:

- use accessible headless primitives such as Radix UI for dialogs, menus, popovers, tooltips, tabs and selects;
- use a restrained internal component layer for buttons, fields, panels, validation callouts, folder tree nodes, pickers and package rows;
- use utility CSS or a simple design-token approach if it keeps iteration fast;
- avoid a heavy enterprise component suite unless a specific component proves necessary.

The product should feel like a working tool for PTO engineers: dense, calm, reliable and quick to scan. It should not look like a marketing landing page, CRM dashboard template or generic file manager.

### 3.3 Forms strategy

Recommended forms stack:

```text
React Hook Form + Zod-compatible schemas + custom domain validation presentation
```

Rationale:

- React Hook Form handles large forms efficiently with low re-render cost.
- Field-level client validation can use shared shape schemas, but backend validation remains authoritative.
- Complex domain findings cannot be reduced to generic required-field messages. The frontend must render backend `ValidationFinding` records with severity, source, gate, suggested action and explanation.
- Autosave and draft recovery need controlled dirty-state handling, not ad hoc form state.

AOSR editor implementation should be sectioned:

- identity and numbering;
- object context;
- participants;
- work and location;
- project basis;
- materials and certificate links;
- executive schemes;
- attachments;
- validation and generated output status.

### 3.4 State management

Recommended data/state split:

```text
TanStack Query for server state
Local React state or Zustand for UI-only state
```

Use TanStack Query for:

- read models;
- command results;
- async operation polling;
- generated artifact status;
- validation refresh;
- pickers and search results.

Use local state or a small Zustand store for:

- open panels;
- active folder;
- unsaved editor UI state;
- dismissed hints;
- package builder drag state;
- temporary selection state.

Avoid a global Redux-style store for the whole product. Most important state belongs to the backend source of truth and should be re-read through screen-oriented read models.

### 3.5 Table and grid strategy

Recommended table/grid stack:

```text
TanStack Table first; virtualized lists when needed
```

Rationale:

- certificate library, executive scheme list, registry preview and package builder need sorting, filtering, row status, custom cells and source navigation;
- TanStack Table is flexible without imposing an enterprise grid model;
- virtualization can be added for large registries or certificate libraries;
- editable spreadsheet-like behavior should be limited and intentional, because registry rows are derived and source facts belong to owner screens.

Do not introduce a heavy Excel-like grid as the main editing surface in MVP.

### 3.6 Validation strategy

Frontend validation has three layers:

1. Basic client shape checks for immediate field feedback.
2. Draft validation read from backend after saves or explicit validation requests.
3. Gate validation from backend for finalization, package readiness, build and release.

The frontend must support:

- inline field hints;
- section-level badges;
- validation panel;
- source navigation from finding to owner field/relation;
- `ERROR`, `WARNING` and optional informational helper messages;
- stale output markers after final document revisions or package dependency changes.

Client validation is a usability feature. Backend validation is authority.

### 3.7 Folder tree and package builder UX

Recommended approach:

- use a focused drag-and-drop library only for folder movement, folder item movement and package ordering;
- keep numbering impact previews backend-driven;
- make move choices explicit: keep numbering or recalculate numbering;
- make package ordering visual, but package build itself remains async and backend-owned.

Folder tree is a business collection tree, not a drive. UI copy and interactions should reinforce that.

### 3.8 Preview approach

MVP preview direction:

- live editor preview should be a structured read-model preview, not a full Word engine in the browser;
- generated DOCX/PDF preview should use backend-generated PDF artifacts;
- browser PDF viewer is sufficient for MVP;
- DOCX download is supported, but browser DOCX editing is not;
- if DOCX preview is needed, convert DOCX to PDF in the generation pipeline and preview the PDF.

This keeps preview deterministic and aligned with the same renderer used for output.

---

## 4. Recommended Backend Stack

### 4.1 Language and runtime

Recommended backend language/runtime:

```text
TypeScript on Node.js LTS
```

Rationale:

- TypeScript can share conceptual contracts, validation shapes and enum vocabulary with the frontend.
- Node.js has strong libraries for DOCX templating, ZIP generation, queues, file upload handling and web APIs.
- A single-language stack is more maintainable for a solo/small team than TypeScript frontend plus a separate backend language.
- MVP complexity is domain/workflow complexity, not CPU-heavy computing.

Python can remain useful later for specialized OCR/AI or document analysis workers, but it should not be the default MVP backend unless a concrete processing need appears.

### 4.2 Backend framework

Recommended backend framework:

```text
NestJS modular monolith
```

Rationale:

- NestJS supports module boundaries, dependency injection, guards, interceptors, background processors and testable application services.
- It maps well to the documented modular monolith: Workspace, Object, FolderTree, TypedDocuments, EvidenceLibrary, ExecutiveSchemes, RegistryProjection, PackageBuilder, Templates, GeneratedArtifacts, AIReviewProposals, Validation, Search and Audit.
- It is familiar enough for hiring and maintenance.
- It avoids inventing an application framework while still allowing domain-first services rather than CRUD controllers.

The backend should not be organized around database tables. It should be organized around command handlers, query/read-model services, domain validation rules and async processors.

### 4.3 API style implementation

Recommended API style:

```text
HTTP JSON command/query API, REST-like routing, command-named mutations
```

Implementation direction:

- expose read-model queries for screen data;
- expose mutations as domain commands such as finalize, revise, confirm, request build and release snapshot;
- use workspace and object scope in route/context;
- use idempotency keys for duplicate-sensitive commands;
- use expected versions for mutable owners;
- use leakage-safe access errors;
- do not expose generic table CRUD;
- do not create OpenAPI before the concrete first implementation contracts are ready.

OpenAPI may be generated or documented later, but it should reflect accepted command/read contracts. It should not drive premature endpoint design.

### 4.4 Validation libraries

Recommended validation direction:

```text
Zod for boundary/shape validation; custom domain validation engine for PTO rules
```

Use Zod for:

- command payload shapes;
- read-model shape tests;
- simple shared value objects;
- frontend form shape reuse where practical.

Use custom domain validation services for:

- AOSR finalization rules;
- certificate file presence and confirmation;
- certificate validity by document date;
- scheme file readiness;
- numbering collision;
- package readiness;
- template version availability;
- registry override safety;
- version-aware validation across released revisions and package snapshots.

Do not confuse schema validation with domain validation. `z.string().min(1)` is not enough to explain a missing certificate original in a package build.

### 4.5 Async jobs approach

Recommended async stack:

```text
BullMQ + Redis for MVP background jobs
```

Use async jobs for:

- package builds;
- DOCX/PDF artifact generation;
- ZIP generation;
- registry export generation if retained asynchronously;
- future AI/OCR extraction;
- search reindexing if needed.

Rationale:

- BullMQ is a practical Node.js queue with retries, job IDs, delayed work, workers and progress.
- Redis is operationally simple for MVP and widely supported by managed hosts.
- Jobs can run inside the same repository as a worker process while remaining separate from request handling.

The system must still store authoritative operation status in PostgreSQL or durable records. Redis queue state alone is not the business audit trail.

### 4.6 File processing approach

Recommended file processing direction:

- upload originals through controlled domain commands;
- store file metadata and domain ownership in the database;
- store bytes in object storage or local development storage through a narrow storage adapter;
- process DOCX/PDF/ZIP in backend workers;
- never overwrite historical originals or released artifacts in place;
- compute checksums for originals and generated artifacts;
- record exact file identity in revisions and package manifests.

### 4.7 Auth and session direction

Recommended auth direction for MVP:

- email/password or email magic-link can be chosen during bootstrap, but the domain model must remain session-based and workspace-membership-based;
- use secure HTTP-only cookies for browser sessions;
- store session identity server-side;
- derive permissions from active `Membership`, not client-provided role claims;
- keep JWTs out of the browser as the primary app session mechanism unless a later deployment need justifies them;
- support personal workspace creation during registration.

Auth implementation must be boring and auditable. Workspace authorization is more important than adopting a fashionable auth package.

---

## 5. Recommended Database

Recommended database:

```text
PostgreSQL
```

Rationale:

- PTO ID System is relational at its core: workspaces, memberships, objects, documents, revisions, certificates, schemes, links, packages, snapshots, artifacts and audit records.
- PostgreSQL gives transactions, constraints, indexes, JSONB where appropriate, full text search and strong operational maturity.
- It supports the mix of normalized domain data and controlled structured payloads needed for typed documents.
- It is easy to run locally and available on every serious managed hosting platform.

### 5.1 ORM and persistence direction

Recommended persistence direction:

```text
Prisma or a similarly boring TypeScript ORM/query layer, chosen in docs/18/bootstrap
```

The likely first choice is Prisma because it is productive, TypeScript-friendly and common. The implementation must still avoid leaking ORM models as API contracts or domain entities.

Rules:

- ORM schema is not created in this document;
- domain commands should not become raw ORM CRUD wrappers;
- transaction boundaries must be explicit around revisions, finalization, package snapshot creation and membership changes;
- custom SQL is acceptable where PostgreSQL indexing/search needs it.

### 5.2 Transaction reasoning

Use database transactions for:

- creating personal workspace and owner membership during registration;
- finalizing or publishing a document revision;
- confirming evidence metadata;
- changing folder placement with expected version;
- applying numbering changes after confirmed preview;
- creating package snapshot records and manifest references after successful build;
- accepting AI proposal plus target owner command, if AI is later enabled.

Do not wrap long file generation or PDF conversion inside database transactions. Pin source context first, perform async work, then persist operation result and artifact metadata atomically.

### 5.3 JSON usage policy

JSONB is allowed for controlled structured payloads and snapshots where it improves evolvability, but it must not become an untyped dumping ground.

Allowed JSONB uses:

- frozen revision payload snapshot;
- generated package dependency manifest;
- validation finding context/provenance;
- template binding metadata;
- safe UI layout or display configuration;
- captured AI proposal payload before confirmation.

Not allowed:

- replacing core relational links with opaque IDs inside JSON;
- storing all documents as generic JSON without typed contracts;
- hiding tenant or object ownership inside JSON;
- using JSON to bypass constraints on evidence links, revisions, template versions or package manifests.

### 5.4 Search strategy inside the database

PostgreSQL should provide MVP search:

- relational filters by workspace, object, type, status and dates;
- `ILIKE` or trigram search for small metadata sets where enough;
- PostgreSQL full text search for document titles, certificate metadata, scheme titles and registry-visible text;
- generated/searchable columns or search projection tables when needed.

External search engines are deferred.

### 5.5 Versioning strategy

Versioning should combine:

- mutable owner version numbers for optimistic concurrency;
- immutable `DocumentRevisionSnapshot` records for released typed documents;
- immutable `TemplateVersion` after use;
- immutable successful package snapshots with dependency manifests;
- file identity/checksum references for originals and generated artifacts;
- append-oriented audit/activity records for consequential actions.

This is not event sourcing. The system stores current state plus explicit immutable historical records where the domain requires reproducibility.

### 5.6 Migration philosophy

Migration philosophy:

- migrations must be reviewed, deterministic and small;
- no auto-generated migration should be accepted blindly;
- development seed data should be explicit and safe;
- migration names should describe domain intent;
- destructive migrations require backup/recovery thinking even in MVP;
- production data compatibility matters because generated packages must remain explainable over time.

Actual migrations remain blocked until after `docs/18`.

---

## 6. File Storage Strategy

PTO ID System stores files because evidence and generated outputs matter, but it must not become a generic drive.

Recommended storage direction:

```text
Domain-scoped file assets in local development storage and S3-compatible object storage for production
```

### 6.1 Originals

Original files include:

- certificate/declaration/passport originals;
- executive scheme originals;
- uploaded project source files for future AI/OCR;
- template source files and template assets where applicable.

Rules:

- every original has a domain role;
- every original belongs to one workspace and, where applicable, one object;
- physical original file presence is required before file-backed evidence can be used in final output;
- original bytes used in a released revision or package snapshot cannot be silently overwritten;
- checksum, size, content type, storage key and upload attribution must be retained.

### 6.2 Generated artifacts

Generated artifacts include:

- AOSR DOCX;
- AOSR PDF;
- registry export;
- package PDF if supported;
- package ZIP;
- intermediate converted files where retained for preview or audit.

Rules:

- generated artifacts are derived;
- generated artifacts reference exact source revision, template version, registry override version or package snapshot;
- current-use artifacts may become stale;
- historical retained artifacts remain downloadable under retention/access policy;
- artifacts are not edited in place.

### 6.3 Package snapshots

Package snapshots must store:

- immutable manifest;
- included source identities and exact versions;
- file identities included in the package;
- ordering;
- validation outcome and warnings where retained;
- generated ZIP artifact identity;
- build operation identity.

The ZIP file is useful output. The manifest is the explanation of what the ZIP means.

### 6.4 Naming and versioning

Storage keys should be system-generated, not user-path-driven.

Recommended logical pattern:

```text
workspace/{workspace_id}/objects/{object_id}/files/{file_asset_id}/{version_or_checksum}/{safe_filename}
```

The exact pattern is decided later, but principles are fixed:

- stable file identity is database-owned;
- user-visible filename is metadata, not access authority;
- historical versions use new file identities or explicit version/checksum paths;
- no silent overwrite for retained originals or released artifacts.

### 6.5 Retention direction

MVP retention direction:

- soft delete business records first;
- retain originals and artifacts referenced by released revisions or package snapshots;
- allow archive/hide from active pickers without physical deletion;
- defer hard-delete and legal-retention policy until privacy/access review;
- design storage so later retention policies can be implemented without changing domain truth.

### 6.6 Local vs cloud abstraction

Local development can use filesystem storage. Production should use S3-compatible object storage.

The storage abstraction should be narrow:

- put object;
- get signed download/read URL or stream;
- read metadata;
- copy/retain if needed;
- delete only when retention policy permits.

### 6.7 Why generic drive abstraction is forbidden

A generic drive abstraction is forbidden because it breaks domain meaning.

The product needs to know whether a file is:

- certificate original;
- executive scheme original;
- project source;
- template asset;
- generated artifact;
- package ZIP.

These roles determine validation, retention, package inclusion, access, provenance and rebuild behavior. A generic folder/file drive would encourage users and code to bypass structured source of truth.

---

## 7. Document Generation Strategy

Document generation is a core product capability, not an afterthought.

Recommended generation direction:

```text
DOCX templates rendered from structured data, converted to PDF by backend worker, packaged into ZIP snapshots
```

### 7.1 DOCX generation

Recommended DOCX approach:

- use DOCX templates with explicit placeholders and repeatable sections;
- render from frozen structured data and template version;
- use a mature Node.js DOCX templating library;
- keep template binding metadata versioned;
- test generated DOCX against sample data and visual/PDF conversion output.

Likely first implementation direction:

```text
Docxtemplater-style DOCX templating
```

This is practical for Russian executive-document forms because the output format is Word-centric and users expect DOCX downloads.

### 7.2 PDF generation

Recommended PDF approach:

- generate DOCX first from the exact same source context;
- convert DOCX to PDF in a worker using LibreOffice headless or another deterministic server-side converter selected during implementation;
- store conversion status and generated artifact metadata;
- preview generated PDF in the browser.

The first implementation should avoid hand-building complex official-looking forms directly in HTML/CSS PDF unless template fidelity proves better that way. Existing PTO workflows expect Word-compatible forms.

### 7.3 Template approach

Template rules:

- `TemplateVersion` is immutable after use;
- each generated artifact records exact `TemplateVersion`;
- template placeholders must be declared and validated;
- unsupported/missing placeholders should fail generation visibly;
- template changes create a new version;
- migration to a new template version is explicit.

MVP should start with a small number of templates:

- AOSR DOCX template;
- registry export template;
- package cover/structure only if required for first delivery.

No visual template builder in MVP.

### 7.4 Deterministic generation

Generation should be deterministic at the semantic level:

- same source revision;
- same template version;
- same renderer version/configuration;
- same included files;
- same package ordering;
- same registry override version.

The output should be explainable and reproducible. Byte-for-byte identity is nice but not required if renderer metadata/timestamps differ. Semantic reproducibility and manifest provenance are required.

### 7.5 Source data remains authoritative

Generated DOCX/PDF never becomes source of truth.

If a user manually edits downloaded DOCX:

- the system does not import that edit silently;
- source structured data does not change;
- future generated output still comes from structured data;
- any supported correction must be entered through domain forms/commands.

### 7.6 Package ZIP generation

Package ZIP generation must:

- run asynchronously;
- freeze exact inputs into a package manifest;
- include generated registry export;
- include generated AOSR outputs;
- include certificate originals;
- include executive scheme originals;
- preserve configured order through filenames or folder structure;
- store generated ZIP as an artifact tied to the package snapshot.

Package builder must never fix documents, confirm certificates or accept AI proposals during build.

### 7.7 Future renderer extensibility

Future renderer extension is allowed through internal renderer interfaces, not through a generic document builder.

Possible future renderers:

- HTML-to-PDF for specific previews or reports;
- XLSX registry export if needed;
- alternative DOCX template engine;
- customer-specific template family.

Renderer extensibility must preserve typed source data, template versions and artifact provenance.

---

## 8. Search Strategy

MVP search should be useful, tenant-safe and boring.

### 8.1 MVP search

MVP search should cover:

- objects;
- AOSR documents by number, work text, date, status and folder;
- certificates by number, title, issuer, manufacturer, validity and evidence kind;
- executive schemes by title, number, date and system/folder;
- package snapshots and generated artifacts by name/status where useful.

### 8.2 Relational filtering

First search implementation should rely heavily on relational filters:

- workspace;
- object;
- folder;
- document type;
- lifecycle status;
- date ranges;
- evidence kind;
- confirmation status;
- package build/release status.

This matches real PTO workflows better than one magic search box.

### 8.3 Full text search

Use PostgreSQL full text search for searchable text fields when simple filters are not enough.

Searchable content should be derived from confirmed structured metadata and safe extracted/display values. Do not index hidden foreign workspace content or sensitive file contents by default.

### 8.4 Indexing

Indexing direction:

- start with normal B-tree indexes for scope/status/date relationships;
- add trigram indexes for certificate numbers, titles and scheme names if needed;
- add generated search documents or materialized search projection tables only when query shape proves it;
- keep indexing eventual where acceptable, but display freshness caveats when needed.

### 8.5 Deferred semantic/vector search

Semantic/vector search is deferred.

It may be useful later for project source documents, OCR text and AI-assisted lookup, but MVP value comes from:

- structured metadata;
- correct links;
- validation;
- package generation;
- reliable filtering.

Vector search should not be introduced before privacy, consent, indexing scope and source-citation rules are accepted.

---

## 9. AI/OCR Strategy

AI/OCR remains optional and secondary.

### 9.1 MVP baseline

The MVP must work fully without AI/OCR:

- manual certificate metadata entry is acceptable;
- manual executive scheme metadata entry is acceptable;
- manual project basis entry is acceptable;
- manual AOSR filling is acceptable;
- validation must not depend on AI.

### 9.2 Optional OCR

OCR may later help extract:

- certificate number;
- issuer/manufacturer;
- validity dates;
- title/coverage;
- page count;
- scheme title/number/date;
- project source references.

OCR output remains proposal data until user confirmation.

### 9.3 Provider abstraction

Future AI/OCR should be behind provider interfaces:

- OCR provider;
- LLM extraction provider;
- embedding/indexing provider if later approved;
- citation/provenance formatter.

Provider abstraction exists to avoid hard-coding a vendor, but it must not become a premature multi-provider platform.

### 9.4 Async proposal extraction

AI/OCR processing must be asynchronous:

- user uploads or selects source files;
- user requests processing under approved policy;
- operation records provider/model/version/provenance;
- proposals/findings are stored as pending review items;
- user reviews, edits, accepts or rejects;
- accepted proposal dispatches an ordinary domain command.

### 9.5 Human confirmation mandatory

No AI/OCR result can:

- confirm certificate metadata automatically;
- link a certificate to AOSR automatically;
- change document source data automatically;
- mark an engineering conclusion as accepted automatically;
- mutate released revisions;
- suppress validation errors;
- release package snapshots.

Human confirmation is mandatory for every source-of-truth mutation.

### 9.6 Privacy concerns

Before real AI/OCR processing of user files, the project needs accepted policy for:

- provider;
- data-processing jurisdiction;
- whether files leave the hosting environment;
- retention of uploaded files and OCR text;
- retention of rejected/stale proposals;
- user/workspace consent;
- access to source originals and extracted text;
- audit of processing requests.

Until then, AI/OCR can be designed but not assumed as part of MVP operation.

---

## 10. Auth and Workspace Strategy

Auth should be simple, secure and workspace-centered.

### 10.1 Auth direction

MVP direction:

- browser app with secure HTTP-only cookie sessions;
- server-side session validation;
- account identity tied to email;
- password or magic-link flow selected during bootstrap;
- email verification for invite-sensitive flows where required.

Avoid making JWT bearer tokens in local storage the main browser auth strategy.

### 10.2 Sessions and tokens

Session philosophy:

- access is checked on every command/query;
- workspace membership is resolved server-side;
- client never asserts role as authority;
- invite URLs carry opaque tokens only;
- idempotency keys are command retry protection, not auth tokens.

### 10.3 Workspace boundary

Workspace remains tenant boundary:

- every business command runs in one workspace;
- every object, document, evidence, scheme, package, template binding and artifact is scoped;
- no cross-workspace links in MVP;
- copy/transfer/export across workspaces remains deferred policy work.

### 10.4 Invites

Organization workspace invites should:

- be stored server-side;
- have intended role, expiry and revocation;
- optionally bind to email where policy requires;
- create membership atomically on acceptance;
- be auditable.

### 10.5 Future RBAC expansion

MVP should implement coarse roles without overengineering:

- Owner;
- Admin;
- PTO Engineer;
- Foreman;
- Viewer.

Fine-grained object permissions, original-file download policy and commercial entitlements can expand later. The implementation should keep authorization checks centralized enough to evolve, but not build a full policy engine before product fit.

---

## 11. Async Processing Strategy

Async processing is required from MVP because package builds and document generation should not block HTTP requests.

### 11.1 Queue and workers

Recommended implementation:

- API process accepts commands and creates operation records;
- BullMQ enqueues jobs;
- worker process handles generation/build/indexing;
- PostgreSQL stores durable operation and artifact state;
- Redis stores queue execution state.

### 11.2 Package builds

Package build flow:

1. User configures package.
2. Backend validates readiness and package configuration version.
3. Backend creates async operation and queues build.
4. Worker resolves exact document revisions, evidence files, schemes, registry override, templates and ordering.
5. Worker generates needed artifacts.
6. Worker creates immutable package snapshot and ZIP artifact metadata.
7. User reviews/downloads/releases snapshot as allowed.

### 11.3 Artifact generation

Artifact generation flow:

- request pins source context;
- worker renders DOCX;
- worker converts PDF if requested;
- worker stores generated file;
- worker records artifact status, provenance and checksum;
- failed generation returns retry-safe failure information.

### 11.4 AI extraction

Future AI extraction uses the same async operation vocabulary:

- queued;
- running;
- succeeded;
- failed;
- stale;
- reviewed.

It creates proposals/findings only.

### 11.5 Retries

Retries must be explicit and safe:

- transient converter/storage failures can retry automatically within limits;
- domain validation failures are not fixed by retry;
- successful immutable snapshots/artifacts are not overwritten by retry;
- retry creates a new attempt or returns same idempotent accepted attempt according to operation semantics.

### 11.6 Idempotency

Idempotency is required for:

- upload completion;
- create document where retried by client;
- finalize/publish document;
- request package build;
- release package snapshot;
- request artifact generation;
- accept invite;
- accept AI proposal.

### 11.7 Failure handling

Failures must expose:

- operation id;
- safe reason;
- failed stage;
- retry eligibility;
- whether user action is needed;
- links back to validation findings or source owners.

Failure must never leave source data half-mutated by a derived worker.

---

## 12. Validation Implementation Strategy

Validation is product logic, not just form plumbing.

### 12.1 Domain validation

Create a domain validation layer that evaluates rules against read models or domain state:

- draft AOSR validation;
- AOSR finalization validation;
- certificate applicability by document date;
- scheme readiness;
- numbering collision;
- registry override safety;
- package readiness;
- package release/build dependencies;
- template availability.

### 12.2 Reusable validation rules

Rules should be reusable by context:

- a missing certificate original may appear in document finalization and package readiness;
- numbering collision may appear in editor, renumber preview and finalization;
- stale generated output may appear in document list, package builder and artifact history;
- template availability may appear in document editor and package build.

Implementation should keep rule codes stable for UI, tests and future documentation.

### 12.3 ERROR and WARNING handling

`ERROR`:

- blocks the relevant gate;
- must identify source owner and suggested fix;
- cannot be hidden by registry override or package ordering.

`WARNING`:

- does not block by baseline;
- must be visible and explain risk;
- may be captured in release/build context where policy requires;
- can never override an `ERROR`.

### 12.4 Explainable validation UX support

Validation result must include enough data for UX:

- severity;
- stable code;
- message;
- source entity;
- affected field or relation;
- blocking gate;
- suggested action;
- provenance;
- evaluated version/context.

The frontend should be able to show "what is wrong, why it matters, where to fix it."

### 12.5 Version-aware validation

Validation must be version-aware:

- draft validation evaluates current working state;
- finalization pins the exact working version;
- package readiness evaluates latest released revisions and selected package configuration;
- historical package snapshots retain the validation context used at build/release;
- certificate expiry is evaluated by document date, not current date.

---

## 13. Frontend UX Strategy

The MVP UI must help PTO engineers finish real work without hiding the domain model so much that errors become mysterious.

### 13.1 Onboarding hints

MVP should include:

- first object empty-state guidance;
- first AOSR guidance;
- certificate library empty state;
- executive schemes empty state;
- package builder first-run guidance;
- "do not show again" for repeated hints.

Guidance must be contextual and dismissible.

### 13.2 Empty states

Empty states should offer direct next actions:

- create object;
- upload certificate;
- upload scheme;
- create AOSR;
- configure participants;
- build package.

They should not explain the whole product in long text blocks.

### 13.3 Contextual guidance and tooltips

Use tooltips and short helper text for:

- certificate validity by document date;
- final document revision behavior;
- generated artifact stale state;
- registry row provenance;
- package snapshot immutability;
- numbering scope;
- file-backed evidence requirement.

### 13.4 Validation explanation

Validation findings should be central to UX:

- section badges;
- validation panel;
- inline field messages;
- jump-to-source action;
- package readiness report;
- warnings preserved around release/build where needed.

### 13.5 Large-form usability

AOSR editor should support:

- sections with clear completion state;
- sticky validation/save status where useful;
- autosave indicators;
- keyboard-friendly fields;
- repeatable material rows;
- fast certificate picker;
- participant defaults and overrides;
- no giant single flat form.

### 13.6 Keyboard-heavy workflows

Experienced PTO users should be able to:

- tab through fields predictably;
- search and select certificates quickly;
- add material rows without mouse-heavy flows;
- reorder package items efficiently;
- use command buttons without modal detours.

### 13.7 Experienced-user friendliness

The product should not trap experienced users in tutorials.

Rules:

- hints are dismissible;
- repeated confirmations are limited to consequential operations;
- defaults should be good;
- screens should remember useful local preferences;
- no mandatory wizard for every document after first setup.

### 13.8 No modal hell

Avoid stacking modals for ordinary work.

Prefer:

- side panels;
- inline editors;
- dedicated detail screens;
- popovers for small choices;
- confirmation dialogs only for irreversible or consequential actions such as release, supersede, destructive archive, or finalizing with warnings.

---

## 14. Recommended Repository Structure

The structure below is conceptual only. It must not be scaffolded until after `docs/18` is accepted.

Recommended high-level repository shape:

```text
apps/
  web/                 React + Vite frontend
  api/                 NestJS modular monolith HTTP API
  worker/              Background workers for generation/build/AI/search

packages/
  contracts/           Shared command/read-model/value vocabulary
  domain/              Domain types, validation rule vocabulary, pure helpers
  ui/                  Optional shared UI primitives after web patterns stabilize
  config/              Shared lint/test/tsconfig only if useful

templates/
  aosr/
  registry/
  package/

docs/
  adr/
  samples/
```

Guidelines:

- `apps/api` and `apps/worker` may share application modules or package code, but worker execution must remain operationally separate;
- `packages/contracts` should contain stable conceptual vocabulary, not every internal database type;
- `packages/domain` should avoid importing framework/ORM code;
- templates are source assets with versioning policy, not generated output;
- generated files and uploads do not live in the repository;
- do not introduce many packages before there is real reuse.

---

## 15. Observability and Reliability

MVP observability should be practical and enough to debug real customer issues.

### 15.1 Logging

Use structured logs with:

- request id;
- command id;
- workspace id where safe;
- object id where safe;
- actor membership id where safe;
- async operation id;
- job id;
- error code/stage.

Logs must avoid dumping sensitive file contents, personal data or full document payloads.

### 15.2 Audit trail direction

Audit/activity records are domain records, not just logs.

Capture:

- document finalization/revision;
- certificate confirmation/supersession;
- scheme confirmation/supersession;
- package build/release;
- generated artifact creation/failure;
- invite issuance/acceptance/revocation;
- AI proposal review if enabled;
- consequential permission changes.

### 15.3 Async monitoring

Async operations need visible status:

- queued;
- running;
- succeeded;
- failed;
- retry eligible;
- stale after source changes.

Operators need enough logs/metrics to diagnose stuck jobs and converter failures.

### 15.4 Error tracking

Use an error tracking service or self-hosted equivalent once implementation starts. Capture unhandled exceptions, worker crashes and failed generation stages with correlation IDs.

### 15.5 Backup and recovery philosophy

Backups must cover:

- PostgreSQL;
- object storage files;
- template source assets;
- generated retained artifacts;
- mapping between database file identities and storage keys.

Database backup without file storage is not enough. File storage without manifests and revisions is not enough.

### 15.6 Package reproducibility importance

Reliability is measured partly by whether an old package can be explained and regenerated or re-downloaded.

The system must preserve:

- exact source revision references;
- template versions;
- original file identities;
- package ordering;
- registry override version;
- generated artifact identity;
- validation context.

---

## 16. Deployment Strategy

Deployment should be simple and boring for MVP.

### 16.1 MVP deployment philosophy

Recommended first production shape:

- one web frontend deployment;
- one API process;
- one worker process;
- PostgreSQL;
- Redis;
- object storage;
- managed logs/error tracking;
- scheduled backups.

This can run on a small managed platform, VPS, PaaS or container host. The decision should optimize for reliability and low operational burden.

### 16.2 Environments

Minimum environments:

- local development;
- staging;
- production.

Staging should have realistic document generation and storage behavior, not only mocked APIs.

### 16.3 Storage concerns

Production must use durable object storage. Local filesystem storage is acceptable only for development and temporary test environments.

Generated artifact and original file storage must be backed up or otherwise durable according to retention policy.

### 16.4 Backup strategy

Backups should be designed before handling real production files:

- daily PostgreSQL backups at minimum;
- object storage versioning or backup policy;
- restore test procedure;
- retention window appropriate for customer risk;
- documentation of recovery steps.

### 16.5 Scaling philosophy

Scale vertically and split worker concurrency first.

Expected early bottlenecks:

- PDF conversion;
- ZIP generation;
- file upload/download bandwidth;
- large registry/package reads.

Do not split microservices before these bottlenecks are real.

### 16.6 Kubernetes

Kubernetes is not recommended for first MVP unless the chosen hosting environment already provides it in a managed, low-burden way.

The MVP does not need Kubernetes complexity to prove AOSR, evidence, registry and package workflows.

---

## 17. Explicitly Rejected Choices

The following choices are intentionally rejected for MVP.

| Rejected choice | Why rejected |
| --- | --- |
| Microservices first | Adds deployment, network, consistency and observability cost before product fit. Modular monolith is enough. |
| Event sourcing | Historical revisions and package manifests are required, but full event sourcing would overcomplicate MVP. |
| Premature CQRS split | Commands and read models are conceptually separated, but separate databases/projection infrastructure are not needed first. |
| Generic low-code builders | Would undermine typed AOSR/evidence/package rules and source-of-truth model. |
| Generic document constructor | Rejected by ADR 0002; first product must understand AOSR, certificates, schemes and packages. |
| Heavy BPM/workflow engines | MVP needs domain commands and async jobs, not enterprise process modeling. |
| Offline-first architecture | Adds sync/conflict complexity not needed for first web MVP. |
| Real-time collaborative editing | Locks/autosave are enough initially; Google Docs-style collaboration is not MVP. |
| Generic drive/file manager | Files have domain roles and validation meaning; generic folders would bypass evidence rules. |
| AI-autonomous workflows | AI cannot mutate source data, confirm metadata, release documents or suppress validation. |
| Vector database in MVP | Structured metadata and PostgreSQL search are enough first; privacy/indexing policy is not ready. |
| Elasticsearch/OpenSearch first | Operational overhead is not justified before PostgreSQL search is exhausted. |
| Kubernetes first | Not needed for small API/worker/database/storage MVP. |
| Serverless-only backend | Long-running document generation, file conversion and package builds fit worker processes better. |
| Browser DOCX editor | Manual DOCX editing must not become source of truth. |
| PDF as source data | Violates structured source-of-truth principle. |
| Heavy enterprise UI suite by default | May slow UX customization for PTO workflows and forms. |
| Separate backend language by default | Increases small-team maintenance unless a concrete processing need appears. |

---

## 18. Implementation Risks

### 18.1 Biggest technical risks

The largest risks are not framework risks. They are domain execution risks:

- first AOSR template may be more variable than expected;
- validation rules may grow faster than UI can explain them;
- generated DOCX/PDF fidelity may require template iteration;
- file retention and historical reproducibility may be underdesigned;
- package build edge cases may expose missing dependency modeling;
- users may expect Excel-like registry editing despite derived projection rules.

### 18.2 Document generation risks

Risks:

- DOCX placeholder mistakes create broken output;
- LibreOffice conversion can vary across environments;
- fonts/layout may differ between local and production;
- page numbering/attachments/order may be hard to match;
- customer-specific forms may pressure the product toward a template builder too early.

Mitigation:

- start with one accepted AOSR template;
- render sample data repeatedly;
- verify PDF output in staging;
- version renderer/container configuration;
- keep template version immutable after use.

### 18.3 Validation complexity risks

Risks:

- too many warnings can make users ignore validation;
- blocking rules may be too strict for real PTO practice;
- validation provenance may be missing, making errors hard to fix;
- package readiness may duplicate document validation poorly.

Mitigation:

- stable rule codes;
- severity discipline;
- user-facing explanations;
- tests for validation rules;
- backend-authoritative findings rendered consistently in UI.

### 18.4 UX risks

Risks:

- large AOSR form feels like bureaucracy instead of automation;
- certificate linking is slower than typing certificate numbers manually;
- package builder becomes confusing if snapshot/stale concepts are unclear;
- onboarding hints annoy experienced users.

Mitigation:

- fast pickers;
- linked `ObjectTemplate` assignments and participant reuse, with explicit whole-act manual mode;
- contextual validation;
- dismissible hints;
- keyboard-friendly editing;
- direct source navigation from registry and package views.

### 18.5 File/versioning risks

Risks:

- originals accidentally overwritten;
- generated artifacts detached from source revisions;
- storage keys treated as user-visible paths;
- database backup and object storage backup fall out of sync;
- hard delete policy appears late.

Mitigation:

- immutable file identity for historical use;
- checksums;
- package manifests;
- storage adapter with retention guardrails;
- restore testing before real production use.

---

## 19. Recommended First Coding Milestones

Coding remains blocked until after review of `docs/17` and acceptance of `docs/18`. Once allowed, recommended implementation order is:

### Milestone 1: Repository bootstrap and development rules

Create the minimal monorepo and tooling only after `docs/18`:

- workspace/package manager;
- TypeScript configuration;
- lint/format/test baseline;
- web/api/worker placeholders only as approved;
- local development instructions;
- no domain shortcut scaffolding that bypasses architecture.

### Milestone 2: Vertical skeleton without domain breadth

Build the smallest authenticated vertical skeleton:

- user registration/login;
- personal workspace creation;
- workspace switcher;
- create object;
- basic object dashboard;
- command/result/error pattern.

Validate first:

- session security;
- workspace isolation;
- command envelope;
- optimistic version shape;
- basic audit attribution.

### Milestone 3: File asset foundation

Implement domain-scoped uploads before AOSR output:

- certificate original upload;
- executive scheme original upload;
- file metadata/checksum/storage adapter;
- local storage in development;
- access checks;
- no generic file drive.

Validate first:

- retained file identity;
- workspace/object scope;
- no overwrite of referenced files.

### Milestone 4: Certificate library and scheme library MVP

Implement:

- manual certificate metadata entry and confirmation;
- certificate search/picker read model;
- executive scheme metadata and confirmation;
- lifecycle status needed for AOSR linking.

Validate first:

- file-backed evidence rule;
- confirmation before final use;
- certificate validity by document date warning.

### Milestone 5: AOSR editor first vertical slice

Implement one AOSR form workflow:

- create draft;
- edit structured fields;
- participants;
- work/location;
- numbering;
- link certificates and schemes;
- draft validation;
- autosave/conflict baseline.

Validate first:

- large-form UX;
- backend validation findings;
- source navigation from validation panel;
- expected version conflicts.

### Milestone 6: AOSR finalization and revision

Implement:

- finalization gate;
- immutable released revision;
- edit final through new working revision;
- stale generated/package markers;
- revision history read.

Validate first:

- old revision immutability;
- finalization blocked by `ERROR`;
- warnings visible but non-blocking by baseline.

### Milestone 7: DOCX/PDF generation prototype

Implement the first real generation prototype:

- accepted AOSR DOCX template;
- DOCX render from released revision;
- PDF conversion;
- artifact metadata/provenance;
- PDF preview/download.

Validate first:

- template fidelity;
- deterministic source/template references;
- failure handling.

This should be the first serious demo/prototype after the skeleton: fill AOSR, finalize it, generate DOCX/PDF, preview PDF.

### Milestone 8: Derived registry MVP

Implement:

- registry preview from released AOSR, certificates, schemes and project drawing set;
- safe presentation overrides;
- registry export generation.

Validate first:

- no source fact editing in registry;
- provenance navigation;
- override safety.

### Milestone 9: Package builder MVP

Implement:

- package configuration;
- default order: registry, certificates, acts, schemes;
- manual ordering;
- readiness validation;
- async build;
- immutable snapshot;
- ZIP artifact.

Validate first:

- async progress/failure;
- manifest completeness;
- stale behavior after source changes;
- retained package download.

### Milestone 10: Polish for first pilot

Implement:

- onboarding hints;
- empty states;
- validation explanations;
- search/filter improvements;
- backup/restore rehearsal;
- error tracking;
- first pilot seed/demo data.

Validate first:

- full empty-to-package workflow;
- no AI/OCR dependency;
- no manual DOCX/Excel as source of truth.

---

## 20. Final Pre-Coding Gate

After review of this document, the project may proceed to:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

Only after both conditions are met may actual coding/scaffold begin:

1. `docs/17-tech-stack-and-implementation-strategy-v1.md` is reviewed and accepted or corrected.
2. `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` is reviewed and accepted.

Until then, coding remains blocked:

- no production code;
- no frontend/backend scaffold;
- no source folders;
- no package manifests;
- no SQL migrations;
- no ORM schema;
- no OpenAPI;
- no Docker/CI/deployment files.

The selected direction is intentionally pragmatic: React, TypeScript, NestJS modular monolith, PostgreSQL, Redis-backed async jobs, domain-scoped file storage, deterministic DOCX/PDF/ZIP generation, PostgreSQL-first search and optional proposal-only AI/OCR later.
