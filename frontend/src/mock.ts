import type { Draft, Product } from './types'

export const products: Product[] = [
  {
    id: 'tee-basic',
    name: 'Basic Tee',
    type: 'TSHIRT',
    description: 'Плотная базовая футболка для принтов спереди и сзади.',
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
    description: 'Мягкий худи relaxed fit с большой зоной кастомизации.',
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

export const formatKzt = (value: number, locale = 'ru-KZ') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(value)
