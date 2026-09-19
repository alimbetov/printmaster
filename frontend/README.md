# PrintMaster Frontend — Mock Alpha

First live frontend implementation based on the approved UX/spec branch.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- i18next / react-i18next
- pure CSS design tokens / responsive layouts

## Run

```bash
cd frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

## Current live flows

- Home / Create-first
- Catalog
- Product detail
- Responsive mock editor
- FRONT / BACK
- Add image/text/sticker mock elements
- Style bottom sheet
- Design Check
- Final Preview
- Approve → Cart
- Mock checkout
- Mock order confirmation
- RU / KZ / EN language switch
- localStorage draft persistence

## Routes

```
/
/products
/products/:id
/editor
/check
/preview
/cart
/checkout
/order
```

## Important

This is F1/F2 mock-alpha.

The garment editor currently uses a visual SVG mock. It intentionally does **not** implement the canonical Konva/mm geometry engine yet.

Next frontend slice:
1. split App.tsx into feature modules;
2. introduce Mock API adapters instead of direct fixture access;
3. add deterministic mock scenarios;
4. implement F3 canonical mm geometry prototype;
5. then introduce Konva/direct manipulation.
