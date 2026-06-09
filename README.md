# PTO ID System

Web-система автоматизации исполнительной документации для инженеров ПТО.

Текущий статус:

```text
FIRST ALLOWED INFRASTRUCTURE BOOTSTRAP SCAFFOLD ACCEPTED; CANONICAL ADR BASELINE ACCEPTED; BACKEND MODULE ARCHITECTURE SKELETON INTRODUCED; FIRST TECHNICAL FRONTEND-BACKEND STATUS SLICE INTRODUCED; DATABASE FOUNDATION TECHNICAL SLICE INTRODUCED; OBJECT STORAGE FOUNDATION TECHNICAL SLICE INTRODUCED; AUTH SHARING IMPLEMENTATION PLAN ADDED; USER IDENTITY SKELETON INTRODUCED; GLOBAL SYSTEM ADMIN MARKER INTRODUCED; OWNED WORKSPACE BASELINE INTRODUCED; FIRST MOCK AOSR DEMO UI SLICE INTRODUCED; MOCK AOSR DEMO UX/PREVIEW REFINED; MOCK APP SHELL AND OBJECT DASHBOARD INTRODUCED; FRONTEND-ONLY MOCK REPRESENTATIVES/ORGANIZATIONS MANAGEMENT PAGE INTRODUCED; FRONTEND-ONLY MOCK CERTIFICATE LIBRARY PAGE INTRODUCED; STAGE 5 MOCK AOSR WORKSPACE UX STABILIZED; AOSR EDITOR UX CLEANUP INTRODUCED; AOSR WORKSPACE DRAWER UX INTRODUCED; FRONTEND-ONLY MOCK OBJECT DOCUMENT LIBRARY INTRODUCED; AOSR WORKSPACE APPLICATIONS UX CLEANUP INTRODUCED; FRONTEND-ONLY MOCK OBJECT COMPLIANCE DEFAULTS AND ACT OVERRIDES INTRODUCED; FRONTEND-ONLY MOCK OBJECT WORKSPACE VISUAL PASS INTRODUCED; FRONTEND-ONLY MOCK OBJECT WORKSPACE SHELL INTRODUCED; AOSR DOCUMENT PREVIEW DRAWER UX INTRODUCED; AOSR DOCUMENT PREVIEW PAGE VISUALIZATION REFINED; FRONTEND-ONLY OBJECT DOCUMENT WORKSPACE INTRODUCED; FRONTEND-ONLY OBJECT CERTIFICATE WORKSPACE INTRODUCED; FRONTEND-ONLY ID REGISTRY V1 INTRODUCED; FRONTEND-ONLY FINAL ID PACKAGE MOCK INTRODUCED; FRONTEND-ONLY ACT TYPE METADATA PREP INTRODUCED; AOSR READINESS PANEL V1 INTRODUCED; FINAL PACKAGE READINESS V1 INTRODUCED
```

В репозитории принят первый разрешённый scaffold. Это только infrastructure/bootstrap
foundation: workspace, tooling, app shells, shared placeholders, env/config foundation
and CI quality gates. Backend module boundaries are now introduced as an
architecture skeleton only.

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
`ДЕМО / демонстрационные данные / не для работы в продуктиве` and intentionally
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

Stage 5 clarified the mock AOSR workspace UX: object settings stay behind a
compact button, the middle column is now presented as `Рабочая область акта`,
and the UI copy separates `Настройки объекта` from `Текущий акт`. The intended
future model remains `global library -> object binding/snapshot -> act usage`.
For demo convenience, object representatives may still be prefilled from the
global mock library; in the real system the user will choose/bind them for the
object. Exact Word-like AOSR preview matching remains a separate future stage.

The AOSR editor UX cleanup keeps the scope frontend-only and moves object
settings out of the inline act editor into a button-opened dialog. The act
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

The frontend-only mock object compliance defaults step moves point 6 compliance
text into object settings under `Нормативная и проектная база объекта`. The
current AOSR act consumes that object value by default, shows
`Используется значение объекта`, supports `Изменить только для этого акта` as a
per-act override, and can revert back to the object value without changing
object defaults. This remains in-memory demo UI only and introduces no backend,
persistence, Prisma/schema/migration, uploads, OCR/AI, generation, auth,
sharing or production business logic.

The frontend-only mock object workspace visual pass makes the object workspace
closer to the clean UI reference: a stronger object header, compact status
cards, clearer three-column rhythm, calmer editor sections, more consistent
drawers and a better-framed preview panel. It does not change AOSR business
logic, data model, backend, persistence, uploads, OCR/AI, DOCX/PDF generation,
auth, sharing or production behavior.

The frontend-only mock object workspace shell makes the object the central
opened entity. Opening an object now shows object-level navigation with `Акты`,
`Сертификаты`, `Документы объекта`, `Представители`, `Реестр ИД` and
`Настройки объекта`. AOSR remains the existing editor but now lives under
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

The frontend-only object certificate workspace replaces the object certificates
placeholder with a real in-memory quality-document registry for the opened
object. It reads and writes through the existing frontend demo certificate
store already used by the certificate library and AOSR material drawer. The
page lists certificates, passports, declarations and other material/equipment
documents with simple category filters, derived summary counts and a compact
local add form. Certificates remain global quality-document entities referenced
by objects and acts; the object certificates page no longer presents them as
owned by or counted through act usage. Certificate materials render from the
existing `materials[]` structure, including multi-material certificates. This
creates a frontend-only foundation for future ID registry/package flows while
adding no backend, persistence,
uploads, file storage, Prisma/schema/migrations, API routes, auth, OCR/AI,
DOCX/PDF generation or production business logic.

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
- frontend-only object compliance defaults and act overrides: object-level
  normative/project base text for point 6, default act consumption, per-act
  override/revert behavior and preview updates, with no backend, persistence,
  Prisma/schema/migration, auth, uploads, generation or production business
  logic.
- frontend-only object document workspace: object-level document registry UI
  with mock filters, summary counts, AOSR usage labels and local in-memory
  creation, sharing the demo object document source with the AOSR point 4 drawer
  and adding no backend, persistence, uploads or production document storage.
- frontend-only object certificate workspace: object-level quality document
  registry UI with mock filters, summary counts, multi-material certificate
  rendering from `materials[]` and local in-memory creation, sharing the
  existing global demo certificate source with the certificate library and AOSR
  material drawer and adding no backend, persistence, uploads or production
  certificate storage.
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

The backend module skeleton includes module boundaries, README ownership notes,
placeholder tokens/ports, `apps/api/src/ARCHITECTURE.md`, and ESLint import
guardrails. It intentionally does not include business/domain implementation.

The technical status, database foundation and object storage foundation slices
intentionally do not add domain readiness, business commands, CRUD APIs,
OpenAPI, domain database state, file APIs or real use cases. They exist only to
validate frontend -> backend connectivity, shared types, env-driven API/storage
configuration, Prisma client generation and infrastructure health boundaries.
The AOSR demo screen is now opened from the mock object dashboard. It remains a
frontend-only mock for feedback, not a production workflow. Its mock
printed-page preview separates object-level defaults from current-act fields,
lets the current act reuse mock representatives and mock certificate/material
records, derives applications at the final end of the preview before final
signature blocks, and remains without real PDF generation, certificate library
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
with canonical ADR 0001-0005 in `docs/adr/`.

Feature coding remains blocked until a separate explicit feature/database/API
task is requested and checked against the ADR baseline, `docs/19` access model
`docs/20` phased plan, and project memory. The current dashboard/object cards
and AOSR screen are mock UI only and must not be treated as domain
implementation.

Recommended next step: collect user feedback on the mock AOSR demo screen.
Phase 4 workspace share codes, domain schema, migrations, production AOSR,
packages, uploads/file APIs, queues, sharing grants and AI remain separate
explicit tasks.
