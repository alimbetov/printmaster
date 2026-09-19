# PrintMaster — Deep Review of Frontend Responsive UX Architecture

## Review status

The current frontend specification is directionally strong but **F0 is not yet complete**.

The main risks are not visual styling. They are contract ambiguities that would become expensive once the canvas/editor implementation starts.

## P0 blockers before Stage F1/F3 contracts are considered stable

### P0-1 — Element coordinate semantics are not explicit enough

Current contracts store:
- xMm
- yMm
- widthMm
- heightMm
- rotationDeg

Missing:
- whether x/y reference top-left, center, or anchor;
- rotation direction;
- transform origin;
- whether width/height are pre-rotation dimensions;
- side coordinate origin;
- numeric precision.

Decision:
- use **CENTER anchor** for persisted element placement;
- xMm/yMm identify element center in side garment-space;
- widthMm/heightMm are unrotated physical dimensions;
- rotationDeg is clockwise, normalized to [0, 360);
- geometry uses decimal/high precision and is rounded only for display/output.

### P0-2 — PrintProfile lacks an explicit coordinate-system contract

A polygon without coordinate semantics is insufficient.

PrintProfile must include:
- units = MM;
- origin = TOP_LEFT;
- xAxis = RIGHT;
- yAxis = DOWN;
- garment physical bounds;
- side-specific coordinate system;
- polygon winding convention;
- mapping metadata for visual mockup projection.

### P0-3 — Mockup image and production geometry are not separated enough

ProductVariant currently carries frontUrl/backUrl only.

Risk:
developers may derive mm coordinates directly from the image dimensions.

Required:
- garment-space geometry is independent;
- mockup has a projection descriptor;
- mockup asset may change without changing PrintProfileVersion;
- editor canvas transforms garment-space to viewport-space explicitly.

### P0-4 — Proof renderer must be independent from interactive editor rendering

If mock proof is simply a screenshot/export of the same Konva stage, it cannot detect editor-render drift.

Required architecture:
- EditorRenderer: interactive, viewport-oriented.
- ProofRenderer: read-only renderer consuming canonical DesignRevision + PrintProfile.
- They may share low-level geometry utilities, but proof cannot be a screenshot of current viewport state.

### P0-5 — Optimistic concurrency contract is underspecified

`PUT /designs/:id/draft` has a version field but no request/response semantics.

Required:
- client sends expectedVersion;
- success returns new version;
- stale write returns 409 with latestVersion and latestRevision metadata;
- autosave uses one in-flight mutation at a time per design;
- late responses cannot overwrite newer local state.

### P0-6 — Design status enums drift from backend architecture

Frontend mock status:
DRAFT / VALID / PROOF_READY / APPROVED

Architecture state machine:
DRAFT / VALIDATING / VALID / PROOF_RENDERING / PROOF_READY / APPROVED / LOCKED / ARCHIVED plus failures.

Decision:
frontend domain contracts use the full domain state set; UI maps it to simpler customer labels.

### P0-7 — Preflight result must be version-bound

Current PreflightReport references revisionId only.

It must also identify:
- printProfileVersionId;
- validatorVersion;
- evaluatedRevisionVersion/hash;
- generatedAt.

Any design mutation invalidates the report.

### P0-8 — Proof approval is under-modeled

Proof needs:
- designRevisionId;
- revision hash;
- printProfileVersionId;
- rendererVersion;
- preflightReportId/hash;
- output hash;
- createdAt;
- status.

ProofApproval needs:
- proofId/hash;
- accepted warning IDs/codes;
- approval timestamp;
- actor/session identity abstraction.

### P0-9 — Product/variant change behavior needs deterministic rules

Current UX says “auto-fit copy” may be offered but does not define how.

For MVP:
- no silent auto-fit;
- switching incompatible SKU creates a new draft revision;
- optional fit operation uses uniform scaling around design group center;
- no rotation change;
- relative z-order preserved;
- result is immediately revalidated;
- original approved/draft revision remains recoverable.

### P0-10 — Boundary behavior is ambiguous

“Prevent movement beyond hard forbidden boundaries where possible” is too vague.

Decision:
- editor does not silently mutate geometry to make it valid;
- snapping is advisory;
- printable/forbidden violations are represented by preflight;
- hard-clamping is limited to preventing an element from becoming completely unrecoverable/off-canvas;
- user always sees why approval is blocked.

This avoids the editor fighting the user's drag gesture.

## P1 gaps

### P1-1 — Draft persistence and refresh recovery

Define:
- local working copy;
- acknowledged remote/mock draft;
- pending unsaved commands;
- reload recovery;
- crash recovery;
- offline continuation policy.

### P1-2 — Undo/redo and autosave interaction

Undo/redo must operate on committed editor commands.

Autosave must save canonical snapshots but must not clear command history.

Late autosave responses must be ignored using mutation sequence/version.

### P1-3 — Proof/preflight screen duplication

Live preflight in editor and F05 review overlap.

Decision:
- live editor preflight = compact continuous feedback;
- Review screen = consolidated checkpoint before proof generation;
- Review screen is not a second editor.

### P1-4 — Cart edit semantics

Editing an approved cart item:
- creates a new draft from approved revision;
- cart remains linked to old approved revision until replacement proof is approved;
- abandoning edit preserves original cart item.

### P1-5 — Price model visibility

Frontend must anticipate that price can depend on:
- garment variant;
- sides used;
- print size tier;
- quantity.

Even while price is mocked, UI must not assume product price is static.

### P1-6 — Browser support matrix

Define MVP target browsers explicitly before editor implementation:
- current Chrome;
- current Edge;
- current Safari desktop;
- current Safari iOS;
- current Chrome Android.

Unsupported browser behavior must fail gracefully.

### P1-7 — Touch/stylus interaction arbitration

Need explicit pointer policy:
- Pointer Events as canonical input;
- no hover dependency;
- stylus acts as precise pointer;
- touch gestures never transform an object implicitly via pinch;
- viewport pinch/pan and object manipulation are mutually exclusive gesture states.

### P1-8 — Keyboard-accessible geometry editing

Desktop needs numeric controls and keyboard nudging:
- arrow = small mm increment;
- modifier + arrow = larger increment;
- rotation and dimensions editable without drag-only interaction.

### P1-9 — Localization-ready UI

Do not hardcode:
- strings;
- decimal separators;
- cm/mm formatting;
- currency;
- date/time.

Even if MVP launches in one language, contracts should support localization.

### P1-10 — Analytics for usability validation

The F8 usability phase needs events such as:
- editor_opened;
- asset_added;
- side_switched;
- preflight_blocker_seen;
- blocker_resolved;
- proof_generated;
- proof_approved;
- product_variant_changed;
- undo_used;
- checkout_completed.

Analytics events must not contain raw customer artwork or sensitive content.

### P1-11 — Performance budgets

Before F3:
- maximum normalized preview megapixels;
- maximum active element count;
- initial editor load budget;
- interaction-frame target;
- memory guard for mobile.

### P1-12 — Error boundaries and recoverability

Editor shell must isolate:
- asset panel failure;
- sticker library failure;
- proof request failure;
- canvas render exception.

A secondary-panel error must not destroy the design draft.

## P2 improvements

- keyboard shortcut help;
- duplicate design flow;
- design templates;
- guided first-use onboarding;
- side thumbnails with mini status indicators;
- recent colors/fonts;
- smart alignment guides;
- optional grid;
- safe-area visibility toggle;
- customer care instructions before checkout;
- design name/autonaming.

## Revised UX architecture gates

### Gate A — before clickable shell
Must resolve:
- route map;
- product/variant selection semantics;
- draft identity;
- navigation/unsaved behavior;
- responsive shell.

### Gate B — before canvas prototype
Must resolve:
- exact coordinate system;
- element anchor semantics;
- viewport transform;
- pointer/gesture state machine;
- undo/redo command model;
- browser support;
- performance budgets.

### Gate C — before proof flow
Must resolve:
- preflight versioning;
- independent proof renderer;
- proof hash/approval contract;
- stale-proof invalidation.

### Gate D — before backend implementation
Must prove with mocks:
- optimistic conflicts;
- reload recovery;
- duplicate/late responses;
- variant invalidation;
- stale proof;
- payment failure;
- cart edit replacement flow.

## Review verdict

The branch should **not be rewritten**. Its structure is correct.

Recommended action:
1. keep current IA and responsive strategy;
2. harden domain/UI contracts before writing the geometry editor;
3. treat the proof renderer as an independent subsystem;
4. make optimistic concurrency and stale-state behavior first-class in mocks;
5. add a formal frontend coordinate-system and interaction-state specification.
