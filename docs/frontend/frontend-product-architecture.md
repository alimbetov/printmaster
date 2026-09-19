# PrintMaster — Frontend Product Architecture

## Purpose

Define the customer-facing product before backend implementation. The first frontend runs on mock data, but its domain contracts must already respect production constraints.

## Product goal

Enable a customer to create a wearable design quickly and confidently on web, tablet or mobile without needing print-production knowledge.

Primary UX principles:

> The editor must make the safe action the easy action.

> Creation should feel faster than configuration.

The product must continuously communicate:
- what garment is selected;
- which side is being edited;
- what the design looks like now;
- whether it is printable;
- what will be approved as the final preview.

Physical dimensions remain accessible, but they are not the hero UI for casual users.

## Entry journeys

### Create-first — primary
1. Home
2. Start creating
3. Add visual/text/sticker
4. Choose or confirm garment/variant
5. Design check
6. Final preview
7. Approval
8. Cart
9. Mock checkout
10. Confirmation/tracking

### Shop-first — secondary
1. Catalog
2. Product detail
3. Variant selection
4. Customize
5. Design check
6. Final preview
7. Approval
8. Cart
9. Checkout

## Information architecture

### Discover
- Home
- Catalog
- Featured/remix inspiration
- Product detail
- Help: sizing, printing, care

### Create
- Editor
  - Product context
  - Side selector
  - Canvas
  - Add
  - Style
  - Layers
  - Design check
  - Undo/redo
  - Save
  - Preview
- Remix

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
- Private/public sharing preferences

## Editor modes

Explicit technical modes remain internally:
- SELECT
- IMAGE
- TEXT
- STICKER
- CROP

Customer-facing navigation should prefer intent:
- Add
- Style
- Layers
- Check
- Preview

Avoid exposing software-tool terminology unnecessarily.

## UI priorities

Priority order:
1. Garment + visible creative result
2. Active side
3. Selected-object direct controls
4. Add/style actions
5. Design-check status
6. Undo/redo
7. Layers
8. Exact measurements / advanced settings

## Progressive disclosure

### Primary
- upload
- text
- stickers
- move
- resize
- quick placement presets
- FRONT/BACK
- preview

### Secondary
- crop
- exact physical size
- alignment
- duplicate
- layer ordering

### Advanced
- numeric dimensions
- exact rotation
- diagnostic details

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
- print/safe/forbidden zones
- warnings/blockers
- undo/redo
- quick placement presets
- remix to new draft
- share-preview mock

Not supported initially:
- arbitrary SVG uploads
- filters/blend modes
- text-on-path
- free drawing
- sleeve design
- zip hoodies
- 3D garment simulation
- AI generation
- public comments/follower network

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
- preflight/design-check result
- proof/final-preview status
- dirty/saved state
- optimistic version

Browser pixels remain a projection only.

## Recommended React module boundaries

- app-shell
- discovery
- catalog
- product-configurator
- editor-shell
- garment-canvas
- editor-toolbar
- placement-presets
- layer-panel
- asset-library
- text-editor
- sticker-library
- vibe-packs
- transform-controls
- physical-measurements
- preflight-panel
- proof-review
- remix
- share-preview
- cart
- checkout-mock
- order-tracking-mock
- mock-api
- shared-ui
- design-system

## State approach

### Server-like state
Even while mocked:
- catalog
- products
- variants
- print profiles
- saved designs
- proofs
- orders
- share previews

Represent through a mock API/query layer rather than importing JSON directly into pages.

### Ephemeral editor state
- current selection
- drag/resize gesture
- zoom/pan
- open panels
- temporary crop
- hover/focus
- active creative tool

Persist only canonical design state, never raw canvas internals.

## Language layer

Customer language:
- “Design check” instead of “Preflight”
- “Final preview” instead of “Proof”
- “Needs a fix” instead of “BLOCKER”
- “Worth checking” instead of “WARNING”
- “Looks ready” instead of “PASS”

Technical terminology remains available in diagnostics/developer mode.

## Non-negotiable frontend invariants

1. Pixels never become persisted physical geometry.
2. Size/model change triggers revalidation before approval.
3. A production blocker prevents final-preview approval.
4. Approved revision becomes read-only.
5. Front/back are visibly distinguishable at all times.
6. Undo/redo operates on design commands, not arbitrary component state.
7. Autosave never silently overwrites a newer revision.
8. Mobile gestures cannot change physical scale because of browser zoom.
9. Any warning visible at approval remains attached to the approved revision.
10. Final preview is visually distinct from editable preview.
11. Remix creates a new draft revision.
12. Share previews never expose original uploaded assets by default.
13. Creation and purchase remain separate decisions.
