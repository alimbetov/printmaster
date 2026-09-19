# PrintMaster — Responsive Layout Specification

## Breakpoint philosophy

Use one product model with layouts optimized for available space.

Reference classes:
- Mobile: 320–767 px
- Tablet: 768–1199 px
- Desktop/Web: 1200 px+

Breakpoints are layout triggers, not device detection.

## Experience priority

For the target audience, mobile is not a reduced editor. It is a primary creation surface.

Across all sizes:
- canvas/product preview is visually dominant;
- production controls are progressive;
- primary actions stay in reach;
- Final preview is always easy to reach.

## Desktop editor

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Product context         FRONT / BACK              Saved       Preview  │
├──────────────┬──────────────────────────────────────┬────────────────────┤
│ Add          │                                      │ Contextual edit    │
│              │                                      │                    │
│ Image        │              GARMENT                 │ Style              │
│ Text         │                                      │ Layers             │
│ Stickers     │             [ DESIGN ]               │ Design check       │
│ Presets      │                                      │                    │
│              │                                      │                    │
├──────────────┴──────────────────────────────────────┴────────────────────┤
│ Undo / Redo                    Zoom                         Final preview │
└──────────────────────────────────────────────────────────────────────────┘
```

Vibe packs, when enabled, are optional design starters rather than a permanent editor mode.

Do not expose a permanent dense properties inspector unless an element needs it.

## Tablet editor

Tablet should feel like a creation workstation.

```
┌──────────────────────────────────────────────┐
│ Hoodie · Black · L    FRONT      Preview    │
├────────────────────────────┬─────────────────┤
│                            │ Context panel   │
│          GARMENT           │                 │
│        [ DESIGN ]          │ Style / Layers  │
│                            │ Check           │
├────────────────────────────┴─────────────────┤
│ Add          Style          Preview         │
└──────────────────────────────────────────────┘
```

Layers and Design Check are accessible contextually and through the persistent status indicator.

Panel collapses easily to maximize canvas.

## Mobile editor

Mobile prioritizes one-handed creation and direct manipulation.

Default first-session dock:

```
┌─────────────────────────────┐
│ Hoodie · Black · L  Preview │
│ FRONT          Looks ready  │
├─────────────────────────────┤
│                             │
│          GARMENT            │
│                             │
│       [  DESIGN  ]          │
│                             │
│                             │
├─────────────────────────────┤
│ Add        Style    Preview │
└─────────────────────────────┘
```

The Design Check status itself is tappable and opens the check sheet.

Layers becomes prominent when:
- the design contains multiple elements;
- the user explicitly opens More;
- the current task requires ordering/selecting overlapping elements.

When an object is selected, bottom dock becomes contextual:

```
┌─────────────────────────────┐
│ Crop  Duplicate  Size  More │
└─────────────────────────────┘
```

## Bottom sheets

Use visual bottom sheets for:
- Add
- Style/font/sticker discovery
- Layers
- Design check
- Product variant quick change

Sheets should support:
- half-height peek;
- expand to full height;
- preserve canvas context;
- clear close affordance.

## Dedicated mobile text-edit state

When editing text:
- compact canvas remains visible;
- focused text field stays above the virtual keyboard;
- font/style choices remain reachable;
- Done commits the text command;
- keyboard opening must not unexpectedly pan/scale garment geometry.

## Mobile interaction rules

- One-finger drag moves selected object.
- Pinch on canvas controls viewport only.
- Resize uses visible handles.
- Rotate uses explicit handle.
- No critical long-press actions.
- No hover dependencies.
- Undo stays easy to reach after destructive gestures.
- Virtual keyboard must not cover Apply/Done.
- Dragging is never the only way to perform an essential operation.

Alternatives include:
- center/alignment actions;
- placement presets;
- numeric size;
- keyboard nudge on supported hardware;
- layer move up/down controls.

## Thumb-zone priority

Primary mobile actions belong in bottom/central reach:
- Add
- Style
- Preview

Secondary/contextual:
- Layers
- Design Check
- exact measurements
- advanced editing

## Tablet considerations

- stylus behaves as pointer;
- min 44×44 CSS px product target;
- landscape and portrait;
- panels avoid covering selected artwork;
- keyboard attachment should enhance, not change, editor semantics.

## Responsive behavior matrix

| Area | Desktop | Tablet | Mobile |
|---|---|---|---|
| Canvas | dominant center | dominant | dominant/full |
| Add | left visual rail | adaptive panel | bottom sheet |
| Style | contextual panel | adaptive panel | bottom sheet |
| Layers | contextual tab | contextual panel | contextual sheet |
| Design check | persistent summary | badge + panel | tappable badge + sheet |
| FRONT/BACK | persistent | persistent | persistent |
| Final preview | primary CTA | primary CTA | primary dock/header CTA |
| Exact measurements | contextual | contextual | secondary sheet |
| Vibe packs | optional starter surface | optional sheet | optional sheet |

## Orientation changes

Viewport rotates:
- garment geometry stays unchanged;
- canvas projection recalculates;
- selection remains;
- active unsafe gesture may cancel;
- no viewport pixels are persisted.

## Motion

Allow subtle:
- snap feedback;
- side flip;
- sheet transitions;
- preview reveal.

Respect prefers-reduced-motion.

Avoid decorative motion that competes with design.

## Safe-area support

Account for:
- iOS/Android safe insets;
- browser bars;
- virtual keyboard;
- foldable/split layouts where feasible.

Primary CTA must remain reachable.
