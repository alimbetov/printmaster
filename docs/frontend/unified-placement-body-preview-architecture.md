# PrintMaster — Unified Placement Frame & Body Preview Architecture

## 1. Purpose

Define the next editor architecture so that:

- FLAT editor, Body 3D preview, Final Preview and production proof share one placement model;
- garment cut, size, fit and material influence visual body relief correctly;
- T-shirts follow body relief more than hoodies;
- oversize and heavier garments smooth body relief;
- men, women, teens and kids are supported without hard-coding body geometry to gender labels;
- user-controlled body preview never mutates production millimeter geometry;
- placement on body is understandable and controllable without letting the customer redefine the factory printable area.

This specification supersedes the temporary split between:
- fixed FLAT print-zone placement;
- independent BODY 3D relief frame.

The new design introduces one canonical **Placement Frame** that is projected consistently into every visual mode.

---

## 2. Core architectural rule

There are three distinct geometric concepts and they MUST remain separate.

### 2.1 Production Print Zone

Owned by the product/variant/print profile.

It defines where production may physically print.

Properties:
- fixed for a given `ProductVariant + Size + Side + PrintProfileVersion`;
- persisted in garment-space millimeters;
- not customer-resizable;
- may be polygonal, not only rectangular;
- may contain forbidden zones;
- participates in preflight;
- changes only when SKU/size/profile changes.

Customer meaning:

> “The printer can physically print inside this area.”

### 2.2 Placement Frame

Owned by the design revision.

It defines how the customer's composition is positioned within the production-printable area and how that composition maps to the body-preview surface.

Properties:
- movable;
- resizable within allowed production constraints;
- side-specific;
- canonical and shared by FLAT / Body Preview / Final Preview;
- persisted as design state;
- can be reset to product-profile defaults;
- must never escape the production Print Zone;
- does not alter the underlying Print Profile.

Customer meaning:

> “Place my whole design here.”

### 2.3 Body Surface Mapping

Owned by preview/calibration state.

It defines how the Placement Frame is visually projected onto a body/garment surface.

Properties:
- affects preview only;
- depends on body shape, garment cut, material, fit and camera angle;
- must not rewrite element millimeter geometry;
- may generate warnings about likely visual distortion;
- does not change production artwork.

Customer meaning:

> “Show me how this flat design may look when worn.”

---

## 3. Why the current model must change

Current prototype behavior creates two independent coordinate systems:

```
FLAT print placement
!=
BODY relief placement
```

This causes:
- frame movement in Body 3D not appearing in FLAT;
- Final Preview diverging from what the customer adjusted;
- unclear source of truth;
- future proof renderer ambiguity;
- inability to version/approve body-placement intent.

Required invariant:

```
ONE PlacementFrame
        |
        +--> FLAT projection
        +--> Body 3D projection
        +--> Final Preview projection
        +--> preflight
```

No mode may own a private placement frame.

---

## 4. Domain model

### 4.1 Product family

A product family describes the commercial garment model.

```ts
type GarmentCategory =
  | 'TSHIRT'
  | 'HOODIE'
  | 'SWEATSHIRT'
  | 'LONGSLEEVE'
  | 'POLO'
  | 'TANK'
  | 'JERSEY'
  | 'DRESS'
  | 'OTHER';

type AudienceLine =
  | 'ADULT_MEN'
  | 'ADULT_WOMEN'
  | 'UNISEX'
  | 'YOUTH'
  | 'KIDS'
  | 'TODDLER';

type GarmentFit =
  | 'SLIM'
  | 'REGULAR'
  | 'RELAXED'
  | 'OVERSIZE';

type Product = {
  id: string;
  name: string;
  category: GarmentCategory;
  audienceLine: AudienceLine;
  fit: GarmentFit;
  materialProfileId: string;
  variants: ProductVariant[];
};
```

Important:

`AudienceLine` is merchandising/catalog metadata.

It MUST NOT be used as the only input for body geometry.

---

## 5. Product variant and cut

Different cuts require different visual geometry.

Examples:
- men's regular T-shirt;
- women's fitted T-shirt;
- unisex oversize T-shirt;
- cropped T-shirt;
- dropped-shoulder T-shirt;
- classic hoodie;
- oversize hoodie;
- zip hoodie;
- youth hoodie;
- children's T-shirt.

### 5.1 Garment cut profile

```ts
type GarmentCutProfile = {
  id: string;
  version: number;

  category: GarmentCategory;
  fit: GarmentFit;

  silhouette: {
    shoulderDrop: number;
    torsoTaper: number;
    hemWidthFactor: number;
    sleeveVolume: number;
    garmentLengthFactor: number;
    chestEaseMm: number;
    waistEaseMm: number;
    abdomenEaseMm: number;
  };

  surface: {
    drape: number;        // 0..1
    stiffness: number;    // 0..1
    thickness: number;    // 0..1
    stretch: number;      // 0..1
  };
};
```

These values are product/manufacturer calibration data, not arbitrary UI sliders for production.

---

## 6. Material profile

Body relief response must be driven by fabric characteristics.

```ts
type MaterialProfile = {
  id: string;
  name: string;
  gsm: number;

  thicknessMm?: number;

  elasticity: {
    horizontal: number;
    vertical: number;
  };

  drape: number;
  stiffness: number;
  compression: number;

  bodyReliefTransfer: number; // normalized 0..1
};
```

Example expectation:

```
190 GSM regular cotton tee
bodyReliefTransfer ~ 0.85..1.0

260 GSM oversize heavy tee
bodyReliefTransfer ~ 0.55..0.75

330 GSM relaxed hoodie
bodyReliefTransfer ~ 0.30..0.50

430 GSM oversize hoodie
bodyReliefTransfer ~ 0.18..0.35
```

Exact values must later come from calibration/testing, not remain guessed constants.

---

## 7. Size and variant profile

PrintMaster must not assume that all S/M/L/XL have proportional bodies or print zones.

```ts
type ProductVariant = {
  id: string;
  sku: string;
  productId: string;

  sizeCode: string;
  colorCode: string;

  garmentCutProfileVersionId: string;
  materialProfileVersionId: string;
  printProfileVersionId: string;

  garmentMeasurements: {
    chestWidthMm: number;
    bodyLengthMm: number;
    shoulderWidthMm?: number;
    sleeveLengthMm?: number;
    hemWidthMm?: number;
  };
};
```

A real catalog should store measured variant geometry.

Do NOT permanently implement size geometry as:

```
S = L * 0.92
M = L * 0.96
XL = L * 1.05
```

That scaling is acceptable only as temporary mock data.

---

## 8. Print Profile

Production PrintProfile remains authoritative.

```ts
type PrintProfile = {
  id: string;
  version: number;
  variantId: string;

  coordinateSystem: {
    units: 'MM';
    origin: 'TOP_LEFT';
    xAxis: 'RIGHT';
    yAxis: 'DOWN';
  };

  garmentBounds: PolygonMm;

  sides: Record<'FRONT' | 'BACK', {
    printable: PolygonMm;
    safe?: PolygonMm;
    forbidden: ForbiddenZone[];
    defaultPlacementFrame: PlacementFrameNormalized;
    bodyAnchorHints?: BodyAnchorHints;
  }>;
};
```

---

## 9. Unified Placement Frame

### 9.1 Canonical representation

Recommended canonical storage: normalized relative to the Print Zone's calibrated bounding box.

```ts
type PlacementFrameNormalized = {
  x: number;      // 0..1
  y: number;      // 0..1
  width: number;  // 0..1
  height: number; // 0..1
};
```

Meaning:
- x/y = top-left inside the Print Zone bounding box;
- width/height relative to Print Zone;
- frame is side-specific.

### 9.2 Design revision

```ts
type DesignSideState = {
  placementFrame: PlacementFrameNormalized;
  elements: DesignElement[];
};

type DesignRevision = {
  ...
  sides: {
    FRONT: DesignSideState;
    BACK: DesignSideState;
  };
};
```

### 9.3 Invariants

1. Placement Frame must fit within production printable/safe constraints.
2. Placement Frame is persisted.
3. FLAT and Body Preview read the exact same frame.
4. Final Preview reads the exact same frame.
5. Moving frame is a design mutation.
6. Moving frame invalidates old preflight/proof.
7. Frame movement must be undoable.
8. FRONT/BACK frames are independent.
9. Product/size change never silently rewrites frame.
10. User may reset to profile default.

---

## 10. Element coordinate strategy

Long-term recommended approach:

Store production elements in garment-space millimeters and expose frame-relative coordinates as a projection.

Do NOT make percentage coordinates inside the frame the only production source of truth.

### 10.1 Persisted production geometry

```ts
type DesignElement = {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotationDeg: number;
};
```

### 10.2 Derived frame coordinates

```
frameRelative = garmentMmToFrameNormalized(element)
```

This gives:
- stable production geometry;
- accurate physical dimensions;
- frame movement semantics that can be implemented explicitly.

### 10.3 Frame movement policy

Two user modes may eventually exist:

#### MOVE_FRAME_WITH_DESIGN — default
Moving frame moves all contained design elements by the same garment-space delta.

This matches the customer's mental model:
“Move my whole design lower.”

#### MOVE_FRAME_ONLY — advanced calibration
Move the body-mapping frame without changing production elements.

This changes only how Body Preview maps the existing print relative to anatomy.

This mode must be clearly labelled and is not MVP default.

For current implementation, use:

> MOVE_FRAME_WITH_DESIGN

to avoid ambiguity.

---

## 11. FLAT editor requirements

FLAT becomes the authoritative editing mode.

### Must show

- garment;
- production Print Zone;
- unified Placement Frame;
- elements;
- element transform handles;
- optional safe/forbidden zones.

### Placement Frame controls

User can:
- drag frame;
- resize frame;
- center;
- reset;
- choose placement preset.

The frame must not:
- escape the printable polygon;
- overlap forbidden zones when policy blocks it;
- silently change product PrintProfile.

### Visual hierarchy

```
Garment
  Production Zone        subtle
    Placement Frame      prominent when selected
      Elements
```

Use different visual language:

- Production Zone: neutral/dashed technical guide.
- Placement Frame: purple interactive frame.
- Element selection: independent element transform handles.

This avoids the current ambiguity where the purple rectangle looks like production area and editable area simultaneously.

---

## 12. Body Preview architecture

Body Preview is a visual simulation.

It consumes:

```
DesignRevision
+ ProductVariant
+ GarmentCutProfile
+ MaterialProfile
+ BodyProfile
+ BodyPlacementMapping
+ Camera
```

It never modifies production geometry implicitly.

---

## 13. Body profile model

Do not model body type only as:

```
MEN
WOMEN
KIDS
```

That is insufficient and creates false assumptions.

Use independent anthropometric controls.

```ts
type BodyProfile = {
  id?: string;

  cohort?: BodyCohort;

  stature: number;
  shoulderBreadth: number;
  chestProjection: number;
  chestCircumference: number;
  waistCircumference: number;
  abdomenProjection: number;
  hipCircumference: number;
  torsoLength: number;

  posture: {
    shoulderSlope: number;
    upperBackCurve: number;
    pelvicTilt: number;
  };
};
```

---

## 14. Body cohorts

Cohorts are presets / starting points, not restrictions.

```ts
type BodyCohort =
  | 'ADULT_MALE_REFERENCE'
  | 'ADULT_FEMALE_REFERENCE'
  | 'ADULT_NEUTRAL_REFERENCE'
  | 'TEEN_REFERENCE'
  | 'CHILD_REFERENCE'
  | 'TODDLER_REFERENCE'
  | 'CUSTOM';
```

The UI may present friendly labels:

- Adult — masculine reference
- Adult — feminine reference
- Adult — neutral
- Teen
- Child
- Toddler
- Custom

But after selection every anthropometric parameter remains editable.

No body cohort should imply user identity.

---

## 15. Child and teen support

Children are not scaled-down adults.

Separate calibration is required for:

- shoulder/chest ratio;
- torso length;
- head/neck proportions if full mannequin is later shown;
- abdomen profile;
- garment ease;
- print-zone position;
- safe distance from collar/hem.

Therefore:

```
adult model * 0.7
```

is prohibited as production-grade implementation.

Mock phase may use simplified presets, but the domain contract must already support independent youth/child calibration.

---

## 16. Garment fit vs body profile

The rendered garment surface is a function:

```
GarmentSurface =
  f(
    BodyProfile,
    GarmentCutProfile,
    ProductVariantMeasurements,
    MaterialProfile
  )
```

Body is NOT the final print surface.

The garment sits between body and print.

This distinction is essential.

Examples:

### Slim T-shirt
- high contact;
- high body-relief transfer;
- stronger chest/abdomen curvature;
- print distortion more visible.

### Regular T-shirt
- medium-high relief transfer.

### Oversize T-shirt
- more bridging/drape;
- lower relief transfer.

### Relaxed hoodie
- low body-relief transfer;
- large smoothing radius.

### Heavy oversize hoodie
- very low body-relief transfer;
- body affects silhouette more than local print curvature.

---

## 17. Relief field

Body Preview should conceptually produce a 2.5D deformation field.

```ts
type SurfaceSample = {
  u: number;
  v: number;

  depth: number;
  normalX: number;
  normalY: number;
  normalZ: number;

  stretchX: number;
  stretchY: number;
};
```

The print preview transformation samples this surface.

For the current 2D/CSS/Konva mock implementation, approximate this field using regional influence functions.

Future WebGL implementation may use an actual garment mesh/UV map.

---

## 18. Anatomical relief regions

Use neutral structural regions:

- upper chest;
- left/right chest;
- sternum center;
- upper abdomen;
- waist;
- lower abdomen;
- upper back;
- shoulder blade regions.

Avoid UI language that judges body shape.

A body map can expose:

```ts
type ReliefRegion = {
  id: string;
  centerU: number;
  centerV: number;
  radiusU: number;
  radiusV: number;
  projection: number;
};
```

---

## 19. Body Relief / Placement mapping

The current movable Body Relief Frame becomes the projection of the canonical Placement Frame.

It must NOT be independent state.

Correct flow:

```
DesignRevision.placementFrame
        |
        +--> FlatPlacementProjection
        |
        +--> BodySurfaceProjection
```

If user drags the frame in Body mode:

```
Body pointer
→ inverse projection
→ canonical placement-frame mutation
→ update DesignRevision
→ FLAT immediately reflects movement
→ preflight reruns
```

This is the key synchronization contract.

---

## 20. Body anchor hints

Print profiles may define semantic body anchors.

```ts
type BodyAnchorHints = {
  collarCenter?: PointNormalized;
  chestCenter?: PointNormalized;
  leftChest?: PointNormalized;
  abdomenCenter?: PointNormalized;
  backCenter?: PointNormalized;
  shoulderLineY?: number;
};
```

Presets can use these anchors:

- Center chest
- Left chest
- High chest
- Lower front
- Big back
- Name + number

Anchors are product-profile data.

---

## 21. Distortion risk model

Body Preview should estimate whether a design crosses high-curvature regions.

Example:

```ts
type BodyDistortionAssessment = {
  severity: 'LOW' | 'MEDIUM' | 'HIGH';

  horizontalWarpPct: number;
  verticalWarpPct: number;

  regions: Array<
    'CHEST'
    | 'WAIST'
    | 'ABDOMEN'
    | 'SHOULDER'
    | 'BACK_CURVE'
  >;
};
```

Customer-facing language:

LOW:
> “This placement should stay visually stable.”

MEDIUM:
> “Part of the design wraps over body curvature.”

HIGH:
> “This wide design may look noticeably curved when worn.”

Do not block production solely because Body Preview predicts visual distortion.

This is normally advisory unless a separate production rule exists.

---

## 22. User correction workflow

Target UX:

1. User edits design in FLAT.
2. User opens Body Preview.
3. Body preset defaults from product/audience context only as a starting point.
4. User selects/adjusts body profile.
5. User sees relief heat/guide.
6. User drags Placement Frame.
7. The same frame moves in FLAT.
8. Preflight updates.
9. User can compare:
   - Flat artwork
   - Worn preview
10. Final Preview contains both where appropriate.

No hidden automatic correction.

---

## 23. Body Preview controls

### Primary

- Flat / Body
- cohort preset
- rotate body
- Placement Frame drag
- Reset

### Secondary

- shoulders
- chest
- waist
- abdomen
- torso length
- garment fit visualization

### Advanced / later

- posture
- height
- hips
- fabric drape
- camera focal length
- lighting
- exact anthropometric input

---

## 24. Product/audience handling

Catalog may contain:

### Adult men's line
Typical default starting body preset may be adult masculine reference.

### Adult women's line
Typical default starting body preset may be adult feminine reference.

### Unisex
Default neutral adult reference.

### Teen
Default teen reference.

### Kids
Default child reference.

But user can change Body Preview preset independently.

Example:

A customer may buy an “Adult Men's Oversize Tee” and preview it on:
- female body profile;
- teen body profile where size is appropriate;
- custom body profile.

The rendering engine must permit this.

---

## 25. Safety and dignity requirements

The body configurator must:

- use neutral terminology;
- avoid “ideal”, “bad”, “fat”, “skinny” classifications;
- avoid health conclusions;
- not infer age/gender/body type from uploaded photos in MVP;
- not publicly expose saved body parameters by default;
- keep body presets separate from customer identity/account profile unless explicitly saved later.

For minors:
- no sexualized mannequin rendering;
- neutral clothed torso/mannequin visualization;
- privacy-first defaults.

---

## 26. Final Preview synchronization

Final Preview must be generated from:

```
same DesignRevision
same PlacementFrame
same ProductVariant
same PrintProfileVersion
```

Final Preview may offer:

### Flat
Accurate production-like placement.

### Worn Preview
Approximate body simulation.

The approval message must distinguish them:

> Flat placement and physical print dimensions are production-linked. Worn preview is an approximate visualization of garment fit and body curvature.

Approval is bound to the production geometry, not to one arbitrary body preset.

Body profile itself should normally NOT become part of the production proof hash.

---

## 27. Body Preview persistence

Two categories:

### Design-persisted

- Placement Frame
- product variant
- side
- elements

### Preview/session-persisted

- selected body cohort
- custom body controls
- camera yaw
- lighting

By default, body shape parameters should be local/session preference only.

Later, user may explicitly save a fitting profile.

---

## 28. API contracts

### Product catalog

```
GET /products
GET /products/{productId}
GET /variants/{variantId}
GET /variants/{variantId}/print-profile
GET /variants/{variantId}/garment-cut-profile
GET /variants/{variantId}/material-profile
```

### Design

```
GET /designs/{id}
PUT /designs/{id}/draft
POST /designs/{id}/preflight
```

Draft request includes placement frame.

```ts
type SideDraftPayload = {
  placementFrame: PlacementFrameNormalized;
  elements: DesignElement[];
};
```

### Body preview

MVP body preview can remain client-side.

Future:

```
POST /preview/body
```

request:

```ts
type BodyPreviewRequest = {
  designRevisionId: string;
  side: Side;
  bodyProfile: BodyProfile;
  camera: BodyPreviewCamera;
};
```

This endpoint must never mutate DesignRevision.

---

## 29. Frontend state ownership

### Server/query state

- products;
- variants;
- measured dimensions;
- PrintProfiles;
- GarmentCutProfiles;
- MaterialProfiles;
- saved DesignRevision.

### Canonical editor state

- Placement Frame per side;
- elements in mm;
- active side;
- selected variant.

### Ephemeral UI

- selected element;
- zoom;
- pan;
- Body Preview body controls;
- camera rotation;
- open panels;
- hover/selection.

No Konva node values are persisted directly.

---

## 30. React module decomposition

Required decomposition before further complexity:

```
src/domain/geometry/
src/domain/design/
src/domain/catalog/
src/domain/body-preview/

src/features/editor/
  FlatEditor.tsx
  PlacementFrame.tsx
  ElementLayer.tsx

src/features/body-preview/
  BodyPreview.tsx
  BodyControls.tsx
  BodyReliefOverlay.tsx
  GarmentSurfaceProjection.ts

src/features/final-preview/

src/api/
src/mocks/
```

The current monolithic `App.tsx` must not absorb the body-preview architecture.

---

## 31. Placement frame interaction state machine

States:

```
IDLE
FRAME_SELECTED
FRAME_DRAGGING
FRAME_RESIZING
ELEMENT_SELECTED
ELEMENT_DRAGGING
ELEMENT_RESIZING
ELEMENT_ROTATING
BODY_PREVIEW
BODY_FRAME_DRAGGING
```

Rules:

- one pointer gesture = one undo command;
- frame drag moves contained design by same canonical delta;
- frame resize does not silently scale elements in MVP;
- if resize would exclude elements, show warning before commit;
- pointer cancel restores pre-gesture state;
- keyboard accessible move/resize alternatives required.

---

## 32. Frame resize policy

MVP:

### Move
Allowed; moves all design elements with frame.

### Resize
Allowed only if all elements remain inside.

If not:

- do not auto-scale;
- show:
  “Some design elements would fall outside this placement area.”

Actions:
- Cancel
- Resize frame only and review issues
- Fit design to frame — future explicit command

No silent resizing.

---

## 33. Product change behavior

When product/size changes:

1. load new PrintProfile;
2. load new default Placement Frame;
3. calculate current design compatibility;
4. show comparison.

Options:

- Keep current geometry and review;
- Apply recommended placement frame;
- Create fitted copy.

Never silently migrate an approved design.

---

## 34. FLAT ↔ BODY synchronization acceptance criteria

Given one DesignRevision:

### AC-1
Move Placement Frame +20 mm downward in FLAT.

Expected:
- elements move +20 mm;
- Body Preview frame moves to matching body position;
- Final Preview reflects it.

### AC-2
Move Placement Frame in Body Preview.

Expected:
- inverse body projection updates canonical frame;
- returning to FLAT shows same placement;
- no independent body-frame state remains.

### AC-3
Resize frame.

Expected:
- all modes show identical normalized frame geometry.

### AC-4
Switch FRONT → BACK.

Expected:
- independent side frame.

### AC-5
Reload.

Expected:
- canonical frame restores.

---

## 35. Garment relief acceptance criteria

### AC-6
Regular lightweight T-shirt:
- visible chest/abdomen deformation.

### AC-7
Heavy oversize hoodie:
- significantly smoother local relief.

### AC-8
Changing body chest projection:
- modifies worn preview;
- does NOT mutate element xMm/yMm/size.

### AC-9
Changing garment GSM/material profile:
- modifies preview relief response;
- does NOT mutate production geometry.

### AC-10
Changing Body Cohort:
- initializes different anthropometric preset;
- user controls remain editable.

---

## 36. Cohort acceptance criteria

### Adult masculine reference
Independent shoulder/chest/waist defaults.

### Adult feminine reference
Independent torso/chest/waist/hip defaults.

### Neutral adult
Balanced defaults.

### Teen
Independent youth proportions.

### Child
Independent child proportions.

### Toddler
Separate small-child calibration.

None are implemented as simple global scaling of another cohort.

---

## 37. Testing

### Unit

- print-zone → placement-frame transforms;
- frame → garment mm;
- garment mm → frame normalized;
- round trip;
- inverse body projection;
- relief-strength calculation;
- size profile lookup;
- product cut profile lookup.

### Integration

- move frame in FLAT → Body updates;
- move frame in Body → FLAT updates;
- variant change;
- side change;
- reload;
- preflight invalidation;
- proof staleness.

### Visual regression

Test matrix:

```
Garments:
- regular tee
- fitted tee
- oversize tee
- relaxed hoodie
- heavy oversize hoodie

Cohorts:
- adult masculine
- adult feminine
- neutral
- teen
- child

Sides:
- FRONT
- BACK

Body:
- low / medium / high chest relief
- low / high abdomen relief

Camera:
- 0°
- ±20°
```

Do not snapshot every Cartesian combination initially; maintain representative pairwise coverage.

---

## 38. Performance targets

Body Preview should remain responsive.

MVP target:
- control interaction visually updates within one frame where possible;
- no network call for every slider movement;
- body calculations memoized;
- image assets reused;
- body preview isolated from editor selection rerenders.

If WebGL is adopted later:
- lazy-load it only when Body Preview is opened.

---

## 39. Technical roadmap

### UPF-1 — Canonical Placement Frame

- add placementFrame to Draft/DesignRevision;
- FRONT/BACK state;
- migration from current draft;
- transform utilities;
- tests.

### UPF-2 — FLAT interactive frame

- display production Print Zone separately;
- draggable placement frame;
- resizable placement frame;
- move design with frame;
- bounds validation;
- undo semantics.

### UPF-3 — Unified Body mapping

- delete independent BodyPreview local frame;
- Body mode consumes canonical Placement Frame;
- drag through inverse projection;
- FLAT/BODY synchronization.

### UPF-4 — Garment model

- product category;
- audience line;
- cut profile;
- material profile;
- measured variant dimensions;
- remove proportional size mock assumption.

### UPF-5 — Body profiles

- adult masculine/feminine/neutral;
- teen;
- child;
- toddler;
- custom anthropometric controls.

### UPF-6 — Relief engine

- garment-aware relief strength;
- chest/waist/abdomen/back regions;
- distortion assessment;
- advisory warnings.

### UPF-7 — Final Preview

- Flat preview;
- Worn preview;
- same revision/frame;
- approval copy distinguishes approximate body preview.

### UPF-8 — Hardening

- undo/redo;
- persistence migration;
- test matrix;
- responsive/touch;
- accessibility;
- performance.

---

## 40. Definition of Done

This feature is complete only when:

1. There is one Placement Frame source of truth.
2. FLAT and Body modes cannot drift.
3. Final Preview uses the same frame.
4. Production Print Zone remains immutable by customer.
5. User can move Placement Frame from FLAT.
6. User can move the same frame from Body Preview.
7. Frame movement updates production mm elements deterministically.
8. Body shape changes never modify production geometry.
9. Product cut/material/GSM influence worn deformation.
10. Men's/women's/unisex/youth/kids/toddler product lines are representable.
11. Body geometry is not hard-coded from gender label alone.
12. Teen/child profiles are not scaled adult profiles.
13. FRONT/BACK remain independent.
14. Size change triggers explicit revalidation.
15. Old proof becomes stale after frame/design/variant mutation.
16. Body-preview distortion is labelled approximate.
17. Automated geometry and synchronization tests exist.
18. Touch/mobile frame manipulation works.
19. Keyboard/non-drag alternatives exist.
20. No body-profile data becomes public or part of production proof unless explicitly required.

---

## 41. Immediate implementation decision

Before adding more visual realism, implement in this order:

```
Canonical Placement Frame
        ↓
FLAT movable frame
        ↓
BODY uses same frame
        ↓
Final Preview uses same frame
        ↓
Garment Cut + Material Profiles
        ↓
Body cohorts
        ↓
Higher-fidelity deformation
```

Do NOT invest further in independent Body 3D controls until the unified frame is the single source of truth.

That synchronization is the architectural blocker.
