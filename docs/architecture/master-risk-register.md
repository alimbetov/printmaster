# PrintMaster — Master Risk Register

## Purpose

This document consolidates the red-team findings for the full customer-to-production chain. It is the baseline for architecture, implementation, test design, and production readiness.

## Severity and delivery priority

- **P0 / CRITICAL** — must be designed before production code that depends on it.
- **P1 / HIGH** — must be covered before real customer money or real production.
- **P2 / MEDIUM** — may be deferred from mock MVP, but contracts must not block later implementation.
- **P3 / LOW** — optimization or operational hardening.

## 1. Geometry and coordinate-system risks — P0

Risks:
- screen px vs physical mm mismatch;
- origin ambiguity: top-left vs center;
- Y-axis inversion;
- transform composition order mismatch;
- rotation anchor mismatch;
- mirror / negative scale;
- nested transform flattening;
- SVG unit ambiguity;
- DPR/CSS/browser zoom affecting geometry;
- cumulative rounding drift;
- clip/rotate/scale order mismatch;
- zone-precedence ambiguity;
- wearer-left vs viewer-left ambiguity;
- non-linear size grading;
- back-side orientation ambiguity;
- crop stored in viewport coordinates;
- rotated bounding-box escape;
- hidden/off-canvas elements;
- canvas resize changing placement.

Required controls:
- canonical **GARMENT_SPACE in millimeters**;
- explicit origin, axis direction, rotation direction, transform order;
- high precision storage; rounding only at output boundary;
- crop stored in asset coordinates;
- explicit side coordinate systems;
- deterministic transform library shared by validation and rendering;
- golden, round-trip, property-based and fuzz tests.

## 2. Product geometry and print-profile risks — P0

Risks:
- same nominal size differs by supplier/model;
- unisex/women/kids/oversize/slim cuts differ;
- pockets, zippers, seams, drawstrings, ribs and hardware obstruct printing;
- sleeves are cylindrical;
- asymmetrical garments;
- garment batch tolerances;
- shrinkage/stretch;
- fabric-specific print constraints.

Required controls:
- SKU-specific, size-specific, side-specific **PrintProfileVersion**;
- printable, safe, warning and forbidden zones;
- physical anchors relative to stable garment landmarks;
- immutable versioning once used by an approved order;
- separate garment geometry from mockup geometry.

## 3. Image/asset risks — P0/P1

Risks:
- low effective DPI after scaling;
- EXIF rotation;
- white background mistaken for transparency;
- premultiplied-alpha halos;
- indexed PNG transparency;
- CMYK JPEG / ICC profile mismatch;
- grayscale / 16-bit / progressive/interlaced formats;
- animated images;
- HEIC/AVIF/TIFF unsupported behavior;
- corrupted images and decompression bombs;
- embedded thumbnails;
- interpolation/anti-aliasing differences;
- aspect-ratio metadata;
- crop/zoom state loss.

Required controls:
- immutable OriginalAsset plus immutable NormalizedAsset;
- normalization pipeline: full decode → EXIF → color conversion → RGBA/alpha normalization → safe canonical format;
- effective-DPI preflight based on requested physical size;
- file-size, megapixel, decode-memory and complexity limits;
- checksum for every persisted artifact.

## 4. SVG/vector risks — P0

Risks:
- XSS/script/foreignObject;
- external refs and SSRF;
- XXE/entities;
- embedded CSS/fonts;
- masks, clipPath, filters, patterns and unsupported gradients;
- nested transforms/viewBox/unit inconsistencies;
- CPU/memory DoS;
- text rendering differences.

Required controls:
- sanitized allowlisted SVG subset;
- no network fetches from uploaded assets;
- DTD/entities disabled;
- sandbox/time/memory limits;
- unsupported features rejected or flattened before approval.

## 5. Typography risks — P0/P1

Risks:
- font fallback/version mismatch;
- missing glyphs;
- kerning/ligature/line-height/wrapping differences;
- Cyrillic/CJK/RTL/bidi/diacritics/Unicode normalization;
- variable font/OpenType feature loss;
- emoji differences;
- font licensing.

Required controls:
- managed FontCatalog with version/hash/license metadata;
- NFC normalization;
- deterministic text layout;
- production text converted to vector outlines at approval/production boundary;
- unsupported text features blocked in MVP.

## 6. Color-management risks — P1

Risks:
- RGB display differs from DTF output;
- ICC profile differences;
- monitor brightness/technology;
- garment color and texture;
- white underbase behavior;
- contractor RIP/profile changes;
- ink/material batch changes;
- polyester dye migration;
- colors outside printable gamut.

Required controls:
- canonical color pipeline;
- profile/version recorded in manifest;
- customer-facing disclaimer that display color is approximate;
- contractor profile qualification and test swatches before real production.

## 7. Preview/proof/render risks — P0

Risks:
- browser preview differs from production render;
- browser differences;
- mockup lighting/folds/perspective hide defects;
- stale CDN/cache proof;
- proof renderer version differs from production renderer;
- non-deterministic rendering.

Required controls:
- editor preview is advisory only;
- **server-rendered proof is the approval artifact**;
- immutable Proof linked to DesignRevision + PrintProfileVersion + RendererVersion;
- versioned URLs, no mutable cache keys;
- deterministic render contract and golden-image tests.

## 8. Design lifecycle/concurrency risks — P0

Risks:
- edit after approval/payment;
- autosave races;
- multi-tab last-write-wins;
- undo overwritten;
- cart holds stale revision;
- size/color/model/SKU change invalidates design;
- support staff changes approved design.

Required controls:
- immutable DesignRevision;
- optimistic concurrency/version field;
- any material product change triggers revalidation and new proof;
- approved revision never mutates;
- autosave produces recoverable history.

## 9. Preflight risks — P0

Preflight must evaluate:
- print-zone bounds;
- safe/forbidden-zone intersections;
- transformed polygons, not raw rectangles;
- effective DPI;
- physical dimensions;
- font/glyph validity;
- unsupported effects;
- sanitized SVG;
- low contrast;
- minimum text/stroke sizes;
- asset availability/checksum;
- SKU/PrintProfile compatibility;
- server-render success.

Result levels:
- **BLOCKER** — cannot approve/order;
- **WARNING** — explicit customer acknowledgment;
- **INFO** — physical facts and advisory details.

## 10. Payment/order consistency risks — P0

Risks:
- payment succeeds before immutable order snapshot exists;
- order saved while asset commit fails;
- duplicate callbacks/captures;
- double-click payment;
- inventory oversell;
- price/tax/currency drift;
- cancellation after production begins;
- partial multi-item production/refund;
- front succeeds while back fails.

Required controls:
- idempotency keys;
- outbox/saga boundaries;
- immutable quote at checkout;
- inventory reservation;
- item-level production state;
- explicit cancellation guards.

## 11. Object-storage risks — P0/P1

Risks:
- mutable overwrite;
- filename/key collisions;
- stale cache/eventual consistency;
- signed URL expiration;
- lifecycle deletion;
- broad bucket permissions;
- IDOR/cross-tenant access;
- corrupted objects/checksum mismatch.

Required controls:
- UUID/hash object keys;
- immutable/versioned objects;
- checksum validation;
- internal service access for rendering;
- lifecycle/legal-hold rules;
- least-privilege IAM;
- versioned CDN URLs.

## 12. Render-job risks — P0

Risks:
- duplicate/lost jobs;
- worker restart;
- timeout/partial output;
- stale job renders superseded revision;
- renderer upgrade changes result.

Required controls:
- idempotent RenderJob;
- pinned RendererVersion;
- DesignRevision/PrintProfileVersion input hashes;
- output hash;
- retry + DLQ policy;
- superseded-job guard.

## 13. Gang-sheet risks — P0/P1

Risks:
- insufficient gaps;
- wrong orientation/mirroring/roll direction;
- mixed DPI;
- duplicates/missing quantities;
- labels/barcodes entering artwork;
- width mismatch;
- nesting changes scale;
- v2 regenerated after v1 sent;
- contractor prints stale revision.

Required controls:
- immutable GangSheetRevision;
- manifest with each included ProductionArtifact hash and quantity;
- fixed no-scale/no-resample contract;
- minimum gaps/margins;
- barcode/identifier outside final transfer artwork;
- SENT revision cannot mutate.

## 14. External-contractor risks — P1

Risks:
- contractor rescales, rasterizes, recolors, mirrors or adds margins;
- different RIP/ICC/white-underbase;
- material substitution;
- old file printed;
- lost/duplicated sheet;
- no traceability.

Required controls:
- ContractorBatch;
- explicit technical acceptance contract;
- received-batch reconciliation against GangSheetRevision/hash;
- approved material/profile list;
- sample qualification before customer production.

## 15. Transfer transport/storage risks — P1

Risks:
- bending/scratching;
- humidity/heat/dust;
- adhesive contamination;
- transfers stick together;
- ageing.

Required controls:
- packaging/storage specification;
- received inspection;
- batch/date traceability;
- quarantine for visibly damaged transfers.

## 16. Heat-press and production risks — P1

Risks:
- wrong temperature/time/pressure;
- wrong peel mode;
- calibration drift/cold spots;
- press over seams/zip/buttons;
- platen too small;
- fabric moisture/wrinkles;
- transfer moves;
- missing/incorrect second press;
- scorch, discoloration, migration, melt, cracking.

Required controls:
- versioned PressProfile;
- press-machine calibration/maintenance records;
- barcode-assisted operator workflow;
- garment/fabric-specific parameters;
- production checklist and QC gate.

## 17. Human/operator risks — P1

Risks:
- wrong order, garment, size, color, side or transfer;
- upside-down/mirrored transfer;
- wrong settings;
- skipped/repeated step.

Required controls:
- scan order → scan garment SKU → scan transfer/gang item;
- mismatch blocks production;
- explicit FRONT/BACK visuals;
- operator identity and timestamp recorded.

## 18. Inventory and batch risks — P1

Risks:
- stale stock/oversell;
- defective blank discovered late;
- supplier SKU mismatch;
- same commercial model changes fabric composition;
- reservation timeout;
- systemic defect tied to a lot.

Required controls:
- InventoryReservation;
- supplier SKU mapping;
- GarmentBatch/lot traceability;
- pre-production garment inspection.

## 19. QC/packaging/shipping risks — P1/P2

QC risks:
- correct visual appearance but poor adhesion;
- edge lifting, cracks, halos, stains, scorch;
- wrong physical dimensions/placement/SKU.

Packaging risks:
- folding hot print;
- crease through art;
- humidity or order mix-up.

Controls:
- item-level QC checklist;
- QC evidence/photo capability;
- no shipment when QC fails;
- cooling/packing specification;
- package/order scan reconciliation.

## 20. Claims/legal/content risks — P1/P2

Risks:
- cannot prove what customer approved;
- copyright/trademark/personality/privacy claims;
- minors/personal photos;
- font/sticker licensing;
- custom-goods returns/chargebacks.

Controls:
- ProofApproval evidence;
- full traceability chain;
- content-policy check;
- consent/license metadata where applicable;
- configurable return/claim state machine.

## 21. Security risks — P0/P1

Risks:
- upload parser exploits;
- SVG XSS/SSRF/XXE;
- image bombs/polyglots/MIME spoofing;
- path traversal;
- public storage/IDOR;
- fake webhooks;
- CSRF/XSS;
- rate-limit abuse;
- secrets in frontend;
- compromised npm/Maven dependencies;
- mutable audit logs.

Controls:
- sandboxed processing;
- strong authorization and tenant ownership checks;
- signed webhook verification;
- rate limits/quotas;
- secret scanning/vault;
- SBOM/dependency scanning;
- append-only audit strategy.

## 22. Observability/traceability risks — P0

A complaint such as “the site was correct but the shirt is wrong” must be reconstructable.

Minimum trace chain:
Order → OrderItem → DesignRevision → Proof → ProofApproval → PrintProfileVersion → RendererVersion → ProductionArtifact → GangSheetRevision → ContractorBatch → Garment SKU/Batch → PressRun/PressProfile → Operator → QualityCheck → Shipment/Claim.

## P0 decisions that must exist before real production

1. Canonical mm coordinate system.
2. Transform semantics.
3. Immutable DesignRevision.
4. Immutable PrintProfileVersion.
5. Asset normalization contract.
6. Deterministic server proof.
7. Proof approval snapshot.
8. Preflight engine.
9. Production artifact hash.
10. Idempotent order/payment flow.
11. Immutable/versioned object storage.
12. GangSheetRevision + manifest.
13. SKU/transfer barcode verification.
14. Explicit state machines.
15. Audit/traceability model.
16. Security sandbox for uploads.
17. Item-level production states.
18. Contractor version reconciliation.
19. PressProfile/calibration concept.
20. QC gate.

## Risk policy for the mock MVP

The mock MVP may mock external dependencies, but it must **not mock away core invariants**.

Must be real in mock MVP:
- mm geometry;
- revisions;
- validation;
- proof generation contract;
- state machines;
- hashes/IDs;
- idempotency semantics;
- audit events;
- stale-version rejection;
- barcode/manifest model.

May be mocked:
- payment provider;
- object storage backend;
- DTF contractor;
- physical press;
- shipment provider;
- email/SMS;
- inventory ERP.
