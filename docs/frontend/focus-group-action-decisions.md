# PrintMaster — Focus Group Action Decisions

Derived from the nine simulated professional focus groups.

## Accepted immediately

### Simplify mobile primary navigation
Default mobile editor dock target:
- Add
- Style
- Preview

Design Check becomes a persistent status chip/button.

Layers becomes contextual and appears prominently once multiple elements exist.

### Clarify Style vs Vibe
- Style = properties/appearance of selected element.
- Vibe = optional whole-design starter/content pack.

Vibe is not a core editor mode.

### Digital readiness language
“Looks ready” means digital design validation passed.

It must never mean guaranteed physical color/adhesion/appearance.

Final Preview supporting copy:
“Your digital design checks passed. The garment preview is approximate.”

### SKU-specific presets
Placement presets are not global constants.
They resolve through PrintProfileVersion + side + size/SKU.

### Accessibility alternatives to drag
Required:
- placement presets;
- center/alignment actions;
- keyboard nudge;
- numeric size;
- move layer up/down.

### Deterministic mock scenarios
Mock runtime must support named scenarios rather than only randomness.

### Early pricing
Frontend architecture must reserve a compact live estimate surface before cart.

## Requires next specification

- frontend runtime architecture;
- client draft persistence;
- analytics event schema;
- share-link privacy/security;
- editor hit-testing;
- snapping;
- element locking;
- transform order;
- performance budget;
- mobile text-edit layout.

## Prototype experiments

Do not lock until tested:
- three-item vs four-item mobile dock;
- dark vs adaptive editor background;
- exact dimension always visible vs contextual;
- Vibe packs in initial alpha;
- timing of default garment selection in create-first flow.
