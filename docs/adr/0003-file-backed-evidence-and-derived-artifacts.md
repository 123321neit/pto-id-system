# ADR 0003: File-Backed Evidence and Derived Artifacts

## Title

File-backed evidence and derived artifacts.

## Status

Accepted.

This ADR is part of the canonical ADR baseline accepted on 2026-05-28. It consolidates existing project decisions only and does not introduce new architecture, scope, schema, API, or implementation permission.

## Context

PTO workflows require proof files: certificates, declarations, passports, letters, executive schemes, and project source materials. At the same time, the system also creates generated outputs: DOCX/PDF acts, registry exports, package ZIPs, previews, retained artifacts, and future derived projections.

The accepted architecture distinguishes source evidence from derived artifacts. A certificate number typed into AOSR text is not enough evidence for package assembly. An executive scheme printed in a document or registry must correspond to a file-backed `ExecutiveScheme`. Generated outputs explain or export structured state; they do not become the source.

This decision must be implemented with storage abstraction/provider isolation, no server lock-in, no provider SDK leakage outside infrastructure adapters, workspace isolation, no cross-workspace leakage, derived registry, async package build, and AI proposal-only review.

## Decision

Certificates, declarations, passports, approved quality letters, and executive schemes are file-backed evidence. A file-backed evidence item must have a physical original file plus structured metadata and provenance before it can satisfy a final document, registry, or package requirement.

Generated artifacts are derived outputs. They may be retained, downloaded, marked stale, rebuilt, or included in package snapshots, but they do not replace structured source data or physical evidence originals.

No evidence claim is valid without the required physical file. A certificate registration number, scheme title, registry row, note, AI proposal, or generated artifact cannot substitute for the original file-backed evidence item.

File storage must be isolated behind narrow infrastructure adapters. Domain/application code, validation rules, package builder domain logic, frontend code, and shared contracts must not depend on a specific storage provider SDK, server filesystem path, bucket, CDN, region, host, or URL shape.

## Consequences

- Certificate and executive scheme workflows must include file upload/retention and metadata confirmation.
- AOSR and package readiness validation can block missing physical evidence where the accepted policy requires it.
- Registry and package outputs can include evidence blocks because the source entities identify retained physical originals.
- Generated outputs can be regenerated or marked stale without corrupting source data or evidence history.
- Storage implementation can start with local development storage and move to S3-compatible production storage through configuration and adapters.
- AI/OCR can propose metadata from files, but confirmation remains a user/domain command boundary.

## Explicitly Rejected Alternatives

- Using a manually typed certificate number as sufficient evidence.
- Treating an executive scheme as just text in an act or registry row.
- Treating generated DOCX/PDF/registry/ZIP files as source evidence or editable masters.
- Generic drive/file manager behavior where arbitrary folders and filenames define domain meaning.
- Storing permanent server-local paths or provider-specific URLs as authoritative domain references.
- Importing storage provider SDKs directly in domain modules, command handlers, validation, package domain logic, frontend code, or shared contracts.
- AI/OCR-created evidence links without a retained physical file and explicit user confirmation.

## Invariants That Must Not Be Violated

- A certificate/evidence item used by a final document, registry output, or package must have a retained physical original file.
- An executive scheme cited or included as evidence must have a retained physical original file.
- Generated artifacts are derived and cannot mutate source data automatically.
- Registry remains derived and cannot invent missing evidence.
- Package build is asynchronous and includes exact evidence file identities in snapshots.
- Historical evidence files/provenance cannot be silently overwritten or erased.
- Workspace scope is mandatory for business files, evidence, artifacts, proposals, package items, and downloads; no cross-workspace leakage is allowed.
- Storage must preserve no server lock-in; provider SDKs must remain inside infrastructure adapters.
- AI/OCR remains proposal-only and cannot confirm evidence metadata or links automatically.

## Implementation Implications

- `FileAsset` or equivalent storage metadata must carry workspace/object scope, domain role, file identity, upload attribution, integrity/provenance, and retention status.
- Evidence commands must validate file presence before final output or package inclusion.
- Generated artifact records must identify exact source revision, registry projection/override, template version, package snapshot, and file identities as applicable.
- Download/read URLs must be resolved through storage/download services and current access policy.
- Retention and supersession policies can be detailed later, but implementation must not make historical overwrite or deletion the default path.
- Project source files remain source material/provenance for future AI-assisted workflows; they do not become certificate or executive scheme evidence by inference.

## Related Documents

- `docs/PROJECT_MEMORY.md`
- `docs/06-data-model-v1.md`
- `docs/07-aosr-domain-specification.md`
- `docs/09-aggregate-boundaries-and-invariants.md`
- `docs/11-ai-project-ingestion-and-assistance-model.md`
- `docs/12-database-schema-v1.md`
- `docs/13-domain-lifecycle-immutability-validation-v1.md`
- `docs/14-backend-api-architecture-v1.md`
- `docs/16-mvp-scope-and-first-forms-v1.md`
- `docs/17-tech-stack-and-implementation-strategy-v1.md`
- `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`
