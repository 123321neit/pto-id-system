# ADR 0002: Typed Document Domain Model

## Title

Typed document domain model.

## Status

Accepted.

This ADR is part of the canonical ADR baseline accepted on 2026-05-28. It consolidates existing project decisions only and does not introduce new architecture, scope, schema, API, or implementation permission.

## Context

Executive documentation is not a collection of arbitrary forms. AOSR, testing acts, certificates, executive schemes, registry rows, and package outputs have different responsibilities, validation rules, evidence links, lifecycle rules, and generated output behavior.

The accepted project documents already require typed documents instead of generic low-code forms or generic CRUD records. AOSR is the first mandatory first-class typed document for MVP. `TestAct` and `TechnicalReadinessAct` remain deferred from first production delivery until concrete typed forms, payloads, templates, and validation rules are separately ratified.

Typed documents must work inside the broader accepted constraints: structured source of truth, derived registry, file-backed evidence, immutable revisions/snapshots, async package build, AI proposal-only, workspace isolation, no cross-workspace leakage, no server lock-in, and no provider SDK leakage outside infrastructure adapters.

## Decision

PTO ID System uses a typed document domain model.

Each executable document has an immutable document type. The type determines its structured payload contract, validation, relationships, lifecycle behavior, registry projection, package inclusion, template binding, generated outputs, and search/read-model semantics.

AOSR is a first-class typed document represented by structured AOSR payload inside the `Document` aggregate. It is not a DOCX/PDF master, not a generic form, not a generic JSON blob, not a registry row, and not a low-code form definition.

The backend/application model must use explicit domain commands and bounded owners. It must not expose a generic CRUD domain where clients can patch arbitrary records, tables, document blobs, or registry rows as if those were the domain model.

## Consequences

- Each approved document type requires an explicit payload contract and validation semantics.
- Faster arbitrary form creation is intentionally traded for domain correctness, registry consistency, package correctness, and reproducible output.
- Generic extension points may exist only inside an approved typed contract and cannot remove required relationships or validation.
- AOSR implementation must preserve its evidence links, participants, numbering/date, revision rules, template provenance, and package/registry behavior as first-class domain concepts.
- Future `TestAct` or `TechnicalReadinessAct` support requires separate ratification before finalizable/generated typed forms are implemented.

## Explicitly Rejected Alternatives

- Generic low-code builder as the foundation for executive documents.
- Generic document engine where forms define meaning without typed domain contracts.
- Generic CRUD domain over tables, rows, blobs, or arbitrary JSON payloads.
- Treating AOSR as a DOCX template plus user-filled text fields.
- Treating registry rows as substitutes for typed document payloads.
- Implementing `TestAct` or `TechnicalReadinessAct` as name-only/free-form generated documents before concrete form ratification.
- AI-generated document content becoming confirmed source data without user review and domain command validation.

## Invariants That Must Not Be Violated

- `DocumentType` is immutable after document creation.
- AOSR is the first mandatory first-class typed document for MVP.
- Typed payloads, not DOCX/PDF or registry rows, own document meaning.
- Generic document builders, generic low-code builders, and generic CRUD mutation surfaces are forbidden for the domain model.
- Registry remains a derived projection over typed documents and related source entities.
- Package build remains asynchronous and snapshot-based.
- AI/OCR remains proposal-only and cannot auto-approve typed document fields, evidence links, finalization, validation outcomes, or package release.
- Every document, projection, package, artifact, proposal, and read model is workspace-scoped; no cross-workspace leakage is allowed.
- No server/provider lock-in and no provider SDK leakage outside infrastructure adapters.

## Implementation Implications

- Application commands must be named by PTO intent, such as create, update working content, finalize, revise, attach certificate, attach executive scheme, request validation, and request generation.
- Read models should be screen-oriented for the AOSR editor, evidence pickers, registry preview, package builder, validation panel, artifacts, and activity rather than generic table dumps.
- Storage can use structured tables or controlled JSONB only when the approved type contract and validation remain explicit.
- Generated artifacts must cite the exact typed document revision and template version.
- API, frontend, and backend modules must preserve owning aggregate boundaries and route changes to the correct owner.

## Related Documents

- `docs/PROJECT_MEMORY.md`
- `docs/06-data-model-v1.md`
- `docs/07-aosr-domain-specification.md`
- `docs/09-aggregate-boundaries-and-invariants.md`
- `docs/12-database-schema-v1.md`
- `docs/13-domain-lifecycle-immutability-validation-v1.md`
- `docs/14-backend-api-architecture-v1.md`
- `docs/15-api-command-readmodel-contracts-v1.md`
- `docs/16-mvp-scope-and-first-forms-v1.md`
- `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`
