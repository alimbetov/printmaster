import type {
  Draft,
  DraftStatus,
  MockPrintProfile,
  PreflightIssue,
  Product,
  Side
} from './types'

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
  }
}

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
      xMm: productId === 'hoodie-basic' ? 310 : 290,
      yMm: 255,
      widthMm: 150,
      heightMm: 42,
      rotationDeg: 0,
      zOrder: 1,
      fill: '#ffffff'
    }
  ]
})

const rotatedHalfExtents = (widthMm: number, heightMm: number, rotationDeg: number) => {
  const radians = rotationDeg * Math.PI / 180
  return {
    x: Math.abs(Math.cos(radians)) * widthMm / 2 + Math.abs(Math.sin(radians)) * heightMm / 2,
    y: Math.abs(Math.sin(radians)) * widthMm / 2 + Math.abs(Math.cos(radians)) * heightMm / 2
  }
}

export const getPreflightIssues = (draft: Draft): PreflightIssue[] => {
  const profile = printProfiles[draft.productId] ?? printProfiles['hoodie-basic']
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
