/* order.jsx — 下單 / 生產追蹤 + Brand Kit 品牌資產庫 */
const { useApp: useApp_O, makeT: makeT_O } = window;
const { useState, useEffect, useRef, useCallback } = React;

function OrderTracking() {
  const app = useApp_O(); const t = makeT_O(app.lang);
  const steps = [
    { icon: 'ClipboardCheck', label: { zh: '接單確認', en: 'Confirmed' }, done: true },
    { icon: 'ScanSearch', label: { zh: '印前確認', en: 'Preflight' }, done: true },
    { icon: 'Printer', label: { zh: '印刷中', en: 'Printing' }, active: true },
    { icon: 'Scissors', label: { zh: '加工裝訂', en: 'Finishing' } },
    { icon: 'PackageCheck', label: { zh: '出貨', en: 'Shipped' } },
  ];
  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
      <div className="col" style={{ gap: 18 }}>
        <div className="card card--pad col" style={{ gap: 18 }}>
          <div className="row between center wraprow" style={{ gap: 10 }}>
            <div className="col"><span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '訂單編號', en: 'Order' })}</span><strong className="num" style={{ font: 'var(--h4)' }}>#YFP-20260601-0482</strong></div>
            <span className="tag tag--orange"><Icon name="Loader" size={13} />{t({ zh: '生產中', en: 'In production' })}</span>
          </div>
          <hr className="divider" />
          {/* timeline */}
          <div className="row between" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 23, left: '10%', right: '10%', height: 2, background: 'var(--color-divider)' }} />
            <div style={{ position: 'absolute', top: 23, left: '10%', width: '40%', height: 2, background: 'var(--teal-500)' }} />
            {steps.map((s, i) => (
              <div key={i} className="col center" style={{ gap: 8, flex: 1, position: 'relative' }}>
                <span style={{ width: 46, height: 46, borderRadius: '50%', display: 'grid', placeItems: 'center', background: s.done ? 'var(--teal-500)' : s.active ? '#fff' : 'var(--paper-100)', border: s.active ? '2px solid var(--orange-500)' : s.done ? 'none' : '1px solid var(--color-divider)', color: s.done ? '#fff' : s.active ? 'var(--orange-600)' : 'var(--n-400)', boxShadow: s.active ? '0 0 0 5px #FEF1E0' : 'none' }}>
                  <Icon name={s.done ? 'Check' : s.icon} size={20} />
                </span>
                <span style={{ font: 'var(--caption)', fontWeight: 600, textAlign: 'center', color: s.done || s.active ? 'var(--color-fg)' : 'var(--color-fg-muted)' }}>{t(s.label)}</span>
              </div>
            ))}
          </div>
          <div className="card card--pad statuscard statuscard--info row center between wraprow" style={{ gap: 10, background: 'var(--teal-50)', border: 'none' }}>
            <span className="row center" style={{ gap: 8, font: 'var(--body-sm)' }}><Icon name="Truck" size={18} color="var(--teal-600)" />{t({ zh: '預計 6/4 出貨，6/5 送達', en: 'Ships Jun 4, arrives Jun 5' })}</span>
            <span className="row center" style={{ gap: 6, font: 'var(--caption)', color: 'var(--success-600)' }}><Icon name="Leaf" size={15} />{t({ zh: '本單碳排 -18%（在地派單）', en: 'CO₂ −18% (local routing)' })}</span>
          </div>
        </div>
        <div className="card card--pad row between center wraprow" style={{ gap: 12 }}>
          <div className="row center" style={{ gap: 12 }}>
            <div style={{ width: 64, height: 38, borderRadius: 7, background: 'linear-gradient(135deg,#163A40,#0E2A30)', display: 'grid', placeItems: 'center' }}><Icon name="Coffee" size={16} color="#E8A14B" /></div>
            <div className="col"><strong style={{ font: 'var(--body-sm)' }}>CAFE DAY {t({ zh: '名片', en: 'business card' })}</strong><span className="muted num" style={{ font: 'var(--caption)' }}>象牙卡 270P · 雙面 · 2,000 張</span></div>
          </div>
          <button className="btn btn--outline btn--sm"><Icon name="RotateCcw" size={15} />{t({ zh: '一鍵補印', en: 'Reorder' })}</button>
        </div>
      </div>
      <div className="card card--pad col" style={{ gap: 14 }}>
        <strong style={{ font: 'var(--h4)' }}>{t({ zh: '金額明細', en: 'Summary' })}</strong>
        {[['小計', 'Subtotal', 'NT$1,760'], ['加工（霧膜）', 'Finishing', 'NT$240'], ['物流', 'Shipping', 'NT$0']].map((r, i) => (
          <div key={i} className="row between" style={{ font: 'var(--body-sm)' }}><span className="muted">{app.lang === 'en' ? r[1] : r[0]}</span><span className="num">{r[2]}</span></div>
        ))}
        <hr className="divider" />
        <div className="row between center"><span style={{ fontWeight: 700 }}>{t({ zh: '總計', en: 'Total' })}</span><span className="num" style={{ font: 'var(--h3)', color: 'var(--teal-600)' }}>NT$2,000</span></div>
        <button className="btn btn--primary btn--block" onClick={() => app.go('home')}><Icon name="Home" size={16} />{t({ zh: '回首頁', en: 'Home' })}</button>
      </div>
    </div>
  );
}

function BrandKit() {
  const app = useApp_O(); const t = makeT_O(app.lang);
  const palette = ['#F3E7D6', '#C0894E', '#5B4334', '#8A6E55'];
  const assets = [
    { icon: 'CreditCard', label: { zh: '名片', en: 'Card' } },
    { icon: 'Sticker', label: { zh: '貼紙', en: 'Sticker' } },
    { icon: 'Image', label: { zh: '海報', en: 'Poster' } },
    { icon: 'Instagram', label: { zh: 'IG 貼文', en: 'IG post' } },
  ];
  return (
    <div className="grid" style={{ gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
      <div className="card card--pad col" style={{ gap: 16 }}>
        <div className="row center" style={{ gap: 12 }}>
          <span style={{ width: 52, height: 52, borderRadius: 14, background: '#F3E7D6', display: 'grid', placeItems: 'center', border: '1px solid var(--color-divider)' }}><Icon name="Coffee" size={26} color="#C0894E" /></span>
          <div className="col"><strong style={{ font: 'var(--h4)' }}>CAFE DAY</strong><span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '咖啡・甜點', en: 'Coffee · Dessert' })}</span></div>
        </div>
        <div className="col" style={{ gap: 8 }}>
          <span className="muted" style={{ font: 'var(--overline)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{t({ zh: '品牌配色', en: 'Palette' })}</span>
          <div className="row" style={{ gap: 8 }}>{palette.map((c, i) => <span key={i} title={c} style={{ flex: 1, height: 40, borderRadius: 9, background: c, border: '1px solid rgba(0,0,0,.08)' }} />)}</div>
        </div>
        <div className="col" style={{ gap: 6 }}>
          <span className="muted" style={{ font: 'var(--overline)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{t({ zh: '字體', en: 'Type' })}</span>
          <div className="row between"><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Space Grotesk</span><span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '標題', en: 'Display' })}</span></div>
          <div className="row between"><span style={{ fontWeight: 600 }}>Noto Sans TC</span><span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '內文', en: 'Body' })}</span></div>
        </div>
        <button className="btn btn--accent btn--block" onClick={() => app.go('studio')}><Icon name="Sparkles" size={16} />{t({ zh: '用此品牌生成新素材', en: 'Generate with this brand' })}</button>
      </div>
      <div className="col" style={{ gap: 16 }}>
        <div className="row between center"><strong style={{ font: 'var(--h3)' }}>{t({ zh: '品牌素材庫', en: 'Brand assets' })}</strong><span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: 'AI 自動維持品牌一致性', en: 'AI keeps it consistent' })}</span></div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {assets.map((a, i) => (
            <button key={i} className="card card--hover col center" style={{ gap: 10, padding: 22 }} onClick={() => app.go('studio')}>
              <span style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--teal-50)', display: 'grid', placeItems: 'center', color: 'var(--teal-600)' }}><Icon name={a.icon} size={24} /></span>
              <span style={{ font: 'var(--caption)', fontWeight: 600 }}>{t(a.label)}</span>
            </button>
          ))}
        </div>
        <div className="col" style={{ gap: 8 }}>
          <span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '上傳你自己的素材（拖曳圖片）', en: 'Upload your own (drag an image)' })}</span>
          <image-slot id="brandkit-upload" style={{ width: '100%', height: 150 }} shape="rounded" radius="14" placeholder={t({ zh: '拖入 Logo 或商品照', en: 'Drop a logo or product photo' })}></image-slot>
        </div>
      </div>
    </div>
  );
}

function Order() {
  const app = useApp_O(); const t = makeT_O(app.lang);
  const [tab, setTab] = useState(app.params.tab === 'brandkit' ? 'brandkit' : 'order');
  return (
    <div className="wrap" style={{ maxWidth: 1080 }}>
      <div style={{ marginBottom: 24 }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'order', icon: 'PackageCheck', label: t({ zh: '訂單追蹤', en: 'Order tracking' }) },
          { id: 'brandkit', icon: 'BookMarked', label: t({ zh: '品牌資產庫', en: 'Brand Kit' }) },
        ]} />
      </div>
      <div className="rise" key={tab}>{tab === 'order' ? <OrderTracking /> : <BrandKit />}</div>
    </div>
  );
}

Object.assign(window, { Order });
