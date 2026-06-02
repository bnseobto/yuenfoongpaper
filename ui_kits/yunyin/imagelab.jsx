/* imagelab.jsx — AI 影像工具（真功能：上傳後在瀏覽器端跑 ISNet/SlimSAM/Upscaler） */
const { useApp: useApp_I, makeT: makeT_I } = window;
const { useState, useEffect, useRef, useCallback } = React;
const SAMPLE_IMG = (typeof window !== 'undefined' && window.__resources && window.__resources.sampleCards) || '../../assets/sample-cards.png';

/* before/after drag slider with two real image sources */
function CompareSlider({ beforeSrc, afterSrc, afterChecker, badgeBefore, badgeAfter }) {
  const [split, setSplit] = useState(52); const ref = useRef(null);
  const onDown = () => {
    const move = (ev) => { const r = ref.current.getBoundingClientRect(); const x = (ev.touches ? ev.touches[0] : ev).clientX; setSplit(Math.max(4, Math.min(96, ((x - r.left) / r.width) * 100))); };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };
  return (
    <div ref={ref} className={afterChecker ? 'checker' : ''} style={{ position: 'relative', width: '100%', aspectRatio: '7/5', borderRadius: 14, overflow: 'hidden', userSelect: 'none', touchAction: 'none', background: 'var(--paper-100)' }}>
      <img src={beforeSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${split}%)` }} className={afterChecker ? 'checker' : ''}>
        <img src={afterSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <span style={{ position: 'absolute', left: 12, top: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(34,28,24,.7)', color: '#fff', font: 'var(--caption)', fontWeight: 600 }}>{badgeBefore}</span>
      <span style={{ position: 'absolute', right: 12, top: 12, padding: '4px 10px', borderRadius: 999, background: 'var(--teal-600)', color: '#fff', font: 'var(--caption)', fontWeight: 600 }}>{badgeAfter}</span>
      <div onPointerDown={onDown} style={{ position: 'absolute', top: 0, bottom: 0, left: `${split}%`, width: 3, background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,.15)', cursor: 'ew-resize', transform: 'translateX(-50%)' }}>
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 38, height: 38, borderRadius: '50%', background: '#fff', boxShadow: 'var(--sh-md)', display: 'grid', placeItems: 'center', color: 'var(--teal-600)' }}><Icon name="MoveHorizontal" size={18} /></span>
      </div>
    </div>
  );
}

function UploadZone({ onPick, onSample, t }) {
  const inp = useRef(null);
  const pick = (f) => { if (f) onPick(f); };
  return (
    <div className="card col center" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
      style={{ gap: 14, padding: 48, textAlign: 'center', borderStyle: 'dashed', cursor: 'pointer' }} onClick={() => inp.current.click()}>
      <input ref={inp} type="file" accept="image/*" hidden onChange={e => pick(e.target.files[0])} />
      <span style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--teal-50)', display: 'grid', placeItems: 'center' }}><Icon name="ImageUp" size={32} color="var(--teal-500)" /></span>
      <h3 style={{ font: 'var(--h3)', margin: 0 }}>{t({ zh: '上傳一張圖片', en: 'Upload an image' })}</h3>
      <p className="muted" style={{ margin: 0, maxWidth: 360 }}>{t({ zh: '拖曳或點擊上傳，AI 在你的瀏覽器本機處理，不會上傳到伺服器。', en: 'Drag or click. AI runs locally in your browser — nothing is uploaded.' })}</p>
      <button className="btn btn--outline btn--sm" onClick={e => { e.stopPropagation(); onSample(); }}><Icon name="Sparkles" size={15} />{t({ zh: '用範例圖試試', en: 'Try the sample' })}</button>
    </div>
  );
}

function ImageLab() {
  const app = useApp_I(); const t = makeT_I(app.lang);
  const TABS = [
    { id: 'removebg', icon: 'Scissors', label: t({ zh: '一鍵去背', en: 'Remove BG' }) },
    { id: 'upscale', icon: 'Sparkles', label: t({ zh: '提升解析度', en: 'Upscale' }) },
    { id: 'extract', icon: 'MousePointerClick', label: t({ zh: '元件擷取', en: 'Extract' }) },
    { id: 'export', icon: 'FileImage', label: t({ zh: '轉檔輸出', en: 'Export' }) },
  ];
  const [tab, setTab] = useState(app.params.tab && TABS.some(x => x.id === app.params.tab) ? app.params.tab : 'removebg');
  const [img, setImg] = useState(null);          // {url, blob}
  const [busy, setBusy] = useState(null);        // status text
  const [prog, setProg] = useState(0);
  const [result, setResult] = useState(null);    // {url, blob, transparent}
  const [factor, setFactor] = useState(2);
  const [fmt, setFmt] = useState('png');
  const [err, setErr] = useState(null);
  const imgRef = useRef(null);
  const live = typeof window !== 'undefined' && window.LiveAI;

  useEffect(() => { setResult(null); setErr(null); setBusy(null); }, [tab, img]);
  const pickFile = (file) => { const url = URL.createObjectURL(file); setImg({ url, blob: file }); setResult(null); };
  const useSample = async () => { try { const b = await fetch(SAMPLE_IMG).then(r => r.blob()); setImg({ url: SAMPLE_IMG, blob: b }); } catch (e) { setErr('範例載入失敗'); } };

  const run = async (fn, label) => {
    setErr(null); setBusy(label); setProg(0);
    try { await fn(); } catch (e) { console.error(e); setErr(unsupported(e) ? t({ zh: '此瀏覽器不支援或模型載入失敗（建議用桌機 Chrome/Edge）。', en: 'Unsupported browser or model load failed (use desktop Chrome/Edge).' }) : String(e.message || e)); }
    setBusy(null);
  };
  const unsupported = (e) => /webgpu|gpu|backend|import|fetch/i.test(String(e && e.message));

  const doRemoveBg = () => run(async () => {
    const out = await live.removeBg(img.blob, p => setProg(p));
    setResult({ url: URL.createObjectURL(out), blob: out, transparent: true });
  }, t({ zh: 'AI 去背中…', en: 'Removing…' }));

  const doUpscale = () => run(async () => {
    const el = imgRef.current || await imgEl(img.url);
    const dataUrl = await live.upscale(el, factor, p => setProg(p));
    const blob = await fetch(dataUrl).then(r => r.blob());
    setResult({ url: dataUrl, blob });
  }, t({ zh: 'AI 放大中…', en: 'Upscaling…' }));

  const doExtract = (e) => {
    const el = imgRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.round((e.clientX - r.left) / r.width * el.naturalWidth);
    const y = Math.round((e.clientY - r.top) / r.height * el.naturalHeight);
    run(async () => {
      const { cutBlob } = await live.segment(img.url, { x, y }, p => setProg(p));
      setResult({ url: URL.createObjectURL(cutBlob), blob: cutBlob, transparent: true });
    }, t({ zh: 'AI 擷取中…', en: 'Extracting…' }));
  };
  const imgEl = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  const exportNow = async () => {
    const source = (result && result.blob) || img.blob;
    if (fmt === 'pdf') { const pdf = await live.toPrintPDF(result ? result.url : img.url, { wmm: 90, hmm: 54, bleed: 3 }); live.download(pdf, 'yfp-print.pdf'); return; }
    const type = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
    const blob = fmt === 'png' && result && result.transparent ? source : await live.toBlob(result ? result.url : img.url, type);
    live.download(blob, 'yfp-export.' + (fmt === 'jpg' ? 'jpg' : 'png'));
  };

  const Status = () => busy ? (
    <div className="row center" style={{ gap: 10, color: 'var(--teal-600)', font: 'var(--body-sm)' }}>
      <Icon name="LoaderCircle" size={16} className="spin" />{busy}{prog > 0 && <span className="num">{Math.round(prog * 100)}%</span>}
    </div>
  ) : err ? (
    <div className="row center" style={{ gap: 8, color: 'var(--danger-600)', font: 'var(--body-sm)' }}><Icon name="TriangleAlert" size={16} />{err}</div>
  ) : null;

  const HEAD = {
    removebg: { e: { zh: '痛點 05 · 照片不會去背', en: 'Pain 05' }, h: { zh: 'AI 一鍵精準去背', en: 'One-click background removal' }, s: { zh: '上傳商品照，AI（ISNet）自動辨識主體並輸出透明背景。本機處理、不外傳。', en: 'Upload a photo — ISNet isolates the subject and outputs transparency, all locally.' } },
    upscale: { e: { zh: '痛點 02 · 解析度很差', en: 'Pain 02' }, h: { zh: 'AI 提升解析度', en: 'AI upscale' }, s: { zh: '低解析圖也能印得清楚，拖曳比較前後。', en: 'AI rebuilds detail. Drag to compare.' } },
    extract: { e: { zh: '痛點 06 · 想要圖中元件', en: 'Pain 06' }, h: { zh: '點一下，AI 拆出元件', en: 'Click to extract' }, s: { zh: '在圖上點選想要的物件，SlimSAM 會把它單獨切出來。', en: 'Click an object; SlimSAM cuts it out.' } },
    export: { e: { zh: '痛點 08 · 不會轉檔', en: 'Pain 08' }, h: { zh: '輸出印刷正確格式', en: 'Export print-correct files' }, s: { zh: '一鍵輸出透明 PNG、高解析 JPG 或含出血的印刷 PDF。', en: 'Export PNG / JPG / print-ready PDF with bleed.' } },
  }[tab];

  return (
    <div className="wrap" style={{ maxWidth: 940 }}>
      <div className="row between center wraprow" style={{ gap: 12, marginBottom: 22 }}>
        <Tabs value={tab} onChange={setTab} tabs={TABS} />
        {img && <button className="btn btn--outline btn--sm" onClick={() => { setImg(null); setResult(null); }}><Icon name="RefreshCw" size={15} />{t({ zh: '換一張', en: 'Change' })}</button>}
      </div>
      <div className="rise" key={tab}>
        <div className="col" style={{ gap: 16 }}>
          <SectionHead eyebrow={t(HEAD.e)} title={t(HEAD.h)} sub={t(HEAD.s)} />
          {!live && <div className="card card--pad statuscard statuscard--warn" style={{ font: 'var(--body-sm)' }}>{t({ zh: '真 AI 模組未載入，目前為展示模式。', en: 'AI module not loaded — demo mode.' })}</div>}

          {!img ? <UploadZone onPick={pickFile} onSample={useSample} t={t} /> : (
            <>
              {/* preview area per tab */}
              {tab === 'extract' ? (
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '7/5', background: 'var(--paper-100)' }} className={result ? 'checker' : ''}>
                    <img ref={imgRef} src={result ? result.url : img.url} alt="" onClick={!result ? doExtract : undefined}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: result ? 'default' : 'crosshair' }} />
                    {!result && !busy && <span style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', padding: '6px 14px', borderRadius: 999, background: 'rgba(34,28,24,.72)', color: '#fff', font: 'var(--caption)', fontWeight: 600 }}>{t({ zh: '點圖選取要取出的元件', en: 'Click an object to extract' })}</span>}
                  </div>
                </div>
              ) : tab === 'upscale' && result ? (
                <CompareSlider beforeSrc={img.url} afterSrc={result.url} badgeBefore={t({ zh: '原圖', en: 'Original' })} badgeAfter={`AI ${factor}×`} />
              ) : (
                <div className="card" style={{ padding: 16 }}>
                  <div className={(tab === 'removebg' && result) ? 'checker' : ''} style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '7/5', background: 'var(--paper-100)', display: 'grid', placeItems: 'center' }}>
                    <img ref={imgRef} src={result ? result.url : img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              )}

              <Status />

              {/* controls per tab */}
              <div className="row center between wraprow" style={{ gap: 10 }}>
                {tab === 'removebg' && <>
                  <span className="muted" style={{ font: 'var(--body-sm)' }}>{result ? <span className="tag tag--teal"><Icon name="Check" size={13} />{t({ zh: '去背完成', en: 'Done' })}</span> : t({ zh: '點下方開始', en: 'Press to start' })}</span>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn--accent" disabled={!live || !!busy} onClick={doRemoveBg}><Icon name="Scissors" size={16} />{result ? t({ zh: '重新去背', en: 'Redo' }) : t({ zh: '一鍵去背', en: 'Remove BG' })}</button>
                    <button className="btn btn--primary" disabled={!result} onClick={() => setTab('export')}><Icon name="Download" size={16} />{t({ zh: '輸出', en: 'Export' })}</button>
                  </div>
                </>}
                {tab === 'upscale' && <>
                  <div className="row center" style={{ gap: 6 }}>{[2, 4].map(f => <button key={f} className={'chip' + (factor === f ? ' chip--on' : '')} onClick={() => setFactor(f)}>{f}×</button>)}</div>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn--accent" disabled={!live || !!busy} onClick={doUpscale}><Icon name="Sparkles" size={16} />{t({ zh: '提升解析度', en: 'Upscale' })}</button>
                    <button className="btn btn--primary" disabled={!result} onClick={() => setTab('export')}><Icon name="Download" size={16} />{t({ zh: '輸出', en: 'Export' })}</button>
                  </div>
                </>}
                {tab === 'extract' && <>
                  <span className="muted" style={{ font: 'var(--body-sm)' }}>{result ? t({ zh: '已取出元件', en: 'Element extracted' }) : t({ zh: '在圖上點選物件', en: 'Click an object' })}</span>
                  {result && <div className="row" style={{ gap: 8 }}><button className="btn btn--outline" onClick={() => setResult(null)}>{t({ zh: '重選', en: 'Reselect' })}</button><button className="btn btn--primary" onClick={() => setTab('export')}><Icon name="Download" size={16} />{t({ zh: '輸出', en: 'Export' })}</button></div>}
                </>}
              </div>

              {/* export panel */}
              {tab === 'export' && <div className="col" style={{ gap: 14 }}>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {[{ id: 'png', icon: 'FileImage', name: '透明 PNG', en: 'PNG', d: { zh: '去背・社群用', en: 'Cutout · web' } }, { id: 'jpg', icon: 'Image', name: '高解析 JPG', en: 'JPG', d: { zh: '相片・縮圖', en: 'Photos' } }, { id: 'pdf', icon: 'FileText', name: '印刷 PDF', en: 'Print PDF', d: { zh: 'RGB・含出血', en: 'RGB · bleed' } }].map(f => (
                    <button key={f.id} onClick={() => setFmt(f.id)} className="card card--pad col" style={{ gap: 6, alignItems: 'flex-start', borderColor: fmt === f.id ? 'var(--teal-500)' : 'var(--color-divider)', borderWidth: 2, cursor: 'pointer', background: fmt === f.id ? 'var(--teal-50)' : 'var(--paper-0)' }}>
                      <Icon name={f.icon} size={22} color="var(--teal-600)" /><strong style={{ font: 'var(--body-sm)' }}>{app.lang === 'en' ? f.en : f.name}</strong><span className="muted" style={{ font: 'var(--caption)' }}>{t(f.d)}</span>
                    </button>
                  ))}
                </div>
                <button className="btn btn--accent btn--lg btn--block" disabled={!!busy} onClick={() => run(exportNow, t({ zh: '輸出中…', en: 'Exporting…' }))}><Icon name="Download" size={18} />{t({ zh: '下載檔案', en: 'Download' })}</button>
                <p className="muted" style={{ font: 'var(--caption)', margin: 0, textAlign: 'center' }}>{t({ zh: 'PDF 為 RGB 含出血裁切標記；真 CMYK/X-1a 需在 VPS 端轉檔。', en: 'PDF is RGB with bleed marks; true CMYK/X-1a needs a VPS step.' })}</p>
                <Status />
              </div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ImageLab });
