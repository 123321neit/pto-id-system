# API Module Architecture

This backend starts as a NestJS modular monolith. The folders in this directory
are canonical architecture boundaries, not feature implementations. They exist
to make ownership visible before database schema, controllers, services, queues,
storage, package generation, AI/OCR, or domain behavior are introduced.

## Module Map

| Module | Owns | Must not own |
| --- | --- | --- |
| `workspace` | Workspace boundary, membership vocabulary, tenant isolation contracts. | Business documents, evidence, registry rows, generated artifacts, provider adapters. |
| `documents` | Typed documents, revisions, and finalization lifecycle boundaries. | Generated artifacts, package snapshots, certificate originals, executive scheme originals. |
| `evidence` | Certificates, executive schemes, and file-backed evidence boundaries. | Generated package ownership, typed document source data, registry source facts. |
| `registry` | Derived registry projections and presentation-only override boundaries. | Source-of-truth fields, document/evidence mutation, package snapshots. |
| `packages` | Package build boundary, snapshots, generated artifact ownership, async orchestration contracts. | Source document ownership, evidence originals, registry source facts, synchronous package execution. |
| `ai` | Proposal and finding boundaries for future AI/OCR-assisted review. | Autonomous source mutation, validation suppression, evidence confirmation, finalization, package release. |
| `shared-kernel` | Shared primitives, scope vocabulary, and framework-neutral interfaces. | Business aggregates, repositories, use cases, provider details. |
| `infrastructure` | Provider adapter boundaries, infrastructure tokens, Prisma bootstrap, and technical database health adapters. | Domain ownership, source-of-truth decisions, provider types leaking into modules. |
| `health` | Technical runtime health endpoint and technical dependency status only. | Product API contracts, domain readiness, business health semantics. |

## Dependency Direction

- `AppModule` composes runtime modules.
- Bounded modules may use `shared-kernel` primitives and their own local
  contracts, ports, and tokens.
- Bounded modules must not import sibling module internals directly. Future
  collaboration must go through explicit contracts or an application-level
  orchestration decision.
- Bounded modules must not import `infrastructure` directly. Provider access is
  composed at module roots after a separate infrastructure task.
- The `health` module may report infrastructure dependency status through narrow
  technical health ports. It must not import provider SDKs, Prisma client types,
  domain modules, repositories, or business readiness checks.
- `infrastructure` must not import bounded domain modules. Adapters depend on
  narrow ports/contracts, not on domain internals.
- `shared-kernel` must stay framework-neutral and must not import NestJS,
  Prisma, provider SDKs, or bounded modules.

## Source Of Truth

Structured domain data remains the source of truth. DOCX, PDF, registry exports,
generated previews, package ZIP files, retained artifacts, cached projections,
and AI/OCR outputs are derived.

Source changes must be routed to the owning module:

- document facts to `documents`;
- file-backed evidence facts to `evidence`;
- workspace access and isolation facts to `workspace`;
- registry ordering, visibility, and notes to `registry` as presentation-only
  overrides;
- package manifests and generated outputs to `packages`;
- AI/OCR suggestions to `ai` as proposals or findings only.

## Revision And Package Invariants

- Released document revisions are immutable historical records.
- Correcting a final document creates a new revision path; it does not rewrite
  the released revision.
- Successful package snapshots are immutable.
- Package builds are asynchronous and snapshot-based once implemented.
- Registry results captured into a package snapshot are historical derived
  results, not editable source facts.
- Generated artifacts cite exact source context and may become stale; they do
  not mutate source data.

## Infrastructure Isolation

Infrastructure is replaceable. Database clients, queue libraries, object storage
SDKs, AI providers, renderer integrations, download URLs, server paths, public
hosts, buckets, regions, and provider-specific types belong behind adapter
boundaries.

Domain/application modules must not import provider SDKs, Prisma client types,
BullMQ, Redis clients, object-storage SDKs, or server-local path assumptions.
The current database foundation contains a Prisma client adapter only inside
`infrastructure/database` and an empty Prisma schema with no domain models.
Domain/application modules must not import Prisma client types or database
adapters. The skeleton intentionally contains no storage implementation, queue
workers, controllers with domain behavior, repositories, or OpenAPI contracts.

## Current Status

This is an architecture skeleton plus technical database foundation only. It
introduces canonical backend module boundaries, placeholder tokens/ports, import
guardrails, Prisma generation wiring, an empty Prisma schema, and a technical
database health adapter. It does not implement AOSR, domain Prisma models,
migrations, CRUD APIs, auth, uploads/storage, package generation, AI/OCR,
repositories, use cases, queue jobs, validation rules, or business logic.
