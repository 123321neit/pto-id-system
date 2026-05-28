# Health Module

Purpose: technical API health check.

Owns:

- `/health` technical runtime response.
- optional technical dependency status such as database configured/ok/error.

Forbidden responsibilities:

- business readiness checks;
- domain database readiness, queue, storage, AI, package, or document checks;
- product API contracts.

Current status: technical scaffold endpoint with infrastructure database
dependency status only. `HealthModule` explicitly imports `InfrastructureModule`
for this technical check.
