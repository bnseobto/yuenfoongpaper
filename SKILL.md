---
name: yunyin-design
description: Use this skill to generate well-branded interfaces and assets for 永豐 AI 雲印 (Yuen Foong AI Web-to-Print), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping an AI cloud design-and-print platform.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `README.md` — brand context, the 9 micro-business pain points, content voice, visual foundations, iconography, file index.
- `colors_and_type.css` — all design tokens (Ink Teal primary, AI Orange accent, Coffee + warm-paper neutrals, semantic colors, type scale, spacing, radii, shadows). Import this first.
- `assets/` — `yunyin-logo.png` (full lockup), `yunyin-logomark.png` (circular mark), warm sample product photos.
- `preview/` — small spec cards (colors / type / spacing / components / brand).
- `ui_kits/yunyin/` — high-fidelity, click-through React prototype of the platform (landing, AI design studio, image tools, preflight, quote engine, order/Brand Kit). Reuse its `styles.css` classes and `ui.jsx` primitives (`Icon`, `Logo`, `AIBadge`, `SectionHead`, `Tabs`).

## Non-negotiables
- Traditional-Chinese-first copy; warm, encouraging, plain voice; address the user as 你; no emoji in UI.
- Two-color brand: teal primary + orange accent. Corporate red is alert-only. Backgrounds are warm paper, never cold grey.
- Icons = Lucide (1.75px). Type = Space Grotesk (display/numerals) + Plus Jakarta Sans (Latin UI) + Noto Sans TC (Chinese).
- Avoid AI-slop tropes (neon-purple gradients, glassmorphism, emoji cards). Warm paper-craft + calm machine.
