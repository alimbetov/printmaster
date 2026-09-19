# PrintMaster — Domain Model and Invariants

## Core entities

### Catalog
- Product
- ProductVariant
- GarmentGeometryVersion
- PrintProfileVersion
- ZoneDefinition
- FontCatalogEntry
- StickerAsset

### Design
- Design
- DesignRevision
- DesignElement
- OriginalAsset
- NormalizedAsset
- PreflightReport
- Proof
- ProofApproval

### Commerce
- Quote
- Cart
- Order
- OrderItem
- PaymentTransaction
- InventoryReservation

### Rendering and production
- RenderJob
- RendererVersion
- ProductionArtifact
- ProductionManifest
- GangSheet
- GangSheetRevision
- ContractorBatch
- ProductionItem
- PressProfile
- PressRun
- GarmentBatch
- QualityCheck

### Operations
- Shipment
- ReturnClaim
- ClaimEvidence
- AuditEvent

## Canonical geometry contract

- All customer-design geometry is stored in millimeters.
- Origin and axes are explicit and immutable by contract.
- Screen pixels are presentation only.
- Crop coordinates are stored in normalized asset space.
- Rotation is stored in degrees with a defined direction.
- Geometry uses sufficient decimal precision; rendering rounds only at final rasterization.
- Bounds validation uses the fully transformed polygon.

## Immutable snapshot boundary

After ProofApproval:
- DesignRevision cannot mutate.
- PrintProfileVersion cannot mutate.
- referenced NormalizedAssets cannot mutate.
- RendererVersion is pinned for proof/production reproducibility.

## Minimum invariants

1. Approved DesignRevision is immutable.
2. Paid OrderItem references exactly one approved DesignRevision.
3. Paid OrderItem references exactly one PrintProfileVersion.
4. Proof references the same DesignRevision and PrintProfileVersion later used for production.
5. ProofApproval references a specific Proof hash.
6. Material change to SKU/size/side invalidates prior preflight/proof.
7. ProductionArtifact cannot exist without a passing production preflight.
8. ProductionArtifact stores input hash and output hash.
9. GangSheetRevision cannot mutate after LOCKED.
10. SENT GangSheetRevision cannot be silently replaced.
11. Every included gang-sheet item references a specific ProductionArtifact hash and quantity.
12. Order/payment callbacks are idempotent.
13. Asset must be committed before order can become production-ready.
14. Duplicate render jobs must not create semantically different production artifacts for identical pinned inputs.
15. Wrong garment SKU scan blocks production.
16. Wrong transfer/artifact scan blocks production.
17. QC FAIL blocks shipment.
18. A failed side of a multi-side item must not be represented as fully produced.
19. Audit events are append-only.
20. Every external callback stores idempotency key/provider event id.
21. Every state transition validates allowed source state.
22. Renderer upgrades never retroactively change an approved revision.
23. PrintProfile updates never retroactively change an approved order.
24. CDN/storage URLs for immutable artifacts are versioned/content-addressed.
25. Customer-visible proof and production input are cryptographically traceable.
26. Any warning accepted by customer is recorded against the approved proof.
27. A BLOCKER can never be overridden by ordinary checkout.
28. A cancelled item cannot enter production.
29. An item already in irreversible production cannot be silently cancelled.
30. Claim investigation can reconstruct the complete production lineage.

## Suggested aggregate boundaries

Keep the first implementation modular-monolith oriented.

- Design aggregate: Design + revisions + elements + proof references.
- Order aggregate: Order + OrderItems.
- GangSheet aggregate: GangSheet + revisions + manifest.
- Production aggregate: ProductionItem + scans + press/QC references.

External systems communicate through application ports and outbox events where consistency matters.
