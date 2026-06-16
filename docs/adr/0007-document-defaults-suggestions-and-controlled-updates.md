# ADR 0007: Document Defaults, Suggestions and Controlled Updates

## Title

Document defaults are suggestions for new documents, not live document settings.

## Status

Accepted.

This ADR records the default-parameter architecture decision accepted on 2026-06-16. It does not introduce schema, migrations, API routes, backend behavior, uploads, generation, auth, persistence, real registry generation, package release snapshots or production feature implementation.

## Context

PTO ID System needs object-level values that help users create many similar executive documents without retyping the same text and ordering choices. Examples include under-title text, point 6 compliance text, header organization order, signatories, future numbering settings, future real registry parameters and future package release behavior.

The risk is historical drift. If an existing document reads object-level values live, then changing a default later can silently rewrite an already prepared act. That conflicts with structured source of truth, immutable released revisions and package snapshot rules.

The opposite risk is over-constraining the user. Defaults must help document creation, but the user must still be able to edit document text, use an empty number or make an exception in a specific document.

## Decision

Object-level "settings" that feed documents are called `Параметры по умолчанию` in the UI.

Default parameters are suggestions for newly created documents. When a document is created, the relevant current defaults are copied into the document payload or draft payload.

After creation, the document owns its values. Existing documents change only through explicit user action in that document or through a clearly named controlled update action, such as restoring a field from current default parameters.

Under-title text is document-owned after creation. A new AOSR draft copies `defaultUnderTitleText` into document-owned under-title text. Later edits to `defaultUnderTitleText` do not silently update that draft.

Point 6 compliance text is document-owned after creation in the current frontend mock. A new AOSR draft copies `defaultComplianceStatement` into document-owned point 6 text. Later edits to `defaultComplianceStatement` do not silently update that draft.

The UI may show origin/status hints:

- `По параметрам по умолчанию` when a document value still equals the current default;
- `Изменено в документе` when a document value differs.

The UI may expose an explicit action such as `Вернуть из параметров по умолчанию`, which replaces the current document value with the current default. This is a user-controlled update of the document, not a live binding.

Empty document values remain allowed. Future print forms can render manual-fill lines instead of blocking work.

Future numbering settings must follow the same rule:

- automatic numbering is a suggestion;
- users can edit the number or leave it empty;
- object-level numbering defaults may propose the next number;
- manual numbers do not mutate the sequence;
- existing documents are not automatically renumbered;
- deleted numbers are not reused by default.

Future package release snapshots may freeze a historical package composition, but that is a later implementation concern. This ADR does not implement package releases or historical package storage.

## Consequences

- Existing drafts and future documents are protected from silent object-default drift.
- Creation flows must copy defaults into the new document instead of leaving fields live-bound to object defaults.
- Default-parameter UI copy must avoid implying that existing acts update automatically.
- Document editors need explicit restore/update actions for fields that can be refreshed from current defaults.
- Future backend/API work must model defaults separately from document-owned content and controlled update commands.
- Registry and package features must continue to derive from document-owned content or released snapshots, not from mutable defaults.

## Explicitly Rejected Alternatives

- Treating object-level defaults as live settings read by existing documents.
- Automatically rewriting existing drafts when object defaults change.
- Automatically renumbering documents after numbering settings change.
- Reusing deleted numbers by default.
- Making manual document numbers mutate the automatic numbering sequence.
- Blocking document creation because a suggested default is empty.
- Implementing numbering settings UI, real registry generation or package release snapshots as part of this frontend-only slice.

## Invariants That Must Not Be Violated

- Defaults are suggestions for new documents.
- Documents become independent after creation.
- Existing documents update only through explicit user action.
- Under-title text is document-owned after creation.
- Point 6 text is document-owned after creation or must use an equivalent controlled-update model.
- Automatic numbering is a suggestion, not a constraint.
- Manual numbering remains allowed and does not rewrite the sequence.
- No automatic renumbering.
- Deleted numbers are not reused by default.
- Package release snapshots, when implemented later, must preserve historical package output without making defaults a live historical source.

## Implementation Implications

- Frontend and backend creation commands should receive or resolve defaults at creation time, then store copied document-owned values.
- Editors should compare document values to current defaults only for user-facing origin/status hints.
- Restore-from-default actions should write the current default into the document payload through normal document editing paths.
- Future numbering settings should be stored as default/proposal configuration, with separate document-owned rendered numbers.
- Future package release logic should snapshot document/revision/package inputs explicitly and should not rely on mutable current defaults for historical output.

## Related Documents

- `docs/PROJECT_MEMORY.md`
- `docs/CONVERSATION_QA_LOG.md`
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`
