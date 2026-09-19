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

## Design principles

- Production geometry is modeled in millimeters even before the backend exists.
- Browser pixels are presentation only.
- Desktop, tablet and mobile share one product model but use different layout patterns.
- The editor exposes physical constraints without forcing customers to understand DTF terminology.
- Proof is a distinct read-only artifact rendered independently from the interactive viewport.
- Mock APIs simulate future backend contracts, concurrency and failure states.
- Accessibility and touch behavior are part of MVP design, not a later patch.
- Approved/stale states are explicit; no silent resizing or overwrite is allowed.
