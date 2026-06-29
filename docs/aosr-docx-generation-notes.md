# AOSR DOCX generation notes

Status: first frontend-only DOCX download scope. The real acts in
`docs/examples/aosr-real-acts/` are reference fixtures only. They are not
production data, are not parsed by the app and must not be edited by generation
code.

## Reference fixture observations

- The provided real-acts fixture is `docs/examples/aosr-real-acts/АОСР.docx`.
  It contains a repeated AOSR structure; `python-docx` sees 10 tables and more
  than 1,000 non-empty paragraphs/cells.
- Act number and date are printed as separate title metadata near the act title.
  Numbers usually use `№ ...`; dates in the body commonly appear as quoted day
  plus month/year or as `dd.mm.yyyy` inside document references.
- The object block is long and may wrap over several lines. Long legal names,
  cadastral/address data and SRO details must keep natural Word wrapping.
- Parties are rendered as titled blocks: developer, technical customer,
  construction contractor and design organization. Each block keeps the main
  organization text and a small explanatory caption/subscript.
- Representatives are grouped by role. A group title is printed once, then one
  or more representative lines follow. Signature blocks repeat the same groups
  and align role/organization text with signature name.
- Materials in point 3 are multi-line list items. Certificate numbers and dates
  stay in the same display line where possible; long certificate lists wrap.
- Point 4 contains executive drawings/schemes and other confirmation documents.
  These are separate list items, not a single comma-only paragraph.
- Applications repeat certificates/material documents and executive drawings.
  The first implementation can reuse the resolved application list already
  available in `AosrPrintState`.
- Long work descriptions, compliance text and next-work text are normal wrapped
  paragraphs. They must not be truncated and should remain editable in Word.

## Current `AosrPrintState` coverage

Already covered:

- object name and object subscript;
- counterparties with title, display text and subscript;
- document number/date, additional information and copies line;
- representative groups with intro/subscript/signature fields;
- work contractor, description, start/end dates and next works;
- project documentation and compliance text;
- material lines;
- confirmation-document lines for point 4;
- application lines.

Computed template data needed for the current tagged DOCX template:

- `document.numberLine`: printable line for the act number. Keep
  `document.number` unchanged for raw value consumers.
- `document.dateLine`: printable line for the act date. Keep `document.date`
  unchanged for raw value consumers.
- safe arrays for template loops: `counterparties`,
  `representatives.groups[].members`, `materials.items`,
  `confirmationDocuments.items` and `applications.items`.
- empty strings instead of `undefined`, because the static template is rendered
  directly in the browser.

## First implementation boundary

The first implementation downloads one AOSR DOCX from:

```text
AosrPrintState -> AOSR template data -> static DOCX template -> downloaded .docx
```

It does not implement PDF, ZIP, final/intermediate ID package generation,
backend storage, Prisma schema changes or production number reservation.
