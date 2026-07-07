# PROJECT_MEMORY

# ИДея

# EXECUTIVE DOCUMENTATION PLATFORM

# MASTER CONTEXT / SOURCE OF TRUTH

# VERSION: 2026-06-23-SECTION-SCOPED-ID-AND-SECTION-TEMPLATE

# STATUS: FIRST ALLOWED INFRASTRUCTURE BOOTSTRAP SCAFFOLD; CANONICAL ADR BASELINE ACCEPTED; BACKEND MODULE ARCHITECTURE SKELETON INTRODUCED; FIRST TECHNICAL FRONTEND-BACKEND STATUS SLICE INTRODUCED; DATABASE FOUNDATION TECHNICAL SLICE INTRODUCED; OBJECT STORAGE FOUNDATION TECHNICAL SLICE INTRODUCED; AUTH SHARING IMPLEMENTATION PLAN ADDED; USER IDENTITY SKELETON INTRODUCED; GLOBAL SYSTEM ADMIN MARKER INTRODUCED; OWNED WORKSPACE BASELINE INTRODUCED; FIRST MOCK AOSR DEMO UI SLICE INTRODUCED; MOCK AOSR CONFIGURABLE OBJECT HEADER ORGANIZATIONS AND REPRESENTATIVE LIBRARY INTRODUCED; MOCK AOSR DEMO UX/PREVIEW REFINED; MOCK APP SHELL AND OBJECT DASHBOARD INTRODUCED; FRONTEND-ONLY MOCK REPRESENTATIVES/ORGANIZATIONS MANAGEMENT PAGE INTRODUCED; FRONTEND-ONLY MOCK CERTIFICATE LIBRARY PAGE INTRODUCED; STAGE 5 MOCK AOSR WORKSPACE UX STABILIZED; AOSR EDITOR UX CLEANUP INTRODUCED; AOSR WORKSPACE DRAWER UX INTRODUCED; FRONTEND-ONLY MOCK OBJECT DOCUMENT LIBRARY INTRODUCED; AOSR WORKSPACE APPLICATIONS UX CLEANUP INTRODUCED; FRONTEND-ONLY MOCK OBJECT COMPLIANCE DEFAULTS AND ACT OVERRIDES INTRODUCED; FRONTEND-ONLY MOCK OBJECT WORKSPACE VISUAL PASS INTRODUCED; FRONTEND-ONLY MOCK OBJECT WORKSPACE SHELL INTRODUCED; AOSR DOCUMENT PREVIEW DRAWER UX INTRODUCED; AOSR DOCUMENT PREVIEW PAGE VISUALIZATION REFINED; FRONTEND-ONLY OBJECT DOCUMENT WORKSPACE INTRODUCED; FRONTEND-ONLY OBJECT CERTIFICATE WORKSPACE INTRODUCED; FRONTEND-ONLY ID REGISTRY V1 INTRODUCED; FRONTEND-ONLY FINAL ID PACKAGE MOCK INTRODUCED; FRONTEND-ONLY ACT TYPE METADATA PREP INTRODUCED; AOSR READINESS PANEL V1 INTRODUCED; FINAL PACKAGE READINESS V1 INTRODUCED; FRONTEND-ONLY OBJECT WORKSPACE UX HIERARCHY POLISH INTRODUCED; FRONTEND-ONLY OBJECT OVERVIEW AND GLOBAL CERTIFICATE ARCHITECTURE UX CORRECTION INTRODUCED; GLOBAL REUSABLE LIBRARIES AND ACT SNAPSHOTS ADR ACCEPTED; FRONTEND-ONLY PERIOD-FIRST OBJECT WORKSPACE MOCK INTRODUCED; FRONTEND-ONLY PERIOD-SCOPED AOSR CREATION MOCK INTRODUCED; FRONTEND-ONLY AOSR MANUAL NUMBER OVERRIDE MOCK INTRODUCED; FRONTEND-ONLY OBJECT WORKSPACE PREMIUM UX POLISH INTRODUCED; FRONTEND-ONLY GENERATED ID PACKAGE VIEWS UX INTRODUCED; FRONTEND-ONLY PRINT-ORDER AOSR EDITOR UX INTRODUCED; FRONTEND-ONLY UX OVERLOAD CLEANUP INTRODUCED; FRONTEND-ONLY RADICAL UX CLEANUP INTRODUCED; FRONTEND-ONLY PERIOD DOCUMENT UX CLEANUP INTRODUCED; FRONTEND-ONLY DOCUMENT DEFAULT PARAMETERS AND DOCUMENT-OWNED AOSR TEXTS INTRODUCED; FRONTEND-ONLY AOSR PRINTABLE DEFAULT SNAPSHOTS EXTENDED; LIVE OBJECT TEMPLATE LINKS AND MANUAL ACT SNAPSHOTS ACCEPTED; FRONTEND-ONLY OBJECT TEMPLATE UX SUMMARY INTRODUCED; FUTURE SECTION TEMPLATE BACKEND CONTRACT DOCUMENTED; DOCUMENT CREATION CONTEXT BACKEND CONTRACT SLICE INTRODUCED; ADR 0008 SECTION-SCOPED ID ACCEPTED; FRONTEND-ONLY SECTION WORKSPACE UX INTRODUCED; FRONTEND-ONLY SECTION MODEL ARCHITECTURE CLEANUP INTRODUCED

# LANGUAGE: RU

---

## 0. IMPORTANT — HOW TO USE THIS FILE

Этот файл — главный источник контекста проекта **ИДея**.

Техническое имя репозитория/package workspace остаётся `pto-id-system`; это не
продуктовый UI-name.

Любой новый чат, Codex, AI-агент, разработчик или подрядчик обязан:

1. Полностью прочитать этот файл перед работой.
2. Считать его главным source of truth по продуктовой и архитектурной логике.
3. Не начинать кодинг, если задача затрагивает нерешённые архитектурные вопросы.
4. Не ломать принятые решения без отдельного ADR.
5. Не подменять систему файловым менеджером, CRM, ERP, BIM или generic document constructor.
6. Задавать вопросы пользователю, если решение влияет на доменную модель исполнительной документации.
7. Спорить с пользователем, если запрос создаёт архитектурный риск.

Текущая стадия проекта:

```text
FIRST ALLOWED INFRASTRUCTURE BOOTSTRAP SCAFFOLD; CANONICAL ADR BASELINE ACCEPTED; BACKEND MODULE ARCHITECTURE SKELETON INTRODUCED; FIRST TECHNICAL FRONTEND-BACKEND STATUS SLICE INTRODUCED; DATABASE FOUNDATION TECHNICAL SLICE INTRODUCED; OBJECT STORAGE FOUNDATION TECHNICAL SLICE INTRODUCED; AUTH SHARING IMPLEMENTATION PLAN ADDED; USER IDENTITY SKELETON INTRODUCED; GLOBAL SYSTEM ADMIN MARKER INTRODUCED; OWNED WORKSPACE BASELINE INTRODUCED; FIRST MOCK AOSR DEMO UI SLICE INTRODUCED; MOCK AOSR CONFIGURABLE OBJECT HEADER ORGANIZATIONS AND REPRESENTATIVE LIBRARY INTRODUCED; MOCK AOSR DEMO UX/PREVIEW REFINED; MOCK APP SHELL AND OBJECT DASHBOARD INTRODUCED; FRONTEND-ONLY MOCK REPRESENTATIVES/ORGANIZATIONS MANAGEMENT PAGE INTRODUCED; FRONTEND-ONLY MOCK CERTIFICATE LIBRARY PAGE INTRODUCED; STAGE 5 MOCK AOSR WORKSPACE UX STABILIZED; AOSR EDITOR UX CLEANUP INTRODUCED; AOSR WORKSPACE DRAWER UX INTRODUCED; FRONTEND-ONLY MOCK OBJECT DOCUMENT LIBRARY INTRODUCED; AOSR WORKSPACE APPLICATIONS UX CLEANUP INTRODUCED; FRONTEND-ONLY MOCK OBJECT COMPLIANCE DEFAULTS AND ACT OVERRIDES INTRODUCED; FRONTEND-ONLY MOCK OBJECT WORKSPACE VISUAL PASS INTRODUCED; FRONTEND-ONLY MOCK OBJECT WORKSPACE SHELL INTRODUCED; AOSR DOCUMENT PREVIEW DRAWER UX INTRODUCED; AOSR DOCUMENT PREVIEW PAGE VISUALIZATION REFINED; FRONTEND-ONLY OBJECT DOCUMENT WORKSPACE INTRODUCED; FRONTEND-ONLY OBJECT CERTIFICATE WORKSPACE INTRODUCED; FRONTEND-ONLY ID REGISTRY V1 INTRODUCED; FRONTEND-ONLY FINAL ID PACKAGE MOCK INTRODUCED; FRONTEND-ONLY ACT TYPE METADATA PREP INTRODUCED; AOSR READINESS PANEL V1 INTRODUCED; FINAL PACKAGE READINESS V1 INTRODUCED; FRONTEND-ONLY OBJECT WORKSPACE UX HIERARCHY POLISH INTRODUCED; FRONTEND-ONLY OBJECT OVERVIEW AND GLOBAL CERTIFICATE ARCHITECTURE UX CORRECTION INTRODUCED; GLOBAL REUSABLE LIBRARIES AND ACT SNAPSHOTS ADR ACCEPTED; FRONTEND-ONLY PERIOD-FIRST OBJECT WORKSPACE MOCK INTRODUCED; FRONTEND-ONLY PERIOD-SCOPED AOSR CREATION MOCK INTRODUCED; FRONTEND-ONLY AOSR MANUAL NUMBER OVERRIDE MOCK INTRODUCED; FRONTEND-ONLY OBJECT WORKSPACE PREMIUM UX POLISH INTRODUCED; FRONTEND-ONLY GENERATED ID PACKAGE VIEWS UX INTRODUCED; FRONTEND-ONLY PRINT-ORDER AOSR EDITOR UX INTRODUCED; FRONTEND-ONLY UX OVERLOAD CLEANUP INTRODUCED; FRONTEND-ONLY RADICAL UX CLEANUP INTRODUCED; FRONTEND-ONLY PERIOD DOCUMENT UX CLEANUP INTRODUCED; FRONTEND-ONLY DOCUMENT DEFAULT PARAMETERS AND DOCUMENT-OWNED AOSR TEXTS INTRODUCED; FRONTEND-ONLY AOSR PRINTABLE DEFAULT SNAPSHOTS EXTENDED; LIVE OBJECT TEMPLATE LINKS AND MANUAL ACT SNAPSHOTS ACCEPTED; FRONTEND-ONLY OBJECT TEMPLATE UX SUMMARY INTRODUCED; FUTURE SECTION TEMPLATE BACKEND CONTRACT DOCUMENTED; DOCUMENT CREATION CONTEXT BACKEND CONTRACT SLICE INTRODUCED; ADR 0008 SECTION-SCOPED ID ACCEPTED; FRONTEND-ONLY SECTION WORKSPACE UX INTRODUCED; FRONTEND-ONLY SECTION MODEL ARCHITECTURE CLEANUP INTRODUCED
```

Проект принял первый явно разрешённый infrastructure/bootstrap scaffold,
отдельный backend module architecture skeleton, первый маленький technical
frontend-backend status slice, database foundation technical slice, object
storage foundation technical slice и первый mock AOSR demo UI slice. Это не
production MVP implementation. Главная цель текущего этапа — удерживать
минимальную инженерную основу репозитория и собирать feedback по frontend demo
без доменной persistence/API реализации до отдельного feature/database/API
задания.

Canonical ADR baseline accepted. Authoritative ADR references:

- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`
- `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`
- `docs/adr/0007-document-defaults-suggestions-and-controlled-updates.md`
- `docs/adr/0008-section-scoped-id-and-section-templates.md`

Future implementation must comply with these ADRs. They consolidate existing accepted decisions only and do not permit production feature coding.

Current section-template authority, clarified 2026-06-23:

```text
Object -> DocumentationSection -> SectionTemplate -> linked working act -> resolved printState
                                ^
global libraries ----------------+
                                         |
                                         +-> explicit manual switch -> one complete manualTemplateSnapshot

release -> immutable DocumentRevisionSnapshot
section final ID package build/release -> immutable PackageSnapshot
```

ADR 0007 is authoritative whenever older sections or historical log entries
describe object defaults copied into every act, object-owned company snapshots
as the normal working source, temporary act-only representatives or partial
document overrides. Those older passages preserve chronology only. They must
not be used to design production storage/API behavior. ADR 0008 supersedes the
object-level template scope: future implementation uses `SectionTemplate` /
`Шаблонные значения раздела`.

Current section/folder terminology, clarified 2026-06-23:

```text
Object -> user-defined documentation sections -> user-defined ID folders -> documents
Section -> one folder -> intermediate ID
Section -> all folders -> final ID
```

Section names and folder names are user-defined. `Вентиляция`, `Отопление`,
`Водоснабжение`, `ОВ`, `ВК`, `Система В1` and similar names may be suggestions
or examples, never a fixed enum. Final ID is section-scoped by default, not
object-wide.

Current frontend section workspace mock, introduced 2026-06-23:

- `apps/web` now shows object documentation sections before ID folders.
- Demo sections start with `Вентиляция` and `Отопление`, while created section
  names remain user-defined strings.
- Folders are created inside the selected section; intermediate ID remains
  folder-scoped inside that section.
- AOSR document creation and numbering proposals use the selected section's
  folders and section template settings.
- `Шаблонные значения раздела` is visible in the object workspace and can copy
  repeated texts, numbering settings and global-library assignment links into
  another demo section or another demo object through the frontend clipboard.
- Final ID view is filtered to the selected section's folders.
- This is frontend-only in-memory UX: no Prisma schema/model/migration, Nest
  controller, HTTP API, persistence adapter, real template-copy command,
  production package generation or released snapshot behavior was introduced.

Historical object-template UX, superseded for future implementation by ADR 0008:

- `Шаблон объекта` is still a frontend-only in-memory mock panel, not
  production persistence.
- The panel starts with a summary of the live chain, organization blocks,
  representative groups and numbering rule.
- Organization and representative editing explains the flow
  `global library -> object-template assignment -> linked act`.
- This UX layer does not add backend/API routes, Prisma schema, migrations,
  storage, document generation or production template lifecycle behavior.
  Future UI wording should use `Шаблонные значения раздела`.

Current future backend contract, clarified 2026-06-23 and amended by ADR 0008:

- `docs/14-backend-api-architecture-v1.md` and
  `docs/15-api-command-readmodel-contracts-v1.md` now define the conceptual
  application contract for `SectionTemplate`, user-defined documentation
  sections, user-defined ID folders, section/folder-scoped document creation,
  section/folder numbering proposals and strict linked/manual AOSR behavior.
- Future commands must preserve
  `global libraries -> SectionTemplate -> linked working act`; linked acts do
  not store copied template-owned defaults.
- `copy_section_template_to_section` copies repeated texts, numbering policy and
  global-library assignment links into another section in the same object or
  another object; it does not copy folders, documents, released outputs, manual
  snapshots, generated artifacts or library records themselves.
- Manual mode is one explicit whole-act transition to a complete
  `manualTemplateSnapshot`; partial template-field overrides remain invalid.
- `read_document_creation_context` is query-only and does not create a draft or
  reserve a number.
- Releasing documents/packages freezes exact resolved output in immutable
  revision/package snapshots.
- This contract still does not permit API routes/controllers, OpenAPI,
  Prisma/schema/migrations, repositories, persistence, queue, storage, renderer
  or production backend implementation.

Current document creation context backend slice, clarified 2026-06-23:

- `apps/api/src/documents/application/document-creation-context.ts` implements
  the first framework-free, query-only application contract for
  `read_document_creation_context`.
- The slice requires an explicit allowed workspace access decision before any
  object/section/folder lookup and returns leakage-safe
  `NOT_FOUND_OR_NOT_AUTHORIZED` denials.
- It supports arbitrary user-defined section and ID folder names, approved
  document type reads, current `SectionTemplate` summary, live resolution chain,
  section/folder package scope and proposal-only numbering.
- It does not create drafts, reserve numbers, mutate sequences or persist data.
- It does not add Nest controllers, HTTP routes, OpenAPI, DTO serialization,
  Prisma schema/models, migrations, repositories, persistence adapters, queues,
  storage, renderer or production AOSR behavior.

Older `period-first`, `Period`, `Сентябрь 2026`, `Октябрь 2026` and object-wide
final ID passages preserve frontend history or seeded demo examples. They do
not constrain folder names to months and must not become a fixed production
enum/taxonomy.

MVP access amendment accepted:

```text
docs/19-sharing-and-access-model-v1.md supersedes docs/10-auth-workspace-rbac-model.md for MVP implementation scope
```

Future workspace/session/access tasks must use owner-based sharing, share codes and capability grants from `docs/19`, not the older role matrix.

Auth/sharing implementation sequencing accepted:

```text
docs/20-auth-sharing-implementation-plan-v1.md
```

Future auth/sharing work must follow Phase 1 through Phase 7 in `docs/20` and
must not jump directly to Prisma domain models, migrations, API routes, share
grants or certificate-library sharing without a separate scoped task.

Phase 1 user identity skeleton introduced. It provides a framework-free
`Actor` primitive and workspace current actor resolver utility/port. It fails
closed for missing/disabled actors and grants no business access. It is not
login, registration, password auth, magic links, OAuth, sessions/cookies/JWT,
Prisma user persistence, API route/controller work, system admin, workspace
creation, share codes, grants or business authorization.

Phase 2 global system admin marker introduced. It provides optional
deployment/config key `SYSTEM_ADMIN_ACTOR_ID` and a framework-free workspace
`admin-path` marker utility that can identify the one configured active actor.
Missing config means no actor is system admin, and disabled/unavailable actors
fail closed. The marker does not mutate `Actor` with roles/capabilities, does
not imply workspace ownership, does not bypass owner/grant business access, and
does not add admin routes, admin UI, support tenant browsing, Prisma models,
migrations, auth/session implementation, share codes or grants.

Phase 3 owned workspace baseline introduced. It provides a TypeScript-only
`OwnedWorkspace` primitive and framework-free owner-only access utilities.
Owner checks return leakage-safe `NOT_FOUND_OR_NOT_AUTHORIZED` denial for
missing, disabled, non-owner or wrong-scope access. Child resource lookup must
come only after workspace ownership is verified. The system admin marker is not
accepted as workspace ownership. This is not Prisma persistence, migrations,
routes/controllers, frontend UI, auth/session implementation, share codes,
share grants, certificate library sharing, admin support tenant browsing or
AOSR/certificate/registry/package implementation.

First mock AOSR demo UI slice introduced and refined. The root React/Vite screen
now shows a frontend-only Russian demo workspace with in-memory mock AOSR
drafts, AOSR-like editable fields ordered by act flow and a document-like
printed-page preview for user feedback. The mock UI now distinguishes
configurable object-level header organization blocks from the configurable
object representative/signatory library. Header organization labels and
representative role labels are not fixed globally and must remain configurable
per object; sample AOSR wording is a visual/structural reference only. It is
labelled `ИДея / демо-данные / не для работы в продуктиве`. The
refined mock keeps object/common settings and large libraries behind buttons,
models global libraries versus object-level editable bindings only in memory,
keeps certificate materials library-linked rather than free text, and uses the
AOSR Word example only as a visual/layout reference for the HTML preview. This
is not production AOSR implementation, not Phase 4 share codes, not persistence,
not upload/generation/AI, not real auth and not a backend API.

Mock app shell and object dashboard introduced. The React/Vite demo now starts
on a frontend-only Russian object dashboard with a modern left navigation rail,
`Мои объекты`, search, mock object cards, quick access cards for
`Библиотека сертификатов` and `Представители и организации`, plus recent
documents. Opening a mock object switches in memory to the existing AOSR
workspace/editor, and the workspace exposes `Назад к объектам`. The
`Представители и организации` dashboard section now opens a frontend-only mock
management page with in-memory global organization and representative
libraries, local mock add forms and conceptual notes about object-level
bindings/snapshots. Global library entries versus object-level bindings remain
mock/in-memory only. The `Библиотека сертификатов` dashboard section now opens a
frontend-only mock certificate library page with in-memory cards, search, a
lightweight status filter, a local add form and UX guidance for the future flow
from library material search to act applications. The certificate page has no
uploads, no OCR, no backend, no persistence and no real file storage. The
dashboard certificate, organization and representative pages now share the same
frontend mock store with the AOSR workspace, so added demo records appear in the
AOSR material, signatory and object-organization pickers. Stage 5 also clarifies
the AOSR workspace mental model: default parameters stay behind a compact
button, the middle column is presented as `Рабочая область акта`, and UI copy
separates object-level reusable defaults from `Текущий акт`. The intended future model remains
`global library -> object binding/snapshot -> act usage`; for demo convenience,
object representatives may still be prefilled from the global mock library, while
the real system will require user selection/binding for the object. Exact
Word-like AOSR preview matching remains a separate future stage. This is mock
frontend navigation only: dashboard/object cards and management rows are mock
data, there is no backend, persistence, Prisma schema, migrations, API
route/controller, auth/session, upload, real DOCX/PDF generation, AI/OCR, share
code/grant or production business logic.

Stage: AOSR editor UX cleanup. The current frontend-only mock AOSR editor moved
default parameters out of the inline act form into a dedicated button-opened
dialog/panel, while preserving object header organization and representative
library editing in memory. The visible act editor now follows AOSR field order
more closely: general act data, hidden works, project documentation, materials
from the certificate library, explicit execution drawings/schemes, work dates,
compliance, subsequent works, additional data and current act signatories. The
separate visible `Место`/location act fields were removed; AOSR editing relies
on object data plus work description, axes and elevations. The execution
drawings/schemes section is now explicit and remains linked to point 4 and final
applications. No backend, persistence, Prisma/schema/migrations, routes,
auth/session, uploads, OCR/AI, real DOCX/PDF generation, share codes or
production business logic were introduced.

Stage: AOSR workspace drawer UX. The current frontend-only mock object
workspace now has clearer visual hierarchy closer to the UI reference: important
workspace actions use a stronger accent, and certificate material selection
opens in a visible drawer/panel titled `Выбор материалов из библиотеки
сертификатов` instead of a subtle inline expansion below the field. Selected
materials remain visible in the act editor, material selection remains linked to
the certificate library. The preview wording for point 4 was corrected closer
to the real AOSR wording:
`4. Предъявлены документы, подтверждающие соответствие работ предъявляемым к ним
требованиям:`.

Stage: frontend-only mock object document library and user-controlled
applications. The mock AOSR workspace now has an in-memory object document
library separate from the certificate library, with categories:
`Исполнительная схема`, `Исполнительный чертеж`, `Протокол`, `Журнал`,
`Испытание` and `Другое`. Point 4 now uses
selected object documents opened through a drawer titled `Документы объекта`
with search and type filtering. Applications are derived from selected material
certificates plus selected object documents, and every derived application has a
checkbox. All applications are checked by default; unchecking keeps the
certificate/material or object document selected in the act but removes that
item from the final applications list and the preview applications block. No
backend, persistence, Prisma/schema/migrations, routes, auth/session, uploads,
file storage, OCR/AI, real DOCX/PDF generation, share codes/grants or
production business logic were introduced.

Stage: AOSR workspace applications UX cleanup. The frontend-only mock object
workspace now has cleaner editor hierarchy closer to the UI reference: a compact
current-act summary strip shows materials, selected object documents, included
applications, signatories and status. Point 4 is focused only on selected object
documents and the `Документы объекта` drawer. Applications moved to one separate
`Приложения к акту` checklist after additional information and before current
act signatories. The duplicate editor list `Итоговые приложения в акте` was
removed; preview remains the final printed-result source for included
applications. Checkbox behavior is unchanged: unchecked applications disappear
from preview applications only while the source material/document stays selected
in the act. No backend, persistence, Prisma/schema/migrations, routes,
auth/session, uploads, file storage, OCR/AI, real DOCX/PDF generation, share
codes/grants or production business logic were introduced.

Historical stage (superseded by ADR 0007 for active template-owned data):
frontend-only mock object compliance defaults and act overrides. The
default parameters dialog has a dedicated point 6 default text for
`Соответствие работ предъявляемым требованиям`. ADR 0007 supersedes the earlier
live-default behavior: current AOSR drafts own point 6 text after creation,
show whether it still matches current defaults, and can explicitly restore from
current default parameters without mutating those defaults. This remains a frontend-only
in-memory mock and does not add backend, persistence, Prisma/schema/migrations,
routes/controllers, auth/session, uploads, file storage, OCR/AI, real
DOCX/PDF generation, share codes/grants or production business logic.

Historical stage (superseded by ADR 0007 for active template-owned data):
frontend-only AOSR printable default snapshots. The AOSR editor and
preview were audited for remaining printable values that still read object
defaults or libraries live. Current AOSR drafts now own the printed object name,
under-title text, header organization blocks/order, project documentation text,
point 6 compliance text, printed form title metadata, selected material
certificate snapshots and selected object document snapshots. Object default
parameters and global/object libraries remain live only as settings, search,
proposal, comparison and explicit restore sources. Preview/rendering must read
printable values from the draft/revision by default. This remains frontend-only
in-memory mock architecture and does not add backend, persistence,
Prisma/schema/migrations, routes/controllers, auth/session, uploads, file
storage, OCR/AI, real DOCX/PDF generation, package release snapshots or
production business logic.

Stage: frontend-only mock object workspace visual pass. The object workspace
was visually refined closer to the clean UI reference for PTO engineers:
object/project identity is stronger, workspace status counts are compact cards,
the three-column tree/editor/preview layout has calmer boundaries, the current
act editor has lighter section rhythm, the materials/documents drawers have
clearer selected states, and the preview panel has better framing and scroll
behavior. This is UX/layout/styling only: no AOSR business logic, data model,
backend, persistence, Prisma/schema/migrations, routes/controllers,
auth/session, uploads, OCR/AI, DOCX/PDF generation, sharing or production
behavior was introduced.

Stage: frontend-only mock object workspace shell. The opened object is now the
central entity of the demo. The object workspace has left navigation for
`Акты`, `Сертификаты`, `Документы объекта`, `Представители`, `Реестр ИД` and
default parameters, object status and mock quick metrics. Existing AOSR editing
remains available as `Object -> Акты -> АОСР` without rewriting the AOSR editor.
`Сертификаты`, `Документы объекта` and `Реестр ИД` are professional placeholders
for future object sections, while the existing representatives/organizations
mock page is reused inside the object workspace navigation. The current object
settings dialog remains accessible from AOSR and from object navigation. This is
frontend mock UX/navigation/layout only: no backend, persistence,
Prisma/schema/migrations, routes/controllers, auth/session, uploads, OCR/AI,
DOCX/PDF generation, sharing or production business logic was introduced.

Stage: AOSR document preview drawer UX. The frontend-only mock AOSR workspace
now removes the permanently visible right preview column and uses a reusable
`DocumentPreviewDrawer` opened by the workspace header action
`Предпросмотр документа`. The main AOSR workspace is now focused on
`Дерево документов | Редактор`, giving the editor more horizontal room while
the existing preview content remains available in a right-side closable drawer.
The preview still consumes the same in-memory mock AOSR data and renderer
content, but its document visualization is improved with white A4-like pages,
page shadows, page margins and visible gaps between approximate pages. This is
preview UX only: no business logic, object architecture, AOSR data model,
backend, persistence, Prisma/schema/migrations, routes/controllers,
auth/session, uploads, OCR/AI, DOCX/PDF generation, compliance logic, object
settings, certificates, applications, signatories, dashboard flow, sharing or
production behavior was changed.

Stage: AOSR document preview page visualization refinement. The right-side
preview drawer remains the only preview surface, but the approximate two-page
HTML mock now reads as separate paper sheets with explicit `Страница 1` and
`Страница 2` labels, larger page gaps, a subtle divider, sheet shadowing and a
light grey preview background. The drawer header now carries compact act
number, act date and included-applications context while keeping the close
button visible. This is still mock HTML preview only, not real PDF/DOCX
generation and not a production pagination engine.

Stage: frontend-only object document workspace. The object workspace
`Документы объекта` section is no longer a placeholder. It now shows an
in-memory object document registry with the header `Документы объекта`, the
description for executive schemes, executive drawings, protocols, journals and
other object documents, a table with name/type/number/date/AOSR usage columns,
simple filters `Все`, `Схемы`, `Чертежи`, `Протоколы`, `Журналы`, summary
counts for total documents, schemes, drawings and protocols, and a local
`Добавить документ` form for name/type/number/date metadata. AOSR usage labels
are derived from the current mock AOSR draft selections where available. The
object documents page and the AOSR point 4 document drawer use the same
frontend demo store, so newly added object documents can be found from the AOSR
document selection drawer without reload. This is a UX/domain foundation for the
future ID registry and package flows only: no backend, persistence, uploads,
file storage, Prisma/schema/migrations, API routes, auth/session, OCR/AI,
DOCX/PDF generation or production business logic was introduced.

Stage: frontend-only object certificate workspace experiment. This earlier
opened-object `Сертификаты` page experiment is superseded by the
2026-06-11 object overview and global certificate architecture correction.
Current UX must not imply that objects own certificate libraries. Certificates
are global user-level library entities, AOSR material selection uses the global
certificate store, and object/registry/final-package surfaces show only derived
used certificates from acts. No backend, persistence, uploads, file storage,
Prisma/schema/migrations, API routes, auth/session, OCR/AI, DOCX/PDF generation
or production business logic was introduced by the old experiment.

Stage: frontend-only ID Registry V1. The object workspace `Реестр ИД` section
is no longer a placeholder. It now shows the header
`Реестр исполнительной документации`, the description
`Сводный перечень документов исполнительной документации объекта.`, compact
summary cards for total documents, AOSR, object documents and certificates, and
one read-only table with section/name/number/date/details columns. Registry
rows are derived from current frontend demo entities only:
`demoAosrWorkspace.drafts`, the object-document demo store and the shared global
certificate demo store already used by the certificate library and AOSR
material drawer. AOSR registry labels and section names now come through the
frontend-only act type metadata registry, preparing the projection for future
act types without adding them. Certificates remain global demo certificate
records; the registry only references/uses them and does not introduce
object-owned certificate storage or duplicate certificate data. Filters `Все`,
`АОСР`, `Документы объекта` and `Сертификаты` work in memory. This is Registry
V1 only: no manual editing, backend, persistence, uploads, file storage,
Prisma/schema/migrations, API routes, auth/session, OCR/AI, DOCX/PDF generation
or production registry/package business logic was introduced.

Stage: frontend-only final ID package mock. The object workspace now includes
the navigation section `Итоговый комплект` and the read-only page
`Итоговый комплект ИД` with description
`Финальный комплект исполнительной документации по объекту.`. This records the
domain distinction between periodic/current ID, usually prepared monthly during
construction, and final object ID, prepared once at the end of the project. The
mock final package derives composition from existing frontend demo AOSR drafts,
selected certificates/materials and selected object documents; certificates and
object documents are deduplicated by id. Act rows derive their visible
title/code from the frontend-only act type metadata registry. The page groups
`Реестр ИД`, `Акты`, `Сертификаты` and `Документы объекта`, shows summary
counts and has a disabled demo button `Скачать итоговую ИД`. No real
PDF/DOCX/ZIP generation, download, package builder, backend, API, persistence,
uploads, OCR/AI, Prisma/schema/migrations or production business logic was
introduced.

Stage: frontend-only act type metadata prep. The demo now has a small
frontend-only act type metadata model with `id`, `code`, `title` and
`registrySectionName`. Only AOSR is registered now. No new act forms, editors
or previews were introduced. The object workspace document tree, registry and
final package derive their AOSR labels/sections from this metadata so future
act types can be added later without rewriting the derived registry/package
surfaces. This is mock architecture cleanup only: no backend, persistence,
Prisma/schema/migrations, API routes, auth/session, uploads, OCR/AI,
DOCX/PDF generation or production business logic was introduced.

Stage: AOSR Readiness Panel V1 and Final Package Readiness V1. The frontend
mock AOSR workspace now shows non-blocking `Проверка заполнения` near the
current act summary, using only existing in-memory demo data to identify empty
sections for signatories, materials, object documents and point 6 compliance
text. The read-only `Итоговый комплект ИД` page now shows `Проверка комплекта`,
warning when the derived mock package has no acts, no certificates or no object
documents. These diagnostics are frontend-only user feedback, not a real
validation engine, blocking policy, backend policy, persistence, API route,
upload/file validation, OCR/AI flow, DOCX/PDF generation or production package
readiness implementation.

Stage: frontend-only object workspace UX hierarchy polish. The opened object
workspace was refined as a visual/product hierarchy pass for first-time users:
object header, important metrics, object navigation active states, AOSR
document tree hierarchy, current-act summary, readiness diagnostics, form
section rhythm, certificate/object-document drawers and the document preview
drawer now have clearer spacing, emphasis, selected states, backdrop framing and
document focus. Lightweight informational document metadata was added where it
helps orientation, including `Последнее изменение` and `Версия документа`.
These metadata are display-only. No document workflow statuses, approvals,
review process, backend/API behavior, persistence, Prisma/schema/migrations,
uploads, OCR/AI, business validation or real DOCX/PDF generation were
introduced.

Stage: frontend-only object overview and global certificate architecture UX
correction. The opened object now lands on `Обзор`, not directly in the AOSR
editor. The object overview is the home page of the object and shows object
name, address, key metrics, `Последнее изменение`, quick actions, recent
periods, recent documents and a frontend-only `Создать документ` selector. The
selector is driven by the registered act type metadata and currently offers
`АОСР — Акт освидетельствования скрытых работ`; `Создать документ` opens the
existing AOSR editor through the period/document path by creating a new
frontend-only in-memory draft in the selected period. The object navigation
no longer exposes an object-owned `Сертификаты` section/page. Certificates are
global user-level library entities: acts use the global certificate store, and
object/registry/final-package surfaces may show only derived used certificates
from acts. Empty fields remain allowed; preview/printing must not be blocked by
empty fields, and future print forms should leave manual-fill lines. The
hint copy is non-blocking: `Подсказки по акту`, `Поля заполнены`,
`Есть пустые разделы` and `Подсказки по комплекту`. Visible workflow labels such as
`Черновик`, `На проверке`, `Готов` and `Выпущен` are not shown in document
trees or summaries; only document number, `Последнее изменение` and
`Версия документа` remain. This is frontend mock UX only and adds no backend,
API, persistence, Prisma/schema/migrations, auth, uploads, OCR/AI, DOCX/PDF/ZIP
generation or production business logic.

Stage: frontend-only period-scoped AOSR creation mock. The universal
`Создать документ -> АОСР` selector now creates a blank AOSR draft in the
currently selected period, stores it only in React memory, adds its id to the
period document list, shows it in the AOSR document tree and opens it
immediately in the editor. Empty fields are allowed and must not block editing
or preview. The mock also introduced a small frontend-only numbering helper for
document types. That historical object-level helper was later superseded by
section template numbering: automatic numbering is continuous across a section
or restarted per folder, and manual numbering creates acts without a number.
The create panel at that stage treated the auto-number as a suggestion:
editable `Номер документа` was prefilled with the proposed value and could be
overridden freely, including empty text, before the frontend-only draft
is created. Future UI settings may expose `ОВ-{n}`, `12-{n}-ОВ` and
`АОСР/{YYYY}/{n}`. This stage adds no backend/API, no localStorage, no
persistence, no Prisma/schema/migrations, no uploads, no OCR/AI, no
DOCX/PDF/ZIP generation and no production numbering or AOSR business logic.

Architecture decision accepted: global reusable libraries and explicit frozen
snapshot boundaries.
Certificates, organizations and representatives are global user-level reusable
libraries. Objects do not own separate copies of these libraries. Objects store
links, assignments or bindings to global entities and may carry object-specific
assignment details such as role, position, authority basis/order, organization
relation, captions and ordering.

Acts must not accept free-text signatories, organizations or certificates as the
final data model. The correct flow is: search the global library, select an
existing entity, or create a new entity from the search flow; a newly created
entity is stored in the global library first and only then linked/assigned to
the current object or act.

Active working acts do not automatically snapshot reusable data when a relation
is added. A linked act resolves counterparty/signatory values through the
current `ObjectTemplate` and libraries. An explicit whole-act manual switch
creates one complete `manualTemplateSnapshot`. Released revisions and issued
packages separately freeze exact resolved participant/company values and exact
certificate identity, confirmed values and evidence-file provenance. Library
corrections may update active linked work but cannot rewrite manual or released
history.

Certificates remain global. Objects do not own certificate libraries. Acts
select materials/certificates from the global certificate library, and final ID
registries/packages derive used certificates from acts and deduplicate them by
source certificate identity/provenance. This decision is recorded in
`docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`.

Stage: historical frontend-only ADR 0006 wording alignment, later clarified by
ADR 0007. The flow creates/selects a global representative and assigns that
representative to the object before act use. The old act-only/temporary source
was removed. The earlier wording about storing a snapshot immediately when
adding the assignment is superseded: linked acts consume the assignment live;
manual/released states freeze it only at their explicit boundaries. Empty
fields remain allowed. No production snapshot/data model, backend/API,
Prisma/schema/migrations, auth, uploads, OCR/AI, generation or persistence was
introduced.

Stage: frontend-only dynamic folder-first object workspace mock. The opened
object still lands on `Обзор`, but object navigation uses user-defined
`Папки ИД` as the primary path to documents. Folder ids/names are dynamic in
the in-memory model. `Сентябрь 2026` and `Октябрь 2026` remain seeded examples
on the populated demo object only; a separate empty demo object supports
`create first folder -> open folder -> create first document`. Each folder owns
its document grouping and derives its registry/intermediate package view. AOSR
remains the only working document editor and opens through
`Overview -> Folder -> Document`, not as the top-level object destination.
The overview owns object-wide counts, quick actions, recent folders, recent
documents and the final ID shortcut. Repeated object-wide counters were removed
from the embedded AOSR workspace/editor; the editor keeps document-specific
context only. This is frontend mock UX only and adds no backend/API,
Prisma/schema/migrations, persistence, auth, uploads, OCR/AI, DOCX/PDF/ZIP
generation or production business logic.

Future folder-first object structure:

```text
Object
├── Overview
├── ID folders
│   ├── User-defined folder
│   │   ├── documents
│   │   ├── registry
│   │   └── package
│   └── ...
├── Object documents
├── Representatives
├── Final ID
└── Settings
```

`Final ID` aggregates all folders. Folder registry and intermediate folder
package are separate future concepts from the final object ID package.

Initial frontend-only numbering helper:

```text
Template: {prefix}{number}{suffix}

Examples:
ОВ-{n}
12-{n}-ОВ
АОСР/{YYYY}/{n}
```

This historical helper was later superseded by the section-scoped model:
numbering belongs to the selected section template, can be automatic or manual,
and automatic sequences are either continuous across the section or restarted
inside each folder. Future UI for template settings and manual number editing
settings was not implemented at that stage. Manual override before creation was
available only in the frontend mock, and the auto-number remained just a
suggestion. This stage did not implement backend policy, persistence, API
contracts or production numbering behavior.

Stage: frontend-only object workspace premium UX polish. The current object
workspace keeps the same frontend-only mock functionality but improves the
visual hierarchy around the period-first model. Periods now read more like work
folders with documents, registry and package context; the period page presents
title, short context, primary `Создать документ`, documents, derived registry
and periodic ID package action in that order; the create-document selector
uses document-type cards instead of a technical list; and the overview behaves
more like a command center for quick actions, recent periods, recent documents
and final ID. The design direction intentionally avoids relying on bright
colors: quality should come from spacing, typography, hierarchy, element sizes,
action contrast, restrained cards/surfaces and predictable navigation. This is
frontend UX/copy/styling only and introduces no backend/API, persistence,
Prisma/schema/migrations, auth, uploads, OCR/AI, DOCX/PDF/ZIP generation or
production business logic.

Stage: frontend-only generated ID package views UX. Periodic ID and Final ID
are now explicitly treated as generated views/packages, not stored business
entities. A period contains documents, a period registry and the action
`Сформировать периодическую ИД`; the object contains the action
`Сформировать итоговую ИД`. Both generated views are always rebuilt from the
current documents, certificates and object-document links. If source documents
change later, generating again produces an updated composition. This decision
does not introduce closed period status, issued status, locked package state,
package persistence, archive records, backend/API, persistence,
Prisma/schema/migrations, auth, uploads, OCR/AI or DOCX/PDF/ZIP generation.
Historical ZIP storage is outside the domain model.

Stage: frontend-only derived period and final registry UX. The current
period-first mock no longer has a standalone object registry page or object
registry navigation. Registry exists only as:

- period registry: belongs to a specific period and is derived from documents
  in that period;
- final registry: belongs to Final ID and is derived from documents across all
  periods.

The frontend helper builds read-only registry rows from current in-memory
document drafts with row number, document type code/title, document number,
document date, period name and document/work description. AOSR rows use the
registered act type metadata (`code`, `title`) instead of hardcoded registry
labels, so future act types can enter the same derived registry projection via
metadata. The selected period page now replaces the old `Реестр периода`
placeholder with a real derived table that updates when a frontend-only AOSR
draft is created in that period. Periodic ID includes the period registry as
its first group. Final ID includes the final registry as its first group and
collects documents from all periods. Registries are not stored business
entities, are not editable row stores and are always rebuilt from current
documents. This stage adds no standalone object registry, no statuses, no
locked periods, no issued package state, no package/registry persistence, no
backend/API, no Prisma/schema/migrations, no auth, no uploads, no OCR/AI and no
DOCX/PDF/ZIP generation.

Stage: frontend-only print-order AOSR editor UX. The current AOSR editor now
follows the real printed act order so the user fills the future printed
document from top to bottom instead of translating data between an arbitrary UI
structure and the final АОСР. The editor order is: printed header data
(`Номер акта`, `Дата акта`, object, form title and under-title
text), organizations participating in the act with configurable display order,
current act signatories, numbered points 1-7, additional data and applications.
Organization order is editable from the act editor and updates the preview.
Signatories were moved near the top immediately after organizations/header and
their ordering interaction now has a dedicated drag handle, visible drop target
and explicit move buttons. A small frontend metadata model records the current
form variant, with existing demo drafts using `АОСР 1` by default and future
variants intended to plug into the same model. ADR 0007 later supersedes the
live under-title behavior: under-title text is copied from default parameters
into a draft at creation and is then document-owned. Empty fields remain
allowed so future print generation can render blank manual-fill lines. This is frontend-only mock UX/model
metadata and adds no backend/API, persistence, Prisma/schema/migrations, auth,
uploads, OCR/AI, DOCX/PDF/ZIP generation or production business logic.

Stage: frontend-only UX overload cleanup. UX cleanup: reduced interface
overload, simplified default parameters, clarified primary actions. Object
Overview keeps document creation as the only prominent primary action,
secondary package/navigation actions are calmer, AOSR and package readiness
blocks use `Подсказки`, and default parameters are grouped around reusable
printed-document suggestions instead of summary chips. This is frontend-only UX
cleanup and adds no new business features, backend/API, persistence,
Prisma/schema/migrations, OCR/AI or DOCX/PDF/ZIP behavior.

Stage: frontend-only period document UX cleanup. A period is explicitly the
daily work folder for documents of many future types, not an AOSR-only page.
The period primary action is universal `Создать документ`; opening it shows a
document type selector where AOSR is the only active type today and future
document types remain disabled as `скоро`. Creating AOSR adds a frontend-only
draft to the selected period document list without forcing the editor open; the
user opens the new document manually from the list. Registry and Periodic ID on
the period page are compact secondary generated views from period documents, so
they do not visually compete with the documents list. Object navigation is
split into `Работа` (`Обзор`, `Периоды`) and `Сервис` (`Документы объекта`,
`Итоговая ИД`, `Шаблон объекта`) so daily work stays primary. Object-template
parameters keep sectioned layout but use calmer cards, a clearer active section
and less AOSR-only wording. Real registry implementation is still coming soon,
and numbering settings are planned for a later stage. This is frontend-only UX
cleanup and adds no backend/API, Prisma/schema/migrations, persistence, auth,
uploads, OCR/AI, DOCX/PDF/ZIP generation or production business logic.

Stage: historical frontend-only document default parameters and document-owned AOSR printable values (superseded by ADR 0007 for active template data).
Object-level reusable values are now called `Параметры по умолчанию` in the UI.
They are default suggestions for newly created documents, not live settings
that mutate existing acts. The current mock copies object name, under-title
text, header organization blocks/order, project documentation and point 6
compliance text into each new AOSR draft. Existing drafts own those printable
values after creation; changing default parameters does not update those drafts.
The AOSR draft also stores printed form title metadata, selected material
certificate snapshots and selected object document snapshots so preview does
not depend on mutable object defaults or library rows for historical printed
output. In the AOSR editor copied fields show compact origin text:
`По параметрам по умолчанию` when the document value still matches the current
default and `Изменено в документе` when it differs. Editable fields and header
organization order can explicitly restore current defaults with
`Вернуть из параметров по умолчанию`. Empty values remain allowed.

ADR 0007 records the project rule `Параметры по умолчанию -> Предложение ->
Самостоятельный документ`. Future numbering settings follow the same direction:
automatic numbering is only a suggestion, document numbers may be edited or
left empty, manual numbers do not mutate the sequence, existing documents are
not auto-renumbered, and deleted numbers are not reused by default. Future
package release snapshots may freeze a historical package, but no package
release implementation is introduced here.

Что не было введено:

- no numbering settings UI;
- no real registry generation;
- no package release snapshots;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production AOSR, registry, package or numbering business logic.

Stage: live object template links and manual act snapshots. ADR 0007 now
supersedes the previous document-owned-defaults decision for the template-owned
part of active working acts. Counterparty and signatory libraries are live
current-data sources. The object template stores links to library records plus
object-specific labels, grouping, ordering, custom subscripts and repeated
object texts. A linked act stores no template snapshot and resolves its
printable template data from the current object template and current library
items at preview/generation time. A manual act exists only after an explicit
user action; switching to manual creates a complete `manualTemplateSnapshot`
from the current resolved object template and libraries. From that point,
object-template and library changes do not affect the manual act. Returning to
the object template deletes the manual snapshot and restores live resolution.
Representative groups are real groups: a renderer must print the group title
once and then all members inside that group, including in the signature section.

The invariant is strict: no partial field-level overrides for template-owned
data. An act is either `linked` or `manual`. Editing normal individual act data
such as number, date, work description, periods, materials, confirmation
documents or applications never switches the act to manual mode. The AOSR DOCX
form template remains a separate form-template entity that owns immutable form
text, tags and Word layout; it is not the object template. Rendering should
consume a resolved `AosrPrintState`, assembled either from
`objectTemplate + libraries + individualData` for linked acts or from
`manualTemplateSnapshot + individualData` for manual acts. Issued/fixed ID
packages must later store frozen output snapshots so released documents do not
drift after live library or object-template edits. `AosrPrintState.document.number`
is the raw act number without `№`, and `AosrPrintState.document.date` is a raw
date value for renderer formatting. The current frontend mock still carries
legacy template-owned fields on `DemoAosrDraft` only for manual editor
compatibility; production linked acts must not persist template-owned copies.
The work contractor, additional information and copy count belong to
`ObjectTemplate` because they repeat across the object's acts. The act editor
keeps resolved template sections collapsed by default; expansion is for review,
and changing any template-owned value requires the explicit whole-act switch to
manual mode.
This current implementation remains frontend mock/in-memory only and adds no
backend/API, Prisma/schema, persistence, auth, uploads, OCR/AI or DOCX/PDF/ZIP
generation.

---

## 1. Product idea

**ИДея** — рабочее место ПТО для исполнительной документации.

Смысл названия: `ИД` = исполнительная документация, а `идея` = понятный
помощник инженера ПТО. Продуктовый tagline:

```text
ИДея — рабочее место ПТО для исполнительной документации
```

Основной фокус MVP:

- ОВиК;
- ВК;
- российская исполнительная документация;
- АОСР;
- акты испытаний;
- сертификаты;
- исполнительные схемы;
- реестры;
- комплекты исполнительной документации.

Система создаётся как коммерческий SaaS-продукт.

Главная бизнес-цель:

```text
максимально сократить ручную работу инженера ПТО
```

Продукт должен не просто хранить файлы, а понимать доменную структуру исполнительной документации: объекты, папки, акты, сертификаты, схемы, реестры, комплекты, подписантов, шаблоны, версии, нумерацию и зависимости между документами.

---

## 2. Core product philosophy

Главный принцип системы:

```text
SOURCE OF TRUTH = STRUCTURED DATA
```

Source of truth — это НЕ:

- DOCX;
- PDF;
- файлы;
- Word-шаблоны;
- распечатанные комплекты;
- ручной Excel/Word-реестр.

Source of truth — это:

- структурированные сущности;
- связи между сущностями;
- нормализованные данные;
- версии документов;
- версии шаблонов;
- snapshots;
- domain rules;
- audit/activity history;
- validated metadata.

DOCX, PDF, ZIP, печатные формы и итоговые комплекты являются **generated artifacts**.

Они должны:

- генерироваться из structured data;
- пересобираться при изменении данных;
- не становиться главным источником данных;
- не быть единственным местом хранения смысла документа.

Это фундаментальное архитектурное решение. Его нельзя ломать.

---

## 3. What the system does

Система должна:

- создавать объекты строительства;
- хранить бизнес-папочную структуру объекта;
- создавать и редактировать АОСР;
- создавать и редактировать акты испытаний;
- хранить сертификаты, декларации, паспорта, письма и другие документы качества;
- хранить исполнительные схемы как PDF/файлы + structured metadata;
- автоматически вести реестры;
- автоматически собирать комплекты ИД;
- автоматически нумеровать документы;
- поддерживать перенос и дублирование документов/папок;
- генерировать DOCX/PDF;
- поддерживать шаблоны документов;
- поддерживать immutable versioning шаблонов;
- поддерживать live preview документов;
- поддерживать autosave;
- поддерживать document locks;
- поддерживать warnings/errors validation;
- поддерживать библиотеку компаний;
- поддерживать object-level company snapshots;
- поддерживать библиотеку представителей;
- поддерживать OCR/AI-анализ сертификатов в будущем;
- поддерживать OCR/AI-анализ исполнительных схем в будущем;
- поддерживать загрузку project source materials по объекту и будущий AI-assisted анализ проекта для подготовки ИД и поиска несоответствий;
- помогать искать сертификаты и документы;
- предупреждать о просроченных сертификатах;
- давать быстрый document-centric UX.

---

## 4. What the system is not

Система НЕ является:

- ERP;
- BIM;
- CAD;
- полноценным корпоративным документооборотом;
- enterprise monster software;
- универсальным конструктором любых документов;
- Google Docs;
- collaborative editor;
- CRM;
- файловым менеджером;
- простым облачным хранилищем;
- системой, где пользователь вручную ведёт Word/Excel как главный источник истины.

Главный приоритет:

```text
простота + скорость + document-centric UX + автоматизация рутины ПТО
```

---

## 5. Product principles

### 5.1 Structured data first

Каждый документ должен иметь понятную structured модель. Даже если физически часть payload хранится в JSONB, это не должен быть бесконтрольный JSON blob.

### 5.2 Typed documents, not generic documents

Документ имеет immutable type: AOSR, TEST_ACT, TECHNICAL_READYNESS_ACT и т.п. Документ нельзя превратить из одного типа в другой.

Причина: тип документа определяет schema, validation, preview, DOCX generation, registry projection, package builder и search contracts.

### 5.3 Registry is derived projection

Реестр не является самостоятельным editable Word-документом. Реестр — производная проекция из данных объекта, компании, сертификатов, актов, схем и override layer.

### 5.4 DOCX/PDF are generated artifacts

DOCX/PDF генерируются из данных. Редактирование generated DOCX вручную не должно становиться основным workflow.

### 5.5 Live object template and frozen output

Глобальная карточка компании/представителя остаётся current reusable source.
`ObjectTemplate` хранит assignment/reference и object-specific display context.
Исправление карточки видно active linked acts. Один полный manual snapshot и
released revision/package output остаются неизменными.

### 5.6 AI is assistant only

OCR/AI может предлагать значения, связи и findings, но не должен auto-approve критические данные или утверждать инженерный вывод. Пользователь подтверждает extracted data до изменения structured domain data.

Uploaded project documentation может быть source material и provenance для помощи с ИД, но не становится единственным source of truth. Project files должны принадлежать конкретным `Workspace` и `Object`; AI results должны быть traceable и auditable.

### 5.7 Simple UX over enterprise complexity

Система должна быть быстрой и понятной для ПТО, а не перегруженной корпоративной логикой.

### 5.8 Owner-based sharing over MVP RBAC

Для MVP сложный RBAC не используется. Access model первого scope описан в `docs/19-sharing-and-access-model-v1.md`:

- один `Global System Admin` для operational/admin path;
- regular users владеют своими workspaces/project data и certificate libraries;
- доступ другим пользователям выдаётся через share codes / invite codes;
- accepted code creates a persistent resource-scoped share grant;
- default access is view-only;
- owner selects explicit capabilities вместо ролей.

`docs/10-auth-workspace-rbac-model.md` сохраняется как historical/deferred RBAC reference, но его role matrix (`Owner`, `Admin`, `PTO Engineer`, `Foreman`, `Viewer`) superseded for MVP implementation scope.

Implementation sequencing for this access model is fixed in `docs/20-auth-sharing-implementation-plan-v1.md`: user identity skeleton first, then global system admin marker, owned workspace baseline, workspace share codes, workspace share grants, certificate library share codes and certificate library share grants.

---

## 6. Users, workspaces and sharing

`User` представляет физическое лицо, создающее аккаунт. В MVP обычный пользователь владеет своими workspaces/project data and certificate libraries. Access for other users is granted by owner-selected share grants, not by a complex role matrix.

После регистрации:

- автоматически создаётся owned/personal working context;
- регистрирующийся пользователь становится owner своих данных в этом context;
- личный workspace позволяет полноценно вести объекты, документы, evidence, реестры и комплекты без участия организации.

Пользователь может подключаться к чужим workspaces/project databases или certificate libraries через share codes / invite codes. Личные данные, чужие workspaces и shared libraries не смешиваются автоматически.

MVP access concepts:

- `Global System Admin` — ровно один operational/admin user, controlled by deployment/config, separate from business collaboration;
- `Regular User` — owns own workspaces/project data/libraries;
- `Share Grant` — capability-based access to a specific owner resource.

Default permission is view-only. Owner chooses explicit capabilities for each code. No `Foreman` role and no `Owner/Admin/PTO Engineer/Viewer` matrix are implemented in MVP.

---

## 7. Multi-tenancy and workspace isolation

Критически важное решение:

```text
isolated workspace/tenant architecture
```

`Workspace` является tenant boundary для business data and resource-scoped authorization. Для MVP важно не смешивать:

- owner workspace/project database;
- another user's connected workspace access through `WorkspaceShareGrant`;
- owner certificate library;
- another user's connected certificate library access through `CertificateLibraryShareGrant`.

Каждый workspace имеет логически изолированные данные.

Пользователь без ownership или accepted grant for this workspace не видит:

- объекты;
- документы;
- сертификаты;
- исполнительные схемы;
- компании;
- представителей;
- комплекты;
- шаблоны объекта.

Один пользователь может владеть своими данными и одновременно иметь accepted grants к чужим resources, но это не разрешает cross-workspace links, reuse или copy domain data без отдельной утверждённой политики.

Workspace/project database — collaboration tenant when shared by owner grant, а
`CompanyProfile` / `ObjectTemplate` assignments / released output snapshots —
реквизиты сторон в документации; одно не даёт автоматически прав на другое.
Архитектура должна с самого начала учитывать workspace/tenant boundary во всех
ключевых сущностях.

---

## 8. Core hierarchy

Пользовательская структура:

```text
Object
  → Folder Tree
      → Documents
      → Executive Schemes
      → Packages / Registry projections
```

Архитектурно важно:

- Object не должен становиться giant aggregate;
- Folder не должен владеть жизненным циклом документа;
- Documents — отдельные aggregate roots;
- Certificates — отдельные library aggregates;
- Registry — derived projection;
- Package Builder — отдельный bounded context/aggregate;
- Templates — отдельный контекст.

---

## 9. Object

Object — главный контейнер строительного проекта.

Содержит/связывает:

- `ObjectTemplate` data and library assignments;
- папочную структуру;
- numbering settings;
- organization/representative assignments;
- form template bindings;
- документы;
- исполнительные схемы;
- package settings;
- registry settings;
- project drawing sets.

Object имеет собственную изоляцию данных внутри tenant.

Object не должен хранить все документы внутри себя как вложенный giant aggregate.

---

## 10. Folder tree

Folder — это не файловая папка, а business collection node.

Поддерживается:

- nested tree;
- drag & drop;
- move;
- duplicate;
- copy;
- soft delete;
- folder-level grouping;
- потенциально folder-level numbering scope.

Пример:

```text
ОВ
 └── 2025
      ├── Октябрь
      └── Ноябрь
```

Folder rules:

- folder принадлежит одному object;
- может иметь parent;
- может иметь children;
- может содержать documents через `folder_id`;
- parent folder не может быть из другого object;
- cycles запрещены;
- folder move не должен ломать object isolation.

Удаление folder: soft delete only. Удаление папки логически удаляет children/documents, но через trash/soft delete.

---

## 11. Folder duplication

Критически важная business feature.

Пользователь хочет дублировать месяцы/периоды:

```text
Октябрь → Ноябрь
```

При duplicate можно:

- копировать структуру;
- копировать документы;
- копировать связи;
- копировать numbering;
- копировать даты;
- сбрасывать даты;
- продолжать numbering;
- начинать numbering заново;
- копировать linked certificate refs;
- копировать placeholders;
- сбрасывать статусы.

Нужны clone strategies:

- `copy_documents`;
- `copy_dates`;
- `copy_numbering`;
- `copy_links`;
- `copy_certificate_refs`;
- `reset_statuses`;
- `reset_dates`;
- `renumber`.

Это не файловая логика. Это business cloning logic.

---

## 12. Document model

Принято решение:

```text
Document = typed domain model + structured payload + rendering contract
```

Документ имеет immutable type.

Примеры типов:

- `AOSR` — акт освидетельствования скрытых работ;
- `TEST_ACT` — акт испытаний;
- `TECHNICAL_READINESS_ACT` — акт технической готовности;
- `INSPECTION_ACT`;
- другие типы исполнительной документации.

Документ нельзя превратить в другой тип. Если нужен другой документ — создаётся новый.

Причина: иначе ломаются schema, templates, validation, registry generation, package builder, search и future AI extraction contracts.

Документ должен иметь:

- `document_id`;
- `tenant_id`;
- `object_id`;
- `folder_id`;
- `document_type`;
- `status`;
- `numbering`;
- `date`;
- `payload` typed schema;
- `linked_certificate_ids`;
- `linked_scheme_ids`;
- `representative snapshots/refs`;
- `template_version_id`;
- `revision`;
- `created_at`;
- `updated_at`;
- `deleted_at`.

---

## 13. Document statuses

Статусы:

- `draft`;
- `final`;
- `archived`;
- `deleted`.

`draft` может быть невалидным.

`final` означает validated published revision.

Важно:

```text
final != immutable
```

Пользователь может редактировать final document.

При изменении final document:

- `revision++`;
- validation пересчитывается;
- affected package snapshots invalidated;
- package regeneration required.

Причина: в реальной ПТО-практике акты после “готовности” часто исправляются.

---

## 14. Draft and autosave

Документы редко создаются за один раз.

Нужен draft mode:

- пользователь начал документ;
- отвлёкся;
- закрыл браузер;
- вернулся позже;
- продолжил заполнение.

Autosave model:

```text
snapshot-based autosave
```

Autosave сохраняет полное состояние draft/document payload.

Patch-based editing, operational editing и CRDT не используются на старте.

Причины:

- нет collaborative editing;
- один активный редактор;
- snapshot проще и надёжнее;
- ПТО не должны терять документы.

Manual save также нужен.

---

## 15. Document locks

Система не является multi-user collaborative editor.

Можно:

- открыть документ;
- просматривать;
- скачивать;
- смотреть preview;
- смотреть комплекты.

Нельзя:

- одновременно редактировать один и тот же документ.

При нажатии “Редактировать” создаётся application-level document lock.

Lock содержит:

- `document_id`;
- `user_id`;
- `session_id`;
- `locked_at`;
- `expires_at`;
- `heartbeat_at`.

Lock имеет TTL, heartbeat и automatic expiration.

Рекомендованный inactivity timeout: 15 минут.

Не использовать database locks типа `SELECT FOR UPDATE` для пользовательского редактирования.

DocumentLock не должен быть частью Document Aggregate, потому что heartbeat не должен увеличивать revision документа.

---

## 16. Live preview

Live preview — критически важная UX feature.

Пользователь должен видеть документ в реальном времени. При изменении поля акт визуально обновляется.

Но preview не должен генерироваться через DOCX.

Правильная архитектура:

```text
Structured Data
  → HTML Preview Renderer
  → DOCX Generator
  → PDF Export / Package Build
```

Preview renderer и DOCX generator — разные слои.

DOCX/PDF генерируются только:

- при export;
- при package build;
- при finalization, если это нужно;
- при snapshot generation.

---

## 17. UX philosophy

Инженер ПТО думает не таблицами.

Он думает:

- объектами;
- папками;
- актами;
- сертификатами;
- схемами;
- комплектами;
- реестрами.

UI должен быть:

- визуальным;
- быстрым;
- document-centric;
- понятным;
- без enterprise перегруза;
- без CRM-style логики.

Пользователь должен ощущать:

```text
я работаю с комплектом исполнительной документации
```

а не:

```text
я заполняю CRM-таблицу
```

---

## 18. High-level user workflow

### 18.1 Dashboard

Пользователь видит список объектов:

- ЖК Северный;
- ТЦ Грин Парк;
- Школа №12;
- и т.д.

Карточка объекта показывает:

- название;
- статус;
- количество документов;
- warnings;
- последние изменения;
- package status.

### 18.2 Object workspace

Пользователь открывает объект и видит:

- left folder tree;
- central folder content;
- top actions;
- search;
- package builder;
- certificate library access;
- scheme upload;
- default parameters.

### 18.3 Folder view

В выбранной папке:

- акты;
- исполнительные схемы;
- packages;
- реестр как projection;
- status indicators.

### 18.4 Document editor

Document editor:

- left/control panel: fields;
- right: live preview;
- autosave state;
- validation warnings;
- linked certificates;
- representatives;
- numbering;
- final/draft status.

---

## 19. AOSR model

АОСР — акт освидетельствования скрытых работ.

Пример был загружен как `Пример.docx`.

Из примера и обсуждения выделена цветовая логика:

### Yellow / object data

Название объекта и другие объектные данные. Вводятся один раз на объект.

### Green / representatives

Подписанты и представители. Вводятся один раз на объект, но могут быть переопределены в документе.

Особенности:

- подстрочный текст должен быть дефолтным, но редактируемым;
- в одном блоке может быть несколько фамилий;
- порядок представителей критически важен;
- global representative является reusable entity;
- object-level representative assignment хранит объектовые роль, должность,
  основание полномочий, связь с организацией и порядок;
- акт выбирает object assignment и фиксирует printed snapshot для исторической
  стабильности.

### Gray / document number

Номер акта. Автоматическая нумерация.

Поддерживаются:

- prefix;
- sequence;
- suffix;
- rendered_number.

Примеры:

- `ОВ-1`;
- `ОВ-2`;
- `1/12-1`;
- `ПД-1`.

### Purple / document date

Дата акта. По умолчанию текущая дата. Можно массово менять внутри папки.

### Cyan / per-document variable data

Переменные данные, заполняемые в каждом акте отдельно:

- предъявленные работы;
- проектная документация;
- применённые материалы;
- сертификаты;
- разрешение на дальнейшие работы;
- дополнительные сведения;
- приложения.

Для АОСР важно, что сертификаты должны быть ссылками на Certificate Library, а не просто вручную напечатанными номерами.

---

## 20. Numbering engine

Нумерация — одна из центральных частей системы.

Поддерживаются:

- object-scope numbering;
- folder-scope numbering.

Пример:

```text
Октябрь:
ОВ-1
ОВ-2

Ноябрь:
может продолжать numbering
или начинать заново
```

Номер состоит из:

- prefix;
- sequence;
- suffix;
- rendered_number.

Нужен renumber engine.

Документы можно перемещать между папками.

При move система показывает modal:

- сохранить numbering;
- пересчитать numbering.

При пересчёте:

- номер может измениться;
- revision может увеличиться;
- package snapshots invalidated.

---

## 21. Representatives

Representative — глобальная user-level reusable entity.

Object не владеет отдельной копией базы представителей. На объекте хранится
`ObjectRepresentativeAssignment` / binding to global representative with
object-specific printed details.

Object assignment может отличаться для одного и того же представителя на разных
объектах:

- role / signature label;
- position;
- authority basis/order;
- organization relation;
- subtitle/caption;
- sort order;
- registry/doc block mapping;
- contact info, если нужно.

Порядок критически важен.

В одном блоке может быть несколько фамилий.

Акт не должен хранить свободного temporary representative как final source of
truth. Если нужного человека нет в поиске, пользователь создаёт новую карточку
представителя в глобальной библиотеке from the search flow, затем назначает её
объекту. Active `linked` акт разрешает текущие значения через
`ObjectTemplate`; explicit `manual` switch сохраняет один полный
`manualTemplateSnapshot`; released revision отдельно фиксирует resolved
печатные реквизиты.

---

## 22. Company Profile Library

Пользователь может работать/подрабатывать на разные компании.

Нужна библиотека компаний пользователя.

CompanyProfile содержит:

- `company_id`;
- `tenant_id`;
- `legal_name`;
- `short_name`;
- `INN`;
- `KPP`;
- `OGRN`;
- `legal_address`;
- `actual_address`;
- `director_full_name`;
- `director_position`;
- `authority_basis`;
- SRO information;
- contacts;
- possibly bank details later;
- timestamps;
- soft delete fields.

Примеры:

- ООО «Десятый трест»;
- ИП;
- другая подрядная компания.

---

## 23. Global company library, ObjectTemplate and released output

Критически важное решение, уточнённое ADR 0007.

При настройке объекта пользователь выбирает компанию из global Company Profile
Library. `ObjectTemplate` хранит ссылку/назначение и object-specific labels,
order and contract/work context:

```text
CompanyProfile -> ObjectTemplate assignment -> linked working act/current view
                                      |-> explicit manual snapshot
                                      |-> released revision/package snapshot
```

Изменение карточки компании обновляет active linked resolution. Оно не меняет
manual act и ранее выпущенные revision/package. Если через год у компании
поменялся директор, активные linked акты могут показать исправленное значение,
а старые выпущенные реестры и комплекты сохраняют прежнее.

Resolved/frozen company output может включать:

- название организации;
- ИНН;
- КПП;
- ОГРН;
- юридический адрес;
- фактический адрес;
- директор;
- должность;
- основание полномочий;
- СРО;
- contact info;
- work contract data;
- project section data.

Global organization library and object assignments:

- Organization is a global user-level reusable entity.
- `ObjectTemplate` stores links/assignments and object-specific organization
  details for headers, contract context, SRO, captions and printed requisites.
- Active linked acts resolve the current assignment/library values without an
  automatic per-act template snapshot.
- Explicit manual mode stores one complete template snapshot; released
  revisions/packages freeze their exact resolved output separately.
- Editing the global organization card may update active linked acts, but must
  not change manual snapshots or historical released output.

---

## 24. Certificate Library

Certificate — shared entity.

Один сертификат может использоваться в нескольких объектах и документах.

Сертификат/документ качества может быть:

- сертификат соответствия;
- декларация о соответствии;
- исходящее письмо;
- отказное письмо;
- паспорт качества;
- технический паспорт;
- информационное письмо;
- другое.

Certificate fields:

- `certificate_id`;
- `tenant_id`;
- `file_id`;
- `document_type`;
- `coverage/material/equipment name`;
- `manufacturer`;
- `issuer`;
- `issue_date`;
- `valid_until`;
- `registration_number`;
- `page_count`;
- `status`;
- `ocr_status`;
- `confirmed_by_user`;
- timestamps;
- soft delete.

Критические business rules:

```text
Нельзя просто вбить номер сертификата вручную, если сертификата нет в библиотеке.
```

Причина: иначе при package build нечего будет прикладывать.

Сначала сертификат должен существовать физически.

Certificate — global user-level reusable entity. Object не владеет отдельной
certificate library. Acts keep explicit relations to materials/certificates
from the global certificate library; registries and final packages derive used
certificates from acts and deduplicate them by source identity/provenance.
Certificate relations are independent of linked/manual template mode. Release
freezes the exact evidence identity, confirmed rendered values and physical-file
provenance so later certificate-card corrections do not rewrite historical
output.

---

## 25. Certificate validation

Сертификат проверяется по дате документа, а не по текущей дате.

Пример:

```text
Если документ создан в 2023,
а сертификат истёк в 2025,
документ остаётся валидным.
```

При создании нового документа:

- если сертификат просрочен на дату документа, система показывает warning;
- warning не блокирует;
- иногда пользователь сознательно использует старые документы.

Validation levels:

- `WARNING` — разрешает продолжить;
- `ERROR` — блокирует.

---

## 26. OCR / AI philosophy

AI = assistant only.

OCR не auto-approve.

Flow:

1. Пользователь загружает сертификат.
2. Сертификат попадает в библиотеку.
3. OCR асинхронно пытается извлечь:
   - номер;
   - дату;
   - срок действия;
   - производителя;
   - материал;
   - issuer;
   - page count.
4. Пользователь подтверждает значения.
5. Только после подтверждения значения становятся active metadata.

Project ingestion extension зафиксирован в `docs/11-ai-project-ingestion-and-assistance-model.md`:

- пользователь в будущем сможет загружать проектные PDF, drawings, specifications и другие source materials в context конкретных `Workspace` и `Object`;
- AI/OCR может предлагать project references, systems/zones/floors/axes, work statements, expected evidence и inconsistency findings;
- предложение обязано сохранять source citation/provenance настолько детально, насколько допускает формат;
- AI/OCR создаёт только proposals; принятие, исправление или отклонение выполняет authorized user;
- confirmed structured data и explicit relations остаются source of truth, а source file/OCR text/AI response не заменяют domain state;
- processing project originals требует утверждённых privacy, access, tenant isolation and audit rules.

---

## 27. ExecutiveScheme

ExecutiveScheme — это:

```text
PDF file + structured metadata
```

На первом этапе metadata вводятся вручную.

Поля:

- `scheme_id`;
- `tenant_id`;
- `object_id`;
- `folder_id`;
- `file_id`;
- `title`;
- `registration_number`;
- `date`;
- `sheet_count`;
- `note`;
- timestamps;
- soft delete.

Позже AI будет извлекать эти данные из схемы.

Исполнительная схема не редактируется как чертёж.

Если схема изменилась, создаётся новая сущность/новый файл.

На старте — не versioning.

---

## 28. ProjectDrawingSet

По анализу реестра нужен отдельный concept:

```text
ProjectDrawingSet
```

Это комплект рабочей документации, а не исполнительная схема.

Пример из реестра:

```text
Наименование: Вентиляция
Шифр: 369-2025-02-ОВ
Количество листов: 13
```

ProjectDrawingSet используется в блоке реестра “Комплект рабочих чертежей”.

Поля:

- object_id;
- company snapshot reference;
- drawing_name;
- drawing_code;
- sheet_count;
- section;
- note.

Draft baseline из `docs/09-aggregate-boundaries-and-invariants.md`:

```text
ProjectDrawingSet = owned entity in ObjectDocumentationContext
```

Он не является самостоятельным aggregate root для первого scope. Если позднее появятся независимые approval/version/reuse workflows рабочих чертежей, boundary должна быть пересмотрена до реализации этих требований.

Project source files могут использоваться как provenance для данных и ссылок `ProjectDrawingSet`, но ни upload, ни AI extraction не изменяют эти confirmed fields автоматически. Связь и extracted values проходят user confirmation по модели `docs/11-ai-project-ingestion-and-assistance-model.md`.

---

## 29. Registry model

Реестр был проанализирован на примере `Реестр вентиляция.doc`.

Ключевая структура реестра:

1. Шапка объекта.
2. Перечень исполнителей / подрядных организаций.
3. Комплект рабочих чертежей.
4. Сертификаты, паспорта, декларации, письма и другие документы качества.
5. Акты исполнительной документации.
6. Исполнительные схемы и съёмки.
7. Подписант реестра.

Принято решение:

```text
Registry is NOT an editable standalone document
Registry = derived projection
```

Источники данных:

- Object;
- Object settings;
- current `ObjectTemplate` assignments or exact frozen released output values;
- Certificate Library;
- Act Documents;
- Executive Schemes;
- ProjectDrawingSet;
- RegistrySignerSnapshot;
- Registry override layer.

Реестр всегда может быть пересобран.

Реестр не является source of truth.

---

## 30. Registry data sources

### 30.1 Object block

Источник:

- Object;
- Object settings;
- object-level fields.

Поля:

- object name;
- object address;
- work name;
- section;
- project code;
- customer/developer data later.

### 30.2 Contractor/company block

Источник:

- current global company record resolved through `ObjectTemplate` for a live
  working projection;
- exact frozen resolved values from a released revision/package for historical
  output.

Поля:

- contractor legal name;
- construction basis document / contract;
- performed work types;
- project section / drawing set;
- license/SRO;
- INN;
- KPP;
- OGRN;
- legal address;
- actual address;
- director;
- authority basis;
- construction control representative, if needed.

### 30.3 Working drawing set block

Источник:

- ProjectDrawingSet.

Поля:

- company name;
- drawing/project name;
- drawing code;
- sheet count.

### 30.4 Certificate block

Источник:

- Certificate Library;
- act certificate refs;
- package scope.

Поля:

- document type;
- coverage/material/equipment name;
- manufacturer;
- issuer;
- issue date;
- valid until;
- registration number;
- page count;
- file.

### 30.5 Acts block

Источник:

- Document Aggregate.

Поля:

- document type;
- work description;
- number;
- date;
- note;
- folder;
- status;
- revision.

### 30.6 Executive schemes block

Источник:

- ExecutiveScheme.

Поля:

- scheme title;
- registration number;
- date;
- sheet count;
- file;
- note.

### 30.7 Registry signer block

Источник:

- RegistrySignerSnapshot;
- resolved organization assignment or frozen released output;
- selected representative.

Поля:

- full name;
- position;
- organization;
- authority basis;
- signature caption;
- stamp marker.

---

## 31. Registry editing policy

По умолчанию реестр — derived projection.

Пользователь может:

- менять порядок строк;
- менять порядок сертификатов;
- менять порядок актов;
- менять порядок схем;
- скрывать строки;
- включать строки обратно;
- добавлять примечания;
- выбирать подписанта;
- менять package ordering.

Пользователь не должен напрямую редактировать source fields реестра, если эти fields приходят из Object/Company/Document/Certificate/Scheme.

Для ручных отклонений нужен RegistryOverride layer.

---

## 32. Package Builder

Комплект ИД собирается автоматически.

Default order:

1. Реестр;
2. Сертификаты;
3. Акты;
4. Исполнительные схемы.

Пользователь может менять порядок вручную.

Drag & drop order обязателен.

Package Builder должен:

- собрать registry projection;
- собрать unique certificates;
- сгенерировать DOCX/PDF актов;
- включить оригинальные certificate PDFs;
- включить executive scheme PDFs;
- merge PDFs;
- сформировать snapshot;
- сохранить snapshot;
- отдавать cached snapshot, если ничего не изменилось.

Package generation:

```text
snapshot-based
```

Если ничего не изменилось — отдавать старый snapshot.

Если изменился:

- документ;
- сертификат;
- схема;
- ordering;
- registry override;
- template version;
- company snapshot;

package должен быть invalidated and rebuilt.

Package build не synchronous. Должен быть background async job.

Причины:

- PDF merge;
- DOCX generation;
- conversion;
- large certificate files;
- executive scheme PDFs;
- package snapshots.

Нужны:

- async queue;
- job status;
- progress;
- failure handling;
- retry;
- stored build logs;
- user-friendly UX.

---

## 33. Storage philosophy

Система должна быть cloud agnostic.

Нельзя жёстко привязываться к одному хостингу.

Поддерживаются:

- local;
- MinIO;
- S3;
- Yandex Object Storage.

Оригинальные файлы обязательно хранятся физически:

- certificate PDFs;
- executive scheme PDFs;
- uploaded originals.

Generated files могут пересобираться:

- DOCX;
- PDF;
- package PDF;
- ZIP.

---

## 34. Template system

Поддерживаются:

- global templates;
- object templates.

Причина: разные заказчики используют разные формы.

Template system должен поддерживать:

- placeholders;
- binding;
- rendering;
- DOCX generation;
- preview renderer compatibility;
- template versioning.

Template versioning — критическое business rule.

Если через 5 лет форма изменилась, пользователь должен скачать старый акт в старой форме.

Поэтому:

```text
Template versions are immutable after use
```

После использования template version нельзя менять. Только новая версия.

---

## 35. Delete strategy

Soft delete only.

Удалённые сущности попадают в Trash.

Hard delete — только после retention period, предварительно 30 дней.

---

## 36. Activity history

Нужна история действий.

UI не должен быть перегружен, но система должна понимать:

- кто создал документ;
- кто изменил документ;
- кто пересобрал комплект;
- кто загрузил сертификат;
- кто подтвердил OCR;
- кто изменил шаблон;
- какие snapshots были invalidated.

---

## 37. Search system — open design area

Нужно спроектировать поиск.

Возможные scopes:

- global search;
- object search;
- folder search.

Примеры запросов:

- все акты с воздуховодами;
- все сертификаты Nevatom;
- все документы с просроченными сертификатами;
- все схемы по ОВ;
- все акты за месяц.

Нужно решить:

- indexing strategy;
- full-text search;
- filters;
- permissions;
- UX.

---

## 38. Current project status

Завершено на архитектурном уровне:

- product philosophy;
- source of truth decision;
- domain understanding;
- AOSR analysis;
- registry analysis;
- numbering philosophy;
- folder tree philosophy;
- storage philosophy;
- template philosophy;
- package philosophy;
- OCR philosophy;
- locking philosophy;
- live preview philosophy;
- company snapshot concept;
- registry projection concept;
- Package Builder high-level model.
- aggregate boundaries and invariants draft baseline before Database Schema V1.
- auth, workspace, invitation, membership and RBAC draft baseline before Database Schema V1, now superseded for MVP by owner-based sharing/access.
- AI project ingestion and assistance draft baseline before Database Schema V1.
- owner-based sharing/access amendment for MVP in `docs/19-sharing-and-access-model-v1.md`.
- conceptual Database Schema V1, applying the required pre-schema baselines without choosing SQL, ORM, API or implementation stack.
- lifecycle, immutability, numbering, validation, registry override safety, package determinism and AI/OCR review follow-up produced by Schema V1 review in `docs/13-domain-lifecycle-immutability-validation-v1.md`.
- conceptual Backend/API Architecture V1 in `docs/14-backend-api-architecture-v1.md`, defining modular backend boundaries, commands/read models, consistency, concurrency, validation, async workflows and tenant-safe API policy without implementation choices.
- conceptual API Command/Read Model Contracts V1 in `docs/15-api-command-readmodel-contracts-v1.md`, defining envelope/result/error/async semantics, intent contracts, expected versions/idempotency, validation findings and UI read-model composition without transport or implementation choices.
- product MVP Scope and First Forms V1 in `docs/16-mvp-scope-and-first-forms-v1.md`, defining the first production-usable scope around AOSR, file-backed evidence, executive schemes, derived registry, package outputs, onboarding/contextual hints and AI-optional delivery without stack or implementation choices.
- practical Tech Stack and Implementation Strategy V1 in `docs/17-tech-stack-and-implementation-strategy-v1.md`, selecting a boring MVP-oriented direction: React/TypeScript/Vite frontend, NestJS modular monolith backend, PostgreSQL, Redis/BullMQ async jobs, domain-scoped file storage, deterministic DOCX/PDF/ZIP generation, PostgreSQL-first search and optional proposal-only AI/OCR.
- Initial Repository Bootstrap and Development Rules V1 in `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`, defining the final pre-scaffold gate, coding preconditions, first scaffold scope, CI/dev quality gates, infrastructure portability/no server lock-in, forbidden shortcuts, docs/16 precedence, ADR presence handling, Foreman restriction and architecture-violation criteria.
- canonical ADR baseline in `docs/adr/`, establishing authoritative references for structured source of truth, typed documents, file-backed evidence/derived artifacts, immutable revisions/package snapshots and modular monolith/bounded contexts.
- first technical frontend-backend status slice, proving that the React shell can
  call the NestJS technical `/health` endpoint through `VITE_API_BASE_URL` and
  consume the shared technical response type from `packages/shared-types`.
- database foundation technical slice with empty Prisma schema, Prisma
  generation wiring and infrastructure-only database health status.
- object storage foundation technical slice with infrastructure-only
  S3-compatible config health status and no uploads/file APIs.
- auth sharing implementation plan in `docs/20-auth-sharing-implementation-plan-v1.md`,
  defining the safe future sequence from user identity skeleton through
  workspace/certificate-library share codes and grants without adding code,
  schema, migrations, routes or auth/sharing implementation.
- Phase 1 user identity skeleton in the backend: shared-kernel `Actor`
  primitive and workspace current actor resolver utility/port with fail-closed
  tests and no business access.
- Phase 2 global system admin marker in the backend: optional
  `SYSTEM_ADMIN_ACTOR_ID` config and workspace `admin-path` marker utility with
  tests for missing config, regular actor denial, configured active actor allow,
  disabled actor denial and ignored client-supplied admin/role/capability claims.
- Phase 3 owned workspace baseline in the backend: TypeScript-only
  `OwnedWorkspace` primitive and owner-only access utilities with leakage-safe
  `NOT_FOUND_OR_NOT_AUTHORIZED` denial, child-scope verification before child
  lookup, fail-closed current actor behavior, no admin marker bypass and no
  old RBAC role/capability/membership authorization.
- mock app shell and object dashboard in the frontend: in-memory dashboard ->
  existing AOSR workspace navigation, left nav, mock object cards, quick access
  mock certificate library page, mock representatives/organizations management
  page and recent documents, with the existing mock AOSR editor kept as the
  functional demo surface. The certificate, organization and representative
  pages are frontend-only, in-memory and share one mock store with the AOSR
  workspace, with no uploads/OCR/backend/persistence.

Не завершено:

- feature/domain API/uploads/generation implementation; every such task still requires separate explicit authorization and ADR compliance check;
- точная первая AOSR template baseline/participant requirements and remaining invite, privacy/access, retention, AI-processing and audit requirements за пределами зафиксированных V1 policies;
- production physical database mapping, migrations and business file storage implementation;
- repositories;
- physical API transport mapping and implementation;
- package builder implementation internals;
- registry override persistence/read-model detail beyond its documented V1 safety surface;
- search system;
- frontend state architecture;
- OCR extraction schemas;
- template placeholder/binding model;
- deferred fine-grained RBAC/privacy/commercial lifecycle details and the exact
  future implementation of `docs/20` phases;
- frontend component architecture.
- production object dashboard data, backend navigation, persistence and real
  certificate/representative/organization library pages. The current dashboard
  library pages and AOSR workspace share only an in-memory frontend mock store.
- remaining `docs/20` phases: workspace share codes and grants, certificate
  library share codes and grants.

---

## 39. Open questions

### Q1 — Aggregate design

Baseline определён в `docs/09-aggregate-boundaries-and-invariants.md` и по заданию владельца проекта применён в conceptual `docs/12-database-schema-v1.md`. Любое расширение этих границ или их изменение должно быть подтверждено до Backend/API Architecture.

Зафиксированы как самостоятельные owners:

- Object aggregate;
- FolderTree aggregate;
- Document aggregate;
- Certificate aggregate;
- ExecutiveScheme aggregate;
- Package bounded context;
- Template bounded context;
- Registry projection service.

Применённые Schema V1 boundary choices, которые могут быть пересмотрены только явным последующим решением:

- `FolderTree` является отдельным object-scoped aggregate root;
- содержательная работа первого scope хранится typed `Document` payload, без самостоятельного `WorkItem` root;
- `ProjectDrawingSet` является owned entity `ObjectDocumentationContext`;
- reusable boundaries для representatives/materials требуют решения.

### Q2 — Conceptual schema and physical database mapping

Первая storage-neutral conceptual schema таблиц, relationships, constraints, indexing considerations и snapshots создана в `docs/12-database-schema-v1.md`.

Нужно спроектировать:

- production physical table/index/constraint mapping;
- typed structured payload persistence strategy;
- transactions and concurrency boundaries;
- soft delete;
- tenant isolation.

### Q3 — API command and read model contracts

Conceptual Backend/API Architecture V1 создана в `docs/14-backend-api-architecture-v1.md`. На её основе в `docs/15-api-command-readmodel-contracts-v1.md` создан conceptual contract layer: common command/result/error/async vocabulary, intent payload/result semantics, expected versions/idempotency, validation findings, authorization scope и screen-specific read models без route list, OpenAPI или implementation stack.

После review нужно спроектировать:

- concrete MVP typed forms/required fields and first validation gates that use these contracts;
- policy details for permissions, privacy, retention, warning acknowledgement and AI processing;
- physical API transport mapping and implementation only after accepted contracts and MVP form scope.

### Q4 — Template engine

Нужно спроектировать:

- placeholders;
- binding;
- rendering;
- DOCX generation;
- preview compatibility;
- template versioning;
- object template override.

### Q5 — Package Builder internals

Async build, immutable released snapshots, dependency manifest and deterministic rebuild requirement документированы в `docs/13-domain-lifecycle-immutability-validation-v1.md`.

Нужно спроектировать:

- async queue;
- generation pipeline;
- PDF merge;
- snapshot storage;
- rebuild triggers;
- dependency graph;
- error handling.

### Q6 — Frontend state

Нужно спроектировать:

- autosave;
- live preview;
- optimistic UI;
- draft sync;
- locking UX;
- conflict handling;
- validation UI.

### Q7 — OCR / AI project ingestion and extraction model

Draft baseline project ingestion, proposals, confirmation, traceability and isolation определён в `docs/11-ai-project-ingestion-and-assistance-model.md`, отражён conceptual table families в `docs/12-database-schema-v1.md` и дополнен обязательным proposal/review flow в `docs/13-domain-lifecycle-immutability-validation-v1.md`.

Нужно определить оставшиеся policy/implementation details:

- supported extraction scope для сертификатов, схем, актов и uploaded project documentation;
- provider, privacy/data-processing consent и доступ ролей;
- требуемую granular source citation и retention rejected/stale proposals;
- какие подтвержденные checks могут стать formal domain validation rules.

### Q8 — Registry override layer

Разрешенная V1 surface (`hidden`, `sort_order`, `note`, signer selection и package display config) и запрет замены source facts/скрытия domain errors документированы в `docs/13-domain-lifecycle-immutability-validation-v1.md`. Нужно спроектировать persistence/read model, конкретные registry scopes/exports и UI-команды изменения owning entities.

---

## 40. Rules for future AI agents

1. Не начинать кодинг без явного задания.
2. Если пользователь просит “сделать MVP”, сначала проверить, не нарушает ли это архитектурные решения.
3. Любое изменение source of truth, registry philosophy, typed document model, template versioning или package snapshot strategy требует ADR.
4. Не предлагать Google Docs-like collaborative editing.
5. Не делать registry standalone editable Word/Excel.
6. Не хранить сертификаты только как текстовые номера.
7. Не делать DOCX/PDF source of truth.
8. Не делать generic JSON documents без typed schema.
9. Не делать Object giant aggregate.
10. Не делать Package Builder synchronous.
11. Не делать OCR auto-approve.
12. Не ломать tenant isolation.
13. Не делать uploaded project documentation, OCR text или AI response единственным source of truth.
14. Любые AI extraction/error detection results сохранять как traceable proposals до user confirmation.
15. Всегда учитывать реальную практику ПТО: документы часто исправляют, номера пересчитывают, папки дублируют, сертификаты используют повторно, заказчики требуют разные формы.
16. Если есть сомнения — сначала задать вопрос пользователю и зафиксировать ответ в `docs/CONVERSATION_QA_LOG.md`.

---

## 41. Immediate next recommended step

Следующий правильный этап:

```text
Review Phase 2 global system admin marker, then request a separate Phase 3 owned workspace baseline task from docs/20-auth-sharing-implementation-plan-v1.md
```

Technical status, database foundation, object storage foundation, Phase 1
identity skeleton and Phase 2 global system admin marker slices already exist
only for infrastructure/access foundation confidence. `docs/20` remains the required auth/sharing
implementation sequence. It does not permit immediate Prisma models, migrations,
API routes, login/session implementation, share codes or grants.
Следующий implementation step должен быть отдельной явной задачей и проверяться
against `docs/PROJECT_MEMORY.md`, accepted ADRs in `docs/adr/`, `docs/19` and
`docs/20`.

Pre-schema источники baseline:

```text
docs/09-aggregate-boundaries-and-invariants.md
docs/10-auth-workspace-rbac-model.md
docs/11-ai-project-ingestion-and-assistance-model.md
```

По прямому заданию владельца проекта их обязательные принципы применены в новом документе:

```text
docs/12-database-schema-v1.md
```

Database Schema V1 является conceptual/storage-neutral specification: она описывает table families, owners, relationships, constraints, indexing considerations, MVP/deferred scope и вопросы перед Backend/API, но не выбирает SQL, ORM, миграции или реализацию.

Review Schema V1 создал обязательный conceptual/storage-neutral follow-up:

```text
docs/13-domain-lifecycle-immutability-validation-v1.md
```

Он документирует V1 policies для lifecycle typed documents/evidence/packages/artifacts, editable-through-revision `final`, historical rebuild, structured numbering, validation gates, `RegistryOverride` safety, deterministic async packages, AI/OCR human review и границы `FolderTree`. Backend/API Architecture может начаться только после review и acceptance этого follow-up.

По заданию владельца проекта следующим conceptual этапом создан:

```text
docs/14-backend-api-architecture-v1.md
```

Он применяет зафиксированные policies через modular-monolith modules, explicit domain commands, UI-oriented read models, transaction/eventual boundaries, optimistic versioning, authoritative validation, package/artifact/AI async flows, tenant authorization and idempotency/error rules. Документ не является реализацией и не разрешает coding.

На его основе по прямому переходу владельца проекта создан contract-level документ:

```text
docs/15-api-command-readmodel-contracts-v1.md
```

Он определяет common command envelope/results/errors/async operations, intent-level payload/result semantics, version/idempotency/invalidation behavior, validation finding contract, authorization scope и UI read-model fields. Документ не является OpenAPI/transport design и не разрешает coding.

На его основе по прямому переходу владельца проекта создан product/MVP-scope документ:

```text
docs/16-mvp-scope-and-first-forms-v1.md
```

Он фиксирует первую production-usable поставку: АОСР как mandatory first-class form, certificate library, executive schemes, derived registry, package builder, generated DOCX/PDF/registry/ZIP outputs, search/collaboration/onboarding MVP boundaries and explicit non-MVP exclusions. Документ подчеркивает, что MVP must be usable without AI/OCR, а AI/OCR остается optional/deferred and proposal-only.

После review рекомендуемый следующий документ:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

`docs/17-tech-stack-and-implementation-strategy-v1.md` фиксирует pragmatic MVP implementation direction:

- React + TypeScript + Vite frontend;
- React Hook Form, TanStack Query/Table and restrained UI primitives for large validation-heavy PTO forms;
- TypeScript on Node.js LTS with NestJS modular monolith backend;
- HTTP JSON command/query API without CRUD-first endpoints or OpenAPI-first design;
- PostgreSQL as relational database with controlled JSONB, explicit transactions and version-aware snapshots;
- Redis/BullMQ workers for package builds, DOCX/PDF/ZIP generation, future AI/OCR and indexing;
- domain-scoped local/S3-compatible storage for originals and generated artifacts;
- DOCX templates rendered from structured data, PDF conversion in workers and ZIP generation from immutable package manifests;
- PostgreSQL relational/full-text/trigram search first, semantic/vector search deferred;
- AI/OCR optional, async, provider-abstracted and proposal-only.

На его основе создан final pre-scaffold gate:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

Он фиксирует enforceable first-bootstrap rules:

- first scaffold requires acceptance of docs/18 and a separate explicit first scaffold task;
- first scaffold is limited to tooling/app shells/shared config and MUST NOT include production features, Prisma schema, migrations, OpenAPI, real auth/uploads/queue/storage/generation, AI/OCR or deployment infrastructure;
- infrastructure portability/no server lock-in is mandatory: provider is replaceable, config/env drives database/Redis/storage/public URLs/CORS/session/app URLs, provider SDKs stay inside infrastructure adapters, and generated artifact links resolve through storage/download service;
- docs/16 has implementation precedence over older docs/08 TestAct candidate wording;
- canonical ADR 0001-0005 physical files now exist in `docs/adr/`; later accepted ADRs extend this implementation compliance set;
- Foreman active permissions are blocked without separate approval;
- exact first AOSR template participant requirements must not be hardcoded before template review;
- architecture violation criteria and stop/correct process are defined.

---

## 42. Final note

Проект должен развиваться маленькими системными шагами.

Не цель — “быстро написать MVP”.

Цель — построить архитектуру, которая выдержит реальные сценарии ПТО:

- много объектов;
- разные компании;
- разные заказчики;
- разные формы;
- разные сертификаты;
- пересборка комплектов;
- исправления документов;
- историческая неизменность старых данных;
- быстрый UX;
- минимум ручной рутины.

---

## 43. Repository Structure Policy

Этот раздел фиксирует назначение файлов репозитория и порядок разрешения противоречий. Он не отменяет исходные архитектурные документы: они сохраняются как детализация решений и история их формирования. При этом именно `docs/PROJECT_MEMORY.md` является самодостаточным master-файлом и первой точкой чтения для нового агента или разработчика.

### 43.1 Canonical knowledge structure

| Путь                                                               | Роль в проекте                                                                   | Политика использования                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                                        | Входная страница репозитория                                                     | Кратко объясняет назначение проекта и ведёт к master context. Не является полным архитектурным описанием.                                                                                                                                                                                                 |
| `docs/PROJECT_MEMORY.md`                                           | Единый master context                                                            | Канонический источник продуктовых и архитектурных решений, терминов, текущего статуса и правил для агентов.                                                                                                                                                                                               |
| `docs/CONVERSATION_QA_LOG.md`                                      | Журнал вопросов и решений                                                        | Хранит происхождение важных решений. Новые значимые ответы пользователя должны попадать сюда и затем отражаться в master context.                                                                                                                                                                         |
| `docs/AGENTS.md`                                                   | Быстрые инструкции агентам                                                       | Краткая operational entry point. При расхождении с master context приоритет у `PROJECT_MEMORY.md`.                                                                                                                                                                                                        |
| `docs/00-project-memory.md`                                        | Ранняя фиксация принципов                                                        | Сохраняется как базовый архитектурный источник. Активные положения интегрированы в этот файл.                                                                                                                                                                                                             |
| `docs/01-architecture-overview.md`                                 | Архитектурный обзор слоёв                                                        | Детализирует domain/application/projection/generation/storage layers.                                                                                                                                                                                                                                     |
| `docs/02-domain-model.md`                                          | Исходное описание доменной модели                                                | Используется при проектировании Data Model v1; положения включены в индексы ниже.                                                                                                                                                                                                                         |
| `docs/03-registry-model.md`                                        | Исходное описание реестров                                                       | Подтверждает derived projection policy.                                                                                                                                                                                                                                                                   |
| `docs/04-roadmap-and-open-questions.md`                            | Roadmap и ранние вопросы                                                         | Используется как источник незакрытых вопросов; актуальный консолидированный список приведён ниже.                                                                                                                                                                                                         |
| `docs/05-codex-agent-instructions.md`                              | Ранние инструкции Codex                                                          | Не удаляется; актуальные обязательные правила собраны в master context и `docs/AGENTS.md`.                                                                                                                                                                                                                |
| `docs/06-data-model-v1.md`                                         | Первая формальная концептуальная модель данных                                   | Фиксирует aggregate roots/boundaries, entities, ownership, snapshots, revisions и projections без выбора БД, API или стека.                                                                                                                                                                               |
| `docs/07-aosr-domain-specification.md`                             | Первая спецификация typed document                                               | Формализует АОСР: blocks, validation, snapshots, revisions, registry/package behavior и открытые domain questions без выбора реализации.                                                                                                                                                                  |
| `docs/08-document-types-catalog.md`                                | Каталог document/evidence/output types                                           | Классифицирует MVP baseline и candidate/deferred types, их source of truth, validation, registry/package and template behavior.                                                                                                                                                                           |
| `docs/09-aggregate-boundaries-and-invariants.md`                   | Boundary/invariants specification before database design                         | Фиксирует aggregate roots, ownership, invariants, revision/invalidation rules и baseline decisions, применённые в conceptual Schema V1.                                                                                                                                                                   |
| `docs/10-auth-workspace-rbac-model.md`                             | Historical/deferred RBAC reference                                               | Role/membership matrix superseded for MVP by `docs/19-sharing-and-access-model-v1.md`; tenant isolation, token safety, audit and revocation principles remain background when compatible.                                                                                                                 |
| `docs/11-ai-project-ingestion-and-assistance-model.md`             | AI-assisted project source ingestion specification before database design        | Фиксирует project source files, proposals, human confirmation, traceability, privacy/isolation/audit и связи с ИД, отражённые в Schema V1.                                                                                                                                                                |
| `docs/12-database-schema-v1.md`                                    | Conceptual Database Schema V1 before Backend/API design                          | Применяет обязательные baseline-границы в storage-neutral table/relationship/constraint model, сохраняя открытыми physical mapping и domain/policy decisions.                                                                                                                                             |
| `docs/13-domain-lifecycle-immutability-validation-v1.md`           | Schema V1 lifecycle/immutability/validation follow-up before Backend/API design  | Фиксирует storage-neutral lifecycle, historical rebuild, numbering, validation, override safety, package determinism, AI review flow и FolderTree boundary для review/acceptance.                                                                                                                         |
| `docs/14-backend-api-architecture-v1.md`                           | Conceptual Backend/API Architecture V1 before command/read-model contract design | Фиксирует modular-monolith modules, command/query boundary, UI read models, transactions/concurrency, validation, async outputs/AI and tenant-safe API principles без кода или technology selection.                                                                                                      |
| `docs/15-api-command-readmodel-contracts-v1.md`                    | Conceptual API Command/Read Model Contracts V1 before MVP forms                  | Фиксирует command/result/error/async semantics, intent contracts, expected versions/idempotency, validation findings, screen reads and scope rules без OpenAPI, code или technology selection.                                                                                                            |
| `docs/16-mvp-scope-and-first-forms-v1.md`                          | Product MVP Scope and First Forms V1 before technology selection                 | Фиксирует первую production-usable поставку вокруг АОСР, certificate library, executive schemes, registry, package outputs, onboarding hints and AI-optional delivery без code/scaffold/SQL/OpenAPI или выбора стека.                                                                                     |
| `docs/17-tech-stack-and-implementation-strategy-v1.md`             | Tech Stack and Implementation Strategy V1 before repository bootstrap            | Фиксирует pragmatic MVP stack and implementation direction: React/TypeScript/Vite, NestJS modular monolith, PostgreSQL, Redis/BullMQ, domain-scoped storage, deterministic DOCX/PDF/ZIP generation, PostgreSQL-first search and optional proposal-only AI/OCR; still no code/scaffold/migrations/OpenAPI. |
| `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` | Initial Repository Bootstrap and Development Rules V1 before first scaffold      | Фиксирует final pre-scaffold gate: preconditions, invariants, first scaffold scope, infrastructure portability/no server lock-in, CI/dev gates, forbidden shortcuts, docs/16 precedence, ADR handling, Foreman restriction, AOSR template hardcode ban and architecture violation rules.                  |
| `docs/19-sharing-and-access-model-v1.md`                           | MVP sharing/access architecture amendment                                        | Replaces complex RBAC with owner-based workspace/certificate-library sharing, opaque share codes and capability grants.                                                                                                                                                                                   |
| `docs/20-auth-sharing-implementation-plan-v1.md`                   | Auth sharing phased implementation plan                                          | Defines safe implementation sequence for identity, global system admin marker, owned workspace, workspace share codes/grants and certificate library share codes/grants. It is documentation only and adds no code/schema/API/auth behavior.                                                              |
| `docs/adr/*.md`                                                    | Принятые архитектурные решения                                                   | Нормативные решения по отдельным темам. Изменение принятого принципа требует нового ADR или явного пересмотра существующего.                                                                                                                                                                              |
| `docs/samples/*.md`                                                | Анализ реальных примеров                                                         | Reference sources для доменной модели и будущих шаблонов/парсеров; не generated output системы.                                                                                                                                                                                                           |

### 43.2 Rules for repository changes

- На текущем этапе репозиторий является архитектурным репозиторием, а не кодовой базой продукта.
- Нельзя добавлять backend/frontend implementation, `package.json`, lock-файлы, Dockerfile, CI/CD, deployment configuration или зависимости без отдельного пользовательского запроса и предварительного архитектурного решения.
- Нельзя удалять исходные docs, ADR или sample analyses только потому, что информация вошла в master context: они нужны как доказательная база и история решений.
- При появлении нового доменного решения нужно обновить `docs/PROJECT_MEMORY.md`; если решение принято в диалоге, также обновить `docs/CONVERSATION_QA_LOG.md`; если оно изменяет долгосрочную архитектуру, создать ADR.
- `docs/PROJECT_MEMORY.md` должен быть достаточен для начала новой сессии без обязательного чтения остальных файлов. Остальные файлы нужны для проверки происхождения деталей и углубления.

---

## 44. Full Domain Model Index

Этот индекс консолидирует сущности, обнаруженные в проектной документации, анализе АОСР и анализе реестра. Это conceptual domain model, а не физическая схема БД.

### 44.1 Workspace tenant and access context

| Сущность / концепт             | Назначение                                                                          | Ключевые правила                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Workspace` / `TenantContext`  | Логическая граница данных и resource-scoped authorization SaaS                      | Owner workspaces/project databases изолируют domain data; accepted grants do not permit unrelated workspace access/reuse. |
| `User`                         | Аккаунт физического лица                                                            | В MVP user owns own data/libraries and can accept grants to specific resources; no global business role.                  |
| `Global System Admin`          | Operational/admin user controlled by deployment/config                              | Exactly one expected initially; separate from owner/user sharing and not a business collaborator.                         |
| `OwnedWorkspace`               | Полноценная рабочая область/project database пользователя                           | User owns objects, documents, evidence, registry/package outputs and share grants in this scope.                          |
| `WorkspaceShareCode`           | Opaque code/link for connecting another authenticated user to an owned workspace    | Capabilities are stored server-side; default view-only; code can expire, revoke and rotate.                               |
| `WorkspaceShareGrant`          | Persistent capability-based access to one owner workspace                           | Created after code acceptance; can be revoked; cannot cross workspace boundaries.                                         |
| `CertificateLibrary`           | Owner's reusable quality evidence library                                           | Separate from workspace sharing; file-backed certificate invariant remains.                                               |
| `CertificateLibraryShareCode`  | Opaque code/link for connecting another user to an owner's certificate library      | Separate flow from workspace collaboration; default view/use posture.                                                     |
| `CertificateLibraryShareGrant` | Persistent capability-based access to one certificate library                       | Preserves source owner/provenance; does not grant workspace access.                                                       |
| `GrantCapability`              | Explicit allowed action such as `view_documents` or `use_certificates_in_documents` | Replaces MVP roles; default deny when missing.                                                                            |
| `GrantAuditEvent`              | Access lifecycle and sensitive action audit event                                   | Records code creation/acceptance/capability change/revocation and use of write capabilities.                              |
| `Membership` / `Role`          | Deferred RBAC concepts                                                              | Previous `Owner/Admin/PTO Engineer/Foreman/Viewer` matrix in `docs/10` is not MVP implementation scope.                   |

### 44.2 Project and organization context

| Сущность / концепт                       | Назначение                                                                                   | Source of truth / связи                                                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Object` / `Project`                     | Строительный объект, основной пользовательский контейнер                                     | Владеет настройками и ссылками, но не должен содержать все документы как giant aggregate.                                                                     |
| `EngineeringSystem`                      | Раздел или система: ОВиК, ВК, вентиляция, отопление, водоснабжение, канализация              | Связан с объектом, работами, документами и схемами.                                                                                                           |
| `FolderTree` / `Folder`                  | Самостоятельный object-scoped aggregate и его business collection nodes                      | Draft baseline `docs/09-aggregate-boundaries-and-invariants.md`: владеет hierarchy/placement, move, duplicate и soft delete; не владеет lifecycle документов. |
| `CompanyProfile`                         | Переиспользуемая карточка компании внутри tenant                                             | Может меняться для будущих объектов; не должна ретроспективно менять исторические документы.                                                                  |
| `ObjectTemplate` organization assignment | Ссылка на глобальную компанию и object-specific display context                              | Active linked acts resolve current library values; manual/released boundaries freeze exact output.                                                            |
| `Representative`                         | Глобальная карточка представителя/подписанта                                                 | Object-specific assignments store role, position, authority, organization relation and order; linked acts resolve live, manual/released states freeze output. |
| `RegistrySignerSnapshot`                 | Выбранный подписант конкретного реестра                                                      | Подписант реестра может отличаться от подписантов актов.                                                                                                      |
| `ProjectDrawingSet`                      | Комплект рабочих чертежей, по которым выполняются работы                                     | Draft baseline: owned entity в `ObjectDocumentationContext`; не является исполнительной схемой; участвует в АОСР и блоке реестра.                             |
| `ProjectSourceFile`                      | Загруженный project source material: PDF, drawing, specification или future supported source | Принадлежит конкретным `Workspace` и `Object`; служит provenance/reference context, но не становится единственным source of truth.                            |

### 44.3 Work and documentation aggregates

| Сущность / концепт          | Назначение                                                         | Ключевые правила                                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WorkItem` / work statement | Выполненная работа/участок/результат СМР                           | Draft baseline: самостоятельный aggregate root для V1 не вводится; работа, утверждаемая актом, хранится в typed `Document` payload, а reusable WorkItem остаётся future candidate. |
| `Document`                  | Общая оболочка typed document                                      | Содержит immutable `document_type`, status, number/date, typed payload, links, template version и revision.                                                                        |
| `AOSR`                      | Акт освидетельствования скрытых работ                              | Typed document, связывает работу, представителей, проектную документацию, материалы, сертификаты, схемы и разрешение последующих работ.                                            |
| `TestAct`                   | Акт испытаний                                                      | Typed document, фиксирует объект/методику/параметры/результаты испытаний и заключение.                                                                                             |
| `TechnicalReadinessAct`     | Акт технической готовности                                         | Обнаружен в sample-реестре; включение в MVP и подробная schema ещё требуют проработки.                                                                                             |
| `ExecutiveScheme`           | Исполнительная схема                                               | PDF/file + structured metadata; при замене создаётся новый файл/объект, а не правка чертежа системой.                                                                              |
| `Certificate`               | Сертификат, декларация, паспорт, письмо или иной документ качества | Library aggregate с физическим файлом и metadata; переиспользуется в нескольких документах/объектах.                                                                               |
| `Material`                  | Материал или оборудование                                          | Справочная/проектная сущность; обязательность каталога в MVP остаётся вопросом.                                                                                                    |
| `MaterialUsage`             | Факт применения материала в работе                                 | Связывает конкретную работу, количество/партию/место применения и подтверждающие сертификаты.                                                                                      |

### 44.4 Output, rendering and lifecycle concepts

| Сущность / концепт             | Назначение                                                                      | Ключевые правила                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `RegistryProjection`           | Вычисляемое представление состава документации                                  | Никогда не source of truth; строится из domain data и override layer.                                    |
| `RegistryOverride`             | Управляемые печатные/порядковые изменения реестра                               | Позволяет порядок, скрытие, примечания и подписанта; не переписывает source fields.                      |
| `Package` / `PackageSnapshot`  | Комплект ИД и зафиксированный результат сборки                                  | Snapshot-based, asynchronous build, invalidation при изменении зависимостей.                             |
| `Template` / `TemplateVersion` | Правило визуального формирования документа                                      | Version immutable after first use; новая форма означает новую версию.                                    |
| `GeneratedArtifact`            | DOCX, PDF, ZIP, export или package output                                       | Производен от structured data, template version и snapshot context.                                      |
| `DocumentLock`                 | Application-level lock редактирования                                           | Отдельно от `Document`, содержит TTL/heartbeat и не меняет revision.                                     |
| `ActivityHistory`              | Audit/activity history                                                          | Должна фиксировать ключевые изменения, генерации, подтверждение OCR и invalidation snapshots.            |
| `OCRExtractionProposal`        | Предложенные AI/OCR metadata                                                    | Только assistant output; активными данные становятся после подтверждения пользователя.                   |
| `AIConsistencyFindingProposal` | Предложение о missing evidence, mismatch, incompleteness или иной inconsistency | Только reviewable finding с source citation; не является автоматически ошибкой или engineering approval. |

### 44.5 Aggregate boundary guardrails

- `Object` связывает данные объекта, но не поглощает documents, certificates, templates и packages в один giant aggregate.
- `Document`, `Certificate` и `ExecutiveScheme` должны иметь самостоятельный жизненный цикл.
- `RegistryProjection` является сервисом/проекцией, а не master aggregate.
- `Package Builder` должен рассматриваться как отдельный bounded context или application service с собственными snapshots/jobs.
- `DocumentLock` должен жить отдельно от document revision history.
- Conceptual `docs/12-database-schema-v1.md` применяет отдельный object-scoped `FolderTree`, document-owned work meaning без самостоятельного `WorkItem` root для V1 и object-owned `ProjectDrawingSet` как schema baseline.
- Conceptual Schema V1 применяет Workspace/Object-scoped project files, proposal-only AI/OCR, human confirmation, traceability and audit до влияния на structured targets.
- Production physical mapping, migrations, ORM, transactions and API ещё не утверждены.

---

## 45. Full Document Types Index

### 45.1 Universal document contract

Каждый typed document должен иметь:

- идентификаторы tenant, object и folder;
- неизменяемый тип документа;
- status и revision;
- номер/правило нумерации и дату документа;
- structured payload соответствующего типа;
- связи с сертификатами, схемами, работами и представителями, если применимо;
- `template_version_id`;
- generated artifacts и признак необходимости регенерации;
- audit metadata и soft-delete metadata.

Документ не является произвольным JSON blob или редактируемым DOCX. Flexible fields допустимы только внутри определённого typed contract и не должны уничтожать доменную семантику.

### 45.2 AOSR / АОСР

Назначение: подтвердить освидетельствование скрытых работ перед последующими работами.

Обязательный смысл модели:

- объект, система и место выполнения;
- предъявленные скрытые работы;
- даты выполнения и дата акта;
- комплект рабочей/проектной документации и нормативные ссылки;
- применённые материалы/оборудование;
- ссылки на certificate library items;
- исполнительные схемы/приложения, когда требуются;
- участники освидетельствования, роли, полномочия и порядок;
- разрешение на последующие работы, замечания и дополнительные сведения;
- numbering, status, revision и template version.

Цветовая логика АОСР является зафиксированным input-to-domain mapping:

| Цвет в исходном обсуждении | Семантика                            | Правило хранения                                                                                      |
| -------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Жёлтый                     | Объектные данные и реквизиты объекта | Вводятся на уровне объекта и используются через object context/snapshot.                              |
| Зелёный                    | Представители и подписанты           | Определяются на объекте, допускают document override; подстрочный текст editable; порядок обязателен. |
| Серый                      | Номер акта                           | Управляется numbering engine: prefix, sequence, suffix, rendered number.                              |
| Фиолетовый                 | Дата акта                            | Поле документа; default может быть текущей датой; допускается массовое изменение в папке.             |
| Бирюзовый                  | Переменные данные конкретного акта   | Работы, проектные ссылки, материалы, сертификаты, дальнейшие работы, приложения, примечания.          |

Непреложное правило: certificate number в печатном АОСР является rendered value связи с `Certificate`; нельзя вводить его как ничем не подтверждённую строку.

### 45.3 Test Act / Акт испытаний

Назначение: зафиксировать испытание системы, участка, трубопровода или оборудования.

Модель должна поддерживать:

- вид испытания, например гидравлическое, пневматическое, промывка, опрессовка, герметичность или индивидуальные испытания оборудования;
- испытываемую систему/участок/оборудование;
- нормативное основание или методику;
- параметры и фактические результаты;
- дату/время и участников;
- измерительные средства, если применимо;
- заключение о соответствии;
- связанные схемы, материалы и другие акты.

Точный перечень форм и обязательных полей MVP ещё не утверждён.

### 45.4 Certificate / Документ качества

Сертификат участвует в комплекте и реестре как самостоятельный library item, а не как typed акт. В перечень поддерживаемых документов качества входят сертификаты соответствия, декларации, паспорта качества/технические паспорта, исходящие и отказные письма, информационные письма и иные подтверждающие документы.

Критические правила:

- у сертификата обязан быть физически сохранённый файл;
- акт и реестр ссылаются на `certificate_id`, а не держат ручную строку вместо сущности;
- один сертификат может переиспользоваться в нескольких актах и объектах внутри допустимой tenant-области;
- применимость/срок проверяется относительно даты документа, в котором сертификат используется;
- OCR извлекает metadata только как предложение для подтверждения.

### 45.5 ExecutiveScheme / Исполнительная схема

Исполнительная схема отражает фактически выполненные работы и отличается от `ProjectDrawingSet`, который описывает исходный комплект рабочих чертежей.

Минимальная модель:

- файл PDF/attachment;
- object и folder;
- title;
- registration number;
- date;
- sheet count;
- note;
- связи с WorkItem и актами.

На первом этапе metadata вводятся вручную. При изменении схемы создаётся новая сущность/новый файл; сложный versioning схем на старте не принят.

### 45.6 Documents recognized but requiring later schemas

- `TECHNICAL_READINESS_ACT`: присутствует в реальном примере реестра; модель требует отдельного уточнения.
- Другие акты испытаний и исполнительные документы: добавляются только как typed documents после согласования required fields и validation rules.
- Классификация document/evidence/projection/package types и candidate test acts зафиксирована в `docs/08-document-types-catalog.md`; точный MVP type list всё ещё требует ратификации.

---

## 46. Full Registry Projection Rules

### 46.1 Canonical rule

```text
Registry = derived projection, never source of truth
```

Реестр удобен как рабочее представление инженера ПТО и как печатный артефакт, но он не заменяет доменные сущности. Любая строка должна быть объяснима через первичные данные объекта, snapshots, документов, сертификатов, схем или управляемого override.

### 46.2 Projection blocks and data ownership

| Блок реестра                   | Source data                                                                            | Что нельзя делать                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Шапка объекта                  | `Object`, default parameters / object metadata                                         | Не хранить единственную копию объекта в тексте реестра.                                 |
| Подрядчик/исполнители          | Current `ObjectTemplate` assignments or frozen released values, contract/work settings | Live projection may resolve current profile; historical package must use frozen output. |
| Комплект рабочих чертежей      | `ProjectDrawingSet`                                                                    | Не смешивать с `ExecutiveScheme`.                                                       |
| Сертификаты/документы качества | `Certificate Library`, act refs, package scope                                         | Не показывать номер без существующего файла library item.                               |
| Акты                           | Typed `Document` aggregates                                                            | Не редактировать date/number/status только в строке проекции.                           |
| Исполнительные схемы           | `ExecutiveScheme`                                                                      | Не подменять metadata свободным текстом в реестре.                                      |
| Подписант                      | `RegistrySignerSnapshot` / selected representative                                     | Не предполагать, что это всегда подписант акта.                                         |

### 46.3 Color logic of the real registry example

Цветовая логика, объяснённая пользователем при разборе реестра вентиляции, является доменным ориентиром:

| Цвет          | Блок                             | Вывод для модели                                              |
| ------------- | -------------------------------- | ------------------------------------------------------------- |
| Жёлтый        | Объектные данные                 | Проецируются из object data, вводимых один раз на объект.     |
| Красный       | Сертификаты и документы качества | Проецируются из Certificate Library и document/package links. |
| Серый         | Акты                             | Проецируются из typed `Document` aggregates.                  |
| Зелёный       | Исполнительные чертежи/схемы     | Проецируются из `ExecutiveScheme`.                            |
| Тёмно-красный | Лицо, подписывающее реестр       | Проецируется из signer snapshot/selected representative.      |

### 46.4 Editable surface and override layer

В интерфейсе реестра пользователь может:

- менять визуальный порядок строк, сертификатов, актов и схем;
- скрывать/возвращать строки в рамках конкретного выхода/комплекта;
- добавлять печатные примечания;
- выбирать подписанта реестра;
- менять ordering комплекта.

Эти операции должны сохраняться в `RegistryOverride` или package configuration. Они не дают права переписать primary fields сущностей.

Если пользователь хочет изменить дату акта, номер сертификата, название схемы или реквизиты компании, он должен изменить исходную сущность; после этого projection пересчитывается, а зависимые generated artifacts/snapshots могут инвалидироваться.

### 46.5 Registry output

DOCX/PDF/XLSX реестра — generated artifact. Он должен строиться заново из актуальной проекции, template version и overrides. Изменение экспортированного файла вне системы не меняет structured data без отдельного проектируемого процесса импорта.

---

## 47. Source Materials and Privacy Policy

### 47.1 Source materials used for the architecture

Архитектурные выводы в этом master context опираются на:

- исходные архитектурные документы `docs/00-project-memory.md` — `docs/05-codex-agent-instructions.md`;
- ADR 0001–0005;
- журнал решений `docs/CONVERSATION_QA_LOG.md`;
- инструкции агентов `docs/AGENTS.md`;
- анализ реального АОСР `docs/samples/aosr-example-analysis.md`, исходный пример обозначен как `Пример.docx`;
- анализ реестра вентиляции `docs/samples/registry-ventilation-example.md`, исходный пример обозначен как `Реестр вентиляция.doc`.

Sample analyses нужны как domain reference: они объясняют структуру документов, цветовую разметку и происхождение требований. Они не являются утверждёнными production templates, DB schemas или generated outputs будущей системы.

### 47.2 Privacy and source handling

В source examples могут находиться реальные или похожие на реальные персональные и организационные реквизиты: ФИО, компании, адреса, ИНН/КПП/ОГРН, договоры, регистрационные номера и сведения о сертификатах.

Правила обращения:

- использовать такие примеры для архитектурного анализа и разработки только в объёме, необходимом проекту;
- не интерпретировать пример как разрешение публиковать персональные или договорные сведения в демонстрационных данных;
- при создании публичных демо, тестовых fixtures, документации вне закрытого контекста или обучающих материалов обезличивать реквизиты;
- не отправлять содержимое source files внешним AI/OCR-сервисам без отдельного решения о privacy, согласии и модели обработки данных;
- project documentation, загружаемая для AI-assisted ИД, должна быть привязана к конкретным `Workspace` и `Object`, а originals/extracted content/proposals должны наследовать access restrictions source context;
- оригинальные загруженные файлы будущей системы должны иметь tenant isolation, access control, audit trail и storage policy;
- OCR/AI result не считается подтверждённым фактом до проверки пользователем; AI findings и подтверждения должны сохранять traceable source provenance и audit.

### 47.3 Historical evidence rule

Файлы сертификатов, исполнительных схем и выпущенных комплектов важны как подтверждающие материалы. Их нельзя без следа заменять или удалять после использования в документах/комплектах. Delete/version/retention policy должна сохранить воспроизводимость истории.

---

## 48. Agent Operating Rules

### 48.1 Mandatory reading and priority

Перед изменением архитектуры или реализацией агент обязан прочитать этот master context и canonical ADR baseline:

- `docs/19-sharing-and-access-model-v1.md`
- `docs/20-auth-sharing-implementation-plan-v1.md`
- `docs/adr/0001-structured-data-source-of-truth.md`
- `docs/adr/0002-typed-document-domain-model.md`
- `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
- `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
- `docs/adr/0005-modular-monolith-and-bounded-contexts.md`

При необходимости проверки происхождения решения агент обращается к `docs/CONVERSATION_QA_LOG.md`, ADR и sample analyses.

Если обнаружено противоречие:

1. не выбирать молча удобную трактовку;
2. выделить противоречие пользователю;
3. предложить корректировку master context и/или ADR;
4. до решения не внедрять необратимую реализацию.

### 48.2 Hard prohibitions

Агенту запрещено без явного нового решения:

- начинать кодинг на архитектурном этапе;
- делать DOCX, PDF, XLSX или выгруженный реестр source of truth;
- делать реестр самостоятельной редактируемой master table;
- моделировать документы как generic constructor или untyped JSON blob;
- хранить сертификат только текстовым номером без файла в библиотеке;
- считать `final` документ неизменяемым;
- менять использованную template version;
- делать Package Builder синхронной операцией пользовательского запроса;
- превращать `Object` в giant aggregate;
- разрешать OCR/AI автоматически утверждать критичные данные;
- считать uploaded project documentation, OCR text или AI response единственным source of truth либо применять AI proposal без user confirmation;
- ломать tenant isolation;
- нарушать canonical ADR baseline;
- обходить phased auth/sharing sequence in `docs/20-auth-sharing-implementation-plan-v1.md`;
- превращать Phase 1 actor identity skeleton в login/session/auth provider,
  system admin marker, workspace creation, share code/grant or business access
  implementation;
- заменять открытый архитектурный вопрос случайной технологической реализацией.

### 48.3 Decision-making behavior

- Если запрос касается source of truth, typed documents, registry projection, package snapshots, template versioning, locks/autosave, tenant isolation или privacy, агент должен проверить соответствие принятым решениям и при изменении принципа предложить ADR.
- Если пользовательская идея создаёт риск потери историчности, отсутствия подтверждающих файлов или невозможности пересобрать комплект, агент должен явно возразить и объяснить риск.
- Новые вопросы, на которые пользователь дал архитектурно значимый ответ, должны быть зафиксированы в `CONVERSATION_QA_LOG.md` и консолидированы здесь.
- На стадии реализации агент должен предпочитать domain-specific UI и contracts универсальным конструкторам.

---

## 49. Current Next Step

Созданы последовательные domain and pre-schema specifications:

```text
docs/06-data-model-v1.md
docs/07-aosr-domain-specification.md
docs/08-document-types-catalog.md
docs/09-aggregate-boundaries-and-invariants.md
docs/10-auth-workspace-rbac-model.md
docs/11-ai-project-ingestion-and-assistance-model.md
```

По прямому заданию владельца проекта создан conceptual schema document:

```text
docs/12-database-schema-v1.md
```

Database Schema V1:

- применяет `Workspace` tenant boundary, membership-based authorization и opaque stored invites;
- применяет отдельный `FolderTree`, document-owned work meaning без `WorkItem` root и object-owned `ProjectDrawingSet`;
- описывает logical table families для typed `Document`/`AOSR`, evidence, project sources/proposals, templates, registry, package, files, artifacts, snapshots and audit;
- сохраняет file-backed evidence, derived registry, immutable released/template/package history и assistant-only AI rules;
- определяет relationships, conceptual constraints, indexing considerations, MVP/deferred scope и вопросы перед Backend/API;
- не выбирает production database, SQL, ORM, migrations, API или application stack.

Review Schema V1 produced the required conceptual/storage-neutral follow-up:

```text
docs/13-domain-lifecycle-immutability-validation-v1.md
```

Он документирует V1 policy по lifecycle typed documents/evidence/packages/artifacts, editable-through-revision `final`, historical rebuild, structured numbering, validation levels/gates, `RegistryOverride` safety surface, deterministic async package manifests, AI/OCR review flow и границе `FolderTree`.

По прямому переходу владельца проекта к следующему этапу создан conceptual Backend/API document:

```text
docs/14-backend-api-architecture-v1.md
```

Backend/API Architecture V1:

- определяет modular monolith first и bounded application modules для реального PTO workflow;
- описывает explicit command families вместо CRUD-first API и screen-oriented read model families;
- закрепляет atomic revision/snapshot transitions, eventual projection/generation/search/AI flow, optimistic versioning and idempotency;
- применяет authoritative backend validation, immutable evidence/package references and workspace membership authorization;
- оставляет открытыми exact contracts, physical transport/persistence, storage/queue/renderer/AI choices and policy details.

По прямому переходу владельца проекта к следующему этапу создан conceptual contract document:

```text
docs/15-api-command-readmodel-contracts-v1.md
```

API Command/Read Model Contracts V1:

- определяет common command envelope, command result, error and async-operation contracts;
- описывает payload/result semantics for typed document, folder/numbering, evidence, registry, package, artifact, AI/OCR and workspace/invite intents;
- фиксирует expected-version/idempotency, stale/invalidation, validation finding and authorization-scope rules;
- определяет screen-oriented read models without table dumps, routes or OpenAPI;
- оставляет открытыми first typed forms, fine-grained RBAC/privacy/retention/AI policy and physical implementation choices.

По прямому переходу владельца проекта к следующему этапу создан product/MVP-scope document:

```text
docs/16-mvp-scope-and-first-forms-v1.md
```

MVP Scope and First Forms V1:

- фиксирует АОСР как mandatory first-class typed form первой production delivery;
- оставляет `TestAct` и `TechnicalReadinessAct` limited/deferred без approved concrete form/payload/template/validation;
- включает certificate library and executive schemes as file-backed evidence, not standalone text in acts;
- ограничивает registry and package builder derived/snapshot workflows without ERP/ECM/platform expansion;
- фиксирует generated outputs MVP: AOSR DOCX/PDF, registry export and ZIP package;
- фиксирует UX/onboarding decision: first-run guidance, contextual hints/tooltips, empty states, validation explanation and "do not show again" behavior without cluttering experienced users;
- подчеркивает, что MVP must be usable without AI/OCR; AI/OCR remains optional/deferred and proposal-only.

По прямому переходу владельца проекта к следующему этапу создан practical implementation strategy document:

```text
docs/17-tech-stack-and-implementation-strategy-v1.md
```

Tech Stack and Implementation Strategy V1:

- выбирает boring MVP-oriented stack: React + TypeScript + Vite frontend and NestJS modular monolith backend on Node.js LTS;
- выбирает PostgreSQL as relational source-of-truth database, controlled JSONB usage, explicit transactions and version-aware snapshots;
- выбирает Redis/BullMQ direction for async package builds, DOCX/PDF/ZIP generation, future AI/OCR and indexing;
- выбирает domain-scoped file storage with local development adapter and S3-compatible production direction, forbidding generic drive abstraction;
- выбирает DOCX template rendering from structured data, backend PDF conversion and ZIP package generation from immutable manifests;
- выбирает PostgreSQL-first search and defers semantic/vector search;
- фиксирует AI/OCR as optional, async, provider-abstracted, proposal-only and never autonomous;
- определяет recommended first coding milestones but keeps coding blocked.

Tech Stack and Implementation Strategy V1 не разрешает production code, backend/frontend scaffold, source folders, package manifests, production SQL/migrations/ORM schema, OpenAPI, concrete routes, Docker/CI/deployment files или repository bootstrap. Actual coding/scaffold may begin only after acceptance of both `docs/17-tech-stack-and-implementation-strategy-v1.md` and `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`.

По прямому переходу владельца проекта к следующему этапу создан final pre-scaffold gate document:

```text
docs/18-initial-repository-bootstrap-and-development-rules-v1.md
```

Initial Repository Bootstrap and Development Rules V1:

- фиксирует preconditions before coding and first explicit scaffold task requirement;
- ограничивает first scaffold package/workspace setup, TS/lint/format/test tooling, React/Vite shell, NestJS shell, worker shell and placeholders;
- запрещает production features, Prisma schema, migrations, OpenAPI, real auth/uploads/queue/storage/generation, AI/OCR and deployment infrastructure in first scaffold;
- фиксирует PostgreSQL + Prisma, NestJS, React + Vite + TS, Redis/BullMQ and S3-compatible storage abstraction as guarded implementation directions;
- фиксирует infrastructure portability/no server lock-in: deployment provider replaceable, server/provider-specific assumptions forbidden in domain/application code, environment/config drives database/Redis/object storage/public URLs/CORS/session/base URLs, generated artifact links resolved through storage/download service;
- фиксирует docs/16 precedence over older docs/08 TestAct candidate wording;
- requires canonical ADR 0001-0005 physical presence; later accepted ADRs extend the implementation compliance set;
- блокирует active Foreman permissions and complex RBAC for MVP; access follows `docs/19-sharing-and-access-model-v1.md`;
- запрещает hardcoding exact first AOSR participant requirements before template review;
- defines architecture violation and stop/correct process.

---

## 50. What Must Not Be Forgotten

Этот список является коротким guardrail register, который должен проверяться при любом новом проектном решении:

1. `SOURCE OF TRUTH = STRUCTURED DATA`.
2. DOCX, PDF, ZIP, реестр и комплект — generated artifacts/projections, а не база данных.
3. Реестр — derived projection; source fields меняются в исходных сущностях.
4. АОСР, акты испытаний и другие документы — typed documents, не generic document constructor.
5. Цветовая логика АОСР: жёлтый — object, зелёный — representatives, серый — numbering, фиолетовый — date, бирюзовый — document-specific data.
6. Цветовая логика реестра: жёлтый — object, красный — certificates, серый — acts, зелёный — schemes, тёмно-красный — signer.
7. Номер сертификата нельзя просто вписать строкой: сначала должен существовать physical file + `Certificate` library entity.
8. Срок сертификата проверяется относительно даты документа, а не текущей даты; истечение может дать warning, а не автоматический запрет.
9. `final` документ можно исправлять; такое изменение повышает `revision` и инвалидирует зависимые package snapshots.
10. Template version после использования immutable; изменившаяся форма создаёт новую версию.
11. Package Builder является async и snapshot-based; rebuild вызывается изменением зависимостей.
12. `Object` не должен стать giant aggregate.
13. SectionTemplate keeps live section-level company/representative assignments; manual and released snapshots protect historical output from later library changes.
14. `ProjectDrawingSet` и `ExecutiveScheme` — разные понятия.
15. AI/OCR — assistant only; никакого auto-approve критичных metadata.
16. Исходные документы могут содержать чувствительные реквизиты; privacy и tenant isolation обязательны.
17. `Workspace` является tenant boundary; MVP access к чужим resources выдаётся только через resource-scoped share grants.
18. Complex RBAC, `Foreman` role и `Owner/Admin/PTO Engineer/Viewer` matrix не входят в MVP; capabilities replace roles for grants.
19. Project source files для AI-assisted ИД всегда scoped к `Workspace` и `Object`; upload не делает их единственным source of truth.
20. AI extraction и error detection создают только traceable/auditable proposals; пользователь подтверждает extracted data и proposed links.
21. `docs/12-database-schema-v1.md` является conceptual schema baseline; он не является production SQL, ORM/API contract или разрешением начать coding.
22. `docs/13-domain-lifecycle-immutability-validation-v1.md` документирует policy follow-up Schema V1, применяемый Backend/API Architecture V1.
23. `docs/14-backend-api-architecture-v1.md` является conceptual architecture input for command/read-model contracts, а не разрешением на code/SQL/scaffold.
24. `docs/15-api-command-readmodel-contracts-v1.md` является conceptual contract layer, не OpenAPI или implementation.
25. `docs/16-mvp-scope-and-first-forms-v1.md` фиксирует первый product/MVP scope before technology selection.
26. MVP должен быть usable without AI/OCR; AI/OCR не является prerequisite для первой delivery.
27. Onboarding/contextual hints, empty states, validation explanations and "do not show again" behavior входят в UX baseline MVP, но не должны мешать experienced users.
28. `docs/17-tech-stack-and-implementation-strategy-v1.md` фиксирует pragmatic stack and implementation direction but still does not permit code/scaffold/migrations/OpenAPI.
29. `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` фиксирует final pre-scaffold gate; first scaffold accepted, but feature coding remains blocked without separate explicit task.
30. `docs/16-mvp-scope-and-first-forms-v1.md` has implementation-scope precedence over older `docs/08-document-types-catalog.md` TestAct candidate wording.
31. Foreman active permissions must not be implemented without separate approval.
32. Exact first AOSR participant requirements must not be hardcoded before template review.
33. Infrastructure provider/server lock-in is forbidden: database, Redis, storage, public/download URLs, CORS, session secrets and app base URLs are config-driven; provider SDKs stay inside narrow infrastructure adapters.
34. Canonical ADR baseline in `docs/adr/` is accepted: ADR 0006 defines global reusable libraries and explicit frozen output boundaries; ADR 0007 is authoritative for active linked/manual acts; ADR 0008 is authoritative for section-scoped ID and `SectionTemplate`. All must be followed by future implementation work.
35. `docs/19-sharing-and-access-model-v1.md` supersedes `docs/10-auth-workspace-rbac-model.md` for MVP implementation scope.
36. `docs/20-auth-sharing-implementation-plan-v1.md` fixes auth/sharing implementation sequence; do not skip from docs to share grants, certificate-library sharing, Prisma models, migrations or API routes without separate phase-scoped approval.
37. Phase 1 user identity skeleton is only `Actor` primitive plus current actor resolver utility/port; identity alone grants no workspace, document, certificate, package or file access.
38. Phase 2 global system admin marker is only optional `SYSTEM_ADMIN_ACTOR_ID`
    config plus workspace `admin-path` utility; it is not a business access
    bypass, workspace owner, role/capability, route, UI, Prisma model, migration
    or auth/session implementation.
39. Phase 3 owned workspace baseline is only TypeScript ownership primitive and
    owner-only access utility; it is not persistent workspace creation, Prisma,
    migrations, routes/controllers, frontend UI, share codes/grants, admin
    support tenant browsing or business feature implementation.
40. Certificates, organizations and representatives are global reusable
    user-level libraries. Section templates store assignments/links. Active
    `linked` acts resolve them live; `manual` acts and released outputs use
    explicit snapshots.
41. Section-level reusable data lives in `SectionTemplate` /
    `Шаблонные значения раздела`. A working act is either fully `linked` to that
    template or fully `manual` with one complete snapshot; partial
    template-field overrides are forbidden.
42. Work contractor, additional information and copy count are repeated
    section-template data. Linked act UI collapses template-owned sections by
    default and requires the explicit whole-act manual switch before editing.

---

## 51. Decisions Already Made

Этот реестр включает решения из `CONVERSATION_QA_LOG.md`, ADR и source analyses, чтобы новый агент не возвращался к уже закрытым вопросам.

| Вопрос / тема                                                                | Принятое решение                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Архитектурное следствие                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Нужен ли единый master context?                                              | Да, `docs/PROJECT_MEMORY.md` является главным источником знаний.                                                                                                                                                                                                                                                                                                                                                                                                                                  | Новые значимые решения консолидируются здесь.                                                                                                                                                                                                                                                                  |
| Что является source of truth?                                                | Structured data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | DOCX/PDF/registry/package — generated or derived outputs.                                                                                                                                                                                                                                                      |
| Должен ли реестр быть отдельным редактируемым документом?                    | Нет, registry is derived projection.                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Разрешены overrides порядка/видимости/примечаний, но не ручная замена source fields.                                                                                                                                                                                                                           |
| Как трактовать цветовую разметку АОСР?                                       | Жёлтый object, зелёный representatives, серый number, фиолетовый date, бирюзовый variable document data.                                                                                                                                                                                                                                                                                                                                                                                          | Разметка формирует boundaries данных документа и объекта.                                                                                                                                                                                                                                                      |
| Можно ли вписать certificate number без сертификата?                         | Нет.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Certificate Library item с физическим файлом обязателен до ссылки из акта/реестра.                                                                                                                                                                                                                             |
| Где живут сертификаты, организации и представители?                          | В глобальных user-level reusable libraries.                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Objects store assignments/links and object-specific details; linked acts resolve current data live, manual acts use complete snapshots, and released outputs freeze their result.                                                                                                                              |
| На какую дату валидировать сертификат?                                       | На дату документа, не на сегодняшнюю дату.                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Исторически корректный документ сохраняет валидность; просрочка для нового документа даёт warning.                                                                                                                                                                                                             |
| Можно ли править final document?                                             | Да.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `final` — validated published revision, правка вызывает `revision++`, revalidation и invalidation package snapshots.                                                                                                                                                                                           |
| Можно ли изменить template version после использования?                      | Нет.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Used template version immutable; новая форма оформляется новой версией.                                                                                                                                                                                                                                        |
| Как собирать комплект ИД?                                                    | Автоматически, snapshot-based, async background job.                                                                                                                                                                                                                                                                                                                                                                                                                                              | Нужны dependency invalidation, progress/status, retry и cached snapshots.                                                                                                                                                                                                                                      |
| Как хранить ExecutiveScheme?                                                 | File/PDF + structured metadata.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | На старте metadata ручные; изменившаяся схема создаётся как новый файл/объект.                                                                                                                                                                                                                                 |
| Что такое ProjectDrawingSet?                                                 | Отдельный concept для рабочих чертежей; не ExecutiveScheme.                                                                                                                                                                                                                                                                                                                                                                                                                                       | Используется как источник блока реестра и ссылок АОСР.                                                                                                                                                                                                                                                         |
| Как должен ощущаться интерфейс?                                              | Пользователь работает с комплектом ИД, а не с CRM-таблицей.                                                                                                                                                                                                                                                                                                                                                                                                                                       | UX document-centric, complexity structured model скрывается.                                                                                                                                                                                                                                                   |
| Каково назначение OCR/AI?                                                    | Assistant only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Извлечённые metadata активируются только после пользовательского подтверждения.                                                                                                                                                                                                                                |
| Можно ли использовать загруженный проект для AI-assisted ИД и поиска ошибок? | Да, как Workspace/Object-scoped source material с proposals-only workflow.                                                                                                                                                                                                                                                                                                                                                                                                                        | Structured data остаются source of truth; extracted data/links/findings требуют user confirmation, traceability and audit.                                                                                                                                                                                     |
| Где хранить данные компании для объекта и акта?                              | Current identity/requisites live in the global library; object-specific assignment/display context lives in `ObjectTemplate`; manual/released boundaries store exact resolved snapshots.                                                                                                                                                                                                                                                                                                          | Library corrections update active linked acts but never rewrite manual acts or released revisions/packages.                                                                                                                                                                                                    |
| Может ли Object владеть всем сразу?                                          | Нет.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Требуются отдельные aggregates/contexts для documents, certificates, schemes, templates и packages.                                                                                                                                                                                                            |
| Какая стадия проекта сейчас?                                                 | Infrastructure scaffold accepted; canonical ADR baseline accepted; backend module skeleton, technical status slice, database foundation technical slice, object storage foundation technical slice, auth sharing implementation plan, Phase 1 user identity skeleton, Phase 2 global system admin marker, Phase 3 owned workspace baseline, ADR 0006 global reusable libraries and ADR 0007 document default parameters introduced; feature coding still blocked beyond explicitly scoped slices. | Следующий implementation step требует отдельного явного задания и проверки against project memory, accepted ADRs in `docs/adr/` and `docs/20` when auth/sharing is involved.                                                                                                                                   |
| Кто является пользователем SaaS?                                             | Физическое лицо с одним аккаунтом и owned working context.                                                                                                                                                                                                                                                                                                                                                                                                                                        | Пользователь может работать сам и подключаться к чужим resources через share grants.                                                                                                                                                                                                                           |
| Где живут права доступа в MVP?                                               | В resource-scoped `ShareGrant`, выданном owner через share code / invite code.                                                                                                                                                                                                                                                                                                                                                                                                                    | Capabilities replace roles; default access is view-only and default deny when capability missing.                                                                                                                                                                                                              |
| Что случилось с RBAC role matrix?                                            | Superseded for MVP by `docs/19-sharing-and-access-model-v1.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                   | `Foreman` и `Owner/Admin/PTO Engineer/Viewer` matrix deferred.                                                                                                                                                                                                                                                 |
| Как внедрять auth/sharing дальше?                                            | По `docs/20-auth-sharing-implementation-plan-v1.md`: identity skeleton, system admin marker, owned workspace, workspace share codes/grants, certificate library share codes/grants.                                                                                                                                                                                                                                                                                                               | План защищает workspace isolation and prevents reintroducing complex RBAC.                                                                                                                                                                                                                                     |
| Что уже сделано по Phase 1?                                                  | Backend actor primitive and current actor resolver utility/port.                                                                                                                                                                                                                                                                                                                                                                                                                                  | Missing/disabled actors fail closed; request-body-style claims are ignored; no business access, auth/session, Prisma or routes were added.                                                                                                                                                                     |
| Что уже сделано по Phase 2?                                                  | Optional `SYSTEM_ADMIN_ACTOR_ID` config and framework-free workspace `admin-path` marker utility.                                                                                                                                                                                                                                                                                                                                                                                                 | Missing config means no admin; only the configured active actor is marked; disabled actors and client-supplied admin/role/capability claims do not authorize admin; no business access, workspace ownership, auth/session, Prisma, route or UI was added.                                                      |
| Что уже сделано по Phase 3?                                                  | TypeScript-only `OwnedWorkspace` primitive and framework-free owner-only access utilities.                                                                                                                                                                                                                                                                                                                                                                                                        | Owner can access own workspace; non-owner/missing/disabled/wrong-scope access gets `NOT_FOUND_OR_NOT_AUTHORIZED`; child ids are not resolved before ownership verification; system admin marker and RBAC claims are ignored. No Prisma, migration, route, UI, sharing or business feature was added.           |
| Какая схема данных является baseline перед Backend/API?                      | `docs/12-database-schema-v1.md` как storage-neutral conceptual schema.                                                                                                                                                                                                                                                                                                                                                                                                                            | Она применяет required aggregate/access/ingestion boundaries, но не выбирает SQL, ORM, API или implementation.                                                                                                                                                                                                 |
| Какой follow-up Schema V1 требуется перед Backend/API?                       | `docs/13-domain-lifecycle-immutability-validation-v1.md` как lifecycle/immutability/validation V1 policy.                                                                                                                                                                                                                                                                                                                                                                                         | Фиксирует revisions, evidence lifecycles, numbering, validation, override safety, package determinism и AI review flow; требует review/acceptance.                                                                                                                                                             |
| Какой Backend/API shape следует применять до contracts?                      | `docs/14-backend-api-architecture-v1.md` как conceptual modular-monolith/application boundary.                                                                                                                                                                                                                                                                                                                                                                                                    | Explicit domain commands, UI read models, authoritative validation, version/idempotency and async derived flows; никакого CRUD-first API или code permission.                                                                                                                                                  |
| Какой command/read-model contract применяется до MVP forms?                  | `docs/15-api-command-readmodel-contracts-v1.md` как conceptual contract layer.                                                                                                                                                                                                                                                                                                                                                                                                                    | Envelope/results/errors/async operations, intent semantics, validation findings and UI reads зафиксированы без routes/OpenAPI/code.                                                                                                                                                                            |
| Какой first MVP scope принят к review?                                       | `docs/16-mvp-scope-and-first-forms-v1.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                        | АОСР mandatory first-class form; certificate library, executive schemes, derived registry, package outputs and onboarding hints входят; `TestAct`/`TechnicalReadinessAct`, AI/OCR dependency and enterprise/platform features deferred.                                                                        |
| Какой stack/implementation direction выбран для MVP?                         | `docs/17-tech-stack-and-implementation-strategy-v1.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                           | React/TypeScript/Vite frontend, NestJS modular monolith backend, PostgreSQL, Redis/BullMQ, domain-scoped storage, deterministic DOCX/PDF/ZIP generation, PostgreSQL-first search and optional proposal-only AI/OCR. Feature coding remains blocked without separate explicit task.                             |
| Какие правила первого scaffold действуют?                                    | `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`.                                                                                                                                                                                                                                                                                                                                                                                                                               | First scaffold limited to tooling/app shells/placeholders. Database and object storage foundations now have separately authorized technical health boundaries only; no domain models, migrations, OpenAPI, real auth/uploads/file APIs/queue/generation, AI/OCR or deployment infra without separate approval. |
| Какие ADR являются canonical/accepted?                                       | `docs/adr/0001-structured-data-source-of-truth.md`, `docs/adr/0002-typed-document-domain-model.md`, `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`, `docs/adr/0004-immutable-revisions-and-package-snapshots.md`, `docs/adr/0005-modular-monolith-and-bounded-contexts.md`, `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`, `docs/adr/0007-document-defaults-suggestions-and-controlled-updates.md`.                                                               | Future implementation must comply with these files; they consolidate/record accepted decisions only and do not add feature/code permission.                                                                                                                                                                    |

### 51.1 Accepted ADR register

| ADR      | Решение                                                                                                                                                                                                                                | Статус              |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| ADR 0001 | `docs/adr/0001-structured-data-source-of-truth.md`: structured data являются source of truth; DOCX/PDF/registry/package/generated outputs are derived; no DOCX roundtrip import and no editable-source registry.                       | Принято; canonical. |
| ADR 0002 | `docs/adr/0002-typed-document-domain-model.md`: typed document domain model; AOSR first-class typed document; no generic low-code builder, generic document engine or generic CRUD domain.                                             | Принято; canonical. |
| ADR 0003 | `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`: certificates and executive schemes are file-backed evidence; generated artifacts are derived; no evidence without physical file; storage/provider isolation required.   | Принято; canonical. |
| ADR 0004 | `docs/adr/0004-immutable-revisions-and-package-snapshots.md`: final edits create new revisions; released revisions and package snapshots are immutable; no silent mutation/history rewrite.                                            | Принято; canonical. |
| ADR 0005 | `docs/adr/0005-modular-monolith-and-bounded-contexts.md`: modular monolith first with bounded contexts; no premature microservices/event sourcing/CQRS split; infrastructure adapters isolated.                                        | Принято; canonical. |
| ADR 0006 | `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`: certificates, organizations and representatives are global reusable libraries; objects store assignments/links; immutable evidence and released outputs use snapshots. | Принято.            |
| ADR 0007 | `docs/adr/0007-document-defaults-suggestions-and-controlled-updates.md`: object templates and libraries are live for `linked` acts; `manual` acts use one complete snapshot; partial template overrides are forbidden.                 | Принято; canonical. |

### 51.2 Boundary baseline applied in Conceptual Database Schema V1

| Вопрос границы                                          | Draft baseline в `docs/09-aggregate-boundaries-and-invariants.md`              | Причина                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Является ли `FolderTree` отдельным aggregate?           | Да, object-scoped aggregate root.                                              | Tree operations имеют собственные инварианты и не должны менять `Object` или document content.       |
| Является ли `WorkItem` отдельным aggregate root для V1? | Нет; meaning работы, утверждаемой актом, принадлежит typed `Document` payload. | Shared work lifecycle ещё не подтверждён; released act должен быть автономно воспроизводим.          |
| Где живёт `ProjectDrawingSet`?                          | Owned entity в `ObjectDocumentationContext`.                                   | Это общий проектный basis объекта, не file-backed as-built evidence и пока не независимый lifecycle. |

Эти решения по заданию владельца проекта применены в `docs/12-database-schema-v1.md` как conceptual schema baseline. Их будущая замена или расширение требует явного решения; ADR 0001-0005 они не изменяют.

### 51.3 MVP sharing/access baseline superseding RBAC

| Access question                                 | Baseline в `docs/19-sharing-and-access-model-v1.md`                                                                              | Причина                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Нужен ли complex RBAC для MVP?                  | Нет; role matrix из `docs/10` superseded for MVP.                                                                                | Simple UX and lower governance surface for first product scope.  |
| Кто администрирует систему?                     | Exactly one `Global System Admin`, controlled by deployment/config, separate from business collaboration.                        | Support/admin path не должен становиться обычным workspace role. |
| Кто владеет данными?                            | Regular user owns own workspaces/project data and certificate libraries.                                                         | Ownership remains clear without organization governance.         |
| Как выдать доступ к workspace/project database? | Owner creates opaque share code, selects capabilities, authenticated user accepts, persistent `WorkspaceShareGrant` is created.  | Rights are explicit and resource-scoped.                         |
| Как выдать доступ к certificate library?        | Separate certificate library share/connect flow creates `CertificateLibraryShareGrant`.                                          | Library sharing is not workspace collaboration.                  |
| Какая default permission?                       | View-only for workspace; view/use-only for certificate library according to selected preset.                                     | Least authority and safer sharing.                               |
| Что заменяет роли?                              | Explicit `GrantCapability` values such as `view_documents`, `edit_documents`, `build_packages`, `use_certificates_in_documents`. | Owner chooses actions directly; default deny when missing.       |
| Что сохраняется из старой модели?               | Tenant/workspace isolation, opaque token safety, auditability and revocation.                                                    | Security guardrails remain mandatory.                            |

Previous membership/RBAC governance is deferred. `docs/10-auth-workspace-rbac-model.md` remains historical/deferred context, but MVP access implementation must follow `docs/19-sharing-and-access-model-v1.md`.

Implementation sequence is fixed in `docs/20-auth-sharing-implementation-plan-v1.md`. Phase 1 user identity skeleton, Phase 2 global system admin marker and Phase 3 owned workspace baseline are now introduced; future coding must continue with a separate Phase 4 workspace share codes task, then workspace share grants, certificate library share codes and certificate library share grants.

### 51.4 AI project ingestion/assistance baseline applied in Conceptual Database Schema V1

| Ingestion question                                | Draft baseline в `docs/11-ai-project-ingestion-and-assistance-model.md`                                                                              | Причина                                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Где живут uploaded project files?                 | Каждый source file scoped to one `Workspace` and one `Object`.                                                                                       | Project content должен соблюдать tenant isolation и object context.                                |
| Становится ли загруженный проект source of truth? | Он является source material/provenance, но confirmed structured data and relations остаются source of truth.                                         | Нельзя заменить domain model файлом или AI interpretation.                                         |
| Что может сделать AI/OCR?                         | Создать extraction proposals и consistency findings with source citations.                                                                           | AI помогает анализу, но не утверждает инженерный факт.                                             |
| Как proposal влияет на ИД?                        | Только после user confirmation, permission checks, validation and audit appropriate to target owner.                                                 | Документы/evidence/released history должны оставаться контролируемыми.                             |
| Какие связи поддерживаются концептуально?         | Project context может предлагать ссылки к `ProjectDrawingSet`, document-owned work, `AOSR`, `TestAct`, evidence expectations and scheme comparisons. | Project file не становится `Certificate` или `ExecutiveScheme` и не нарушает ownership boundaries. |

Этот baseline развивает принятые правила structured source of truth, AI assistant only и tenant isolation и отражён project-source/proposal/finding/citation table families Schema V1. Privacy/data-processing, source citation, access/audit and MVP material scope требуют review перед Backend/API Architecture; новый ADR не требуется.

### 51.5 Lifecycle/immutability/validation follow-up documented after Schema V1 review

| Review topic                         | V1 policy в `docs/13-domain-lifecycle-immutability-validation-v1.md`                                                                                                | Что не утверждается этим решением                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Document lifecycle and final editing | `final` is validated published revision; correction creates next revision, invalidates current package use and preserves immutable historical revision.             | Concrete first act forms/required field sets.                               |
| Evidence and historical immutability | `Certificate`/`ExecutiveScheme` are file-backed; historical file references and released package snapshots cannot be silently overwritten.                          | Full retention/legal/privacy/access policy.                                 |
| Numbering                            | Object/folder scope, structured prefix/sequence/suffix/rendered value, renumber, move choice and clone strategies are required.                                     | API/transaction/collision implementation details.                           |
| Validation                           | `ERROR` blocks relevant final/build release, `WARNING` does not by baseline; certificate expiry is evaluated by document date; missing certificate file is `ERROR`. | Customer-specific readiness strengthening and exact typed-form rules.       |
| Registry override                    | Presentation/configuration only; source fact changes and hiding domain errors are forbidden; `custom_display_title` is deferred.                                    | Physical persistence/UI/export scope.                                       |
| Package determinism                  | Async builds produce immutable dependency-manifest snapshots; changed dependencies require new build/snapshot.                                                      | Queue, renderer, storage and binary-reproducibility mechanism.              |
| AI/OCR review                        | Proposals/findings retain citations, confidence, extractor/model/version and review state; explicit user acceptance is mandatory.                                   | Provider, consent/privacy, supported processing scope and retention period. |
| FolderTree boundary                  | Business collection and cloning boundary only; it never owns document lifecycle or becomes a generic drive.                                                         | Broader UX details.                                                         |

Этот follow-up стал policy input для созданного по прямому переходу владельца проекта Backend/API Architecture V1. Он конкретизирует existing guardrails, не изменяя ADR 0001-0005 и не разрешая implementation.

### 51.6 Backend/API Architecture V1 documented for review

| Architecture topic      | V1 direction в `docs/14-backend-api-architecture-v1.md`                                                                                                                                          | What remains open                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Deployment/module shape | Modular monolith first with bounded modules for tenant, object, folders, typed documents, evidence, schemes, registry, package, templates, artifacts, sources, AI, validation, search and audit. | Framework/runtime/deployment and later split criteria.                     |
| Mutation API            | Explicit PTO domain commands instead of CRUD/table endpoints or generic document/file APIs.                                                                                                      | Exact command payload/result and transport route contracts.                |
| Query API               | UI-oriented read models for editor, pickers, registry, package, validation, artifacts, AI queue, activity and search.                                                                            | Exact fields, pagination/filtering and frontend state.                     |
| Consistency/versioning  | Atomic document release and successful snapshot creation; eventual derived generation/search/AI; optimistic versions, immutable references and stale markers.                                    | Persistence/transaction/lock implementation and user conflict UX.          |
| Validation and outputs  | Server-authoritative gates, async package/artifact workflows, no mutation from outputs or AI.                                                                                                    | Renderer/storage/queue/AI policy and first form readiness details.         |
| Authorization           | Every command/query scoped through workspace membership and object context where applicable.                                                                                                     | Fine-grained RBAC, sensitive download/access and invite/governance detail. |

Документ подготовлен для review и не разрешает coding, backend scaffold, SQL/migrations/ORM, physical API implementation или technology/provider choices. После его принятия рекомендуемый следующий этап — `docs/15-api-command-readmodel-contracts-v1.md`.

### 51.7 API Command/Read Model Contracts V1 documented for review

| Contract topic                    | V1 direction в `docs/15-api-command-readmodel-contracts-v1.md`                                                                                                  | What remains open                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Common command/outcome vocabulary | Commands are scoped by workspace/object/membership, versions and idempotency; results expose affected ids, findings, invalidations, async and audit references. | Transport/serialization/auth implementation and client UX details.                                  |
| Errors and async work             | Named error contract covers validation/conflict/access/idempotency/policy/file/override failures; package/artifact/AI/index operations never mutate sources.    | Queue/runtime/provider/failure telemetry and privacy policy.                                        |
| Domain command intents            | Typed documents, folders/numbering, evidence/schemes, registry, packages, artifacts, AI/OCR and invites have payload/result semantics.                          | Concrete first typed forms, detailed permissions and retention/correction policy.                   |
| Read models and validation        | Main PTO screens and `ValidationFinding` fields/gates/provenance are defined; registry/read outputs remain derived.                                             | Frontend implementation, search/index policy and customer-specific acknowledgement/readiness rules. |
| Versioning/authorization          | Working versus immutable references, idempotent dangerous commands, tenant/object scope and leakage protection are explicit.                                    | Fine-grained RBAC, original-file access, cross-workspace export and physical enforcement.           |

Документ подготовлен для review и не разрешает production code, backend/frontend scaffold, SQL/migrations/ORM, OpenAPI, concrete routes или technology/provider choices. После его принятия рекомендуемый следующий этап — `docs/16-mvp-scope-and-first-forms-v1.md`.

### 51.8 MVP Scope and First Forms V1 documented for review

| MVP topic              | V1 direction в `docs/16-mvp-scope-and-first-forms-v1.md`                                                                                  | What remains open                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| First production scope | АОСР is mandatory first-class typed form; first workflow runs object -> AOSR -> evidence/schemes -> registry -> package output.           | Review/acceptance of scope and exact first template baseline.            |
| First evidence scope   | Certificate library and ExecutiveScheme are file-backed MVP foundations; certificate numbers cannot be standalone truth.                  | Detailed retention/supersession/privacy and original-file access policy. |
| Deferred forms         | `TestAct` family and `TechnicalReadinessAct` are not first generated/finalizable typed forms without separate concrete form ratification. | Which exact test act enters a later release.                             |
| Generated outputs      | AOSR DOCX/PDF, registry export and ZIP package are MVP outputs; template marketplace and visual editor are excluded.                      | Rendering/storage/queue/template implementation in later tech strategy.  |
| AI/OCR policy          | MVP must work without AI/OCR; any AI/OCR remains optional/deferred, proposal-only and never autonomous.                                   | Approved processing/provider/privacy policy before real file processing. |
| UX/onboarding          | First-run guidance, contextual hints/tooltips, empty states, validation explanation and "do not show again" are MVP UX decisions.         | Exact frontend state, lock/autosave UX and component implementation.     |

Документ подготовлен для review и не разрешает production code, backend/frontend scaffold, SQL/migrations/ORM, OpenAPI, concrete routes или database/provider/renderer/queue/AI choices. После его принятия рекомендуемый следующий этап — `docs/17-tech-stack-and-implementation-strategy-v1.md`.

### 51.9 Tech Stack and Implementation Strategy V1 documented for review

| Implementation topic   | V1 direction в `docs/17-tech-stack-and-implementation-strategy-v1.md`                                                                                         | What remains open                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Frontend               | React + TypeScript + Vite; React Hook Form, TanStack Query/Table, restrained UI primitives and backend-authoritative validation UX.                           | Actual scaffold, exact component library styling, route structure and frontend implementation.                                |
| Backend                | TypeScript on Node.js LTS with NestJS modular monolith and HTTP JSON command/query API.                                                                       | Actual app scaffold, concrete controllers/routes, OpenAPI and module code.                                                    |
| Database               | PostgreSQL, controlled JSONB, explicit transactions, optimistic versions and immutable snapshots; Prisma-style TypeScript persistence likely after bootstrap. | Physical ORM schema, migrations, indexes and production mapping.                                                              |
| Async/files/generation | Redis/BullMQ workers, domain-scoped storage, DOCX templates, backend PDF conversion and ZIP package snapshots.                                                | Installed dependencies, converter packaging, storage provider config and generation code.                                     |
| Search and AI          | PostgreSQL relational/full-text/trigram search first; semantic/vector search deferred; AI/OCR optional proposal-only.                                         | Provider/privacy policy, exact processing scope and future indexing architecture.                                             |
| Coding gate            | Recommended milestones are documented, but coding/scaffold remains blocked.                                                                                   | Review/acceptance of `docs/17` and creation/acceptance of `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`. |

Документ подготовлен для review и не разрешает production code, backend/frontend scaffold, source folders, package manifests, SQL/migrations/ORM, OpenAPI, Docker/CI/deployment files или repository bootstrap. После его принятия рекомендуемый следующий этап — `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`.

### 51.10 Initial Repository Bootstrap and Development Rules V1 documented for review

| Bootstrap topic            | V1 direction в `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`                                                                                      | What remains open                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Coding preconditions       | Docs/18 acceptance and a separate explicit first scaffold task are required.                                                                                           | Actual scaffold execution.                                                                    |
| First scaffold scope       | Only tooling, app shells, placeholders, local scripts and optional CI gates are allowed.                                                                               | Feature implementation requires a separate explicit task and ADR compliance check.            |
| Scope corruption controls  | Docs/16 overrides older docs/08 TestAct candidate wording; Foreman active permissions blocked; AOSR participant requirements not hardcoded before template review.     | Template review and later permission policy.                                                  |
| Architecture invariants    | Structured data source of truth, typed AOSR first, registry derived, immutable snapshots/revisions, AI proposal-only, modular monolith and no cross-workspace leakage. | Concrete implementation details.                                                              |
| Infrastructure portability | Deployment provider is replaceable; server-specific assumptions, hardcoded hosts/paths and provider SDK leakage outside infrastructure adapters are forbidden.         | Concrete deployment provider/config values.                                                   |
| ADR handling               | Accepted ADR files in `docs/adr/` are authoritative implementation references.                                                                                         | Future implementation must comply; changing accepted principles requires explicit ADR review. |

Документ подготовлен для review и не разрешает production code/scaffold by itself. После его принятия следующий шаг — отдельное явно ограниченное first scaffold task; feature coding remains blocked until scaffold is accepted.

---

## 52. Open Questions Still Not Solved

Следующие вопросы не отменяют принятые выше принципы. Их нельзя решать случайным кодом: они требуют спецификации, пользовательского выбора и, где необходимо, ADR.

Lifecycle/immutability, structured numbering, validation baseline, package determinism и AI/OCR review boundary документированы в `docs/13-domain-lifecycle-immutability-validation-v1.md`. Backend module/consistency boundaries документированы в `docs/14-backend-api-architecture-v1.md`. Conceptual command/read-model/error/async/version/scope contracts документированы в `docs/15-api-command-readmodel-contracts-v1.md`. First product/MVP scope documented in `docs/16-mvp-scope-and-first-forms-v1.md` narrows the first delivery to AOSR, evidence, schemes, registry, package outputs and AI-optional UX. Practical implementation direction documented in `docs/17-tech-stack-and-implementation-strategy-v1.md` selects the boring stack and first milestone order. Initial bootstrap rules in `docs/18-initial-repository-bootstrap-and-development-rules-v1.md` define the final pre-scaffold gate and still require a separate explicit scaffold task. Вопросы ниже сохраняют детализацию accepted first template, policy и physical implementation, которую эти conceptual/product/strategy/governance documents намеренно не утверждают.

### 52.1 Domain scope and typed schemas

- Какие конкретные формы АОСР и акты испытаний входят в первый MVP?
- Какова typed schema для `TECHNICAL_READINESS_ACT`, обнаруженного в реестре?
- Насколько структурировать описание работы, оси, этажи, отметки и нормативные ссылки в первой версии?
- Является ли `Material` обязательным каталогом MVP или достаточно `MaterialUsage` внутри typed documents со ссылками на сертификаты?
- Как учитывать оборудование отдельно от материалов?
- Какой набор участников и подписей обязателен для первых типов документов?

### 52.2 Aggregate and storage design

- Object/folder numbering scope, explicit move renumber choice, folder-clone strategies and conceptual command outcomes уже документированы в V1; открыта их future physical transaction/persistence/UI реализация.
- Требуется ли когда-либо пересмотреть применённый Schema V1 baseline отдельного object-scoped `FolderTree`?
- Нужен ли после baseline без самостоятельного `WorkItem` root shared work lifecycle и отдельный aggregate в следующем scope?
- Нужен ли `ProjectDrawingSet`, применённому как owned entity `ObjectDocumentationContext`, позднее отдельный lifecycle/versioning?
- Достаточна ли включённая в Schema V1 workspace-scoped representative library вместе с immutable output snapshots?
- Нужен ли reusable `Material`/equipment catalog или достаточно document-owned `MaterialUsage` в первом scope?
- Каковы production physical mapping, indexes, constraints, typed payload persistence strategy, tenant policies и soft-delete rules?
- Как хранить originals, generated artifacts, package snapshots и build logs в cloud-agnostic storage?
- Какие retention и hard-delete правила нужны для юридически/исторически значимых файлов?

### 52.3 Lifecycle, versioning and collaboration

- Baseline lifecycle для typed documents, evidence, packages и artifacts, включая editable `final` через новую revision и immutable historical output, документирован в `docs/13-domain-lifecycle-immutability-validation-v1.md`.
- Нужны ли дополнительные approval/signature/ЭЦП statuses сверх документированного V1 lifecycle в будущем?
- Каков UX хранения/отмены unpublished working revision и autosave recovery после исправления final?
- Каков UX и policy конфликтов locks: TTL, override permission, потеря соединения и восстановление drafts?
- Требуется ли multi-user beyond locks в будущем и будет ли он вообще допустим для MVP?
- Каковы полные retention/legal/privacy/access rules для superseded certificate/scheme/source originals, при том что historical package references уже запрещено перезаписывать?

### 52.4 Templates and generation

- Freeze template versions и dependency-manifest deterministic package rebuild документированы в V1; ниже остаются механизмы реализации.
- Какой template engine поддержит DOCX placeholders, повторяющиеся таблицы, preview compatibility и object-level variants?
- Как соотносятся data version, document revision, template version и generated artifact identity?
- Как генерируется PDF и как обеспечивается воспроизводимость старого вывода?
- Как устроены package async queue, rebuild dependency graph, PDF merge, retry/failure recovery и snapshot storage?

### 52.5 Registry, search and UX

- Разрешенная presentation-only surface `RegistryOverride`, запрет скрытия domain errors и conceptual command/read-model fields документированы в V1; какова их physical implementation и exact MVP export/UI scope?
- Какие реестры и экспортные формы входят в MVP?
- Разрешено ли inline editing через registry UI как команда изменения исходной сущности, и для каких полей?
- Как спроектировать global/object/folder search, filters и индексирование?
- Как UI показывает stale generated artifacts, warnings, incomplete packages и результат OCR confirmation?

### 52.6 Access, privacy and integrations

- Single-use или multi-use share codes входят в MVP, и какие default expiration нужны для workspace и certificate library codes?
- Можно ли owner менять capabilities существующего grant, или нужно revoke/reissue?
- Какие действия по write capabilities требуют дополнительного owner notification?
- Какой exact session/cache invalidation mechanism нужен для revocation?
- Какие privacy/access/audit requirements предъявляются к real certificate originals, schemes и personal representative data under share grants?
- Допустимы ли когда-либо controlled copy/transfer/export data между личным и organizational workspace или между организациями?
- Нужны ли ЭЦП/юридически значимое подписание, импорт legacy DOCX/PDF, BIM/CAD/ERP integrations, public API или offline mode, и только на каком последующем этапе?

### 52.7 AI project ingestion and assistance

- Mandatory proposal/review/accept-or-reject flow, provenance fields and no-auto-approval rule документированы в V1; ниже остаются supported scope и operating policy.
- Какие PDF project materials и specifications входят в первый supported source scope, а какие форматы остаются deferred?
- Как пользователь управляет заменой/supersession project source files и staleness ранее созданных proposals?
- Какая granular source citation достаточна для extracted data и inconsistency findings?
- Какие роли вправе upload, process, review, confirm/dismiss и видеть sensitive project originals/extracted content?
- Какие AI-assisted checks после подтверждения являются hints/warnings, а какие могут стать formal domain validation rules?
- Какова approved privacy/data-processing policy до анализа реального проекта AI/OCR?

### 52.8 Technology decisions explicitly deferred

До отдельных решений остаются невыбранными:

- backend/frontend stack;
- база данных и миграции;
- physical API transport/serialization, repository implementation and frontend state mapping;
- dependency/tooling strategy;
- Docker, deployment и CI/CD;
- OCR/AI provider and data-processing policy.

Пока эти вопросы открыты, агент не должен создавать реализационные файлы, выдавая выбор технологии за уже принятое решение.

---

## 53. Architectural Progress Log

Policy:

- Каждый крупный архитектурный документ должен попадать в этот log.
- `PROJECT_MEMORY.md` всегда должен отражать актуальное состояние архитектуры.
- После нового архитектурного решения нужно обновлять:
  1. соответствующий документ;
  2. `PROJECT_MEMORY.md`;
  3. `CONVERSATION_QA_LOG.md`, если решение принято в обсуждении;
  4. ADR, если решение меняет архитектурный принцип.

### 2026-05-26 — docs/PROJECT_MEMORY.md

- Статус: `active`
- Описание: consolidated single source of truth for PTO ID System.

### 2026-05-26 — Data Model V1 specification created

- Документ: `docs/06-data-model-v1.md`
- Статус: `draft`
- Описание: formal domain model and aggregate design specification for PTO ID System.

Создана первая формальная спецификация модели данных:

```text
docs/06-data-model-v1.md
```

Зафиксированный прогресс:

- принятые архитектурные правила преобразованы в каталог aggregate roots, candidate boundaries, entities и value objects;
- формализованы ownership rules и lifecycle ownership без выбора физического хранения;
- описаны snapshot model и revision model, включая правило `final` document edit -> new revision и invalidation зависимых package snapshots;
- закреплены file ownership rules для сертификатов, исполнительных схем, шаблонов и generated artifacts;
- формализованы модели `Certificate`, `ExecutiveScheme`, `Package` и `RegistryProjection`;
- составлена relationships matrix;
- разделены MVP scope, deferred scope и вопросы, требующие подтверждения владельца проекта.

Что не было принято или реализовано этим этапом:

- физическая схема БД, SQL или ORM;
- backend/frontend stack;
- API;
- механизм хранения файлов;
- очередь package builds;
- template/OCR implementation;
- любой программный код продукта.

Текущий статус:

```text
Data Model V1 documented; open aggregate and MVP decisions require review before implementation design.
```

### 2026-05-26 — AOSR domain specification created

- Документ: `docs/07-aosr-domain-specification.md`
- Статус: `draft`
- Описание: first formal typed-document domain specification for AOSR, including blocks, validation, snapshots, revisions, registry projection and package interaction.

Зафиксированный прогресс:

- АОСР описан как `AOSRPayload` внутри aggregate root `Document`, а не как файл или generic form;
- формализованы header, work, participants, materials, certificate, executive scheme и attachments blocks;
- определены inherited validation invariants и draft baseline для `ERROR`, `WARNING` и `INFO`;
- описаны rendering, snapshot, revision, registry, package и audit rules;
- обязательности, не утверждённые ранее (например, точный состав подписантов и обязательность схемы для каждого случая), оставлены открытыми для ратификации.

Что не было изменено этим этапом:

- принятые архитектурные принципы ADR 0001-0005;
- база данных, API, frontend или технологический стек;
- правила, требующие отдельного решения владельца проекта по обязательной форме АОСР.

### 2026-05-26 — Document types catalog created

- Документ: `docs/08-document-types-catalog.md`
- Статус: `draft`
- Описание: catalog of typed acts, evidence items, registry projection and package outputs for MVP-oriented design and future extension.

Зафиксированный прогресс:

- перечислены обязательные для рассмотрения categories: AOSR, test acts, schemes, quality evidence, registry and package;
- специализированные акты испытаний (`HydraulicTestAct`, `PressureTestAct`, `FlushingAct`) обозначены как MVP candidates, а не молча утверждённый первый состав;
- `TechnicalReadinessAct` сохранён как deferred typed document candidate до определения schema;
- `Declaration` и `Passport` классифицированы как file-backed quality evidence kinds в текущей Certificate Library model;
- для каждого type описаны source of truth, базовые fields/links, validation, registry/package and template behavior, snapshots/revisions и open questions.

Что не было принято этим этапом:

- окончательный список typed documents первого MVP;
- новые фундаментальные архитектурные принципы или изменения ADR;
- технические решения по хранению, API, стеку или генерации.

### 2026-05-26 — Aggregate boundaries and invariants specification created

- Документ: `docs/09-aggregate-boundaries-and-invariants.md`
- Статус: `draft`
- Описание: formal ownership, aggregate root, invariant, revision and invalidation specification before Database Schema V1.

Зафиксированный прогресс:

- систематизированы aggregate roots, owned entities, value/snapshot/projection и operational boundaries;
- подробно закреплено, почему `Object` не поглощает independent document/evidence/template/package lifecycles;
- сформулированы allowed/forbidden operations, cross-aggregate reference rules, package and registry invalidation triggers;
- установлен draft baseline: `FolderTree` как отдельный object-scoped aggregate root;
- установлен draft baseline: work meaning первого scope принадлежит typed `Document`, а самостоятельный `WorkItem` root не вводится без подтверждённого shared workflow;
- установлен draft baseline: `ProjectDrawingSet` является owned entity `ObjectDocumentationContext`, отличной от `ExecutiveScheme`;
- подтверждено, что `DocumentLock` является operational lease и не увеличивает document revision.

Что требует ратификации перед Database Schema V1:

- перечисленные boundary baseline choices;
- точный MVP document type/validation scope;
- границы reusable representatives/materials;
- evidence replacement/retention, registry override scope и package readiness rules.

Что не было изменено этим этапом:

- фундаментальные принципы ADR 0001-0005;
- физическая база данных, API, стек, миграции или implementation artifacts.

### 2026-05-26 — Auth, workspace and RBAC model created

- Документ: `docs/10-auth-workspace-rbac-model.md`
- Статус: `draft`
- Описание: formal access, tenant-boundary, invitation, membership and role specification before Database Schema V1.
- Текущий статус после 2026-05-29: superseded for MVP implementation scope by `docs/19-sharing-and-access-model-v1.md`; role matrix deferred.

Зафиксированный прогресс:

- `Workspace` формализован как tenant boundary для domain data и workspace-scoped authorization;
- определены `Personal Workspace` и `Organization Workspace`, включая автоматическое создание полноценного personal tenant при регистрации;
- права закреплены за `Membership`, а не за глобальным `User`;
- описаны invitation/join flow, включая правило, что invite URL не содержит доверенных прав;
- сформирован permission baseline ролей `Owner`, `Admin`, `PTO Engineer`, `Foreman` и `Viewer`;
- определены cross-workspace isolation, audit, security и SaaS commercial readiness guardrails.

Что требует ратификации перед Database Schema V1:

- workspace lifecycle/ownership continuity и organization creation governance;
- detailed permission scope, evidence/privacy/download and lock override rules;
- invite modes, expiration/revocation/email-verification and multi-use policy;
- cross-workspace copy/transfer/export and commercial entitlement boundaries;
- обязательный состав audit events и retention requirements.

Что не было изменено этим этапом:

- фундаментальные принципы ADR 0001-0005;
- физическая база данных, API, стек, миграции или implementation artifacts.

### 2026-05-27 — AI project ingestion and assistance model created

- Документ: `docs/11-ai-project-ingestion-and-assistance-model.md`
- Статус: `draft`
- Описание: architectural model for Workspace/Object-scoped project source uploads and assistant-only AI proposals for ID preparation and error checking before Database Schema V1.

Зафиксированный прогресс:

- project source files определены как object/workspace-scoped originals and provenance, но не как единственный source of truth;
- закреплено, что source of truth остаётся за confirmed structured data и explicit domain relations;
- описаны future source types, включая PDF, DWG/DXF future scope, DOCX/XLSX, scanned PDFs, specifications and drawings;
- определены extraction proposals, inconsistency findings, source citations, human confirmation and audit requirements;
- описаны связи source materials с `Object`, `ProjectDrawingSet`, document-owned work statement, `AOSR`, `TestAct`, `Certificate` и `ExecutiveScheme`;
- установлены privacy/security and tenant isolation guardrails для originals, extracted content and AI results;
- Database Schema V1 перенесён на планируемый путь `docs/12-database-schema-v1.md`, чтобы до него учесть ingestion baseline.

Что требует ратификации перед Database Schema V1:

- first supported project material scope, source-file lifecycle and citation granularity;
- permissions for upload/processing/review/confirmation and access to originals/extracted content;
- privacy/data-processing policy before any real AI/OCR processing;
- staleness, finding severity and audit/retention requirements.

Что не было изменено этим этапом:

- фундаментальные принципы ADR 0001-0005: AI по-прежнему только assistant, structured data остаются source of truth;
- AI/OCR provider, physical storage, база данных, API, SQL, стек, зависимости или implementation artifacts.

### 2026-05-27 — Database Schema V1 created

- Документ: `docs/12-database-schema-v1.md`
- Статус: `conceptual schema baseline for review before Backend/API Architecture`
- Описание: storage-neutral logical table, relationship, constraint, indexing and scope specification based on the required aggregate, access and project-ingestion baselines.

Зафиксированный прогресс:

- `Workspace`, `Membership` and stored opaque-token `Invite` представлены как tenant/access schema family без предоставления прав через `User` или URL;
- `Object`, отдельный `FolderTree`, object-owned `ProjectDrawingSet` и отсутствие самостоятельного `WorkItem` root применены как V1 boundary baseline;
- описаны typed `Document`/`AOSR` content, revisions, representative snapshots, validation and operational lock boundaries;
- представлены file-backed `Certificate` and `ExecutiveScheme`, storage-neutral `FileAsset`, immutable-used `TemplateVersion` and derived `GeneratedArtifact` provenance;
- представлены project source files, AI extraction/finding proposals, source citations and human confirmation boundary;
- `RegistryProjection` сохранён derived, `RegistryOverride` ограничен presentation/configuration, а `PackageBuild`/`PackageSnapshot` сохранены async/snapshot-based;
- собраны key relationships, constraints/invariants, indexing considerations, MVP/deferred scope and questions required before Backend/API Architecture.

Открыто перед Backend/API Architecture:

- concrete AOSR/TestAct typed validation and first MVP forms;
- evidence/project-source retention, supersession and sensitive-file access rules;
- invite/ownership/privacy/package readiness and AI processing policies;
- transaction/query/concurrency boundaries and any production physical mapping.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005 и фундаментальные source-of-truth/typed/registry/template/package/AI guardrails;
- production SQL, migrations, ORM, database vendor, API, backend/frontend, dependencies, Docker or CI.

### 2026-05-27 — Domain Lifecycle, Immutability and Validation V1 created after Schema V1 review

- Документ: `docs/13-domain-lifecycle-immutability-validation-v1.md`
- Статус: `conceptual/storage-neutral follow-up for review before Backend/API Architecture`
- Описание: policy layer closing lifecycle, historical immutability, numbering, validation, registry override safety, package determinism, AI/OCR review and FolderTree boundary gaps identified after Schema V1.

Зафиксированный прогресс:

- defined lifecycle transitions for typed documents, `Certificate`, `ExecutiveScheme`, `PackageBuild`/`PackageSnapshot` and generated artifacts;
- закреплено, что `final` документ исправляется новой revision, тогда как published revision и released package snapshot остаются immutable;
- описаны historical rebuild manifest requirements: frozen document revisions, evidence file references, scheme references, template versions, object/company snapshots, registry override version and package ordering;
- формализованы object/folder numbering, renumber, move decision and folder-clone numbering strategies;
- формализованы `ERROR`/`WARNING` validation gates, включая `ERROR` для certificate number without physical file и проверку expiry относительно даты документа;
- ограничен `RegistryOverride` presentation/configuration surface с запретом подмены source facts и скрытия domain errors;
- определены async package determinism и mandatory human-reviewed AI/OCR proposal flow;
- подтверждена граница `FolderTree` как business collection, не generic file manager.

Открыто перед Backend/API Architecture:

- acceptance/review настоящего follow-up документа;
- concrete first typed forms/required fields and customer-specific readiness policy;
- retention/privacy/access/RBAC/governance и AI-processing policy;
- template/rendering/storage/queue, API/transaction/read-model and physical database implementation choices.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005 и существующие structured-data/file-backed-evidence/derived-registry принципы;
- production SQL, migrations, ORM, API, backend/frontend, renderer, storage provider, queue, AI provider, dependencies, Docker or CI.

### 2026-05-27 — Backend/API Architecture V1 created

- Документ: `docs/14-backend-api-architecture-v1.md`
- Статус: `conceptual backend/API architecture for review before API Command/Read Model Contracts V1`
- Описание: application-level modular architecture applying Schema V1 and lifecycle policies without production code or technology selection.

Зафиксированный прогресс:

- определён modular monolith first с bounded modules для identity/workspace/object/folders, typed documents, evidence/schemes, registry/packages, templates/artifacts, project sources/AI review, validation, search and audit;
- mutations выражены explicit domain commands, а UI reads — отдельными read-model families для АОСР, certificate/scheme picker, registry preview, Package Builder, validation, AI review и activity/search;
- сформулированы atomic revision/snapshot transitions и eventual registry/generation/search/AI processing, optimistic concurrency, immutable references, stale markers and idempotency requirements;
- применены backend-authoritative validation rules, включая certificate-by-document-date, запрет `RegistryOverride` подавлять ошибки и human accept/reject для AI/OCR;
- закреплены tenant-safe command/query scope и отсутствие generic CRUD API, generic document builder или generic file drive.

Открыто перед следующим этапом:

- review и принятие `docs/14-backend-api-architecture-v1.md`;
- exact command/read-model contracts в рекомендуемом `docs/15-api-command-readmodel-contracts-v1.md`;
- concrete typed form scope, RBAC/privacy/retention/governance and AI processing policy;
- physical persistence/API transport, renderer/storage/queue/provider and frontend decisions.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005, Schema V1 and lifecycle/immutability principles;
- production code, backend/frontend scaffold, SQL, migrations, ORM, concrete routes/OpenAPI, database, renderer, storage provider, queue or AI provider.

### 2026-05-27 — API Command/Read Model Contracts V1 created

- Документ: `docs/15-api-command-readmodel-contracts-v1.md`
- Статус: `conceptual contract specification for review before MVP Scope and First Forms V1`
- Описание: application-level command, result, error, async-operation, validation and read-model contract vocabulary applying Backend/API Architecture V1 without transport or implementation decisions.

Зафиксированный прогресс:

- определены common command envelope and result semantics, including workspace/object membership scope, expected versions, idempotency, invalidations and audit references;
- описаны error contract and async operation contract for package build, artifact generation, AI/OCR/source processing and indexing without source mutation;
- детализированы intent-level commands для typed documents, numbering/folders, evidence/schemes, registry, packages, artifacts, AI/OCR proposals and membership/invites;
- зафиксированы screen-oriented read models для основного PTO workflow и explainable validation finding contract;
- сохранены immutable released revisions/snapshots/template/evidence references, presentation-only registry overrides, assistant-only AI and tenant leakage protection.

Открыто перед следующим этапом на момент создания документа:

- review и принятие `docs/15-api-command-readmodel-contracts-v1.md`;
- concrete MVP typed forms/required fields and exact first validation scope, subsequently addressed for review in `docs/16-mvp-scope-and-first-forms-v1.md`;
- retention/privacy/RBAC/governance/AI-processing policies and later physical implementation choices.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005, Schema V1, lifecycle policy and Backend/API module boundaries;
- production code, backend/frontend scaffold, SQL, migrations, ORM, OpenAPI, concrete routes, database, renderer, storage provider, queue or AI provider.

### 2026-05-28 — MVP Scope and First Forms V1 created

- Документ: `docs/16-mvp-scope-and-first-forms-v1.md`
- Статус: `product/MVP-scope specification for review before technology selection and implementation strategy`
- Описание: first production-usable MVP boundary focused on AOSR, file-backed evidence, executive schemes, registry, package outputs and simple UX without implementation choices.

Зафиксированный прогресс:

- определено, что `AOSR` является mandatory first-class typed form первой production delivery;
- `TestAct` family и `TechnicalReadinessAct` оставлены limited/deferred до отдельной ратификации concrete form, payload, template and validation;
- certificate library MVP and executive schemes MVP зафиксированы как file-backed evidence, required for AOSR/package correctness;
- folder/numbering, registry, package builder and generated output MVP rules narrowed to first usable workflow;
- AI/OCR explicitly not required for MVP; product must work fully with manual entry and confirmed structured data;
- onboarding/contextual hints, empty states, validation explanation UX and "do not show again" behavior added as MVP UX decisions;
- explicit large non-MVP list documented to prevent ERP/ECM/platform/generic-builder scope creep.

Открыто перед следующим этапом:

- review и принятие `docs/17-tech-stack-and-implementation-strategy-v1.md`;
- exact first AOSR template baseline and required participant set;
- retention/privacy/RBAC/governance policy details required before implementation;
- initial repository bootstrap and development rules in proposed `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005, Schema V1, lifecycle policy, Backend/API Architecture V1 and API Command/Read Model Contracts V1;
- production code, backend/frontend scaffold, SQL, migrations, ORM, OpenAPI, concrete routes, database, renderer, storage provider, queue, AI provider or dependency strategy.

### 2026-05-28 — Tech Stack and Implementation Strategy V1 created

- Документ: `docs/17-tech-stack-and-implementation-strategy-v1.md`
- Статус: `implementation-strategy specification for review before initial repository bootstrap and development rules`
- Описание: pragmatic MVP stack and implementation plan focused on forms, validation, DOCX/PDF generation, package builds, file-backed evidence and small-team maintainability.

Зафиксированный прогресс:

- выбран frontend direction: React + TypeScript + Vite, React Hook Form, TanStack Query/Table and restrained UI primitives for large validation-heavy PTO workflows;
- выбран backend direction: TypeScript on Node.js LTS, NestJS modular monolith and HTTP JSON command/query API without CRUD-first or OpenAPI-first implementation;
- выбран persistence direction: PostgreSQL, controlled JSONB, explicit transactions, optimistic versions and immutable snapshots, with Prisma-style TypeScript persistence likely during bootstrap;
- выбран async direction: Redis/BullMQ workers for package builds, generated artifacts, future AI/OCR and search indexing;
- выбран file/generation direction: domain-scoped local/S3-compatible storage, DOCX template rendering, backend PDF conversion and ZIP package generation from immutable manifests;
- выбран search/AI direction: PostgreSQL-first search, semantic/vector search deferred, AI/OCR optional provider-abstracted proposal-only;
- documented first coding milestones from bootstrap through AOSR DOCX/PDF prototype, registry and package builder.

Открыто перед следующим этапом:

- review и принятие `docs/17-tech-stack-and-implementation-strategy-v1.md`;
- creation/review/acceptance of `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`;
- exact first AOSR template baseline and required participant set;
- retention/privacy/RBAC/governance policy details;
- actual scaffold, dependencies, migrations, ORM schema, OpenAPI and production implementation only after docs/18 acceptance.

Что не было изменено или выбрано этим этапом:

- ADR 0001-0005, Schema V1, lifecycle policy, Backend/API Architecture V1, API Command/Read Model Contracts V1 and MVP scope;
- production code, backend/frontend scaffold, source folders, package manifests, SQL, migrations, ORM schema, OpenAPI, concrete routes, Docker/CI/deployment files or repository bootstrap.

### 2026-05-28 — Initial Repository Bootstrap and Development Rules V1 created

- Документ: `docs/18-initial-repository-bootstrap-and-development-rules-v1.md`
- Статус: `pre-scaffold governance specification`
- Описание: final implementation gate before the first scaffold, defining enforceable bootstrap/scaffold rules and architecture-violation criteria.

Зафиксированный прогресс:

- defined coding preconditions and requirement for a separate explicit first scaffold task;
- limited first scaffold to package/workspace setup, TypeScript/lint/format/test tooling, React/Vite shell, NestJS shell, worker shell, shared placeholders and optional CI checks;
- prohibited production features, Prisma schema, migrations, OpenAPI, real auth/uploads/queue/storage/generation, AI/OCR and deployment infrastructure in first scaffold;
- fixed architecture invariants to preserve structured source of truth, typed AOSR first, derived registry, immutable revisions/snapshots, AI proposal-only, modular monolith and workspace isolation;
- added infrastructure portability/no server lock-in guardrails: replaceable deployment provider, config-driven database/Redis/storage/public URLs/CORS/session/app base URLs, S3-compatible storage adapter boundary, no hardcoded server paths/hosts and no provider SDK leakage outside adapters;
- fixed docs/16 precedence over older docs/08 TestAct candidate wording for implementation scope;
- required ADR 0001-0005 physical presence or documentation-only corrective restoration/replacement declaration before scaffold;
- superseded by the later canonical ADR baseline accepted in `docs/adr/`;
- blocked active Foreman permissions without separate approval;
- blocked hardcoding exact first AOSR participant requirements before template review;
- defined architecture violation examples and stop/correct process.

Открыто перед следующим этапом:

- docs/18 accepted and first infrastructure scaffold completed/accepted;
- separate explicit feature/database/API tasks after scaffold acceptance;
- exact first AOSR template baseline and required participant set;
- retention/privacy/RBAC/governance policy details;
- feature coding only after accepted scaffold and subsequent explicit feature tasks.

Что не было изменено или выбрано этим этапом:

- production code, backend/frontend scaffold, source folders, package manifests, dependencies, Prisma schema, SQL, migrations, OpenAPI, concrete routes, Docker/CI/deployment files or runtime configuration;
- first AOSR template requirements, active Foreman permission model, TestAct implementation, AI/OCR provider or deployment strategy.

### 2026-05-28 — First allowed infrastructure scaffold started

- Статус: `infrastructure/bootstrap scaffold`
- Описание: первый явно разрешённый scaffold после `docs/18`, ограниченный инженерной основой репозитория.

Созданная структура:

```text
apps/
  api/
  web/
packages/
  shared-config/
  shared-types/
```

Scaffold включает:

- `pnpm` workspace root;
- root scripts for `dev`, `build`, `lint`, `typecheck`, `test`, `format:check` and `ci:check`;
- strict TypeScript baseline with project references, workspace package imports and local path-alias foundations;
- ESLint/Prettier/Vitest setup;
- `.editorconfig`, `.gitignore`, env example files and Node version baseline;
- React + TypeScript + Vite shell in `apps/web`;
- NestJS shell in `apps/api`;
- technical `/health` endpoint only;
- shared technical placeholder types in `packages/shared-types`;
- typed env validation foundation in `packages/shared-config`;
- local CI-equivalent quality gate running format, lint, typecheck, test and build.

GitHub Actions workflow status:

```text
committed as scaffold CI
```

Workflow: `.github/workflows/ci.yml`.

It runs on `push` and `pull_request` with Node 22, Corepack, `pnpm install
--frozen-lockfile` and `corepack pnpm ci:check`. It does not require production
secrets, deploy, run AI/OCR or generate production artifacts.

Architecture guardrails added in tooling:

- strict TypeScript options;
- import boundary restrictions against app-internal cross-imports;
- blocked provider/database/queue SDK imports until a scoped infrastructure adapter task authorizes them;
- blocked hardcoded absolute server/workstation path literals in TypeScript/JavaScript source;
- env examples keep database, Redis, storage, CORS and public URL values configuration-driven.

What remains forbidden after this scaffold:

- AOSR implementation;
- certificates implementation;
- package builder implementation;
- Prisma schema;
- migrations;
- OpenAPI;
- real auth;
- uploads or storage implementation;
- queue workers;
- document generation;
- AI/OCR;
- CRUD APIs;
- database models;
- domain/business validation or domain logic.

Что не было введено:

- no production domain modules;
- no database schema;
- no migrations;
- no OpenAPI;
- no storage adapter;
- no worker app or queue processor;
- no AOSR/certificate/package feature code;
- no AI/OCR integration;
- no deployment files, Docker or Kubernetes.

Current guardrail after scaffold and ADR baseline:

```text
Do not start feature/database/API/storage/generation work without a separate explicit task and ADR compliance check.
```

### 2026-05-28 — Canonical ADR baseline accepted

- Документы:
  - `docs/adr/0001-structured-data-source-of-truth.md`
  - `docs/adr/0002-typed-document-domain-model.md`
  - `docs/adr/0003-file-backed-evidence-and-derived-artifacts.md`
  - `docs/adr/0004-immutable-revisions-and-package-snapshots.md`
  - `docs/adr/0005-modular-monolith-and-bounded-contexts.md`
- Статус: `accepted canonical ADR baseline`
- Описание: documentation-only consolidation of accepted architecture decisions into the official ADR 0001-0005 set.

Зафиксированный прогресс:

- old non-canonical ADR files were replaced by the canonical file names above;
- ADR 0001 fixes structured data as source of truth and confirms generated DOCX/PDF/registry/package artifacts are derived;
- ADR 0002 fixes typed document domain model, AOSR as first-class typed document and rejects generic low-code/document/CRUD domain;
- ADR 0003 fixes certificate/executive-scheme file-backed evidence, derived artifacts and provider-isolated storage abstraction;
- ADR 0004 fixes immutable released revisions and immutable package snapshots, with final edits producing new revisions and no history rewrite;
- ADR 0005 fixes modular monolith first, bounded contexts and isolated infrastructure adapters;
- each ADR explicitly preserves no server lock-in, AI proposal-only, derived registry, async package build, workspace isolation, no cross-workspace leakage and no provider SDK leakage.

Что не было изменено или выбрано этим этапом:

- no architecture changes beyond consolidating already accepted decisions;
- no MVP scope change;
- no production code;
- no Prisma schema, SQL, migrations, ORM schema, OpenAPI, API routes, storage adapter, queue worker, generation pipeline or business/domain implementation.

### 2026-05-28 — Backend module architecture skeleton introduced

- Статус: `backend architecture skeleton only`
- Документы:
  - `apps/api/src/ARCHITECTURE.md`
  - module `README.md` files under `apps/api/src/{shared-kernel,infrastructure,workspace,documents,evidence,registry,packages,ai,health}/`
- Описание: canonical backend module boundaries for the NestJS modular monolith,
  introduced before feature implementation and without domain/business behavior.

Созданные backend boundaries:

- `workspace`: workspace boundary, membership vocabulary and isolation contracts;
- `documents`: typed documents, revisions and finalization lifecycle boundary;
- `evidence`: certificates, executive schemes and file-backed evidence boundary;
- `registry`: derived projection and presentation-only override boundary;
- `packages`: package builds, snapshots, generated artifacts and future async orchestration boundary;
- `ai`: proposal/finding-only boundary for future AI/OCR assistance;
- `shared-kernel`: shared primitives/interfaces only, without business aggregate leakage;
- `infrastructure`: provider adapter tokens/ports only, without provider leakage into domain modules;
- `health`: technical health endpoint only.

Architecture guardrails added:

- `apps/api/src/ARCHITECTURE.md` documents module purpose, ownership, forbidden couplings, dependency direction, source-of-truth rules, derived artifacts, revision/package invariants and infrastructure isolation;
- ESLint now blocks direct sibling-module internal imports for backend bounded contexts;
- ESLint blocks direct infrastructure access from bounded modules;
- ESLint keeps `shared-kernel` framework-free and keeps `infrastructure` from importing domain module internals.

What was not introduced:

- no AOSR implementation;
- no Prisma schema or migrations;
- no CRUD APIs, OpenAPI, auth, uploads/storage implementation, DB access, queue jobs, package generation or AI/OCR implementation;
- no controllers/services with domain behavior;
- no repositories, use cases, real entities, validation rules or business logic.

Recommended next step: request a separate, explicitly scoped backend
application skeleton task for workspace/session isolation foundations. Any
database/API/storage/queue/package/AOSR/AI work must remain blocked until its
own task is checked against `docs/PROJECT_MEMORY.md` and accepted ADRs in
`docs/adr/`.

### 2026-05-28 — First technical frontend-backend status slice introduced

- Статус: `technical vertical slice only`
- Описание: минимальный end-to-end infrastructure check proving frontend ->
  backend communication, shared technical DTO usage and CI/build/test coverage
  without starting product/domain implementation.

Добавлено:

- `packages/shared-types/src/technical-health.ts` with technical
  `TechnicalHealthResponse`;
- strengthened backend `/health` test for the technical response shape and
  timestamp;
- `apps/web/src/technical-status/technical-health.ts` fetch utility using
  `VITE_API_BASE_URL`;
- frontend utility tests for URL construction, typed response parsing and
  fail-closed behavior when API base URL is missing;
- minimal placeholder `Backend status` panel showing loading, ok and error
  states;
- frontend workspace dependency on `@pto/shared-types`.

What was not introduced:

- no AOSR, certificates, executive schemes, registry or package builder;
- no auth, database, Prisma schema, migrations, uploads/storage, queues,
  AI/OCR, OpenAPI, CRUD APIs, real use cases or domain entities;
- no domain readiness semantics.

Recommended next step: review this technical slice, then request a separate,
explicitly scoped backend application skeleton task for workspace/session
isolation foundations before any product/domain work.

### 2026-05-28 — Database foundation technical slice introduced

- Статус: `database foundation technical slice only`
- Описание: минимальная database infrastructure foundation without domain
  schema, migrations, repositories, CRUD APIs or business behavior.

Добавлено:

- `apps/api/prisma/schema.prisma` with only Prisma `generator` and PostgreSQL
  `datasource`;
- Prisma Client dependency and `prisma:generate` wiring;
- optional `db:check` script for a technical connectivity check;
- `apps/api/src/infrastructure/database/` database health utility and
  Prisma-backed technical adapter;
- shared technical `/health` dependency status for database
  `configured/unconfigured/ok/error`;
- explicit non-global wiring: `HealthModule` imports `InfrastructureModule` for
  technical health composition only;
- frontend technical status parsing/display for the database dependency status;
- mocked unit tests for database health behavior, env fail-safe behavior and
  health response shape.

What was not introduced:

- no Prisma `model` blocks;
- no migrations folder;
- no domain tables or business database schema;
- no repositories, CRUD APIs, auth, uploads, business file storage, queues, AI/OCR or package
  implementation;
- no domain readiness semantics.

Current database guardrail:

```text
Prisma exists only as infrastructure foundation. Domain schema, migrations and
business tables require a separate explicit task. `InfrastructureModule` is not
global; domain bounded modules must not import it.
```

Recommended next step: review this database foundation, then request a separate,
explicitly scoped workspace/session isolation skeleton task before any domain
schema, migration, AOSR, uploads/file APIs, queue, package, OpenAPI or AI work.

### 2026-05-29 — Object storage foundation technical slice introduced

- Статус: `object storage foundation technical slice only`
- Описание: минимальная infrastructure-only object storage health foundation
  without uploads, downloads, evidence files, generated artifacts, file metadata,
  repositories, CRUD APIs or business behavior.

Добавлено:

- `apps/api/src/infrastructure/storage/` object storage health utility, port
  re-export and S3-compatible adapter skeleton;
- env-driven storage health configuration using `OBJECT_STORAGE_ENDPOINT`,
  `OBJECT_STORAGE_BUCKET` and `OBJECT_STORAGE_REGION`;
- config-only runtime health behavior where missing config is fail-safe
  `unconfigured` and complete config reports `configured`;
- optional mocked adapter path in tests for future lightweight connectivity
  behavior returning `ok` or `error`;
- technical `/health` response dependency status for storage:
  `configured`, `unconfigured`, `ok` or `error`;
- explicit non-global wiring: `HealthModule` imports `InfrastructureModule` for
  technical health composition only;
- frontend technical status parsing/display for the storage dependency status;
- mocked unit tests for storage config behavior, storage health behavior and
  health response shape.

Решение:

- object storage remains an infrastructure concern;
- no storage SDK dependency was added in this slice;
- the S3-compatible adapter skeleton performs a config-only check at runtime so
  CI does not depend on MinIO/S3 network availability;
- `/health` reports only `dependencies.storage.status` and does not expose
  endpoint, bucket, region, access keys, provider URLs, file paths, evidence
  state or artifact state;
- `InfrastructureModule` remains explicit and not global.

What was not introduced:

- no upload or download API;
- no certificate files, executive scheme files, document files, package
  artifacts or generated artifacts;
- no file metadata domain models;
- no file paths persisted;
- no Prisma models or migrations;
- no domain repositories, CRUD APIs, auth, package builder, registry,
  certificates or AI/OCR implementation;
- no business validation or domain readiness semantics.

Current object storage guardrail:

```text
Object storage exists only as an infrastructure health/config boundary. Uploads,
downloads, file metadata, evidence workflows, generated artifacts and domain
storage records require separate explicit tasks. Provider SDKs must stay inside
future infrastructure adapters and must not leak into domain/application modules.
```

Recommended next step: review this object storage foundation, then request a
separate, explicitly scoped workspace/session isolation skeleton task before any
domain schema, migration, AOSR, uploads, file APIs, queue, package, OpenAPI or
AI work.

### 2026-05-29 — Sharing and access model amendment created

- Документ: `docs/19-sharing-and-access-model-v1.md`
- Статус: `MVP architecture amendment`
- Описание: owner-based workspace and certificate-library sharing model replacing complex RBAC for MVP.

Зафиксированный прогресс:

- complex RBAC removed from MVP implementation scope;
- `docs/10-auth-workspace-rbac-model.md` superseded for MVP and retained as deferred/historical reference;
- no `Foreman` role and no `Owner/Admin/PTO Engineer/Viewer` matrix for MVP;
- one `Global System Admin` separated from business collaboration;
- regular users own own workspaces/project data and certificate libraries;
- workspace collaboration and certificate library sharing are separate flows;
- share codes / invite codes are opaque, non-guessable and safely stored;
- default permission is view-only;
- owner-selected capabilities replace roles;
- accepted code creates persistent resource-scoped share grant;
- owner revocation, code rotation, auditability and no cross-workspace leakage are mandatory.

Что требует ратификации перед implementation:

- code single-use/multi-use choice and default expirations;
- capability update versus revoke/reissue policy;
- exact privacy/download rules for originals and representative data;
- revocation/session invalidation mechanics;
- system admin support-access audit/retention policy.

Что не было изменено этим этапом:

- source-of-truth, typed documents, certificate evidence, registry projection, package snapshot and AI/OCR assistant-only decisions;
- physical database, Prisma schema, migrations, API routes, auth implementation, sharing implementation or business logic.

### 2026-05-30 — Auth sharing implementation plan created

- Документ: `docs/20-auth-sharing-implementation-plan-v1.md`
- Статус: `implementation planning document only`
- Описание: safe phased plan translating `docs/19-sharing-and-access-model-v1.md`
  into future implementation sequence without adding code, schema, migrations,
  API routes, auth or sharing behavior.

Key implementation sequence:

1. User Identity Skeleton.
2. Global System Admin Marker.
3. Owned Workspace Baseline.
4. Workspace Share Codes.
5. Workspace Share Grants.
6. Certificate Library Share Codes.
7. Certificate Library Share Grants.

Зафиксировано:

- Phase 1 starts with authenticated actor identity only;
- system admin is a separate operational marker, not a business role;
- owned workspace access precedes sharing;
- share codes are introduced before accepted grants;
- workspace sharing and certificate library sharing remain separate flows;
- future Prisma entities and API commands are conceptual and deferred;
- access checks are owner/grant/capability based with default deny;
- audit, token/code safety, revocation, rotation, frontend guardrails and tests are planned before implementation;
- workspace isolation and no cross-workspace leakage remain mandatory;
- complex RBAC must not return in MVP.

Что не было введено:

- no code;
- no Prisma schema changes;
- no migrations;
- no API routes;
- no auth/session implementation;
- no share code or grant implementation;
- no technical slice changes.

Recommended next coding step: separate Phase 1 user identity skeleton task only,
with explicit scope and tests from `docs/20`.

### 2026-05-30 — Phase 1 user identity skeleton introduced

- Статус: `Phase 1 identity skeleton only`
- Описание: smallest backend slice giving future commands/queries a single
  vocabulary for current actor resolution without granting business access.

Добавлено:

- `apps/api/src/shared-kernel/interfaces/actor.ts` with framework-free `Actor`
  primitive, `ActorId`, `ActorStatus` and `ActorSource`;
- `apps/api/src/workspace/identity/current-actor.ts` with fail-closed current
  actor resolver utility;
- `apps/api/src/workspace/identity/current-actor.port.ts` with resolver port;
- `apps/api/src/workspace/identity/current-actor.spec.ts` with tests for active
  actor resolution, missing/disabled fail-closed behavior, ignoring
  request-body-style claims, no roles/capabilities and no encoded business
  access;
- workspace token vocabulary for the current actor resolver port;
- README/module docs updates.

Что не было введено:

- no login;
- no register;
- no password auth, magic links, OAuth, sessions, cookies or JWT;
- no Prisma `User` model or any Prisma schema change;
- no migrations;
- no API routes, controllers or current-user endpoint;
- no frontend auth UI;
- no global system admin implementation in Phase 1;
- no workspace creation;
- no share codes or grants;
- no certificate sharing;
- no business access checks for AOSR, certificates, registry, packages or files.

Historical note: the next phase after this slice was Phase 2 global system admin
marker from `docs/20`.

### 2026-06-01 — Phase 2 global system admin marker introduced

- Статус: `Phase 2 global system admin marker only`
- Описание: smallest backend/admin-path slice for determining whether a
  resolved active actor is the single configured global system admin.

Добавлено:

- optional `SYSTEM_ADMIN_ACTOR_ID` env/config key in the shared API env schema
  and env examples;
- `apps/api/src/workspace/admin/system-admin.ts` with framework-free
  `admin-path` marker config and checks;
- tests proving missing config means no admin, a regular actor is not admin, the
  configured active actor is admin, a configured disabled actor is not admin,
  multiple configured ids are rejected, and client-supplied admin/role/capability
  claims are ignored;
- README, workspace/module architecture docs, project memory and QA log updates.

Что не было введено:

- no admin routes/controllers;
- no admin UI;
- no support tenant browsing;
- no owner/grant business access bypass;
- no workspace ownership or workspace access checks;
- no share codes or grants;
- no Prisma models or migrations;
- no auth/session/login/register implementation;
- no business APIs;
- no RBAC roles or multi-admin governance.

Historical note: the next phase after this slice was Phase 3 owned workspace
baseline from `docs/20`.

### 2026-06-01 — Phase 3 owned workspace baseline introduced

- Статус: `Phase 3 owned workspace baseline only`
- Описание: smallest workspace owner-access skeleton for regular-user owned
  workspaces without collaboration, persistence or business feature behavior.

Добавлено:

- `apps/api/src/workspace/ownership/owned-workspace.ts` with TypeScript-only
  `OwnedWorkspace`, `OwnedWorkspaceId`, owner-only access decisions and
  `NOT_FOUND_OR_NOT_AUTHORIZED` denial vocabulary;
- child-scope guard utility requiring workspace ownership before document,
  object or folder child lookup;
- tests proving owner access, non-owner denial, guessed child ids are not
  resolved before ownership verification, missing/disabled actor fail-closed
  behavior through current actor resolution, system admin marker is not accepted
  as owner, and old RBAC role/capability/membership claims are ignored;
- README, workspace/module architecture docs, project memory and QA log updates.

Что не было введено:

- no Prisma schema changes;
- no migrations;
- no API routes/controllers;
- no frontend UI;
- no auth/session/login/register implementation;
- no share codes or grants;
- no certificate library sharing;
- no admin support tenant browsing;
- no `SYSTEM_ADMIN_ACTOR_ID` business access bypass;
- no AOSR/certificate/registry/package implementation.

Next required phase, only after a separate explicit task: Phase 4 workspace
share codes from `docs/20`.

### 2026-06-01 — First mock AOSR demo UI slice introduced

- Статус: `Mock AOSR demo UI only`
- Описание: first frontend-only application slice for user feedback, using
  in-memory mock data and no production workflow behavior.

Добавлено:

- root React/Vite screen showing a Russian demo project/workspace header;
- compact mock document tree for AOSR drafts, including UI-only act ordering
  affordance;
- editable AOSR-like fields for act number, act date, work period, object/area,
  axes, elevation range, hidden works description, design documentation,
  materials/certificates plain text, mock attachments/applications and
  subsequent works permitted;
- ordered frontend-only mock signatories reflected in the preview;
- A4-like HTML AOSR preview area resembling an official printed act page, with a
  placeholder that a real PDF/printed form will come later;
- clear `ИДея / демо-данные / не для работы в продуктиве` label;
- focused frontend tests for rendering and Testing Library/user-event field
  editing that updates the document-like preview.

Что не было введено:

- no Phase 4 workspace share codes;
- no share grants;
- no Prisma schema changes;
- no migrations;
- no backend routes/controllers;
- no real auth/session/login/register;
- no persistence;
- no uploads;
- no document generation;
- no AI/OCR;
- no production AOSR domain implementation.

Next step: collect feedback on the demo screen. Phase 4 share codes and
production domain/API/persistence work remain separate explicit tasks.

### 2026-06-02 — Mock AOSR demo UI refined

- Статус: `Frontend mock AOSR demo UI only`
- Описание: refined the in-memory AOSR demo screen for feedback while keeping it
  outside production workflow implementation.

Добавлено/уточнено:

- object-level defaults are visually separated from current-act fields;
- mock object defaults now include project/object data, default project
  documentation and a representative library;
- representatives are added to the current act from the mock object library and
  current-act signatory order can be changed in the UI;
- act materials are selected from a small mock certificate/material library
  instead of a plain free-text materials field;
- selected certificate documents and structured mock scheme/photo/journal data
  derive the final applications block;
- applications render at the final end of the AOSR preview before final
  signature blocks.

Что не было введено:

- no real certificate library implementation;
- no uploads or file attachments;
- no persistence;
- no backend routes/controllers;
- no Prisma/schema/migration work;
- no real PDF/DOCX generation;
- no AI/OCR;
- no auth/session/login/register;
- no share codes/grants;
- no production AOSR business logic.

### 2026-06-02 — Mock AOSR demo UX and preview refined

- Статус: `Frontend mock AOSR demo UX/preview only`
- Описание: refined the AOSR demo editor and HTML preview for user feedback while
  keeping all data in-memory and frontend-only.

Добавлено/уточнено:

- `DemoAosrWorkspacePage.tsx` split into smaller frontend-only components for
  document tree, default parameters, header organizations, object representatives,
  current act editor, signatories, materials, derived applications and preview;
- default/common parameters are compact/collapsible and opened by buttons;
- mock global organization and representative libraries are represented only as
  reusable in-memory sources, while object-level header blocks and
  representatives remain editable object-specific bindings/snapshots;
- header organization labels and representative role labels remain configurable
  per object and are not a fixed universal AOSR participant schema;
- current-act representatives are searched from object-level representatives,
  with temporary one-act representatives still supported;
- certificate materials are searched/selected from the mock certificate library
  and never entered as plain free text in the act;
- derived applications include selected certificate materials and selected mock
  executive schemes/photos/journal entries, rendering before final signatures;
- HTML preview was tightened toward the AOSR Word example with A4-like margins,
  Times New Roman-like body typography, compact line-height, field lines,
  helper captions, title/number/date rhythm and final signature rows;
- the AOSR Word example is visual/layout reference only: it is not imported,
  parsed at runtime or used for DOCX/PDF generation.

Что не было введено:

- no backend routes/controllers;
- no Prisma/schema/migrations;
- no persistence;
- no uploads or file attachment implementation;
- no real certificate library implementation;
- no real DOCX/PDF generation;
- no AI/OCR;
- no auth/session/login/register;
- no share codes/grants;
- no production AOSR business logic.

### 2026-06-02 — Frontend-only Vercel demo deployment configured

- Статус: `Frontend demo deployment only`
- Добавлен root `vercel.json` для Vercel deployment of the AOSR demo UI.
- Vercel project must keep Root Directory as repository root (`.`), then use
  `corepack pnpm --filter @pto/web... install --frozen-lockfile`,
  `corepack pnpm --filter @pto/web... build` and `apps/web/dist`.
- The `@pto/web...` pnpm filter includes only `@pto/web`,
  `@pto/shared-config` and `@pto/shared-types`; it does not include `@pto/api`.
- No backend deployment, Prisma, database, auth/session, uploads, AI/OCR, PDF
  generation, certificate library, signatory database or share codes/grants were
  introduced.

### 2026-06-03 — Frontend-only representatives and organizations management page introduced

- Статус: `Frontend mock representatives/organizations management only`
- Описание: second small UX cleanup step replacing the dashboard placeholder
  for `Представители и организации` with a frontend-only management mock.

Добавлено/уточнено:

- clicking `Представители и организации` in the left navigation opens a real
  mock page instead of the placeholder;
- page explains that users prepare organizations and representatives before
  adding them to objects and acts through search;
- mock global organization library shows names, INN/OGRN/details and where
  each organization is used;
- mock global representative library shows full name, flexible role label,
  position, organization, authority basis and optional NRS/details;
- organization and representative filters work in memory;
- mock add forms append new organizations and representatives only to local
  React state;
- conceptual notes explain that object-level organization/representative
  bindings/snapshots can differ from global library data;
- representative role labels and header organization labels remain
  user-configurable concepts, not a globally fixed AOSR schema;
- AOSR workspace opening from object cards, default parameters and current-act
  signatory search/add remain functional.

Что не было введено:

- no backend routes/controllers;
- no Prisma/schema/migrations;
- no persistence;
- no uploads;
- no real DOCX/PDF generation;
- no AI/OCR;
- no auth/session/login/register;
- no share codes/grants;
- no production representative/organization business logic.

### 2026-06-03 — Frontend-only mock certificate library page introduced

- Статус: `Frontend mock certificate library only`
- Описание: third small UX cleanup step replacing the dashboard placeholder for
  `Библиотека сертификатов` with a frontend-only in-memory mock page.

Добавлено/уточнено:

- clicking `Библиотека сертификатов` in the dashboard opens a real mock page
  instead of the placeholder;
- page title, short onboarding text and visual workflow explain that the user
  first saves certificates/materials, then opens an object and act, searches for
  a material and gets the certificate into the act automatically;
- mock certificate list shows material/equipment, document type, document
  number, issue date, valid-until value, manufacturer, issuer/source and status;
- statuses are `Действует`, `Истекает` and `Требует проверки`;
- search works in memory by material, document number, document type,
  manufacturer and issuer/source;
- lightweight status filter works in memory;
- `Добавить сертификат` opens a local in-memory form for certificate metadata;
- upload UI is intentionally absent and replaced with the note `Загрузка PDF и
сканов будет реализована позже.`;
- compact `Как это будет работать` block explains future library/object/act/
  applications flow;
- visible DEMO note states that the certificate library page and AOSR material
  search use one frontend mock store;
- representatives/organizations page now also shows a compact onboarding flow
  from organization to representative to object to act signatory;
- existing AOSR object opening, certificate material search/selection, derived
  applications, signatory search/add, default parameters, document tree,
  drag/drop ordering and preview behavior remain functional.

Что не было введено:

- no backend routes/controllers;
- no Prisma/schema/migrations;
- no persistence;
- no uploads;
- no file storage;
- no OCR or AI extraction;
- no real DOCX/PDF generation;
- no auth/session/login/register;
- no share codes/grants;
- no production certificate business logic;
- no backend or persistent connection behind the shared frontend mock store.

### 2026-06-03 — Stage 5 mock AOSR workspace UX stabilized

- Статус: `Frontend mock AOSR workspace UX only`
- Описание: small UX stabilization pass for making the object workspace and
  current AOSR editor easier to understand for a new user.

Добавлено/уточнено:

- middle editor heading changed to `Рабочая область акта`;
- object-level default parameters and act-level `Текущий акт` are visually
  separated, with default parameters still behind a compact button;
- representative copy now explains the target chain:
  `global library -> object binding/snapshot -> act usage`;
- visible DEMO note states that object representatives are prefilled from the
  global mock library only for convenience, while the real system will require
  the user to choose/bind representatives for the object;
- current-act signatory search was labelled as adding from the object base and
  historically kept a manual temporary representative flow; ADR 0007 later
  restricts local manual editing to the explicit full manual snapshot;
- material search copy says materials must be selected from the certificate
  library so certificates reach the act and applications;
- existing unified mock store scenarios remain covered: added certificates
  appear in AOSR material search, added representatives appear in AOSR signatory
  search, and added organizations appear in the object header picker;
- AOSR preview and derived applications behavior were preserved; exact
  Word-like AOSR preview matching remains a separate future stage.

Что не было введено:

- no backend routes/controllers;
- no Prisma/schema/migrations;
- no persistence;
- no uploads;
- no OCR or AI extraction;
- no real DOCX/PDF generation;
- no auth/session/login/register;
- no share codes/grants;
- no production representative, organization, certificate or AOSR business
  logic.

### 2026-06-07 — Frontend-only object document workspace introduced

- Статус: `Frontend mock object document workspace only`
- Описание: replaced the object documents placeholder with a real in-memory
  workspace for object documentation metadata.

Добавлено/уточнено:

- opened object section `Документы объекта` now has a professional mock
  workspace instead of a placeholder;
- page header is `Документы объекта` with the description
  `Исполнительные схемы, исполнительные чертежи, протоколы, журналы и другие документы объекта.`;
- object documents render as a table with columns `Наименование`,
  `Тип документа`, `Номер`, `Дата` and `Используется в актах`;
- document types now cover `Исполнительная схема`, `Исполнительный чертеж`,
  `Протокол`, `Журнал`, `Испытание` and `Другое`;
- frontend-only filters `Все`, `Схемы`, `Чертежи`, `Протоколы`, `Журналы`
  work in memory;
- summary counts for total documents, schemes, drawings and protocols are
  derived from the current frontend mock object-document data;
- local in-memory form `Добавить документ` adds name/type/number/date metadata
  to the current demo state;
- `Используется в X актах` labels are derived from current mock AOSR draft
  document selections where possible;
- the object documents workspace and the AOSR point 4 document drawer now share
  the same frontend demo store, so newly added object documents can be selected
  from AOSR without reload;
- focused frontend tests cover page rendering, filters, creation, counts and
  AOSR drawer continuity.

Что не было введено:

- no backend routes/controllers;
- no Prisma/schema/migrations;
- no persistence;
- no uploads;
- no document storage or file metadata;
- no OCR or AI extraction;
- no DOCX/PDF generation;
- no auth/session/login/register;
- no share codes/grants;
- no production object-document, AOSR, registry or package business logic.

### 2026-06-07 — Frontend-only object certificate workspace introduced (superseded)

- Статус: `Superseded frontend mock object certificate workspace experiment`
- Описание: this object certificate workspace experiment was later superseded by
  the 2026-06-11 object overview and global certificate architecture correction.

Добавлено/уточнено:

- current opened-object navigation must not expose an object-owned
  `Сертификаты` page;
- certificates are global user-level library records, not object-owned records;
- object/final-package certificate counts are derived from certificates used in
  acts;
- certificates remain global quality-document records referenced by object and
  act flows; the object certificate page must not model them as act-owned rows;
- certificate materials render from the existing `materials[]` structure;
- the global certificate library page and AOSR material drawer share the same
  frontend demo certificate store, so newly added demo certificates can be
  selected from AOSR without reload;
- this is a foundation for future ID registry and package flows, not production
  evidence storage;
- focused frontend tests now cover removed object-owned certificate navigation,
  global certificate library continuity and AOSR material drawer continuity.

Что не было введено:

- no backend routes/controllers;
- no Prisma/schema/migrations;
- no persistence;
- no uploads;
- no file storage or certificate file metadata;
- no OCR or AI extraction;
- no DOCX/PDF generation;
- no auth/session/login/register;
- no share codes/grants;
- no production certificate, AOSR, registry or package business logic.

### 2026-06-07 — Frontend-only ID Registry V1 introduced

- Статус: `Frontend mock ID registry V1 only`
- Описание: replaced the object `Реестр ИД` placeholder with the first real
  read-only registry page derived from existing frontend demo entities.

Добавлено/уточнено:

- opened object section `Реестр ИД` now renders the header
  `Реестр исполнительной документации`;
- page description is
  `Сводный перечень документов исполнительной документации объекта.`;
- compact summary cards show `Всего документов`, `АОСР`, `Документы объекта`
  and `Сертификаты`;
- one read-only registry table renders columns `Раздел`, `Наименование`,
  `Номер`, `Дата` and `Статус`;
- rows are derived from current mock AOSR drafts, object documents and the
  shared global certificate demo store;
- certificates remain global demo records; the registry references/uses them
  without object-owned certificate storage or duplicated certificate data;
- frontend-only filters `Все`, `АОСР`, `Документы объекта` and `Сертификаты`
  work in memory;
- a compact future note records that later versions will include executive
  schemes, journals, protocols, test results and other ID documents;
- focused frontend tests cover registry rendering, rows, filters, summary
  counts and AOSR ↔ registry navigation.

Что не было введено:

- no manual registry editing;
- no backend routes/controllers;
- no Prisma/schema/migrations;
- no persistence;
- no uploads;
- no file storage or file metadata;
- no OCR or AI extraction;
- no DOCX/PDF generation;
- no auth/session/login/register;
- no share codes/grants;
- no production registry, package, certificate or AOSR business logic.

### 2026-06-09 — Frontend-only final ID package mock introduced

- Статус: `Frontend mock final ID package only`
- Описание: added a read-only object workspace section for the final ID package
  composition derived from existing frontend demo entities.

Добавлено/уточнено:

- opened object navigation now includes `Итоговый комплект`;
- page title is `Итоговый комплект ИД`;
- page description is
  `Финальный комплект исполнительной документации по объекту.`;
- the memory now records two ID levels: periodic/current ID prepared during
  construction, usually monthly, and final object ID prepared once at project
  completion;
- summary cards show `Акты`, `Сертификаты без дублей`,
  `Документы / чертежи без дублей` and `Всего позиций`;
- grouped lists render `Реестр ИД`, `Акты`, `Сертификаты` and
  `Документы объекта`;
- certificates and object documents used by mock AOSR drafts are deduplicated
  by id;
- the button `Скачать итоговую ИД` is disabled in demo mode;
- focused frontend tests cover opening the page, summary counts, dedupe,
  disabled demo download and navigation back to AOSR.

Что не было введено:

- no real download;
- no PDF/DOCX/ZIP generation;
- no package builder;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no uploads or file storage;
- no OCR or AI extraction;
- no auth/session/login/register;
- no share codes/grants;
- no production registry, package, certificate, object-document or AOSR
  business logic.

### 2026-06-22 — Linked/manual architecture documentation aligned

- Статус: `Documentation clarification only`
- Описание: removed the remaining conflict between ADR 0006-era automatic act
  snapshots and the authoritative ADR 0007 linked/manual working-act model.

Уточнено:

- global organization and representative libraries remain current reusable
  sources;
- `ObjectTemplate` stores assignments/references and object-specific display
  context;
- active linked acts resolve current template/library values and do not store
  template snapshots;
- an explicit whole-act manual switch creates one complete
  `manualTemplateSnapshot`;
- certificate use stays an explicit link to global file-backed evidence;
- released document revisions and issued package outputs freeze exact resolved
  values, identities and evidence provenance;
- older object-default, temporary representative and automatic act-snapshot
  passages are historical/superseded, not backend implementation guidance;
- partial template-field overrides remain forbidden.

Изменены только architecture/documentation files. UI, frontend behavior,
backend/API, Prisma/schema/migrations, persistence and generation were not
changed.

### 2026-06-22 — Frontend-only dynamic ID folders

- Статус: `Frontend mock folder creation only`
- Описание: replaced the fixed two-period navigation assumption with a dynamic
  in-memory folder flow while preserving the populated AOSR demo object.

Добавлено/уточнено:

- folder ids are open strings rather than a two-value month union;
- object navigation and the folder directory render current folder state;
- a dedicated empty demo object starts without folders or AOSR drafts;
- overview and folder directory expose `Создать папку`;
- the user enters an arbitrary non-empty folder name;
- creation immediately opens the empty folder without silently creating a
  document;
- `Создать документ -> АОСР` then creates the first document inside that folder;
- empty folder, empty document list and empty derived registry states are
  explicit;
- visible registry/package wording now says `папка`, not `период`;
- seeded `Сентябрь 2026` / `Октябрь 2026` remain demo examples only.

No backend/API, Prisma/schema/migrations, persistence/localStorage, folder
delete/move/reorder lifecycle or generation was introduced.

### 2026-06-22 — Frontend-only object-template AOSR numbering

- Статус: `Frontend mock automatic numbering only`
- Описание: implemented the accepted simple AOSR numbering rule in the current
  in-memory object workspace without backend or persistence changes.

Добавлено/уточнено:

- AOSR numbering settings now live in the object template UI;
- the user chooses one continuous sequence across the object or a sequence that
  restarts in each folder;
- prefix and suffix are editable, with default example `ОВ-1`;
- a new automatically numbered act receives separate object and folder sequence
  allocations, independent from its displayed number;
- a manual number entered during creation does not consume an automatic
  sequence;
- editing the displayed number of an automatically numbered act changes only
  that act and preserves its allocated sequence;
- previous and following acts are never renumbered by an ordinary manual edit;
- empty manual numbers remain allowed;
- existing acts are not automatically renumbered when template settings change.

Что не было введено:

- no backend/API numbering transaction;
- no Prisma/schema/migrations or persistence;
- no collision reservation across concurrent users;
- no bulk renumber command;
- no DOCX/PDF/ZIP generation changes.

### 2026-06-11 — Frontend-only object overview and certificate architecture correction

- Статус: `Frontend mock object overview and certificate architecture correction only`
- Описание: restructured the opened-object UX around an object overview and
  corrected visible certificate architecture so objects do not own certificate
  libraries.

Добавлено/уточнено:

- opened objects now land on `Обзор`, not directly in the AOSR editor;
- the overview shows object name, address, key metrics, last update, quick
  actions, recent periods, recent documents and `Создать документ`;
- `Создать документ` opens a frontend-only selector driven by registered act
  type metadata;
- only `АОСР — Акт освидетельствования скрытых работ` is registered now; the
  universal `Создать документ` action now creates a frontend-only in-memory
  draft in the selected period and opens it in the editor;
- future auto-numbering is called out in the selector as a future
  `{prefix}{number}{suffix}` engine;
- object navigation no longer has an object-owned `Сертификаты` section/page;
- the global dashboard/app-level certificate library remains the user-level
  certificate library;
- AOSR material selection still uses the global certificate store;
- registry/final package certificate rows remain derived from certificates used
  in acts;
- object overview/header may show `Использовано сертификатов` as a derived
  metric computed from mock act material links;
- readiness wording is non-blocking:
  `Проверка заполнения`, `Поля заполнены`, `Есть пустые разделы` and
  `Проверка комплекта`;
- helper text records that empty fields do not block print/preview and future
  printed forms should leave lines for manual filling;
- visible workflow labels `Черновик`, `На проверке`, `Готов` and `Выпущен` are
  removed from the document tree and summaries; visible document metadata keeps
  document number, `Последнее изменение` and `Версия документа`;
- focused frontend tests cover overview landing, overview metrics/create action,
  act metadata selector, Create AOSR routing, removed object-certificate nav,
  global certificate library continuity, AOSR material drawer continuity,
  non-blocking readiness wording and workflow-label removal.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no backend persisted document creation/draft creation;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no auth/session/login/register;
- no share codes/grants;
- no production registry, package, certificate, object-document or AOSR
  business logic.

### 2026-06-11 — Frontend-only ADR 0006 demo wording alignment introduced

- Статус: `Frontend mock wording and non-blocking form alignment only`
- Описание: aligned remaining AOSR signatory and representatives/organizations
  demo copy with ADR 0006.

Добавлено/уточнено:

- AOSR signatory creation now says `Создать представителя и назначение`;
- submit action now says `Создать и добавить в акт`;
- helper copy says production will create a global representative, an object
  assignment and an act snapshot; the automatic-snapshot part is later
  superseded by ADR 0007 for linked acts;
- creating from the AOSR act form now stores the simplified in-memory object
  assignment before adding the assignment to the act;
- the old visible mental model of a temporary act-only representative was
  removed;
- existing search/select flow from object assignments into the current act is
  preserved;
- global organization and representative mock forms no longer use HTML
  `required` attributes;
- empty organization/representative fields remain allowed so future print forms
  can leave manual-fill lines.

Что не было введено:

- no production representative/organization/certificate data model;
- no real act snapshot table or snapshot persistence;
- no backend/API behavior;
- no Prisma/schema/migrations;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no auth/session/login/register;
- no share codes/grants;
- no production AOSR business logic.

### 2026-06-11 — Global reusable libraries and act snapshots ADR accepted

- Документ: `docs/adr/0006-global-reusable-libraries-and-act-snapshots.md`
- Статус: `accepted architecture decision`
- Описание: records the global reusable entity model for certificates,
  organizations and representatives, plus act snapshots for historical print
  stability.

Зафиксировано:

- certificates are global user-level library entities;
- organizations are global user-level library entities;
- representatives are global user-level library entities;
- objects store assignments/links to global entities, with object-specific
  role, position, authority, organization relation, captions and ordering where
  needed;
- acts must avoid direct free-text signatories, organizations and certificates
  as the final data model;
- "create new" from search creates a global entity first, then assigns/links it
  to the current object or act;
- acts store printed snapshots for included organizations, representatives and
  certificates; this original rule is superseded for active linked acts by ADR
  0007 and now applies only at manual/released output boundaries;
- registries and final packages derive used certificates from acts and
  deduplicate them by source certificate identity/provenance.

Что не было введено:

- no backend/API behavior;
- no Prisma/schema/migrations;
- no persistence;
- no uploads or OCR/AI;
- no DOCX/PDF/ZIP generation;
- no production data-model implementation.

### 2026-06-11 — Frontend-only period-first object workspace mock

- Статус: `Frontend mock period-first object workspace only`
- Описание: restructured the opened-object mock workspace around periods while
  preserving the existing AOSR editor as the only working document type.

Добавлено/уточнено:

- object navigation now flows as `Обзор -> Периоды -> Документ`;
- mock periods `Сентябрь 2026` and `Октябрь 2026` contain document lists;
- each period shows placeholders for future period registry and future period
  package;
- overview keeps object information, quick actions, recent periods, recent
  documents, object-wide counts and a final ID shortcut;
- `Создать документ` is universal wording; AOSR is available through registered
  act type metadata, while other future document types are disabled as `скоро`;
- duplicate object-wide counters were removed from the embedded AOSR
  workspace/editor;
- future object structure is documented as Overview, Periods, Object documents,
  Representatives, Final ID and Settings;
- future numbering engine is documented as `{prefix}{number}{suffix}` with
  examples `ОВ-{n}`, `12-{n}-ОВ` and `АОСР/{YYYY}/{n}`;
- future numbering must support section-scoped numbering and numbering
  restarted per ID folder;
- Final ID aggregates folders of the selected section.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no persisted production document creation/draft creation;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production registry, package, numbering or AOSR business logic.

### 2026-06-14 — Frontend-only period-scoped AOSR creation mock

- Статус: `Frontend mock in-memory AOSR creation only`
- Описание: made `Создать документ -> АОСР` create a new frontend-only draft in
  the selected period while preserving the period-first object workspace.

Добавлено/уточнено:

- creating AOSR from the object overview uses the current selected period;
- creating AOSR from an opened period adds the draft to that period;
- the new blank draft appears in the period document list;
- the new blank draft appears in the AOSR document tree;
- later period document UX keeps the new draft in the period list for manual
  opening;
- empty AOSR fields are allowed and do not block editing or preview;
- overview and final ID counts update when they derive from the in-memory draft
  list;
- initial frontend-only numbering helper was added for document types;
- later section-template numbering superseded the initial object-level helper;
- current section-template numbering uses `{prefix}{number}{suffix}` and
  supports automatic/manual mode with `section-wide` or
  `restart-per-folder`;
- the create panel shows `Предлагаемый номер: ОВ-3`;
- the create panel also exposes editable `Номер документа`, prefilled from the
  proposed number;
- future UI settings may expose `ОВ-{n}`, `12-{n}-ОВ` and
  `АОСР/{YYYY}/{n}`.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no numbering settings UI;
- no production AOSR creation, numbering or business logic.

### 2026-06-14 — Frontend-only AOSR manual number override mock

- Статус: `Frontend mock AOSR number override only`
- Описание: made the proposed AOSR number editable before creating the
  frontend-only period-scoped draft.

Добавлено/уточнено:

- `Создать документ` now shows editable `Номер документа`;
- the input is prefilled with the current helper suggestion, for example
  `ОВ-3`;
- reopening the panel resets the input to the current proposed number;
- the user may type any manual value, such as `ОВ-3а` or `12-3-ОВ`;
- an empty manual value does not block creation, editing or preview;
- the created frontend-only draft uses the edited value as `actNumber`;
- auto-numbering is only a suggestion in this mock;
- no production numbering engine or numbering settings UI was added.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production AOSR creation, numbering or business logic.

### 2026-06-14 — Frontend-only object workspace premium UX polish

- Статус: `Frontend mock object workspace UX polish only`
- Описание: refined the existing period-first object workspace so it feels
  calmer, more structured and closer to a polished professional SaaS without
  adding new business features.

Добавлено/уточнено:

- object navigation now feels more file-manager-like with clearer visual
  nesting for `Overview -> Period -> Document`;
- periods read as work folders with document, registry and package context;
- the period page hierarchy is title/context, primary `Создать документ`,
  documents, derived registry and periodic ID action;
- the create-document selector uses document-type cards with active AOSR and
  disabled future document types;
- the overview keeps command-center emphasis through object identity, quick
  actions, recent periods, recent documents and final ID access;
- visual polish relies on spacing, typography, hierarchy, element sizing,
  primary/secondary action contrast and restrained surfaces rather than bright
  colors;
- AOSR preview, editor behavior, drawers, representatives, object documents,
  certificate library, final ID, period-scoped creation and manual number
  override are preserved.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production AOSR creation, numbering, registry/package or business logic.

### 2026-06-14 — Frontend-only generated ID package views UX

- Статус: `Frontend mock generated ID views only`
- Описание: clarified the period-first UX and package philosophy so periodic
  ID and final ID are presented as generated views from current data, not stored
  business entities.

Добавлено/уточнено:

- period page now has three major blocks: `Документы`, `Реестр периода` and
  `Периодическая ИД`;
- `Сформировать периодическую ИД` opens a frontend-only periodic ID view for
  the selected period;
- periodic ID view visually mirrors final ID but derives only selected-period
  documents, used certificates and used object documents;
- object/final ID action wording now uses `Сформировать итоговую ИД`;
- the AOSR creation card action says `Создать АОСР`;
- duplicate overview quick action `Создать документ` was removed because the
  overview already has the primary create CTA;
- periodic ID and final ID are always rebuilt from current documents and links;
- historical ZIP storage is outside the domain model.

Что не было введено:

- no closed period status;
- no issued status;
- no locked package state;
- no package persistence;
- no archive records;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production registry/package generation or business logic.

### 2026-06-15 — Frontend-only print-order AOSR editor UX

- Статус: `Frontend mock print-order AOSR editor only`
- Описание: reorganized the current AOSR editor so users fill the future
  printed act from top to bottom instead of working through arbitrary UI
  groupings.

Добавлено/уточнено:

- the editor now follows the real AOSR print order: header, organizations,
  signatories, points 1-7, additional data and applications;
- the header section shows act number, act date, object, form title and
  under-title text;
- organizations participating in the act are visible in the editor and have a
  configurable display order that updates the preview;
- signatories moved near the top immediately after organizations/header;
- signatory ordering keeps explicit move buttons and now uses a dedicated drag
  handle with visible drop target feedback;
- frontend form-variant metadata was introduced and current demo drafts use
  `АОСР 1` by default;
- under-title text is now superseded by ADR 0007: new drafts copy it from
  default parameters and then own the document value;
- empty fields remain allowed.

Что не было введено:

- no new AOSR form differences beyond the default metadata for `АОСР 1`;
- no production under-title persistence or generation behavior;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production AOSR business logic.

### 2026-06-16 — Frontend-only period document UX cleanup

- Статус: `Frontend mock period document UX cleanup only`
- Описание: clarified that a period is a folder with documents of many types,
  while AOSR is only the first implemented document type.

Добавлено/уточнено:

- period primary action is universal `Создать документ`;
- the selector keeps AOSR active and future document types disabled as
  `скоро`;
- created frontend-only AOSR drafts now appear in the selected period document
  list without forcing the editor open;
- registry and Periodic ID on a period are compact generated views derived from
  period documents;
- left object navigation is visually split into `Работа` and `Сервис`;
- default parameters keep sectioned layout with calmer cards, clearer active
  section and less AOSR-only wording;
- real registry implementation is still coming soon;
- numbering settings are planned later and were not implemented.

Что не было введено:

- no new business features;
- no AOSR variant selector;
- no new document type implementation beyond existing AOSR metadata;
- no changes to organization/signatory ordering mechanics;
- no new required fields;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production AOSR business logic.

### 2026-06-16 — Frontend-only AOSR printable default snapshots extended

- Статус: `Frontend mock AOSR printable default snapshot architecture only`
- Описание: audited the AOSR editor and preview for printable values that still
  lived on object defaults/libraries and moved remaining mock printable state
  into the document draft.

Добавлено/уточнено:

- AOSR drafts now own the printed object name after creation;
- AOSR drafts now own project documentation text after creation;
- AOSR drafts now own header organization blocks and their order after creation;
- changing object default header organization order no longer silently changes
  existing drafts;
- current drafts can explicitly restore object name, project documentation and
  header organization order from current default parameters;
- AOSR drafts store printed form title metadata for the current form variant;
- selected material certificates are stored with printable snapshots in the
  draft when added;
- selected object documents are stored with printable snapshots in the draft
  when added;
- the AOSR preview no longer accepts `objectDefaults` and reads printable object
  name, header organizations and project documentation from the selected draft;
- remaining live object defaults are limited to the default settings panel,
  editor comparison/status hints, explicit restore actions, workspace chrome
  project name and object representative/search proposal sources;
- focused tests cover default copying, default changes not mutating existing
  drafts, restore-from-default behavior, header organization draft ordering,
  preview rendering from draft state and snapshot/fallback helpers.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or localStorage;
- no real registry generation;
- no package release snapshot implementation;
- no numbering settings UI;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production AOSR, registry, package or numbering business logic.

### 2026-06-23 — Section-scoped ID and section templates accepted

- Статус: `ADR 0008 section-scoped ID accepted`
- Описание: corrected the hierarchy so sections sit between object and ID
  folders, and moved live template settings from object scope to section scope.

Добавлено/уточнено:

- canonical hierarchy is now
  `Object -> DocumentationSection -> ID folders -> documents`;
- `DocumentationSection` is user-defined: `Вентиляция`, `Отопление`,
  `Водоснабжение`, `ОВ`, `ВК`, `Система В1` and similar names are examples, not
  enum values;
- intermediate ID is derived from one folder inside one section;
- final ID is derived from one section across that section's folders;
- the UI-facing template is `Шаблонные значения раздела`;
- future implementation term is `SectionTemplate`, not `ObjectTemplate`;
- linked acts resolve template-owned data through
  `global libraries -> SectionTemplate -> linked act`;
- section template settings may be copied into another section in the same
  object or another object;
- template copy includes repeated texts, numbering policy, global-library
  assignment links, labels/order/groups/subscripts;
- template copy does not copy folders, documents, drafts, released revisions,
  manual snapshots, issued packages, generated artifacts or global library
  records themselves;
- `readDocumentCreationContext` backend contract slice now reads
  object/section/folder context and returns `SectionTemplate` summary plus
  section/folder package scope.

Что не было введено:

- no frontend section UI;
- no Nest controller or HTTP route;
- no OpenAPI or DTO serialization;
- no Prisma schema/model changes;
- no migrations;
- no repository or persistence adapter;
- no template-copy persistence implementation;
- no draft creation;
- no number reservation or sequence mutation;
- no production AOSR/document creation behavior;
- no uploads, storage, renderer, queues or generation.

### 2026-06-23 — Frontend-only section workspace UX introduced

- Статус: `Frontend mock section workspace only`
- Описание: implemented the visible object workspace transition from
  object-period folders to documentation sections that contain ID folders.

Добавлено/уточнено:

- object navigation now has `Разделы ИД` and section buttons such as
  `Вентиляция` and `Отопление`;
- users can create a documentation section, then create folders inside the
  selected section;
- folder pages, AOSR creation, numbering proposals and linked template labels
  resolve through the selected section;
- object workspace settings now open as `Шаблонные значения раздела`;
- section template settings can be copied into another demo section, carrying
  repeated texts, numbering policy and global-library links/assignments;
- final ID package and derived final registry are scoped to the selected
  section's folders;
- empty object UX now starts with section creation before folder/document
  creation.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no repository, persistence adapter or localStorage;
- no real cross-object template copy;
- no production document creation;
- no number reservation or sequence mutation;
- no DOCX/PDF/ZIP generation;
- no released package snapshots or package-builder implementation.

### 2026-06-27 — Frontend-only section model architecture cleanup

- Статус: `Frontend mock section model cleanup only`
- Описание: addressed architecture review notes after commit
  `ebcede4ba33214a967b42199618e3021e1231959` without adding production
  backend behavior.

Добавлено/уточнено:

- `object-periods.ts` was replaced by `object-id-folders.ts`; frontend mock
  code now uses `DemoIdFolder`, `DemoIdFolderId`, `demoIdFolders` and folder
  helper names instead of period names;
- `DemoDocumentationSection` now has user-visible `name`, optional
  `description` and `templateSettingsId`, so a section is more than a visual
  tab;
- later correction removed inferred short section codes: the section is named
  exactly as the user names it, while numbering prefixes live only in section
  template settings;
- AOSR drafts now carry explicit `sectionId`, `folderId` and
  `sectionTemplateSettingsId` in addition to the folder's `draftIds` list;
- numbering helper accepts `sectionId` and computes `section-wide` sequences
  from the selected section, while `restart-per-folder` sequences use only the
  selected folder;
- frontend package model exposes `buildSectionFinalPackageModel`,
  `buildSectionIdPackageOverviewModel` and `buildIntermediateIdPackageModel`;
- `DemoSectionTemplateSettings` and `SectionTemplate` were introduced as the
  canonical frontend names, while old `DemoAosrObjectDefaults` /
  `objectTemplate` names remain only as compatibility aliases for the standalone
  AOSR demo tests.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no repository, persistence adapter or localStorage;
- no real move-document-between-sections command;
- no real cross-object template copy;
- no number reservation or sequence mutation;
- no production package-builder, released snapshots, DOCX/PDF/ZIP generation or
  issued package behavior.

### 2026-06-27 — Frontend-only section template copy retarget cleanup

- Статус: `Frontend mock section template copy cleanup only`
- Описание: addressed architecture review notes after commit
  `0e3df5b59066fe4060fd7174ab370671189349b3` without adding backend,
  persistence, DOCX, uploads or production generation.

Добавлено/уточнено:

- section template settings are keyed by `templateSettingsId`, matching the
  section's explicit link to its template settings;
- copying settings to another section now retargets `sectionTemplate.id` to the
  target `templateSettingsId` and `sectionTemplate.sectionId` to the target
  section id;
- copying preserves the target section numbering prefix and warns the user that
  the prefix was not copied;
- copied settings still carry repeated texts, numbering scope/suffix and
  library assignments, but do not copy folders, documents, generated packages or
  source section identity;
- strict helpers now throw on unknown folder/document-section links instead of
  silently falling back to the demo default section/folder;
- `DemoAosrDraft` now has `sectionTemplateId` as the section-scoped field, while
  `objectTemplateId` remains only as a legacy compatibility alias;
- user-created sections no longer infer short codes from names such as
  `Вентиляция`; their initial numbering prefix is empty until the user edits it.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no repository, persistence adapter or localStorage;
- no real cross-object template copy command;
- no number reservation or sequence mutation;
- no DOCX/PDF/ZIP generation or production package-builder.

### 2026-06-23 — Document creation context backend contract slice introduced

- Статус: `Documents backend application-contract slice only`
- Описание: implemented the first framework-free backend application slice for
  the previously documented `read_document_creation_context` contract.

Добавлено/уточнено:

- added `apps/api/src/documents/application/document-creation-context.ts`;
- added a `documentCreationContextReadPort` boundary token for future wiring;
- the read contract requires an explicit allowed workspace access decision
  before object/section/folder lookup;
- non-owner/missing/wrong-scope reads return leakage-safe
  `NOT_FOUND_OR_NOT_AUTHORIZED`;
- the read model accepts user-defined sections and ID folders and does not treat
  section/folder names as fixed enum values;
- the read model returns approved document types, selected section/folder,
  current `SectionTemplate` summary, live resolution chain
  `global_libraries -> section_template -> linked_working_document`,
  section/folder package scope and proposal-only numbering;
- focused backend tests cover access-decision-before-lookup behavior, arbitrary
  folders, folder-scoped proposal numbering, no reservation and leakage-safe
  missing folder denial.

Что не было введено:

- no Nest controller or HTTP route;
- no OpenAPI or DTO serialization;
- no Prisma schema/model changes;
- no migrations;
- no repository or persistence adapter;
- no draft creation;
- no number reservation or sequence mutation;
- no production AOSR/document creation behavior;
- no frontend integration, uploads, storage, renderer, queues or generation.

### 2026-06-20 — Repeated act data moved into the object template

- Статус: `Accepted UX and domain correction`
- Описание: the work contractor, additional information and copy
  count repeat across an object's acts and therefore belong to the live object
  template rather than individual act data.

Добавлено/уточнено:

- linked acts resolve all three values live from `ObjectTemplate`;
- switching to manual copies all three values into the complete
  `manualTemplateSnapshot`;
- returning to the object template deletes that snapshot and resumes live
  resolution;
- individual number, date, work description, axes, elevations, work dates,
  materials, confirmation documents and applications remain act-owned;
- template-owned sections in the act editor are collapsed by default and can
  be expanded for review;
- changing an expanded template value still requires the explicit whole-act
  switch to manual mode; no partial overrides are introduced.

Что не было введено:

- no backend/API or Prisma/schema/migrations;
- no persistence, uploads, OCR/AI or DOCX/PDF/ZIP generation.

### 2026-06-20 — Frontend mock aligned with live object-template architecture

- Статус: `ADR 0007 risks corrected in frontend mock`
- Описание: the active AOSR mock now uses the accepted live-link model end to
  end instead of treating `ObjectTemplate` as a conceptual type only.

Добавлено/уточнено:

- `DemoAosrObjectDefaults.objectTemplate` is the operational source for linked
  object-owned data;
- counterparty `fullText` is inserted once and is no longer concatenated with
  `displayName` a second time;
- signatory `introDisplayText`, `signatureText` and `signatureName` flow into
  print state without reconstruction;
- representative groups retain independent ids and explicit member lists;
  groups with equal titles are not merged;
- object-settings creation writes a global organization/signatory library item
  first and then stores its id in the object template;
- manual representative editing remains local only after the explicit whole-act
  switch to `manualTemplateSnapshot`; linked acts cannot create an act-only
  representative source;
- at this checkpoint `workContractorName` was individual act data and was not
  inferred from a hardcoded counterparty role; this classification is
  superseded by the later 2026-06-20 repeated-template-data decision;
- the noncanonical AOSR under-title field was removed from the mock model,
  editor and preview;
- preview empty sections no longer print demo helper prose, signatures render
  position/organization and name separately, and the artificial page break
  after point 5 was removed;
- object settings are named `Шаблон объекта` and explain live behavior.

Что не было введено:

- no backend/API or Prisma/schema/migrations;
- no persistence, uploads, OCR/AI or DOCX/PDF/ZIP generation;
- no variant selector, numbering settings or package-release implementation.

### 2026-06-17 — Live object template links and manual act snapshots

- Статус: `Live object template architecture accepted; frontend mock implementation scope`
- Описание: ADR 0007 supersedes document-owned defaults for active working
  template data and accepts the strict `linked` / `manual` act model.

Добавлено/уточнено:

- counterparty and signatory libraries are live current-data sources;
- object templates store links to library records, not copied printable text;
- linked acts resolve printable template data from object template and
  libraries at preview/generation time;
- manual acts store a complete `manualTemplateSnapshot`;
- switching to manual requires explicit user action and confirmation;
- returning to object template deletes the manual snapshot and restores live
  links;
- representative groups can contain several members and render with one group
  title plus all members, including signatures;
- no partial field-level overrides are allowed for template-owned data;
- individual act data edits never switch the act to manual mode;
- act number/date are raw individual values in print state; renderer code adds
  printable prefixes and date formatting;
- current frontend mock keeps legacy copied template fields on `DemoAosrDraft`
  only for manual editor compatibility, not as production linked-act storage;
- AOSR DOCX form template is separate from object template;
- future issued packages must store frozen output snapshots.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or localStorage;
- no production package release snapshot implementation;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation.

### 2026-06-16 — Frontend-only document default parameters and document-owned AOSR texts

- Статус: `Frontend mock default-parameters and document-owned text only`
- Описание: implemented and documented the principle
  `Параметры по умолчанию -> Предложение -> Самостоятельный документ`.

Добавлено/уточнено:

- visible UI wording now uses `Параметры по умолчанию` for object-level values
  copied into new documents;
- default parameters are suggestions for newly created documents and do not
  silently mutate existing drafts;
- AOSR drafts now own under-title text after creation;
- AOSR drafts now own point 6 compliance text after creation;
- creating a new AOSR draft copies the current under-title and point 6 defaults
  into the new draft;
- existing drafts show `По параметрам по умолчанию` when their document value
  still equals the current default and `Изменено в документе` when it differs;
- under-title and point 6 fields can be edited in the document and restored
  explicitly with `Вернуть из параметров по умолчанию`;
- empty under-title and point 6 values remain allowed;
- object-level defaults are held at the object workspace level in the mock so
  period-scoped creation receives the current default values;
- ADR 0007 records the future numbering rule: auto-numbering is only a
  suggestion, manual numbers may be edited or empty, manual numbers do not
  mutate the sequence, no auto-renumbering, and deleted numbers are not reused
  by default.

Что не было введено:

- no numbering settings UI;
- no real registry generation;
- no package release snapshot implementation;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production AOSR, registry, package or numbering business logic.

### 2026-06-15 — Frontend-only radical UX cleanup

- Статус: `Frontend mock radical UX cleanup only`
- Описание: UX cleanup: reduced interface overload, simplified default parameters,
  clarified primary actions.

Добавлено/уточнено:

- Object Overview was reduced to object identity, one prominent
  `Создать документ` action, a current-period shortcut and recent documents;
- duplicate object-level entry points were reduced: global representative and
  organization libraries stay in global navigation, while object assignments
  stay inside default parameters;
- default parameters were redesigned into calm sections: `Основное`,
  `Шапка акта`, `Представители`, `Тексты акта`;
- AOSR readiness hints are compact `Подсказки по акту` by default;
- period, periodic ID and final ID pages keep registries/composition but use
  shorter generated-view copy;
- the product direction is one obvious path per screen, not a dashboard of
  equal-weight buttons.

Что не было введено:

- no new business features;
- no AOSR variant selector;
- no changes to organization order mechanics;
- no new required fields;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production AOSR business logic.

### 2026-06-15 — Frontend-only UX overload cleanup

- Статус: `Frontend mock UX overload cleanup only`
- Описание: UX cleanup: reduced interface overload, simplified default parameters,
  clarified primary actions.

Добавлено/уточнено:

- Object Overview keeps `Создать документ` as the only visually prominent
  primary action;
- secondary object/package navigation remains available but is visually calmer;
- readiness wording now uses softer `Подсказки` labels instead of
  `Проверка`/`Диагностика` copy where appropriate;
- final and periodic package summary counters are visually de-emphasized outside
  Overview;
- default parameters were regrouped into calmer reusable printed-document data:
  основное, point 6 text, header organizations and representatives for acts;
- AOSR workspace default parameters entry is secondary, while document preview
  remains the more prominent act-level action.

Что не было введено:

- no new business features;
- no AOSR variant selector;
- no changes to organization order mechanics;
- no new required fields;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production AOSR business logic.

### 2026-06-14 — Frontend-only derived period and final registry UX

- Статус: `Frontend mock derived registry architecture only`
- Описание: corrected the period-first registry architecture so registry is a
  generated view inside Periodic ID or Final ID, not a standalone object
  section.

Добавлено/уточнено:

- added a frontend-only derived registry helper/model for period and final
  registries;
- period registry rows derive from documents in the selected period;
- final registry rows derive from documents across all periods;
- registry rows include row number, document type code/title, document number,
  document date, period name and document/work description;
- registry code/title use registered act type metadata, so future document
  types can enter the registry without AOSR-only one-off logic;
- period page now renders a real derived `Реестр периода` table that updates
  when a frontend-only AOSR draft is created in that period;
- Periodic ID includes the period registry as the first group;
- Final ID includes the final registry as the first group;
- the old standalone `ObjectRegistryPage` frontend file was removed from the
  current mock.

Что не было введено:

- no standalone object registry nav/page/entity;
- no editable registry rows;
- no closed period status;
- no issued or locked package state;
- no package or registry persistence;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or localStorage;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no production registry/package business logic.

### 2026-06-09 — Frontend-only act type metadata prep introduced

- Статус: `Frontend mock act type metadata cleanup only`
- Описание: introduced a small frontend-only act type metadata registry and
  routed current derived AOSR registry/package/tree labels through it.

Добавлено/уточнено:

- act type metadata now has `id`, `code`, `title` and `registrySectionName`;
- only one act type is registered now: AOSR;
- no new act forms, editors, previews or document implementations were added;
- the object workspace document tree uses act metadata for the AOSR folder
  label;
- Registry V1 derives AOSR row labels and section names from act metadata;
- Final Package V1 derives AOSR act item titles/details from act metadata;
- registry terminology now uses `Сведения` instead of treating document type as
  status;
- object certificates no longer show `Используется в актах`, because
  certificates remain global quality-document entities referenced by objects and
  acts;
- certificates with several materials render the full `materials[]` list;
- focused frontend tests cover act metadata registration, registry rendering,
  final package rendering, certificate usage-column removal and multi-material
  certificate rendering.

Что не было введено:

- no new act types beyond AOSR;
- no new act editor or preview;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF generation;
- no auth/session/login/register;
- no share codes/grants;
- no production registry, package, certificate, object-document or AOSR
  business logic.

### 2026-06-09 — AOSR Readiness Panel V1 and Final Package Readiness V1 introduced

- Статус: `Frontend mock readiness diagnostics only`
- Описание: added compact readiness cards for the current AOSR act and final
  ID package using only existing frontend demo data.

Добавлено/уточнено:

- AOSR workspace now shows `Проверка заполнения` near the current act summary;
- AOSR readiness derives simple warnings for missing signatories, selected
  materials, selected object documents and point 6 compliance text;
- ready AOSR state shows `🟢 Поля заполнены`, warning state shows
  `🟡 Есть пустые разделы`;
- final package page now shows `Проверка комплекта`;
- final package readiness warns when there are no acts, no certificates or no
  object documents in the derived mock package;
- future versions may validate attached files, signatures, document statuses
  and issued/reviewed states, but this slice does not implement those checks;
- focused frontend tests cover readiness panel rendering, missing-data
  warnings, ready act state and final package readiness rendering.

Что не было введено:

- no real validation engine;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no uploads or file storage;
- no OCR or AI extraction;
- no DOCX/PDF/ZIP generation;
- no auth/session/login/register;
- no share codes/grants;
- no production registry, package, certificate, object-document or AOSR
  business logic.

### 2026-06-29 — Object workspace section UX contract tightened

- Статус: `Frontend mock UX-polish only`
- Описание: tightened the object workspace around the agreed hierarchy
  `Object → Section → Folder → Act`, without adding backend, persistence or file
  generation.

Добавлено/уточнено:

- object overview no longer shows `Последние документы`; it explains the user
  path `Объект → раздел → папка → акт`;
- left navigation is a section/folder tree: sections, section template values,
  folders and final ID by section are visible, but acts are not shown in the
  global tree;
- folders show the current folder act list and a compact action to open
  `Промежуточная ИД по папке`;
- folder registry/table is not embedded in the working folder screen; registry
  and print composition live on the intermediate ID package page;
- final package wording is section-scoped: `Итоговая ИД по разделу`;
- section template copy UI uses a frontend clipboard model with compact
  `Скопировать` / `Вставить` actions;
- copying section template values copies repeated texts, library links and
  numbering settings, but preserves the target section numbering prefix;
- act creation uses a real radiogroup selection for the currently available
  AOSR type; disabled future types are not selected;
- numbering supports `section-wide` and `restart-per-folder`; previews show
  `n` as the sequence placeholder;
- manual edits to an act number mark numbering as manual and show a warning
  without switching the whole act to manual-template mode;
- unused frontend mock fields were removed from demo section/draft data.
- creating an act inside a folder immediately opens the created act editor;
- final/intermediate package buttons are active mock actions with explanatory
  messages, not disabled blockers.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or repositories;
- no real cross-object copy command;
- no DOCX/PDF/ZIP generation changes;
- no production number reservation;
- no production package-builder or released package snapshots.

### 2026-06-29 — ИДея brand and cross-object section-template clipboard

- Статус: `Frontend mock UX-polish only`
- Описание: integrated the product name `ИДея` into the frontend UI and made
  the section-template clipboard survive object switches inside the frontend
  mock.

Добавлено/уточнено:

- product-facing UI name is `ИДея`;
- main dashboard tagline is
  `ИДея — рабочее место ПТО для исполнительной документации`;
- repository/package technical names such as `pto-id-system` remain unchanged;
- section template clipboard state now lives above `ObjectWorkspacePage`, so a
  user can copy template values in one object/section, return to the dashboard,
  open another object/section and paste there;
- the clipboard stores source object id/title, source section id/name and a
  section template settings snapshot;
- pasting is blocked only for the same source object and same source section;
- pasting into another section of the same object or a section of another object
  uses the same retargeting rule and preserves the target section prefix;
- paste now asks for confirmation before replacing current section template
  values;
- the copy/paste block is compact: short `Скопировать`/`Вставить` actions,
  compact buffer status and a collapsed explanation of what is copied.

Следующий этап после этого UX-cleanup:

- подключить DOCX-шаблон АОСР;
- на первом шаге хранить шаблон как repo/public asset, совместимый с Vercel;
- строить генерацию из `AosrPrintState`, а не из UI-компонентов напрямую;
- сначала проверить один шаблон АОСР end-to-end;
- после стабилизации масштабировать подход на разные формы заказчиков.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence;
- no real DOCX/PDF generation yet;
- no ZIP/final package generation;
- no production number reservation or released package snapshots.

### 2026-06-29 — Section numbering cleanup and mass renumbering

- Статус: `Frontend mock UX/data cleanup only`
- Описание: removed object-wide numbering from the frontend mock and aligned
  section template settings with the current product decision.

Добавлено/уточнено:

- section template numbering now has two modes: `automatic` and `manual`;
- automatic numbering supports only `section-wide` and
  `restart-per-folder`;
- section template settings own `numberingStart`; invalid values normalize to
  `1`;
- manual section numbering creates new acts without a number, does not ask for
  a number during creation and does not switch the act template mode to manual;
- settings include `Пронумеровать все акты раздела`, which renumbers existing
  acts in section folder order and changes only `actNumber` plus automatic
  numbering assignment;
- section template clipboard stores a cloned snapshot, not a live reference;
- dashboard settings are shown as `Настройки · скоро`, not as an active no-op;
- product copy uses `В приложении «ИДея»...` where the declined brand name would
  otherwise read awkwardly.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no persistence or production number reservation;
- no DOCX/PDF/ZIP generation changes.

### 2026-06-29 — Section-wide scope naming cleanup

- Статус: `Frontend mock naming cleanup only`
- Описание: renamed the remaining section numbering scope and helper names
  before starting the DOCX template stage.

Добавлено/уточнено:

- internal section-wide automatic numbering scope is now `section-wide`, with
  no remaining global-style scope name in the active model;
- object-wide numbering was not returned;
- numbering helpers now use section-based names:
  `updateDemoSectionNumbering...`;
- while `objectTemplate` remains a legacy compatibility alias, numbering helper
  updates now build from `sectionTemplate` and assign the same next section
  template into both alias fields;
- mass renumber confirmation now includes the number of affected acts.

Что не было введено:

- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no DOCX/PDF/ZIP generation;
- no project-wide rename of all legacy `objectDefaults` / `objectTemplate`
  aliases.

### 2026-06-29 — Single AOSR DOCX download v1

- Статус: `Frontend-only DOCX generation slice`
- Описание: connected the first static AOSR DOCX template and added one-act
  DOCX download from the act editor.

Добавлено/уточнено:

- the tagged AOSR template is stored as a static public asset at
  `apps/web/public/templates/aosr/AOSR1_template_final_tags_corrected.docx`;
- the provided real AOSR acts are stored only as reference fixtures at
  `docs/examples/aosr-real-acts/АОСР.docx`;
- `docs/aosr-docx-generation-notes.md` records practical formatting notes from
  the real acts before wiring generation;
- generation follows
  `AosrPrintState -> buildAosrDocxTemplateData -> DOCX template -> downloaded .docx`;
- the frontend does not read printable data from DOM/UI components;
- `buildAosrDocxTemplateData` keeps raw `document.number` and `document.date`
  and adds computed `document.numberLine` and `document.dateLine` for the
  template;
- empty act numbers are allowed; the DOCX field stays empty and the download
  filename falls back to `АОСР_без_номера.docx`;
- the act editor has a real `Скачать DOCX` action; failures show
  `Не удалось сформировать DOCX. Проверьте шаблон акта и данные документа.`;
- `fflate` is used in the web app to unpack/repack the DOCX template in the
  browser.

Что не было введено:

- no PDF generation;
- no ZIP/final/intermediate package generation;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no production storage;
- no production seed from real acts;
- no object-wide numbering rollback.

### 2026-06-30 — AOSR DOCX split-run renderer fix

- Статус: `Frontend-only DOCX runtime fix`
- Описание: fixed the first AOSR DOCX download failure found in the real static
  DOCX template.

Добавлено/уточнено:

- the act editor still shows the same user-safe failure message, but now also
  logs `AOSR DOCX generation failed` with the original error to `console.error`;
- the real static template was smoke-tested through the generator, not through
  a pseudo mock;
- the actual failure was `AOSR DOCX template block is not closed: foreach`;
- the cause was Word split-runs in several closing `</foreach>` template tags:
  the visible tag text was continuous, but the XML stored it across multiple
  `<w:t>` / `<w:r>` runs;
- `renderAosrDocxTemplateBytes` now renders DOCX bytes from a static template
  and `AosrPrintState`, so generator tests do not depend on browser download
  APIs;
- the renderer normalizes split Word template tags before parsing loops and
  fields, while leaving the template asset itself unchanged;
- the smoke-test unzips the generated DOCX, checks `word/document.xml`, verifies
  that service tags are gone and confirms representative/material/contractor
  values from `AosrPrintState`.

Что не было введено:

- no edits to the DOCX template or template tags;
- no PDF generation;
- no ZIP/final/intermediate package generation;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no production storage;
- no DOM/UI data reads.

### 2026-06-30 — AOSR DOCX formatting quality pass

- Статус: `Frontend-only DOCX formatting fix`
- Описание: tightened the first single-AOSR DOCX output after checking the
  downloaded `ОВ-1` act against the current tagged template.

Добавлено/уточнено:

- work start/end dates are printed as Russian date lines, for example
  `«01» сентября 2026 г.`;
- point 7 stores/prints only the next-work fragment after the static template
  prefix `Разрешается производство последующих работ по:`;
- work description, axes and elevations are joined without `.;` artefacts;
- material certificate lines no longer repeat the certificate number after the
  document name;
- object-document application lines print `title + reference` without repeating
  the document type as `Тип / номер`;
- demo print strings normalize `N ...` to `№ ...`;
- the real-template smoke-test now renders the current demo AOSR and checks for
  the known bad strings in `word/document.xml`.

Что не было введено:

- no PDF generation;
- no ZIP/final/intermediate package generation;
- no backend routes/controllers or API;
- no Prisma/schema/migrations;
- no production storage;
- no generic Word layout engine.

### 2026-06-30 — AOSR DOCX paragraph/layout and download UX polish

- Статус: `Frontend-only DOCX quality/UX polish`
- Описание: tightened the real-template renderer and beginner-facing download
  area after visual checking the generated `ОВ-1` DOCX.

Добавлено/уточнено:

- the DOCX template asset was not edited; the fix is in the renderer and tests;
- `foreach` blocks in Word XML are now rendered as complete paragraphs when the
  opening/closing tags live inside paragraph runs, so repeated counterparty and
  signature groups do not glue into the previous paragraph;
- service tabs that Word stores before a paragraph-level block tag are removed
  before rendering, preventing final signature lines from starting too far to
  the right while preserving the right-side tab before the signature name;
- generated signature paragraphs with bottom borders receive `keepNext` and
  `keepLines` in OOXML, so a group title is less likely to be orphaned from its
  signature line during Word pagination;
- the real-template smoke-test now checks paragraph-aware counterparty
  separation, `N -> №` regressions including material passports, signature-line
  tab placement and `keepNext` markers;
- the act editor now separates `Скачать DOCX` into a `Действия с актом` block
  with a non-blocking reminder to check number, date, work period, materials,
  applications and signatories;
- linked/manual wording in the act editor is user-facing: `Данные из раздела`,
  `Используются общие данные раздела...` and `Редактировать только для этого
акта`.

Ограничения:

- full LibreOffice render/rasterization was not available locally because the
  bundled headless LibreOffice could not load `liblcms2.2.dylib`;
- QuickLook was used for first-page visual checking, while later pages and
  signature behavior are covered structurally through DOCX XML and tests;
- the renderer remains a narrow frontend-only handler for the current tagged
  AOSR template, not a universal Word-template engine.

### 2026-06-30 — AOSR preview parity, list captions and act deletion

- Статус: `Frontend-only AOSR DOCX/preview parity and act deletion`
- Описание: applied the agreed user corrections after reviewing the current
  tagged AOSR template and the downloaded demo act.

Добавлено/уточнено:

- Russian date lines now use guillemets in UI/preview/DOCX, for example
  `«04» сентября 2026 г.`;
- DOCX post-processing keeps explanatory subscript/caption paragraphs for
  point 3, point 4 and applications to one occurrence after the generated list;
- the DOCX applications block receives keep markers so `Приложения:` is not
  orphaned from the list during normal Word pagination;
- the HTML preview uses the real template captions and the final signature
  structure from the downloaded DOCX instead of the earlier simplified
  three-column preview;
- editor section numbering is now sequential: 8 `Последующие работы`, 9
  `Дополнительные сведения / экземпляры / подписи`, 10 `Приложения`;
- the act editor has `Удалить акт` in `Действия с актом`; deletion requires
  confirmation and removes the draft from the object folder list as well as the
  draft collection.

Ограничения:

- the DOCX template file and its tags were not edited;
- no PDF/ZIP/backend/storage work was added.

### 2026-06-30 — Folder act deletion, drag reorder and DOCX-template preview

- Статус: `Frontend-only object workspace UX polish`
- Описание: added the next object-workspace corrections for folder act actions,
  automatic numbering order and AOSR preview behavior.

Добавлено/уточнено:

- folder act cards now include `Удалить акт`; the action asks for confirmation
  and removes the draft from both the folder `draftIds` and the draft collection;
- the act list in a folder and the embedded editor side list support drag/pointer
  reordering with visual feedback; when section numbering is automatic, numbers
  are recalculated from the current folder order;
- folder helpers preserve `draftIds` order, which is now the source of truth for
  folder act display and reorder behavior;
- the noisy section-template summary cards (`Как применяются значения`,
  `Организации`, `Представители`, `Нумерация`) were removed from the settings UI;
- AOSR preview now generates the same DOCX as download and renders it through
  `docx-preview`; the old manual HTML act preview was removed from the product
  component so users do not see a CSS imitation of the Word form.

Ограничения:

- no PDF/ZIP/backend/storage work was added;
- DOCX preview is browser-side and depends on `docx-preview`; if browser-side
  rendering fails, the UI asks the user to download and check the DOCX instead
  of showing a fake HTML copy.

### 2026-07-01 — Folder reorder stability, DOCX manual-fill lines and AI prep

- Статус: `Frontend-only UX/DOCX polish and architecture prep`
- Описание: applied the next user corrections for act-card alignment, long
  numbers, signature wrapping, empty printable fields and drag reorder
  stability.

Добавлено/уточнено:

- folder act cards and the embedded act tree now truncate long act numbers
  safely instead of letting the number collide with the act type/date text;
- folder drag/drop supports both directions, including the two-row case where a
  user drags the first act below the second; automatic section numbering is
  recalculated after reorder;
- drag animations use a small FLIP transition for smoother visual movement;
- the left object tree now uses SVG icons for object overview, sections,
  settings, folders, final ID and object documents instead of placeholder
  glyphs;
- DOCX template data keeps signature surname and initials together with a
  non-breaking space, preventing `Иванов И.И.` from splitting between lines;
- empty non-template printable fields are converted to two underlined
  manual-fill lines, so a printed act can still be filled by hand;
- `docs/ai-and-temporary-infrastructure-prep.md` records the temporary
  infrastructure direction and the first AI-assistant architecture notes.

Ограничения:

- the DOCX template asset was not edited because the signature issue was caused
  by breakable data, not by template markup;
- no backend/API/database/storage was implemented;
- no AI ingestion/generation code was implemented yet.

### 2026-07-01 — Signature alignment and pointer drag stabilization

- Статус: `Frontend-only DOCX/drag regression fix`
- Описание: fixed the follow-up regressions reported after checking the
  preview and manual drag behavior in the object workspace.

Добавлено/уточнено:

- generated DOCX signature paragraphs with bottom borders are forced to
  left-aligned Word paragraphs instead of `both`/justify alignment, so the
  position text stays on the left and the right-tabbed surname/initials are not
  visually split by stretched spaces;
- folder and editor act reordering now chooses the target by the pointer
  Y-coordinate against list item midpoints, not by `elementFromPoint`, which is
  unstable while pointer capture/animation is active;
- the folder act list listens for pointer move/up on the whole list, not only on
  the small drag handle;
- native draggable attributes were removed from the folder card gesture path to
  avoid the browser drag ghost conflicting with custom pointer reordering;
- browser checks covered editor side-list top→bottom and bottom→top, plus folder
  card top→bottom and bottom→top.

Ограничения:

- the DOCX template file itself was not edited; the renderer normalizes the
  generated signature paragraphs.

### 2026-07-01 — Scoped AOSR DOCX caption regression tests and agent guardrails

- Статус: `Frontend-only AOSR DOCX regression coverage / documentation cleanup`
- Описание: closed the residual audit note around statutory captions and
  outdated scaffold guardrails.

Добавлено/уточнено:

- the real-template DOCX smoke-test now proves captions inside their exact
  sections: point 3 materials, point 4 confirmation documents and
  `Приложения:`;
- the applications caption is asserted once as its own paragraph, so it cannot
  silently repeat after each application item;
- the narrow renderer behavior was documented in code as AOSR-specific cleanup,
  not a generic Word-template engine;
- `docs/AGENTS.md` now records that one frontend-only single-AOSR DOCX download
  is already implemented and allowed, while backend generation, PDF, ZIP,
  package downloads, storage, Prisma domain models, auth, AI/OCR, package
  builder and new act types still require separate tasks.

Ограничения:

- the DOCX template asset and normative applications caption were not changed;
- no PDF/ZIP/backend/storage/auth/AI work was added.

### 2026-07-07 — ID register DOCX foundation

- Статус: `Frontend-only register print-state foundation`
- Описание: prepared the first real-register architecture slice after reviewing
  4 correct ventilation register samples.

Добавлено/уточнено:

- `docs/register-docx-generation-notes.md` records the practical structure of
  the real registers: contractors, working drawings, quality documents,
  execution documents/acts, executive schemes and journals;
- the register can be scoped either to one ID folder for intermediate ID or to
  the whole selected section for final ID;
- register source data is structured section/folder data, not DOM/UI text;
- `IdRegisterPrintState` was added as the first frontend-only data contract for
  future DOCX generation;
- folder/section builders keep each act as its own row and deduplicate
  certificates plus used object/section documents such as schemes and journals;
- `docs/03-registry-model.md` now reflects the folder-vs-section register
  scope and the rule that the `Журналы` block remains in the printed structure.

Ограничения:

- no DOCX register template or download button was added yet;
- no backend/API/storage/Prisma migration was added;
- no PDF/ZIP/package builder/AI/OCR work was added;
- real register files remain reference examples only, not production seed data.

### 2026-07-07 — First frontend-only ID register DOCX download

- Статус: `Frontend-only register DOCX download`
- Описание: connected the first downloadable DOCX register from the structured
  register print-state.

Добавлено/уточнено:

- `IdRegisterPrintState` now feeds a narrow DOCX renderer for both supported
  scopes: one folder and the whole selected section;
- the object workspace download areas now offer `Скачать реестр папки DOCX` and
  `Скачать реестр раздела DOCX`;
- the UI copy explicitly avoids promising full intermediate/final ID packages:
  PDF, ZIP and package generation remain out of scope;
- the renderer creates a Word `.docx` with landscape page setup, register
  sections, dynamic tables and repeated table header rows;
- unit/UI coverage checks generated DOCX XML content, filenames and smoke
  download actions.

Ограничения:

- the register renderer is programmatic and narrow, not a generic Word-template
  engine;
- no static tagged DOCX register template was added yet;
- no backend/API/storage/Prisma migration was added;
- no PDF/ZIP/package builder/auth/AI/OCR/AOSR renderer work was added.
