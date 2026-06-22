# ADR 0007: Live Object Template Links and Manual Act Snapshots

## Title

Object templates are live links to reusable libraries; acts are either fully linked or fully manual.

## Status

Accepted.

This ADR supersedes the 2026-06-16 decision that treated printable object defaults as document-owned copies after creation. The previous rule protected historical output, but it made ordinary working acts stale too early and encouraged partial field-level overrides. The accepted model is now explicit: working acts can stay live-linked until the user chooses a full manual snapshot, while issued packages remain frozen separately.

This ADR does not introduce Prisma schema, migrations, API routes, backend behavior, auth, uploads, OCR/AI, DOCX/PDF/ZIP generation or production package release implementation. The current frontend mock may implement the model in memory only.

## Context

PTO ID System has three different concepts that must not be collapsed:

- reusable libraries of counterparties and signatories;
- object templates that describe repeated printable object data and reference those libraries;
- typed acts such as AOSR that combine object-template data with individual act data.

Engineers need corrections in reusable library records to flow into active working documents. If a surname, authority document, NRS id, organization text or counterparty requisites are fixed in the library, current linked acts should preview and generate with the corrected values. The same applies when the object template replaces a signatory or counterparty reference.

At the same time, users sometimes need a specific act to diverge from the object template. That must be a deliberate mode change, not an accidental side effect of typing normal act fields. Partial overrides of individual template fields create ambiguous provenance: it becomes unclear whether an act follows the object template, a few stale fields, or a hand-edited hybrid.

Issued ID packages are a separate concern. A released package must preserve a frozen result snapshot so already issued documents do not drift after library or object-template edits.

## Decision

Reusable counterparty and signatory libraries are live current-data sources for active work.

An object template stores repeated object data and references library records. It does not copy full counterparty or signatory printable text as the normal source of truth. It may store object-specific labels, grouping, ordering and custom subscripts.

An act has exactly two template modes:

```ts
type ActTemplateMode = 'linked' | 'manual';
```

In `linked` mode:

- the act does not store a copy of object-template data;
- the act resolves printable template data dynamically from the current object template;
- the object template resolves counterparty and signatory printable data dynamically from current library items;
- changes to library items flow through the object template into linked acts;
- changes to object-template references, grouping, ordering or repeated texts flow into linked acts;
- normal individual act edits never switch the act to manual mode.

In `manual` mode:

- the act stores one complete `manualTemplateSnapshot`;
- the snapshot contains the whole printable template part resolved from the current object template and libraries at the moment the user switches modes;
- object-template and library changes no longer affect that act;
- the user can edit any template-snapshot field in the manual act;
- individual act data remains individual data and is not part of the mode decision.

There are no partial field-level overrides for template-owned data. The act is either fully linked to the object template or fully manual with a complete snapshot.

Switching to `manual` must require an explicit user action such as `Редактировать шаблонные данные вручную` and a confirmation that the act will stop receiving object-template and library updates.

Returning to the object template must require an explicit user action such as `Вернуть к шаблону объекта`. This action deletes `manualTemplateSnapshot`, sets `templateMode = 'linked'`, and makes the act resolve from the current object template and current library items again.

## Conceptual Types

```ts
type CounterpartyLibraryItem = {
  id: string;
  displayName: string;
  fullText: string;
  defaultSubscript?: string;
  isArchived?: boolean;
};

type SignatoryLibraryItem = {
  id: string;
  displayName: string;
  fullName: string;
  position?: string;
  organization?: string;
  authorityDocument?: string;
  nrsId?: string;
  introDisplayText: string;
  signatureText: string;
  signatureName: string;
  defaultSubscript?: string;
  isArchived?: boolean;
};

type ObjectTemplate = {
  id: string;
  objectId: string;
  objectName: string;
  objectNameSubscript: string;
  counterparties: Array<{
    id: string;
    title: string;
    counterpartyId: string;
    subscriptMode: 'fromLibrary' | 'custom';
    customSubscript?: string;
  }>;
  representativeGroups: Array<{
    id: string;
    title: string;
    members: Array<{
      id: string;
      signatoryId: string;
      subscriptMode: 'fromLibrary' | 'custom';
      customSubscript?: string;
    }>;
  }>;
  projectDocumentation: string;
  complianceText: string;
  workContractorName: string;
  additionalInfo: string;
  copiesLine: string;
  numberingPattern?: string;
  numberingPrefix: string;
  numberingScope: 'global-object' | 'restart-per-folder';
  numberingSuffix: string;
  defaultDateMode?: 'today' | 'folderDate' | 'manual';
};
```

Counterparty `title` belongs to the object template. It is user-defined and must not be hardcoded to a fixed set such as builder, contractor or designer. The number of counterparties, representative groups and group members is not fixed. Renderers must treat a representative group as a real group: print the group title once, then all members inside that group. The same rule applies to the signature section.

The AOSR DOCX form template is a separate entity. It owns immutable form text, tags, Word layout, fonts and spacing. It is not the object template.

DOCX/PDF rendering should consume a resolved print state:

```ts
type AosrPrintState = {
  object: {
    name: string;
    nameSubscript: string;
  };
  counterparties: Array<{
    title: string;
    displayText: string;
    subscript: string;
  }>;
  document: {
    number: string;
    date: string;
    additionalInfo: string;
    copiesLine: string;
  };
  representatives: {
    groups: Array<{
      title: string;
      members: Array<{
        introDisplayText: string;
        subscript: string;
        signatureText: string;
        signatureName: string;
      }>;
    }>;
  };
  work: {
    contractorName: string;
    description: string;
    startDateLine: string;
    endDateLine: string;
    nextWorks: string;
  };
  project: {
    documentation: string;
    compliance: string;
  };
  materials: {
    items: Array<{ displayText: string }>;
  };
  confirmationDocuments: {
    items: Array<{ displayText: string }>;
  };
  applications: {
    items: Array<{ displayText: string }>;
  };
};
```

`document.number` is the raw act number without a printed `№` prefix. `document.date` is a raw date value suitable for UI/preview formatting, such as an ISO date string in the frontend mock. Renderers add printable prefixes and date formatting. If a future DOCX renderer needs fully formatted `numberLine` or `dateLine`, those fields must be separate derived render values and must not replace the raw act number/date semantics.

Numbering is independent from `templateMode`. The object template owns the
numbering scope, prefix and suffix used to propose numbers for new acts. A
manual number override changes only the rendered number of that act and never
changes earlier or later sequence allocations. Creating an act with a manual
number does not consume an automatic sequence. Editing the rendered number of
an already automatically numbered act preserves its allocated sequence. An
ordinary number edit is not a bulk renumber command and must not renumber other
acts.

## Act Model

```ts
type Act = {
  id: string;
  objectId: string;
  objectTemplateId: string;
  documentType: 'AOSR_1';
  templateMode: ActTemplateMode;
  individualData: {
    number: string;
    date: string;
    workDescription: string;
    startDateLine: string;
    endDateLine: string;
    nextWorks: string;
    materials: Array<{ displayText: string }>;
    confirmationDocuments: Array<{ displayText: string }>;
    applications: Array<{ displayText: string }>;
  };
  manualTemplateSnapshot?: {
    object: {
      name: string;
      nameSubscript: string;
    };
    counterparties: Array<{
      title: string;
      displayText: string;
      subscript: string;
    }>;
    representatives: {
      groups: Array<{
        title: string;
        members: Array<{
          introDisplayText: string;
          subscript: string;
          signatureText: string;
          signatureName: string;
        }>;
      }>;
    };
    project: {
      documentation: string;
      compliance: string;
    };
    documentTemplateDefaults: {
      additionalInfo: string;
      copiesLine: string;
    };
    workTemplateDefaults: {
      contractorName: string;
    };
  };
};
```

For `linked` acts, the print state is resolved from:

```text
counterparty/signatory libraries -> objectTemplate -> linked act individualData
```

For `manual` acts, the print state is resolved from:

```text
manualTemplateSnapshot -> manual act individualData
```

## UI Rules

Linked acts:

- show status `По шаблону`;
- do not allow direct editing of template-owned fields;
- explain that template data comes from the object template and live libraries;
- keep template-owned sections collapsed by default so the act editor is focused on individual act data;
- allow users to expand template sections to verify their resolved printable values;
- expose `Редактировать вручную` or equivalent.

Manual acts:

- show status `Ручная версия`;
- show a calm note: `Ручная версия: изменения шаблона объекта и библиотек не применяются.`;
- allow editing of snapshot fields;
- show soft per-field hints such as `Отличается от шаблона объекта` where the snapshot differs from the current resolved object template;
- avoid red errors or aggressive warnings for intentional differences;
- expose `Вернуть к шаблону объекта`.

The manual switch confirmation should say:

```text
Акт станет ручной версией. Изменения шаблона объекта и библиотек больше не будут применяться к этому акту.
```

## Consequences

- Active working linked acts stay up to date with corrected library and object-template data.
- A manual act has simple provenance: it owns one complete template snapshot.
- There is no hybrid state made of scattered per-field overrides.
- The work contractor, additional information and copy count are template-owned because they repeat across the object's acts.
- Individual act fields such as number, date, work description, periods, materials and applications remain editable in both modes and never imply manual template mode.
- Preview and future DOCX/PDF generation must be routed through `AosrPrintState`.
- Future backend/API commands should model `SwitchActTemplateModeToManual`, `ReturnActToObjectTemplate`, and object-template/library update flows explicitly.
- Future issued packages must store frozen output snapshots and must not rely on live-linked working act state for historical documents.

## Explicitly Rejected Alternatives

- Copying object-template data into every act at creation as the normal working model.
- Making object defaults only suggestions for new documents when the act remains active and unissued.
- Partial overrides of individual template fields in a linked act.
- Automatically switching to manual mode when the user edits individual act data.
- Allowing a linked act to edit template-owned fields directly.
- Making the DOCX form template act as the object template.
- Hardcoding a fixed set of counterparty roles or representative groups.

## Invariants That Must Not Be Violated

- Counterparty and signatory libraries are live current-data sources for active work.
- Object templates store links to library records, plus object-specific labels, ordering, grouping and repeated texts.
- A linked act does not store a template snapshot.
- A manual act stores a complete template snapshot.
- No partial field-level overrides exist for template-owned fields.
- Only an explicit user action can switch a linked act to manual mode.
- Editing individual act data does not switch template mode.
- Returning to the object template deletes the manual snapshot and restores live resolution.
- Issued packages must preserve frozen output snapshots.

## Related Documents

- `docs/PROJECT_MEMORY.md`
- `docs/CONVERSATION_QA_LOG.md`
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`
