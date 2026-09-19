# PrintMaster — Frontend Design Roadmap

## Stage F0 — UX architecture

Deliver:
- product IA;
- screen matrix;
- responsive layouts;
- editor interaction model;
- mock API contracts;
- UX risk controls;
- canonical frontend coordinate-system specification;
- pointer/gesture state machine;
- optimistic-concurrency semantics;
- independent proof-render contract.

Exit:
- desktop/tablet/mobile flows are internally consistent;
- P0 findings in frontend-architecture-review.md are resolved by contract.

## Stage F1 — Low-fidelity shell

Build clickable React shell with mock routing:
- Home
- Catalog
- Product detail
- Editor shell
- Preflight review
- Proof
- Cart
- Checkout
- Confirmation/Tracking

No sophisticated canvas yet.

Goal:
validate navigation, responsive behavior, unsaved-change behavior, and cart/proof flow.

## Stage F2 — Design system

**Design specification complete; implementation pending.**

Defined:
- semantic color system;
- typography scale;
- 4px spacing grid;
- radii/elevation;
- page grids;
- buttons/icon buttons;
- cards/chips/segmented controls;
- inputs;
- bottom sheets;
- editor dock;
- Design check badges;
- toast/undo;
- loading/error/conflict patterns;
- focus/accessibility rules;
- reusable component inventory;
- mobile/tablet/desktop low-fidelity wireframes;
- Final Preview screen contract.

References:
- ui-design-system.md
- ui-component-spec.md
- low-fidelity-wireframes.md
- final-preview-screen.md

Do not lock final brand decoration before the clickable shell is tested.

## Stage F3 — Editor geometry prototype

Implement:
- garment-space mm model;
- viewport projection;
- one image element;
- center-anchor persisted geometry;
- move/resize/rotate;
- print/safe/forbidden zones;
- physical dimensions;
- undo/redo command model;
- pointer/gesture arbitration;
- independent proof renderer prototype.

This is the most important technical frontend spike.

Exit:
- mm→viewport→mm round-trip tests pass;
- editor/proof golden fixtures agree on canonical geometry;
- zoom/orientation changes do not mutate persisted geometry.

## Stage F4 — Editor feature MVP

Add:
- upload mock;
- normalized preview asset;
- text;
- curated stickers;
- crop;
- layers;
- FRONT/BACK;
- autosave mock;
- optimistic conflict handling;
- live preflight mock.

## Stage F5 — Responsive hardening

Test:
- 320/360/390/430 mobile widths;
- 768/820/1024 tablet;
- 1280/1440/1920 desktop;
- portrait/landscape;
- touch/pointer/stylus/keyboard;
- virtual keyboard;
- browser zoom;
- safe-area insets.

Target browser matrix:
- current Chrome desktop;
- current Edge desktop;
- current Safari desktop;
- current Safari iOS;
- current Chrome Android.

## Stage F6 — Proof and checkout

Implement:
- read-only proof;
- stale-proof invalidation;
- warning acknowledgments;
- approval snapshot;
- cart replacement flow;
- checkout/payment simulations;
- order tracking mock.

## Stage F7 — Failure-state UX

Exercise:
- save timeout;
- late save response;
- offline;
- 409 conflict;
- failed upload;
- preflight stale response;
- proof generation failure;
- stale proof;
- payment failure/timeout;
- duplicate callback;
- inventory invalidation.

## Stage F8 — Usability test

Run scripted tasks with people unfamiliar with printing.

Measure:
- time to first design;
- wrong-side mistakes;
- unresolved blocker rate;
- accidental size changes;
- proof comprehension;
- cart-edit abandonment;
- mobile completion rate;
- conflict recovery success.

Instrument non-sensitive events only; never send artwork content in analytics.

Only after this stage should backend contracts be treated as stable enough to implement.
