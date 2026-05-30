# Workspace Module

Purpose: workspace and tenant boundary.

Owns:

- workspace boundary;
- current actor resolution boundary for future commands/queries;
- isolation contracts for commands, queries, jobs, files, projections, and
  artifacts.

Forbidden responsibilities:

- business document ownership;
- evidence ownership;
- registry projections;
- generated artifacts or package snapshots;
- login/register/session/OAuth/JWT implementation, invitations, controllers,
  repositories, share codes, grants, system admin implementation, or RBAC
  behavior in this skeleton.

Current status: architecture skeleton plus Phase 1 current actor resolver
utility/port only. Missing or disabled actors fail closed. Resolved actor
identity alone grants no workspace, document, certificate, package or file
access.
