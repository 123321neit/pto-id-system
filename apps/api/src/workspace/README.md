# Workspace Module

Purpose: workspace and tenant boundary.

Owns:

- workspace boundary;
- membership vocabulary;
- isolation contracts for commands, queries, jobs, files, projections, and
  artifacts.

Forbidden responsibilities:

- business document ownership;
- evidence ownership;
- registry projections;
- generated artifacts or package snapshots;
- auth implementation, invitations, controllers, repositories, or RBAC behavior
  in this skeleton.

Current status: architecture skeleton only.
