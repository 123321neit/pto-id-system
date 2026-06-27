# ADR 0008: Section-scoped ID workspaces and section templates

Status: Accepted

Date: 2026-06-23

## Context

Real executive documentation work inside one construction object is usually
split by user-visible engineering/work sections: ventilation, heating,
water-supply, sewerage, electrical, a custom system, or another user-defined
scope.

The previous accepted working model was:

```text
Object -> user-defined ID folders -> documents
```

That is not enough when a folder is named `Вентиляция`: the user then has no
clean place to create intermediate ID folders inside ventilation, and final ID
would incorrectly aggregate the whole object instead of the chosen section.

## Decision

The canonical working hierarchy is now:

```text
Object
  -> DocumentationSection
      -> SectionTemplate
      -> user-defined ID folders
          -> typed documents
      -> intermediate ID by folder
      -> final ID by section
```

`DocumentationSection` is user-defined. Its visible name is exactly the name the
user chooses, such as `Вентиляция`, `Отопление`, `Водоснабжение`,
`Канализация`, `Электрика` or any custom work/system name. The section model
must not require or infer a separate short code from the section title.

The template used by linked working acts belongs to the section, not directly to
the object. In the UI this is called:

```text
Настройки шаблона раздела
```

`SectionTemplate` owns section-specific repeated print values, numbering policy,
organization assignments, representative groups and links to global libraries.
Linked working acts resolve template-owned printable data through:

```text
global libraries -> SectionTemplate -> linked working act
```

Manual acts still use one complete `manualTemplateSnapshot`. Released document
revisions and released package snapshots remain immutable.

Object-level data still exists for object identity and shared object context:
object name, address, workspace ownership and other object facts. However,
printable act template settings for one documentation workflow live in the
section template.

## Section template copy rule

A user may copy section template settings into another section in the same
object or another object, subject to workspace authorization.

Copying a section template copies:

- repeated template texts;
- numbering policy/settings, except the target section's numbering prefix;
- organization assignment links to global library records;
- representative assignment links to global library records;
- section-specific labels, roles, group titles, order and subscripts.

Copying a section template does not copy:

- the source section identity;
- the source section template id or source section id;
- the source numbering prefix;
- source folders;
- documents or drafts;
- released revisions;
- manual snapshots;
- issued/final ID packages;
- generated artifacts;
- global library records themselves.

The copied template becomes the target section's own mutable `SectionTemplate`
version. It references the same allowed global library items unless a later
cross-workspace import/export policy explicitly creates destination-owned
library copies.

When copying into a target section, implementations must retarget the template:

```text
copied.sectionTemplate.id = targetSection.templateSettingsId
copied.sectionTemplate.sectionId = targetSection.id
```

The target section keeps its own numbering prefix. The UI must make this clear
to the user so copying a ventilation template into a heating section cannot
silently give the heating section a ventilation prefix.

## Consequences

- Intermediate ID is derived from one folder inside one section.
- Final ID is derived from one section, across that section's folders.
- Object-wide final ID is not the default canonical package scope.
- Folder names remain arbitrary user-defined names.
- Numbering policy should be section-scoped or folder-scoped, not object-scoped
  by default.
- Frontend and future backend state should key section template settings by the
  section's `templateSettingsId`, not by the visible section name and not by an
  inferred short code.
- Backend/API contracts must use section context for document creation,
  template reads, template mutations and final package reads.
- Existing historical docs that say `ObjectTemplate` should be read as
  superseded for future implementation. The canonical implementation term is
  `SectionTemplate` / `настройки шаблона раздела`.

## Non-goals

This ADR does not introduce production schema, migrations, routes, OpenAPI,
frontend UI, persistence, import/export across workspaces, document generation,
or package generation. Those remain separate explicit implementation tasks.
