# PrintMaster Frontend Design Index

Frontend-first product and UX design for the mock-driven MVP.

## Documents

1. [Frontend Product Architecture](./frontend-product-architecture.md)
2. [Responsive Layout Specification](./responsive-layout-spec.md)
3. [Editor UX Specification](./editor-ux-spec.md)
4. [Screen and Flow Matrix](./screen-flow-matrix.md)
5. [Mock Data Contracts](./mock-data-contracts.md)
6. [Frontend UX Risk Controls](./frontend-ux-risk-controls.md)
7. [Frontend Design Roadmap](./frontend-design-roadmap.md)
8. [Deep Frontend Architecture Review](./frontend-architecture-review.md)
9. [Frontend Coordinate System](./frontend-coordinate-system.md)
10. [Editor Interaction State Machine](./editor-interaction-state-machine.md)
11. [Gen Alpha Product & Visual Vision](./gen-alpha-product-vision.md)
12. [UI Design System](./ui-design-system.md)
13. [UI Component Specification](./ui-component-spec.md)
14. [Low-Fidelity Wireframes](./low-fidelity-wireframes.md)
15. [Final Preview Screen](./final-preview-screen.md)
16. [Internationalization & Localization](./internationalization-localization.md)
17. [9 Simulated Expert Focus Groups](./focus-groups-9-expert-review.md)
18. [Focus Group Action Decisions](./focus-group-action-decisions.md)
19. [Unified Placement Frame & Body Preview Architecture](./unified-placement-body-preview-architecture.md)

## Design principles

- Production geometry is modeled in millimeters even before the backend exists.
- Browser pixels are presentation only.
- Creation-first is the primary experience; shop-first remains available.
- Mobile is a first-class creation surface, not compressed desktop.
- The editor feels like a creative playground while production constraints remain strict underneath.
- Proof is presented to customers as a distinct read-only Final preview.
- Mock APIs simulate future backend contracts, concurrency and failure states.
- Accessibility and touch behavior are part of MVP design.
- Approved/stale states are explicit; no silent resizing or overwrite.
- Sharing/remixing is designed as creation, not purchase pressure.
- Privacy is the default for uploaded artwork and share previews.
- Feature components consume semantic design tokens rather than hardcoded styling.
- Low-fidelity wireframes define information hierarchy, not final branding.
- UI localization supports Kazakh, Russian and English without changing design geometry or customer artwork.
- FLAT, Body Preview and Final Preview share one canonical Placement Frame; body simulation never replaces production millimeter geometry.

## Pre-code design status

The branch now contains:
- IA and customer flows;
- responsive interaction model;
- geometry and gesture contracts;
- mock API semantics;
- design system tokens;
- reusable UI component rules;
- mobile/tablet/desktop wireframes;
- Final Preview approval UX.

The next implementation step is a low-fidelity React shell using these contracts before the production canvas editor.
