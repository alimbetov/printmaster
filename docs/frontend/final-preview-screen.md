# PrintMaster — Final Preview Screen Specification

## Purpose

Final Preview is both:
1. a customer-facing reveal moment;
2. the visual approval boundary for the production-linked design.

It must feel polished without weakening traceability.

## Visual hierarchy

1. garment/result;
2. FRONT/BACK;
3. readiness status;
4. product variant;
5. Edit / Approve;
6. details.

## Mobile

Use nearly full-screen preview.

Primary footer:
- Edit
- Approve design

Details are collapsible:
- print size;
- side usage;
- warning acknowledgments;
- revision reference.

## Desktop

Two-column:
- left: large garment preview;
- right: approval summary/action.

## Rules

- no transform handles;
- no live editor guides;
- no editable controls;
- no stale approval;
- no approval when production blocker exists.

## Warning acceptance

If warnings exist:
- list them plainly;
- user explicitly acknowledges before Approve is enabled where policy requires.

Example:
“This image may look slightly softer when printed.”

## FRONT/BACK

If both sides are used:
- both are visible as tabs/thumbnails;
- approval covers both sides together;
- no hidden side.

## Stale state

If design changes:
- screen becomes obsolete;
- Approve disabled;
- CTA: Generate updated preview.

## Motion

A short reveal transition is acceptable.
No confetti tied to purchase.

## Accessibility

- preview image has useful alt/summary;
- approval state is announced;
- warnings are keyboard and screen-reader reachable;
- no essential info only on image.
