import type {
  DesignElement,
  Draft,
  PlacementFrameNormalized,
  PrintZone,
  PrintZoneOffset,
  Side
} from './types'

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export const normalizePlacementFrame = (
  frame?: Partial<PlacementFrameNormalized> | null
): PlacementFrameNormalized => {
  const width = Math.min(1, Math.max(.10, frame?.width ?? .84))
  const height = Math.min(1, Math.max(.10, frame?.height ?? .84))
  const x = Math.min(1 - width, Math.max(0, frame?.x ?? .08))
  const y = Math.min(1 - height, Math.max(0, frame?.y ?? .08))
  return { x, y, width, height }
}

export const frameToMm = (frame: PlacementFrameNormalized, zone: PrintZone) => ({
  xMm: zone.xMm + frame.x * zone.widthMm,
  yMm: zone.yMm + frame.y * zone.heightMm,
  widthMm: frame.width * zone.widthMm,
  heightMm: frame.height * zone.heightMm
})

export const frameFromMm = (
  rect: { xMm: number; yMm: number; widthMm: number; heightMm: number },
  zone: PrintZone
): PlacementFrameNormalized => normalizePlacementFrame({
  x: (rect.xMm - zone.xMm) / zone.widthMm,
  y: (rect.yMm - zone.yMm) / zone.heightMm,
  width: rect.widthMm / zone.widthMm,
  height: rect.heightMm / zone.heightMm
})

export const movePlacementFrameWithDesign = (
  draft: Draft,
  side: Side,
  nextFrame: PlacementFrameNormalized,
  zone: PrintZone
): Draft => {
  const currentFrame = normalizePlacementFrame(draft.placementFrames?.[side])
  const normalizedNext = normalizePlacementFrame(nextFrame)
  const dxMm = (normalizedNext.x - currentFrame.x) * zone.widthMm
  const dyMm = (normalizedNext.y - currentFrame.y) * zone.heightMm

  return {
    ...draft,
    placementFrames: {
      ...draft.placementFrames,
      [side]: normalizedNext
    },
    elements: draft.elements.map(element =>
      element.side === side
        ? {
            ...element,
            xMm: Number((element.xMm + dxMm).toFixed(3)),
            yMm: Number((element.yMm + dyMm).toFixed(3))
          }
        : element
    )
  }
}

const rotatedHalfExtents = (element: DesignElement) => {
  const radians = element.rotationDeg * Math.PI / 180
  return {
    x: Math.abs(Math.cos(radians)) * element.widthMm / 2 +
       Math.abs(Math.sin(radians)) * element.heightMm / 2,
    y: Math.abs(Math.sin(radians)) * element.widthMm / 2 +
       Math.abs(Math.cos(radians)) * element.heightMm / 2
  }
}

export const frameContainsElements = (
  frame: PlacementFrameNormalized,
  zone: PrintZone,
  elements: DesignElement[]
) => {
  const rect = frameToMm(frame, zone)
  return elements.every(element => {
    const half = rotatedHalfExtents(element)
    return (
      element.xMm - half.x >= rect.xMm &&
      element.xMm + half.x <= rect.xMm + rect.widthMm &&
      element.yMm - half.y >= rect.yMm &&
      element.yMm + half.y <= rect.yMm + rect.heightMm
    )
  })
}

export const getFrameForSide = (draft: Draft, side: Side) =>
  normalizePlacementFrame(draft.placementFrames?.[side])


export const getPrintZoneOffset = (draft: Draft, side: Side): PrintZoneOffset =>
  draft.printZoneOffsets?.[side] ?? { xMm: 0, yMm: 0 }

export const getEffectivePrintZone = (
  draft: Draft,
  side: Side,
  baseZone: PrintZone
): PrintZone => {
  const offset = getPrintZoneOffset(draft, side)
  return {
    ...baseZone,
    xMm: baseZone.xMm + offset.xMm,
    yMm: baseZone.yMm + offset.yMm
  }
}

export const movePrintZoneWithDesign = (
  draft: Draft,
  side: Side,
  nextOffset: PrintZoneOffset
): Draft => {
  const current = getPrintZoneOffset(draft, side)
  const dxMm = nextOffset.xMm - current.xMm
  const dyMm = nextOffset.yMm - current.yMm

  return {
    ...draft,
    printZoneOffsets: {
      ...draft.printZoneOffsets,
      [side]: {
        xMm: Number(nextOffset.xMm.toFixed(3)),
        yMm: Number(nextOffset.yMm.toFixed(3))
      }
    },
    elements: draft.elements.map(element =>
      element.side === side
        ? {
            ...element,
            xMm: Number((element.xMm + dxMm).toFixed(3)),
            yMm: Number((element.yMm + dyMm).toFixed(3))
          }
        : element
    )
  }
}

export const clampPrintZoneOffset = (
  baseZone: PrintZone,
  offset: PrintZoneOffset,
  garmentWidthMm: number,
  garmentHeightMm: number
): PrintZoneOffset => {
  const minX = -baseZone.xMm
  const maxX = garmentWidthMm - (baseZone.xMm + baseZone.widthMm)
  const minY = -baseZone.yMm
  const maxY = garmentHeightMm - (baseZone.yMm + baseZone.heightMm)

  return {
    xMm: Math.min(maxX, Math.max(minX, offset.xMm)),
    yMm: Math.min(maxY, Math.max(minY, offset.yMm))
  }
}
