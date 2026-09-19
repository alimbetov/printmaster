import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type {
  Draft,
  DesignElement,
  PlacementFrameNormalized
} from './types'
import { getPrintProfile, products } from './mock'
import {
  frameContainsElements,
  getFrameForSide,
  movePlacementFrameWithDesign,
  normalizePlacementFrame
} from './placement'

type BodyPreset = 'STRAIGHT' | 'ATHLETIC' | 'CURVED' | 'FULL'

type BodyShape = {
  shoulders: number
  chest: number
  waist: number
  abdomen: number
  yaw: number
}

const presets: Record<BodyPreset, BodyShape> = {
  STRAIGHT: { shoulders: 50, chest: 42, waist: 40, abdomen: 38, yaw: 0 },
  ATHLETIC: { shoulders: 68, chest: 58, waist: 34, abdomen: 30, yaw: 0 },
  CURVED: { shoulders: 48, chest: 64, waist: 30, abdomen: 48, yaw: 0 },
  FULL: { shoulders: 55, chest: 62, waist: 55, abdomen: 70, yaw: 0 }
}

const BODY_PRINT_ENVELOPE = {
  leftPct: 23,
  topPct: 20,
  widthPct: 54,
  heightPct: 56
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

function elementStyle(
  element: DesignElement,
  draft: Draft,
  shape: BodyShape,
  reliefStrength: number
): CSSProperties {
  const profile = getPrintProfile(draft.productId, draft.size)
  const zone = element.side === 'FRONT' ? profile.front : profile.back

  const left = ((element.xMm - zone.xMm) / zone.widthMm) * 100
  const top = ((element.yMm - zone.yMm) / zone.heightMm) * 100
  const width = (element.widthMm / zone.widthMm) * 100
  const height = (element.heightMm / zone.heightMm) * 100

  const normalizedY = clamp((element.yMm - zone.yMm) / zone.heightMm, 0, 1)
  const chestInfluence = 1 - Math.min(1, Math.abs(normalizedY - .28) / .32)
  const abdomenInfluence = 1 - Math.min(1, Math.abs(normalizedY - .72) / .34)

  const bulge = (
    chestInfluence * (shape.chest - 40) * .0035 +
    abdomenInfluence * (shape.abdomen - 40) * .0032
  ) * reliefStrength

  const waistCompression =
    (1 - Math.min(1, Math.abs(normalizedY - .52) / .25)) *
    (40 - shape.waist) * .0026 * reliefStrength

  const surfaceScaleX = clamp(1 + bulge - waistCompression, .78, 1.28)
  const yawScale = Math.cos(Math.abs(shape.yaw) * Math.PI / 180)
  const perspectiveScaleX = clamp(yawScale, .72, 1)
  const skew = shape.yaw * -.12

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
    transform: `
      translate(-50%, -50%)
      rotate(${element.rotationDeg}deg)
      perspective(520px)
      rotateY(${shape.yaw}deg)
      skewX(${skew}deg)
      scaleX(${surfaceScaleX * perspectiveScaleX})
    `,
    transformOrigin: '50% 50%'
  }
}

function RenderBodyElement({
  element,
  draft,
  shape,
  reliefStrength
}: {
  element: DesignElement
  draft: Draft
  shape: BodyShape
  reliefStrength: number
}) {
  const style = elementStyle(element, draft, shape, reliefStrength)

  if (element.type === 'IMAGE') {
    return <img
      className="body-print-element body-print-image"
      src={element.imageDataUrl}
      alt=""
      style={style}
    />
  }

  return <div
    className="body-print-element body-print-text"
    style={{
      ...style,
      color: element.fill ?? '#fff',
      fontFamily: element.fontFamily,
      fontStyle: element.fontStyle,
      fontWeight: element.fontWeight,
      textAlign: element.textAlign,
      letterSpacing: `${(element.letterSpacingMm ?? 0) * .65}px`,
      lineHeight: element.lineHeight ?? 1,
      whiteSpace: 'pre-wrap'
    }}
  >
    {element.label}
  </div>
}

export default function BodyPreview3D({
  draft,
  garmentColor,
  onChange
}: {
  draft: Draft
  garmentColor: string
  onChange: (draft: Draft) => void
}) {
  const [preset, setPreset] = useState<BodyPreset>('STRAIGHT')
  const [shape, setShape] = useState<BodyShape>(presets.STRAIGHT)
  const [dragPreview, setDragPreview] = useState<PlacementFrameNormalized | null>(null)
  const dragPreviewRef = useRef<PlacementFrameNormalized | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    startClientX: number
    startClientY: number
    startFrame: PlacementFrameNormalized
  } | null>(null)

  const product = products.find(item => item.id === draft.productId) ?? products[0]
  const profile = getPrintProfile(draft.productId, draft.size)
  const zone = draft.activeSide === 'FRONT' ? profile.front : profile.back
  const canonicalFrame = getFrameForSide(draft, draft.activeSide)
  const visibleFrame = dragPreview ?? canonicalFrame

  useEffect(() => {
    setDragPreview(null)
    dragPreviewRef.current = null
    dragRef.current = null
  }, [draft.activeSide, draft.productId, draft.size])

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current
      const body = bodyRef.current
      if (!drag || !body) return

      const rect = body.getBoundingClientRect()
      const dxBodyPct = ((event.clientX - drag.startClientX) / rect.width) * 100
      const dyBodyPct = ((event.clientY - drag.startClientY) / rect.height) * 100

      const dxNormalized = dxBodyPct / BODY_PRINT_ENVELOPE.widthPct
      const dyNormalized = dyBodyPct / BODY_PRINT_ENVELOPE.heightPct

      const preview = normalizePlacementFrame({
        ...drag.startFrame,
        x: drag.startFrame.x + dxNormalized,
        y: drag.startFrame.y + dyNormalized
      })
      dragPreviewRef.current = preview
      setDragPreview(preview)
    }

    const up = () => {
      const preview = dragPreviewRef.current
      if (dragRef.current && preview) {
        onChange(movePlacementFrameWithDesign(
          draft,
          draft.activeSide,
          preview,
          zone
        ))
      }
      dragRef.current = null
      dragPreviewRef.current = null
      setDragPreview(null)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [draft, onChange, zone])

  const applyPreset = (next: BodyPreset) => {
    setPreset(next)
    setShape({ ...presets[next], yaw: shape.yaw })
  }

  const garmentReliefStrength = useMemo(() => {
    const typeFactor = product.type === 'TSHIRT' ? 1 : .48
    const fitFactor =
      product.fit === 'REGULAR' ? 1 :
      product.fit === 'RELAXED' ? .86 :
      .72
    const gsmFactor = clamp(1.15 - (product.gsm - 180) / 520, .55, 1.08)

    return clamp(typeFactor * fitFactor * gsmFactor, .22, 1.08)
  }, [product.fit, product.gsm, product.type])

  const activeElements = useMemo(
    () => draft.elements
      .filter(element => element.side === draft.activeSide)
      .sort((a, b) => a.zOrder - b.zOrder),
    [draft.activeSide, draft.elements]
  )

  const previewDxMm = (visibleFrame.x - canonicalFrame.x) * zone.widthMm
  const previewDyMm = (visibleFrame.y - canonicalFrame.y) * zone.heightMm
  const visibleElements = dragPreview
    ? activeElements.map(element => ({
        ...element,
        xMm: element.xMm + previewDxMm,
        yMm: element.yMm + previewDyMm
      }))
    : activeElements

  const shoulderWidth = 58 + shape.shoulders * .32
  const chestWidth = 52 + shape.chest * (.30 * garmentReliefStrength)
  const waistWidth = 50 + shape.waist * (.22 * (.72 + garmentReliefStrength * .28))
  const abdomenWidth = 49 + shape.abdomen * (.28 * garmentReliefStrength)

  const torsoClip = `polygon(
    ${50 - shoulderWidth / 2}% 5%,
    ${50 + shoulderWidth / 2}% 5%,
    ${50 + chestWidth / 2}% 31%,
    ${50 + waistWidth / 2}% 58%,
    ${50 + abdomenWidth / 2}% 82%,
    72% 98%,
    28% 98%,
    ${50 - abdomenWidth / 2}% 82%,
    ${50 - waistWidth / 2}% 58%,
    ${50 - chestWidth / 2}% 31%
  )`

  const chestShadow = clamp((shape.chest - 25) / 75, 0, 1) * garmentReliefStrength
  const abdomenShadow = clamp((shape.abdomen - 25) / 75, 0, 1) * garmentReliefStrength

  const frameBodyStyle: CSSProperties = {
    left: `${BODY_PRINT_ENVELOPE.leftPct + visibleFrame.x * BODY_PRINT_ENVELOPE.widthPct}%`,
    top: `${BODY_PRINT_ENVELOPE.topPct + visibleFrame.y * BODY_PRINT_ENVELOPE.heightPct}%`,
    width: `${visibleFrame.width * BODY_PRINT_ENVELOPE.widthPct}%`,
    height: `${visibleFrame.height * BODY_PRINT_ENVELOPE.heightPct}%`
  }

  const resizeFrame = (
    patch: Partial<Pick<PlacementFrameNormalized, 'width' | 'height'>>
  ) => {
    const next = normalizePlacementFrame({
      ...canonicalFrame,
      ...patch
    })

    if (!frameContainsElements(next, zone, activeElements)) {
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

  return <div className="body-preview-layout">
    <div className="body-stage">
      <div className="body-perspective">
        <div
          ref={bodyRef}
          className="body-model"
          style={{
            transform: `rotateY(${shape.yaw}deg)`,
            clipPath: torsoClip,
            background: `
              radial-gradient(ellipse at 38% 30%, rgba(255,255,255,${.05 + chestShadow * .18}) 0 9%, transparent 29%),
              radial-gradient(ellipse at 62% 30%, rgba(0,0,0,${.06 + chestShadow * .15}) 0 10%, transparent 31%),
              radial-gradient(ellipse at 52% 72%, rgba(255,255,255,${.03 + abdomenShadow * .12}) 0 10%, transparent 34%),
              radial-gradient(ellipse at 70% 68%, rgba(0,0,0,${.05 + abdomenShadow * .16}) 0 11%, transparent 36%),
              linear-gradient(90deg, rgba(0,0,0,.24), transparent 19%, rgba(255,255,255,.10) 48%, transparent 72%, rgba(0,0,0,.30)),
              ${garmentColor}
            `
          }}
        >
          <div className="body-neck"/>

          <div
            className="body-relief-frame"
            style={frameBodyStyle}
            onPointerDown={event => {
              event.preventDefault()
              dragRef.current = {
                startClientX: event.clientX,
                startClientY: event.clientY,
                startFrame: canonicalFrame
              }
              dragPreviewRef.current = canonicalFrame
              setDragPreview(canonicalFrame)
            }}
          >
            <span className="body-relief-label">PLACEMENT</span>
            <i className="relief-line relief-chest">Chest</i>
            <i className="relief-line relief-waist">Waist</i>
            <i className="relief-line relief-abdomen">Abdomen</i>
          </div>

          <div
            className="body-print-surface"
            style={{
              left: `${BODY_PRINT_ENVELOPE.leftPct}%`,
              top: `${BODY_PRINT_ENVELOPE.topPct}%`,
              width: `${BODY_PRINT_ENVELOPE.widthPct}%`,
              height: `${BODY_PRINT_ENVELOPE.heightPct}%`
            }}
          >
            {visibleElements.map(element =>
              <RenderBodyElement
                key={element.id}
                element={element}
                draft={draft}
                shape={shape}
                reliefStrength={garmentReliefStrength}
              />
            )}
          </div>
          <div className="body-fabric-highlight"/>
        </div>
      </div>
      <div className="body-floor-shadow"/>
      <div className="body-preview-note">
        Same Placement Frame as Flat · {product.type === 'HOODIE' ? 'hoodie smooths body relief' : 'tee follows body relief more closely'}
      </div>
    </div>

    <div className="body-controls">
      <div className="body-control-section garment-relief-summary">
        <b>Garment relief response</b>
        <div className="relief-meter">
          <i style={{ width: `${Math.round(garmentReliefStrength * 92)}%` }}/>
        </div>
        <small>
          {product.name} · {product.gsm} GSM · {product.fit.toLowerCase()} fit · relief response {Math.round(garmentReliefStrength * 100)}%
        </small>
      </div>

      <div className="body-control-section">
        <b>Body preset</b>
        <div className="body-preset-grid">
          {(Object.keys(presets) as BodyPreset[]).map(item =>
            <button
              key={item}
              className={preset === item ? 'active' : ''}
              onClick={() => applyPreset(item)}
            >
              {item === 'STRAIGHT' ? 'Straight' :
               item === 'ATHLETIC' ? 'Athletic' :
               item === 'CURVED' ? 'Curved' : 'Full'}
            </button>
          )}
        </div>
      </div>

      {([
        ['Shoulders', 'shoulders'],
        ['Chest', 'chest'],
        ['Waist', 'waist'],
        ['Abdomen', 'abdomen']
      ] as const).map(([label, key]) =>
        <label className="body-slider" key={key}>
          <span><b>{label}</b><i>{shape[key]}</i></span>
          <input
            type="range"
            min="20"
            max="85"
            value={shape[key]}
            onChange={event => setShape(current => ({
              ...current,
              [key]: Number(event.target.value)
            }))}
          />
        </label>
      )}

      <div className="body-control-section body-frame-controls">
        <b>Unified Placement Frame</b>
        <small>
          Drag it on the body or resize it here. The same canonical frame is shown in Flat mode.
        </small>

        <label className="body-slider">
          <span><b>Frame width</b><i>{Math.round(canonicalFrame.width * 100)}%</i></span>
          <input
            type="range"
            min="10"
            max="100"
            value={Math.round(canonicalFrame.width * 100)}
            onChange={event => resizeFrame({
              width: Number(event.target.value) / 100
            })}
          />
        </label>

        <label className="body-slider">
          <span><b>Frame height</b><i>{Math.round(canonicalFrame.height * 100)}%</i></span>
          <input
            type="range"
            min="10"
            max="100"
            value={Math.round(canonicalFrame.height * 100)}
            onChange={event => resizeFrame({
              height: Number(event.target.value) / 100
            })}
          />
        </label>

        <button
          className="body-reset"
          onClick={() => {
            const next = normalizePlacementFrame({
              x: .08,
              y: .08,
              width: .84,
              height: .84
            })
            if (!frameContainsElements(next, zone, activeElements)) {
              alert('Default placement frame would exclude current elements. Move or resize the design first.')
              return
            }
            onChange(movePlacementFrameWithDesign(
              draft,
              draft.activeSide,
              next,
              zone
            ))
          }}
        >
          Reset placement frame
        </button>
      </div>

      <label className="body-slider">
        <span><b>Rotate body</b><i>{shape.yaw}°</i></span>
        <input
          type="range"
          min="-32"
          max="32"
          value={shape.yaw}
          onChange={event => setShape(current => ({
            ...current,
            yaw: Number(event.target.value)
          }))}
        />
      </label>

      <button
        className="body-reset"
        onClick={() => {
          setPreset('STRAIGHT')
          setShape(presets.STRAIGHT)
        }}
      >
        Reset body
      </button>
    </div>
  </div>
}
