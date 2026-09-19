# PrintMaster — Frontend Mock Data Contracts

## Principle

Mock APIs must look like future backend APIs. Pages/components must not import fixture JSON directly.

## Core identifiers

Use opaque string IDs in mocks:
- productId
- variantId
- printProfileVersionId
- designId
- designRevisionId
- assetId
- proofId
- orderId

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
  };
  printProfileVersionId: string;
  available: boolean;
};
```

## Print profile

```ts
type PrintProfile = {
  id: string;
  version: number;
  garment: {
    widthMm: number;
    heightMm: number;
  };
  sides: Record<'FRONT' | 'BACK', {
    printable: PolygonMm;
    safe?: PolygonMm;
    forbidden: Array<{ id: string; reason: string; polygon: PolygonMm }>;
    anchors: Array<{ id: string; xMm: number; yMm: number }>;
  }>;
};
```

## Design element

```ts
type DesignElement =
  | ImageElement
  | TextElement
  | StickerElement;

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
```

Crop for images is stored normalized to source asset, not viewport pixels.

## Design revision

```ts
type DesignRevision = {
  id: string;
  designId: string;
  revision: number;
  variantId: string;
  printProfileVersionId: string;
  status: 'DRAFT' | 'VALID' | 'PROOF_READY' | 'APPROVED';
  elements: DesignElement[];
  version: number;
  updatedAt: string;
};
```

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
  revisionId: string;
  status: 'PASS' | 'WARNING' | 'BLOCKED';
  issues: PreflightIssue[];
};
```

## Proof

```ts
type Proof = {
  id: string;
  designRevisionId: string;
  printProfileVersionId: string;
  rendererVersion: string;
  frontPreviewUrl?: string;
  backPreviewUrl?: string;
  hash: string;
  warnings: string[];
};
```

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
- GET /cart
- POST /checkout/quote
- POST /payments/mock
- POST /orders
- GET /orders/:id

## Mock latency/error mode

Development controls should allow:
- latency 0 / 300 / 1000 / 3000 ms;
- random 500;
- save conflict 409;
- stale revision;
- upload reject;
- payment fail;
- payment timeout;
- duplicate callback.

This is part of UX testing, not just backend simulation.
