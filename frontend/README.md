# PrintMaster Frontend — Interactive Mock Alpha

The frontend is now a working mock-first apparel design editor.

## Stack

- React 19.3
- TypeScript
- Vite
- React Router
- i18next / react-i18next
- Konva 10.5 / react-konva 19.3
- responsive CSS design system

## Run

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

## What is interactive now

### Customer flow

- Home / Create-first
- Catalog
- Product detail
- Editor
- Design Check
- Final Preview
- Approve
- Cart
- Mock Checkout
- Mock Order

### Design editor

- real Konva canvas;
- canonical geometry persisted in millimeters;
- responsive mm → viewport projection;
- FRONT / BACK;
- image upload (PNG/JPEG/WebP);
- add text;
- edit text;
- add sticker;
- drag elements;
- resize elements;
- rotate elements;
- exact width/height/rotation inputs;
- center action;
- duplicate;
- delete;
- layers;
- move layer up/down;
- persistent local draft;
- RU / KZ / EN UI.

### Design checks

Mock preflight currently checks:

- rotated element bounds against the configured printable area;
- effective image DPI;
- BLOCKED / WARNING / READY state;
- approval disabled when a blocker exists.

### Approval snapshot

Final Preview uses the same canonical draft model.

Approve creates a separate local immutable-style snapshot stored under:

```
pm-approved
```

Cart reads the approved snapshot rather than the mutable working draft.

## Current mock print profiles

The project contains mock physical garment and printable-area dimensions for:

- Basic Tee;
- Basic Hoodie;
- FRONT;
- BACK.

These values are placeholders for future measured production profiles.

## Local persistence

The alpha uses browser `localStorage` for draft/snapshot persistence.

Uploaded image previews are stored as data URLs, so this is intentionally temporary.

The backend/object-storage phase must replace this with:

- asset upload/storage;
- asset IDs;
- DesignRevision persistence;
- server-side proof rendering.

## Known alpha limitations

Not implemented yet:

- crop UI;
- undo/redo command history;
- snapping guides;
- element locking;
- font catalog;
- arbitrary stickers library;
- normalized image-upload pipeline;
- IndexedDB/object storage for large uploads;
- server-rendered proof;
- real pricing by print size/sides;
- real payment/backend.

## Architecture rule

Konva pixels are never the persisted source of truth.

Persisted element fields remain:

```
xMm
yMm
widthMm
heightMm
rotationDeg
```

The viewport only projects those values to pixels.
