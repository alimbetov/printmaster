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

export type DesignElement = {
  id: string
  type: 'TEXT' | 'IMAGE' | 'STICKER'
  label: string
  side: Side
  xMm: number
  yMm: number
  widthMm: number
  heightMm: number
  rotationDeg: number
}

export type DraftStatus = 'DRAFT' | 'READY' | 'WARNING'

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
