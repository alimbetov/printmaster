# PrintMaster — UI Design System v0.1

## 1. Design intent

PrintMaster should feel:
- expressive;
- tactile;
- fast;
- visually confident;
- contemporary;
- simple under pressure;
- non-childish.

It should not feel:
- enterprise;
- toy-like;
- neon-gamer by default;
- overly glossy;
- like Photoshop;
- like a print-production admin panel.

The design system must support creativity first while keeping production status, approval and commerce trustworthy.

## 2. Theme strategy

Use a neutral core with one strong brand accent.

Do not bake collection/vibe colors into global semantic tokens.

### Core palette

```css
--pm-bg:             #F7F7F8;
--pm-surface:        #FFFFFF;
--pm-surface-2:      #F0F1F3;
--pm-surface-dark:   #111214;

--pm-text:           #111214;
--pm-text-muted:     #666A73;
--pm-text-inverse:   #FFFFFF;

--pm-border:         #DDDFE3;
--pm-border-strong:  #B8BCC5;

--pm-accent:         #6C4DFF;
--pm-accent-hover:   #5D3EF0;
--pm-accent-soft:    #EEE9FF;

--pm-success:        #14804A;
--pm-success-soft:   #E8F6EE;

--pm-warning:        #A35A00;
--pm-warning-soft:   #FFF1D6;

--pm-danger:         #C23333;
--pm-danger-soft:    #FDEAEA;

--pm-info:           #2563EB;
--pm-info-soft:      #EAF1FF;
```

Notes:
- accent is expressive but not the only identity;
- semantic colors must never be the only status cue;
- vibe packs may use local accent tokens, not replace semantic colors.

## 3. Dark surfaces

The editor may use a darker neutral workspace around the garment to increase focus.

Suggested workspace tokens:

```css
--pm-canvas-bg:      #191A1D;
--pm-canvas-panel:   #222328;
--pm-canvas-border:  #34363C;
```

Garment and controls must remain readable in both light and dark application themes.

Dark mode is not required for MVP, but tokens should not prevent it.

## 4. Typography

Use one highly readable sans-serif UI family.

Recommended default:
- Inter
- fallback: system-ui, sans-serif

Optional display/brand family may be introduced later, but never for dense controls.

### Type scale

```
Display XL   48 / 52 / 700
Display L    40 / 44 / 700
H1           32 / 38 / 700
H2           24 / 30 / 700
H3           20 / 26 / 650
Body L       18 / 28 / 400
Body         16 / 24 / 400
Body S       14 / 20 / 400
Label        13 / 18 / 600
Caption      12 / 16 / 500
```

Mobile:
- do not shrink body below 16px for primary reading;
- controls may use 14px labels where space demands.

## 5. Spacing

Base grid: 4px.

Token scale:

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

Do not introduce arbitrary 13/17/23px spacing without a specific optical reason.

## 6. Radius

```
--radius-sm:   8px
--radius-md:   12px
--radius-lg:   16px
--radius-xl:   24px
--radius-pill: 999px
```

Use:
- 12px for inputs/small cards;
- 16px for cards/panels;
- 24px for bottom sheets/hero surfaces;
- pills only for chips/status/segmented controls.

## 7. Elevation

Keep restrained.

```
--shadow-1: 0 1px 2px rgba(0,0,0,.06);
--shadow-2: 0 6px 20px rgba(0,0,0,.10);
--shadow-3: 0 16px 40px rgba(0,0,0,.14);
```

Do not stack shadows on every surface.

## 8. Layout grid

### Desktop
- max content width: 1440px;
- page gutters: 32–48px;
- 12-column grid;
- editor may break normal content width and use full available viewport.

### Tablet
- gutters: 24px;
- 8-column grid.

### Mobile
- gutters: 16px;
- 4-column grid;
- editor canvas may intentionally touch screen edges with safe padding.

## 9. Touch and pointer

Minimum interactive target:
- 44 × 44 CSS px.

Preferred primary mobile buttons:
- height 52–56px.

Editor transform handles:
- visually smaller is acceptable;
- hit target must still be ≥44px where possible.

## 10. Buttons

### Primary
Use for one dominant action only.

Examples:
- Create yours
- Preview
- Approve design
- Place order

Height:
- desktop 44–48px;
- mobile 52px.

### Secondary
Outlined or neutral surface.

Examples:
- Browse clothes
- Edit
- Remix

### Tertiary
Text/icon action with clear hover/focus state.

### Danger
Reserved for destructive actions, never used for ordinary “cancel”.

### Loading
Button label stays stable where possible:
- Approving…
- Saving…

Do not replace with a spinner-only button if the action meaning would disappear.

## 11. Icon buttons

- 44px hit target minimum;
- 20–24px icon;
- tooltip on desktop;
- accessible label always;
- no essential icon without recognizable label on first-use flows.

## 12. Cards

### ProductCard
Contains:
- garment image;
- name;
- fit chip;
- price/starting price;
- color swatches;
- Customize.

Keep text subordinate to imagery.

### VibeCard
Highly visual.
Contains:
- cover;
- vibe name;
- optional short hint.

### DesignCard
Contains:
- clean design preview;
- garment/side;
- saved status;
- Remix.

## 13. Chips

Use for:
- size;
- fit;
- color names;
- filters;
- status metadata.

Selected state requires shape/background/border change, not color alone.

## 14. Segmented controls

Use for mutually exclusive small sets:
- FRONT / BACK;
- Product / Design view where needed.

Do not use tabs where changing selection changes production side without obvious context.

## 15. Inputs

Forms should feel secondary to the visual experience.

Requirements:
- visible label;
- 48px control height typical;
- error below field;
- no placeholder-only labeling;
- clear keyboard type on mobile;
- address/contact fields appear only in checkout.

## 16. Bottom sheets

Core mobile interaction pattern.

### Sizes
- peek: 30–40vh;
- medium: 55–65vh;
- full: 90–100vh.

### Anatomy
- drag handle optional;
- title;
- close;
- scroll body;
- sticky action/footer only where needed.

### Rules
- opening a sheet must not destroy canvas state;
- selected element remains visually identifiable;
- backdrop should not make garment completely unreadable;
- nested bottom sheets are forbidden in MVP.

## 17. Editor dock

Default mobile dock:

```
Add | Style | Layers | Check
```

When an element is selected:

```
Crop | Duplicate | Size | More
```

Desktop uses equivalent contextual rails/panels, but action naming stays consistent.

## 18. Design-check badges

Customer labels:

### Ready
Label: “Looks ready”
Icon: check
Semantic: success

### Warning
Label: “Worth checking”
Icon: warning triangle
Semantic: warning

### Blocker
Label: “Needs a fix”
Icon: error/cross
Semantic: danger

Badge must include:
- icon;
- text;
- color.

Compact status may show count:
- Needs a fix · 2

## 19. Toast / Undo

Use for:
- deleted object;
- duplicated object;
- moved to other side;
- save retry.

Example:
“Image deleted”  [Undo]

Toast should not obscure the bottom editor dock.

## 20. Dialogs

Use only for:
- destructive full-design reset;
- incompatible product/size switch;
- unsaved navigation where recovery is impossible;
- conflict resolution.

Do not use confirmation dialogs for ordinary object delete if Undo exists.

## 21. Loading

### Skeleton
Use for:
- catalog cards;
- product page;
- saved designs.

### Editor
Never replace the whole canvas with a spinner once a draft is loaded.

Use local loading indicators for:
- asset upload;
- proof generation;
- save.

## 22. Motion

Duration:
- micro: 120–180ms;
- panel/sheet: 220–300ms;
- reveal: up to 400ms.

Use easing consistently.

Motion purposes:
- causality;
- spatial continuity;
- feedback.

Respect reduced-motion.

## 23. Focus states

Visible keyboard focus:
- 2px high-contrast ring;
- offset where needed;
- never rely on browser default if visually lost.

## 24. Status hierarchy

Order of attention:
1. blocker;
2. current creative selection;
3. primary action;
4. warning;
5. save state;
6. informational production detail.

A “Saved” label should never compete visually with “Needs a fix”.

## 25. Design-token implementation

Use semantic tokens in React/CSS:

```
color.background
color.surface
color.text
color.accent
color.success
color.warning
color.danger
space.*
radius.*
type.*
shadow.*
```

Do not reference raw hex values in feature components.

## 26. Localization behavior

The design system must support:
- `kk-KZ`;
- `ru-KZ`;
- `en-US`.

Rules:
- do not use fixed widths for text-heavy controls;
- expect translated text expansion;
- bottom-dock labels must fit all MVP locales;
- semantic tokens are language-independent;
- prefer CSS logical properties where direction-neutral;
- typography must support Kazakh Cyrillic glyphs;
- customer-facing strings come from i18n resources, never feature components.

Development should include pseudo-localization to expose clipping and hardcoded strings.
