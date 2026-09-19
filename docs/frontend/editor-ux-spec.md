# PrintMaster — Editor UX Specification

## Goal

Make a production-constrained editor feel like a lightweight creative playground, not professional design software.

The user should reach a meaningful visual result quickly while production rules operate mostly in the background.

## Default editor state

On entry:
- garment fills the main visual area;
- selected variant is visible but compact;
- FRONT is active and obvious;
- Add is the strongest creative action;
- print zone is subtle;
- safe/forbidden guides appear when relevant;
- no technical panels are open by default;
- physical dimensions are available contextually;
- Design check status is visible but visually secondary while creating.

## First-minute experience

Target flow:
1. Add image / text / sticker.
2. Element appears at a safe default position.
3. User directly manipulates it.
4. Quick placement suggestions appear where useful.
5. Status updates without interrupting.
6. Preview is one tap away.

Do not force a tutorial before creation.

## Canvas semantics

Display layers:
1. garment mockup;
2. contextual print/safe/forbidden guides;
3. customer design elements;
4. selection controls;
5. non-printing UI overlays.

Only customer design elements contribute to production artwork.

## Quick placement presets

For supported garment/side combinations:
- Center
- Small chest
- Big front
- Big back
- Minimal
- Name + number where appropriate

Preset behavior:
- deterministic geometry;
- respects PrintProfile;
- produces an ordinary editable draft;
- never creates an approved state automatically.

## Add image flow

1. Choose/upload image.
2. Validate.
3. Show visual preview immediately.
4. Normalize mock asset.
5. Place at a safe useful size.
6. Select automatically.
7. Show quality feedback only if relevant.
8. Offer quick placement suggestions.

Avoid technical DPI-first language.

Customer copy:
“Looks sharp”
or
“This may print blurry if you make it this big.”

## Add text flow

Primary UI:
- enter text
- visual font carousel
- color
- quick size/style presets

Secondary:
- numeric size
- alignment
- advanced options

Default:
- centered safely;
- editable immediately;
- unsupported glyphs caught early.

## Stickers and vibe packs

Sticker discovery should be visual and quick.

Categories can include:
- symbols
- shapes
- cute
- street
- sport
- local
- seasonal

Vibe packs may combine fonts + stickers + layout suggestions.

Every asset remains versioned, production-safe and licensed.

## Selection and transforms

Selected object exposes:
- visual bounding box
- large resize handles
- rotate handle
- compact contextual toolbar
- delete
- duplicate
- optional exact size

Rules:
- preserve aspect ratio by default for images/stickers;
- snap to center/anchors with subtle feedback;
- do not fight the user's drag gesture;
- invalid placement is shown clearly through Design check.

## Measurements

Default customer display:
- 24.7 × 29.3 cm

Do not show raw coordinates.

Exact size belongs to secondary/advanced UI.

Useful hints:
- Centered
- Small chest
- 8.5 cm below collar
- Close to print edge

## Design check UX

Customer-facing states:
- Looks ready
- Worth checking
- Needs a fix

Each issue includes:
- plain-language explanation;
- affected object;
- why it matters;
- direct action.

Examples:
- “This image may print blurry at this size.”
- “Part of your design is outside the printable area.”
- “Move this a little higher.”

One tap focuses the affected object.

Technical codes remain in diagnostics.

## Product/size changes

If a change invalidates design:
- preview impact first;
- do not silently rescale;
- preserve original revision.

Actions:
- Keep current
- Switch and edit
- Create fitted copy

“Create fitted copy” is a new draft and remains fully editable.

## Front/back

Use:
- prominent FRONT / BACK control;
- visual mini thumbnails;
- swipe between sides in Final preview;
- side-specific layer list;
- clear side label in editor.

No automatic mirroring.

## Remix

Remix is a first-class creation action.

It always:
- clones to a new draft;
- preserves original;
- can target another garment/color/size;
- triggers fresh validation.

## Undo/redo

Command history includes:
- add/remove
- move
- resize
- rotate
- crop
- text change
- layer reorder
- placement preset

Variant changes are outside casual object-history semantics.

## Autosave

States:
- Saving…
- Saved
- Offline / unsaved
- Conflict detected

Saving feedback should stay quiet unless there is a problem.

## Final preview

Final preview is a reveal moment and a serious approval artifact.

Use:
- large/full-screen garment presentation;
- FRONT/BACK swipe or segmented control;
- clean design with editor chrome removed;
- product/color/size;
- physical print size in details;
- Design check summary;
- Edit;
- Approve design.

Any edit makes that Final preview obsolete.

## Share preview

Optional share-preview:
- uses non-production mockup;
- no editor chrome;
- share link/image;
- private by default;
- original upload never exposed automatically.

Share preview is not the approved production proof.

## Error recovery

For failures:
- preserve local draft;
- offer retry;
- never clear canvas;
- conflict resolution is explicit;
- stale Final preview cannot be approved.

## Accessibility

- keyboard operability on desktop;
- visible focus states;
- non-color status cues;
- touch targets >=44px;
- screen-reader labels;
- reduced motion support;
- zoom-safe layout;
- direct manipulation has numeric/keyboard alternatives where practical.
