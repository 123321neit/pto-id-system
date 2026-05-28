# Shared Kernel

Purpose: shared primitives and framework-neutral interfaces.

Owns:

- generic module/scope vocabulary;
- shared primitive interfaces that do not reveal business aggregate internals;
- cross-module language that remains stable enough to share.

Forbidden responsibilities:

- business aggregates;
- repositories or use cases;
- NestJS providers/controllers;
- Prisma, database, queue, storage, AI, or provider-specific types;
- document/evidence/package internals.

Current status: architecture skeleton only.
