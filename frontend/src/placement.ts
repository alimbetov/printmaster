import type {
  DesignElement,
  Draft,
  PlacementFrameNormalized,
  PrintZone,
  Side
} from './types'

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export const normalizePlacementFrame = (
  frame?: Partial<PlacementFrameNormalized> | null
): PlacementFrameNormalized => {
  const width = Math.min(.96, Math.max(.18, frame?.width ?? .84))
  const height = Math.min(.96, Math.max(.18, frame?.height ?? .84))
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
