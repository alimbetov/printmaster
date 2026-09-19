# PrintMaster — Mock-First MVP Architecture

## Goal

Build a working end-to-end product flow before integrating real payment, object storage, DTF contractor, or production hardware.

The mock MVP must simulate real contracts closely enough that replacing a mock adapter does not require redesigning the domain.

## Customer flow

1. Browse products.
2. Choose product model, color and size.
3. Open editor.
4. Add image/text/sticker.
5. Move/scale/rotate/crop/layer elements.
6. Switch FRONT/BACK.
7. See physical print size in mm.
8. Run preflight continuously.
9. Request server proof.
10. Approve proof.
11. Add immutable approved revision to cart.
12. Mock checkout/payment.
13. Create production artifact.
14. Assign artifact to mock gang sheet.
15. Mock contractor receipt.
16. Mock garment scan and pressing.
17. Mock QC.
18. Mock shipment.

## Recommended initial scope

Products:
- 1 Basic T-shirt;
- 1 Basic Hoodie;
- colors: black/white;
- sizes: S/M/L/XL.

Editor:
- PNG/JPEG upload;
- text from managed font catalog;
- curated SVG stickers only;
- move/scale/rotate/crop;
- layers;
- FRONT/BACK.

Explicitly exclude initially:
- arbitrary uploaded SVG;
- HEIC/TIFF/CMYK source files;
- 3D preview;
- sleeve print;
- zip hoodies;
- text-on-path;
- variable fonts;
- arbitrary blend/filter effects;
- AI generation;
- real payment;
- real DTF integration.

## Logical modules

### Frontend
- Catalog
- ProductConfigurator
- DesignEditor
- LayerPanel
- AssetUploader
- TextTool
- StickerTool
- PhysicalSizeInspector
- PreflightPanel
- ProofApproval
- Cart
- CheckoutMock
- OrderTrackingMock

### Backend
- Catalog
- Product/PrintProfile
- Asset
- Design
- Preflight
- Render/Proof
- Order
- PaymentMock
- InventoryMock
- ProductionArtifact
- GangSheet
- ContractorMock
- ProductionMock
- QCMock
- Audit

## Adapter boundaries

Use ports/adapters from day one:

- PaymentPort → MockPaymentAdapter
- ObjectStoragePort → Local/InMemory adapter
- ContractorPort → MockDtfContractorAdapter
- InventoryPort → MockInventoryAdapter
- ShippingPort → MockShippingAdapter
- NotificationPort → MockNotificationAdapter

Domain services must never depend on mock-specific types.

## Mock behavior must simulate failures

Mocks must support configurable responses:
- success;
- timeout;
- duplicate callback;
- stale version;
- rejected job;
- partial failure;
- delayed response;
- contractor prints stale gang-sheet revision;
- inventory mismatch;
- QC failure.

## Definition of Done for mock MVP

A test must prove:

GIVEN a customer creates a design in physical mm
WHEN proof is generated and approved
THEN an immutable DesignRevision and PrintProfileVersion are pinned

AND WHEN mock payment succeeds
THEN exactly one order snapshot is created

AND WHEN production artifact is generated
THEN its inputs and output hash are traceable

AND WHEN assigned to a gang sheet
THEN the immutable GangSheetRevision manifest references the exact production artifact

AND WHEN mock production is executed
THEN wrong SKU/transfer scans are rejected

AND QC failure blocks shipment.
