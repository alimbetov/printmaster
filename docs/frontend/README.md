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

## Design principles

- Production geometry is modeled in millimeters even before the backend exists.
- Browser pixels are presentation only.
- Desktop, tablet and mobile share one product model but use different layout patterns.
- The editor exposes physical constraints without forcing customers to understand DTF terminology.
- Server proof is represented as a distinct read-only step even while mocked.
- Mock APIs simulate future backend contracts and failures.
- Accessibility and touch behavior are part of MVP design, not a later patch.
