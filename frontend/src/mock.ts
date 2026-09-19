import type {
  Draft,
  DraftStatus,
  MockPrintProfile,
  PreflightIssue,
  Product,
  Side,
  Size
} from './types'

export const products: Product[] = [
  {
    id: 'tee-basic',
    name: 'Everyday Tee',
    collection: 'Core',
    type: 'TSHIRT',
    fit: 'REGULAR',
    descriptionKey: 'product.teeDescription',
    material: '100% cotton',
    gsm: 190,
    price: 6900,
    colors: [
      { code: 'black', name: 'Black', hex: '#171717' },
      { code: 'white', name: 'White', hex: '#f4f4f2' },
      { code: 'graphite', name: 'Graphite', hex: '#4b4d51' },
      { code: 'navy', name: 'Navy', hex: '#17243f' },
      { code: 'forest', name: 'Forest', hex: '#29483a' },
      { code: 'sand', name: 'Sand', hex: '#d4c4a8' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'tee-heavy',
    name: 'Heavy Oversize Tee',
    collection: 'Street',
    type: 'TSHIRT',
    fit: 'OVERSIZE',
    descriptionKey: 'product.teeDescription',
    material: '100% heavyweight cotton',
    gsm: 260,
    price: 8900,
    colors: [
      { code: 'washed-black', name: 'Washed Black', hex: '#292827' },
      { code: 'bone', name: 'Bone', hex: '#e5dfd3' },
      { code: 'burgundy', name: 'Burgundy', hex: '#642f3b' },
      { code: 'sage', name: 'Sage', hex: '#899580' },
      { code: 'cobalt', name: 'Cobalt', hex: '#244c9c' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'hoodie-basic',
    name: 'Core Hoodie',
    collection: 'Core',
    type: 'HOODIE',
    fit: 'RELAXED',
    descriptionKey: 'product.hoodieDescription',
    material: 'Cotton blend fleece',
    gsm: 330,
    price: 12900,
    colors: [
      { code: 'black', name: 'Black', hex: '#171717' },
      { code: 'white', name: 'White', hex: '#f4f4f2' },
      { code: 'heather', name: 'Heather Grey', hex: '#a7a7a3' },
      { code: 'navy', name: 'Navy', hex: '#17243f' },
      { code: 'chocolate', name: 'Chocolate', hex: '#584235' },
      { code: 'olive', name: 'Olive', hex: '#596047' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'hoodie-heavy',
    name: 'Heavy Oversize Hoodie',
    collection: 'Street',
    type: 'HOODIE',
    fit: 'OVERSIZE',
    descriptionKey: 'product.hoodieDescription',
    material: 'Heavy brushed cotton blend',
    gsm: 430,
    price: 15900,
    colors: [
      { code: 'washed-black', name: 'Washed Black', hex: '#292827' },
      { code: 'cream', name: 'Cream', hex: '#e7dcc8' },
      { code: 'dusty-pink', name: 'Dusty Pink', hex: '#c79ca2' },
      { code: 'deep-green', name: 'Deep Green', hex: '#21473a' },
      { code: 'plum', name: 'Plum', hex: '#54334e' }
    ],
    sizes: ['S', 'M', 'L', 'XL']
  }
]

export const printProfiles: Record<string, MockPrintProfile> = {
  'tee-basic': {
    garmentWidthMm: 580,
    garmentHeightMm: 720,
    front: { xMm: 165, yMm: 150, widthMm: 250, heightMm: 300 },
    back: { xMm: 140, yMm: 130, widthMm: 300, heightMm: 380 }
  },
  'hoodie-basic': {
    garmentWidthMm: 620,
    garmentHeightMm: 760,
    front: { xMm: 185, yMm: 165, widthMm: 250, heightMm: 300 },
    back: { xMm: 160, yMm: 145, widthMm: 300, heightMm: 390 }
  },
  'tee-heavy': {
    garmentWidthMm: 640,
    garmentHeightMm: 740,
    front: { xMm: 185, yMm: 145, widthMm: 270, heightMm: 320 },
    back: { xMm: 165, yMm: 125, widthMm: 310, heightMm: 390 }
  },
  'hoodie-heavy': {
    garmentWidthMm: 690,
    garmentHeightMm: 790,
    front: { xMm: 215, yMm: 170, widthMm: 260, heightMm: 315 },
    back: { xMm: 185, yMm: 145, widthMm: 320, heightMm: 405 }
  }
}

const sizeProfileScale: Record<Size, number> = {
  S: .92,
  M: .96,
  L: 1,
  XL: 1.05
}

export const getPrintProfile = (productId: string, size: Size): MockPrintProfile => {
  const base = printProfiles[productId] ?? printProfiles['hoodie-basic']
  const scale = sizeProfileScale[size] ?? 1
  const scaleZone = (zone: MockPrintProfile['front']) => ({
    xMm: zone.xMm * scale,
    yMm: zone.yMm * scale,
    widthMm: zone.widthMm * scale,
    heightMm: zone.heightMm * scale
  })

  return {
    garmentWidthMm: base.garmentWidthMm * scale,
    garmentHeightMm: base.garmentHeightMm * scale,
    front: scaleZone(base.front),
    back: scaleZone(base.back)
  }
}

export const fontCatalog = [
  { id: 'inter', name: 'Inter', family: 'Inter, Arial, sans-serif', category: 'Clean' },
  { id: 'arial', name: 'Arial', family: 'Arial, sans-serif', category: 'Clean' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif', category: 'Editorial' },
  { id: 'courier', name: 'Courier', family: '"Courier New", monospace', category: 'Mono' },
  { id: 'impact', name: 'Impact', family: 'Impact, Haettenschweiler, sans-serif', category: 'Bold' },
  { id: 'trebuchet', name: 'Trebuchet', family: '"Trebuchet MS", sans-serif', category: 'Friendly' }
] as const

export const createDraft = (productId = 'hoodie-basic'): Draft => {
  const product = products.find(item => item.id === productId) ?? products[0]
  const profile = getPrintProfile(productId, 'L')
  const zone = profile.front

  return {
  id: 'draft-demo',
  productId,
  color: product.colors[0].code,
  size: 'L',
  activeSide: 'FRONT',
  status: 'READY',
  elements: [
    {
      id: 'text-1',
      type: 'TEXT',
      label: 'ALMATY',
      side: 'FRONT',
      xMm: zone.xMm + zone.widthMm / 2,
      yMm: zone.yMm + zone.heightMm * .35,
      widthMm: 150,
      heightMm: 42,
      rotationDeg: 0,
      zOrder: 1,
      fill: '#ffffff',
      fontFamily: 'Inter',
      fontStyle: 'normal',
      fontWeight: 800,
      textAlign: 'center',
      letterSpacingMm: 0
    }
  ]
  }
}

const rotatedHalfExtents = (widthMm: number, heightMm: number, rotationDeg: number) => {
  const radians = rotationDeg * Math.PI / 180
  return {
    x: Math.abs(Math.cos(radians)) * widthMm / 2 + Math.abs(Math.sin(radians)) * heightMm / 2,
    y: Math.abs(Math.sin(radians)) * widthMm / 2 + Math.abs(Math.cos(radians)) * heightMm / 2
  }
}

export const getPreflightIssues = (draft: Draft): PreflightIssue[] => {
  const profile = getPrintProfile(draft.productId, draft.size)
  const issues: PreflightIssue[] = []

  for (const element of draft.elements) {
    const zone = element.side === 'FRONT' ? profile.front : profile.back
    const half = rotatedHalfExtents(element.widthMm, element.heightMm, element.rotationDeg)

    const left = element.xMm - half.x
    const right = element.xMm + half.x
    const top = element.yMm - half.y
    const bottom = element.yMm + half.y

    if (
      left < zone.xMm ||
      right > zone.xMm + zone.widthMm ||
      top < zone.yMm ||
      bottom > zone.yMm + zone.heightMm
    ) {
      issues.push({
        code: 'OUTSIDE_PRINT_AREA',
        severity: 'BLOCKER',
        elementId: element.id
      })
    }

    if (
      element.type === 'IMAGE' &&
      element.sourceWidthPx &&
      element.sourceHeightPx
    ) {
      const dpiX = element.sourceWidthPx / (element.widthMm / 25.4)
      const dpiY = element.sourceHeightPx / (element.heightMm / 25.4)
      const effectiveDpi = Math.round(Math.min(dpiX, dpiY))

      if (effectiveDpi < 150) {
        issues.push({
          code: 'LOW_DPI',
          severity: effectiveDpi < 100 ? 'BLOCKER' : 'WARNING',
          elementId: element.id,
          value: effectiveDpi
        })
      }
    }
  }

  return issues
}

export const getDraftStatus = (draft: Draft): DraftStatus => {
  if (draft.elements.length === 0) return 'DRAFT'
  const issues = getPreflightIssues(draft)
  if (issues.some(issue => issue.severity === 'BLOCKER')) return 'BLOCKED'
  if (issues.length > 0) return 'WARNING'
  return 'READY'
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
