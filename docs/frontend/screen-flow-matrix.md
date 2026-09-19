# PrintMaster — Screen and Flow Matrix

## Core screens

| ID | Screen | Purpose | Primary action |
|---|---|---|---|
| F01 | Home/Create entry | Show what can be made | Create yours |
| F02 | Catalog | Browse garments | Customize |
| F03 | Product detail | Confirm garment/variant | Customize |
| F04 | Editor | Create visually | Preview |
| F05 | Design check | Resolve issues | Continue |
| F06 | Final preview | Confirm exact result | Approve |
| F07 | Cart | Review approved items | Checkout |
| F08 | Checkout mock | Delivery/payment | Place order |
| F09 | Confirmation | Confirm order | Track |
| F10 | Tracking mock | Show progress | View details |
| F11 | Share preview mock | Share design safely | Share / Copy link |
| F12 | Remix entry | Clone a design | Remix |

## F01 Home/Create entry

Primary objective:
make creation understandable in seconds.

Show:
- large garment/design examples;
- Create yours;
- Upload a pic / Add text / Pick a vibe;
- optional featured remixes;
- Browse clothes as secondary path.

Avoid long marketing text.

## F02 Catalog

Visual garment cards:
- strong imagery;
- color swatches;
- fit label;
- Customize;
- optional featured design preview.

Keep filtering minimal.

## F03 Product detail

Show:
- garment gallery;
- colors;
- sizes;
- fit/material;
- short size guide;
- printable sides;
- Customize.

Production details live under Help/How it prints.

## F04 Editor

Persistent:
- compact product context;
- FRONT/BACK;
- save state;
- Design check state;
- Preview.

Primary creation actions:
- Add
- Style
- Layers

## F05 Design check

This is a checkpoint, not a second editor.

Show:
- Needs a fix first;
- Worth checking second;
- physical/quality facts;
- one-tap return to affected element.

If no issues:
- lightweight “Looks ready” confirmation.

## F06 Final preview

Read-only.

Show:
- clean/full garment preview;
- swipe FRONT/BACK;
- product/color/size;
- Design check summary;
- physical size under details;
- Edit;
- Approve design.

The experience should feel like revealing the finished item.

## F07 Cart

Each item:
- garment thumbnail;
- FRONT/BACK thumbnails;
- size/color;
- quantity;
- approved revision;
- Edit as new draft;
- Remix.

Editing never mutates current approved item.

## F08 Checkout mock

Simple and transparent:
- contact;
- delivery;
- total;
- payment simulator.

Creation and purchase should remain mentally separate.

If youth/guardian approval is later required by policy/payment rules, handle it here rather than in the creative flow.

## F09 Confirmation

Show:
- order id;
- approved design preview;
- product summary;
- next steps;
- optional share-preview action.

## F10 Tracking mock

Customer language:
- Order received
- Preparing print
- Printing
- Quality check
- Packed
- Shipped

## F11 Share preview

Private by default.

Show:
- clean social-friendly mockup;
- share/copy link;
- privacy control;
- no original-upload exposure.

## F12 Remix

Can originate from:
- own saved design;
- cart item;
- featured/community design later.

Always creates a new draft.

## Cross-screen recovery flows

### Browser refresh in editor
Restore latest acknowledged draft + recover safe local unsaved work.

### Back navigation
Warn only if canonical unsaved changes would be lost.

### Product size changed from cart
Create new draft; old approved item remains until replacement approval.

### Final preview becomes obsolete
Mark clearly; approval disabled.

### Offline during editing
Allow local continuation where possible; block final approval/payment until synchronized.

### Shared/remix link
Never grants edit access to original design; creates view or clone semantics only.
