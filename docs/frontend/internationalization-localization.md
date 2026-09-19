# PrintMaster — Internationalization & Localization Specification

## Goal

PrintMaster must support multilingual UI from the first React implementation without coupling language to business logic or canvas geometry.

Initial product locales:
- `kk-KZ` — Kazakh
- `ru-KZ` — Russian
- `en-US` — English

Default locale strategy:
1. explicit user preference if already selected;
2. previously stored locale;
3. browser locale if supported;
4. fallback to `ru-KZ` for the first Kazakhstan-focused MVP.

The fallback locale must be configurable.

## Architecture

Recommended:
- `i18next`
- `react-i18next`
- `Intl.NumberFormat`
- `Intl.DateTimeFormat`
- `Intl.PluralRules`

Do not hardcode translated strings inside React components.

Suggested structure:

```
src/
  i18n/
    index.ts
    locales/
      kk-KZ/
        common.json
        editor.json
        catalog.json
        checkout.json
        errors.json
      ru-KZ/
        common.json
        editor.json
        catalog.json
        checkout.json
        errors.json
      en-US/
        common.json
        editor.json
        catalog.json
        checkout.json
        errors.json
```

## Translation key strategy

Use semantic keys, not English sentences as keys.

Good:
```
editor.designCheck.ready
editor.actions.preview
checkout.payment.failed
```

Bad:
```
"Looks ready"
"Approve design"
```

Keys should survive copy changes.

## Locale switching

Language selector must be available:
- public header;
- account/settings later;
- checkout;
- editor overflow menu on mobile.

Switching locale:
- does not reload or reset design;
- does not alter geometry;
- does not invalidate DesignRevision;
- does not alter approved production content unless the design itself contains user-entered text.

UI locale and design-text content are separate concerns.

## Persisting locale

MVP:
- localStorage or equivalent client preference;
- mock API may return profile locale later.

Future backend:
- userProfile.locale
- order/customer communication locale pinned at checkout.

## Formatting

Never format numbers manually.

Use locale-aware formatters for:
- price;
- decimal values;
- dates/times;
- quantities.

Examples:
- KZT currency via Intl.NumberFormat;
- dimensions shown consistently in cm/mm;
- decimal separators follow locale where practical.

Production geometry remains numeric millimeters internally and is not locale-dependent.

## Units

Canonical production unit:
- millimeters.

Customer UI:
- primarily centimeters for dimensions in Kazakhstan;
- advanced/details may show mm where needed.

Do not parse canonical geometry from localized formatted text.

## Pluralization

All count-based text must use plural rules.

Examples:
- 1 warning / 2 warnings
- layer count
- item quantity
- order items

Do not concatenate nouns manually.

## Text expansion

Design for translated strings up to ~35–40% longer than English.

Rules:
- buttons may grow horizontally on desktop;
- mobile buttons wrap only where explicitly allowed;
- avoid fixed text-width controls;
- badges should support wider Russian/Kazakh text;
- bottom dock labels must be tested in all three locales.

## Typography

Primary UI font must support:
- Latin;
- Cyrillic;
- Kazakh characters: Ә ә, Ғ ғ, Қ қ, Ң ң, Ө ө, Ұ ұ, Ү ү, Һ һ, І і.

Inter generally supports the required scripts, but glyph coverage must be verified in implementation.

Do not assume every creative font supports Kazakh/Cyrillic.
FontCatalog must declare supported scripts.

Example metadata:
```ts
type FontCatalogEntry = {
  id: string;
  family: string;
  version: string;
  supportedScripts: Array<'LATIN' | 'CYRILLIC' | 'KAZAKH_CYRILLIC'>;
};
```

If user enters unsupported glyphs in design text:
- show immediate validation;
- suggest compatible fonts;
- never silently substitute another font.

## Customer-facing terminology

Maintain a terminology glossary per locale.

Concepts:
- Design check
- Looks ready
- Worth checking
- Needs a fix
- Final preview
- Remix
- Layers
- Front
- Back
- Print size

Translation should be reviewed for natural consumer language, not literal technical translation.

## Errors

Technical error codes remain locale-neutral:
```
LOW_EFFECTIVE_DPI
OUTSIDE_PRINTABLE_ZONE
STALE_DESIGN_VERSION
```

UI maps code → localized customer message.

Do not persist localized error strings as domain state.

## API contracts

Backend/mock API returns:
- codes;
- IDs;
- numeric values;
- structured parameters.

Example:
```json
{
  "code": "LOW_EFFECTIVE_DPI",
  "params": {
    "dpi": 118,
    "recommendedWidthMm": 150
  }
}
```

Frontend produces localized copy.

## User-generated text

Important distinction:
- UI translation affects application chrome;
- user-entered design text must never auto-translate on locale switch.

Changing `ru-KZ → kk-KZ` must not change text printed on the hoodie.

## Proof / Final Preview

Final Preview UI is localized.

The immutable production design content is not modified by locale.

For order evidence, store:
- approved design revision;
- proof artifact/hash;
- locale used for approval UI optionally for audit;
- accepted warning codes, not only translated warning strings.

## Share preview

Generated share-preview captions/UI may use active locale.

Design artwork itself remains unchanged.

## Checkout

Checkout locale controls:
- form labels;
- validation;
- totals;
- delivery descriptions;
- customer communication preference.

Order monetary values remain numeric + ISO currency code.

## Accessibility

Language root must set correct:
```html
<html lang="kk">
```
or `ru`, `en`.

Screen readers must receive the active language.

Mixed-language design text is customer content and does not change page locale.

## RTL readiness

RTL is not required for initial locales.

However:
- avoid hardcoding `left/right` for generic layout where logical `start/end` works;
- CSS should prefer logical properties (`margin-inline`, `padding-inline`) where practical.

Important exception:
production concepts FRONT/BACK and wearer-left/right must remain physically explicit and not be automatically mirrored by localization.

## Testing matrix

Every core flow must run in:
- kk-KZ
- ru-KZ
- en-US

Test:
- 320px mobile;
- tablet;
- desktop;
- long strings;
- pluralization;
- KZT formatting;
- date formatting;
- Kazakh glyph rendering;
- language switch while editor is open;
- language switch with unsaved changes;
- Final Preview;
- checkout;
- errors/conflicts/offline messages.

## Pseudo-localization

Add development-only pseudo locale:
- `en-XA`

It should:
- expand strings;
- add visible markers;
- expose hardcoded strings/layout clipping.

Pseudo-locale is not shown to normal users.

## Acceptance criteria

1. No feature component contains customer-facing hardcoded strings.
2. Switching language does not reset editor state.
3. Design text is never auto-translated.
4. Geometry/hash/revision do not change from UI locale switch alone.
5. All three MVP locales pass core responsive flow.
6. Kazakh-specific Cyrillic glyphs render correctly.
7. API/domain error codes are translated only at presentation layer.
8. Currency/date/plural formatting uses locale-aware APIs.
9. Missing translation falls back predictably and is observable in development.
10. Final Preview and checkout are fully localized.
