# ADR 0001: Structured Data Source of Truth

## Title

Structured data is the source of truth.

## Status

Accepted.

This ADR is part of the canonical ADR baseline accepted on 2026-05-28. It consolidates existing project decisions only and does not introduce new architecture, scope, schema, API, or implementation permission.

## Context

PTO ID System produces executive documentation where users expect DOCX, PDF, registry exports, package ZIP files, and other generated outputs. In manual PTO workflows those files often become the practical master records.

The accepted project architecture rejects that pattern. Existing decisions in `docs/PROJECT_MEMORY.md`, `docs/06-data-model-v1.md`, `docs/12-database-schema-v1.md`, `docs/13-domain-lifecycle-immutability-validation-v1.md`, `docs/16-mvp-scope-and-first-forms-v1.md`, and `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` already state that the durable truth is confirmed structured domain data, explicit relations, revisions, snapshots, and provenance.

The system must also preserve workspace isolation, avoid cross-workspace leakage, keep AI/OCR proposal-only, keep registries derived, run package builds asynchronously, and avoid server/provider lock-in including provider SDK leakage outside infrastructure adapters.

## Decision

The source of truth for PTO ID System is structured domain data.

DOCX, PDF, XLSX/registry exports, package ZIP files, generated previews, cached projections, and retained output files are derived artifacts or derived projections. They explain, render, export, or package structured data; they do not own the meaning of the document, evidence, registry, or package.

Generated DOCX/PDF files are not imported back through a roundtrip workflow as canonical source data. Manual edits to exported files do not mutate structured data. Any supported correction must be entered through domain forms or explicit domain commands.

The registry is not an editable source table. It is a derived projection from object data, typed document revisions, file-backed evidence, executive schemes, drawing sets, package/registry presentation configuration, and allowed overrides.

AI/OCR may propose values, links, and findings, but only explicit user confirmation and normal domain commands can change structured source data.

## Consequences

- Domain entities, typed payloads, confirmed metadata, relationships, revisions, snapshots, and provenance must exist independently from generated files.
- Document generation and registry/package outputs can be regenerated or marked stale when dependencies change.
- UI workflows may offer document-like editing, previews, and exports, but saving must persist structured data, not DOCX/PDF bytes as the master.
- Registry and package screens must route source corrections to the owning aggregate instead of storing corrected source facts locally.
- AI/OCR acceleration remains optional and cannot become an autonomous mutation path.
- Storage and download links must remain provider-neutral; generated artifact links are resolved through storage/download services rather than permanent server-local paths.

## Explicitly Rejected Alternatives

- DOCX, PDF, or exported package files as canonical document state.
- DOCX/PDF roundtrip import as the ordinary source-of-truth editing workflow.
- Registry rows as editable owner records for document numbers, dates, evidence metadata, scheme metadata, or company facts.
- A generic file drive where user paths define domain meaning or access authority.
- AI/OCR auto-fill, auto-approval, auto-finalization, or validation suppression.
- Provider-specific storage URLs, absolute server paths, or provider SDK types leaking into domain/application code, shared contracts, frontend code, validation rules, or package builder domain logic.

## Invariants That Must Not Be Violated

- Structured domain data and explicit relations are the authoritative state.
- DOCX, PDF, registry exports, package ZIPs, generated previews, cached rows, and retained artifacts are derived.
- Registry is always a derived projection and never an editable source of primary facts.
- Package build is asynchronous and snapshot-based.
- AI/OCR is proposal-only and requires human confirmation before source mutation.
- Every business operation remains scoped by workspace; no cross-workspace data leakage or implicit cross-workspace reference is allowed.
- No server lock-in: deployment/provider details must be configuration and infrastructure concerns.
- Provider SDKs must stay inside narrow infrastructure adapters.

## Implementation Implications

- Persistence must model typed source data, confirmed metadata, explicit links, revisions, snapshots, artifact provenance, and tenant/workspace scope.
- Generation requests must pin exact source inputs such as document revision, template version, registry override, package snapshot, and file identities.
- Export/import features must not silently mutate source data from generated files.
- Registry edit affordances must distinguish presentation-only overrides from source edits routed to owning domain commands.
- Package and artifact staleness must be derived from dependency changes, not from rewriting historical outputs.
- Storage references must be opaque and resolved through adapter-backed services so local development storage and S3-compatible production storage can be swapped without domain rewrites.

## Related Documents

- `docs/PROJECT_MEMORY.md`
- `docs/06-data-model-v1.md`
- `docs/07-aosr-domain-specification.md`
- `docs/09-aggregate-boundaries-and-invariants.md`
- `docs/12-database-schema-v1.md`
- `docs/13-domain-lifecycle-immutability-validation-v1.md`
- `docs/14-backend-api-architecture-v1.md`
- `docs/16-mvp-scope-and-first-forms-v1.md`
- `docs/17-tech-stack-and-implementation-strategy-v1.md`
- `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`
