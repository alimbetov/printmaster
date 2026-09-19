import type { Draft, DraftStatus, Product, Side } from './types'

export const products: Product[] = [
  {
    id: 'tee-basic',
    name: 'Basic Tee',
    type: 'TSHIRT',
    descriptionKey: 'product.teeDescription',
    price: 6900,
    colors: [
      { code: 'black', name: 'Black', hex: '#171717' },
      { code: 'white', name: 'White', hex: '#f4f4f2' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'hoodie-basic',
    name: 'Basic Hoodie',
    type: 'HOODIE',
    descriptionKey: 'product.hoodieDescription',
    price: 12900,
    colors: [
      { code: 'black', name: 'Black', hex: '#171717' },
      { code: 'white', name: 'White', hex: '#f4f4f2' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  }
]

export const createDraft = (productId = 'hoodie-basic'): Draft => ({
  id: 'draft-demo',
  productId,
  color: 'black',
  size: 'L',
  activeSide: 'FRONT',
  status: 'READY',
  elements: [
    {
      id: 'text-1',
      type: 'TEXT',
      label: 'ALMATY',
      side: 'FRONT',
      xMm: 125,
      yMm: 205,
      widthMm: 160,
      heightMm: 46,
      rotationDeg: 0
    }
  ]
})

export const getDraftStatus = (draft: Draft): DraftStatus => {
  if (draft.elements.length === 0) return 'DRAFT'
  return draft.elements.some(element => element.type === 'IMAGE') ? 'WARNING' : 'READY'
}

export const getSidesInUse = (draft: Draft): Side[] =>
  (['FRONT', 'BACK'] as Side[]).filter(side =>
    draft.elements.some(element => element.side === side)
  )

export const getDisplayLabel = (draft: Draft, side: Side) =>
  draft.elements.find(element => element.side === side)?.label ?? ''

export const formatKzt = (value: number, locale = 'ru-KZ') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0
  }).format(value)

export const readStoredJson = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : null
  } catch {
    localStorage.removeItem(key)
    return null
  }
}
