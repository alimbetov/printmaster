# PrintMaster — Frontend Product Architecture

## Purpose

Define the customer-facing product before backend implementation. The first frontend runs on mock data, but its domain contracts must already respect production constraints.

## Product goal

Enable a customer to confidently create a printable garment design on web, tablet, or mobile without needing print-production knowledge.

Primary UX principle:

> The editor must make the safe action the easy action.

The product must continuously communicate:
- what garment is selected;
- which side is being edited;
- the physical print size in millimeters;
- whether the design is printable;
- what will be approved as the final proof.

## Primary user journey

1. Landing / catalog
2. Product detail
3. Variant selection
4. Design editor
5. Preflight review
6. Server-proof preview (mock initially)
7. Approval
8. Cart
9. Mock checkout
10. Order confirmation / tracking

## Information architecture

### Public
- Home
- Catalog
- Product details
- Help: printing, sizing, care
- FAQ

### Creation
- Editor
  - Product context
  - Side selector
  - Canvas
  - Add image
  - Add text
  - Stickers
  - Layers
  - Physical size
  - Preflight issues
  - Undo/redo
  - Save state

### Commerce
- Cart
- Checkout
- Confirmation
- Order status

### Account (later)
- My designs
- My orders
- Saved addresses
- Reorder

## Editor modes

Keep modes explicit:
- SELECT
- IMAGE
- TEXT
- STICKER
- CROP

Avoid free-form hidden mode switching.

## UI priorities

Priority order inside editor:
1. Garment + side context
2. Canvas
3. Selected object controls
4. Preflight state
5. Add-content tools
6. Layer management
7. Secondary settings

## Initial capability boundaries

Supported:
- PNG/JPEG upload
- managed text fonts
- curated stickers
- move
- resize with aspect lock by default
- rotate
- crop
- layer ordering
- FRONT/BACK
- physical dimensions
- safe/forbidden zones
- warnings/blockers
- undo/redo

Not supported initially:
- arbitrary SVG uploads
- filters/blend modes
- text-on-path
- free drawing
- sleeve design
- zip hoodies
- 3D garment simulation
- AI generation

## Frontend domain state

Do not treat the editor canvas as the source of truth.

Canonical client state should model:
- selectedProductVariantId
- printProfileVersion
- activeSide
- designRevision
- elements[]
- element geometry in millimeters
- asset references
- crop in normalized asset coordinates
- preflight result
- proof status
- dirty/saved state
- optimistic version

Browser pixels remain a projection only.

## Recommended React module boundaries

- app-shell
- catalog
- product-configurator
- editor-shell
- garment-canvas
- editor-toolbar
- layer-panel
- asset-library
- text-editor
- sticker-library
- transform-controls
- physical-measurements
- preflight-panel
- proof-review
- cart
- checkout-mock
- order-tracking-mock
- mock-api
- shared-ui
- design-system

## State approach

Use two categories:

### Server-like state
Even while mocked:
- catalog
- products
- variants
- print profiles
- saved designs
- proofs
- orders

Represent through a mock API/query layer rather than importing JSON directly into pages.

### Ephemeral editor state
- current selection
- drag/resize gesture
- zoom/pan
- open panels
- temporary crop
- hover/focus

Persist only canonical design state, never raw canvas internals.

## Non-negotiable frontend invariants

1. Pixels never become persisted physical geometry.
2. Size/model change triggers revalidation before approval.
3. A BLOCKER prevents proof approval.
4. Approved revision becomes read-only.
5. Front/back are visibly distinguishable at all times.
6. Undo/redo operates on design commands, not arbitrary component state.
7. Autosave never silently overwrites a newer revision.
8. Mobile gestures cannot change physical scale because of browser zoom.
9. Any warning visible at approval remains attached to the approved revision.
10. Proof view is visually distinct from editable preview.
