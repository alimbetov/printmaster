# PrintMaster — Frontend Design Roadmap

## Stage F0 — UX architecture

Deliver:
- product IA;
- screen matrix;
- responsive layouts;
- editor interaction model;
- mock API contracts;
- UX risk controls.

Exit:
- desktop/tablet/mobile flows are internally consistent.

## Stage F1 — Low-fidelity shell

Build clickable React shell with mock routing:
- Home
- Catalog
- Product detail
- Editor shell
- Proof
- Cart
- Checkout
- Confirmation

No sophisticated canvas yet.

Goal:
validate navigation and responsive behavior.

## Stage F2 — Design system

Define:
- typography
- spacing scale
- radii
- elevation
- form controls
- buttons
- segmented control
- badges
- sheets/drawers
- dialogs
- toast/undo
- status patterns
- empty/error/loading states

Do not lock visual branding too early.

## Stage F3 — Editor geometry prototype

Implement:
- garment canvas projection;
- mm↔viewport transforms;
- one image element;
- move/resize/rotate;
- print/safe zones;
- physical dimensions;
- undo/redo.

This is the most important technical frontend spike.

## Stage F4 — Editor feature MVP

Add:
- upload mock;
- text;
- stickers;
- crop;
- layers;
- FRONT/BACK;
- autosave mock;
- preflight mock.

## Stage F5 — Responsive hardening

Test:
- 320/360/390/430 mobile widths;
- 768/820/1024 tablet;
- 1280/1440/1920 desktop;
- portrait/landscape;
- touch/pointer/keyboard.

## Stage F6 — Proof and checkout

Implement:
- read-only proof;
- warnings;
- approval snapshot;
- cart;
- checkout/payment simulations;
- order tracking mock.

## Stage F7 — Failure-state UX

Exercise:
- save timeout;
- offline;
- 409 conflict;
- failed upload;
- proof generation failure;
- stale proof;
- payment failure/timeout;
- inventory invalidation.

## Stage F8 — Usability test

Run scripted tasks with people unfamiliar with printing.

Measure:
- time to first design;
- wrong-side mistakes;
- unresolved blocker rate;
- accidental size changes;
- proof comprehension;
- mobile completion rate.

Only after this stage should backend contracts be treated as stable enough to implement.
