# Health Module

Purpose: technical API health check.

Owns:

- `/health` technical runtime response.
- optional technical dependency status such as database or object storage
  configured/unconfigured/ok/error.

Forbidden responsibilities:

- business readiness checks;
- domain database readiness, queue, upload/download, AI, package, evidence, or
  document checks;
- product API contracts.

Current status: technical scaffold endpoint with infrastructure database and
object storage dependency status only. Storage health exposes only
`dependencies.storage.status` and never exposes endpoint, bucket, region, access
keys, provider URLs, file paths, evidence state or artifact state. `HealthModule`
explicitly imports `InfrastructureModule` for these technical checks.
