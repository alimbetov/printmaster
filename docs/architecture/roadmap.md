# PrintMaster — Risk-Driven Roadmap

## Phase 0 — Architecture baseline

Deliverables:
- master risk register;
- canonical coordinate-system contract;
- domain entities/invariants;
- state machines;
- failure simulation catalog;
- mock-first MVP scope.

Exit criteria:
- P0 decisions documented;
- no production integration code.

## Phase 1 — Mock catalog + product profiles

Implement:
- Product/ProductVariant;
- one T-shirt and one hoodie;
- S/M/L/XL;
- black/white;
- GarmentGeometryVersion;
- PrintProfileVersion;
- printable/safe/forbidden zones.

Tests:
- profile version pinning;
- size/SKU change invalidation.

## Phase 2 — Design editor foundation

Implement:
- React editor;
- canonical mm model;
- image/text/curated sticker;
- move/scale/rotate/crop/layers;
- FRONT/BACK;
- physical-size inspector.

Tests:
- px↔mm round trips;
- transform golden tests;
- stale revision conflict.

## Phase 3 — Asset normalization + preflight

Implement:
- OriginalAsset/NormalizedAsset;
- safe upload validation;
- EXIF normalization;
- effective DPI;
- zone intersection;
- minimum text/stroke rules;
- BLOCKER/WARNING/INFO.

## Phase 4 — Server proof + approval

Implement:
- deterministic render contract;
- RendererVersion;
- Proof hash;
- ProofApproval;
- immutable DesignRevision.

This phase is the first major architecture gate.

## Phase 5 — Mock checkout/order/payment

Implement:
- Quote;
- Cart;
- Order/OrderItem;
- PaymentMock;
- idempotency;
- inventory reservation mock;
- item-level states.

Failure simulations:
- duplicate callback;
- timeout;
- stale stock;
- asset failure.

## Phase 6 — Production artifact + gang sheet mock

Implement:
- ProductionArtifact;
- hashes/manifests;
- GangSheetRevision;
- simple deterministic placement first, not optimization;
- mock contractor adapter.

Do not implement sophisticated nesting yet.

## Phase 7 — Mock shop-floor workflow

Implement:
- order/garment/transfer QR or barcode identifiers;
- scan validation;
- PressProfile mock;
- ProductionItem state machine;
- QC checklist;
- QC failure/rework.

## Phase 8 — Claims/traceability

Implement:
- AuditEvent;
- claim evidence view;
- end-to-end lineage query;
- replayable investigation for “proof correct, product wrong”.

## Later real integrations

Replace adapters one by one:
1. object storage;
2. payment;
3. DTF contractor;
4. inventory/ERP;
5. shipping;
6. notifications.

Each adapter must pass the same contract and failure tests used by the mock adapter.
