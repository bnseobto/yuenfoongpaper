/* preflight.jsx — 印前自動預檢: bleed / safe-area / size / resolution / color */
const { useApp: useApp_P, makeT: makeT_P, useFakeRun: useFakeRun_P } = window;
const { useState, useEffect, useRef, useCallback } = React;

function Preflight() {
  const app = useApp_P(); const t = makeT_P(app.lang);
  const [showBleed, setShowBleed] = useState(true);
  const [showSafe, setShowSafe] = useState(true);
  const [fixed, setFixed] = useState(false);
  const fix = useFakeRun_P(1500);

  const checks = [
    { id: 'size', icon: 'Maximize', label: { zh: '尺寸符合（90 × 54 mm）', en: 'Size OK (90 × 54 mm)' }, status: 'pass', note: { zh: '名片標準尺寸', en: 'Standard card size' } },
    { id: 'res', icon: 'Image', label: { zh: '解析度 300 dpi', en: 'Resolution 300 dpi' }, status: 'pass', note: { zh: '達印刷品質', en: 'Print quality' } },
    { id: 'bleed', icon: 'Frame', label: { zh: '出血線 3 mm', en: 'Bleed 3 mm' }, status: fixed ? 'pass' : 'err', note: fixed ? { zh: '已自動補滿出血', en: 'Bleed auto-added' } : { zh: '底圖未延伸至出血區', en: 'Artwork not extended to bleed' } },
    { id: 'safe', icon: 'ShieldCheck', label: { zh: '安全範圍', en: 'Safe area' }, status: fixed ? 'pass' : 'warn', note: fixed ? { zh: '文字已移入安全線', en: 'Text moved inside' } : { zh: '部分文字太靠邊', en: 'Text too close to edge' } },
    { id: 'cmyk', icon: 'Palette', label: { zh: '色彩模式 CMYK', en: 'Color mode CMYK' }, status: 'pass', note: { zh: '已轉印刷色域', en: 'Converted for print' } },
    { id: 'font', icon: 'Type', label: { zh: '字體外框化', en: 'Fonts outlined' }, status: 'pass', note: { zh: '避免缺字', en: 'No missing glyphs' } },
  ];
  const STC = { pass: 'success', warn: 'orange', err: 'danger' };
  const STICON = { pass: 'CheckCircle2', warn: 'AlertTriangle', err: 'XCircle' };
  const STCOLOR = { pass: 'var(--success-500)', warn: 'var(--orange-500)', err: 'var(--danger-500)' };
  const issues = checks.filter(c => c.status !== 'pass').length;

  return (
    <div className="wrap" style={{ maxWidth: 1080 }}>
      <SectionHead eyebrow={t({ zh: '痛點 03 + 04 · 尺寸與出血/安全線', en: 'Pain 03 + 04' })}
        title={t({ zh: '印前自動預檢，印壞的風險交給 AI', en: 'AI preflight — print errors, handled' })}
        sub={t({ zh: '自動檢查出血、安全線、解析度、尺寸與色彩模式。有問題？一鍵自動修正。', en: 'Auto-checks bleed, safe area, resolution, size & color. Issues? One-click fix.' })} />
      <div className="grid" style={{ gridTemplateColumns: '1.25fr .85fr', gap: 24, marginTop: 28, alignItems: 'start' }}>
        {/* preview well */}
        <div className="card card--pad col" style={{ gap: 14 }}>
          <div className="row between center">
            <strong style={{ font: 'var(--h4)' }}>{t({ zh: '作品預覽', en: 'Artwork preview' })}</strong>
            <div className="row" style={{ gap: 8 }}>
              <button className={'chip' + (showBleed ? ' chip--on' : '')} onClick={() => setShowBleed(v => !v)}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--danger-500)' }} />{t({ zh: '出血線', en: 'Bleed' })}</button>
              <button className={'chip' + (showSafe ? ' chip--on' : '')} onClick={() => setShowSafe(v => !v)}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--teal-500)' }} />{t({ zh: '安全線', en: 'Safe' })}</button>
            </div>
          </div>
          <div style={{ background: 'var(--paper-100)', borderRadius: 14, padding: 46, display: 'grid', placeItems: 'center' }}>
            <div style={{ position: 'relative', width: 380, maxWidth: '100%', aspectRatio: '90/54' }}>
              {/* artwork */}
              <div style={{ position: 'absolute', inset: fixed ? -14 : 0, background: 'linear-gradient(135deg,#163A40,#0E2A30)', borderRadius: 6, transition: 'inset .5s var(--ease-out)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, padding: '11% 12%', color: '#F2EDE4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="row center" style={{ gap: 8 }}><Icon name="Coffee" size={18} color="#E8A14B" /><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '.06em' }}>CAFE DAY</span></div>
                  <div style={{ fontSize: 9.5, color: '#9DBDC0', transform: fixed ? 'translateX(6px)' : 'none', transition: 'transform .5s' }}>02-1234-5678 · @cafeday</div>
                </div>
              </div>
              {/* bleed line (outer) */}
              {showBleed && <div style={{ position: 'absolute', inset: -14, border: '1.5px dashed var(--danger-500)', borderRadius: 8, pointerEvents: 'none' }}><span style={{ position: 'absolute', top: -18, left: 0, font: 'var(--overline)', color: 'var(--danger-600)' }}>{t({ zh: '出血 +3mm', en: 'Bleed +3mm' })}</span></div>}
              {/* safe line (inner) */}
              {showSafe && <div style={{ position: 'absolute', inset: 16, border: '1.5px dashed var(--teal-500)', borderRadius: 4, pointerEvents: 'none' }}><span style={{ position: 'absolute', bottom: -18, right: 0, font: 'var(--overline)', color: 'var(--teal-600)' }}>{t({ zh: '安全範圍', en: 'Safe area' })}</span></div>}
            </div>
          </div>
          <div className="row center between wraprow" style={{ gap: 10, font: 'var(--caption)' }}>
            <span className="num muted">90 × 54 mm · 300 dpi · CMYK</span>
            <span className="row center" style={{ gap: 6, color: 'var(--color-fg-muted)' }}><Icon name="Info" size={14} />{t({ zh: '紅=出血 · 藍=安全線', en: 'Red=bleed · Blue=safe' })}</span>
          </div>
        </div>

        {/* checklist */}
        <div className="col" style={{ gap: 16 }}>
          <div className={'card card--pad statuscard statuscard--' + (issues && !fixed ? 'warn' : 'pass') + ' col'} style={{ gap: 6 }}>
            <span className="row center between">
              <strong style={{ font: 'var(--h3)' }}>{issues && !fixed ? t({ zh: `${issues} 項需修正`, en: `${issues} to fix` }) : t({ zh: '全部通過', en: 'All passed' })}</strong>
              <Icon name={issues && !fixed ? 'AlertTriangle' : 'CheckCircle2'} size={26} color={issues && !fixed ? 'var(--orange-500)' : 'var(--success-500)'} />
            </span>
            <span className="muted" style={{ font: 'var(--body-sm)' }}>{issues && !fixed ? t({ zh: '別擔心，AI 可以自動幫你修正。', en: 'Don’t worry — AI can fix these for you.' }) : t({ zh: '檔案已符合印刷規範，可下單。', en: 'File meets print specs. Ready to order.' })}</span>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {checks.map((c, i) => (
              <div key={c.id} className="row center" style={{ gap: 12, padding: '13px 16px', borderTop: i ? '1px solid var(--color-divider)' : 'none' }}>
                <Icon name={STICON[c.status]} size={20} color={STCOLOR[c.status]} />
                <div className="col" style={{ flex: 1 }}>
                  <span style={{ font: 'var(--body-sm)', fontWeight: 600 }}>{t(c.label)}</span>
                  <span className="muted" style={{ font: 'var(--caption)' }}>{t(c.note)}</span>
                </div>
              </div>
            ))}
          </div>
          {fix.running && <div className="row center" style={{ gap: 10, color: 'var(--teal-600)', font: 'var(--body-sm)', justifyContent: 'center' }}><Icon name="LoaderCircle" className="spin" size={16} />{t({ zh: 'AI 自動修正中…', en: 'Auto-fixing…' })}</div>}
          {!fixed ? (
            <button className="btn btn--accent btn--lg btn--block" disabled={fix.running} onClick={() => fix.run(() => setFixed(true))}><Icon name="Wand2" size={18} />{t({ zh: '一鍵自動修正', en: 'Auto-fix all' })}</button>
          ) : (
            <button className="btn btn--primary btn--lg btn--block" onClick={() => app.go('quote')}><Icon name="Timer" size={18} />{t({ zh: '通過了！去試算報價', en: 'Passed! Get a quote' })}</button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Preflight });
