# PrintMaster — Frontend Mock Data Contracts

## Principle

Mock APIs must look like future backend APIs. Pages/components must not import fixture JSON directly.

The mock layer is a contract simulator, not a bag of fixtures.

## Core identifiers

Use opaque string IDs:
- productId
- variantId
- printProfileVersionId
- designId
- designRevisionId
- assetId
- preflightReportId
- proofId
- proofApprovalId
- orderId

## Shared geometry

```ts
type PointMm = { xMm: number; yMm: number };
type PolygonMm = { points: PointMm[] };

type CoordinateSystem = {
  units: 'MM';
  origin: 'TOP_LEFT';
  xAxis: 'RIGHT';
  yAxis: 'DOWN';
  rotationDirection: 'CLOCKWISE';
};
```

All persisted design geometry uses garment-space millimeters.

## Product

```ts
type Product = {
  id: string;
  name: string;
  type: 'TSHIRT' | 'HOODIE';
  description: string;
  variants: ProductVariant[];
};
```

## Variant

```ts
type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  color: { code: string; name: string; hex: string };
  size: 'S' | 'M' | 'L' | 'XL';
  mockup: {
    frontUrl: string;
    backUrl: string;
    projectionVersion: string;
  };
  printProfileVersionId: string;
  available: boolean;
};
```

Mockup image dimensions never define physical geometry.

## Print profile

```ts
type PrintProfile = {
  id: string;
  version: number;
  coordinateSystem: CoordinateSystem;
  garment: {
    widthMm: number;
    heightMm: number;
  };
  sides: Record<'FRONT' | 'BACK', {
    printable: PolygonMm;
    safe?: PolygonMm;
    forbidden: Array<{
      id: string;
      reason: string;
      polygon: PolygonMm;
    }>;
    anchors: Array<{
      id: string;
      xMm: number;
      yMm: number;
    }>;
  }>;
};
```

## Design element

Persisted element semantics:
- xMm/yMm = element center in garment-space;
- widthMm/heightMm = unrotated physical dimensions;
- rotationDeg = clockwise in [0, 360);
- crop coordinates are normalized to source asset space;
- zOrder is unique within a side.

```ts
type BaseElement = {
  id: string;
  side: 'FRONT' | 'BACK';
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotationDeg: number;
  zOrder: number;
};

type ImageElement = BaseElement & {
  type: 'IMAGE';
  assetId: string;
  crop?: { x: number; y: number; width: number; height: number };
};

type TextElement = BaseElement & {
  type: 'TEXT';
  text: string;
  fontId: string;
  fontVersion: string;
  color: string;
  align: 'LEFT' | 'CENTER' | 'RIGHT';
};

type StickerElement = BaseElement & {
  type: 'STICKER';
  stickerId: string;
  stickerVersion: string;
};

type DesignElement = ImageElement | TextElement | StickerElement;
```

## Design revision

Use the full domain lifecycle in contracts; UI may show simpler labels.

```ts
type DesignStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'INVALID'
  | 'VALID'
  | 'PROOF_RENDERING'
  | 'PROOF_FAILED'
  | 'PROOF_READY'
  | 'APPROVED'
  | 'LOCKED'
  | 'ARCHIVED';

type DesignRevision = {
  id: string;
  designId: string;
  revision: number;
  variantId: string;
  printProfileVersionId: string;
  status: DesignStatus;
  elements: DesignElement[];
  version: number;
  contentHash: string;
  updatedAt: string;
};
```

## Draft save contract

```ts
type SaveDraftRequest = {
  expectedVersion: number;
  elements: DesignElement[];
  clientMutationId: string;
};

type SaveDraftSuccess = {
  revision: DesignRevision;
};

type SaveDraftConflict = {
  status: 409;
  latestVersion: number;
  latestRevisionId: string;
  latestUpdatedAt: string;
};
```

Rules:
- only one save mutation in flight per design;
- late responses cannot overwrite a newer local mutation;
- 409 never silently replaces local work.

## Preflight

```ts
type PreflightIssue = {
  id: string;
  severity: 'BLOCKER' | 'WARNING' | 'INFO';
  code: string;
  elementId?: string;
  message: string;
  suggestedAction?: string;
};

type PreflightReport = {
  id: string;
  designRevisionId: string;
  evaluatedRevisionVersion: number;
  evaluatedContentHash: string;
  printProfileVersionId: string;
  validatorVersion: string;
  status: 'PASS' | 'WARNING' | 'BLOCKED';
  issues: PreflightIssue[];
  generatedAt: string;
};
```

Any canonical design mutation makes an older preflight report stale.

## Proof

Proof is produced by a read-only proof renderer, not by screenshotting the editor viewport.

```ts
type Proof = {
  id: string;
  status: 'RENDERING' | 'READY' | 'FAILED' | 'OBSOLETE';
  designRevisionId: string;
  designContentHash: string;
  printProfileVersionId: string;
  preflightReportId: string;
  preflightHash: string;
  rendererVersion: string;
  frontPreviewUrl?: string;
  backPreviewUrl?: string;
  outputHash: string;
  warningIssueIds: string[];
  createdAt: string;
};

type ProofApproval = {
  id: string;
  proofId: string;
  proofOutputHash: string;
  acceptedWarningIssueIds: string[];
  approvedAt: string;
};
```

Any edit, SKU change, size change, or profile change marks the proof obsolete.

## Cart edit rule

An approved cart item references one immutable proof/design revision.

Editing it:
1. creates a new draft copied from the approved revision;
2. leaves the cart item on the old approved revision;
3. replaces the cart revision only after a new proof is approved.

## Mock API surface

- GET /products
- GET /products/:id
- GET /variants/:id
- GET /print-profiles/:id
- POST /assets
- POST /designs
- GET /designs/:id
- PUT /designs/:id/draft
- POST /designs/:id/preflight
- POST /designs/:id/proof
- POST /proofs/:id/approve
- POST /cart/items
- PUT /cart/items/:id/proof
- GET /cart
- POST /checkout/quote
- POST /payments/mock
- POST /orders
- GET /orders/:id

## Mock latency/error mode

Development controls must support:
- latency 0 / 300 / 1000 / 3000 ms;
- random 500;
- stale save / 409;
- late save response;
- upload reject;
- stale preflight;
- stale proof;
- proof render failure;
- payment fail;
- payment timeout;
- duplicate payment callback;
- inventory invalidation.

This is part of UX testing, not merely backend simulation.

## Localization contract

Mock API responses should remain locale-neutral for domain data.

Do not return pretranslated production/preflight messages where a structured code can be returned.

Example:

```ts
type LocalizableIssue = {
  code: string;
  severity: 'BLOCKER' | 'WARNING' | 'INFO';
  elementId?: string;
  params?: Record<string, string | number | boolean>;
};
```

Frontend translation layer maps `code + params` into active locale.

Mock user/profile state may expose:

```ts
type UserPreferences = {
  locale: 'kk-KZ' | 'ru-KZ' | 'en-US';
};
```
