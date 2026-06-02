# 永豐 AI 雲印 — Design System

> Yuen Foong AI Web-to-Print · 雲端 AI 設計、創作與印刷流程平台
> A branded design system + high-fidelity UI kit for an AI-powered cloud
> printing platform built on top of 永豐紙業 (Yuen Foong Paper) 's cloud-print
> property, **cloudw2p.com / 永豐雲端印刷網**.

---

## 1 · Company & product context

**永豐紙業 (Yuen Foong Paper Co., Ltd. / YFP)** is the printing arm of the
**永豐餘集團 (Yuen Foong Yu Group)** — a top-50 global paper company with a fully
vertically-integrated chain: forestry → pulp → papermaking → design → printing.
YFP itself specialises in **paper & material trading, digital-printing solutions,
and security / anti-counterfeit printing** (the first printer in Taiwan certified
to European banknote-printer security standards; ISO 27001 / ISO 14298 / BS 10012 /
ISO 9001 certified).

YFP operates two distinct web properties, with two distinct visual worlds:

| Property | URL | Audience | Visual world |
|---|---|---|---|
| **Corporate** | `yfp.com.tw` | Enterprise / B2B | Charcoal nav + **corporate red** `#CF1226`, ISO/security tone |
| **Cloud printing** | `new.cloudw2p.com` (永豐雲端印刷網) | SOHO / micro-business | Dusty **teal** `#4992AF`, warm **cream** paper, **coffee** ink, **orange** swoosh |

### The brief — 永豐 AI 雲印
Build a prototype for a **cloud AI design, creation & printing platform** for
**micro-businesses**, fusing 永豐's cloud-print CI with an **AI-tech feel**. It must:

1. **Solve the 9 pain points** micro-businesses hit in design & print (from the workshop PDF), and
2. Deliver the **two AI pillars**: **AI 設計創作 (AI design creation)** + **AI 印刷流程優化 (AI print-process optimization)**.

### The 9 pain points (微型商家在設計與印刷上的 9 大痛點)
1. 連 Logo 都沒有 — no logo, no brand concept
2. 圖檔解析度很差 — low-resolution images, want upscaling
3. 檔案尺寸不對 — wrong dimensions; artwork won't extend to print size
4. 不懂安全線與出血線 — no grasp of safety / bleed lines
5. 照片不會去背 — can't remove backgrounds
6. 想要圖片中的某個元件 — can't extract one element from an image
7. 特殊規格常常要等報價 — slow custom quotes
8. 不知道如何提供去背 PNG 檔 — don't know how to export transparent PNG / right format
9. 不知道要選擇什麼規格材質 — don't know which size / material / quantity is best CP value

### Competitor references studied (from the workshop PDF)
Canva (conversational AI design + auto-layout + print preflight) · Vistaprint
(AI Logo maker + brand toolbox) · Bizhows (AI background-removal + image
restoration + Korean asset templates) · Gelato (GelatoConnect AI Estimator —
15-second bulk quotes across 130+ factories) · Printify (trend-scraping AI agents
+ dynamic pricing + auto-publish) · Shutterfly (one-tap AI photo-book: import →
select → theme → story → copy → layout).

### Sources given
- `uploads/永豐紙業AIworkshop.pdf` (5 pp, image-only → rendered to `uploads/page_1..5.png`)
- `https://www.yfp.com.tw/` — corporate site (screenshot `uploads/brand_assets-*.png`)
- `https://new.cloudw2p.com/` — cloud-print site (screenshot `uploads/cloudw2p.png`)

---

## 2 · Content fundamentals (voice & copy)

The platform speaks **Traditional Chinese (繁體中文)** as primary, with an
**EN toggle** available. Voice is **warm, encouraging, plain-spoken** — it talks
to a shop owner who is *not* a designer and is slightly anxious about getting
print wrong. Never jargon-first.

- **Person:** addresses the user as **「你」** (informal "you"); the AI refers to
  itself as **「AI 幫你完成」** ("AI does it for you"). Reassuring, service-side.
- **Casing & punctuation:** full-width CJK punctuation （，、。：！）. Latin/brand
  terms (AI, Logo, PNG, CP 值, Brand Kit) stay Latin with a hairspace feel — one
  half-width space around them, e.g. 「AI 生成 Logo」「轉 PNG 檔」.
- **Numbers as proof:** concrete numerals carry the value prop —「15 秒極速報價」
  「130+ 合作印刷廠」「2000 張」「315 x 148 mm」「象牙卡 270P」. Set numerals in the
  display/grotesk face (`--font-display`, tabular).
- **Verb-led benefit lines:** short, scannable, often a ✓ list —「一鍵去除背景，精準快速」
  「自動檢查出血、解析度與尺寸，降低印刷錯誤」.
- **Pain → relief framing:** name the pain in the user's own words (痛點), then show
  the AI relief immediately beside it. Empathy first, capability second.
- **Tone words:** 簡單、快速、精準、聰明、一站式、降低門檻、省時、省成本.
- **Emoji:** **not used** in product UI. Iconography does the lifting instead.
  (The workshop deck used a few; the product surface stays icon-driven.)
- **No exclamation overload:** at most one ！per block; the corporate parent is a
  serious, certified printer — confidence over hype.

Examples (verbatim system voice):
> 「讓不會設計的人，也能快速做好設計。」
> 「AI 不只讓設計更簡單，也讓印刷流程更智慧，從創意到生產，一站式完成。」
> 「讓報價更快、更準，生產更順暢。」

---

## 3 · Visual foundations

**Big idea — *warm paper-craft meets calm machine.*** Take 永豐 cloud-print's warm,
tactile paper world (cream stock, coffee ink, the teal cloud/mountain mark, the
orange energy swoosh) and lay a **precise, quiet AI-tech surface** over it: clean
modular cards, generous grids, tabular numerals, restrained motion. The result is
trustworthy (it's a certified printer) yet clearly intelligent — and it deliberately
avoids generic "AI" tropes (no neon-purple gradients, no glassmorphism for its own
sake, no emoji cards).

- **Color** — Two-color brand system: **Ink Teal** (`--teal-500 #2E7D95`, from the
  logo/banner) as primary, **AI Orange** (`--orange-500 #F18E1B`, the swoosh) as the
  single energy accent (CTAs, AI actions, progress). **Coffee** (`#A67555`) is a warm
  secondary for print-material/物料 contexts. **Corporate red** (`#CF1226`) is reserved
  strictly for *semantic alert* — preflight errors, bleed/safety warnings, security.
  Backgrounds use **warm paper neutrals** (`--paper-50/100/200`), never pure cold grey.
- **Type** — `Space Grotesk` for display + numerals (techy, geometric), `Plus Jakarta
  Sans` for Latin UI/body, `Noto Sans TC` for all Chinese (open equivalent of 思源黑體).
  Headings are tight (`-0.01…-0.02em`), body is airy (`line-height 1.6–1.65`) for CJK
  legibility. See `colors_and_type.css`.
- **Backgrounds** — Predominantly flat warm paper. Hero / section washes use a *very*
  subtle cream→white vertical gradient or a faint paper-grain feel via solid `--paper-100`.
  Tech moments (AI processing, quote engine) may use the **`.theme-ink` dark teal** surface
  for contrast — sparingly, as "the machine room". No busy photographic backgrounds behind text.
- **Imagery** — Real product photography is **warm-lit, natural, tactile** (cream/beige
  sets, wood props, soft daylight — matching cloudw2p's hero). Mockups of business cards,
  stickers, posters sit on warm flat-lay surfaces. Use `image-slot` placeholders for
  user-supplied artwork; never hand-draw illustrations.
- **Motion** — Calm and functional. Fades + short rises (`--ease-out`, 120–360ms). One
  **spring** (`--ease-spring`) reserved for "AI result appears" / generation reveals.
  Progress = orange. No bounces on UI chrome, no parallax.
- **Hover** — Surfaces lift (`--sh-md → --sh-lg`) and warm slightly; primary buttons go
  one step darker (`teal-500 → teal-600`); accent buttons `orange-500 → orange-600`.
  Links: teal underline thickens. Cards: 1px border → teal-200 + shadow rise.
- **Press** — Subtle scale `0.98` + shadow drop; color goes one further step darker.
- **Borders** — `1px` hairlines in warm neutrals (`--n-200/300`). Inputs `1.5px`.
  Focus = `--sh-ring` (4px teal halo), never a hard outline.
- **Radii** — Friendly but not bubbly: cards `--r-lg/xl` (14–20px), buttons `--r-md/pill`,
  chips `--r-pill`, inputs `--r-md`. Image/artwork frames `--r-lg`.
- **Shadows / elevation** — Soft, **warm-tinted** (brown-black, not pure black). Four
  steps `sm→xl`; resting cards use `sm/md`, popovers/menus `lg`, modals/AI panels `xl`.
  No inner shadows except inset preview wells.
- **Transparency / blur** — Used lightly: sticky header gets a `backdrop-filter: blur`
  + translucent paper; modal scrims are warm-black 40–55%. Glass is not a primary motif.
- **Layout** — 12-col grid, max content width ~1200–1280px, gutter 24–32px. Sticky top
  nav. Generous whitespace; cards laid out with flex/grid `gap`, never inline-flow.
- **Cards** — White (`--paper-0`) surface, `1px --n-200` border, `--r-lg/xl` radius,
  `--sh-sm/md` shadow, `--sp-6` padding. Status cards (preflight) tint their border +
  a left status rail by semantic color (teal/orange/red), NOT a generic colored left-border trope.

---

## 4 · Iconography

- **System:** **Lucide** (open-source, 1.75–2px stroke, rounded line icons) loaded from
  CDN — `https://unpkg.com/lucide@latest`. It matches the thin-line icons used in
  cloudw2p's utility nav (印刷聊聊 / 索取紙樣 / 幫助中心) and reads as clean & modern
  without feeling cold. **(Substitution flag:** the live sites mix small PNG icons + a
  light line set; we standardise on Lucide for consistency — swap if 永豐 has an official
  icon font.)
- **Usage:** line icons at `1.75px` stroke, `currentColor`, sized 16/20/24. AI-action
  icons (sparkles, wand) always paired with orange. Status icons use semantic color.
- **Brand mark:** the **circular teal cloud/mountain logomark** (`assets/yunyin-logomark.png`)
  and full lockup (`assets/yunyin-logo.png`) — cropped from the live site, **not redrawn**.
- **No emoji** in product UI. No unicode-glyph icons. Numerals use `Space Grotesk` tabular.

---

## 5 · Index — what's in this system

```
README.md                  ← you are here (context, voice, visual foundations, iconography)
colors_and_type.css        ← all design tokens: color scales, semantic vars, type, spacing, radii, shadows
SKILL.md                   ← Agent-Skill manifest (for use in Claude Code)
assets/
  yunyin-logo.png          ← full 永豐雲端印刷網 lockup (extracted from live site)
  yunyin-logomark.png      ← circular teal cloud/mountain mark
  sample-hero.png          ← warm business-card product photo (landing hero)
  sample-cards.png         ← warm product photo (studio result / image-lab demos)
preview/                   ← Design-System tab cards (colors, type, spacing, components)
ui_kits/
  yunyin/                  ← 永豐 AI 雲印 platform — high-fidelity click-thru prototype
    index.html             ← runs the whole flow (landing → studio → image tools → preflight → quote → order)
    README.md              ← kit guide + component list
    *.jsx                  ← modular components (Nav, Hero, PainGrid, DesignStudio, ImageLab, Preflight, QuoteEngine, …)
uploads/                   ← source material (workshop PDF pages, site screenshots)
```

> **Font substitution note:** Chinese is set in **Noto Sans TC** (the open-source release of
> Adobe/Google 思源黑體 / Source Han Sans), standing in for the system 微軟正黑體 the live
> sites use. Latin display = Space Grotesk, Latin UI = Plus Jakarta Sans. If 永豐 has licensed
> brand fonts, drop the TTFs in `fonts/` and update `colors_and_type.css`.
