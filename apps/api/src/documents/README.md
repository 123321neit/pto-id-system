# Documents Module

Purpose: typed document boundary.

Owns:

- typed documents;
- folder-scoped document creation context reads;
- working and released revision boundaries;
- finalization lifecycle boundaries;
- document-source facts that later feed registry, package, and artifact flows.

Forbidden responsibilities:

- generated artifact ownership;
- package snapshots;
- certificate or executive scheme originals;
- registry source-of-truth fields;
- controllers, transport routes, repositories, persistence adapters, Prisma
  schema, migrations, draft creation, number reservation, validation rules, or
  production document behavior in this skeleton.

Current status: architecture skeleton plus one framework-free, query-only
`readDocumentCreationContext` application contract. That contract requires an
explicit allowed workspace access decision before object/folder lookup, supports
user-defined ID folders, returns approved document types, current
`ObjectTemplate` summary, live linked resolution chain and proposal-only
numbering. It does not create a draft, reserve a number, expose HTTP, persist
data, or implement production AOSR behavior.
