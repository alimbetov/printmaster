# PrintMaster — Frontend UX Risk Controls

This document maps known product risks to concrete frontend behavior.

## Geometry

Risk: customer sees one placement but stored geometry differs.

Controls:
- canonical mm state;
- render projection is derived;
- dev overlay can show mm bounds and anchors;
- screenshot/golden tests for representative sizes.

## Size/model changes

Risk: existing design no longer fits.

Controls:
- impact check before switch;
- explicit invalidation;
- no silent scaling;
- optional “create fitted copy” action.

## Low image quality

Controls:
- live effective DPI;
- warning attached to element;
- suggested maximum physical size;
- proof approval blocked below hard threshold.

## Transparency/background

Controls:
- checkerboard asset preview;
- garment-color preview;
- “background appears opaque” hint when detected.

## Contrast

Controls:
- low-contrast advisory;
- ability to preview on selected garment;
- do not claim color accuracy.

## Front/back confusion

Controls:
- persistent side selector;
- orientation text;
- distinct thumbnails;
- final proof shows both sides.

## Autosave and concurrency

Controls:
- Saved/Saving/Offline/Conflict states;
- optimistic version;
- never discard local draft on failed save;
- conflict forces explicit resolution.

## Stale proof

Controls:
- proof tied to revision;
- any edit marks proof obsolete;
- obsolete proof cannot be approved.

## Mobile gesture mistakes

Controls:
- selected-object handles;
- one-finger drag only;
- viewport pinch separated from object transform;
- clear Undo after gestures.

## Accidental destructive action

Controls:
- delete offers immediate Undo;
- clear-all requires confirmation;
- changing product with incompatible geometry warns first.

## Technical warnings

Customer UI should translate production facts into plain language.

Bad:
“LOW_DPI_118”.

Good:
“Image quality is low at this print size. Reduce it to about 15 cm wide for a sharper result.”

Keep technical codes in diagnostics.

## Proof approval

Controls:
- read-only proof;
- exact product, color, size;
- exact physical dimensions;
- warning acknowledgments;
- revision id accessible in details;
- approval CTA visually separated from Edit.

## Accessibility

Risk controls:
- no status communicated only by red/green;
- keyboard transform alternatives on desktop;
- screen-reader labels for toolbar;
- scalable text;
- touch targets >=44px;
- avoid drag-only essential operations.

## Performance

Risks:
- huge images freeze browser;
- long lists/layers degrade editor;
- mobile memory pressure.

Controls:
- upload limits;
- browser-side preview downsample;
- keep original asset reference separately;
- cap MVP layer count;
- virtualize long sticker libraries;
- lazy-load product media.

## UX acceptance criteria

A first-time user should be able to:
1. choose a garment;
2. upload an image;
3. place and size it;
4. understand real print size;
5. notice a quality problem;
6. switch FRONT/BACK without confusion;
7. review a read-only proof;
8. approve it;
9. complete mock checkout

without needing documentation.
