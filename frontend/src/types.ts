export type Locale = 'ru-KZ' | 'kk-KZ' | 'en-US'
export type Side = 'FRONT' | 'BACK'
export type Size = 'S' | 'M' | 'L' | 'XL'

export type ProductColor = {
  code: string
  name: string
  hex: string
}

export type Product = {
  id: string
  name: string
  collection: string
  type: 'TSHIRT' | 'HOODIE'
  fit: 'REGULAR' | 'RELAXED' | 'OVERSIZE'
  descriptionKey: string
  material: string
  gsm: number
  price: number
  colors: ProductColor[]
  sizes: Size[]
}

export type DesignElementType = 'TEXT' | 'IMAGE' | 'STICKER'

export type DesignElement = {
  id: string
  type: DesignElementType
  label: string
  side: Side

  // Canonical garment-space geometry. x/y are element center coordinates.
  xMm: number
  yMm: number
  widthMm: number
  heightMm: number
  rotationDeg: number
  zOrder: number

  // Element appearance/content.
  fill?: string

  // Text styling. Stored as domain values, not canvas pixels.
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  fontWeight?: 400 | 600 | 700 | 800 | 900
  textAlign?: 'left' | 'center' | 'right'
  letterSpacingMm?: number

  imageDataUrl?: string
  sourceWidthPx?: number
  sourceHeightPx?: number
}

export type DraftStatus = 'DRAFT' | 'READY' | 'WARNING' | 'BLOCKED'

export type Draft = {
  id: string
  productId: string
  color: string
  size: Size
  activeSide: Side
  elements: DesignElement[]
  status: DraftStatus
}

export type ApprovedDesign = {
  approvedAt: string
  draft: Draft
}

export type PrintZone = {
  xMm: number
  yMm: number
  widthMm: number
  heightMm: number
}

export type MockPrintProfile = {
  garmentWidthMm: number
  garmentHeightMm: number
  front: PrintZone
  back: PrintZone
}

export type PreflightIssue = {
  code: 'OUTSIDE_PRINT_AREA' | 'LOW_DPI'
  severity: 'BLOCKER' | 'WARNING'
  elementId: string
  value?: number
}
