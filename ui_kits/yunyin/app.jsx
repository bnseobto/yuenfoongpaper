/* app.jsx — shell: top nav, router, footer, context provider, tweaks */
const { AppCtx: AppCtx_R, makeT: makeT_R, Landing, Studio, ImageLab, Preflight, Quote, Order, Smart, Market } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakRadio, TweakColor, TweakSlider } = window;
const { useState, useEffect, useRef, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "primary": "#2E7D95",
  "accent": "#F18E1B",
  "heroLayout": "左右圖文",
  "studioMode": "對話式",
  "radius": 1
}/*EDITMODE-END*/;
const BRAND_CLASS = { '#2E7D95': '', '#3A55A8': 'brand-indigo', '#1F7A52': 'brand-pine' };
const ACCENT_CLASS = { '#F18E1B': '', '#E8553D': 'accent-coral', '#E0A416': 'accent-amber' };

const SCREENS = {
  home: Landing, studio: Studio, market: Market, imagelab: ImageLab,
  smart: Smart, preflight: Preflight, quote: Quote, order: Order,
};
const NAV = [
  { id: 'home', icon: 'House', label: { zh: '首頁', en: 'Home' } },
  { id: 'studio', icon: 'Sparkles', label: { zh: 'AI 設計工作室', en: 'AI Studio' } },
  { id: 'market', icon: 'Store', label: { zh: '設計市集', en: 'Market' } },
  { id: 'imagelab', icon: 'Wand2', label: { zh: 'AI 影像工具', en: 'Image Tools' } },
  { id: 'smart', icon: 'QrCode', label: { zh: '智慧包裝', en: 'Smart Pack' } },
  { id: 'preflight', icon: 'ScanSearch', label: { zh: '印前預檢', en: 'Preflight' } },
  { id: 'quote', icon: 'Timer', label: { zh: '報價', en: 'Quote' } },
  { id: 'order', icon: 'PackageCheck', label: { zh: '訂單 / Brand Kit', en: 'Orders' } },
];

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState('home');
  const [params, setParams] = useState({});
  const [lang, setLang] = useState('zh');
  const scroller = useRef(null);
  const go = useCallback((s, p = {}) => { setScreen(s); setParams(p); if (scroller.current) scroller.current.scrollTop = 0; }, []);
  const t = makeT_R(lang);
  const Screen = SCREENS[screen] || Landing;

  const rootClass = ['app', tw.dark ? 'theme-ink' : '', BRAND_CLASS[tw.primary] || '', ACCENT_CLASS[tw.accent] || ''].filter(Boolean).join(' ');
  const rmul = tw.radius;
  const radiusVars = { '--r-sm': `${Math.round(6 * rmul)}px`, '--r-md': `${Math.round(10 * rmul)}px`, '--r-lg': `${Math.round(14 * rmul)}px`, '--r-xl': `${Math.round(20 * rmul)}px`, '--r-2xl': `${Math.round(28 * rmul)}px` };

  return (
    <AppCtx_R.Provider value={{ screen, params, lang, go, t, tw }}>
      <div className={rootClass} style={radiusVars}>
        <header className="appbar">
          <button onClick={() => go('home')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}><Logo height={34} /></button>
          <nav className="appbar__nav">
            {NAV.map(n => (
              <button key={n.id} className={'navlink' + (screen === n.id ? ' navlink--active' : '')} onClick={() => go(n.id)}>
                <Icon name={n.icon} size={16} />{t(n.label)}
              </button>
            ))}
          </nav>
          <div className="appbar__spacer" />
          <div className="appbar__actions">
            <div className="seg">
              <button className={lang === 'zh' ? 'on' : ''} onClick={() => setLang('zh')}>中</button>
              <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            <button className="navlink" title={t({ zh: '通知', en: 'Notifications' })}><Icon name="Bell" size={19} /></button>
            <div className="avatar">CD</div>
          </div>
        </header>

        <main ref={scroller} className="screen" style={{ overflowY: 'auto', paddingTop: screen === 'home' ? 0 : 'var(--sp-10)' }}>
          <div key={screen} className="rise">
            <Screen />
          </div>
        </main>

        <footer style={{ borderTop: '1px solid var(--color-divider)', background: 'var(--paper-0)' }}>
          <div className="wrap row between center wraprow" style={{ gap: 16, padding: '24px var(--sp-8)' }}>
            <div className="row center" style={{ gap: 12 }}>
              <Logo height={26} />
              <span className="muted" style={{ font: 'var(--caption)' }}>© 2026 永豐紙業 YUEN FOONG PAPER · {t({ zh: 'AI 雲端設計與印刷平台', en: 'AI cloud design & print' })}</span>
            </div>
            <div className="row center" style={{ gap: 16, color: 'var(--color-fg-muted)', font: 'var(--caption)' }}>
              <span className="row center" style={{ gap: 6 }}><Icon name="ShieldCheck" size={15} color="var(--teal-500)" />ISO 27001 / 14298</span>
              <span className="row center" style={{ gap: 6 }}><Icon name="Leaf" size={15} color="var(--success-500)" />{t({ zh: '永續印刷', en: 'Sustainable print' })}</span>
            </div>
          </div>
        </footer>

        <TweaksPanel title="Tweaks">
          <TweakSection label="主題 Theme" />
          <TweakToggle label="深色模式 Dark" value={tw.dark} onChange={v => setTweak('dark', v)} />
          <TweakColor label="主色 Primary" value={tw.primary}
            options={['#2E7D95', '#3A55A8', '#1F7A52']} onChange={v => setTweak('primary', v)} />
          <TweakColor label="強調色 Accent" value={tw.accent}
            options={['#F18E1B', '#E8553D', '#E0A416']} onChange={v => setTweak('accent', v)} />
          <TweakSlider label="圓角 Radius" value={tw.radius} min={0.4} max={1.6} step={0.1}
            onChange={v => setTweak('radius', v)} />
          <TweakSection label="版面 Layout" />
          <TweakRadio label="首頁 Hero" value={tw.heroLayout}
            options={['左右圖文', '置中堆疊']} onChange={v => setTweak('heroLayout', v)} />
          <TweakRadio label="設計工作室" value={tw.studioMode}
            options={['對話式', '範本式']} onChange={v => setTweak('studioMode', v)} />
        </TweaksPanel>
      </div>
    </AppCtx_R.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
