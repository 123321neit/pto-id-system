# Infrastructure Module

Purpose: provider adapter boundary.

Owns:

- infrastructure provider tokens;
- adapter contracts for future persistence, storage, async work, artifact, and
  AI provider integrations;
- Prisma client bootstrap and technical database connectivity checks;
- S3-compatible object storage configuration health checks;
- provider isolation notes.

Forbidden responsibilities:

- domain ownership;
- business validation;
- direct source-of-truth decisions;
- provider SDK leakage into domain modules;
- domain database schema, migrations, repositories, queue, storage, upload,
  renderer, or AI implementation in this skeleton.
- uploads, downloads, file metadata, file path persistence, evidence files, or
  generated artifacts.

Current status: architecture skeleton plus technical database and object storage
foundation only. The Prisma adapter and S3-compatible object storage health
adapter are infrastructure-local and must not leak into domain modules.
`InfrastructureModule` is not global; consumers must import it explicitly at an
approved technical composition boundary.
