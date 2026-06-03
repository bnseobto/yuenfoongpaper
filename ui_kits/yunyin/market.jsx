/* market.jsx — 設計市集（MakerWorld 模式）
   設計師上架版型 → 商家一鍵客製下印 → 平台與設計師拆帳。
   把拓竹 MakerWorld 的「創作者經濟 + 隨選製造」平移到紙品/包裝。 */
const { useApp: useApp_MK, makeT: makeT_MK } = window;
const { useState: useState_MK } = React;

const MK_TEMPLATES = [
  { id: 1, zh: '韓系咖啡名片', en: 'Korean café card', cat: 'card', by: 'minlin', dl: 3240, rate: 4.9, price: 0, g: ['#F3E7D6', '#C0894E'], ink: '#5B4334' },
  { id: 2, zh: '文青手沖海報', en: 'Pour-over poster', cat: 'poster', by: 'studio.ko', dl: 2118, rate: 4.8, price: 60, g: ['#163A40', '#E8A14B'], ink: '#F2EDE4' },
  { id: 3, zh: '寵物店圓貼', en: 'Pet shop sticker', cat: 'sticker', by: 'paws', dl: 1890, rate: 4.7, price: 0, g: ['#FBF8F3', '#F18E1B'], ink: '#2A2622' },
  { id: 4, zh: '質感咖啡袋', en: 'Coffee pouch', cat: 'package', by: 'roast.lab', dl: 4502, rate: 5.0, price: 120, g: ['#A67555', '#2E7D95'], ink: '#fff' },
  { id: 5, zh: '新年燙金紅包', en: 'CNY red packet', cat: 'package', by: 'fuok', dl: 6740, rate: 4.9, price: 80, g: ['#9E2A2B', '#E8A14B'], ink: '#FFE9C7' },
  { id: 6, zh: '極簡名片', en: 'Minimal card', cat: 'card', by: 'grid', dl: 2980, rate: 4.8, price: 0, g: ['#FBF8F3', '#2A2622'], ink: '#2A2622' },
  { id: 7, zh: '手作市集吊牌', en: 'Market hangtag', cat: 'sticker', by: 'handmade', dl: 1340, rate: 4.6, price: 40, g: ['#E7EFE9', '#1F7A52'], ink: '#163A40' },
  { id: 8, zh: 'IG 限定貼文', en: 'IG promo post', cat: 'poster', by: 'social.io', dl: 3110, rate: 4.7, price: 0, g: ['#2E7D95', '#F18E1B'], ink: '#fff' },
];
const MK_CATS = [
  { id: 'all', zh: '全部', en: 'All' },
  { id: 'card', zh: '名片', en: 'Cards' },
  { id: 'poster', zh: '海報', en: 'Posters' },
  { id: 'sticker', zh: '貼紙', en: 'Stickers' },
  { id: 'package', zh: '包裝', en: 'Packaging' },
];

function MkStat({ n, label }) {
  return <div className="col" style={{ gap: 2 }}>
    <span className="num" style={{ font: 'var(--h3)', fontWeight: 700 }}>{n}</span>
    <span className="muted" style={{ font: 'var(--caption)' }}>{label}</span>
  </div>;
}

function Market() {
  const app = useApp_MK(); const t = makeT_MK(app.lang);
  const [cat, setCat] = useState_MK('all');
  const list = MK_TEMPLATES.filter(x => cat === 'all' || x.cat === cat);

  return (
    <div className="wrap col" style={{ gap: 20 }}>
      {/* hero / model */}
      <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, var(--teal-50), var(--paper-50))', border: '1px solid var(--teal-100, var(--n-200))' }}>
        <div className="row between center wraprow" style={{ gap: 18 }}>
          <div className="col" style={{ gap: 8, maxWidth: 760 }}>
            <span className="row center" style={{ gap: 8 }}>
              <AIBadge label={t({ zh: '新功能', en: 'New' })} />
              <h2 style={{ font: 'var(--h2)', margin: 0 }}>{t({ zh: '設計市集', en: 'Design Market' })}</h2>
            </span>
            <p className="muted" style={{ margin: 0 }}>
              {t({ zh: '設計師上架版型，商家一鍵客製下印，平台與設計師拆帳——把創作者經濟帶進印刷。',
                en: 'Designers publish templates, shops customize & print in one tap, platform shares revenue.' })}
            </p>
            <div className="row center" style={{ gap: 28, marginTop: 6 }}>
              <MkStat n="1,240+" label={t({ zh: '設計師', en: 'Creators' })} />
              <MkStat n="8,600+" label={t({ zh: '版型', en: 'Templates' })} />
              <MkStat n="120K+" label={t({ zh: '次下印', en: 'Prints' })} />
            </div>
          </div>
          <button className="btn btn--accent btn--lg" onClick={() => app.go('studio')}>
            <Icon name="Upload" size={18} />{t({ zh: '上架我的設計', en: 'Publish design' })}
          </button>
        </div>
      </div>

      {/* category chips */}
      <div className="row wraprow" style={{ gap: 8 }}>
        {MK_CATS.map(c => (
          <button key={c.id} className="chip" onClick={() => setCat(c.id)}
            style={cat === c.id ? { background: 'var(--teal-500)', color: '#fff', borderColor: 'var(--teal-500)' } : {}}>
            {t({ zh: c.zh, en: c.en })}
          </button>
        ))}
      </div>

      {/* grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {list.map(tpl => (
          <div key={tpl.id} className="card card--hover col" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ aspectRatio: '4/3', background: `linear-gradient(150deg, ${tpl.g[0]}, ${tpl.g[1]})`, display: 'grid', placeItems: 'center', position: 'relative' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: tpl.ink, textShadow: '0 1px 8px rgba(0,0,0,.15)' }}>{t({ zh: tpl.zh, en: tpl.en })}</span>
              {tpl.price === 0
                ? <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--success-500)', color: '#fff', font: 'var(--caption)', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{t({ zh: '免費', en: 'Free' })}</span>
                : <span className="num" style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,.55)', color: '#fff', font: 'var(--caption)', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>NT${tpl.price}</span>}
            </div>
            <div className="col" style={{ gap: 8, padding: 12 }}>
              <div className="row center between">
                <span className="row center" style={{ gap: 6, font: 'var(--caption)', color: 'var(--color-fg-2)' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--teal-100, var(--teal-50))', display: 'grid', placeItems: 'center', font: '700 9px/1 var(--font-sans)', color: 'var(--teal-600)' }}>{tpl.by[0].toUpperCase()}</span>
                  @{tpl.by}
                </span>
                <span className="row center" style={{ gap: 3, font: 'var(--caption)', color: 'var(--color-fg-muted)' }}><Icon name="Star" size={12} color="var(--orange-500)" />{tpl.rate}</span>
              </div>
              <div className="row center between">
                <span className="num muted" style={{ font: 'var(--caption)' }}><Icon name="Download" size={12} /> {tpl.dl.toLocaleString()}</span>
                <button className="btn btn--primary btn--sm" onClick={() => app.go('studio')}><Icon name="Wand2" size={14} />{t({ zh: '客製下印', en: 'Customize' })}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row center" style={{ gap: 8, padding: 14, background: 'var(--teal-50)', borderRadius: 12, font: 'var(--body-sm)', color: 'var(--teal-700)' }}>
        <Icon name="Sparkles" size={16} color="var(--teal-500)" />
        {t({ zh: '商機：版型越多 → 越多商家自助下印 → 設計師賺拆帳、永豐賺印量，平台自我成長(網路效應)。',
          en: 'More templates → more self-serve prints → creators earn, YFP earns volume — a self-growing network.' })}
      </div>
    </div>
  );
}

Object.assign(window, { Market });
