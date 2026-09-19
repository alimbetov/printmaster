# PrintMaster — UI Component Specification

## Purpose

Define reusable components before React implementation so layout and interaction decisions are not re-invented per screen.

## Core shell

### AppHeader
Variants:
- public;
- editor;
- checkout.

Editor header shows:
- product/variant summary;
- FRONT/BACK;
- save state;
- Preview.

Mobile editor header stays compact.

### BottomNav / EditorDock
Only for creation actions on mobile/tablet.

## Discovery components

### HeroCreateCard
- large live/mock garment;
- Create yours CTA;
- optional rotating example;
- no autoplay that shifts layout.

### ProductCard
States:
- default;
- hover/focus;
- unavailable variant;
- loading.

### VibeCard
Visual first.
Supports:
- preview;
- apply;
- remix.

## Editor components

### GarmentViewport
Responsibilities:
- viewport projection;
- garment mockup;
- print guides;
- selection overlay;
- zoom/pan.

Must not own persisted design state.

### SideSwitcher
- FRONT/BACK;
- mini thumbnail;
- status dot/badge per side optional.

### AddMenu
Options:
- Image;
- Text;
- Sticker;
- Preset.

### ContextToolbar
Varies by selected element type.

Image:
- Crop
- Duplicate
- Size
- More

Text:
- Font
- Color
- Size
- More

Sticker:
- Color if supported
- Duplicate
- Size
- More

### StyleSheet
Visual font/style/vibe choices.

### LayerSheet
Rows:
- thumbnail/icon;
- name/type;
- visibility if supported;
- drag handle for ordering;
- active side only by default.

### PlacementPresetCard
Shows:
- thumbnail geometry;
- label;
- side applicability.

### MeasurementPopover
Secondary UI.
Shows:
- width;
- height;
- rotation;
- optional position hint.

### DesignCheckBadge
Compact global state.

### DesignCheckPanel
Groups:
1. Needs a fix
2. Worth checking
3. Info

Each item has:
- plain message;
- affected element;
- direct fix/focus action.

### SaveStateIndicator
States:
- Saved
- Saving
- Offline
- Conflict

Conflict must be visually distinct and actionable.

## Proof/final-preview components

### FinalPreviewViewer
- read-only;
- clean garment presentation;
- FRONT/BACK;
- zoom;
- no editor handles.

### ApprovalSummary
- product;
- color;
- size;
- used sides;
- print dimensions;
- warning acknowledgments.

### ApproveBar
Desktop:
- Edit
- Approve design

Mobile:
- sticky bottom bar.

## Cart

### ApprovedDesignLineItem
- garment image;
- side thumbnails;
- variant;
- quantity;
- approved revision;
- Edit as new draft;
- Remix.

## Feedback

### UndoToast
### ErrorBanner
### ConflictBanner
### OfflineBanner
### EmptyState
### Skeleton

## Component-state contract

Every interactive component should document:
- default;
- hover;
- active;
- focus;
- disabled;
- loading;
- error where relevant.

## Anti-patterns

Do not create:
- one mega EditorPanel;
- one generic Modal for every case;
- icon-only mobile navigation with ambiguous meaning;
- permanent numeric property sidebar;
- nested bottom sheets;
- uncontrolled canvas state hidden inside Konva objects.
