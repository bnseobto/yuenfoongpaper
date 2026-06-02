# UI Kit — 永豐 AI 雲印 (Yuen Foong AI Web-to-Print)

High-fidelity, click-through prototype of the AI cloud-design-and-print platform.
Open **`index.html`** to run the whole flow. Traditional-Chinese-first with an
EN toggle (中 / EN in the top bar).

## Run it
`index.html` loads, in order: `../../colors_and_type.css` → `styles.css` →
React 18 + Babel + **Lucide** (icons) + `image-slot.js` → the JSX component files
(`ui.jsx` first, `app.jsx` last). All components export onto `window` because each
Babel `<script>` has its own scope.

## Screens (top-nav routes)
| Route | File | Solves pains | What it does |
|---|---|---|---|
| 首頁 Home | `landing.jsx` | all 9 (mapped) | Hero, flow strip, **9-pain-point grid → tools**, two AI pillars, CTA |
| AI 設計工作室 | `studio.jsx` | 1 | Conversational generation → live canvas; 3 style variants, 4 output sizes, Brand Kit |
| AI 影像工具 | `imagelab.jsx` | 2,5,6,8 | Tabs: 去背 / 提升解析度 (before-after slider) / 元件擷取 (click boxes) / 轉檔輸出 |
| 印前預檢 | `preflight.jsx` | 3,4 | Artwork preview w/ bleed+safe overlays, fixable checklist, one-click auto-fix |
| 報價 Quote | `quote.jsx` | 7,9 | Spec form → 15-sec parallel quote → 最省/CP值/最快 plans + AI material reco |
| 訂單 / Brand Kit | `order.jsx` | — | Production timeline + ESG badge; Brand Kit asset library |

## Components & primitives (`ui.jsx`)
`Icon` (Lucide-backed, safe-fallback) · `Logo` · `AIBadge` · `SectionHead` · `Stat`
· `Tabs` · `useFakeRun` (animated fake generation/quote) · `AppCtx` + `makeT` (i18n).

## Real AI (progressive enhancement) — `live-ai.jsx` + `backend/`
The kit ships a **mock** that always works offline. When the runtime supports it, real AI kicks in automatically:

- **Image tools (`imagelab.jsx`)** run **100% in the browser** (WebGPU, WASM fallback) — no key, no backend. After the user uploads an image: 去背 = ISNet (`@imgly/background-removal`, MIT, free), 元件擷取 = SlimSAM (`@huggingface/transformers`), 升解析 = UpscalerJS (canvas fallback), 轉檔 = canvas + `pdf-lib` (RGB PDF with bleed marks). Libs are lazy-imported from esm.sh on first use.
- **Design studio (`studio.jsx`)** calls `window.YFP_AI_ENDPOINT` (your VPS proxy in `backend/yfp-ai-proxy.mjs`) to get a brand-kit JSON, then fills the templates. **No key in the file** — it lives in the VPS env. If the endpoint is unset/unreachable, it falls back to the mock.

Enable design generation: deploy `backend/` (see `backend/README.md`), then set
`window.YFP_AI_ENDPOINT = "https://your-vps/api/design"` in `index.html`.

> ⚠️ Image models need **WebGPU** (desktop Chrome/Edge best; Safari newer; mobile spotty) and a first-load model download. Screenshot/clone renderers can't run WebGPU — test real results in a real browser. The standalone offline export keeps the mock.


Live controls (persist): **深色模式**, **主色** (湖水青 / 靛藍 / 松綠), **強調色** (活力橘 / 珊瑚紅 / 琥珀金), **圓角**, **首頁 Hero** (左右圖文 / 置中堆疊), **設計工作室** (對話式 / 範本式). Themes are driven by token-remap classes in `colors_and_type.css` (`.theme-ink`, `.brand-*`, `.accent-*`); layout tweaks flow through `AppCtx.tw`.

## Conventions
- **Color:** teal `--teal-500` primary, AI-orange `--orange-500` accent (CTAs / AI
  actions), corporate red `--danger-500` for preflight errors only.
- **Icons:** Lucide, PascalCase names (`<Icon name="Sparkles" />`). Missing names
  degrade to an empty SVG (never crash).
- **Images:** real warm product photos in `../../assets/`; `image-slot` for user uploads.
- **Motion:** `.rise` / `.pop` use transform-only keyframes (capture-safe — no opacity
  fill that would blank screenshot/clone renderers).
- **i18n:** every string is `t({zh:'…', en:'…'})`.

## Known limitations (prototype)
- "Generation", "去背", "報價" are simulated (`useFakeRun`) — no real AI/backend.
- Background removal is a CSS radial-mask effect, not true segmentation.
- `image-slot` drops don't persist here (sidecar only writes at project root).
