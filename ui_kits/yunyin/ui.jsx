/* ui.jsx — shared primitives, i18n, icon system. Exposed on window. */
const { useState, useEffect, useRef, useContext, createContext, useCallback } = React;

/* ---------------- i18n ---------------- */
const AppCtx = createContext(null);
function useApp() { return useContext(AppCtx); }
/* t({zh,en}) -> string for current language; plain strings pass through */
function makeT(lang) {
  return (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] ?? o.zh ?? ''));
}

/* ---------------- Icon (Lucide) ---------------- */
/* pass PascalCase lucide names e.g. "Sparkles", "ArrowRight" */
function Icon({ name, size = 20, stroke = 1.75, color = 'currentColor', style, className }) {
  const lib = (typeof window !== 'undefined' && window.lucide && window.lucide.icons) || {};
  let node = lib[name];
  if (!node && name) { // try kebab->pascal fallback
    const pas = name.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
    node = lib[pas];
  }
  // lucide icon shape: ["svg", attrs, [ [childTag, childAttrs], ... ]]
  const children = (node && Array.isArray(node[2])) ? node[2] : [];
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true">
      {children.map((c, i) => React.createElement(c[0], { key: i, ...c[1] }))}
    </svg>
  );
}

/* ---------------- Logo ---------------- */
function Logo({ height = 34, mark = false }) {
  const src = mark ? ((window.__resources && window.__resources.logoMark) || '../../assets/yunyin-logomark.png')
                   : ((window.__resources && window.__resources.logoFull) || '../../assets/yunyin-logo.png');
  return <img className="appbar__logo" src={src} alt="永豐 AI 雲印 Yuen Foong AI Web-to-Print" style={{ height }} />;
}

/* AI sparkle badge */
function AIBadge({ label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px',
      borderRadius: 999, background: 'linear-gradient(100deg,#FEF1E0,#FCE3C4)',
      border: '1px solid var(--orange-200)', color: 'var(--orange-700)', font: 'var(--caption)', fontWeight: 700 }}>
      <Icon name="Sparkles" size={14} color="var(--orange-500)" />{label}
    </span>
  );
}

/* Section heading */
function SectionHead({ eyebrow, title, sub, center }) {
  return (
    <div className="col" style={{ gap: 10, alignItems: center ? 'center' : 'flex-start',
      textAlign: center ? 'center' : 'left', maxWidth: center ? 760 : 'none', margin: center ? '0 auto' : 0 }}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 style={{ font: 'var(--h2)', margin: 0, letterSpacing: '-0.01em', color: 'var(--color-fg)' }}>{title}</h2>
      {sub && <p className="muted" style={{ font: 'var(--body-lg)', margin: 0, maxWidth: 620, textWrap: 'pretty' }}>{sub}</p>}
    </div>
  );
}

/* small labelled stat */
function Stat({ value, label, accent }) {
  return (
    <div className="col" style={{ gap: 2 }}>
      <span className="num" style={{ fontSize: 30, fontWeight: 700, color: accent ? 'var(--orange-600)' : 'var(--teal-600)' }}>{value}</span>
      <span className="muted" style={{ font: 'var(--caption)' }}>{label}</span>
    </div>
  );
}

/* fake async runner: returns [running, progress, run] */
function useFakeRun(duration = 1800) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const run = useCallback((cb) => {
    setRunning(true); setDone(false); setProgress(0);
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setProgress(p);
      if (p >= 1) { clearInterval(id); setRunning(false); setDone(true); cb && cb(); }
    }, 40);
  }, [duration]);
  return { running, progress, done, run, setDone };
}

/* tab bar */
function Tabs({ tabs, value, onChange }) {
  return (
    <div className="row" style={{ gap: 4, padding: 4, background: 'var(--paper-100)', borderRadius: 999,
      border: '1px solid var(--color-divider)', width: 'fit-content' }}>
      {tabs.map(tb => (
        <button key={tb.id} className="navlink" onClick={() => onChange(tb.id)}
          style={{ borderRadius: 999, background: value === tb.id ? 'var(--paper-0)' : 'transparent',
            color: value === tb.id ? 'var(--teal-600)' : 'var(--color-fg-muted)',
            boxShadow: value === tb.id ? 'var(--sh-sm)' : 'none' }}>
          {tb.icon && <Icon name={tb.icon} size={16} />}{tb.label}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { AppCtx, useApp, makeT, Icon, Logo, AIBadge, SectionHead, Stat, useFakeRun, Tabs });
