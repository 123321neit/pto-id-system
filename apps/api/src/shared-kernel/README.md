# Shared Kernel

Purpose: shared primitives and framework-neutral interfaces.

Owns:

- generic module/scope vocabulary;
- shared primitive interfaces that do not reveal business aggregate internals;
- cross-module language that remains stable enough to share.
- framework-neutral technical health port shapes used to keep provider adapters
  behind infrastructure boundaries.

Forbidden responsibilities:

- business aggregates;
- repositories or use cases;
- NestJS providers/controllers;
- Prisma, queue, storage, AI, or provider-specific types;
- domain database schema or persistence models;
- document/evidence/package internals.

Current status: architecture skeleton only.
