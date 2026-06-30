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

## Runtime download fix notes

The first browser download attempt failed with the user-safe message
`Не удалось сформировать DOCX. Проверьте шаблон акта и данные документа.`
because the renderer could not close several `foreach` blocks in the real
template.

Root cause:

- the static template file itself was valid and was not edited;
- the public asset path `/templates/aosr/AOSR1_template_final_tags_corrected.docx`
  is copied by Vite into `dist/templates/aosr/`;
- most template tags are stored as normal escaped Word text, for example
  `&lt;&lt;[object.name]&gt;&gt;`;
- several closing `&lt;&lt;/foreach&gt;&gt;` tags were split by Word between
  multiple `<w:t>` / `<w:r>` runs, for example `&lt;&lt;/`, then XML run markup,
  then `foreach`, then `&gt;&gt;`;
- the original parser read that split sequence as an unsupported large tag, so
  loop rendering failed before a DOCX could be downloaded.

The renderer now normalizes split template tags inside Word text nodes before
parsing. It keeps the DOCX template untouched, preserves valid Word XML and is
covered by a smoke-test that renders the real static template, unzips the
result and verifies that no `<<...>>` service tags remain.
