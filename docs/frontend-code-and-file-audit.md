# Frontend code and file audit

Date: 2026-08-04

Scope: the current frontend mock and its documentation. This audit records
cleanup decisions only; it does not authorize new product behavior.

## Removed

- `id-register-docx-generator.ts` and its tests: premature frontend DOCX
  register export.
- `id-register-print-state.ts` and its tests: data contract used only by the
  removed export.
- `DemoAosrReadinessPanel.tsx` and `demo-aosr-readiness.ts`: orphaned readiness
  presentation/model files with no imports.
- `PlaceholderPage.tsx`: unused placeholder page.
- `register-docx-generation-notes.md`: engineering notes for functionality no
  longer present.
- Unused exported helpers from `demo-aosr-ui.ts`, `demo-aosr-workspace.ts` and
  `object-final-package-model.ts`.

## Kept

- `DerivedRegistryTable.tsx` and `object-registry-model.ts`: the readonly
  folder/section registry remains a derived projection of structured data.
- `ObjectFinalPackagePage.tsx`: readonly intermediate/final composition screens
  remain useful without download actions.
- `DocumentPreviewDrawer.tsx`: generic drawer/chrome boundary independent from
  AOSR rendering.
- `section-template-clipboard.ts`: explicit cross-object UI clipboard boundary.
- `object-workspace-types.ts`, `act-types.ts` and
  `aosr-docx-template-data.ts`: small domain/view contracts with clear owners.
- `main.tsx`, `vite-env.d.ts` and `config/env.ts`: expected framework and
  configuration boundaries.

## Duplication findings

Some object-workspace and standalone AOSR demo paths intentionally share the
same in-memory model while presenting different shells. Consolidating their
render trees now would mix navigation, embedded editing and standalone demo
compatibility. The duplicated prop wiring is visible but safer than a generic
page abstraction at the current stage.

The test-only preview text builder remains in the workspace test file. It
validates resolved template data without adding a test API or alternate render
path to production code. Lifecycle and DOM publication are covered separately
by focused `DemoAosrPreview` mocks.

## Safe consolidations

- Extract repeated `DemoObjectSettingsPanel` prop assembly after the embedded
  and standalone modes stop evolving independently.
- Split pure section/folder selection derivations from `ObjectWorkspacePage`
  when a persistent application state boundary is introduced.
- Group stable DOCX XML normalization helpers by Word concern while retaining
  one narrow AOSR renderer and the current real-template smoke tests.

## Future candidates

- `styles.css` (about 5.8k lines): split by stable feature ownership after the
  component boundaries settle.
- `demo-aosr-workspace.ts` (about 2.2k lines): separate immutable model types,
  print-state resolution and mutation helpers without changing semantics.
- `ObjectWorkspacePage.tsx` (about 1.7k lines): extract state orchestration only
  after backend/persistence contracts exist.
- `DemoAosrWorkspacePage.tsx` (about 1.1k lines): reduce settings/editor prop
  assembly after standalone compatibility is retired or formalized.
- `aosr-docx-generator.ts` (about 1.0k lines): keep renderer-specific modules
  narrow; do not turn them into a generic Word engine.

These are review candidates, not approved rewrite tasks.

## Must not combine

- Structured AOSR data and generated DOCX bytes.
- Editable source fields and readonly registry rows.
- Section template values and individual act data.
- Linked working data, manual act snapshots and released output snapshots.
- AOSR DOCX rendering and future register/package generation.
- Global reusable libraries and object/section-owned copies.
- Product navigation state and speculative URL/session persistence.

## Large components and boundaries

Large files are not treated as defects by line count alone. The current files
contain dense demo behavior and tests around accepted invariants. Refactors must
preserve manual numbering, section scope, template linkage, evidence identity,
preview cancellation and readonly derived projections. Mechanical splitting
without a stable owner boundary would increase cross-file coupling.

## Overgeneralization risks

- A generic document constructor would weaken typed AOSR contracts.
- A generic DOCX engine would blur immutable form-template behavior and current
  real-template fixes.
- A generic registry editor would make a derived projection a source of truth.
- A generic workspace router before persistence/auth contracts would create URL
  semantics the product has not ratified.
- A generic package/download layer in the frontend would bypass the future
  asynchronous, snapshot-based package boundary.

## Navigation findings

The active app uses the existing `createBrowserRouter` shell with one `/` route.
Dashboard/workspace selection, chosen object, section and folder remain local
in-memory React state. There is no route registry for product screens, no deep
link contract, no browser-history synchronization, no local/session storage
hydration and no speculative workspace URL scheme. No additional SPA routing
was introduced by this stabilization.

## DOCX template history

The current tagged template is
`apps/web/public/templates/aosr/AOSR1_template_final_tags_corrected.docx` with
Git blob id `8a27231b17216432d0b3b12ebecadc01f079d259`.

Repository history shows the material template update in commit `15781c4`; the
older blob was `9983af...`. The active narrow renderer contains explicit Word
layout stabilization for signature paragraphs, applications and final
signature tables. This audit does not change the template asset. Preview and
download continue to use the same AOSR template and structured
`AosrPrintState` input.
