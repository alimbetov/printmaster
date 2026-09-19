# PrintMaster — Editor UX Specification

## Goal

Make a production-constrained editor feel simple to a non-designer.

## Default editor state

On entry:
- selected garment/variant is visible;
- FRONT is active;
- print zone shown subtly;
- safe zone visible only when useful;
- forbidden zones represented clearly but without overwhelming;
- Add image / Add text / Stickers are immediately available;
- physical size appears only after object selection or as compact summary.

## Canvas semantics

Display layers:
1. garment mockup;
2. print-zone guide;
3. safe/warning/forbidden guides;
4. customer design elements;
5. selection controls;
6. non-printing UI overlays.

Only layer 4 contributes to production artwork.

## Add image flow

1. Choose/upload image.
2. Validate file.
3. Show transparency preview when relevant.
4. Normalize mock asset.
5. Place at a safe default size inside print zone.
6. Select it automatically.
7. Show physical dimensions and quality.
8. If DPI is weak, show warning immediately.

Do not insert an uploaded image at its native pixel dimensions.

## Add text flow

Fields:
- text
- approved font
- color
- size
- alignment
- basic weight/style if supported

Default behavior:
- create centered text within safe zone;
- live physical size feedback;
- block unsupported glyph combinations;
- preserve text as editable until approval.

## Stickers

MVP stickers are curated platform assets.
Categories:
- basic shapes
- symbols
- decorative
- local themes
- seasonal

Every sticker has:
- id/version
- vector/raster type
- production-safe flag
- license metadata

## Selection and transforms

Selected object exposes:
- bounding box
- resize handles
- rotation handle
- delete
- duplicate
- lock/unlock optional
- physical width/height

Rules:
- preserve aspect ratio by default for images/stickers;
- allow explicit unlock only if product decision supports distortion;
- snapping to horizontal center and useful anchors;
- subtle haptic/visual feedback on snap where platform supports;
- prevent silent movement beyond hard forbidden boundaries where possible.

## Measurements

Show human-readable real dimensions:
- Width: 24.7 cm
- Height: 29.3 cm

Advanced/internal coordinates stay hidden.

Useful placement hints:
- centered
- 8.5 cm below collar
- left chest
- near print limit

## Preflight UX

Persistent compact indicator:
- green: Ready
- amber: Check
- red: Fix required

Issue format:
- what is wrong;
- which element;
- why it matters;
- how to fix it;
- one-click focus/select element.

Example:
“Image quality is low at this size — 118 DPI. Reduce print size to improve quality.”

Avoid technical codes in primary customer UI; keep codes for diagnostics.

## Product/size changes

Changing:
- size
- model
- color
- side profile

must preview consequences before commit if design validity changes.

Example dialog:
“Size S has a smaller printable area. Your current design will no longer fit.”

Actions:
- Keep current size
- Switch and auto-fit copy
- Switch and edit manually

Auto-fit must create a new draft revision and be explicit.

## Front/back

Prevent ambiguity:
- prominent FRONT / BACK segmented control;
- garment orientation label inside viewport;
- layer list scoped by side;
- mini thumbnail previews for both sides;
- cart/order summary shows both.

## Undo/redo

Command history should include:
- add/remove
- move
- resize
- rotate
- crop
- text change
- layer reorder

Product variant changes should not be casually mixed into object undo history.

## Autosave

UI states:
- Saving…
- Saved
- Offline / unsaved
- Conflict detected

Never imply “Saved” until mock persistence layer has acknowledged the revision.

## Proof review

Proof is not just another editor screen.

Proof page:
- no transform handles;
- exact product/size/color;
- FRONT/BACK views;
- physical dimensions;
- warnings accepted;
- proof revision/version;
- CTA: Approve design.

If customer edits after viewing proof, previous proof becomes obsolete.

## Error recovery

For network/mock failures:
- preserve local draft;
- offer retry;
- never clear editor state on failed save;
- show conflict resolution if remote version advanced.

## Accessibility

- keyboard operability on desktop;
- visible focus states;
- text alternatives for controls;
- color is never the only status signal;
- minimum target 44×44 where touch;
- warnings readable by screen readers;
- zoom does not break layout.
