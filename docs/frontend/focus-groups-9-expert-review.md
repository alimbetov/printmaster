# PrintMaster — 9 Simulated Expert Focus Groups

## Method

This is a structured **expert simulation**, not a claim of real human interviews.

Nine independent groups review the same PrintMaster specification from different professional lenses. Group sizes intentionally vary to reduce single-discipline bias.

Total simulated professionals: **53**.

The review covers:
- frontend product architecture;
- Gen Alpha product vision;
- responsive UX;
- editor UX;
- UI design system;
- wireframes;
- localization;
- mock contracts;
- geometry/concurrency/proof invariants;
- production risk register.

External calibration:
- Baymard 2026 mobile ecommerce UX research;
- WCAG 2.2 pointer/dragging/target-size requirements.

## Group composition

| Group | Size | Professional mix |
|---|---:|---|
| FG1 Product clarity | 3 | Product designer, UX strategist, service designer |
| FG2 Gen Alpha / youth | 4 | Youth researcher, cultural strategist, interaction designer, trust/safety specialist |
| FG3 Mobile UX | 5 | Mobile UX, iOS UX, Android UX, responsive designer, accessibility designer |
| FG4 Editor interaction | 5 | Canvas/UI engineer, interaction designer, graphics engineer, QA, HCI specialist |
| FG5 Ecommerce | 6 | Ecommerce UX, CRO, product manager, checkout UX, merchandising, customer support |
| FG6 Visual / brand | 6 | Art director, brand designer, UI designer, motion designer, type designer, design-system lead |
| FG7 Accessibility / i18n | 7 | Accessibility, inclusive design, localization, Kazakh language UX, Russian UX writing, frontend a11y, QA |
| FG8 Print / operations | 8 | DTF technologist, prepress, operator, QC, production manager, garment sourcing, fulfillment, claims |
| FG9 Architecture / platform | 9 | Frontend architect, backend architect, security, SRE, QA automation, data, payments, storage, platform engineer |

---

# FG1 — Product clarity

## Consensus

The core proposition is strong:
**“make something wearable quickly”** is substantially clearer than “custom printing platform”.

### Strong decisions
- Create-first path.
- Shop-first remains available.
- Final Preview is separate from editor.
- Design Check language is consumer-friendly.
- Production complexity remains hidden.

## Problems found

### 1. Too many concepts can enter the creation flow too early
Current scope contains:
- Add
- Style
- Layers
- Check
- Presets
- Vibes
- Remix
- Share

This is powerful but risks diluting the first-minute flow.

### Recommendation
First-session UI exposes only:
- Add
- Style
- Preview

Layers appears after 2+ elements.
Check appears as status badge until there is an issue.

### 2. “Vibe” and “Style” may overlap conceptually
Users may not understand whether:
- Style modifies selected object;
- Vibe modifies the whole design.

### Recommendation
Define:
- **Style** = selected-object styling.
- **Vibe** = optional design starter/template pack.

Do not place both as equal first-level actions.

### 3. Create-first garment timing needs precision
Creating before garment selection is attractive, but physical geometry depends on product.

### Recommendation
Create-first begins on a **default canonical garment context**, visibly labeled.
Changing product later always invokes compatibility preview.

## Group verdict

Proceed, but simplify first-session command vocabulary.

---

# FG2 — Gen Alpha / youth experience

## Consensus

The current direction is much stronger than a conventional ecommerce configurator.

### Strong decisions
- Visual-first.
- Remix.
- Share preview.
- Private-by-default.
- No purchase streaks/countdowns/fake scarcity.
- Creation and purchase are separated.

## Problems found

### 1. Risk of adults designing “for young people”
Words like Street, Cute, Y2K, Anime-inspired can age quickly or feel imposed.

### Recommendation
Vibe taxonomy must be content-configurable, not hardcoded into frontend domain logic.

Treat vibe labels as merchandising content.

### 2. Share should not require public identity
Younger users may want to send a design privately without establishing a profile.

### Recommendation
Support:
- private share link;
- image export/share sheet later;
- no mandatory public handle.

### 3. The strongest reward is visual transformation, not badges
Gamifying “completion” would weaken trust.

### Recommendation
Use delight around:
- garment transformation;
- side flip;
- remix;
- visual placement.

Not:
- points;
- streaks;
- “level up” shopping;
- countdown pressure.

### 4. Blank canvas anxiety
An empty garment can create indecision.

### Recommendation
First-use empty state should offer:
- Upload a pic
- Add text
- Start from a layout

Not a modal tutorial.

## Group verdict

The product should feel culturally current but avoid encoding a fixed idea of “Gen Alpha style”.

---

# FG3 — Mobile UX

## Consensus

Mobile-first architecture is correct, but mobile interaction still risks feature density.

Baymard's 2026 benchmark reports most mobile ecommerce experiences remain mediocre, reinforcing the decision not to compress desktop UI into mobile.

## Critical findings

### 1. Four-item dock should be a maximum, not a requirement
When an element is selected, contextual tools are more important than global tools.

Recommended default:
- Add
- Style
- Preview

Status badge opens Check.

Layers becomes contextual/overflow until necessary.

### 2. Preview needs thumb-zone access
Top-right Preview may be hard one-handed on tall devices.

Recommendation:
- sticky bottom Preview CTA when no object is selected; or
- Preview remains top but also accessible through dock transition.

### 3. Dragging requires alternatives
WCAG 2.2 requires drag-based functions to have a single-pointer alternative where dragging is not essential.

Recommendation:
- numeric or step controls for size/position;
- “Move to center” / placement presets;
- layer reorder controls in addition to drag.

### 4. 44px target is a strong product target
WCAG AA minimum is lower in some circumstances, but 44px remains a robust enhanced target for this touch-heavy editor.

### 5. Bottom-sheet collision risk
Virtual keyboard + sheet + canvas can make text editing unusable.

Recommendation:
Create a dedicated mobile text-edit state:
- compact canvas preview;
- text field above keyboard;
- font/style carousel;
- clear Done.

## Group verdict

Mobile is viable, but reduce dock complexity and formalize text-edit layout.

---

# FG4 — Editor interaction

## Consensus

The strongest architectural work is:
- mm coordinate system;
- center-anchor semantics;
- independent proof renderer;
- command-based undo;
- pointer state machine.

## Critical findings

### 1. Selected-object hit testing needs specification
What happens when several transparent/overlapping objects exist?

Recommendation:
Define selection precedence:
1. transform handles;
2. currently selected element;
3. topmost visible element under pointer;
4. cycle/select-from-layers option.

### 2. Locking needs a deliberate MVP decision
Without locking, background decorative elements can be moved accidentally.

Recommendation:
Support element lock in MVP if multi-element designs are enabled.

### 3. Snap tolerance must be viewport-aware
A fixed millimeter tolerance behaves differently at 30% vs 300% zoom.

Recommendation:
Snap detection should use viewport-space tolerance while resulting geometry stays in mm.

### 4. Crop + rotation + resize order must be deterministic
Potential renderer divergence remains.

Recommendation:
Canonical element pipeline:
asset crop → element local scale → rotation → translation.

### 5. Layer limit needs an explicit MVP budget
Arbitrary layer count can destroy mobile performance.

Recommendation:
Start with a configurable soft limit, e.g. 20–30 design elements, then measure.

## Group verdict

Do not start Konva implementation before hit-testing, locking, snapping and transform order are documented.

---

# FG5 — Ecommerce

## Consensus

Separating creative approval from checkout is a major strength.

## Problems found

### 1. Price appears too late
A user may spend time creating and discover an unacceptable price at cart.

### Recommendation
Show a non-intrusive live estimate:
- garment base;
- optional side/print impact;
- “estimated total”.

Never make price a surprise.

### 2. Size confidence is under-designed
Custom goods create stronger return friction.

### Recommendation
Product/variant flow must include:
- measurements;
- fit description;
- model/reference measurements later;
- persistent selected size in Final Preview.

### 3. Cart “Edit” semantics are excellent but need UI explanation
Otherwise users may assume their cart item is instantly mutated.

Recommendation:
During edit:
“Your current approved design stays in cart until you approve the new version.”

### 4. Guest path should exist
Do not require account creation to create or checkout in MVP unless business requirements demand it.

### 5. Checkout should be short
Baymard consistently finds checkout friction can itself cause abandonment.

Recommendation:
Do not combine:
- design decisions;
- account creation;
- marketing opt-ins;
- shipping;
- payment
into one dense page.

## Group verdict

Add price visibility and size-confidence UX before implementation.

---

# FG6 — Visual / brand design

## Consensus

Neutral core + purple accent is a reasonable prototype system but not yet a differentiated brand.

## Findings

### 1. Current tokens are implementation-ready, not identity-ready
This is acceptable before usability testing.

### 2. Dark editor workspace is promising
It makes garment/art the visual focal point.

Risk:
white garment on white Final Preview and dark garment on dark workspace.

Recommendation:
Final Preview uses adaptive neutral backdrop based on garment luminance.

### 3. “Looks ready” green should not dominate the creative canvas
Status should reassure, not turn the product into a validation tool.

### 4. Visual hierarchy should emphasize artwork over UI chrome
Side rails need low visual mass.

### 5. Motion should be spatial, not celebratory
Approved:
- snap;
- sheet;
- side transition;
- preview reveal.

Avoid:
- confetti;
- bouncing purchase CTA;
- decorative animated gradients.

## Group verdict

Keep the design system restrained until real product imagery exists. Brand polish should follow interactive prototype testing.

---

# FG7 — Accessibility and localization

## Consensus

Localization architecture is strong, especially:
- kk-KZ / ru-KZ / en-US;
- locale-neutral error codes;
- no design-text auto-translation;
- Kazakh font coverage.

## Critical findings

### 1. 44px touch targets should remain a design-system requirement
WCAG 2.2 AA has a 24px target-size criterion with exceptions, while 44×44 is the enhanced AAA target. PrintMaster's 44px target is appropriate for a direct-manipulation product.

### 2. Drag alternatives need explicit component coverage
Not just a policy document.

Required alternatives:
- layer move up/down;
- center horizontally;
- position preset;
- numeric size;
- keyboard nudge.

### 3. Localized bottom dock may overflow
Kazakh and Russian strings can be longer.

Recommendation:
- icon + short localized label;
- automated snapshot tests at 320px;
- pseudo-localization required in CI.

### 4. Creative fonts can create accessibility and language problems
Recommendation:
Tag fonts with:
- script coverage;
- readability category;
- production-safe status.

### 5. Color picker accessibility
Do not expose only colored circles.

Recommendation:
Include color name and selection state.

## Group verdict

Strong foundation; make accessibility requirements executable in component acceptance tests.

---

# FG8 — Print and operations

## Consensus

The frontend is unusually production-aware, which is a competitive strength.

## Critical findings

### 1. “Looks ready” may overpromise
A digital preflight cannot guarantee physical print quality.

Recommendation:
Use two conceptual layers:
- Design ready
- Production checked

Customer-facing “Looks ready” means digital design checks passed, not guaranteed physical outcome.

### 2. Placement presets must be SKU-specific
“Small chest” cannot be a universal coordinate.

Preset must reference:
- PrintProfileVersion;
- side;
- SKU/size compatibility.

### 3. Product color change can affect perceived artwork
A design valid geometrically may become visually poor.

Recommendation:
After color change:
- rerender immediately;
- rerun contrast advisory;
- proof becomes stale.

### 4. Print dimensions must be visible in Final Preview
Already present; group strongly supports retaining it.

### 5. Front/back no-mirroring rule is essential
Keep explicit.

### 6. Mockup realism must not imply exact drape
Recommendation:
Add subtle copy:
“Preview is approximate; placement and size are production-calibrated.”

## Group verdict

Do not let consumer-friendly language weaken production truth.

---

# FG9 — Architecture / platform

## Consensus

The architecture is stronger than typical frontend-first prototypes because it protects future backend integration.

## Critical findings

### 1. Runtime architecture is now the main missing specification
Before F1/F3, decide:
- React/Vite or framework;
- router;
- query/cache layer;
- editor state store;
- schema validation;
- mock transport;
- test stack.

### 2. Mock API needs deterministic scenario control
Random 500 errors are useful but insufficient.

Recommendation:
Scenario IDs:
- happy-path;
- save-conflict;
- stale-proof;
- upload-fail;
- payment-timeout;
- inventory-change.

This makes E2E reproducible.

### 3. Share preview introduces security/privacy surface
Need:
- opaque token;
- expiry/revocation later;
- no original asset URLs;
- view-only semantics.

### 4. Analytics event schema should be defined before implementation
Avoid uncontrolled event names and artwork leakage.

### 5. Client persistence boundaries need specification
What is allowed in:
- memory;
- localStorage;
- IndexedDB?

Recommendation:
Artwork binary is not stored indefinitely in localStorage.
Use a dedicated draft persistence strategy.

## Group verdict

The next spec should be Frontend Runtime Architecture, then implementation.

---

# Cross-group consensus

## Very high consensus — keep

All or nearly all groups support:

1. Create-first product journey.
2. Mobile as first-class editor.
3. Separate Final Preview approval step.
4. mm as canonical geometry.
5. No silent resize/substitution.
6. Remix creates a new draft.
7. Private-by-default sharing.
8. Progressive disclosure.
9. Production terminology hidden from consumer UI.
10. Mock-first backend-shaped API.
11. Immutable approved revision.
12. Explicit frontend state/version conflicts.
13. Kazakh/Russian/English localization from day one.
14. No manipulative purchase gamification.
15. Accessibility as a component-level requirement.

## High consensus — change before React implementation

1. Simplify the default mobile dock.
2. Define Create-first default garment behavior.
3. Separate Style vs Vibe concepts.
4. Add live/early price estimate.
5. Strengthen size-confidence UX.
6. Specify hit-testing.
7. Specify element lock.
8. Specify snap behavior.
9. Specify transform pipeline.
10. Define layer-count/performance budget.
11. Create dedicated mobile text-edit state.
12. Clarify “Looks ready” means digital readiness.
13. Make placement presets SKU/Profile-specific.
14. Define deterministic mock scenarios.
15. Define client persistence strategy.
16. Define analytics schema.
17. Add share-link security contract.

## Medium consensus — validate in prototype

- Whether Layers belongs in default mobile dock.
- Whether Vibe packs should launch in MVP or immediately after.
- Whether dark editor workspace is preferable to adaptive light/dark.
- Whether create-first should choose a default garment automatically or prompt after first asset insertion.
- Whether exact print size should be permanently visible or only contextual.

---

# Contradictions between groups

## Creative speed vs physical product selection

Youth/product groups want creation before configuration.

Production/ecommerce groups want SKU certainty before geometry.

### Proposed resolution

Use a **default temporary creation context**:
- default T-shirt / default size;
- clearly labeled;
- design remains draft;
- before Final Preview the real variant must be selected;
- incompatible choice creates explicit fit/review step.

This preserves fast start without pretending geometry is product-independent.

## Minimal dock vs discoverability

Mobile group wants 3 actions maximum.
Product group wants Check visible.

### Proposed resolution

Dock:
- Add
- Style
- Preview

Status chip:
- Looks ready / Check / Fix

Tap status opens Design Check.

Layers appears:
- after second element;
- via contextual menu;
- or optional fourth slot when relevant.

## Consumer simplicity vs production truth

Gen Alpha/product groups prefer “Looks ready”.
Production group fears overclaim.

### Proposed resolution

Keep “Looks ready”, but supporting text in Final Preview:

“Your digital design checks passed. The garment preview is approximate.”

---

# Revised product hypothesis

PrintMaster should behave like:

**creation tool first**
+
**ecommerce second**
+
**production system underneath**

The user should experience:

```
idea
→ visual result
→ refine
→ design check
→ final preview
→ approve
→ purchase
```

The system internally maintains:

```
DesignRevision
→ PrintProfileVersion
→ Preflight
→ Proof
→ Approval
→ ProductionArtifact
```

---

# Action backlog after focus-group synthesis

## FG-P0 — before React editor implementation

- [ ] Define runtime architecture.
- [ ] Define default garment context for Create-first.
- [ ] Document Style vs Vibe semantics.
- [ ] Specify hit-testing precedence.
- [ ] Decide/implement element lock.
- [ ] Specify snapping tolerance and semantics.
- [ ] Fix canonical transform pipeline order.
- [ ] Define element-count/mobile performance budget.
- [ ] Define dedicated mobile text-edit state.
- [ ] Define deterministic mock scenario engine.
- [ ] Define client draft persistence strategy.
- [ ] Define DesignCheck wording: digital readiness vs physical guarantee.

## FG-P1 — before public alpha

- [ ] Early price estimate in editor/product flow.
- [ ] Size confidence UX.
- [ ] Placement presets tied to PrintProfileVersion/SKU.
- [ ] Color-change contrast recheck.
- [ ] Layer reorder non-drag alternative.
- [ ] Pseudo-locale CI checks.
- [ ] Share-link view-only/privacy contract.
- [ ] Analytics event schema.
- [ ] Guest creation/checkout decision.
- [ ] Final Preview approximate-mockup disclosure.

## FG-P2 — usability-test hypotheses

- [ ] 3 vs 4 mobile dock actions.
- [ ] Vibe packs in MVP vs MVP+.
- [ ] Dark vs adaptive editor workspace.
- [ ] Permanent vs contextual physical-size display.
- [ ] Default garment chosen before vs after first content.

---

# Alpha usability test scenarios derived from focus groups

1. Create a hoodie design from a phone in under 60 seconds.
2. Start with an image before choosing a garment.
3. Add a second element and discover layers.
4. Fix a low-quality image warning.
5. Switch L → S and preserve original draft.
6. Switch black → white and notice visual/contrast change.
7. Edit text with the mobile keyboard open.
8. Use editor without dragging for a key task.
9. Change app language RU → KK while design is open.
10. Enter Kazakh text using a font without required glyphs.
11. Go offline during editing and recover.
12. Trigger a simulated 409 conflict.
13. Generate Final Preview and edit afterward.
14. Edit an already-approved cart design.
15. Create a private share preview.
16. Complete checkout as a guest.
17. Understand whether “Looks ready” guarantees exact physical appearance.

## Proposed success thresholds for alpha study

These are product targets, not existing measurements:
- ≥90% identify FRONT/BACK correctly.
- ≥85% complete first design without help.
- ≥80% understand Final Preview as approval step.
- ≥80% successfully resolve a Design Check blocker.
- ≥90% preserve work after simulated network failure.
- ≥80% understand that changing size may require design adjustment.
- ≥90% understand that language switch does not translate garment text.
