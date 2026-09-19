# PrintMaster Architecture Index

This directory is the architecture baseline for the mock-first MVP.

## Documents

1. [Master Risk Register](./master-risk-register.md)
2. [Mock-First MVP](./mock-first-mvp.md)
3. [Domain Model and Invariants](./domain-model-and-invariants.md)
4. [State Machines](./state-machines.md)
5. [Failure Simulation Catalog](./failure-simulation-catalog.md)
6. [Risk-Driven Roadmap](./roadmap.md)

## Core principle

**What the customer approves must be traceably linked to what production prints.**

Mocks may replace infrastructure and external providers, but must not bypass:
- physical mm geometry;
- immutable revisions;
- validation and preflight;
- deterministic proof contracts;
- state-machine rules;
- hashes/manifests;
- idempotency semantics;
- audit/traceability.
