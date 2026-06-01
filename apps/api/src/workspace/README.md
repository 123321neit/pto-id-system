# Workspace Module

Purpose: workspace and tenant boundary.

Owns:

- workspace boundary;
- current actor resolution boundary for future commands/queries;
- admin-path global system admin marker boundary;
- owned workspace baseline and owner-only access boundary;
- isolation contracts for commands, queries, jobs, files, projections, and
  artifacts.

Forbidden responsibilities:

- business document ownership;
- evidence ownership;
- registry projections;
- generated artifacts or package snapshots;
- login/register/session/OAuth/JWT implementation, invitations, controllers,
  repositories, share codes, grants, admin routes, admin UI, support tenant
  browsing, business access bypasses, or RBAC behavior in this skeleton.

Current status: architecture skeleton plus Phase 1 current actor resolver
utility/port, Phase 2 admin-path system admin marker and Phase 3
TypeScript-only owned workspace baseline. Missing or disabled actors fail
closed. Resolved actor identity alone grants no workspace, document,
certificate, package or file access. The admin marker is driven by optional
`SYSTEM_ADMIN_ACTOR_ID` config and is not a role, capability, workspace owner,
share grant, route or auth/session implementation. Owned workspace checks are
owner-only and return leakage-safe `NOT_FOUND_OR_NOT_AUTHORIZED` denial without
resolving child resources first.
