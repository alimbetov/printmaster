# PrintMaster — Responsive Layout Specification

## Breakpoint philosophy

Do not design three unrelated applications. Use one interaction model adapted to available space.

Reference classes:
- Mobile: 320–767 px
- Tablet: 768–1199 px
- Desktop/Web: 1200 px+

Breakpoints are layout triggers, not device detection.

## Desktop editor

Recommended composition:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Header: product / color / size / save / cart                           │
├──────────────┬──────────────────────────────────────┬────────────────────┤
│ Add content  │                                      │ Properties/Layers  │
│              │              Canvas                  │                    │
│ Image        │                                      │ Object controls    │
│ Text         │         garment + print zone         │ Physical size      │
│ Stickers     │                                      │ Preflight          │
│              │                                      │                    │
├──────────────┴──────────────────────────────────────┴────────────────────┤
│ FRONT / BACK     Zoom     Undo / Redo       Review proof                │
└──────────────────────────────────────────────────────────────────────────┘
```

Rules:
- Canvas gets majority of width.
- Left rail is creation-oriented.
- Right rail is context-oriented.
- Do not hide preflight status below the fold.
- Product/size context remains visible.

## Tablet editor

Use two-pane layout:
- canvas as primary area;
- one adaptive side panel;
- toolbar switches between Add / Properties / Layers / Preflight.

```
┌──────────────────────────────────────────────┐
│ Product context + FRONT/BACK + save          │
├────────────────────────────┬─────────────────┤
│                            │                 │
│          Canvas            │ Adaptive panel  │
│                            │                 │
├────────────────────────────┴─────────────────┤
│ Add | Edit | Layers | Check | Review         │
└──────────────────────────────────────────────┘
```

Panel may collapse to increase canvas size.

## Mobile editor

Mobile must not imitate desktop sidebars.

Use:
- fixed top product context;
- central canvas;
- bottom mode bar;
- bottom sheet for tools/properties;
- explicit Done/Apply for crop and destructive transformations.

```
┌─────────────────────────────┐
│ Hoodie · Black · L    Save  │
│ FRONT        ✓ Printable    │
├─────────────────────────────┤
│                             │
│           Canvas            │
│                             │
│      24.7 × 29.3 cm         │
│                             │
├─────────────────────────────┤
│ + Add | Layers | Check      │
├─────────────────────────────┤
│ Image  Text  Stickers       │
└─────────────────────────────┘
```

## Mobile interaction rules

- One-finger drag moves selected object.
- Pinch on canvas zooms viewport only when no object gesture is active.
- Object resize uses visible handles, not pinch by default.
- Rotation uses explicit rotate handle; two-finger rotate is optional later.
- Bottom sheets must preserve canvas context.
- Destructive actions require immediate Undo affordance.
- Do not place critical actions only behind long press.
- Never require hover.

## Tablet considerations

Tablet is likely a strong editing surface and deserves first-class support:
- Apple Pencil / stylus should behave as pointer;
- minimum hit target 44×44 CSS px;
- panels should not cover the selected artwork when avoidable;
- landscape and portrait layouts both supported.

## Responsive behavior matrix

| Area | Desktop | Tablet | Mobile |
|---|---|---|---|
| Navigation | full header | compact header | compact header |
| Add tools | left rail | adaptive panel | bottom sheet |
| Properties | right rail | adaptive panel | bottom sheet |
| Layers | right tab | adaptive panel | full-height sheet |
| Preflight | persistent summary | tab + badge | badge + sheet |
| Canvas zoom | controls + wheel | controls/pinch | controls/pinch |
| FRONT/BACK | persistent | persistent | persistent |
| Review proof | primary CTA | primary CTA | sticky CTA |

## Orientation changes

When viewport rotates:
- canonical design geometry does not change;
- editor viewport is recalculated;
- selection remains;
- zoom may be recalculated to fit;
- no autosave should serialize viewport pixels.

## Safe-area support

On mobile:
- account for iOS/Android safe insets;
- bottom CTA must remain above browser/home indicators;
- sheets must not hide confirmation actions behind virtual keyboards.
