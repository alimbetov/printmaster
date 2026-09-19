import { useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Draft, Locale, Side, Size } from './types'
import { createDraft, formatKzt, products } from './mock'
import i18n from './i18n'

function App() {
  const [draft, setDraft] = useState<Draft>(() => {
    const raw = localStorage.getItem('pm-draft')
    return raw ? JSON.parse(raw) : createDraft()
  })
  const [cart, setCart] = useState(false)

  const updateDraft = (next: Draft) => {
    setDraft(next)
    localStorage.setItem('pm-draft', JSON.stringify(next))
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Catalog />} />
      <Route path="/products/:id" element={<ProductPage draft={draft} onDraft={updateDraft} />} />
      <Route path="/editor" element={<Editor draft={draft} onDraft={updateDraft} />} />
      <Route path="/check" element={<DesignCheck />} />
      <Route path="/preview" element={<FinalPreview draft={draft} onApprove={() => setCart(true)} />} />
      <Route path="/cart" element={<Cart draft={draft} hasItem={cart} />} />
      <Route path="/checkout" element={<Checkout />} />
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
  return <select className="locale" value={locale} onChange={e => change(e.target.value as Locale)} aria-label="Language">
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
      <div className="section-head"><h2>Vibes</h2><span>Start fast, remix later</span></div>
      <div className="vibes">
        {['Street','Minimal','Local','Sport'].map((v,i)=><Link to="/editor" className={"vibe vibe-"+i} key={v}><b>{v}</b><span>Tap to remix</span></Link>)}
      </div>
    </section>
  </main></>
}

function Catalog() {
  const { t } = useTranslation()
  return <><Header/><main className="page">
    <div className="page-title"><div><span className="eyebrow">SHOP</span><h1>{t('shop')}</h1></div></div>
    <div className="product-grid">{products.map(p=><article className="product-card" key={p.id}>
      <GarmentVisual type={p.type} color="#171717" text={p.type==='HOODIE'?'MAKE IT':'YOUR ART'} compact/>
      <h3>{p.name}</h3><p>{p.description}</p>
      <div className="card-row"><b>{formatKzt(p.price, i18n.language)}</b><Link className="btn small primary" to={"/products/"+p.id}>{t('customize')}</Link></div>
    </article>)}</div>
  </main></>
}

function ProductPage({draft,onDraft}:{draft:Draft,onDraft:(d:Draft)=>void}) {
  const { id } = useParams()
  const nav = useNavigate()
  const { t } = useTranslation()
  const product = products.find(p=>p.id===id) || products[0]
  const [color,setColor] = useState(draft.productId===product.id?draft.color:'black')
  const [size,setSize] = useState<Size>(draft.productId===product.id?draft.size:'L')
  const chosen = product.colors.find(c=>c.code===color) || product.colors[0]
  const go = () => {
    onDraft({...createDraft(product.id),color,size})
    nav('/editor')
  }
  return <><Header/><main className="product-page">
    <div className="product-stage"><GarmentVisual type={product.type} color={chosen.hex} text="YOUR ART"/></div>
    <div className="product-info">
      <span className="eyebrow">{product.type}</span><h1>{product.name}</h1><p>{product.description}</p>
      <h4>{t('color')}</h4><div className="chips">{product.colors.map(c=><button key={c.code} className={"chip "+(color===c.code?'selected':'')} onClick={()=>setColor(c.code)}><i style={{background:c.hex}}/>{c.name}</button>)}</div>
      <h4>{t('size')}</h4><div className="chips">{product.sizes.map(s=><button key={s} className={"chip "+(size===s?'selected':'')} onClick={()=>setSize(s)}>{s}</button>)}</div>
      <div className="price">{formatKzt(product.price,i18n.language)}</div>
      <button className="btn primary full" onClick={go}>{t('customize')}</button>
    </div>
  </main></>
}

function Editor({draft,onDraft}:{draft:Draft,onDraft:(d:Draft)=>void}) {
  const { t } = useTranslation()
  const nav = useNavigate()
  const product = products.find(p=>p.id===draft.productId) || products[1]
  const color = product.colors.find(c=>c.code===draft.color)?.hex || '#171717'
  const [sheet,setSheet] = useState<'ADD'|'STYLE'|null>(null)
  const active = draft.elements.filter(e=>e.side===draft.activeSide)
  const label = active[0]?.label || 'YOUR ART'
  const setSide=(side:Side)=>onDraft({...draft,activeSide:side})
  const add=(type:'TEXT'|'IMAGE'|'STICKER')=>{
    const label=type==='TEXT'?'ALMATY':type==='IMAGE'?'PHOTO':'★'
    onDraft({...draft,elements:[...draft.elements,{id:crypto.randomUUID(),type,label,side:draft.activeSide,xMm:125,yMm:205,widthMm:150,heightMm:50,rotationDeg:0}]})
    setSheet(null)
  }
  return <div className="editor-shell">
    <div className="editor-top">
      <Link className="brand" to="/">PRINTMASTER</Link>
      <button className="variant-pill" onClick={()=>nav('/products/'+product.id)}>{product.name} · {draft.size}</button>
      <div className="side-switch"><button className={draft.activeSide==='FRONT'?'active':''} onClick={()=>setSide('FRONT')}>{t('front')}</button><button className={draft.activeSide==='BACK'?'active':''} onClick={()=>setSide('BACK')}>{t('back')}</button></div>
      <button className="status ready" onClick={()=>nav('/check')}>✓ {t('looksReady')}</button>
      <button className="btn primary small" onClick={()=>nav('/preview')}>{t('preview')}</button>
      <LanguageSwitch/>
    </div>
    <div className="editor-main">
      <aside className="desktop-rail">
        <button onClick={()=>setSheet('ADD')}>＋<span>{t('add')}</span></button>
        <button onClick={()=>setSheet('STYLE')}>◐<span>{t('style')}</span></button>
        <button>▱<span>{t('layers')}</span></button>
      </aside>
      <section className="canvas-area">
        <GarmentVisual type={product.type} color={color} text={label} side={draft.activeSide}/>
        {active.length>0 && <div className="measure">24.7 × 29.3 cm</div>}
      </section>
      <aside className="context-panel">
        <span className="eyebrow">ESTIMATE</span><h3>{formatKzt(product.price,i18n.language)}</h3>
        <div className="mini-card"><b>{t('designCheck')}</b><span>✓ {t('looksReady')}</span></div>
        <div className="mini-card"><b>{t('layers')}</b><span>{active.length} element(s)</span></div>
      </aside>
    </div>
    <div className="mobile-dock">
      <button onClick={()=>setSheet('ADD')}>＋<span>{t('add')}</span></button>
      <button onClick={()=>setSheet('STYLE')}>◐<span>{t('style')}</span></button>
      <button onClick={()=>nav('/preview')}>◫<span>{t('preview')}</span></button>
    </div>
    {sheet && <div className="sheet-backdrop" onClick={()=>setSheet(null)}><div className="bottom-sheet" onClick={e=>e.stopPropagation()}>
      <div className="sheet-handle"/><div className="sheet-head"><h3>{sheet==='ADD'?t('add'):t('style')}</h3><button onClick={()=>setSheet(null)}>✕</button></div>
      {sheet==='ADD'?<div className="sheet-grid">
        <button onClick={()=>add('IMAGE')}>▧<b>Image</b></button>
        <button onClick={()=>add('TEXT')}>T<b>{t('text')}</b></button>
        <button onClick={()=>add('STICKER')}>★<b>{t('sticker')}</b></button>
        <button>▦<b>{t('layout')}</b></button>
      </div>:<div className="style-list">
        {['Clean','Street','Bold','Minimal'].map(s=><button key={s} onClick={()=>setSheet(null)}>{s}</button>)}
      </div>}
    </div></div>}
  </div>
}

function DesignCheck() {
  const { t } = useTranslation()
  return <div className="simple-screen"><Header/><main className="narrow">
    <span className="status warning">⚠ {t('worthChecking')}</span><h1>{t('designCheck')}</h1>
    <div className="check-card warning-card"><b>Image may print blurry at this size</b><p>Reduce it slightly for a sharper result.</p><Link to="/editor">{t('edit')}</Link></div>
    <div className="check-card good">✓ Placement looks good</div><div className="check-card good">✓ Inside printable area</div>
    <Link className="btn primary full" to="/preview">{t('continue')}</Link>
  </main></div>
}

function FinalPreview({draft,onApprove}:{draft:Draft,onApprove:()=>void}) {
  const { t } = useTranslation()
  const nav=useNavigate()
  const product=products.find(p=>p.id===draft.productId) || products[1]
  const color=product.colors.find(c=>c.code===draft.color)?.hex || '#171717'
  const label=draft.elements.find(e=>e.side===draft.activeSide)?.label || 'YOUR ART'
  const approve=()=>{onApprove();nav('/cart')}
  return <div className="preview-page"><Header/><main className="preview-layout">
    <div className="preview-stage"><GarmentVisual type={product.type} color={color} text={label}/></div>
    <aside className="approval">
      <span className="eyebrow">{t('finalPreview')}</span><h1>{product.name}</h1><p>{draft.color} · {draft.size}</p>
      <span className="status ready">✓ {t('looksReady')}</span>
      <p className="muted">24.7 × 29.3 cm</p>
      <p className="note">Digital design checks passed. Garment preview is approximate.</p>
      <div className="actions column"><Link className="btn secondary full" to="/editor">{t('edit')}</Link><button className="btn primary full" onClick={approve}>{t('approve')}</button></div>
    </aside>
  </main></div>
}

function Cart({draft,hasItem}:{draft:Draft,hasItem:boolean}) {
  const {t}=useTranslation()
  const product=products.find(p=>p.id===draft.productId) || products[1]
  return <><Header/><main className="narrow">
    <h1>{t('cart')}</h1>
    {!hasItem?<div className="empty"><p>No approved design yet.</p><Link className="btn primary" to="/editor">{t('create')}</Link></div>:<>
      <div className="cart-item"><GarmentVisual type={product.type} color="#171717" text="ALMATY" compact/><div><h3>{product.name}</h3><p>{draft.color} · {draft.size}</p><p>{t('front')} + {t('back')}</p><div className="actions"><Link to="/editor">{t('edit')}</Link><button className="link-btn">{t('remix')}</button></div></div></div>
      <div className="total"><span>Total</span><b>{formatKzt(product.price,i18n.language)}</b></div><Link className="btn primary full" to="/checkout">{t('checkout')}</Link>
    </>}
  </main></>
}

function Checkout() {
  const {t}=useTranslation(); const nav=useNavigate()
  return <><Header/><main className="narrow"><h1>{t('checkout')}</h1>
    <div className="form-grid"><label>Name<input defaultValue="Ruslan"/></label><label>Phone<input placeholder="+7 7__ ___ __ __"/></label><label className="wide">Delivery address<input placeholder="Almaty"/></label></div>
    <div className="check-card"><b>Mock payment</b><p>No real payment will be charged.</p></div>
    <button className="btn primary full" onClick={()=>nav('/order')}>Place mock order</button>
  </main></>
}

function OrderDone() {
  return <><Header/><main className="narrow success-screen"><div className="big-check">✓</div><h1>Order PM-0001 created</h1><p>This is a mock order. Next step: production workflow mock.</p><Link className="btn primary" to="/">Back home</Link></main></>
}

function GarmentVisual({type,color,text,compact=false,side='FRONT'}:{type:'TSHIRT'|'HOODIE',color:string,text:string,compact?:boolean,side?:Side}) {
  return <div className={"garment-wrap "+(compact?'compact':'')}>
    <svg className="garment" viewBox="0 0 420 500" role="img" aria-label={type}>
      {type==='HOODIE'?<>
        <path d="M145 85 Q210 20 275 85 L330 120 390 210 330 245 312 190 315 455 105 455 108 190 90 245 30 210 90 120Z" fill={color}/>
        <path d="M155 85 Q210 130 265 85 Q260 40 210 25 Q160 40 155 85Z" fill={color} stroke="#303136" strokeWidth="4"/>
        <path d="M145 340 Q210 315 275 340 L270 415 150 415Z" fill="none" stroke="#505158" strokeWidth="4"/>
      </>:<>
        <path d="M135 80 L85 105 25 180 75 220 105 180 105 455 315 455 315 180 345 220 395 180 335 105 285 80 Q210 125 135 80Z" fill={color}/>
      </>}
      <rect x="130" y="150" width="160" height="190" rx="8" fill="none" stroke="#8c78ff" strokeDasharray="8 7" strokeWidth="3" opacity=".7"/>
      <text x="210" y="245" textAnchor="middle" fill={color==='#f4f4f2'?'#111214':'white'} fontSize="34" fontWeight="800" fontFamily="Arial, sans-serif">{side==='BACK'?'BACK':' '}{text}</text>
    </svg>
  </div>
}

export default App
