/* studio.jsx — AI 設計創作工作室: conversational generation + live canvas */
const { useApp: useApp_S, makeT: makeT_S, useFakeRun: useFakeRun_S } = window;
const { useState, useEffect, useRef, useCallback } = React;

const STUDIO_VARIANTS = [
  { id: 'cream', name: { zh: '暖奶咖啡', en: 'Warm Latte' }, bg: '#F3E7D6', ink: '#5B4334', sub: '#8A6E55', accent: '#C0894E', palette: ['#F3E7D6', '#C0894E', '#5B4334', '#8A6E55'] },
  { id: 'ink', name: { zh: '深焙墨綠', en: 'Dark Roast' }, bg: '#163A40', ink: '#F2EDE4', sub: '#9DBDC0', accent: '#E8A14B', palette: ['#163A40', '#E8A14B', '#F2EDE4', '#9DBDC0'] },
  { id: 'min', name: { zh: '極簡奶油', en: 'Minimal' }, bg: '#FBF8F3', ink: '#2A2622', sub: '#9A9186', accent: '#F18E1B', palette: ['#FBF8F3', '#F18E1B', '#2A2622', '#D8CFC2'] },
];
const STUDIO_SIZES = [
  { id: 'card', label: { zh: '名片', en: 'Card' }, dim: '90 × 54 mm', ratio: 90 / 54 },
  { id: 'sticker', label: { zh: '圓形貼紙', en: 'Sticker' }, dim: 'Ø 50 mm', ratio: 1 },
  { id: 'poster', label: { zh: '海報 A3', en: 'Poster' }, dim: '297 × 420 mm', ratio: 297 / 420 },
  { id: 'ig', label: { zh: 'IG 貼文', en: 'IG Post' }, dim: '1080 × 1080', ratio: 1 },
];
function hex(p, fb) { if (!p) return fb || '#888'; if (typeof p === 'string') return p; return p.hex || p.value || fb || '#888'; }
const PROMPTS = [
  { zh: '我要一個韓系咖啡店的 Logo 和名片', en: 'A Korean-style café logo and business card' },
  { zh: '文青風格的手沖咖啡品牌', en: 'An artisanal pour-over coffee brand' },
  { zh: '幫寵物用品店做一套品牌識別', en: 'Brand identity for a pet supplies shop' },
];

/* a rendered "AI-generated" design surface */
function DesignSurface({ v, size, brand }) {
  const t = makeT_S(useApp_S().lang);
  const common = { background: v.bg, color: v.ink, width: '100%', height: '100%', position: 'relative', overflow: 'hidden' };
  if (size.id === 'sticker' || size.id === 'ig') {
    return (
      <div style={{ ...common, display: 'grid', placeItems: 'center', borderRadius: size.id === 'sticker' ? '50%' : 14 }}>
        <div className="col center" style={{ gap: 10 }}>
          <span style={{ width: 58, height: 58, borderRadius: '50%', border: `2px solid ${v.accent}`, display: 'grid', placeItems: 'center', color: v.accent }}>
            <Icon name="Coffee" size={30} color={v.accent} />
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '.04em' }}>{brand}</span>
          <span style={{ font: 'var(--caption)', color: v.sub, letterSpacing: '.22em' }}>COFFEE · DESSERT</span>
        </div>
      </div>
    );
  }
  if (size.id === 'poster') {
    return (
      <div style={{ ...common, padding: '13% 11%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="row between center"><span style={{ font: 'var(--caption)', color: v.sub, letterSpacing: '.2em' }}>NEW MENU</span><Icon name="Coffee" size={22} color={v.accent} /></div>
        <div className="col" style={{ gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px,7vw,52px)', lineHeight: 1 }}>{brand}</span>
          <span style={{ fontSize: 'clamp(13px,2.6vw,18px)', color: v.sub }}>{t({ zh: '春季限定・手沖系列', en: 'Spring Pour-over Series' })}</span>
        </div>
        <div className="row between center"><span style={{ height: 3, width: 54, background: v.accent }} /><span style={{ font: 'var(--caption)', color: v.sub }}>@{brand.toLowerCase().replace(/\s/g, '')}</span></div>
      </div>
    );
  }
  // business card (default)
  return (
    <div style={{ ...common, padding: '11% 12%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="row center" style={{ gap: 10 }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${v.accent}`, display: 'grid', placeItems: 'center' }}><Icon name="Coffee" size={20} color={v.accent} /></span>
        <div className="col"><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '.06em' }}>{brand}</span>
          <span style={{ font: '600 9px/1 var(--font-sans)', color: v.sub, letterSpacing: '.28em' }}>COFFEE & DESSERT</span></div>
      </div>
      <div className="col" style={{ gap: 3, fontSize: 10.5, color: v.sub }}>
        <span className="row center" style={{ gap: 6 }}><Icon name="Phone" size={11} color={v.accent} />02-1234-5678</span>
        <span className="row center" style={{ gap: 6 }}><Icon name="Instagram" size={11} color={v.accent} />@{brand.toLowerCase().replace(/\s/g, '')}</span>
        <span className="row center" style={{ gap: 6 }}><Icon name="Globe" size={11} color={v.accent} />www.{brand.toLowerCase().replace(/\s/g, '')}.com</span>
      </div>
    </div>
  );
}

function Studio() {
  const app = useApp_S(); const t = makeT_S(app.lang);
  const live = typeof window !== 'undefined' && window.LiveAI;
  const [prompt, setPrompt] = useState('');
  const [generated, setGenerated] = useState(false);
  const [variant, setVariant] = useState('cream');
  const [size, setSize] = useState('card');
  const [kit, setKit] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genErr, setGenErr] = useState(null);
  const { running, progress, run } = useFakeRun_S(2100);

  // kit (real) → dynamic variant; else preset
  const kitVariant = kit && Array.isArray(kit.palette) && kit.palette.length >= 2 ? {
    id: 'ai', name: { zh: 'AI 生成', en: 'AI' },
    bg: hex(kit.palette[0]), accent: hex(kit.palette[1]), ink: hex(kit.palette[2] || kit.palette[0], '#2A2622'), sub: hex(kit.palette[3] || kit.palette[1], '#8A6E55'),
    palette: kit.palette.map(p => hex(p)),
  } : null;
  const variants = kitVariant ? [kitVariant, ...STUDIO_VARIANTS] : STUDIO_VARIANTS;
  const v = variants.find(x => x.id === variant) || variants[0];
  const sz = STUDIO_SIZES.find(x => x.id === size);
  const brand = (kit && (kit.brandName || kit.brandNameZh)) || 'CAFE DAY';
  const loading = running || genLoading;

  const doGenerate = async () => {
    const p = prompt.trim() || t(PROMPTS[0]);
    if (!prompt.trim()) setPrompt(p);
    setGenErr(null);
    if (live && live.endpoint()) {
      setGenLoading(true);
      try { const k = await live.generateBrandKit(p, app.lang); setKit(k); setVariant('ai'); setGenerated(true); }
      catch (e) { setGenErr(t({ zh: '生成服務未連線，改用範例。', en: 'Generation offline — showing sample.' })); run(() => setGenerated(true)); }
      setGenLoading(false);
    } else { run(() => setGenerated(true)); }
  };
  const previewW = sz.ratio >= 1 ? 460 : 460 * sz.ratio;
  const previewH = previewW / sz.ratio;

  return (
    <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
      {/* ---- left: conversation ---- */}
      <div className="card col" style={{ overflow: 'hidden', position: 'sticky', top: 90, height: 'calc(100vh - 130px)' }}>
        <div className="row center" style={{ gap: 10, padding: '16px 18px', borderBottom: '1px solid var(--color-divider)' }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--teal-50)', display: 'grid', placeItems: 'center' }}><Icon name="Sparkles" size={18} color="var(--teal-500)" /></span>
          <div className="col"><strong style={{ font: 'var(--h4)' }}>{t({ zh: 'AI 設計助理', en: 'AI Design Assistant' })}</strong>
            <span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '描述需求，AI 幫你完成', en: 'Describe it, AI builds it' })}</span></div>
        </div>
        <div className="col" style={{ gap: 14, padding: 18, flex: 1, overflowY: 'auto' }}>
          <div style={{ alignSelf: 'flex-start', maxWidth: '92%', background: 'var(--paper-100)', borderRadius: '4px 14px 14px 14px', padding: '11px 14px', font: 'var(--body-sm)' }}>
            {t({ zh: '嗨！想做什麼印刷品？描述你的店或商品，我幫你生成 Logo、配色、文案與排版。', en: 'Hi! What do you want to print? Describe your shop and I’ll generate logo, colors, copy & layout.' })}
          </div>
          {generated && (
            <>
              <div className="pop" style={{ alignSelf: 'flex-end', maxWidth: '92%', background: 'var(--teal-500)', color: '#fff', borderRadius: '14px 4px 14px 14px', padding: '11px 14px', font: 'var(--body-sm)' }}>{prompt || t(PROMPTS[0])}</div>
              <div className="pop col" style={{ alignSelf: 'flex-start', maxWidth: '94%', background: 'var(--paper-100)', borderRadius: '4px 14px 14px 14px', padding: '13px 15px', gap: 10 }}>
                <span style={{ font: 'var(--body-sm)', fontWeight: 600 }}>{t({ zh: `完成了！我為「${brand}」生成了一整套：`, en: `Done! A full set for “${brand}”:` })}</span>
                {kit && kit.tagline && <span className="muted" style={{ font: 'var(--caption)', fontStyle: 'italic' }}>「{kit.tagline}」</span>}
                {[{ i: 'Shapes', z: 'Logo 與品牌標誌', e: 'Logo & brand mark' }, { i: 'Palette', z: '品牌配色（4 色）', e: 'Brand palette (4)' }, { i: 'Type', z: '字體搭配', e: 'Type pairing' }, { i: 'CreditCard', z: '名片排版', e: 'Business-card layout' }, { i: 'Copy', z: '多尺寸素材', e: 'Multi-size assets' }].map((it, k) => (
                  <span key={k} className="row center" style={{ gap: 8, font: 'var(--body-sm)' }}><Icon name="Check" size={15} color="var(--success-500)" /><Icon name={it.i} size={14} color="var(--teal-500)" />{t({ zh: it.z, en: it.e })}</span>
                ))}
                <span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '可在右側切換風格與尺寸，或繼續微調。', en: 'Switch style & size on the right, or keep tweaking.' })}</span>
              </div>
            </>
          )}
          {genErr && <div className="row center" style={{ gap: 8, alignSelf: 'flex-start', color: 'var(--orange-600)', font: 'var(--caption)' }}><Icon name="TriangleAlert" size={14} />{genErr}</div>}
          {loading && (
            <div className="row center" style={{ gap: 10, alignSelf: 'flex-start', color: 'var(--teal-600)', font: 'var(--body-sm)' }}>
              <Icon name="LoaderCircle" size={16} className="spin" />{t({ zh: 'AI 設計生成中…', en: 'Generating…' })} {running && <span className="num">{Math.round(progress * 100)}%</span>}
            </div>
          )}
        </div>
        <div className="col" style={{ gap: 10, padding: 16, borderTop: '1px solid var(--color-divider)' }}>
          <div className="row wraprow" style={{ gap: 6 }}>
            {PROMPTS.map((p, i) => <button key={i} className="chip" onClick={() => setPrompt(t(p))}>{t(p)}</button>)}
          </div>
          <div style={{ position: 'relative' }}>
            <textarea className="textarea" rows={2} value={prompt} placeholder={t({ zh: '例如：我要一個韓系咖啡店的 Logo 和名片…', en: 'e.g. A Korean-style café logo and card…' })} onChange={e => setPrompt(e.target.value)} style={{ paddingRight: 52 }} />
            <button className="btn btn--accent" onClick={doGenerate} disabled={loading} style={{ position: 'absolute', right: 8, bottom: 8, padding: '8px 12px', borderRadius: 10 }}>
              {loading ? <Icon name="LoaderCircle" size={16} className="spin" /> : <Icon name="ArrowUp" size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* ---- right: canvas ---- */}
      <div className="col" style={{ gap: 18 }}>
        {!generated && !loading ? (
          (app.tw && app.tw.studioMode === '範本式') ? (
            <div className="card col" style={{ gap: 18, padding: 32 }}>
              <div className="col center" style={{ gap: 6, textAlign: 'center' }}>
                <h3 style={{ font: 'var(--h3)', margin: 0 }}>{t({ zh: '選一個範本，AI 幫你套用', en: 'Pick a template, AI fills it in' })}</h3>
                <p className="muted" style={{ margin: 0 }}>{t({ zh: '不知道從哪開始？直接從現成範本快速生成。', en: 'Not sure where to start? Generate from a ready template.' })}</p>
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {[{ v: STUDIO_VARIANTS[0], k: PROMPTS[0], z: '韓系咖啡店', e: 'Korean café' },
                { v: STUDIO_VARIANTS[1], k: PROMPTS[1], z: '文青手沖', e: 'Artisan pour-over' },
                { v: STUDIO_VARIANTS[2], k: PROMPTS[2], z: '寵物用品店', e: 'Pet shop' }].map((tp, i) => (
                  <button key={i} className="card card--hover col" style={{ padding: 10, gap: 10 }}
                    onClick={() => { setVariant(tp.v.id); setPrompt(t(tp.k)); run(() => setGenerated(true)); }}>
                    <div style={{ width: '100%', aspectRatio: '90/54', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--sh-sm)' }}>
                      <DesignSurface v={tp.v} size={STUDIO_SIZES[0]} brand="CAFE DAY" />
                    </div>
                    <span className="row center between" style={{ width: '100%' }}>
                      <span style={{ font: 'var(--body-sm)', fontWeight: 700 }}>{t({ zh: tp.z, en: tp.e })}</span>
                      <Icon name="Sparkles" size={15} color="var(--orange-500)" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
          <div className="card col center" style={{ gap: 16, padding: 64, textAlign: 'center', borderStyle: 'dashed' }}>
            <span style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--teal-50)', display: 'grid', placeItems: 'center' }}><Icon name="Wand2" size={34} color="var(--teal-500)" /></span>
            <h3 style={{ font: 'var(--h3)', margin: 0 }}>{t({ zh: '你的設計會出現在這裡', en: 'Your design appears here' })}</h3>
            <p className="muted" style={{ maxWidth: 380, margin: 0 }}>{t({ zh: '在左側描述需求並送出，AI 會生成 Logo、名片、海報等整套素材。', en: 'Describe your need and send — AI generates a full set of assets.' })}</p>
            <button className="btn btn--accent btn--lg" onClick={doGenerate}><Icon name="Sparkles" size={18} />{t({ zh: '生成範例設計', en: 'Generate sample' })}</button>
          </div>
          )
        ) : (
          <>
            <div className="row between center wraprow" style={{ gap: 12 }}>
              <Tabs value={size} onChange={setSize} tabs={STUDIO_SIZES.map(s => ({ id: s.id, label: t(s.label) }))} />
              <div className="row center" style={{ gap: 8 }}>
                <span className="tag tag--teal num">{sz.dim}</span>
                <button className="btn btn--outline btn--sm" onClick={() => app.go('imagelab')}><Icon name="Image" size={15} />{t({ zh: '影像工具', en: 'Image tools' })}</button>
                <button className="btn btn--primary btn--sm" onClick={() => app.go('preflight')}><Icon name="ScanSearch" size={15} />{t({ zh: '送印前預檢', en: 'Preflight' })}</button>
              </div>
            </div>
            <div className="card" style={{ display: 'grid', placeItems: 'center', padding: 40, background: 'var(--paper-100)', minHeight: 420 }}>
              <div className="pop" key={variant + size} style={{ width: previewW, height: previewH, maxWidth: '100%', borderRadius: size === 'sticker' ? '50%' : 14, boxShadow: 'var(--sh-xl)', overflow: 'hidden' }}>
                <DesignSurface v={v} size={sz} brand={brand} />
              </div>
            </div>
            {/* style variants + brand kit */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div className="card card--pad col" style={{ gap: 12 }}>
                <span className="row center between"><strong style={{ font: 'var(--h4)' }}>{t({ zh: '風格變體', en: 'Style variants' })}</strong><AIBadge label={t({ zh: 'AI 生成', en: 'AI' })} /></span>
                <div className="row" style={{ gap: 10 }}>
                  {variants.map(x => (
                    <button key={x.id} onClick={() => setVariant(x.id)} className="col center" style={{ gap: 6, flex: 1, padding: 8, borderRadius: 12, border: `2px solid ${variant === x.id ? 'var(--teal-500)' : 'var(--color-divider)'}`, background: 'var(--paper-0)', cursor: 'pointer' }}>
                      <span style={{ width: '100%', height: 38, borderRadius: 8, background: x.bg, border: '1px solid rgba(0,0,0,.06)' }} />
                      <span style={{ font: 'var(--caption)', fontWeight: 600, color: variant === x.id ? 'var(--teal-600)' : 'var(--color-fg-2)' }}>{t(x.name)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card card--pad col" style={{ gap: 12 }}>
                <strong style={{ font: 'var(--h4)' }}>{t({ zh: '品牌資產 Brand Kit', en: 'Brand Kit' })}</strong>
                <div className="row center" style={{ gap: 8 }}>
                  {v.palette.map((c, i) => <span key={i} title={c} style={{ width: 34, height: 34, borderRadius: 9, background: c, border: '1px solid rgba(0,0,0,.08)' }} />)}
                </div>
                <div className="row center between" style={{ font: 'var(--body-sm)' }}><span className="muted">{t({ zh: '字體', en: 'Type' })}</span><span style={{ fontWeight: 600 }}>Space Grotesk · Noto Sans TC</span></div>
                <button className="btn btn--primary btn--block btn--sm" onClick={() => app.go('order', { tab: 'brandkit' })}><Icon name="Save" size={15} />{t({ zh: '存入我的 Brand Kit', en: 'Save to Brand Kit' })}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Studio });
