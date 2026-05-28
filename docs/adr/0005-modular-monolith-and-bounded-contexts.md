# ADR 0005: Modular Monolith and Bounded Contexts

## Title

Modular monolith first with bounded contexts.

## Status

Accepted.

This ADR is part of the canonical ADR baseline accepted on 2026-05-28. It consolidates existing project decisions only and does not introduce new architecture, scope, schema, API, or implementation permission.

## Context

PTO ID System needs clear domain boundaries for workspace/tenant isolation, object setup, folder trees, typed documents, evidence, executive schemes, registry projection, package builder, templates, generated artifacts, project source ingestion, AI proposals, validation, search, and audit.

The accepted implementation strategy chooses a pragmatic first backend: TypeScript on Node.js LTS with NestJS modular monolith, explicit command/query API, PostgreSQL, Redis/BullMQ async jobs, domain-scoped storage, and bounded application modules. The goal is small-team maintainability and domain clarity, not premature distribution.

The system must also preserve no server lock-in, infrastructure adapter isolation, no provider SDK leakage, workspace isolation, no cross-workspace leakage, derived registry, async package build, immutable snapshots/revisions, and AI proposal-only processing.

## Decision

PTO ID System starts as a modular monolith.

The first backend is one deployable application with explicit bounded modules aligned to domain ownership and workflow boundaries. Bounded contexts/modules include, at minimum conceptually, workspace/tenant, object documentation context, folder tree, typed documents, evidence library, executive schemes, registry projection, package builder, templates, generated artifacts, project source ingestion, AI review proposals, validation, search/indexing, and audit/activity.

State changes must be expressed as explicit domain commands to the owning module/aggregate. Read models may be optimized for PTO screens. The system must not expose generic CRUD-first APIs over domain tables or generic document/file mutation surfaces.

Infrastructure adapters are isolated. Provider-specific SDKs and server/provider assumptions must not leak into domain services, command handlers, validation rules, package builder domain logic, frontend code, or shared contracts.

## Consequences

- The first implementation can run, test, deploy, and debug as a small system while preserving future split boundaries.
- Cross-module orchestration is allowed, but ownership remains explicit.
- Derived work such as registry rebuilds, package builds, artifact generation, search indexing, and AI/OCR processing can be eventual without mutating source owners.
- Future extraction into services is possible only after real load, organizational pressure, or operational evidence justifies it.
- Infrastructure portability remains a required design constraint from the beginning.

## Explicitly Rejected Alternatives

- Microservices first.
- Event sourcing as the first persistence/application model.
- Premature physical CQRS split with separate databases/projection infrastructure.
- Generic CRUD-first backend over domain tables.
- Generic document constructor, generic low-code builder, or generic file drive as application architecture.
- Provider-specific application logic, server-local durable paths, hardcoded hosts, or provider SDK leakage outside infrastructure adapters.
- Splitting modules by technical layer in a way that hides domain ownership and makes source mutation paths ambiguous.

## Invariants That Must Not Be Violated

- Modular monolith is the first backend shape.
- Bounded contexts must match domain owners and invariants, not arbitrary screens or database tables.
- Explicit domain commands mutate state; generic CRUD mutation surfaces are forbidden.
- Registry, generated artifacts, package outputs, search indexes, and AI findings are derived/eventual where applicable and cannot own source facts.
- Package build remains asynchronous and snapshot-based.
- Workspace is the tenant boundary for every command, query, job, file, proposal, artifact, projection, and package result.
- No cross-workspace leakage through errors, search, counts, file references, jobs, logs, or read models.
- No server lock-in: provider/server details are configuration and adapter concerns.
- Provider SDKs must remain inside narrow infrastructure adapters.
- AI/OCR remains proposal-only and cannot autonomously mutate source data, release revisions, or package snapshots.

## Implementation Implications

- Code organization should make module ownership visible, even before every module has business implementation.
- Command handlers must validate workspace membership, object scope where applicable, expected versions/idempotency, and domain invariants before mutation.
- Read models should be composed for user workflows, but must carry provenance and links back to authoritative owners.
- Infrastructure concerns such as database clients, Redis/BullMQ, storage SDKs, download URL generation, provider configuration, and file paths must live behind adapter/config boundaries.
- Future service extraction must preserve the same source-of-truth, revision/snapshot, registry, evidence, AI, workspace, and portability invariants.

## Related Documents

- `docs/PROJECT_MEMORY.md`
- `docs/09-aggregate-boundaries-and-invariants.md`
- `docs/12-database-schema-v1.md`
- `docs/13-domain-lifecycle-immutability-validation-v1.md`
- `docs/14-backend-api-architecture-v1.md`
- `docs/15-api-command-readmodel-contracts-v1.md`
- `docs/16-mvp-scope-and-first-forms-v1.md`
- `docs/17-tech-stack-and-implementation-strategy-v1.md`
- `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`
