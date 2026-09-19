export type Locale = 'ru-KZ' | 'kk-KZ' | 'en-US'
export type Side = 'FRONT' | 'BACK'
export type Size = 'S' | 'M' | 'L' | 'XL'

export type Product = {
  id: string
  name: string
  type: 'TSHIRT' | 'HOODIE'
  descriptionKey: string
  price: number
  colors: Array<{ code: string; name: string; hex: string }>
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
