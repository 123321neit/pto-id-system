# ADR 0006: Global Reusable Libraries and Act Snapshots

## Title

Global reusable libraries and act snapshots.

## Status

Accepted.

This ADR records the reusable-entity architecture decision accepted on 2026-06-11. It does not introduce schema, migrations, API routes, backend behavior, uploads, generation, auth or production feature implementation.

Update 2026-06-17: ADR 0007 refines this decision for active working acts. Working acts may remain live-linked to the object template and reusable libraries until the user explicitly switches the act to a full manual snapshot. Historical stability still applies to issued/frozen outputs and manual snapshots.

## Context

PTO ID System reuses certificates, organizations and representatives across objects, acts, registries and packages. Earlier conceptual documents already separated structured source data, file-backed evidence, object bindings, typed documents and immutable released outputs, but the reusable boundaries for representatives, organizations and certificates needed a precise rule.

The risk is historical drift. If an already formed act reads live organization, representative or certificate values directly, then later edits to a global library card could silently change old printed documents. The opposite risk is duplicate object-owned libraries: if every object owns separate certificate, organization or representative copies, reuse, search, deduplication, certificate provenance and package assembly become unreliable.

## Decision

Certificates, organizations and representatives are global user-level reusable libraries.

Objects do not own separate certificate, organization or representative libraries. Objects store links, assignments or bindings to global entities and may hold object-specific details for those assignments.

Representatives and organizations may have object-specific assignment details, including role, position, authority basis/order, organization relation, captions, ordering and other printed context. The same global representative can therefore be assigned differently on different objects.

Acts must not accept free-text signatories, organizations or certificates as the final data model. The correct flow is:

1. search the global library;
2. select an existing entity;
3. or create a new entity from the search flow;
4. store the newly created entity in the global library first;
5. then link or assign it to the current object or act.

When an organization, representative or certificate is included in an act, the act must store a snapshot of the required printed details. Required printed details include representative full name, position, organization, authority basis/order, role in the act, organization labels/requisites and certificate number/date/issuer/materials. Later edits to the global library must not silently change already formed acts.

The implementation may later use explicit snapshots, library versions, issued-document records or another equivalent mechanism, but the historical immutability rule is mandatory.

Acts select materials/certificates from the global certificate library. Final ID packages and registries derive used certificates from acts and deduplicate them by source certificate identity/provenance.

## Consequences

- Global library search and "create new" flows become the primary entry path for reusable entities.
- Object screens may show assigned organizations and representatives, but those rows are object-specific assignments, not separate object-owned libraries.
- Act editors must route signatory, organization and certificate entry through library selection/assignment instead of accepting isolated free text as canonical data.
- Act/revision output remains historically stable even when a reusable library card is corrected later.
- Registry and package projections can deduplicate used certificates because certificates remain global evidence entities referenced by acts.
- Object-specific representative or organization details can differ across objects without duplicating the global person or organization identity.

## Explicitly Rejected Alternatives

- Object-owned certificate libraries.
- Object-owned representative or organization libraries that become independent reusable sources.
- Free-text signatories, organizations or certificate numbers as valid final act data.
- Updating already formed acts by reading latest global library values without an explicit revision/snapshot action.
- Duplicating certificates per object and deduplicating only by rendered number/text.
- Treating a newly typed act signatory as act-only source data instead of first creating or selecting a global reusable entity.

## Invariants That Must Not Be Violated

- Certificates are global user-level library entities.
- Organizations are global user-level library entities.
- Representatives are global user-level library entities.
- Objects store assignments/links and object-specific assignment details.
- Acts use object assignments where applicable and store output snapshots for printed historical stability.
- Later edits to global organizations, representatives or certificates do not silently change already formed acts.
- Certificate use in acts requires a relation to a global certificate library item; direct free-text certificate entry is not sufficient.
- Registry and final package certificate lists are derived from acts and deduplicated by referenced certificates.
- Workspace/owner access, certificate provenance, file-backed evidence, structured source of truth and immutable revision/package snapshot rules remain unchanged.

## Implementation Implications

- Future data model work should distinguish global library identity from object assignment and act snapshot records.
- Object assignment records should carry object-specific role, position, authority, organization relation, display label and ordering where needed.
- Act finalization/revision should capture the exact printed organization, representative and certificate values required to reproduce the act.
- Correcting a global reusable card can affect future assignments/acts, but old formed acts require an explicit revision or snapshot refresh flow before their printed values change.
- UI copy should describe object rows as assignments/bindings, not object-owned libraries, and should steer users toward search/select/create-global-first flows.

## Related Documents

- `docs/PROJECT_MEMORY.md`
- `docs/CONVERSATION_QA_LOG.md`
- `docs/06-data-model-v1.md`
- `docs/09-aggregate-boundaries-and-invariants.md`
- `docs/12-database-schema-v1.md`
- `docs/13-domain-lifecycle-immutability-validation-v1.md`
- `docs/15-api-command-readmodel-contracts-v1.md`
- `docs/16-mvp-scope-and-first-forms-v1.md`
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
