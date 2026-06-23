# ADR 0006: Global Reusable Libraries and Output Snapshots

## Title

Global reusable libraries, live working links and frozen output snapshots.

## Status

Accepted, as clarified by ADR 0007.

This ADR records the reusable-entity architecture decision accepted on 2026-06-11. It does not introduce schema, migrations, API routes, backend behavior, uploads, generation, auth or production feature implementation.

Update 2026-06-22: ADR 0007 is authoritative for active working acts. A normal
working act is `linked`: its template-owned counterparty and signatory data are
resolved through the object template from current reusable libraries. A user
may explicitly switch the whole act to `manual`, which creates one complete
`manualTemplateSnapshot`. Released document revisions and issued package
outputs freeze their exact resolved values separately. Statements below about
snapshots must be read in that manual/released-output sense; linking an entity
to an active act does not itself create the canonical working snapshot.

## Context

PTO ID System reuses certificates, organizations and representatives across objects, acts, registries and packages. Earlier conceptual documents already separated structured source data, file-backed evidence, object bindings, typed documents and immutable released outputs, but the reusable boundaries for representatives, organizations and certificates needed a precise rule.

The risk is historical drift in released output. If a released revision or an
issued package can only read the latest organization, representative or
certificate values, later library corrections could rewrite history. The
opposite risk is duplicate object-owned libraries: if every object owns
separate certificate, organization or representative copies, reuse, search,
deduplication, certificate provenance and package assembly become unreliable.

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

Active working data and historical output are handled differently:

- a `linked` act stores object-template/library references and resolves current
  template-owned counterparty and signatory values live;
- a `manual` act stores one complete `manualTemplateSnapshot` created only by
  an explicit whole-act mode switch;
- certificate use remains an explicit relation to a global file-backed
  certificate; a released revision/package freezes the exact certificate
  identity, confirmed output values and file provenance it used;
- a released `DocumentRevisionSnapshot` and an issued `PackageSnapshot` freeze
  the exact resolved printable values required for historical reproduction.

Required frozen output details include representative full name, position,
organization, authority basis/order, role, labels/requisites, certificate
identity and confirmed number/date/issuer/material values, plus exact evidence
file provenance. Later library edits may update active linked work, but they
must never mutate a manual act snapshot or an already released revision/package.

Acts select materials/certificates from the global certificate library. Final ID packages and registries derive used certificates from acts and deduplicate them by source certificate identity/provenance.

## Consequences

- Global library search and "create new" flows become the primary entry path for reusable entities.
- Object screens may show assigned organizations and representatives, but those rows are object-specific assignments, not separate object-owned libraries.
- Act editors must route signatory, organization and certificate entry through library selection/assignment instead of accepting isolated free text as canonical data.
- Corrections in reusable counterparty/signatory libraries flow into active
  linked acts through the object template.
- Manual acts and released revision/package outputs remain historically stable
  when a reusable library card is corrected later.
- Registry and package projections can deduplicate used certificates because certificates remain global evidence entities referenced by acts.
- Object-specific representative or organization details can differ across objects without duplicating the global person or organization identity.

## Explicitly Rejected Alternatives

- Object-owned certificate libraries.
- Object-owned representative or organization libraries that become independent reusable sources.
- Free-text signatories, organizations or certificate numbers as valid final act data.
- Re-resolving a manual act, released revision or issued package from latest
  library values without an explicit new revision/build.
- Duplicating certificates per object and deduplicating only by rendered number/text.
- Treating a newly typed act signatory as act-only source data instead of first creating or selecting a global reusable entity.

## Invariants That Must Not Be Violated

- Certificates are global user-level library entities.
- Organizations are global user-level library entities.
- Representatives are global user-level library entities.
- Objects store assignments/links and object-specific assignment details.
- Active linked acts use object-template assignments/references and resolve
  current reusable data without storing template snapshots.
- Manual acts store one complete template snapshot; released revisions and
  issued packages store separate frozen output snapshots.
- Later edits to global organizations, representatives or certificates may
  affect active linked work but do not silently change manual or released data.
- Certificate use in acts requires a relation to a global certificate library item; direct free-text certificate entry is not sufficient.
- Registry and final package certificate lists are derived from acts and deduplicated by referenced certificates.
- Workspace/owner access, certificate provenance, file-backed evidence, structured source of truth and immutable revision/package snapshot rules remain unchanged.

## Implementation Implications

- Future data model work should distinguish global library identity, object
  template assignment/reference, manual act snapshot and released output
  snapshot records.
- Object assignment records should carry object-specific role, position, authority, organization relation, display label and ordering where needed.
- Act release/finalization should capture the exact resolved organization,
  representative and certificate values/provenance required to reproduce that
  released revision.
- Correcting a reusable counterparty/signatory card affects active linked acts.
  A manual act remains unchanged until the user explicitly returns it to the
  object template; a released output changes only through a new revision/build.
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
- `docs/adr/0007-document-defaults-suggestions-and-controlled-updates.md`
