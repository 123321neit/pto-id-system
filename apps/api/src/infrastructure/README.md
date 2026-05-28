# Infrastructure Module

Purpose: provider adapter boundary.

Owns:

- infrastructure provider tokens;
- adapter contracts for future persistence, storage, async work, artifact, and
  AI provider integrations;
- provider isolation notes.

Forbidden responsibilities:

- domain ownership;
- business validation;
- direct source-of-truth decisions;
- provider SDK leakage into domain modules;
- actual database, queue, storage, upload, renderer, or AI implementation in
  this skeleton.

Current status: architecture skeleton only.
