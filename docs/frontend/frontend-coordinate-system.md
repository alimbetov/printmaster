# PrintMaster — Frontend Coordinate System

## Purpose

Define one canonical geometry model before any canvas library is selected.

## Spaces

### 1. Asset space
Coordinates inside the normalized source asset.
- crop uses normalized [0..1] coordinates;
- source pixels never define garment size.

### 2. Garment space
Canonical persisted design space.
- units: millimeters;
- origin: top-left of calibrated garment bounds;
- +X: right;
- +Y: down;
- rotation: clockwise;
- every side has an explicit side coordinate system.

### 3. Viewport space
Transient screen/CSS-pixel projection.
- affected by responsive layout, zoom, pan and DPR;
- never persisted as production geometry.

### 4. Output space
Proof/production raster or vector output.
- derived from garment-space and output DPI/profile;
- output rounding occurs only here.

## Persisted element anchor

All persisted design elements use center anchoring:

```
center = (xMm, yMm)
size   = (widthMm, heightMm)
angle  = rotationDeg clockwise
```

Width/height describe unrotated physical size.

## View transform

Conceptually:

```
viewportPoint = pan + zoom * garmentPoint
```

DPR affects raster sharpness, not geometry.

Browser/CSS zoom must not change garment-space values.

## Rotation and bounds

Preflight checks transformed polygons.

A rotated element is not validated using the unrotated rectangle.

## Crop

Crop is stored relative to normalized asset coordinates:

```
0 <= x,y,width,height <= 1
```

Crop must survive viewport resize, browser restart and device change.

## Precision

- Persist geometry with more precision than customer display.
- Customer display may round to 0.1 cm.
- Do not repeatedly round during transforms.
- Equality in tests uses defined epsilon, not string-formatted values.

## Side semantics

FRONT and BACK are separate garment spaces.

Do not obtain BACK by mirroring FRONT automatically.

Wearer-left/right terminology must be explicit where relevant.

## Mockup projection

Mockup imagery is visual only.

A mockup projection maps garment-space to image/viewport display. Replacing a mockup image must not alter physical design geometry or require a new PrintProfileVersion unless calibrated geometry changes.

## Required tests

- garment→viewport→garment round trip;
- resize viewport without geometry change;
- DPR 1/2/3 same physical geometry;
- rotate 0/90/180/270;
- rotated polygon boundary intersections;
- crop survives reopen;
- FRONT/BACK independence;
- browser zoom does not mutate geometry;
- orientation change preserves design.
