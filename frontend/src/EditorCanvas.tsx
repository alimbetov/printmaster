import { useEffect, useMemo, useRef, useState } from 'react'
import Konva from 'konva'
import {
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer
} from 'react-konva'
import type {
  Draft,
  DesignElement,
  MockPrintProfile,
  PlacementFrameNormalized
} from './types'
import { getPrintProfile } from './mock'
import {
  clampPrintZoneOffset,
  frameContainsElements,
  frameFromMm,
  frameToMm,
  getEffectivePrintZone,
  getFrameForSide,
  getPrintZoneOffset,
  movePlacementFrameWithDesign,
  movePrintZoneWithDesign,
  normalizePlacementFrame
} from './placement'

type Props = {
  draft: Draft
  garmentColor: string
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (draft: Draft) => void
  readOnly?: boolean
  zoom?: number
  panX?: number
  panY?: number
}

function useElementImage(src?: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!src) {
      setImage(null)
      return
    }

    const next = new Image()
    next.onload = () => setImage(next)
    next.src = src

    return () => {
      next.onload = null
    }
  }, [src])

  return image
}

function CanvasImage({
  element,
  scale,
  selected,
  onSelect,
  onCommit,
  readOnly
}: {
  element: DesignElement
  scale: number
  selected: boolean
  onSelect: () => void
  onCommit: (node: Konva.Node) => void
  readOnly: boolean
}) {
  const image = useElementImage(element.imageDataUrl)
  const width = element.widthMm * scale
  const height = element.heightMm * scale

  return (
    <KonvaImage
      id={`element-${element.id}`}
      image={image ?? undefined}
      x={element.xMm * scale}
      y={element.yMm * scale}
      width={width}
      height={height}
      offsetX={width / 2}
      offsetY={height / 2}
      rotation={element.rotationDeg}
      opacity={image ? 1 : 0.45}
      fill={image ? undefined : '#777'}
      stroke={selected ? '#6c4dff' : undefined}
      strokeWidth={selected ? 2 : 0}
      draggable={!readOnly}
      onClick={readOnly ? undefined : onSelect}
      onTap={readOnly ? undefined : onSelect}
      onDragEnd={event => onCommit(event.target)}
      onTransformEnd={event => onCommit(event.target)}
    />
  )
}

const garmentPoints = (profile: MockPrintProfile, hoodie: boolean) => {
  const w = profile.garmentWidthMm
  const h = profile.garmentHeightMm

  if (hoodie) {
    return [
      w * .30, h * .12,
      w * .20, h * .16,
      w * .04, h * .29,
      w * .15, h * .35,
      w * .19, h * .27,
      w * .18, h * .94,
      w * .82, h * .94,
      w * .81, h * .27,
      w * .85, h * .35,
      w * .96, h * .29,
      w * .80, h * .16,
      w * .70, h * .12,
      w * .62, h * .18,
      w * .38, h * .18
    ]
  }

  return [
    w * .29, h * .12,
    w * .17, h * .16,
    w * .04, h * .26,
    w * .14, h * .32,
    w * .20, h * .24,
    w * .18, h * .94,
    w * .82, h * .94,
    w * .80, h * .24,
    w * .86, h * .32,
    w * .96, h * .26,
    w * .83, h * .16,
    w * .71, h * .12,
    w * .62, h * .17,
    w * .38, h * .17
  ]
}

export default function EditorCanvas({
  draft,
  garmentColor,
  selectedId,
  onSelect,
  onChange,
  readOnly = false,
  zoom = 1,
  panX = 0,
  panY = 0
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const elementTransformerRef = useRef<Konva.Transformer>(null)
  const frameRef = useRef<Konva.Rect>(null)
  const frameTransformerRef = useRef<Konva.Transformer>(null)
  const [viewport, setViewport] = useState({ width: 600, height: 700 })
  const [frameSelected, setFrameSelected] = useState(false)
  const [printZoneSelected, setPrintZoneSelected] = useState(false)
  const [zoneDragDelta, setZoneDragDelta] = useState({ xMm: 0, yMm: 0 })

  const profile = getPrintProfile(draft.productId, draft.size)
  const baseZone = draft.activeSide === 'FRONT' ? profile.front : profile.back
  const zone = getEffectivePrintZone(draft, draft.activeSide, baseZone)
  const placementFrame = getFrameForSide(draft, draft.activeSide)
  const placementMm = frameToMm(placementFrame, zone)
  const previewPlacementMm = {
    ...placementMm,
    xMm: placementMm.xMm + zoneDragDelta.xMm,
    yMm: placementMm.yMm + zoneDragDelta.yMm
  }

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const update = () => {
      setViewport({
        width: Math.max(element.clientWidth, 280),
        height: Math.max(element.clientHeight, 420)
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setFrameSelected(false)
    setPrintZoneSelected(false)
    setZoneDragDelta({ xMm: 0, yMm: 0 })
  }, [draft.activeSide])

  const scale = useMemo(() => {
    const horizontal = (viewport.width - 32) / profile.garmentWidthMm
    const vertical = (viewport.height - 32) / profile.garmentHeightMm
    const fit = Math.max(0.25, Math.min(horizontal, vertical, 1.05))
    return Math.max(0.2, Math.min(fit * zoom, 1.8))
  }, [profile, viewport, zoom])

  const stageWidth = profile.garmentWidthMm * scale
  const stageHeight = profile.garmentHeightMm * scale

  const activeElements = useMemo(
    () => draft.elements
      .filter(element => element.side === draft.activeSide)
      .sort((a, b) => a.zOrder - b.zOrder),
    [draft.activeSide, draft.elements]
  )

  const selectedElement = activeElements.find(element => element.id === selectedId) ?? null

  useEffect(() => {
    const transformer = elementTransformerRef.current
    const stage = stageRef.current
    if (!transformer || !stage) return

    if (!selectedId || frameSelected || printZoneSelected) {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
      return
    }

    const node = stage.findOne(`#element-${selectedId}`)
    transformer.nodes(node ? [node] : [])
    transformer.getLayer()?.batchDraw()
  }, [selectedId, frameSelected, printZoneSelected, activeElements, scale])

  useEffect(() => {
    const transformer = frameTransformerRef.current
    const frame = frameRef.current
    if (!transformer || !frame) return
    transformer.nodes(frameSelected && !printZoneSelected && !readOnly ? [frame] : [])
    transformer.getLayer()?.batchDraw()
  }, [frameSelected, printZoneSelected, readOnly, placementFrame, scale])

  const updateElement = (id: string, patch: Partial<DesignElement>) => {
    onChange({
      ...draft,
      elements: draft.elements.map(element =>
        element.id === id ? { ...element, ...patch } : element
      )
    })
  }

  const commitNode = (element: DesignElement, node: Konva.Node) => {
    const nextScaleX = node.scaleX()
    const nextScaleY = node.scaleY()

    const nextWidth = Math.max(12, element.widthMm * nextScaleX)
    const nextHeight = Math.max(12, element.heightMm * nextScaleY)

    node.scaleX(1)
    node.scaleY(1)

    updateElement(element.id, {
      xMm: Number((node.x() / scale).toFixed(3)),
      yMm: Number((node.y() / scale).toFixed(3)),
      widthMm: Number(nextWidth.toFixed(3)),
      heightMm: Number(nextHeight.toFixed(3)),
      rotationDeg: Number((((node.rotation() % 360) + 360) % 360).toFixed(2))
    })
  }

  const bodyBounds = {
    leftMm: profile.garmentWidthMm * .18,
    rightMm: profile.garmentWidthMm * .82,
    topMm: profile.garmentHeightMm * .10,
    bottomMm: profile.garmentHeightMm * .94
  }

  const commitPrintZoneMove = (node: Konva.Rect) => {
    const rawOffset = {
      xMm: node.x() / scale - baseZone.xMm,
      yMm: node.y() / scale - baseZone.yMm
    }

    const garmentClamped = clampPrintZoneOffset(
      baseZone,
      rawOffset,
      profile.garmentWidthMm,
      profile.garmentHeightMm
    )

    const minXOffset = bodyBounds.leftMm - baseZone.xMm
    const maxXOffset = bodyBounds.rightMm - (baseZone.xMm + baseZone.widthMm)
    const minYOffset = bodyBounds.topMm - baseZone.yMm
    const maxYOffset = bodyBounds.bottomMm - (baseZone.yMm + baseZone.heightMm)

    const nextOffset = {
      xMm: Math.min(maxXOffset, Math.max(minXOffset, garmentClamped.xMm)),
      yMm: Math.min(maxYOffset, Math.max(minYOffset, garmentClamped.yMm))
    }

    setZoneDragDelta({ xMm: 0, yMm: 0 })
    onChange(movePrintZoneWithDesign(
      draft,
      draft.activeSide,
      nextOffset
    ))
  }

  const commitFrameMove = (node: Konva.Rect) => {
    const widthPx = placementMm.widthMm * scale
    const heightPx = placementMm.heightMm * scale
    const minX = zone.xMm * scale
    const minY = zone.yMm * scale
    const maxX = (zone.xMm + zone.widthMm) * scale - widthPx
    const maxY = (zone.yMm + zone.heightMm) * scale - heightPx

    const xPx = Math.min(maxX, Math.max(minX, node.x()))
    const yPx = Math.min(maxY, Math.max(minY, node.y()))

    node.position({ x: xPx, y: yPx })

    const next = frameFromMm({
      xMm: xPx / scale,
      yMm: yPx / scale,
      widthMm: placementMm.widthMm,
      heightMm: placementMm.heightMm
    }, zone)

    onChange(movePlacementFrameWithDesign(
      draft,
      draft.activeSide,
      next,
      zone
    ))
  }

  const commitFrameResize = (node: Konva.Rect) => {
    const nextRect = {
      xMm: node.x() / scale,
      yMm: node.y() / scale,
      widthMm: Math.abs(node.width() * node.scaleX()) / scale,
      heightMm: Math.abs(node.height() * node.scaleY()) / scale
    }

    node.scaleX(1)
    node.scaleY(1)

    const next = normalizePlacementFrame(frameFromMm(nextRect, zone))
    const sideElements = draft.elements.filter(element => element.side === draft.activeSide)

    if (!frameContainsElements(next, zone, sideElements)) {
      node.position({
        x: placementMm.xMm * scale,
        y: placementMm.yMm * scale
      })
      node.size({
        width: placementMm.widthMm * scale,
        height: placementMm.heightMm * scale
      })
      alert('Placement frame cannot exclude existing design elements. Move the elements first or enlarge the frame.')
      return
    }

    onChange({
      ...draft,
      placementFrames: {
        ...draft.placementFrames,
        [draft.activeSide]: next
      }
    })
  }

  const renderElement = (element: DesignElement) => {
    const width = element.widthMm * scale
    const height = element.heightMm * scale
    const common = {
      id: `element-${element.id}`,
      x: (element.xMm + zoneDragDelta.xMm) * scale,
      y: (element.yMm + zoneDragDelta.yMm) * scale,
      width,
      height,
      offsetX: width / 2,
      offsetY: height / 2,
      rotation: element.rotationDeg,
      draggable: !readOnly,
      onClick: readOnly ? undefined : () => {
        setFrameSelected(false)
        setPrintZoneSelected(false)
        onSelect(element.id)
      },
      onTap: readOnly ? undefined : () => {
        setFrameSelected(false)
        setPrintZoneSelected(false)
        onSelect(element.id)
      },
      onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) =>
        commitNode(element, event.target),
      onTransformEnd: (event: Konva.KonvaEventObject<Event>) =>
        commitNode(element, event.target)
    }

    if (element.type === 'IMAGE') {
      return (
        <CanvasImage
          key={element.id}
          element={{
            ...element,
            xMm: element.xMm + zoneDragDelta.xMm,
            yMm: element.yMm + zoneDragDelta.yMm
          }}
          scale={scale}
          selected={selectedId === element.id && !frameSelected && !printZoneSelected}
          onSelect={() => {
            setFrameSelected(false)
            setPrintZoneSelected(false)
            onSelect(element.id)
          }}
          onCommit={node => commitNode(element, node)}
          readOnly={readOnly}
        />
      )
    }

    return (
      <Text
        key={element.id}
        {...common}
        text={element.label}
        fill={element.fill ?? (garmentColor === '#f4f4f2' ? '#111214' : '#ffffff')}
        fontFamily={element.fontFamily ?? 'Inter, Arial, sans-serif'}
        fontStyle={
          element.type !== 'TEXT'
            ? 'normal'
            : (element.fontWeight ?? 800) >= 700 && element.fontStyle === 'italic'
              ? 'bold italic'
              : (element.fontWeight ?? 800) >= 700
                ? 'bold'
                : element.fontStyle === 'italic'
                  ? 'italic'
                  : 'normal'
        }
        fontSize={Math.max(16, height * .72)}
        align={element.textAlign ?? 'center'}
        letterSpacing={(element.letterSpacingMm ?? 0) * scale}
        lineHeight={element.lineHeight ?? 1}
        verticalAlign="middle"
        stroke={selectedId === element.id && !frameSelected && !printZoneSelected ? '#6c4dff' : undefined}
        strokeWidth={selectedId === element.id && !frameSelected && !printZoneSelected ? .8 : 0}
      />
    )
  }

  const garment = garmentPoints(profile, draft.productId.includes('hoodie'))
    .map(value => value * scale)

  return (
    <div ref={containerRef} className="konva-host">
      <div
        className="konva-stage-wrap"
        style={{
          width: stageWidth,
          height: stageHeight,
          transform: `translate(${panX}px, ${panY}px)`
        }}
      >
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          onMouseDown={event => {
            if (!readOnly && event.target === event.target.getStage()) {
              setFrameSelected(false)
              setPrintZoneSelected(false)
              onSelect(null)
            }
          }}
          onTouchStart={event => {
            if (!readOnly && event.target === event.target.getStage()) {
              setFrameSelected(false)
              setPrintZoneSelected(false)
              onSelect(null)
            }
          }}
        >
          <Layer listening={false}>
            <Line
              points={garment}
              closed
              fill={garmentColor}
              stroke={garmentColor === '#f4f4f2' ? '#c9c9c9' : '#303136'}
              strokeWidth={2}
              shadowColor="#000"
              shadowBlur={18}
              shadowOpacity={.18}
              shadowOffsetY={12}
            />

            {draft.productId.includes('hoodie') && draft.activeSide === 'FRONT' && (
              <Rect
                x={profile.garmentWidthMm * .31 * scale}
                y={profile.garmentHeightMm * .72 * scale}
                width={profile.garmentWidthMm * .38 * scale}
                height={profile.garmentHeightMm * .13 * scale}
                stroke={garmentColor === '#f4f4f2' ? '#c3c3c3' : '#4a4b50'}
                strokeWidth={2}
                cornerRadius={12}
              />
            )}


          </Layer>

          <Layer>
            {!readOnly && <>
              <Rect
                id="print-zone"
                x={zone.xMm * scale}
                y={zone.yMm * scale}
                width={zone.widthMm * scale}
                height={zone.heightMm * scale}
                fill="rgba(255,255,255,.012)"
                stroke={printZoneSelected ? '#ffb454' : '#858892'}
                strokeWidth={printZoneSelected ? 2.5 : 1.5}
                dash={printZoneSelected ? [] : [6, 7]}
                cornerRadius={8}
                draggable
                dragBoundFunc={pos => {
                  const minX = bodyBounds.leftMm * scale
                  const maxX = (bodyBounds.rightMm - zone.widthMm) * scale
                  const minY = bodyBounds.topMm * scale
                  const maxY = (bodyBounds.bottomMm - zone.heightMm) * scale
                  return {
                    x: Math.min(maxX, Math.max(minX, pos.x)),
                    y: Math.min(maxY, Math.max(minY, pos.y))
                  }
                }}
                onClick={() => {
                  setPrintZoneSelected(true)
                  setFrameSelected(false)
                  onSelect(null)
                }}
                onTap={() => {
                  setPrintZoneSelected(true)
                  setFrameSelected(false)
                  onSelect(null)
                }}
                onDragStart={() => {
                  setPrintZoneSelected(true)
                  setFrameSelected(false)
                  onSelect(null)
                }}
                onDragMove={event => {
                  setZoneDragDelta({
                    xMm: event.target.x() / scale - zone.xMm,
                    yMm: event.target.y() / scale - zone.yMm
                  })
                }}
                onDragEnd={event => commitPrintZoneMove(event.target as Konva.Rect)}
              />
              <Text
                x={(zone.xMm + zoneDragDelta.xMm) * scale + 7}
                y={(zone.yMm + zoneDragDelta.yMm) * scale + 7}
                text={printZoneSelected ? "PRINT ZONE · DRAG" : "PRINT ZONE"}
                fill={printZoneSelected ? '#ffcf8b' : '#a5a8b0'}
                fontSize={10}
                fontStyle={printZoneSelected ? 'bold' : 'normal'}
                listening={false}
              />

              <Rect
                ref={frameRef}
                id="placement-frame"
                x={previewPlacementMm.xMm * scale}
                y={previewPlacementMm.yMm * scale}
                width={placementMm.widthMm * scale}
                height={placementMm.heightMm * scale}
                fill="rgba(108,77,255,.035)"
                stroke="#8c78ff"
                strokeWidth={frameSelected ? 2.5 : 2}
                dash={frameSelected ? [] : [10, 6]}
                cornerRadius={8}
                draggable
                dragBoundFunc={pos => {
                  const widthPx = placementMm.widthMm * scale
                  const heightPx = placementMm.heightMm * scale
                  const minX = zone.xMm * scale
                  const minY = zone.yMm * scale
                  const maxX = (zone.xMm + zone.widthMm) * scale - widthPx
                  const maxY = (zone.yMm + zone.heightMm) * scale - heightPx
                  return {
                    x: Math.min(maxX, Math.max(minX, pos.x)),
                    y: Math.min(maxY, Math.max(minY, pos.y))
                  }
                }}
                onClick={() => {
                  setFrameSelected(true)
                  setPrintZoneSelected(false)
                  onSelect(null)
                }}
                onTap={() => {
                  setFrameSelected(true)
                  setPrintZoneSelected(false)
                  onSelect(null)
                }}
                onDragStart={() => {
                  setFrameSelected(true)
                  setPrintZoneSelected(false)
                  onSelect(null)
                }}
                onDragEnd={event => commitFrameMove(event.target as Konva.Rect)}
                onTransformEnd={event => commitFrameResize(event.target as Konva.Rect)}
              />
              <Text
                x={previewPlacementMm.xMm * scale + 8}
                y={previewPlacementMm.yMm * scale + 8}
                text="PLACEMENT"
                fill="#cfc5ff"
                fontSize={10}
                fontStyle="bold"
                listening={false}
              />
              <Transformer
                ref={frameTransformerRef}
                rotateEnabled={false}
                flipEnabled={false}
                keepRatio={false}
                enabledAnchors={[
                  'top-left', 'top-center', 'top-right',
                  'middle-left', 'middle-right',
                  'bottom-left', 'bottom-center', 'bottom-right'
                ]}
                anchorSize={11}
                anchorCornerRadius={5}
                borderStroke="#8c78ff"
                anchorFill="#ffffff"
                anchorStroke="#6c4dff"
                boundBoxFunc={(oldBox, newBox) => {
                  const zoneLeft = zone.xMm * scale
                  const zoneTop = zone.yMm * scale
                  const zoneRight = (zone.xMm + zone.widthMm) * scale
                  const zoneBottom = (zone.yMm + zone.heightMm) * scale

                  if (
                    newBox.width < 45 ||
                    newBox.height < 45 ||
                    newBox.x < zoneLeft ||
                    newBox.y < zoneTop ||
                    newBox.x + newBox.width > zoneRight ||
                    newBox.y + newBox.height > zoneBottom
                  ) {
                    return oldBox
                  }

                  return newBox
                }}
              />
            </>}

            {activeElements.map(renderElement)}

            {!readOnly && <Transformer
              ref={elementTransformerRef}
              rotateEnabled
              keepRatio={selectedElement?.type !== 'TEXT'}
              flipEnabled={false}
              anchorSize={12}
              anchorCornerRadius={6}
              borderStroke="#8c78ff"
              anchorFill="#ffffff"
              anchorStroke="#6c4dff"
              boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) {
                  return oldBox
                }
                return newBox
              }}
            />}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
