# PrintMaster — Editor Interaction State Machine

## Purpose

Prevent gesture ambiguity and accidental geometry changes across mouse, touch and stylus.

## High-level states

- IDLE
- ELEMENT_SELECTED
- DRAGGING_ELEMENT
- RESIZING_ELEMENT
- ROTATING_ELEMENT
- CROPPING
- PANNING_VIEWPORT
- ZOOMING_VIEWPORT
- TEXT_EDITING
- MODAL_BLOCKED

Only one transform state may own pointer movement at a time.

## Pointer policy

Use Pointer Events as the canonical input abstraction.

### Mouse/stylus
- primary drag on selected element: move;
- drag resize handle: resize;
- drag rotation handle: rotate;
- wheel/trackpad: viewport zoom/pan according to platform convention;
- stylus behaves as a precise pointer, not a special design mode.

### Touch
- one-finger drag on selected element: move;
- resize/rotate via visible handles;
- two-finger gesture on empty canvas/viewport: viewport pan/zoom;
- pinch does not implicitly resize an artwork element in MVP;
- long press is never required for a critical action.

## Gesture arbitration

When an element transform starts:
- viewport pan/zoom is suspended until pointer release/cancel.

When viewport pinch begins:
- selected element remains selected;
- its garment geometry does not change.

Pointer cancellation:
- reverts uncommitted transform or commits only according to explicit gesture policy;
- never leaves half-applied canonical state.

## Command boundary

A continuous drag/resize/rotate gesture creates one undoable command, not one command per pointer move.

Flow:
1. pointer down captures initial canonical geometry;
2. pointer move updates transient preview;
3. pointer up commits one canonical command;
4. autosave may then persist the new snapshot.

## Keyboard geometry controls

Desktop:
- arrow keys nudge selected object by a small physical increment;
- modifier + arrow uses a larger increment;
- numeric width/height/rotation fields provide non-drag alternative;
- Delete/Backspace behavior must not conflict with text editing.

Exact increments are design-system configuration, expressed in mm.

## Mobile sheets and keyboard

Opening a property bottom sheet must not:
- lose selection;
- unexpectedly recenter canvas;
- hide Apply/Done behind virtual keyboard.

## Crop state

CROP is a dedicated mode:
- object transforms outside crop are disabled;
- Apply commits one crop command;
- Cancel restores previous crop;
- viewport zoom remains separate from crop geometry.

## Destructive actions

Delete:
- immediate action;
- offers Undo;
- does not require confirmation for a single object.

Clear design / product reset:
- explicit confirmation.

## Orientation change

Viewport orientation change:
- cancels unsafe active gesture if necessary;
- preserves last committed canonical state;
- recalculates viewport projection only.

## Required interaction tests

- touch drag while selected;
- pinch with selected object;
- pointercancel during drag;
- rotate then undo;
- resize then autosave;
- keyboard nudge;
- crop cancel/apply;
- rotate device during open sheet;
- virtual keyboard in text edit;
- stylus + touch coexistence.
