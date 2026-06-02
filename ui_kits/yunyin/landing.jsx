/* landing.jsx — 首頁 / 落地頁: hero, 9 pain points, two AI pillars, CTA */
const { useApp: useApp_L, makeT: makeT_L } = window;

/* ---- 9 pain points data ---- */
const PAINS = [
  { n: 1, icon: 'Shapes', pain: { zh: '連 Logo 都沒有', en: 'No logo at all' },
    relief: { zh: '一句話生成品牌 Logo 與識別', en: 'Generate a brand logo from one sentence' },
    tool: 'studio', pillar: 'design' },
  { n: 2, icon: 'Image', pain: { zh: '圖檔解析度很差', en: 'Image resolution too low' },
    relief: { zh: 'AI 一鍵提升解析度至印刷品質', en: 'AI upscales to print quality in one click' },
    tool: 'imagelab', tab: 'upscale', pillar: 'design' },
  { n: 3, icon: 'Maximize', pain: { zh: '檔案尺寸不對', en: 'Wrong file dimensions' },
    relief: { zh: 'AI 智能延伸底圖、自動符合印刷尺寸', en: 'AI extends artwork to fit the print size' },
    tool: 'preflight', pillar: 'print' },
  { n: 4, icon: 'Frame', pain: { zh: '不懂安全線與出血線', en: 'Don’t get bleed & safety lines' },
    relief: { zh: '印前自動標示出血/安全範圍並修正', en: 'Auto-mark & fix bleed / safe area' },
    tool: 'preflight', pillar: 'print' },
  { n: 5, icon: 'Scissors', pain: { zh: '照片不會去背', en: 'Can’t remove backgrounds' },
    relief: { zh: 'AI 一鍵精準去背，邊緣乾淨', en: 'One-click precise background removal' },
    tool: 'imagelab', tab: 'removebg', pillar: 'design' },
  { n: 6, icon: 'MousePointerClick', pain: { zh: '想要圖片中的某個元件', en: 'Want one element from an image' },
    relief: { zh: '點一下，AI 自動拆出單一元件', en: 'Click to extract a single element' },
    tool: 'imagelab', tab: 'extract', pillar: 'design' },
  { n: 7, icon: 'Timer', pain: { zh: '特殊規格常常要等報價', en: 'Custom specs need slow quotes' },
    relief: { zh: '15 秒平行試算多家工廠報價', en: '15-sec parallel quotes across factories' },
    tool: 'quote', pillar: 'print' },
  { n: 8, icon: 'FileImage', pain: { zh: '不知如何提供去背 PNG', en: 'Don’t know how to export PNG' },
    relief: { zh: '自動輸出印刷正確格式與透明 PNG', en: 'Auto-export print-correct formats & PNG' },
    tool: 'imagelab', tab: 'export', pillar: 'print' },
  { n: 9, icon: 'Layers', pain: { zh: '不知選什麼規格材質', en: 'Unsure which spec / material' },
    relief: { zh: 'AI 依用途推薦最佳 CP 值材質', en: 'AI recommends the best-value material' },
    tool: 'quote', pillar: 'print' },
];

function PainCard({ p }) {
  const app = useApp_L(); const t = makeT_L(app.lang);
  return (
    <button className="card card--hover card--pad col" style={{ gap: 12, textAlign: 'left', alignItems: 'stretch' }}
      onClick={() => app.go(p.tool, { tab: p.tab })}>
      <div className="row center between">
        <span className="num" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.04em',
          color: p.pillar === 'design' ? 'var(--teal-500)' : 'var(--orange-600)' }}>
          痛點 {String(p.n).padStart(2, '0')}
        </span>
        <span style={{ width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center',
          background: p.pillar === 'design' ? 'var(--teal-50)' : '#FEF1E0',
          color: p.pillar === 'design' ? 'var(--teal-500)' : 'var(--orange-600)' }}>
          <Icon name={p.icon} size={20} />
        </span>
      </div>
      <h4 style={{ font: 'var(--h4)', margin: 0 }}>{t(p.pain)}</h4>
      <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
        <Icon name="Sparkles" size={15} color="var(--orange-500)" style={{ marginTop: 3, flexShrink: 0 }} />
        <p className="muted" style={{ margin: 0, font: 'var(--body-sm)' }}>{t(p.relief)}</p>
      </div>
      <span className="row center" style={{ gap: 5, marginTop: 'auto', color: 'var(--teal-600)', font: 'var(--caption)', fontWeight: 700 }}>
        {t({ zh: '去解決', en: 'Solve it' })} <Icon name="ArrowRight" size={14} />
      </span>
    </button>
  );
}

function Hero() {
  const app = useApp_L(); const t = makeT_L(app.lang);
  const centered = app.tw && app.tw.heroLayout === '置中堆疊';
  return (
    <section style={{ background: 'linear-gradient(180deg, var(--paper-100) 0%, var(--paper-50) 100%)', paddingTop: 56, paddingBottom: 64 }}>
      <div className="wrap" style={centered
        ? { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 40 }
        : { display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 56, alignItems: 'center' }}>
        <div className="col rise" style={{ gap: 22, alignItems: centered ? 'center' : 'flex-start', maxWidth: centered ? 720 : 'none' }}>
          <AIBadge label={t({ zh: 'AI 設計創作 × AI 印刷流程優化', en: 'AI Design × AI Print Optimization' })} />
          <h1 style={{ font: 'var(--h1)', fontSize: 46, lineHeight: 1.12, margin: 0, letterSpacing: '-0.02em' }}>
            {t({ zh: '不會設計、不懂印刷？', en: 'Can’t design? Don’t know print?' })}<br />
            <span style={{ color: 'var(--teal-600)' }}>{t({ zh: '讓 AI 從一句話幫你做到成品。', en: 'Let AI take you from a sentence to a finished product.' })}</span>
          </h1>
          <p style={{ font: 'var(--body-lg)', color: 'var(--color-fg-2)', margin: 0, maxWidth: 520 }}>
            {t({ zh: '永豐 AI 雲印整合「AI 設計創作」與「AI 印刷流程優化」，專為微型商家解決設計與印刷的 9 大痛點 — 從創意到生產，一站式完成。',
              en: 'Yuen Foong AI Web-to-Print unifies AI design creation and AI print optimization — built to solve the 9 design & print pain points of micro-businesses, from idea to production.' })}
          </p>
          <div className="row wraprow" style={{ gap: 12, marginTop: 4 }}>
            <button className="btn btn--accent btn--lg" onClick={() => app.go('studio')}>
              <Icon name="Sparkles" size={18} />{t({ zh: '開始用 AI 設計', en: 'Start with AI design' })}
            </button>
            <button className="btn btn--outline btn--lg" onClick={() => app.go('quote')}>
              <Icon name="Timer" size={18} />{t({ zh: '15 秒試算報價', en: '15-sec instant quote' })}
            </button>
          </div>
          <div className="row wraprow center" style={{ gap: 18, marginTop: 12, color: 'var(--color-fg-muted)', font: 'var(--caption)' }}>
            <span className="row center" style={{ gap: 6 }}><Icon name="ShieldCheck" size={16} color="var(--teal-500)" />{t({ zh: '永豐紙業 ISO 27001 / 14298 認證印製', en: 'YFP ISO 27001 / 14298 certified' })}</span>
            <span className="row center" style={{ gap: 6 }}><Icon name="Factory" size={16} color="var(--teal-500)" />130+ {t({ zh: '合作印刷廠', en: 'partner factories' })}</span>
          </div>
        </div>
        <div className="pop" style={{ position: 'relative', width: '100%', maxWidth: centered ? 680 : 'none' }}>
          <div className="card" style={{ overflow: 'hidden', borderRadius: 'var(--r-2xl)', boxShadow: 'var(--sh-xl)', padding: 10, background: 'var(--paper-0)' }}>
            <img src={(window.__resources && window.__resources.sampleHero) || '../../assets/sample-hero.png'} alt="名片印製成品" style={{ width: '100%', display: 'block', borderRadius: 'var(--r-lg)' }} />
          </div>
          {/* floating chips */}
          <div className="card card--pad" style={{ position: 'absolute', left: -22, top: 28, padding: '10px 14px', boxShadow: 'var(--sh-lg)', display: 'flex', gap: 8, alignItems: 'center', animation: 'rise .6s var(--ease-out) .2s' }}>
            <Icon name="Sparkles" size={16} color="var(--orange-500)" /><span style={{ font: 'var(--caption)', fontWeight: 700 }}>{t({ zh: 'AI 生成 Logo + 名片', en: 'AI logo + card' })}</span>
          </div>
          <div className="card card--pad" style={{ position: 'absolute', right: -18, top: '46%', padding: '10px 14px', boxShadow: 'var(--sh-lg)', display: 'flex', gap: 8, alignItems: 'center', animation: 'rise .6s var(--ease-out) .35s' }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--success-500)', display: 'grid', placeItems: 'center' }}><Icon name="Check" size={14} color="#fff" /></span>
            <span style={{ font: 'var(--caption)', fontWeight: 700 }}>{t({ zh: '印前預檢通過', en: 'Preflight passed' })}</span>
          </div>
          <div className="card card--pad" style={{ position: 'absolute', left: 24, bottom: -20, padding: '10px 14px', boxShadow: 'var(--sh-lg)', display: 'flex', gap: 10, alignItems: 'center', animation: 'rise .6s var(--ease-out) .5s' }}>
            <Icon name="Timer" size={16} color="var(--teal-500)" />
            <span style={{ font: 'var(--caption)', fontWeight: 700 }}>{t({ zh: '15 秒', en: '15s' })}</span>
            <span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '極速報價', en: 'quote' })}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowStrip() {
  const app = useApp_L(); const t = makeT_L(app.lang);
  const steps = [
    { icon: 'MessageSquare', label: { zh: '一句話需求', en: 'Describe it' } },
    { icon: 'Sparkles', label: { zh: 'AI 設計創作', en: 'AI designs' } },
    { icon: 'ScanSearch', label: { zh: '印前自動預檢', en: 'Auto preflight' } },
    { icon: 'Timer', label: { zh: '15 秒報價', en: '15-sec quote' } },
    { icon: 'Factory', label: { zh: '智能派單生產', en: 'Smart production' } },
    { icon: 'PackageCheck', label: { zh: '出貨到手', en: 'Delivered' } },
  ];
  return (
    <div className="wrap" style={{ marginTop: -32, position: 'relative', zIndex: 2 }}>
      <div className="card card--pad" style={{ boxShadow: 'var(--sh-lg)', borderRadius: 'var(--r-2xl)' }}>
        <div className="row between center wraprow" style={{ gap: 8 }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="col center" style={{ gap: 8, flex: 1, minWidth: 90 }}>
                <span style={{ width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center',
                  background: i % 2 ? '#FEF1E0' : 'var(--teal-50)', color: i % 2 ? 'var(--orange-600)' : 'var(--teal-600)' }}>
                  <Icon name={s.icon} size={22} />
                </span>
                <span style={{ font: 'var(--caption)', fontWeight: 700, textAlign: 'center' }}>{t(s.label)}</span>
              </div>
              {i < steps.length - 1 && <Icon name="ChevronRight" size={20} color="var(--n-400)" style={{ flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function PainGrid() {
  const app = useApp_L(); const t = makeT_L(app.lang);
  return (
    <div className="wrap" style={{ marginTop: 88 }}>
      <SectionHead center
        eyebrow={t({ zh: '微型商家在設計與印刷上的 9 大痛點', en: 'The 9 pain points' })}
        title={t({ zh: '每一個痛點，都有對應的 AI 解法', en: 'Every pain point has a matching AI fix' })}
        sub={t({ zh: '不懂設計、不熟規範，常浪費時間與成本、影響品質與出貨。永豐 AI 雲印逐一拆解。', en: 'Not knowing design or specs wastes time, money, quality and shipping. We solve them one by one.' })} />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 36 }}>
        {PAINS.map(p => <PainCard key={p.n} p={p} />)}
      </div>
    </div>
  );
}

function Pillars() {
  const app = useApp_L(); const t = makeT_L(app.lang);
  const design = [
    { zh: 'AI 生成 Logo / 文案 / 圖片', en: 'AI generates logo / copy / images' },
    { zh: 'AI 自動排版、配色、套版', en: 'Auto layout, color & templates' },
    { zh: '一次生成多尺寸素材（名片、貼紙、海報）', en: 'Multi-size assets in one go' },
    { zh: 'Brand Kit 維持品牌一致性', en: 'Brand Kit keeps you consistent' },
  ];
  const print = [
    { zh: 'AI 平行計算多家工廠產能與原料', en: 'Parallel factory capacity & material calc' },
    { zh: 'AI 自動算紙、算工時、算成本', en: 'Auto paper, labour & cost estimation' },
    { zh: 'AI 預測交期與最佳生產方案', en: 'Predict lead time & best production plan' },
    { zh: 'AI 即時提供最精準的報價', en: 'Instant, most-accurate quotes' },
  ];
  const Col = ({ tone, idx, title, tagline, items, cta, to }) => (
    <div className="card card--pad col" style={{ gap: 18, borderRadius: 'var(--r-2xl)', borderTop: `4px solid ${tone}` }}>
      <div className="row center" style={{ gap: 12 }}>
        <span className="num" style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center',
          background: tone, color: '#fff', fontSize: 20, fontWeight: 700 }}>{idx}</span>
        <div className="col">
          <h3 style={{ font: 'var(--h3)', margin: 0 }}>{title}</h3>
          <span className="muted" style={{ font: 'var(--body-sm)' }}>{tagline}</span>
        </div>
      </div>
      <div className="col" style={{ gap: 11 }}>
        {items.map((it, i) => (
          <div key={i} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <Icon name="Check" size={18} color={tone} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ font: 'var(--body)' }}>{t(it)}</span>
          </div>
        ))}
      </div>
      <button className="btn btn--outline" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => app.go(to)}>
        {cta}<Icon name="ArrowRight" size={16} />
      </button>
    </div>
  );
  return (
    <div className="wrap" style={{ marginTop: 92 }}>
      <SectionHead center eyebrow={t({ zh: '印刷電商的兩大 AI 應用方向', en: 'Two AI directions' })}
        title={t({ zh: 'AI 讓設計更簡單，讓印刷更聰明', en: 'AI makes design simpler & print smarter' })} />
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 36, gap: 28 }}>
        <Col tone="var(--teal-500)" idx="1" title={t({ zh: 'AI 設計創作', en: 'AI Design Creation' })}
          tagline={t({ zh: '讓不會設計的人，也能快速做好設計', en: 'Great design for non-designers' })}
          items={design} cta={t({ zh: '進設計工作室', en: 'Open studio' })} to="studio" />
        <Col tone="var(--orange-500)" idx="2" title={t({ zh: 'AI 印刷流程優化', en: 'AI Print Optimization' })}
          tagline={t({ zh: '讓報價更快、更準，生產更順暢', en: 'Faster, sharper quotes & smoother production' })}
          items={print} cta={t({ zh: '試算印刷報價', en: 'Get a quote' })} to="quote" />
      </div>
    </div>
  );
}

function ClosingCTA() {
  const app = useApp_L(); const t = makeT_L(app.lang);
  return (
    <div className="wrap" style={{ marginTop: 92 }}>
      <div className="theme-ink card--pad" style={{ borderRadius: 'var(--r-2xl)', background: 'linear-gradient(135deg, var(--teal-800), var(--teal-900))', color: '#fff', padding: 56, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 120% at 90% 10%, rgba(241,142,27,.22), transparent 55%)' }} />
        <div className="col center" style={{ gap: 18, position: 'relative' }}>
          <AIBadge label={t({ zh: '從創意到生產，一站式完成', en: 'Idea to production, all in one' })} />
          <h2 style={{ font: 'var(--h1)', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            {t({ zh: '今天就用 AI，做出你的第一份印刷品', en: 'Make your first print today, with AI' })}
          </h2>
          <p style={{ color: 'var(--teal-100)', maxWidth: 560, font: 'var(--body-lg)', margin: 0 }}>
            {t({ zh: '不需要設計軟體、不需要懂印刷規範。一句話，AI 幫你完成。', en: 'No design software, no print know-how. One sentence — AI does the rest.' })}
          </p>
          <div className="row" style={{ gap: 12, marginTop: 6 }}>
            <button className="btn btn--accent btn--lg" onClick={() => app.go('studio')}><Icon name="Sparkles" size={18} />{t({ zh: '免費開始設計', en: 'Start free' })}</button>
            <button className="btn btn--lg" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={() => app.go('quote')}>{t({ zh: '先看報價', en: 'See pricing' })}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div>
      <Hero />
      <FlowStrip />
      <PainGrid />
      <Pillars />
      <ClosingCTA />
      <div style={{ height: 72 }} />
    </div>
  );
}

Object.assign(window, { Landing });
