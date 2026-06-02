/* ============================================================================
   live-ai.jsx — 漸進增強的真 AI 能力（全部 lazy-load，沒用到就不下載）
   暴露 window.LiveAI。影像功能在使用者瀏覽器端跑（WebGPU，WASM fallback）；
   設計生成走 window.YFP_AI_ENDPOINT（你 VPS 的代理）。
   ========================================================================== */
(function () {
  const CDN = {
    imgly: 'https://esm.sh/@imgly/background-removal@1.5',
    tfx: 'https://esm.sh/@huggingface/transformers@3',
    upscaler: 'https://esm.sh/upscaler@1.0.0-beta.19?bundle',
    esrgan: 'https://esm.sh/@upscalerjs/esrgan-slim@1.0.0-beta.19?bundle',
    pdflib: 'https://esm.sh/pdf-lib@1.17.1',
  };
  const memo = {};
  const once = (k, fn) => (memo[k] ||= fn());

  const LiveAI = {
    hasWebGPU: () => typeof navigator !== 'undefined' && 'gpu' in navigator,
    endpoint: () => (typeof window !== 'undefined' && window.YFP_AI_ENDPOINT) || null,

    /* ---- 去背 (ISNet, @imgly/background-removal, MIT, 免註冊) ---- */
    async removeBg(blob, onProgress) {
      const m = await once('imgly', () => import(CDN.imgly));
      const out = await (m.removeBackground || m.default.removeBackground)(blob, {
        progress: (key, cur, tot) => onProgress && onProgress(tot ? cur / tot : 0, key),
        output: { format: 'image/png' },
      });
      return out; // Blob: 透明背景 PNG
    },

    /* ---- 元件擷取 (SlimSAM via transformers.js) ---- */
    async _sam(onProgress) {
      return once('sam', async () => {
        const T = await import(CDN.tfx);
        const id = 'Xenova/slimsam-77-uniform';
        const device = this.hasWebGPU() ? 'webgpu' : 'wasm';
        const model = await T.SamModel.from_pretrained(id, { device, dtype: 'fp16', progress_callback: p => onProgress && p.progress && onProgress(p.progress / 100) });
        const processor = await T.AutoProcessor.from_pretrained(id);
        return { T, model, processor };
      });
    },
    // imageURL: 圖片網址；point:{x,y} 在原圖像素座標；回傳 {maskCanvas, cutBlob}
    async segment(imageURL, point, onProgress) {
      const { T, model, processor } = await this._sam(onProgress);
      const raw = await T.RawImage.read(imageURL);
      const inputs = await processor(raw, { input_points: [[[point.x, point.y]]] });
      const outputs = await model(inputs);
      const masks = await processor.post_process_masks(outputs.pred_masks, inputs.original_sizes, inputs.reshaped_input_sizes);
      const scores = outputs.iou_scores.data;
      let best = 0; for (let i = 1; i < scores.length; i++) if (scores[i] > scores[best]) best = i;
      const mask = masks[0][0]; // [n, h, w]
      const [n, h, w] = mask.dims;
      const md = mask.data;
      // 合成去背圖
      const img = new Image(); img.src = imageURL; await img.decode();
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
      const id2 = ctx.getImageData(0, 0, w, h); const d = id2.data;
      for (let i = 0; i < w * h; i++) { if (!md[best * w * h + i]) d[i * 4 + 3] = 0; }
      ctx.putImageData(id2, 0, 0);
      const cutBlob = await new Promise(r => c.toBlob(r, 'image/png'));
      return { cutBlob, w, h };
    },

    /* ---- 提升解析度 (UpscalerJS, 失敗則退回 canvas 放大) ---- */
    async upscale(imgEl, factor = 2, onProgress) {
      try {
        const [{ default: Upscaler }, { default: model }] = await once('ups', () => Promise.all([import(CDN.upscaler), import(CDN.esrgan)]));
        const up = new Upscaler({ model });
        const src = imgEl.src || imgEl;
        const out = await up.upscale(src, { patchSize: 64, padding: 2, progress: p => onProgress && onProgress(p) });
        return out; // dataURL
      } catch (e) {
        // fallback：高品質 canvas 放大
        const img = imgEl.tagName ? imgEl : await loadImg(imgEl);
        const c = document.createElement('canvas'); c.width = img.naturalWidth * factor; c.height = img.naturalHeight * factor;
        const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, 0, 0, c.width, c.height);
        return c.toDataURL('image/png');
      }
    },

    /* ---- 轉檔輸出 ---- */
    async toBlob(srcCanvasOrImg, type = 'image/png', quality = 0.92) {
      const c = await toCanvas(srcCanvasOrImg);
      return new Promise(r => c.toBlob(r, type, quality));
    },
    // 名片預設 90x54mm + 3mm 出血；產 RGB PDF（含裁切標記）
    async toPrintPDF(srcCanvasOrImg, { wmm = 90, hmm = 54, bleed = 3 } = {}) {
      const { PDFDocument, rgb } = await once('pdf', () => import(CDN.pdflib));
      const c = await toCanvas(srcCanvasOrImg);
      const png = await fetch(c.toDataURL('image/png')).then(r => r.arrayBuffer());
      const mm = 2.83465; // mm->pt
      const pw = (wmm + bleed * 2) * mm, ph = (hmm + bleed * 2) * mm;
      const doc = await PDFDocument.create();
      const page = doc.addPage([pw, ph]);
      const img = await doc.embedPng(png);
      page.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
      // 裁切標記
      const b = bleed * mm, L = 5 * mm, k = rgb(0, 0, 0);
      const marks = [[0, b], [b, 0], [pw - L, b], [pw, 0], [0, ph - b], [b, ph], [pw - L, ph - b], [pw, ph]];
      for (let i = 0; i < marks.length; i += 2) {
        page.drawLine({ start: { x: marks[i][0], y: marks[i][1] }, end: { x: marks[i][0] + L, y: marks[i][1] }, thickness: 0.5, color: k });
        page.drawLine({ start: { x: marks[i + 1][0], y: marks[i + 1][1] }, end: { x: marks[i + 1][0], y: marks[i + 1][1] + L }, thickness: 0.5, color: k });
      }
      const bytes = await doc.save();
      return new Blob([bytes], { type: 'application/pdf' });
    },
    download(blob, name) {
      const u = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 4000);
    },

    /* ---- 設計創作：呼叫 VPS 代理拿品牌包 ---- */
    async generateBrandKit(prompt, lang = 'zh') {
      const url = this.endpoint();
      if (!url) throw new Error('NO_ENDPOINT');
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, lang }) });
      if (!r.ok) throw new Error('PROXY_' + r.status);
      const j = await r.json();
      return j.kit;
    },
  };

  function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
  async function toCanvas(s) {
    if (s && s.tagName === 'CANVAS') return s;
    const img = s && s.tagName === 'IMG' ? s : await loadImg(s instanceof Blob ? URL.createObjectURL(s) : s);
    if (img.decode) { try { await img.decode(); } catch (e) {} }
    const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
    c.getContext('2d').drawImage(img, 0, 0); return c;
  }

  window.LiveAI = LiveAI;
})();
