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
import type { Draft, DesignElement, MockPrintProfile } from './types'
import { printProfiles } from './mock'

type Props = {
  draft: Draft
  garmentColor: string
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (draft: Draft) => void
  readOnly?: boolean
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
  readOnly = false
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [viewport, setViewport] = useState({ width: 600, height: 700 })

  const profile = printProfiles[draft.productId] ?? printProfiles['hoodie-basic']
  const zone = draft.activeSide === 'FRONT' ? profile.front : profile.back

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

  const scale = useMemo(() => {
    const horizontal = (viewport.width - 32) / profile.garmentWidthMm
    const vertical = (viewport.height - 32) / profile.garmentHeightMm
    return Math.max(0.25, Math.min(horizontal, vertical, 1.05))
  }, [profile, viewport])

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
    const transformer = transformerRef.current
    const stage = stageRef.current
    if (!transformer || !stage) return

    if (!selectedId) {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
      return
    }

    const node = stage.findOne(`#element-${selectedId}`)
    transformer.nodes(node ? [node] : [])
    transformer.getLayer()?.batchDraw()
  }, [selectedId, activeElements, scale])

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

  const renderElement = (element: DesignElement) => {
    const width = element.widthMm * scale
    const height = element.heightMm * scale
    const common = {
      id: `element-${element.id}`,
      x: element.xMm * scale,
      y: element.yMm * scale,
      width,
      height,
      offsetX: width / 2,
      offsetY: height / 2,
      rotation: element.rotationDeg,
      draggable: !readOnly,
      onClick: readOnly ? undefined : () => onSelect(element.id),
      onTap: readOnly ? undefined : () => onSelect(element.id),
      onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) =>
        commitNode(element, event.target),
      onTransformEnd: (event: Konva.KonvaEventObject<Event>) =>
        commitNode(element, event.target)
    }

    if (element.type === 'IMAGE') {
      return (
        <CanvasImage
          key={element.id}
          element={element}
          scale={scale}
          selected={selectedId === element.id}
          onSelect={() => onSelect(element.id)}
          onCommit={node => commitNode(element, node)}
          readOnly={readOnly}
        />
      )
    }

    return (
      <Text
        key={element.id}
        {...common}
        text={element.type === 'STICKER' ? element.label : element.label}
        fill={element.fill ?? (garmentColor === '#f4f4f2' ? '#111214' : '#ffffff')}
        fontFamily="Inter, Arial, sans-serif"
        fontStyle={element.type === 'TEXT' ? 'bold' : 'normal'}
        fontSize={Math.max(16, height * .72)}
        align="center"
        verticalAlign="middle"
        stroke={selectedId === element.id ? '#6c4dff' : undefined}
        strokeWidth={selectedId === element.id ? .8 : 0}
      />
    )
  }

  const garment = garmentPoints(profile, draft.productId.includes('hoodie'))
    .map(value => value * scale)

  return (
    <div ref={containerRef} className="konva-host">
      <div className="konva-stage-wrap" style={{ width: stageWidth, height: stageHeight }}>
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          onMouseDown={event => {
            if (!readOnly && event.target === event.target.getStage()) onSelect(null)
          }}
          onTouchStart={event => {
            if (!readOnly && event.target === event.target.getStage()) onSelect(null)
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
            {!readOnly && <Rect
              x={zone.xMm * scale}
              y={zone.yMm * scale}
              width={zone.widthMm * scale}
              height={zone.heightMm * scale}
              stroke="#8c78ff"
              strokeWidth={2}
              dash={[8, 7]}
              cornerRadius={8}
              opacity={.72}
            />}
          </Layer>

          <Layer>
            {activeElements.map(renderElement)}
            {!readOnly && <Transformer
              ref={transformerRef}
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
