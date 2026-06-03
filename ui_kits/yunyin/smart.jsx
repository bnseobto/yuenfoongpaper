/* smart.jsx — 智慧包裝 / 連網防偽
   把永豐集團既有的「雲端驗證(nbp.yfp.com.tw)＋可變資料印刷(VDP)」自助化、AI 化，
   下放給 cloudw2p 的微型商家。QR 為真實生成（瀏覽器端，免後端）。 */
const { useApp: useApp_SM, makeT: makeT_SM } = window;
const { useState: useState_SM, useEffect: useEffect_SM } = React;

function smartSerial() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `YFP-2026-${n}`;
}

/* 真實 QR（呼叫 LiveAI.qr，瀏覽器端生成；載入中顯示 spinner）*/
function SmartQr({ text, size = 180, dark }) {
  const [url, setUrl] = useState_SM(null);
  useEffect_SM(() => {
    let on = true;
    const live = typeof window !== 'undefined' && window.LiveAI;
    if (live && live.qr) live.qr(text, { width: size * 2, color: { dark: dark || '#163A40', light: '#FFFFFF' } })
      .then(u => { if (on) setUrl(u); }).catch(() => {});
    return () => { on = false; };
  }, [text, size, dark]);
  if (!url) return <div style={{ width: size, height: size, display: 'grid', placeItems: 'center', background: '#fff', borderRadius: 10, border: '1px solid var(--n-200)' }}><Icon name="LoaderCircle" size={20} className="spin" color="var(--teal-500)" /></div>;
  return <img src={url} width={size} height={size} alt="QR" style={{ borderRadius: 10, display: 'block' }} />;
}

/* 手機外框 */
function Phone({ children }) {
  return (
    <div style={{ width: 300, maxWidth: '100%', border: '10px solid #1c1c1e', borderRadius: 34, overflow: 'hidden', boxShadow: 'var(--sh-xl)', background: '#fff' }}>
      <div style={{ height: 26, background: '#1c1c1e', display: 'grid', placeItems: 'center' }}>
        <span style={{ width: 70, height: 5, borderRadius: 4, background: '#3a3a3c' }} />
      </div>
      {children}
    </div>
  );
}

function Bullet({ icon, color, children }) {
  return <span className="row" style={{ gap: 10, font: 'var(--body-sm)', alignItems: 'flex-start' }}>
    <Icon name={icon} size={16} color={color || 'var(--teal-500)'} style={{ flexShrink: 0, marginTop: 2 }} />
    <span>{children}</span>
  </span>;
}

function Smart() {
  const app = useApp_SM(); const t = makeT_SM(app.lang);
  const TABS = [
    { id: 'qr', label: t({ zh: '連網 QR 標籤', en: 'Smart QR' }) },
    { id: 'verify', label: t({ zh: '掃碼驗真 + DPP', en: 'Verify + DPP' }) },
    { id: 'vdp', label: t({ zh: '個人化批次 VDP', en: 'Personalized VDP' }) },
    { id: 'ar', label: t({ zh: 'AR 預覽', en: 'AR Preview' }) },
  ];
  const [tab, setTab] = useState_SM('qr');
  const [serial, setSerial] = useState_SM(smartSerial());
  // 指向永豐真實的雲端驗證平台，現場掃碼可實際跳轉（強化「接上既有平台」的故事）
  const verifyUrl = `https://nbp.yfp.com.tw/?code=${serial}`;

  // VDP
  const NAMES = ['王小明', '陳美麗', '林志豪', '張怡君', '李俊宏', '黃雅婷'];
  const [vdpRun, setVdpRun] = useState_SM(false);

  return (
    <div className="wrap col" style={{ gap: 20 }}>
      <div className="col" style={{ gap: 6 }}>
        <span className="row center" style={{ gap: 8 }}>
          <AIBadge label={t({ zh: '新功能', en: 'New' })} />
          <h2 style={{ font: 'var(--h2)', margin: 0 }}>{t({ zh: '智慧包裝 · 連網防偽', en: 'Smart Packaging' })}</h2>
        </span>
        <p className="muted" style={{ margin: 0, maxWidth: 720 }}>
          {t({ zh: '把永豐集團既有的「雲端驗證 + 可變資料印刷」自助化，讓微型商家也能一鍵買到大企業級的防偽連網包裝。',
            en: 'Self-serve access to Yuen Foong’s enterprise verification & variable-data printing — for micro-businesses.' })}
        </p>
      </div>

      <Tabs value={tab} onChange={setTab} tabs={TABS.map(x => ({ id: x.id, label: x.label }))} />

      {/* ---------- 連網 QR 標籤 ---------- */}
      {tab === 'qr' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          <div className="card card--pad col" style={{ gap: 14, alignItems: 'center' }}>
            {/* 產品標籤 mock */}
            <div style={{ width: '100%', maxWidth: 360, borderRadius: 14, padding: 20, background: 'var(--paper-100)', border: '1px solid var(--n-200)', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="col" style={{ flex: 1, gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>CAFE DAY</span>
                <span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '手沖咖啡禮盒', en: 'Pour-over gift box' })}</span>
                <span className="row center" style={{ gap: 6, marginTop: 6, font: 'var(--caption)', color: 'var(--teal-600)' }}>
                  <Icon name="ShieldCheck" size={14} />{t({ zh: '永豐雲端驗證', en: 'YFP Verify' })}
                </span>
                <span className="num" style={{ font: 'var(--caption)', color: 'var(--color-fg-muted)' }}>{serial}</span>
              </div>
              <div style={{ background: '#fff', padding: 8, borderRadius: 10, border: '1px solid var(--n-200)' }}>
                <SmartQr text={verifyUrl} size={108} />
              </div>
            </div>
            <button className="btn btn--outline btn--sm" onClick={() => setSerial(smartSerial())}>
              <Icon name="RefreshCw" size={15} />{t({ zh: '產生新的唯一序號', en: 'New serial' })}
            </button>
          </div>
          <div className="card card--pad col" style={{ gap: 12 }}>
            <strong style={{ font: 'var(--h4)' }}>{t({ zh: '一張標籤，三件事一次完成', en: 'One label, three jobs' })}</strong>
            <Bullet icon="QrCode">{t({ zh: '每件唯一序號 QR，自動生成、逐件不同。', en: 'Unique serialized QR per item.' })}</Bullet>
            <Bullet icon="ShieldCheck">{t({ zh: '掃碼即驗真——直接串永豐既有的雲端驗證平台。', en: 'Scan to verify via YFP’s existing platform.' })}</Bullet>
            <Bullet icon="Globe">{t({ zh: '掃碼進品牌微網站，把一張貼紙變成數位入口。', en: 'Scan opens a branded micro-site.' })}</Bullet>
            <Bullet icon="Nfc" color="var(--orange-500)">{t({ zh: '可加購 NFC 感應標籤（高端產品線）。', en: 'Optional NFC tap (premium SKUs).' })}</Bullet>
            <div className="row center" style={{ gap: 8, marginTop: 6, padding: 12, background: 'var(--teal-50)', borderRadius: 10, font: 'var(--caption)', color: 'var(--teal-700)' }}>
              <Icon name="Sparkles" size={15} color="var(--teal-500)" />
              {t({ zh: '商機：每件掃碼 = 經常性驗證收入 + 第一方消費者數據。', en: 'Each scan = recurring revenue + first-party data.' })}
            </div>
          </div>
        </div>
      )}

      {/* ---------- 掃碼驗真 + DPP ---------- */}
      {tab === 'verify' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          <div className="card card--pad col center" style={{ gap: 14 }}>
            <Phone>
              <div className="col" style={{ padding: 16, gap: 12 }}>
                <div className="col center" style={{ gap: 6, padding: '8px 0' }}>
                  <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--success-50, #E6F6EC)', display: 'grid', placeItems: 'center' }}>
                    <Icon name="BadgeCheck" size={30} color="var(--success-500)" />
                  </span>
                  <strong style={{ font: 'var(--h4)' }}>{t({ zh: '正品認證', en: 'Authentic' })}</strong>
                  <span className="row center" style={{ gap: 5, font: 'var(--caption)', color: 'var(--teal-600)' }}>
                    <Icon name="ShieldCheck" size={13} />{t({ zh: '永豐雲端驗證', en: 'YFP Cloud Verify' })}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 10 }} className="col">
                  <span style={{ fontWeight: 700 }}>CAFE DAY · {t({ zh: '手沖咖啡禮盒', en: 'Pour-over box' })}</span>
                  <span className="num muted" style={{ font: 'var(--caption)' }}>{serial}</span>
                </div>
                <div className="col" style={{ gap: 6 }}>
                  <span style={{ font: 'var(--caption)', fontWeight: 700, color: 'var(--color-fg-2)' }}>{t({ zh: '防偽層', en: 'Security' })}</span>
                  <Bullet icon="ScanLine">{t({ zh: '鈔券級微縮文字', en: 'Microtext' })}</Bullet>
                  <Bullet icon="Hash">{t({ zh: '數碼序列化', en: 'Serialization' })}</Bullet>
                  <Bullet icon="Lock">{t({ zh: '防拆封條', en: 'Tamper-evident' })}</Bullet>
                </div>
                <div className="col" style={{ gap: 6 }}>
                  <span style={{ font: 'var(--caption)', fontWeight: 700, color: 'var(--color-fg-2)' }}>{t({ zh: '數位產品護照 DPP', en: 'Digital Product Passport' })}</span>
                  <Bullet icon="Leaf" color="var(--success-500)">{t({ zh: '材質：FSC 認證紙 270P', en: 'FSC paper 270P' })}</Bullet>
                  <Bullet icon="MapPin">{t({ zh: '產地：台灣', en: 'Made in Taiwan' })}</Bullet>
                  <Bullet icon="Recycle" color="var(--success-500)">{t({ zh: '碳足跡 12g · 可回收', en: '12g CO₂e · recyclable' })}</Bullet>
                </div>
                <div className="row center" style={{ gap: 6, padding: 8, background: 'var(--paper-100)', borderRadius: 8, font: 'var(--caption)', color: 'var(--color-fg-muted)' }}>
                  <Icon name="MapPin" size={13} />{t({ zh: '第 1 次掃描 · 台北市 · 2026/06/03', en: 'Scan #1 · Taipei · 2026/06/03' })}
                </div>
              </div>
            </Phone>
          </div>
          <div className="card card--pad col" style={{ gap: 14 }}>
            <strong style={{ font: 'var(--h4)' }}>{t({ zh: '把驗真做成消費者體驗', en: 'Verification as experience' })}</strong>
            <div className="row center" style={{ gap: 14 }}>
              <div style={{ background: '#fff', padding: 8, borderRadius: 10, border: '1px solid var(--n-200)' }}><SmartQr text={verifyUrl} size={120} /></div>
              <span className="muted" style={{ font: 'var(--body-sm)' }}>{t({ zh: '掃這個 QR → 跳出左邊這頁。每次掃描都被記錄，可做防偽熱點分析。', en: 'Scan this → the page on the left. Every scan logged for hotspot analytics.' })}</span>
            </div>
            <Bullet icon="ShieldCheck">{t({ zh: '疊在永豐既有的鈔券級實體防偽之上，別人抄不走。', en: 'Layered on YFP banknote-grade physical security.' })}</Bullet>
            <Bullet icon="FileCheck">{t({ zh: 'DPP 是歐盟法規順風（登錄系統 2026/7 上線），外銷品牌會需要。', en: 'EU DPP regulation tailwind (registry live Jul 2026).' })}</Bullet>
            <Bullet icon="TrendingUp" color="var(--orange-500)">{t({ zh: '從「賣印刷品」升級成「賣驗證 + 數據訂閱」。', en: 'From selling prints to selling verification + data.' })}</Bullet>
          </div>
        </div>
      )}

      {/* ---------- 個人化批次 VDP ---------- */}
      {tab === 'vdp' && (
        <div className="col" style={{ gap: 16 }}>
          <div className="card card--pad row between center wraprow" style={{ gap: 12 }}>
            <div className="col" style={{ gap: 4 }}>
              <strong style={{ font: 'var(--h4)' }}>{t({ zh: '上傳名單，AI 一次生成每份不同', en: 'Upload list, AI personalizes each' })}</strong>
              <span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '示意名單：', en: 'Sample list: ' })}{NAMES.join('、')}</span>
            </div>
            <button className="btn btn--accent" onClick={() => setVdpRun(true)}>
              <Icon name="Sparkles" size={16} />{t({ zh: '生成個人化批次', en: 'Generate batch' })}
            </button>
          </div>
          {vdpRun && (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {NAMES.map((nm, i) => (
                <div key={i} className="card pop" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="col" style={{ flex: 1, gap: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>CAFE DAY</span>
                    <span style={{ font: 'var(--body-sm)' }}>{t({ zh: '致 ', en: 'To ' })}{nm}</span>
                    <span className="num muted" style={{ font: 'var(--caption)' }}>YFP-{1001 + i}</span>
                  </div>
                  <SmartQr text={`https://nbp.yfp.com.tw/?code=YFP-${1001 + i}`} size={64} />
                </div>
              ))}
            </div>
          )}
          {vdpRun && <div className="row center" style={{ gap: 8, font: 'var(--caption)', color: 'var(--teal-700)' }}>
            <Icon name="Info" size={14} color="var(--teal-500)" />{t({ zh: '一次印 2000 份、每份姓名與 QR 皆不同——直郵回應率可顯著提升。', en: 'Print 2000, each unique — lifts direct-mail response.' })}
          </div>}
          {!vdpRun && <div className="card col center" style={{ padding: 48, gap: 10, borderStyle: 'dashed', textAlign: 'center' }}>
            <Icon name="Users" size={32} color="var(--teal-400)" />
            <span className="muted">{t({ zh: '按上方按鈕，看 AI 把同一個設計變成每人專屬的版本。', en: 'Click above to see per-person variants.' })}</span>
          </div>}
        </div>
      )}

      {/* ---------- AR 預覽（示意）---------- */}
      {tab === 'ar' && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          <div className="card card--pad col center" style={{ gap: 12 }}>
            <Phone>
              <div style={{ position: 'relative', height: 420, background: 'linear-gradient(160deg,#2E7D95,#163A40)', overflow: 'hidden' }}>
                {/* 產品 */}
                <div style={{ position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%,-50%)', width: 150, height: 200, borderRadius: 14, background: 'var(--paper-100)', boxShadow: '0 18px 40px rgba(0,0,0,.4)', display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#5B4334' }}>CAFE DAY</span>
                </div>
                {/* AR 浮層（示意）*/}
                <div className="pop" style={{ position: 'absolute', left: '14%', top: '16%', background: 'rgba(255,255,255,.92)', borderRadius: 12, padding: '8px 12px', boxShadow: 'var(--sh-lg)', font: 'var(--caption)', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Icon name="Star" size={14} color="var(--orange-500)" />{t({ zh: '產地故事影片', en: 'Origin story' })}
                </div>
                <div className="pop" style={{ position: 'absolute', right: '12%', bottom: '20%', background: 'rgba(255,255,255,.92)', borderRadius: 12, padding: '8px 12px', boxShadow: 'var(--sh-lg)', font: 'var(--caption)', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Icon name="Gift" size={14} color="var(--teal-500)" />{t({ zh: '掃碼領優惠', en: 'Scan for coupon' })}
                </div>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, display: 'grid', placeItems: 'center' }}>
                  <span className="row center" style={{ gap: 6, background: 'var(--orange-500)', color: '#fff', padding: '8px 14px', borderRadius: 999, font: 'var(--caption)', fontWeight: 700 }}>
                    <Icon name="Scan" size={15} />{t({ zh: '掃描看 AR', en: 'View in AR' })}
                  </span>
                </div>
              </div>
            </Phone>
            <span className="tag" style={{ background: 'var(--paper-200)', color: 'var(--color-fg-muted)', font: 'var(--caption)' }}>{t({ zh: '示意畫面（非真實 AR）', en: 'Mockup (not live AR)' })}</span>
          </div>
          <div className="card card--pad col" style={{ gap: 14 }}>
            <strong style={{ font: 'var(--h4)' }}>{t({ zh: '讓包裝會說話', en: 'Packaging that talks' })}</strong>
            <Bullet icon="Sparkles">{t({ zh: '掃描包裝 → 跳出產地故事、3D 商品、優惠遊戲。', en: 'Scan → origin story, 3D product, coupon game.' })}</Bullet>
            <Bullet icon="TrendingUp" color="var(--orange-500)">{t({ zh: '互動式印刷比靜態多 2–4 倍互動、購買意願 +51%。', en: 'Interactive print: 2–4× engagement, +51% purchase intent.' })}</Bullet>
            <Bullet icon="Database">{t({ zh: '每次掃描都是零媒體成本的第一方數據。', en: 'Each scan = zero-media first-party data.' })}</Bullet>
            <span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '真 AR 體驗(WebXR)為下一階段；此頁先示意流程與價值。', en: 'Real WebXR AR is a next phase; this shows the flow.' })}</span>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Smart });
