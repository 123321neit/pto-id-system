# ADR 0004: Immutable Revisions and Package Snapshots

## Title

Immutable revisions and immutable package snapshots.

## Status

Accepted.

This ADR is part of the canonical ADR baseline accepted on 2026-05-28. It consolidates existing project decisions only and does not introduce new architecture, scope, schema, API, or implementation permission.

## Context

Executive documentation must remain explainable after corrections, regenerations, package builds, template changes, evidence corrections, and later downloads. The accepted lifecycle policy states that `final` means a validated published revision, not an eternally locked document identity. Engineers may correct a final act, but the published historical revision must not be rewritten.

Package outputs have the same problem at a larger scope. A package combines registry output, generated document artifacts, certificate originals, executive scheme originals, ordering, templates, object/company snapshots, validation outcomes, and provenance. A released or successful package snapshot must remain a record of the exact result that was built.

These decisions operate together with structured source of truth, typed documents, file-backed evidence, derived registry, async package build, AI proposal-only, workspace isolation, no cross-workspace leakage, no server lock-in, and provider SDK isolation.

## Decision

Released document revisions are immutable. Editing a final document creates a new working/released revision according to the lifecycle policy. It never mutates the prior released revision in place.

Successful package snapshots are immutable. Releasing a package snapshot adds release meaning, retention/audit importance, and current business relevance, but it does not grant permission to alter the snapshot contents.

Changing source data, evidence, scheme files, registry overrides, package ordering, template versions, object/company snapshots, or package scope creates staleness for current desired output and requires a new revision, generation, build, or snapshot as applicable.

No silent mutation, history rewrite, in-place final edit, in-place package rewrite, or hidden replacement of historical dependencies is allowed.

## Consequences

- Users can correct final documents while history remains reproducible.
- Package rebuilds create new snapshots rather than overwriting old outputs.
- Current-use outputs can be stale while historical outputs remain valid records of what was previously built or released.
- Storage and retention needs increase, but reproducibility and auditability are preserved.
- Template versions used for released output remain immutable; a changed form is a new version and may require regeneration or a new revision/output.
- Async package build is mandatory because resolving, generating, merging, and retaining exact dependency manifests cannot be treated as a synchronous save.

## Explicitly Rejected Alternatives

- Editing a final document in place without revision history.
- Re-finalizing by overwriting the previous published revision.
- Rebuilding a package by mutating the existing successful/released snapshot.
- Treating "latest" document/evidence/template values as sufficient for historical packages.
- Replacing evidence files or generated artifact bytes silently to preserve a stable URL/path.
- Letting registry overrides hide blocking errors or rewrite source facts to avoid a new revision/build.
- Letting AI/OCR rewrite released revisions, evidence metadata, or package snapshots automatically.

## Invariants That Must Not Be Violated

- `final` is a validated published revision; correction creates the next revision.
- Released `DocumentRevisionSnapshot` content, links, validation result, representative snapshots, file references, and template provenance are immutable.
- Successful and released `PackageSnapshot` manifests, included files, ordering, registry result, overrides, and provenance are immutable.
- Historical generated artifacts retained for a revision/snapshot are not edited in place.
- Used `TemplateVersion` is immutable.
- Dependency changes make current outputs stale; they never rewrite historical revisions or snapshots.
- Registry remains derived and captured registry results inside package snapshots remain historical.
- Package build remains asynchronous and snapshot-based.
- AI/OCR remains proposal-only and cannot mutate released history.
- Workspace isolation and no cross-workspace leakage apply to revisions, snapshots, artifacts, files, jobs, and read models.
- No server lock-in and no provider SDK leakage outside infrastructure adapters.

## Implementation Implications

- Revision and package snapshot identities must be explicit and referenced by generated artifacts, registry results, package items, and audit/activity records.
- Commands that edit final content must create a new working/released revision path and invalidate affected current outputs.
- Package build must resolve exact document revisions, evidence files, executive scheme files, registry override version, template versions, object/company snapshots, ordering, and generated artifacts before creating a snapshot.
- "Stale" is a current-readiness marker, not a permission to change historical contents.
- Retry and idempotency behavior must never overwrite successful immutable snapshots or released revisions.
- Retention/deletion policies can be detailed later, but current implementation must preserve historical provenance by default.

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
- `docs/17-tech-stack-and-implementation-strategy-v1.md`
- `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`
