import { ChangeEvent, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EditorCanvas from './EditorCanvas'
import BodyPreview3D from './BodyPreview3D'
import type {
  ApprovedDesign,
  DesignElement,
  Draft,
  Locale,
  Side,
  Size
} from './types'
import {
  createDraft,
  fontCatalog,
  formatKzt,
  getDraftStatus,
  getPreflightIssues,
  getPrintProfile,
  getSidesInUse,
  products,
  readStoredJson
} from './mock'
import i18n from './i18n'

const LOCAL_IMAGE_BUDGET_CHARS = 1_500_000

const normalizeDraft = (draft: Draft): Draft => {
  const next = { ...draft, elements: draft.elements.map(element => ({ ...element })) }

  for (const side of ['FRONT', 'BACK'] as Side[]) {
    const ordered = next.elements
      .filter(element => element.side === side)
      .sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0))

    ordered.forEach((element, index) => {
      element.zOrder = index + 1
    })
  }

  return next
}

function App() {
  const [draft, setDraft] = useState<Draft>(() => {
    const stored = readStoredJson<Draft>('pm-draft')
    return stored ? normalizeDraft(stored) : createDraft()
  })
  const [approved, setApproved] = useState<ApprovedDesign | null>(() => {
    const stored = readStoredJson<ApprovedDesign>('pm-approved')
    return stored ? { ...stored, draft: normalizeDraft(stored.draft) } : null
  })

  const updateDraft = (next: Draft) => {
    const normalized = normalizeDraft({
      ...next,
      status: getDraftStatus(next)
    })
    setDraft(normalized)
    try {
      localStorage.setItem('pm-draft', JSON.stringify(normalized))
    } catch {
      // Image-heavy drafts may exceed localStorage. Backend/object storage replaces this later.
    }
  }

  const approve = () => {
    const snapshot: ApprovedDesign = {
      approvedAt: new Date().toISOString(),
      draft: JSON.parse(JSON.stringify(draft)) as Draft
    }
    setApproved(snapshot)
    try {
      localStorage.setItem('pm-approved', JSON.stringify(snapshot))
    } catch {
      localStorage.removeItem('pm-approved')
      alert('The design is approved for this session, but the browser could not persist the image-heavy snapshot. Keep this tab open until checkout.')
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Catalog />} />
      <Route path="/products/:id" element={<ProductPage draft={draft} onDraft={updateDraft} />} />
      <Route path="/editor" element={<Editor draft={draft} onDraft={updateDraft} />} />
      <Route path="/check" element={<DesignCheck draft={draft} />} />
      <Route path="/preview" element={<FinalPreview draft={draft} onApprove={approve} />} />
      <Route path="/cart" element={<Cart approved={approved} />} />
      <Route path="/checkout" element={<Checkout approved={approved} />} />
      <Route path="/order" element={<OrderDone />} />
    </Routes>
  )
}

function Header() {
  const { t } = useTranslation()
  return <header className="topbar">
    <Link className="brand" to="/">PRINTMASTER</Link>
    <nav className="nav">
      <Link to="/editor">{t('create')}</Link>
      <Link to="/products">{t('shop')}</Link>
      <Link to="/cart">{t('cart')}</Link>
    </nav>
    <LanguageSwitch />
  </header>
}

function LanguageSwitch() {
  const locale = i18n.language as Locale
  const change = (next: Locale) => {
    localStorage.setItem('pm-locale', next)
    i18n.changeLanguage(next)
    document.documentElement.lang = next.split('-')[0]
  }

  return <select
    className="locale"
    value={locale}
    onChange={event => change(event.target.value as Locale)}
    aria-label="Language"
  >
    <option value="ru-KZ">RU</option>
    <option value="kk-KZ">KZ</option>
    <option value="en-US">EN</option>
  </select>
}

function Home() {
  const { t } = useTranslation()

  return <><Header/><main>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">CREATE • REMIX • WEAR</span>
        <h1>{t('hero')}</h1>
        <p>{t('heroSub')}</p>
        <div className="actions">
          <Link className="btn primary" to="/editor">{t('createYours')}</Link>
          <Link className="btn secondary" to="/products">{t('browse')}</Link>
        </div>
      </div>
      <GarmentVisual type="HOODIE" color="#171717" text="ALMATY" />
    </section>

    <section className="section">
      <div className="section-head">
        <h2>{t('vibes')}</h2>
        <span>{t('vibesHint')}</span>
      </div>
      <div className="vibes">
        {['Street', 'Minimal', 'Local', 'Sport'].map((vibe, index) =>
          <Link to="/editor" className={"vibe vibe-" + index} key={vibe}>
            <b>{vibe}</b>
            <span>{t('tapToRemix')}</span>
          </Link>
        )}
      </div>
    </section>
  </main></>
}

function Catalog() {
  const { t } = useTranslation()

  return <><Header/><main className="page">
    <div className="page-title"><div><span className="eyebrow">SHOP</span><h1>{t('shop')}</h1></div></div>
    <div className="product-grid">
      {products.map(product =>
        <article className="product-card" key={product.id}>
          <GarmentVisual
            type={product.type}
            color={product.colors[0].hex}
            text={product.type === 'HOODIE' ? 'MAKE IT' : 'YOUR ART'}
            compact
          />
          <h3>{product.name}</h3>
          <div className="product-card-meta">
            <span>{product.collection}</span>
            <span>{product.fit}</span>
            <span>{product.gsm} GSM</span>
          </div>
          <div className="catalog-swatches">
            {product.colors.map(color => <i key={color.code} title={color.name} style={{ background: color.hex }}/>)}
          </div>
          <p>{t(product.descriptionKey)}</p>
          <div className="card-row">
            <b>{formatKzt(product.price, i18n.language)}</b>
            <Link className="btn small primary" to={"/products/" + product.id}>
              {t('customize')}
            </Link>
          </div>
        </article>
      )}
    </div>
  </main></>
}

function ProductPage({ draft, onDraft }: { draft: Draft, onDraft: (draft: Draft) => void }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const product = products.find(item => item.id === id) ?? products[0]
  const [color, setColor] = useState(
    draft.productId === product.id && product.colors.some(item => item.code === draft.color)
      ? draft.color
      : product.colors[0].code
  )
  const [size, setSize] = useState<Size>(draft.productId === product.id ? draft.size : 'L')
  const chosen = product.colors.find(item => item.code === color) ?? product.colors[0]

  const customize = () => {
    onDraft({ ...createDraft(product.id, size), color })
    navigate('/editor')
  }

  return <><Header/><main className="product-page">
    <div className="product-stage">
      <GarmentVisual type={product.type} color={chosen.hex} text="YOUR ART"/>
    </div>
    <div className="product-info">
      <span className="eyebrow">{product.type}</span>
      <h1>{product.name}</h1>
      <p>{t(product.descriptionKey)}</p>
      <div className="product-meta">
        <span>{product.collection}</span>
        <span>{product.fit}</span>
        <span>{product.gsm} GSM</span>
        <span>{product.material}</span>
      </div>

      <h4>{t('color')}</h4>
      <div className="chips">
        {product.colors.map(item =>
          <button
            key={item.code}
            className={"chip " + (color === item.code ? 'selected' : '')}
            onClick={() => setColor(item.code)}
          >
            <i style={{ background: item.hex }}/>
            {item.name}
          </button>
        )}
      </div>

      <h4>{t('size')}</h4>
      <div className="chips">
        {product.sizes.map(item =>
          <button
            key={item}
            className={"chip " + (size === item ? 'selected' : '')}
            onClick={() => setSize(item)}
          >
            {item}
          </button>
        )}
      </div>

      <div className="price">{formatKzt(product.price, i18n.language)}</div>
      <button className="btn primary full" onClick={customize}>{t('customize')}</button>
    </div>
  </main></>
}

function Editor({ draft, onDraft }: { draft: Draft, onDraft: (draft: Draft) => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const product = products.find(item => item.id === draft.productId) ?? products[1]
  const garmentColor = product.colors.find(item => item.code === draft.color)?.hex ?? '#171717'
  const profile = getPrintProfile(draft.productId, draft.size)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<'ADD' | 'STYLE' | 'LAYERS' | null>(null)
  const [zoom, setZoom] = useState(1)
  const [viewMode, setViewMode] = useState<'FLAT' | 'BODY_3D'>('FLAT')

  const selected = draft.elements.find(element => element.id === selectedId) ?? null
  const activeElements = draft.elements
    .filter(element => element.side === draft.activeSide)
    .sort((a, b) => a.zOrder - b.zOrder)
  const status = getDraftStatus(draft)
  const issues = getPreflightIssues(draft)

  const commit = (next: Draft) => onDraft({
    ...next,
    status: getDraftStatus(next)
  })

  const updateElement = (id: string, patch: Partial<DesignElement>) => {
    commit({
      ...draft,
      elements: draft.elements.map(element =>
        element.id === id ? { ...element, ...patch } : element
      )
    })
  }

  const zone = draft.activeSide === 'FRONT' ? profile.front : profile.back
  const maxZ = Math.max(0, ...draft.elements.map(element => element.zOrder))

  const addText = () => {
    const id = crypto.randomUUID()
    commit({
      ...draft,
      elements: [...draft.elements, {
        id,
        type: 'TEXT',
        label: 'YOUR TEXT',
        side: draft.activeSide,
        xMm: zone.xMm + zone.widthMm / 2,
        yMm: zone.yMm + zone.heightMm / 2,
        widthMm: Math.min(150, zone.widthMm * .72),
        heightMm: 42,
        rotationDeg: 0,
        zOrder: maxZ + 1,
        fill: garmentColor === '#f4f4f2' ? '#111214' : '#ffffff',
        fontFamily: fontCatalog[0].family,
        fontStyle: 'normal',
        fontWeight: 800,
        textAlign: 'center',
        letterSpacingMm: 0,
        lineHeight: 1
      }]
    })
    setSelectedId(id)
    setSheet('STYLE')
  }

  const addSticker = () => {
    const id = crypto.randomUUID()
    commit({
      ...draft,
      elements: [...draft.elements, {
        id,
        type: 'STICKER',
        label: '★',
        side: draft.activeSide,
        xMm: zone.xMm + zone.widthMm / 2,
        yMm: zone.yMm + zone.heightMm / 2,
        widthMm: 70,
        heightMm: 70,
        rotationDeg: 0,
        zOrder: maxZ + 1,
        fill: '#8c78ff'
      }]
    })
    setSelectedId(id)
    setSheet('STYLE')
  }

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !file.type.startsWith('image/')) return

    if (file.size > 900_000) {
      alert('For this local mock editor use an image smaller than 900 KB. Backend object storage will remove this temporary limit later.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      const dataUrl = reader.result

      const existingImageChars = draft.elements.reduce(
        (sum, element) => sum + (element.imageDataUrl?.length ?? 0),
        0
      )

      if (existingImageChars + dataUrl.length > LOCAL_IMAGE_BUDGET_CHARS) {
        alert('The local mock editor has reached its temporary image-storage limit. Remove another image or use a smaller file.')
        return
      }

      const image = new Image()
      image.onload = () => {
        const id = crypto.randomUUID()
        const maxWidthMm = Math.min(150, zone.widthMm * .7)
        const maxHeightMm = zone.heightMm * .7
        const sourceWidth = Math.max(image.naturalWidth, 1)
        const sourceHeight = Math.max(image.naturalHeight, 1)
        const fitScale = Math.min(
          maxWidthMm / sourceWidth,
          maxHeightMm / sourceHeight
        )
        const widthMm = sourceWidth * fitScale
        const heightMm = sourceHeight * fitScale

        commit({
          ...draft,
          elements: [...draft.elements, {
            id,
            type: 'IMAGE',
            label: file.name,
            side: draft.activeSide,
            xMm: zone.xMm + zone.widthMm / 2,
            yMm: zone.yMm + zone.heightMm / 2,
            widthMm,
            heightMm,
            rotationDeg: 0,
            zOrder: maxZ + 1,
            imageDataUrl: dataUrl,
            sourceWidthPx: image.naturalWidth,
            sourceHeightPx: image.naturalHeight
          }]
        })
        setSelectedId(id)
        setSheet('STYLE')
      }
      image.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const removeSelected = () => {
    if (!selected) return
    commit({
      ...draft,
      elements: draft.elements.filter(element => element.id !== selected.id)
    })
    setSelectedId(null)
  }

  const duplicateSelected = () => {
    if (!selected) return
    const id = crypto.randomUUID()
    commit({
      ...draft,
      elements: [...draft.elements, {
        ...selected,
        id,
        xMm: selected.xMm + 10,
        yMm: selected.yMm + 10,
        zOrder: maxZ + 1
      }]
    })
    setSelectedId(id)
  }

  const centerSelected = () => {
    if (!selected) return
    updateElement(selected.id, {
      xMm: zone.xMm + zone.widthMm / 2,
      yMm: zone.yMm + zone.heightMm / 2
    })
  }

  const moveLayer = (direction: 1 | -1) => {
    if (!selected) return

    const ordered = draft.elements
      .filter(element => element.side === draft.activeSide)
      .sort((a, b) => a.zOrder - b.zOrder)

    const index = ordered.findIndex(element => element.id === selected.id)
    const targetIndex = index + direction
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return

    const target = ordered[targetIndex]

    commit({
      ...draft,
      elements: draft.elements.map(element => {
        if (element.id === selected.id) return { ...element, zOrder: target.zOrder }
        if (element.id === target.id) return { ...element, zOrder: selected.zOrder }
        return element
      })
    })
  }

  const setSide = (side: Side) => {
    setSelectedId(null)
    commit({ ...draft, activeSide: side })
  }

  const goPreview = () => {
    navigate(status === 'BLOCKED' || status === 'DRAFT' ? '/check' : '/preview')
  }

  return <div className="editor-shell">
    <div className="editor-top">
      <Link className="brand" to="/">PRINTMASTER</Link>
      <button className="variant-pill" onClick={() => navigate('/products/' + product.id)}>
        {product.name} · {draft.size}
      </button>
      <div className="side-switch">
        <button className={draft.activeSide === 'FRONT' ? 'active' : ''} onClick={() => setSide('FRONT')}>
          {t('front')}
        </button>
        <button className={draft.activeSide === 'BACK' ? 'active' : ''} onClick={() => setSide('BACK')}>
          {t('back')}
        </button>
      </div>
      <StatusButton status={status} onClick={() => navigate('/check')} />
      <button className="btn primary small" onClick={goPreview}>{t('preview')}</button>
      <LanguageSwitch/>
    </div>

    <div className="editor-main">
      <aside className="desktop-rail">
        <button onClick={() => setSheet('ADD')}>＋<span>{t('add')}</span></button>
        <button onClick={() => setSheet('STYLE')}>◐<span>{t('style')}</span></button>
        <button onClick={() => setSheet('LAYERS')}>▱<span>{t('layers')}</span></button>
      </aside>

      <section className="canvas-area">
        <div className="canvas-mode-switch">
          <button
            className={viewMode === 'FLAT' ? 'active' : ''}
            onClick={() => setViewMode('FLAT')}
          >
            Flat
          </button>
          <button
            className={viewMode === 'BODY_3D' ? 'active' : ''}
            onClick={() => {
              setSelectedId(null)
              setViewMode('BODY_3D')
            }}
          >
            Body 3D
          </button>
        </div>

        {viewMode === 'FLAT' ? <>
          <EditorCanvas
            draft={draft}
            garmentColor={garmentColor}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={commit}
            zoom={zoom}
          />
          <div className="canvas-zoom">
            <button onClick={() => setZoom(value => Math.max(.65, Number((value - .15).toFixed(2))))}>−</button>
            <button onClick={() => setZoom(1)}>Fit</button>
            <button onClick={() => setZoom(value => Math.min(1.6, Number((value + .15).toFixed(2))))}>＋</button>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          {selected && <div className="measure">
            {(selected.widthMm / 10).toFixed(1)} × {(selected.heightMm / 10).toFixed(1)} cm
          </div>}
        </> : <BodyPreview3D
          draft={draft}
          garmentColor={garmentColor}
        />}
      </section>

      <aside className="context-panel">
        <span className="eyebrow">{t('estimate')}</span>
        <h3>{formatKzt(product.price, i18n.language)}</h3>

        <GarmentVariantPicker
          product={product}
          color={draft.color}
          size={draft.size}
          onColor={color => commit({ ...draft, color })}
          onSize={size => commit({ ...draft, size })}
        />

        <div className="mini-card">
          <b>{t('designCheck')}</b>
          <StatusInline status={status} />
          {issues.length > 0 && <small>{issues.length} issue(s)</small>}
        </div>

        <EditorInspector
          selected={selected}
          zoneCenter={{
            xMm: zone.xMm + zone.widthMm / 2,
            yMm: zone.yMm + zone.heightMm / 2
          }}
          onUpdate={patch => selected && updateElement(selected.id, patch)}
          onDelete={removeSelected}
          onDuplicate={duplicateSelected}
          onCenter={centerSelected}
          onLayerUp={() => moveLayer(1)}
          onLayerDown={() => moveLayer(-1)}
        />

        <LayerList
          elements={activeElements}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>
    </div>

    <div className="mobile-dock">
      <button onClick={() => setSheet('ADD')}>＋<span>{t('add')}</span></button>
      <button onClick={() => setSheet('STYLE')}>◐<span>{t('style')}</span></button>
      <button onClick={goPreview}>◫<span>{t('preview')}</span></button>
    </div>

    {sheet && <div className="sheet-backdrop" onClick={() => setSheet(null)}>
      <div className="bottom-sheet" onClick={event => event.stopPropagation()}>
        <div className="sheet-handle"/>
        <div className="sheet-head">
          <h3>{sheet === 'ADD' ? t('add') : sheet === 'LAYERS' ? t('layers') : t('style')}</h3>
          <button onClick={() => setSheet(null)}>✕</button>
        </div>

        {sheet === 'ADD' && <div className="sheet-grid">
          <label className="sheet-action">
            ▧<b>{t('image')}</b>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadImage} hidden/>
          </label>
          <button onClick={addText}>T<b>{t('text')}</b></button>
          <button onClick={addSticker}>★<b>{t('sticker')}</b></button>
          <button onClick={() => setSheet('LAYERS')}>▱<b>{t('layers')}</b></button>
        </div>}

        {sheet === 'STYLE' && <>
          <GarmentVariantPicker
            product={product}
            color={draft.color}
            size={draft.size}
            onColor={color => commit({ ...draft, color })}
            onSize={size => commit({ ...draft, size })}
          />
          <EditorInspector
            selected={selected}
            zoneCenter={{
              xMm: zone.xMm + zone.widthMm / 2,
              yMm: zone.yMm + zone.heightMm / 2
            }}
            onUpdate={patch => selected && updateElement(selected.id, patch)}
            onDelete={removeSelected}
            onDuplicate={duplicateSelected}
            onCenter={centerSelected}
            onLayerUp={() => moveLayer(1)}
            onLayerDown={() => moveLayer(-1)}
          />
          <button className="btn secondary full" onClick={() => setSheet('LAYERS')}>
            {t('layers')}
          </button>
        </>}

        {sheet === 'LAYERS' && <LayerList
          elements={activeElements}
          selectedId={selectedId}
          onSelect={id => {
            setSelectedId(id)
            setSheet('STYLE')
          }}
        />}
      </div>
    </div>}
  </div>
}

function GarmentVariantPicker({
  product,
  color,
  size,
  onColor,
  onSize
}: {
  product: (typeof products)[number]
  color: string
  size: Size
  onColor: (color: string) => void
  onSize: (size: Size) => void
}) {
  const { t } = useTranslation()

  return <div className="garment-color-picker">
    <div className="inspector-head">
      <b>{t('color')}</b>
      <span>{product.colors.find(item => item.code === color)?.name ?? color}</span>
    </div>
    <div className="color-swatches">
      {product.colors.map(item =>
        <button
          key={item.code}
          type="button"
          className={color === item.code ? 'active' : ''}
          title={item.name}
          aria-label={item.name}
          onClick={() => onColor(item.code)}
        >
          <i style={{ background: item.hex }}/>
        </button>
      )}
    </div>

    <div className="variant-size-row">
      <b>{t('size')}</b>
      <div className="variant-size-chips">
        {product.sizes.map(item =>
          <button
            key={item}
            type="button"
            className={size === item ? 'active' : ''}
            onClick={() => onSize(item)}
          >
            {item}
          </button>
        )}
      </div>
    </div>
  </div>
}

function EditorInspector({
  selected,
  zoneCenter,
  onUpdate,
  onDelete,
  onDuplicate,
  onCenter,
  onLayerUp,
  onLayerDown
}: {
  selected: DesignElement | null
  zoneCenter: { xMm: number, yMm: number }
  onUpdate: (patch: Partial<DesignElement>) => void
  onDelete: () => void
  onDuplicate: () => void
  onCenter: () => void
  onLayerUp: () => void
  onLayerDown: () => void
}) {
  const { t } = useTranslation()

  if (!selected) {
    return <div className="mini-card inspector-empty">
      <b>{t('style')}</b>
      <span>Select an element on the garment.</span>
    </div>
  }

  return <div className="inspector">
    <div className="inspector-head">
      <b>{selected.type}</b>
      <span>{(selected.widthMm / 10).toFixed(1)} × {(selected.heightMm / 10).toFixed(1)} cm</span>
    </div>

    {selected.type === 'TEXT' && <>
      <label>
        {t('text')}
        <textarea
          rows={2}
          value={selected.label}
          onChange={event => onUpdate({ label: event.target.value })}
        />
      </label>

      <label>
        Font
        <select
          value={selected.fontFamily ?? fontCatalog[0].family}
          onChange={event => onUpdate({ fontFamily: event.target.value })}
        >
          {fontCatalog.map(font =>
            <option key={font.id} value={font.family}>{font.name} · {font.category}</option>
          )}
        </select>
      </label>

      <div className="text-style-grid">
        <label>Weight
          <select
            value={selected.fontWeight ?? 800}
            onChange={event => onUpdate({ fontWeight: Number(event.target.value) as 400 | 600 | 700 | 800 | 900 })}
          >
            <option value="400">Regular</option>
            <option value="600">Semi</option>
            <option value="700">Bold</option>
            <option value="800">Extra</option>
            <option value="900">Black</option>
          </select>
        </label>
        <label>Style
          <select
            value={selected.fontStyle ?? 'normal'}
            onChange={event => onUpdate({ fontStyle: event.target.value as 'normal' | 'italic' })}
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </label>
        <label>Align
          <select
            value={selected.textAlign ?? 'center'}
            onChange={event => onUpdate({ textAlign: event.target.value as 'left' | 'center' | 'right' })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label>Spacing mm
          <input
            type="number"
            min="-1"
            max="10"
            step=".2"
            value={selected.letterSpacingMm ?? 0}
            onChange={event => onUpdate({ letterSpacingMm: Number(event.target.value) })}
          />
        </label>
        <label>Line height
          <input
            type="number"
            min=".8"
            max="2"
            step=".1"
            value={selected.lineHeight ?? 1}
            onChange={event => onUpdate({ lineHeight: Number(event.target.value) })}
          />
        </label>
      </div>
    </>}

    {(selected.type === 'TEXT' || selected.type === 'STICKER') && <label>
      {t('color')}
      <input
        type="color"
        value={selected.fill ?? '#ffffff'}
        onChange={event => onUpdate({ fill: event.target.value })}
      />
    </label>}

    <div className="number-grid">
      <label>W cm<input
        type="number"
        min="1"
        step=".1"
        value={(selected.widthMm / 10).toFixed(1)}
        onChange={event => onUpdate({ widthMm: Math.max(10, Number(event.target.value) * 10) })}
      /></label>
      <label>H cm<input
        type="number"
        min="1"
        step=".1"
        value={(selected.heightMm / 10).toFixed(1)}
        onChange={event => onUpdate({ heightMm: Math.max(10, Number(event.target.value) * 10) })}
      /></label>
      <label>°<input
        type="number"
        step="1"
        value={selected.rotationDeg}
        onChange={event => onUpdate({ rotationDeg: Number(event.target.value) })}
      /></label>
    </div>

    <div className="inspector-actions">
      <button onClick={onCenter}>◎ Center</button>
      <button onClick={onDuplicate}>⧉ Duplicate</button>
      <button onClick={onLayerUp}>↑ Layer</button>
      <button onClick={onLayerDown}>↓ Layer</button>
      <button className="danger-action" onClick={onDelete}>Delete</button>
    </div>
    <small className="muted">Center: {zoneCenter.xMm.toFixed(0)} / {zoneCenter.yMm.toFixed(0)} mm</small>
  </div>
}

function LayerList({
  elements,
  selectedId,
  onSelect
}: {
  elements: DesignElement[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { t } = useTranslation()

  return <div className="layer-list">
    <b>{t('layers')}</b>
    {elements.length === 0 && <span className="muted">{t('emptySide')}</span>}
    {[...elements].reverse().map(element =>
      <button
        key={element.id}
        className={selectedId === element.id ? 'active' : ''}
        onClick={() => onSelect(element.id)}
      >
        <span>{element.type === 'IMAGE' ? '▧' : element.type === 'TEXT' ? 'T' : '★'}</span>
        <b>{element.label || element.type}</b>
      </button>
    )}
  </div>
}

function StatusButton({ status, onClick }: { status: Draft['status'], onClick: () => void }) {
  const { t } = useTranslation()
  const config = status === 'BLOCKED'
    ? { cls: 'blocked', icon: '✕', text: t('needsFix') }
    : status === 'WARNING'
      ? { cls: 'warning', icon: '⚠', text: t('worthChecking') }
      : status === 'DRAFT'
        ? { cls: 'draft', icon: '＋', text: t('draftStatus') }
        : { cls: 'ready', icon: '✓', text: t('looksReady') }

  return <button className={"status " + config.cls} onClick={onClick}>
    {config.icon} {config.text}
  </button>
}

function StatusInline({ status }: { status: Draft['status'] }) {
  const { t } = useTranslation()
  if (status === 'BLOCKED') return <span>✕ {t('needsFix')}</span>
  if (status === 'WARNING') return <span>⚠ {t('worthChecking')}</span>
  if (status === 'DRAFT') return <span>＋ {t('draftStatus')}</span>
  return <span>✓ {t('looksReady')}</span>
}

function DesignCheck({ draft }: { draft: Draft }) {
  const { t } = useTranslation()
  const issues = getPreflightIssues(draft)
  const status = getDraftStatus(draft)

  return <div className="simple-screen"><Header/><main className="narrow">
    <StatusButton status={status} onClick={() => {}} />
    <h1>{t('designCheck')}</h1>

    {issues.length === 0 && <div className="check-card good">
      <b>✓ {t('allChecksGood')}</b>
      <p>{t('allChecksGoodHint')}</p>
    </div>}

    {issues.map(issue =>
      <div
        key={issue.code + issue.elementId}
        className={"check-card " + (issue.severity === 'BLOCKER' ? 'danger-card' : 'warning-card')}
      >
        <b>{issue.code === 'LOW_DPI' ? t('warningImageTitle') : t('needsFix')}</b>
        <p>
          {issue.code === 'LOW_DPI'
            ? `${t('warningImageHint')} ${issue.value ?? ''} DPI`
            : 'Part of the selected element is outside the printable area.'}
        </p>
        <Link to="/editor">{t('edit')}</Link>
      </div>
    )}

    {!issues.some(issue => issue.code === 'OUTSIDE_PRINT_AREA') && <>
      <div className="check-card good">✓ {t('placementGood')}</div>
      <div className="check-card good">✓ {t('insideArea')}</div>
    </>}

    {status === 'READY' || status === 'WARNING'
      ? <Link className="btn primary full" to="/preview">{t('continue')}</Link>
      : <Link className="btn secondary full" to="/editor">{t('edit')}</Link>}
  </main></div>
}

function FinalPreview({ draft, onApprove }: { draft: Draft, onApprove: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const product = products.find(item => item.id === draft.productId) ?? products[1]
  const garmentColor = product.colors.find(item => item.code === draft.color)?.hex ?? '#171717'
  const sides = getSidesInUse(draft)
  const [side, setSide] = useState<Side>(sides[0] ?? 'FRONT')
  const status = getDraftStatus(draft)

  const previewDraft = { ...draft, activeSide: side }

  return <div className="preview-page"><Header/><main className="preview-layout">
    <div className="preview-stage">
      <EditorCanvas
        draft={previewDraft}
        garmentColor={garmentColor}
        selectedId={null}
        onSelect={() => {}}
        onChange={() => {}}
        readOnly
      />
    </div>

    <aside className="approval">
      <span className="eyebrow">{t('finalPreview')}</span>
      <h1>{product.name}</h1>
      <p>{draft.color} · {draft.size}</p>

      <div className="preview-side-switch">
        {(['FRONT', 'BACK'] as Side[]).map(item =>
          <button
            key={item}
            className={side === item ? 'active' : ''}
            onClick={() => setSide(item)}
          >
            {item === 'FRONT' ? t('front') : t('back')}
            {draft.elements.some(element => element.side === item) ? ' •' : ''}
          </button>
        )}
      </div>

      <StatusInline status={status} />
      <p className="muted">{t('printSize')}: 25 × 30 cm max</p>
      <p className="note">{t('previewApprox')}</p>

      <div className="actions column">
        <Link className="btn secondary full" to="/editor">{t('edit')}</Link>
        <button
          className="btn primary full"
          disabled={status === 'BLOCKED' || status === 'DRAFT'}
          onClick={() => {
            onApprove()
            navigate('/cart')
          }}
        >
          {t('approve')}
        </button>
      </div>
    </aside>
  </main></div>
}

function Cart({ approved }: { approved: ApprovedDesign | null }) {
  const { t } = useTranslation()

  if (!approved) {
    return <><Header/><main className="narrow">
      <h1>{t('cart')}</h1>
      <div className="empty">
        <p>{t('noApprovedDesign')}</p>
        <Link className="btn primary" to="/editor">{t('create')}</Link>
      </div>
    </main></>
  }

  const draft = approved.draft
  const product = products.find(item => item.id === draft.productId) ?? products[1]
  const garmentColor = product.colors.find(item => item.code === draft.color)?.hex ?? '#171717'
  const sides = getSidesInUse(draft)

  return <><Header/><main className="narrow">
    <h1>{t('cart')}</h1>
    <div className="cart-item cart-item-live">
      <div className="cart-preview">
        <EditorCanvas
          draft={{ ...draft, activeSide: sides[0] ?? 'FRONT' }}
          garmentColor={garmentColor}
          selectedId={null}
          onSelect={() => {}}
          onChange={() => {}}
          readOnly
        />
      </div>
      <div>
        <h3>{product.name}</h3>
        <p>{draft.color} · {draft.size}</p>
        <p>{t('usedSides')}: {sides.map(side => side === 'FRONT' ? t('front') : t('back')).join(' + ')}</p>
        <div className="actions">
          <Link to="/editor">{t('edit')}</Link>
          <button className="link-btn">{t('remix')}</button>
        </div>
      </div>
    </div>

    <div className="total">
      <span>{t('total')}</span>
      <b>{formatKzt(product.price, i18n.language)}</b>
    </div>
    <Link className="btn primary full" to="/checkout">{t('checkout')}</Link>
  </main></>
}

function Checkout({ approved }: { approved: ApprovedDesign | null }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (!approved) {
    return <><Header/><main className="narrow">
      <h1>{t('checkout')}</h1>
      <p>{t('noApprovedDesign')}</p>
      <Link className="btn primary" to="/editor">{t('create')}</Link>
    </main></>
  }

  return <><Header/><main className="narrow">
    <h1>{t('checkout')}</h1>
    <div className="form-grid">
      <label>{t('name')}<input autoComplete="name"/></label>
      <label>{t('phone')}<input type="tel" placeholder="+7 7__ ___ __ __"/></label>
      <label className="wide">{t('deliveryAddress')}<input placeholder="Almaty"/></label>
    </div>
    <div className="check-card">
      <b>{t('mockPayment')}</b>
      <p>{t('mockPaymentHint')}</p>
    </div>
    <button className="btn primary full" onClick={() => navigate('/order')}>
      {t('placeMockOrder')}
    </button>
  </main></>
}

function OrderDone() {
  const { t } = useTranslation()
  return <><Header/><main className="narrow success-screen">
    <div className="big-check">✓</div>
    <h1>{t('orderCreated')}</h1>
    <p>{t('orderCreatedHint')}</p>
    <Link className="btn primary" to="/">{t('backHome')}</Link>
  </main></>
}

function GarmentVisual({
  type,
  color,
  text,
  compact = false
}: {
  type: 'TSHIRT' | 'HOODIE'
  color: string
  text: string
  compact?: boolean
}) {
  return <div className={"garment-wrap " + (compact ? 'compact' : '')}>
    <svg className="garment" viewBox="0 0 420 500" role="img" aria-label={type}>
      {type === 'HOODIE' ? <>
        <path d="M145 85 Q210 20 275 85 L330 120 390 210 330 245 312 190 315 455 105 455 108 190 90 245 30 210 90 120Z" fill={color}/>
        <path d="M155 85 Q210 130 265 85 Q260 40 210 25 Q160 40 155 85Z" fill={color} stroke="#303136" strokeWidth="4"/>
        <path d="M145 340 Q210 315 275 340 L270 415 150 415Z" fill="none" stroke="#505158" strokeWidth="4"/>
      </> : <>
        <path d="M135 80 L85 105 25 180 75 220 105 180 105 455 315 455 315 180 345 220 395 180 335 105 285 80 Q210 125 135 80Z" fill={color}/>
      </>}
      <rect x="130" y="150" width="160" height="190" rx="8" fill="none" stroke="#8c78ff" strokeDasharray="8 7" strokeWidth="3" opacity=".7"/>
      <text
        x="210"
        y="245"
        textAnchor="middle"
        fill={color === '#f4f4f2' ? '#111214' : 'white'}
        fontSize="34"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
      >
        {text}
      </text>
    </svg>
  </div>
}

export default App
