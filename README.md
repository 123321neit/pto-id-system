# ИДея

ИДея — рабочее место ПТО для исполнительной документации.

Акты, реестры, сертификаты и комплекты ИД в одном рабочем месте.

Текущий статус:

```text
FIRST ALLOWED INFRASTRUCTURE BOOTSTRAP SCAFFOLD ACCEPTED; CANONICAL ADR BASELINE ACCEPTED; BACKEND MODULE ARCHITECTURE SKELETON INTRODUCED; FIRST TECHNICAL FRONTEND-BACKEND STATUS SLICE INTRODUCED; DATABASE FOUNDATION TECHNICAL SLICE INTRODUCED; OBJECT STORAGE FOUNDATION TECHNICAL SLICE INTRODUCED; AUTH SHARING IMPLEMENTATION PLAN ADDED; USER IDENTITY SKELETON INTRODUCED; GLOBAL SYSTEM ADMIN MARKER INTRODUCED; OWNED WORKSPACE BASELINE INTRODUCED; FIRST MOCK AOSR DEMO UI SLICE INTRODUCED; MOCK AOSR DEMO UX/PREVIEW REFINED; MOCK APP SHELL AND OBJECT DASHBOARD INTRODUCED; FRONTEND-ONLY MOCK REPRESENTATIVES/ORGANIZATIONS MANAGEMENT PAGE INTRODUCED; FRONTEND-ONLY MOCK CERTIFICATE LIBRARY PAGE INTRODUCED; STAGE 5 MOCK AOSR WORKSPACE UX STABILIZED; AOSR EDITOR UX CLEANUP INTRODUCED; AOSR WORKSPACE DRAWER UX INTRODUCED; FRONTEND-ONLY MOCK OBJECT DOCUMENT LIBRARY INTRODUCED; AOSR WORKSPACE APPLICATIONS UX CLEANUP INTRODUCED; FRONTEND-ONLY MOCK OBJECT COMPLIANCE DEFAULTS AND ACT OVERRIDES INTRODUCED; FRONTEND-ONLY MOCK OBJECT WORKSPACE VISUAL PASS INTRODUCED; FRONTEND-ONLY MOCK OBJECT WORKSPACE SHELL INTRODUCED; AOSR DOCUMENT PREVIEW DRAWER UX INTRODUCED; AOSR DOCUMENT PREVIEW PAGE VISUALIZATION REFINED; FRONTEND-ONLY OBJECT DOCUMENT WORKSPACE INTRODUCED; FRONTEND-ONLY OBJECT CERTIFICATE WORKSPACE INTRODUCED; FRONTEND-ONLY ID REGISTRY V1 INTRODUCED; FRONTEND-ONLY FINAL ID PACKAGE MOCK INTRODUCED; FRONTEND-ONLY ACT TYPE METADATA PREP INTRODUCED; AOSR READINESS PANEL V1 INTRODUCED; FINAL PACKAGE READINESS V1 INTRODUCED; FRONTEND-ONLY OBJECT WORKSPACE UX HIERARCHY POLISH INTRODUCED; FRONTEND-ONLY OBJECT OVERVIEW AND GLOBAL CERTIFICATE ARCHITECTURE UX CORRECTION INTRODUCED; GLOBAL REUSABLE LIBRARIES AND ACT SNAPSHOTS ADR ACCEPTED; FRONTEND-ONLY PERIOD-FIRST OBJECT WORKSPACE MOCK INTRODUCED; FRONTEND-ONLY PERIOD-SCOPED AOSR CREATION MOCK INTRODUCED; FRONTEND-ONLY AOSR MANUAL NUMBER OVERRIDE MOCK INTRODUCED; FRONTEND-ONLY OBJECT WORKSPACE PREMIUM UX POLISH INTRODUCED; FRONTEND-ONLY GENERATED ID PACKAGE VIEWS UX INTRODUCED; FRONTEND-ONLY PRINT-ORDER AOSR EDITOR UX INTRODUCED; FRONTEND-ONLY UX OVERLOAD CLEANUP INTRODUCED; FRONTEND-ONLY RADICAL UX CLEANUP INTRODUCED; FRONTEND-ONLY PERIOD DOCUMENT UX CLEANUP INTRODUCED; FRONTEND-ONLY DOCUMENT DEFAULT PARAMETERS AND DOCUMENT-OWNED AOSR TEXTS INTRODUCED; FRONTEND-ONLY AOSR PRINTABLE DEFAULT SNAPSHOTS EXTENDED; FRONTEND-ONLY OBJECT TEMPLATE UX SUMMARY INTRODUCED; FUTURE SECTION TEMPLATE BACKEND CONTRACT DOCUMENTED; DOCUMENT CREATION CONTEXT BACKEND CONTRACT SLICE INTRODUCED; ADR 0008 SECTION-SCOPED ID ACCEPTED; FRONTEND-ONLY SECTION WORKSPACE UX INTRODUCED; FRONTEND-ONLY SECTION MODEL ARCHITECTURE CLEANUP INTRODUCED; FRONTEND-ONLY SINGLE AOSR DOCX DOWNLOAD INTRODUCED; FRONTEND-ONLY ID REGISTER DOCX DOWNLOAD INTRODUCED
```

В репозитории принят первый разрешённый scaffold. Это только infrastructure/bootstrap
foundation: workspace, tooling, app shells, shared placeholders, env/config foundation
and CI quality gates. Backend module boundaries are now introduced as an
architecture skeleton only.

UX cleanup: reduced interface overload, simplified default parameters, clarified
primary actions. The current frontend mock now removes duplicate object-level
entry points where they competed with the main path, keeps global reusable
libraries in global navigation, and treats Object Overview as a start/continue
surface rather than a dashboard of equal-weight options.

Section/folder document UX: an object contains user-defined documentation
sections such as `Вентиляция`, `Отопление`, `Водоснабжение` or any user name. A section
contains user-defined ID folders, and a folder contains documents of many future
types. `Создать документ` is the universal entry point; AOSR is only the first
implemented document type, while future types stay disabled as `скоро`. Folder
registry and intermediate ID are derived from folder documents. Final ID is
derived by section, not by the whole object by default.

Live section template principle: reusable counterparties and signatories are
global live libraries, while `SectionTemplate` stores their ids, section-specific
labels, grouping, order and subscripts. Linked acts resolve current printable
data through `libraries -> SectionTemplate -> printState`; manual acts use one
complete `manualTemplateSnapshot`. There are no partial template-field
overrides. The UI calls these section-level live values
`Шаблонные значения раздела`.
Representative groups are real groups with independent ids and any number of
members. `AosrPrintState.document` keeps raw `number` and `date`; renderers add
`№` and date formatting. The work contractor, additional information and copy
count are repeated section-template data. In the act editor all template-owned
sections are collapsed by default; users can expand them to verify values and
must explicitly switch the whole act to manual mode before changing them.

Section template UX summary: the accepted future UI should open
`Шаблонные значения раздела` with a compact summary of the live chain,
organization blocks, representative groups and numbering rule before detailed
editing. Organization and representative sections explain the
global-library-to-section-template assignment flow. Section template settings
may be copied through a frontend clipboard into another section in the same
object or another object by copying repeated texts, numbering policy and library
links/assignments, without copying documents, folders, released outputs or
library records themselves.

Frontend-only section workspace UX: the object workspace now shows
user-defined documentation sections before folders. The demo starts with
`Вентиляция` and `Отопление`, lets the user create a section, create folders
inside the selected section, open section-scoped AOSR documents, edit
`Шаблонные значения раздела`, copy those template settings into another section
or another object and view final ID as a selected-section package. This is still in-memory
frontend mock behavior only.

AOSR DOCX generation v1: the first AOSR template is connected as the static
asset `apps/web/public/templates/aosr/AOSR1_template_final_tags_corrected.docx`.
The editor can download one AOSR `.docx` from
`AosrPrintState -> template data -> DOCX template`, not from DOM/UI reads. Real
acts are stored only as reference fixtures under `docs/examples/aosr-real-acts/`
and are not parsed as production data. PDF, ZIP, final/intermediate package
downloads, backend/API, Prisma and production storage are still intentionally
out of scope.

ID register DOCX generation v1: the object workspace can download a
frontend-only `.docx` register either for one folder or for the whole selected
section. The register is generated from
`IdRegisterPrintState -> narrow DOCX register renderer`, not from DOM/UI reads.
This is a register export only: full intermediate/final ID package downloads,
PDF, ZIP, backend/API, Prisma and production storage are still intentionally out
of scope.

Frontend-only section model cleanup: ID folders are now represented in the
frontend mock as `DemoIdFolder` in `object-id-folders.ts`, not as object
periods. Demo sections carry the user-visible `name`, optional `description`
and `templateSettingsId`; there is no separate inferred short section code.
AOSR drafts carry explicit `sectionId`, `folderId`, `sectionTemplateId` and
`sectionTemplateSettingsId`; numbering scopes are `section-wide` and
`restart-per-folder`, with automatic/manual mode and a configurable first
number. Section template settings are keyed by
`templateSettingsId`. Copying settings retargets the copied template to the
target section and preserves the target section's numbering prefix, with a UI
notice. `DemoSectionTemplateSettings` / `SectionTemplate` are the canonical
section names, while old AOSR `objectDefaults` / `objectTemplate` names remain
only as compatibility aliases in the standalone demo.

Future backend contract: `docs/14-backend-api-architecture-v1.md` and
`docs/15-api-command-readmodel-contracts-v1.md` now document the future command
and read-model contract for `SectionTemplate`, user-defined documentation
sections, user-defined ID folders, section/folder-scoped document creation,
section/folder numbering proposals, template copy and strict linked/manual AOSR
behavior. This is documentation only and does not add API routes, OpenAPI,
Prisma schema, migrations, repositories, persistence, queues, storage, renderer
or production backend code.

Document creation context backend slice: the `documents` backend module now has
a framework-free, query-only `readDocumentCreationContext` application contract
for the future `Создать документ` selector. It requires an explicit allowed
workspace access decision before object/section/folder lookup, accepts
arbitrary user-defined sections and ID folders, returns approved document types,
current `SectionTemplate` summary, live resolution chain, section/folder package
scope and proposal-only numbering. It adds no Nest controller, HTTP route,
OpenAPI, DTO serialization, Prisma schema/model, migration, repository,
persistence adapter, draft creation, number reservation or production document
storage.

The first technical vertical slice now proves that the React shell can call the
NestJS technical `/health` endpoint through `VITE_API_BASE_URL` and consume the
shared technical response type from `packages/shared-types`. This slice is only
for infrastructure verification and CI/build/test confidence.

The database foundation technical slice adds Prisma generation wiring, an empty
Prisma schema with only `generator` and `datasource`, and an infrastructure-only
technical database health boundary. `InfrastructureModule` is explicit, not
global, and is currently imported only by technical health composition. This
slice intentionally has no domain models, migrations, business tables,
repositories, CRUD APIs or domain readiness semantics.

The object storage foundation technical slice adds an infrastructure-only
object storage health boundary and S3-compatible configuration adapter skeleton.
Runtime health checks are config-only and report `configured` or `unconfigured`
for storage, avoiding brittle CI/network coupling. This slice intentionally has
no uploads, downloads, file metadata, evidence files, generated artifacts,
provider URLs in health, Prisma models, migrations, repositories, CRUD APIs or
business storage behavior.

The user identity skeleton adds a framework-free `Actor` primitive and a
workspace-owned current actor resolver utility/port for future commands and
queries. It fails closed for missing or disabled actors and grants no business
access. This is not login, registration, session/cookie/JWT/OAuth, Prisma user
storage, an API route or frontend auth UI.

The global system admin marker adds an optional deployment/config-driven
`SYSTEM_ADMIN_ACTOR_ID` and a framework-free workspace `admin-path` utility that
can identify the one configured active actor for future admin-only paths. Missing
config means no actor is system admin. The marker is not workspace ownership,
not a business access bypass, not a role/capability on `Actor`, not an API route,
not an admin panel and not auth/session implementation.

The owned workspace baseline adds a TypeScript-only `OwnedWorkspace` primitive
and framework-free owner-only access utilities. Owner checks return
leakage-safe `NOT_FOUND_OR_NOT_AUTHORIZED` denial for missing, disabled,
non-owner or wrong-scope access. This is not workspace persistence, not a Prisma
model, not a route/controller, not a frontend screen, not share codes/grants and
not a system-admin bypass.

The first mock AOSR demo UI slice replaces the root React screen with a
frontend-only Russian demo workspace for user feedback. It uses in-memory mock
data, separated object-level defaults/current-act fields, configurable
object-level header organization blocks, a configurable object representative
library, mock certificate-library selections, a draft list and a document-like
demo preview that resembles a printed act page. Header and representative
labels are object configuration, not global fixed schema. It is clearly labelled
`ИДея / демо-данные / не для работы в продуктиве` and intentionally
adds no Prisma schema, migrations, real auth, backend routes, persistence,
uploads, document generation, AI, share codes or grants.

The refined demo keeps object/common settings and large libraries behind compact
buttons, models global organization/representative libraries versus object-level
editable bindings only as in-memory mock UI, and keeps certificate materials
library-linked instead of free text. The AOSR Word example is used only as a
visual/layout reference for the HTML preview; no DOCX import, parsing or real
DOCX/PDF generation is implemented. Derived applications render before the
final signature blocks.

The mock app shell now starts on a frontend-only object dashboard with a left
navigation rail, mock object cards, quick-access cards and recent documents.
Opening any mock object switches in memory to the existing AOSR workspace, and
the workspace has a `Назад к объектам` action. The `Представители и
организации` dashboard section now opens a frontend-only mock management page
with in-memory global organization/representative libraries, local mock add
forms and conceptual object-level binding/snapshot notes. The
`Библиотека сертификатов` dashboard section now opens a frontend-only mock
library page with in-memory certificate cards, search, status filter, local
mock add form, no file upload, no OCR and no persistence. The dashboard
certificate, organization and representative pages now share the same frontend
mock store with the AOSR workspace, so added demo records appear in the AOSR
material, signatory and object-organization pickers. These dashboard sections
have no backend, persistence, uploads, real generation, auth, share codes or
production business logic.

Stage 5 clarified the mock AOSR workspace UX: the object template stays behind a
compact button, the middle column is now presented as `Рабочая область акта`,
and the UI copy separates the live object template from `Текущий акт`. The
implemented frontend chain is `global library -> object template -> linked act`.
For demo convenience, object representatives may still be prefilled from the
global mock library; in the real system the user will choose/bind them for the
object. Exact Word-like AOSR preview matching remains a separate future stage.

The AOSR editor UX cleanup keeps the scope frontend-only and moves default
parameters out of the inline act editor into a button-opened dialog. The act
editor now follows the AOSR field order more closely, removes the separate
visible `Место`/location act fields, and makes `Исполнительные схемы и чертежи`
an explicit section linked to point 4 and applications. No backend, persistence,
uploads, OCR/AI or real DOCX/PDF generation were added.

The AOSR workspace drawer UX step improves frontend-only visual hierarchy in the
mock object workspace. Certificate material selection now opens a drawer/panel
instead of an inline expansion, selected materials remain visible in the act
editor, important workspace actions use stronger accent styling, and point 4
preview wording is corrected closer to the real AOSR form.

The frontend-only mock object document library now separates object documents
from certificates. Point 4 uses selected object documents from the in-memory
drawer `Документы объекта`, and applications are derived from selected material
certificates plus selected object documents. Each derived application has a
checkbox: unchecked applications stay selected as source documents/materials but
are removed from the final applications list and preview applications block. No
backend, persistence, uploads, OCR/AI or real DOCX/PDF generation were added.

The AOSR workspace applications UX cleanup keeps the mock frontend-only and
improves the editor hierarchy. The current-act editor now has a compact summary
strip for materials, object documents, included applications, signatories and
status. Point 4 is focused only on selected object documents, while the single
application checklist lives in a separate `Приложения к акту` section after
additional information and before current-act signatories. The duplicated
editor block `Итоговые приложения в акте` was removed; the preview remains the
source for the final printed applications result. No backend, persistence,
Prisma/schema/migration, upload, OCR/AI or real DOCX/PDF generation changes were
added.

The frontend-only mock now implements ADR 0007 for active working AOSR drafts.
`linked` acts read object name, counterparties, representative groups, project
documentation, point 6 and copies from the current object template and global
libraries. `manual` acts read those values only from their complete snapshot.
Changing individual act data does not change the template mode. Returning to
the object template deletes the snapshot and restores the live chain. This
remains in-memory demo UI only and introduces no backend, persistence,
Prisma/schema/migration, uploads, OCR/AI, generation, auth, sharing or production
business logic.

The frontend-only mock object workspace visual pass makes the object workspace
closer to the clean UI reference: a stronger object header, compact status
cards, clearer three-column rhythm, calmer editor sections, more consistent
drawers and a better-framed preview panel. It does not change AOSR business
logic, data model, backend, persistence, uploads, OCR/AI, DOCX/PDF generation,
auth, sharing or production behavior.

The frontend-only mock object workspace shell makes the object the central
opened entity. Opening an object now shows object-level navigation with `Акты`,
`Сертификаты`, `Документы объекта`, `Представители`, `Реестр ИД` and default
parameters. AOSR remains the existing editor but now lives under
`Object -> Акты -> АОСР`; `Сертификаты`, `Документы объекта` and `Реестр ИД`
started as intentional placeholders for future object sections, and the existing
representatives/organizations mock page is reused inside the object workspace.
The step is UX/navigation/layout only and introduces no backend, persistence,
Prisma/schema/migrations, API routes, auth/session, uploads, OCR/AI,
DOCX/PDF generation, sharing or production business logic.

The AOSR document preview drawer UX keeps the scope frontend-only and moves the
existing AOSR preview out of the permanently visible right column into a
reusable `DocumentPreviewDrawer`. The opened AOSR workspace now gives more
horizontal room to the document tree and editor, while the header action
`Предпросмотр документа` opens a closable right-side drawer. The preview uses
the same mock data and renderer content, with improved document-page
visualization: white A4-like sheets, page shadows, margins and visible gaps
between approximate pages. No AOSR business logic, object architecture, data
model, backend, persistence, generation, compliance logic or production behavior
was changed.

The AOSR document preview page visualization refinement keeps the same
right-side drawer and the same approximate two-page HTML mock preview, but makes
page breaks explicit with `Страница 1` and `Страница 2` labels, stronger paper
sheet framing, a light grey preview canvas and compact drawer context for act
number/date/application count. It is still not real PDF/DOCX generation or a
production pagination engine.

The frontend-only object document workspace replaces the object documents
placeholder with a real in-memory object document registry. The page lists
executive schemes, executive drawings, protocols, journals, test reports and
other object documentation with simple filters, derived summary counts, mock
AOSR usage counts and a local add form. The object documents page and the AOSR
point 4 document drawer now use the same frontend demo store, making this a UX
foundation for the future ID registry while adding no backend, persistence,
uploads, file storage, Prisma/schema/migrations, API routes, auth, OCR/AI,
DOCX/PDF generation or production business logic.

The earlier frontend-only object certificate workspace experiment is superseded
by the object overview and global certificate architecture correction:
certificates are global user-level library entities, object navigation no
longer exposes an object-owned certificate page, and object/final package
certificate counts are derived from certificates used in acts. The global
certificate library page and AOSR material drawer remain available through the
shared frontend demo certificate store.

Frontend-only ID Registry V1 replaces the `Реестр ИД` placeholder with the
first real read-only registry page for the opened object. It derives rows and
summary counts from existing frontend demo entities only: AOSR drafts, object
documents and the shared global certificate demo store. AOSR registry labels
and section names now come through frontend-only act type metadata, preparing
the derived registry projection for future act types. The registry has simple
section filters, a `Сведения` column instead of using document type as status,
and no manual editing, backend, persistence, uploads, file storage,
Prisma/schema/migrations, API routes, auth, OCR/AI, DOCX/PDF generation or
production business logic.

The frontend-only final ID package mock adds the object navigation section
`Итоговый комплект` and a read-only page `Итоговый комплект ИД`. It records the
domain distinction between periodic/current ID, usually prepared monthly during
construction, and final object ID, prepared once at project completion. The mock
derives final composition from existing demo AOSR drafts, selected
certificates/materials and selected object documents, deduplicating certificates
and object documents by id. Act rows derive their visible document title/code
from the same frontend-only act type metadata used by the registry. The
download button is disabled in demo mode: no real PDF/DOCX/ZIP generation,
download API, persistence, backend, uploads, OCR/AI, Prisma/schema/migrations
or production package logic was added.

The frontend-only act type metadata prep adds a small registered act type model
for the demo (`id`, `code`, `title`, `registrySectionName`). Only AOSR is
registered now; no new act forms, editors or previews were added. The object
workspace document tree, registry and final package now have a narrow extension
point for future act types without changing backend, Prisma/schema/migrations,
API, persistence, uploads, OCR/AI, auth or document generation.

AOSR Readiness Panel V1 adds a compact frontend-only diagnostics card in the
AOSR workspace near the current act summary. It derives simple warnings from
existing mock data only: missing signatories, materials, object documents and
point 6 compliance text. Final Package Readiness V1 adds a compact readiness
card to `Итоговый комплект ИД`, warning when the mock package has no acts, no
certificates or no object documents. These are dashboard diagnostics only, not
a real validation engine, backend policy, persistence, generation, upload, OCR
or AI implementation.

The frontend-only object workspace UX hierarchy polish step improves the opened
object experience without changing workflows or business logic. Object header,
metrics, object navigation, the AOSR document tree, current-act summary,
readiness card, form sections, certificate/object-document drawers and preview
drawer were visually refined for clearer hierarchy, spacing, selected states and
document focus. Lightweight informational metadata such as `Последнее изменение`
and `Версия документа` was added in the mock UI. No document workflow statuses,
approvals, review process, backend/API changes, persistence, Prisma/schema,
migrations, uploads, OCR/AI or DOCX/PDF generation were introduced.

The frontend-only object overview and certificate architecture correction makes
`Обзор` the default opened-object section. Opening an object now lands on an
object overview with name, address, key metrics, last update, quick actions,
recent ID folders, recent documents and a frontend-only `Создать документ`
selector. The selector reads registered act metadata and currently offers
`АОСР — Акт освидетельствования скрытых работ`, while future document types are
disabled as `скоро`; choosing `Создать документ` now creates a new
frontend-only AOSR draft in the selected ID folder, shows the proposed next number
and keeps the folder page open until the user opens the document. The previous object-owned
`Сертификаты` navigation is removed: certificates remain a global user-level
library, acts use that library, and object/registry/final package screens show
only derived used certificates. Readiness wording is informational and now uses
softer `Подсказки` labels; empty fields do not block
preview/printing and future print forms should leave manual-fill lines. No
workflow statuses such as `Черновик`, `На проверке`, `Готов` or `Выпущен` are
shown in the document tree or summaries. No backend, API, persistence,
Prisma/schema/migrations, uploads, OCR/AI, generation or production business
logic was added.

ADR 0006 records the reusable entity rule: certificates, organizations and
representatives are global user-level libraries. Sections store template
assignments and links to those entities through `SectionTemplate` /
`Шаблонные значения раздела`. ADR 0007 clarifies the working model: active
linked acts resolve counterparty/signatory data live through the current section
template; an explicit whole-act switch creates one complete manual snapshot;
released revisions/packages freeze exact output separately. Certificate use
remains an explicit relation to global file-backed evidence, with exact
identity, values and file provenance frozen for release. Direct free-text
signatories, organizations and certificates are not valid final sources.

The frontend-only demo wording creates/selects a global representative and
assigns that representative to the object before act use. The later ADR 0007
implementation replaces the earlier automatic act-snapshot interpretation:
linked acts use the assignment live, while manual/released states freeze it at
their explicit boundaries. This remains in-memory mock behavior only; no
production schema, backend/API or persistence was implemented. Empty fields
remain allowed so future print forms can render manual-fill lines.

The frontend-only folder-first object workspace makes `Папки ИД` the main
opened-object navigation path after `Обзор`. Folders have user-defined names
and are created in memory; the seeded `Сентябрь 2026` and `Октябрь 2026` rows
are examples on the populated demo object, not a fixed product taxonomy. A
separate empty demo object covers `создать первую папку -> открыть папку ->
создать первый документ`. Each folder contains documents, its derived registry
and a future intermediate package view. AOSR remains the only working document
editor and is opened through a folder/document path. The final object ID remains
the aggregate over all folders. This is frontend demo UX only: no backend/API,
Prisma/schema/migrations, persistence, uploads, OCR/AI, DOCX/PDF/ZIP generation
or production business logic was introduced.

The frontend-only folder-scoped AOSR creation mock keeps the folder-first model
but makes `Создать документ -> АОСР` create a real in-memory draft for the
selected folder. The new blank draft appears in the folder document list and
the AOSR document tree, stays in the selected folder until the user opens it
manually, and is included by derived overview/final ID counts while the browser
session lives. This uses no backend, no API, no localStorage and no
persistence. Empty fields are allowed so preview/editing remain available and
future print generation can render manual-fill lines.

Future folder-first structure:

```text
Object
├── Overview
├── ID folders
│   ├── User-defined folder
│   │   ├── documents
│   │   ├── registry
│   │   └── intermediate ID generated view
│   └── ...
├── Object documents
├── Representatives
├── Final ID
└── Default parameters
```

The frontend-only AOSR mock now keeps its numbering rule in the selected
section template settings. The user can choose one continuous sequence across
the selected section or restart the sequence in each folder, and can edit the
prefix and suffix. Demo seeded sections may start with prefixes such as `ОВ-`
or `ОТ-`, while newly created custom sections do not infer a short code from
their name. The display template remains:

```text
{prefix}{number}{suffix}
```

Examples:

```text
ОВ-{n}
12-{n}-ОВ
АОСР/{YYYY}/{n}
```

The create-document panel shows the proposed next number, for example
`Предлагаемый номер: ОВ-3`, and pre-fills editable `Номер документа`. The user
may override it freely, including leaving it empty. A manually entered number
does not consume or shift the automatic sequence. If an automatically numbered
act is renamed later, its allocated sequence remains consumed, so previous and
next act numbers do not change. Existing acts are never renumbered by ordinary
field edits. This remains an in-memory frontend mock: no backend rules,
persistence, collision transaction or production numbering engine is included.

The frontend-only object workspace premium UX polish keeps the same mock
functionality but makes the workspace feel more like a calm professional SaaS:
ID folders read as real work containers, overview acts as a command center, the
create-document selector uses document-type cards, and the object navigation
feels closer to `Overview -> Folder -> Document`. The visual direction avoids
relying on bright colors; quality should come from spacing, typography,
hierarchy, element sizing, action contrast, restrained cards/surfaces and
predictable navigation. This is styling, copy and layout only: no backend/API,
persistence, Prisma/schema/migrations, uploads, OCR/AI, generation or
production business logic was introduced.

Intermediate folder ID and Final ID are generated views/packages, not stored
business entities. A folder contains documents, a derived registry and the
frontend intermediate-print action; the object contains the final-print action.
Both views are always rebuilt from
the current documents and links, so changing documents later and generating
again produces an updated composition. This stage intentionally adds no closed
folder status, issued status, locked package state, package persistence,
archive records, backend/API, ZIP generation or production package logic.
Historical ZIP storage is outside the domain model.

The frontend-only derived registry correction removes the standalone
object-registry mental model from the current object workspace. Registry exists
only as a folder registry, derived from documents in one selected folder, or as
a final registry, derived from documents across all folders for Final ID.
Registry rows are generated from current in-memory document drafts and act type
metadata (`code`, `title`), so future act types can enter the same projection
without one-off AOSR-only registry logic. Registries are not stored business
entities, are not editable row stores, and add no backend/API, persistence,
Prisma/schema/migrations, uploads, OCR/AI, DOCX/PDF/ZIP generation or
production registry/package logic.

The frontend-only print-order AOSR editor UX step makes the current act editor
follow the real printed АОСР order instead of arbitrary form grouping. The
editor now starts with the printed header data (`Номер акта`, `Дата акта`,
object and form title), then shows the
organizations participating in the act with configurable display order, then
the current act signatories, and only after that the numbered points 1-7,
additional data and applications. Organization order updates the editor and the
preview immediately, signatory ordering uses a clearer drag handle plus visible
drop target while keeping explicit move buttons, and the current demo document
has frontend metadata for the default `АОСР 1` form variant. In linked mode the
printed object name, header organization order, representative groups, project
documentation and point 6 text resolve live from the object template and global
libraries. In manual mode they resolve from the complete act snapshot. Empty
fields remain allowed.
This is frontend-only mock UX/model metadata and adds no backend/API,
persistence, Prisma/schema/migrations,
uploads, OCR/AI, DOCX/PDF/ZIP generation or production business logic.

UX cleanup: reduced interface overload, simplified default parameters, clarified
primary actions. The object overview now keeps document creation as the only
prominent primary action, secondary package/navigation actions are calmer, AOSR
and package readiness blocks use `Подсказки`, and default parameters are grouped
around the data a new user expects to reuse as suggestions in new printed AOSR documents. This is
frontend-only UX cleanup and adds no new business features, backend/API,
persistence, Prisma/schema/migrations, OCR/AI or DOCX/PDF/ZIP behavior.

Period document UX cleanup clarifies that the period page is the daily work
folder for documents, not an AOSR-only area. Its primary action is now
`Создать документ`; the selector creates AOSR as the first active document type
and leaves future document types disabled as `скоро`. Registry and Periodic ID
remain compact generated views from period documents; the real registry
implementation is planned later. The later frontend mock adds simple numbering
settings to the object template, while production numbering remains deferred.
This is frontend-only UX/product work and adds no backend/API, Prisma,
persistence, uploads, OCR/AI or DOCX/PDF/ZIP behavior.

Production feature coding remains blocked outside explicitly requested narrow
demo/technical slices.

Главный источник знаний проекта:

```text
docs/PROJECT_MEMORY.md
```

Перед любой работой по проекту обязательно прочитать:

- `docs/PROJECT_MEMORY.md`
- `docs/CONVERSATION_QA_LOG.md`
- `docs/AGENTS.md`
- `docs/19-sharing-and-access-model-v1.md`
- `docs/20-auth-sharing-implementation-plan-v1.md`
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`
- `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`
- `docs/adr/0007-document-defaults-suggestions-and-controlled-updates.md`
- `docs/samples/registry-ventilation-example.md`
- `docs/samples/aosr-example-analysis.md`

Главный принцип:

```text
SOURCE OF TRUTH = STRUCTURED DATA
```

DOCX/PDF/реестры/комплекты являются производными артефактами и должны генерироваться из структурированных данных.

## Canonical ADR baseline

ADR baseline accepted. The canonical ADR files are now authoritative references
for future implementation work:

- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`
- `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`
- `docs/adr/0007-document-defaults-suggestions-and-controlled-updates.md`

Future implementation must comply with these ADRs. They consolidate existing
architecture decisions only and do not permit feature coding.

## MVP focus

- ОВиК
- ВК
- российская исполнительная документация
- АОСР как первая обязательная first-class form
- акты испытаний только после отдельной ратификации concrete forms
- сертификаты
- исполнительные схемы
- реестры
- комплекты ИД
- MVP должен быть usable without AI/OCR

## Non-goals

Система не является:

- ERP;
- BIM;
- CAD;
- Google Docs;
- CRM;
- generic document constructor;
- enterprise document management system;
- файловым менеджером.

## Created architecture documents

Уже созданы:

- `docs/06-data-model-v1.md`
- `docs/07-aosr-domain-specification.md`
- `docs/08-document-types-catalog.md`
- `docs/09-aggregate-boundaries-and-invariants.md`
- `docs/10-auth-workspace-rbac-model.md`
- `docs/11-ai-project-ingestion-and-assistance-model.md`
- `docs/12-database-schema-v1.md`
- `docs/13-domain-lifecycle-immutability-validation-v1.md`
- `docs/14-backend-api-architecture-v1.md`
- `docs/15-api-command-readmodel-contracts-v1.md`
- `docs/16-mvp-scope-and-first-forms-v1.md`
- `docs/17-tech-stack-and-implementation-strategy-v1.md`
- `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`
- `docs/19-sharing-and-access-model-v1.md`
- `docs/20-auth-sharing-implementation-plan-v1.md`
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`

## Access-model amendment

```text
docs/19-sharing-and-access-model-v1.md supersedes docs/10-auth-workspace-rbac-model.md for MVP implementation scope
```

MVP access uses owner-based workspace/certificate-library sharing, share codes
and capability grants instead of the previous RBAC role matrix. Future
workspace/session work must follow `docs/19`.

`docs/20-auth-sharing-implementation-plan-v1.md` is the safe phased plan for
future implementation of that access model. It starts with user identity
skeleton, then system admin marker, owned workspace baseline, workspace share
codes/grants, and certificate library share codes/grants. It is documentation
only and does not add schema, migrations, routes, auth or sharing code.

## Current guardrail

На основании Tech Stack and Implementation Strategy V1 и pre-scaffold gate документа:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

создан и принят первый инфраструктурный scaffold.

Scaffold включает:

- `pnpm` workspace root;
- strict TypeScript baseline;
- ESLint, Prettier, Vitest and local CI-equivalent checks;
- `apps/web` React + TypeScript + Vite shell;
- `apps/api` NestJS shell with technical `/health` endpoint only;
- `packages/shared-types` technical placeholder types;
- `packages/shared-config` typed env validation foundation;
- env example files for development, test and production;
- architecture guardrails for import boundaries and infrastructure portability;
- GitHub Actions CI for scaffold quality checks.
- canonical backend module skeleton in `apps/api/src`:
  `shared-kernel`, `infrastructure`, `workspace`, `documents`, `evidence`,
  `registry`, `packages`, `ai`, and `health`.
- first technical frontend-backend status slice: typed `/health` response,
  frontend fetch utility, placeholder status panel and focused tests.
- database foundation technical slice: Prisma generation wiring, empty
  `apps/api/prisma/schema.prisma` with no models, infrastructure database
  health port/adapter, and optional technical database dependency status in
  `/health` through explicit non-global module wiring.
- object storage foundation technical slice: infrastructure-only storage health
  port/adapter skeleton, env-driven S3-compatible config boundary, and optional
  technical storage dependency status in `/health` through the same explicit
  non-global module wiring.
- user identity skeleton: shared-kernel actor primitive plus workspace current
  actor resolver port/utility and tests, with no auth/session/provider/API
  implementation and no business authorization.
- global system admin marker: optional `SYSTEM_ADMIN_ACTOR_ID` config plus
  workspace `admin-path` marker utility and tests, with no admin routes, admin
  UI, Prisma model, business access bypass, workspace ownership, share grants or
  auth/session implementation.
- owned workspace baseline: TypeScript-only owned workspace primitive plus
  owner-only access utilities and tests, with no persistence, Prisma model,
  migrations, routes/controllers, frontend UI, sharing, grants or admin bypass.
- document creation context backend contract slice: framework-free
  `documents` application read contract for user-defined section/folder
  creation context, approved document types, `SectionTemplate` summary,
  section/folder package scope and proposal-only numbering, with
  access-decision-before-lookup tests and no Nest controller, route, OpenAPI,
  Prisma model, migration, repository, persistence, draft creation or number
  reservation.
- first mock AOSR demo UI slice: frontend-only Russian React screen with
  in-memory demo workspace/drafts, object-level defaults, current-act fields,
  mock representative/certificate-library selections, final derived
  applications, document-like printed-page preview and Testing Library
  interaction tests, with no backend routes, persistence, uploads, generation,
  AI, real auth, share codes or grants.
- mock app shell and object dashboard: frontend-only left navigation, mock
  object cards, certificate quick access placeholder, mock
  representative/organization management page, recent documents and in-memory
  dashboard -> object workspace navigation, with no backend, persistence, auth,
  uploads, generation, share codes/grants or business logic.
- frontend-only live template history: linked AOSR drafts previously resolved
  printable data from `ObjectTemplate` and global counterparty/signatory
  libraries; ADR 0008 supersedes that future implementation scope with
  `SectionTemplate` / `Шаблонные значения раздела`. Manual drafts use a complete
  snapshot with no partial overrides; selected certificates/object documents
  keep current mock printable copies only for frontend compatibility, while the
  future production contract keeps explicit evidence relations and freezes exact
  provenance on release; no backend, persistence, Prisma/schema/migration, auth,
  uploads, generation or production business logic is implied.
- frontend-only object document workspace: object-level document registry UI
  with mock filters, summary counts, AOSR usage labels and local in-memory
  creation, sharing the demo object document source with the AOSR point 4 drawer
  and adding no backend, persistence, uploads or production document storage.
- global certificate library architecture correction: certificates are
  user-level library entities, object navigation no longer exposes an
  object-owned certificate workspace, and opened-object metrics/registry/package
  surfaces may only derive used certificates from acts while the dashboard
  certificate library and AOSR material drawer keep sharing the same frontend
  mock store.
- global reusable libraries and output snapshots ADR: certificates,
  organizations and representatives are global user-level libraries; object
  templates store assignments/links; active linked acts resolve current data;
  manual acts and released outputs freeze snapshots at explicit boundaries;
  direct free-text entities are not the final model.
- frontend-only ADR 0006 demo wording alignment: remaining AOSR signatory
  creation copy now says `Создать представителя и назначение` /
  `Создать и добавить в акт`, creates an in-memory object assignment before
  adding it to the current act, and removes required blocking from mock global
  organization/representative forms while preserving empty fields.
- frontend-only ID Registry V1: read-only object registry page derived from
  AOSR drafts, object documents and the shared global certificate demo store,
  with summary counts, section filters and frontend act type metadata for AOSR
  rows, adding no backend, persistence or production registry business logic.
- frontend-only final ID package mock: read-only final package composition
  derived from demo acts, certificates and object documents, with act rows using
  frontend act type metadata and no download/generation/backend behavior.
- frontend-only act type metadata prep: one registered AOSR metadata record for
  future multi-act extensibility in the object workspace, document tree,
  registry and final package, without adding new act forms or production logic.
- AOSR Readiness Panel V1 and Final Package Readiness V1: compact frontend-only
  derived diagnostics over current demo data, with no real validation engine,
  backend policy, persistence, uploads, OCR/AI or generation behavior.
- frontend-only object workspace UX hierarchy polish: stronger opened-object
  hierarchy, document tree selected states, current-act metadata, clearer
  drawers and preview framing, with no new document statuses, approvals,
  workflow changes, backend/API behavior, persistence or generation.
- frontend-only folder-first object workspace mock: opened objects still land on
  `Обзор`, but object navigation now flows through user-created `Папки ИД`;
  seeded month names are demo fixtures only; each folder contains documents plus
  derived registry/package views, AOSR opens through a folder/document path,
  and an empty object can create its first arbitrary folder and document;
  duplicate workspace/editor counters are removed outside Overview, and no
  backend/API, persistence, Prisma/schema/migration, generation or production
  business logic is added.
- frontend-only folder-scoped AOSR creation mock: `Создать документ -> АОСР`
  creates a blank in-memory AOSR draft in the selected folder, proposes the
  next `ОВ-*` number through the initial numbering helper, leaves the user on
  the selected period until the draft is opened manually, and updates derived
  mock overview/final ID counts without
  backend, localStorage, API or persistence.

The backend module skeleton includes module boundaries, README ownership notes,
placeholder tokens/ports, `apps/api/src/ARCHITECTURE.md`, and ESLint import
guardrails. It intentionally does not include business/domain implementation.

The technical status, database foundation and object storage foundation slices
intentionally do not add domain readiness, business commands, CRUD APIs,
OpenAPI, domain database state, file APIs or real use cases. They exist only to
validate frontend -> backend connectivity, shared types, env-driven API/storage
configuration, Prisma client generation and infrastructure health boundaries.
The mock object dashboard now opens an object overview first; users explicitly
open AOSR through a folder/document path from recent folders, recent documents
or the create-document selector. The AOSR screen remains a frontend-only mock
for feedback, not a production workflow. Its mock printed-page preview
separates object-level defaults from current-act fields, lets the current act
reuse mock representatives and global mock certificate/material records,
derives applications at the final end of the preview before final signature
blocks, and remains without real PDF generation, certificate library
implementation, signatory database behavior, uploads or persistence.
The separate mock representatives/organizations dashboard page is also
frontend-only and in-memory: global libraries and object-level binding concepts
are demonstrated without schema, API routes, auth, uploads or production
business rules.

GitHub Actions CI is committed at `.github/workflows/ci.yml`. It runs on
`push` and `pull_request` with Node 22, Corepack, `pnpm install
--frozen-lockfile`, and `corepack pnpm ci:check`. It does not require
production secrets, deploy, run AI/OCR, or generate production artifacts.

Local quality command:

```bash
corepack pnpm ci:check
```

## How to deploy on Vercel

This repository deploys only the frontend AOSR demo to Vercel. The deployment is
configured by root `vercel.json` and intentionally does not deploy the backend,
Prisma, databases, uploads, AI/OCR, PDF generation, share codes or grants.

In Vercel:

1. Import Git repository `123321neit/pto-id-system`.
2. Create one Vercel project for the frontend demo only.
3. Keep Root Directory as the repository root (`.`), so pnpm workspace
   dependencies can be resolved from the root lockfile.
4. Use these build settings:
   - Framework Preset: `Vite`
   - Install Command:
     `corepack pnpm --filter @pto/web... install --frozen-lockfile`
   - Build Command: `corepack pnpm --filter @pto/web... build`
   - Output Directory: `apps/web/dist`
5. Set the Production Branch to `main`.
6. Do not create a backend Vercel project and do not add environment variables
   for this demo deployment.

After GitHub is connected, Vercel creates a production deployment after pushes
to `main` and preview deployments for pull requests according to the project Git
settings.

The scaffold intentionally does not include:

- production AOSR implementation;
- certificates implementation;
- package builder implementation;
- migrations;
- OpenAPI;
- auth implementation;
- login/register/session/cookie/JWT/OAuth implementation;
- admin panel, admin routes/controllers or support tenant browsing;
- uploads, download APIs or business file storage implementation;
- queue workers;
- document generation;
- AI/OCR;
- CRUD APIs;
- domain Prisma models or business database tables;
- business validation or domain logic.

Canonical ADR baseline is now accepted. Future implementation tasks must comply
with accepted ADRs in `docs/adr/`.

Feature coding remains blocked until a separate explicit feature/database/API
task is requested and checked against the ADR baseline, `docs/19` access model
`docs/20` phased plan, and project memory. The current dashboard/object cards
and AOSR screen are mock UI only and must not be treated as domain
implementation.

Recommended next step: collect user feedback on the mock AOSR demo screen.
Phase 4 workspace share codes, domain schema, migrations, production AOSR,
packages, uploads/file APIs, queues, sharing grants and AI remain separate
explicit tasks.
