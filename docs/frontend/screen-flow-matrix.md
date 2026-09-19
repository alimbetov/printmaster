# PrintMaster — Screen and Flow Matrix

## Core screens

| ID | Screen | Purpose | Primary action |
|---|---|---|---|
| F01 | Home | Explain value proposition | Start designing |
| F02 | Catalog | Browse garments | Select product |
| F03 | Product detail | Choose model/color/size | Customize |
| F04 | Editor | Build design | Review |
| F05 | Preflight review | Resolve production issues | Generate proof |
| F06 | Proof approval | Confirm exact design | Approve |
| F07 | Cart | Review products/designs | Checkout |
| F08 | Checkout mock | Delivery/payment simulation | Place order |
| F09 | Confirmation | Confirm immutable order | Track order |
| F10 | Order tracking mock | Show lifecycle | View details |

## F01 Home

Must communicate:
- custom apparel;
- upload image/add text;
- choose product;
- preview before ordering;
- simple CTA.

Do not overload with production terminology.

## F02 Catalog

Cards:
- garment image;
- product name;
- starting price placeholder;
- available colors;
- customizable sides;
- fit label.

Filters can be minimal in MVP.

## F03 Product detail

Must establish product context before editor:
- image gallery;
- colors;
- sizes;
- size guide;
- material;
- printable sides;
- approximate printable area;
- care note;
- Customize CTA.

Validation:
- cannot enter editor without valid variant.

## F04 Editor

Critical persistent context:
- product name
- color
- size
- active side
- preflight summary
- save state

Primary CTA:
- Review design

## F05 Preflight review

Summarize:
- blockers
- warnings
- physical size
- image quality
- side usage

Block progression if blocker exists.

## F06 Proof approval

Read-only.
Show:
- server/mock proof
- product/variant
- FRONT/BACK
- exact physical print dimensions
- warnings acknowledged
- revision id

Approval generates immutable client-side/mock record.

## F07 Cart

Each item includes:
- garment thumbnail
- side thumbnails
- size/color
- quantity
- design revision
- edit creates new draft; does not mutate approved revision

## F08 Checkout mock

Keep intentionally simple:
- contact
- delivery
- payment simulator
- total

Mock payment modes:
- success
- failure
- timeout
- duplicate callback simulation for QA mode

## F09 Confirmation

Show:
- order id
- product summary
- approved proof thumbnails
- next steps

## F10 Tracking mock

Customer language:
- Order received
- Preparing print
- Printing
- Quality check
- Packed
- Shipped

Do not expose internal state-machine jargon unless in dev mode.

## Cross-screen recovery flows

### Browser refresh in editor
Reload latest saved draft; restore selection only if safe.

### Back navigation
Warn only when unsaved canonical changes exist.

### Product size changed from cart
Open configurator/editor as new draft and require new proof.

### Proof becomes obsolete
Clearly mark old proof “Outdated”; cannot approve it.

### Offline during editing
Allow local continuation if feasible, but block approval/payment until synchronized.
