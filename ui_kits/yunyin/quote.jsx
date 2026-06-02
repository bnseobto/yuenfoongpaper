/* quote.jsx — AI 報價 + 規格材質推薦: 15-sec parallel quote across factories */
const { useApp: useApp_Q, makeT: makeT_Q, useFakeRun: useFakeRun_Q } = window;
const { useState, useEffect, useRef, useCallback } = React;

const MATERIALS = [
  { id: 'ivory', name: { zh: '象牙卡 270P', en: 'Ivory 270gsm' }, mult: 1, rec: true, tags: { zh: '挺度佳・質感', en: 'Sturdy · premium' } },
  { id: 'coated', name: { zh: '銅版紙 250P', en: 'Coated 250gsm' }, mult: 0.82, rec: false, tags: { zh: '經濟・滑面', en: 'Economical · glossy' } },
  { id: 'cotton', name: { zh: '棉紙 300P', en: 'Cotton 300gsm' }, mult: 1.45, rec: false, tags: { zh: '高級・觸感', en: 'Luxe · textured' } },
  { id: 'kraft', name: { zh: '牛皮卡 280P', en: 'Kraft 280gsm' }, mult: 0.95, rec: false, tags: { zh: '自然・環保', en: 'Natural · eco' } },
];
const QTYS = [100, 500, 1000, 2000, 5000];

function Quote() {
  const app = useApp_Q(); const t = makeT_Q(app.lang);
  const [mat, setMat] = useState('ivory');
  const [qty, setQty] = useState(2000);
  const [duplex, setDuplex] = useState(true);
  const [finish, setFinish] = useState({ matte: true, spot: false, round: false });
  const [quoted, setQuoted] = useState(false);
  const run = useFakeRun_Q(1700);

  const m = MATERIALS.find(x => x.id === mat);
  const base = 0.55; // per unit base
  const finishAdd = (finish.matte ? 0.06 : 0) + (finish.spot ? 0.22 : 0) + (finish.round ? 0.04 : 0);
  const unit = (base * m.mult + (duplex ? 0.18 : 0) + finishAdd);
  const tierDiscount = qty >= 5000 ? 0.7 : qty >= 2000 ? 0.8 : qty >= 1000 ? 0.88 : qty >= 500 ? 0.95 : 1;
  const perUnit = unit * tierDiscount;
  const fmt = n => 'NT$' + Math.round(n).toLocaleString();
  const plans = [
    { id: 'save', icon: 'PiggyBank', tone: 'var(--teal-500)', label: { zh: '最省方案', en: 'Lowest cost' }, factory: { zh: '中部・大宗印刷廠', en: 'Central · bulk' }, mul: 0.92, days: '5–6', co2: '低' },
    { id: 'value', icon: 'Sparkles', tone: 'var(--orange-500)', label: { zh: 'CP 值最佳', en: 'Best value' }, factory: { zh: '永豐合作旗艦廠', en: 'YFP flagship' }, mul: 1.0, days: '3–4', co2: '中', best: true },
    { id: 'fast', icon: 'Rocket', tone: 'var(--coffee-500)', label: { zh: '最快交期', en: 'Fastest' }, factory: { zh: '北部・急件廠', en: 'North · express' }, mul: 1.18, days: '1–2', co2: '中' },
  ];
  const total = perUnit * qty;

  return (
    <div className="wrap" style={{ maxWidth: 1140 }}>
      <SectionHead eyebrow={t({ zh: '痛點 07 + 09 · 報價慢、不知選什麼規格', en: 'Pain 07 + 09' })}
        title={t({ zh: '15 秒極速報價，AI 幫你選最划算的規格', en: '15-sec quote + AI picks the best-value spec' })}
        sub={t({ zh: 'AI 平行計算多家工廠的產能、原料與工時，即時給出最精準的跨廠報價與材質建議。', en: 'AI computes capacity, material & labour across factories in parallel for instant, accurate quotes.' })} />
      <div className="grid" style={{ gridTemplateColumns: '380px 1fr', gap: 24, marginTop: 28, alignItems: 'start' }}>
        {/* spec form */}
        <div className="card card--pad col" style={{ gap: 18 }}>
          <div className="row center" style={{ gap: 10 }}><Icon name="ClipboardList" size={20} color="var(--teal-500)" /><strong style={{ font: 'var(--h4)' }}>{t({ zh: '訂單規格', en: 'Order spec' })}</strong></div>
          <div className="field"><label>{t({ zh: '品項 · 尺寸', en: 'Item · Size' })}</label>
            <div className="row center" style={{ gap: 8 }}><span className="chip chip--on">{t({ zh: '名片', en: 'Card' })}</span><span className="num muted" style={{ font: 'var(--body-sm)' }}>90 × 54 mm</span></div></div>
          <div className="field"><label>{t({ zh: '材質', en: 'Material' })}</label>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {MATERIALS.map(x => (
                <button key={x.id} onClick={() => setMat(x.id)} className="col" style={{ alignItems: 'flex-start', gap: 3, padding: '9px 11px', borderRadius: 10, border: `1.5px solid ${mat === x.id ? 'var(--teal-500)' : 'var(--color-border)'}`, background: mat === x.id ? 'var(--teal-50)' : 'var(--paper-0)', cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                  <span style={{ font: 'var(--caption)', fontWeight: 700 }}>{t(x.name)}</span>
                  <span className="muted" style={{ font: 'var(--overline)' }}>{t(x.tags)}</span>
                  {x.rec && <span style={{ position: 'absolute', top: 6, right: 6 }}><Icon name="Sparkles" size={13} color="var(--orange-500)" /></span>}
                </button>
              ))}
            </div>
          </div>
          <div className="field"><label>{t({ zh: '印刷面', en: 'Sides' })}</label>
            <div className="row" style={{ gap: 8 }}>
              <button className={'chip' + (duplex ? ' chip--on' : '')} onClick={() => setDuplex(true)}>{t({ zh: '雙面彩印', en: 'Double-sided' })}</button>
              <button className={'chip' + (!duplex ? ' chip--on' : '')} onClick={() => setDuplex(false)}>{t({ zh: '單面', en: 'Single' })}</button>
            </div>
          </div>
          <div className="field"><label>{t({ zh: '加工', en: 'Finishing' })}</label>
            <div className="row wraprow" style={{ gap: 8 }}>
              {[['matte', { zh: '霧膜', en: 'Matte' }], ['spot', { zh: '局部光 UV', en: 'Spot UV' }], ['round', { zh: '圓角', en: 'Rounded' }]].map(([k, lbl]) => (
                <button key={k} className={'chip' + (finish[k] ? ' chip--on' : '')} onClick={() => setFinish(f => ({ ...f, [k]: !f[k] }))}>{finish[k] && <Icon name="Check" size={13} />}{t(lbl)}</button>
              ))}
            </div>
          </div>
          <div className="field"><label>{t({ zh: '數量', en: 'Quantity' })}</label>
            <div className="row wraprow" style={{ gap: 6 }}>
              {QTYS.map(q => <button key={q} className={'chip num' + (qty === q ? ' chip--on' : '')} onClick={() => setQty(q)}>{q.toLocaleString()}</button>)}
            </div>
          </div>
          <button className="btn btn--accent btn--lg btn--block" disabled={run.running} onClick={() => run.run(() => setQuoted(true))}>
            {run.running ? <><Icon name="LoaderCircle" size={18} className="spin" />{t({ zh: '平行計算中…', en: 'Computing…' })}</> : <><Icon name="Timer" size={18} />{t({ zh: '15 秒極速報價', en: '15-sec quote' })}</>}
          </button>
        </div>

        {/* result */}
        <div className="col" style={{ gap: 18 }}>
          {!quoted && !run.running ? (
            <div className="card col center" style={{ gap: 14, padding: 60, textAlign: 'center', borderStyle: 'dashed' }}>
              <span style={{ width: 64, height: 64, borderRadius: 18, background: '#FEF1E0', display: 'grid', placeItems: 'center' }}><Icon name="Timer" size={32} color="var(--orange-500)" /></span>
              <h3 style={{ font: 'var(--h3)', margin: 0 }}>{t({ zh: '調整規格，立即試算', en: 'Set your spec, get a quote' })}</h3>
              <p className="muted" style={{ maxWidth: 360, margin: 0 }}>{t({ zh: 'AI 會平行計算多家工廠，給你最省、最快與 CP 值最佳三種方案。', en: 'AI compares factories for the cheapest, fastest & best-value plans.' })}</p>
            </div>
          ) : run.running ? (
            <div className="card col center" style={{ gap: 18, padding: 60 }}>
              <div className="row center" style={{ gap: 6 }}>{[0, 1, 2, 3, 4].map(i => <span key={i} style={{ width: 30, height: 38, borderRadius: 7, background: 'var(--teal-100)', display: 'grid', placeItems: 'center', animation: `aipulse 1s ${i * 0.12}s infinite var(--ease-out)` }}><Icon name="Factory" size={16} color="var(--teal-600)" /></span>)}</div>
              <div className="col center" style={{ gap: 4 }}>
                <span className="num" style={{ font: 'var(--display)', color: 'var(--teal-600)' }}>{Math.round(run.progress * 230)}<span style={{ fontSize: 18 }}> {t({ zh: '家工廠', en: 'factories' })}</span></span>
                <span className="muted">{t({ zh: '平行計算產能・原料・工時・交期…', en: 'Computing capacity, material, labour, lead time…' })}</span>
              </div>
            </div>
          ) : (
            <div className="rise col" style={{ gap: 18 }}>
              {/* AI material reco */}
              <div className="card card--pad statuscard statuscard--info row center" style={{ gap: 12 }}>
                <Icon name="Sparkles" size={22} color="var(--teal-500)" />
                <div className="col" style={{ flex: 1 }}>
                  <span style={{ font: 'var(--body-sm)', fontWeight: 700 }}>{t({ zh: 'AI 材質建議：象牙卡 270P', en: 'AI suggests: Ivory 270gsm' })}</span>
                  <span className="muted" style={{ font: 'var(--caption)' }}>{t({ zh: '名片用途下挺度與質感最平衡，CP 值最高；棉紙更高級但成本 +45%。', en: 'Best balance of sturdiness & feel for cards; cotton is nicer but +45% cost.' })}</span>
                </div>
              </div>
              {/* three plans */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {plans.map(p => (
                  <div key={p.id} className="card card--pad col" style={{ gap: 10, borderWidth: p.best ? 2 : 1, borderColor: p.best ? 'var(--orange-500)' : 'var(--color-divider)', position: 'relative' }}>
                    {p.best && <span style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: 999, background: 'var(--orange-500)', color: '#fff', font: 'var(--overline)', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{t({ zh: '推薦', en: 'PICK' })}</span>}
                    <span className="row center" style={{ gap: 8 }}><Icon name={p.icon} size={18} color={p.tone} /><strong style={{ font: 'var(--body-sm)', fontWeight: 700 }}>{t(p.label)}</strong></span>
                    <span className="num" style={{ font: 'var(--h2)', color: 'var(--color-fg)' }}>{fmt(total * p.mul)}</span>
                    <span className="muted num" style={{ font: 'var(--caption)' }}>{fmt(perUnit * p.mul)} / {t({ zh: '張', en: 'ea' })}</span>
                    <hr className="divider" />
                    <span className="row center" style={{ gap: 7, font: 'var(--caption)' }}><Icon name="Truck" size={14} color="var(--color-fg-muted)" />{t({ zh: '交期', en: 'Lead' })} <strong className="num">{p.days} {t({ zh: '天', en: 'd' })}</strong></span>
                    <span className="row center" style={{ gap: 7, font: 'var(--caption)' }}><Icon name="Factory" size={14} color="var(--color-fg-muted)" />{t(p.factory)}</span>
                    <span className="row center" style={{ gap: 7, font: 'var(--caption)' }}><Icon name="Leaf" size={14} color="var(--success-500)" />{t({ zh: '碳排', en: 'CO₂' })} {p.co2}</span>
                    <button className={'btn btn--block btn--sm ' + (p.best ? 'btn--accent' : 'btn--outline')} style={{ marginTop: 4 }} onClick={() => app.go('order')}>{t({ zh: '選這個方案', en: 'Choose' })}</button>
                  </div>
                ))}
              </div>
              <div className="row center between wraprow" style={{ gap: 10 }}>
                <span className="muted row center" style={{ gap: 6, font: 'var(--caption)' }}><Icon name="Info" size={14} />{t({ zh: '報價已含稅與標準物流；急件另計。', en: 'Incl. tax & standard shipping; express extra.' })}</span>
                <button className="btn btn--ghost btn--sm" onClick={() => app.go('preflight')}><Icon name="ScanSearch" size={15} />{t({ zh: '回印前預檢', en: 'Back to preflight' })}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Quote });
