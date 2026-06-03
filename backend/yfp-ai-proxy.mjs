/* ============================================================================
   yfp-ai-proxy.mjs — 永豐 AI 雲印 · 極輕後端代理（放在你的 VPS）
   ----------------------------------------------------------------------------
   兩條路由，金鑰只存在這台機器的環境變數：
     POST /api/design  → 文字模型，回「品牌包 JSON」（名片/文案）
     POST /api/poster  → 文生圖模型，回海報主視覺 PNG（base64）

   特色：零相依套件（Node 18+ 內建 http + fetch）、CORS、每 IP 速率限制、
        輸入長度上限、上游採 OpenAI 相容格式（可接任何便宜供應商或自架）。

   執行（文字）：
     export YFP_UPSTREAM_URL="https://api.openai.com/v1/chat/completions"
     export YFP_UPSTREAM_KEY="sk-..."          # ← 只存在這裡，不進前端
     export YFP_MODEL="gpt-4o-mini"            # 文字 instruct 模型
   文生圖（可選；YFP_IMAGE_ENABLED=0 可關閉 /api/poster）：
     export YFP_IMAGE_URL="https://api.openai.com/v1/images/generations"
     export YFP_IMAGE_MODEL="gpt-image-2"      # 文生圖模型
     export YFP_IMAGE_QUALITY="medium"         # low/medium/high（越高越貴）
     export YFP_IMAGE_SIZE="1024x1536"         # 直式海報；長寬須為 16 倍數
     export YFP_IMAGE_RATE_MAX="5"             # 文生圖每 IP 每分鐘上限（較嚴）
   共用：
     export YFP_ALLOW_ORIGIN="https://你的網站網域"   # 或 * 做 demo
     node yfp-ai-proxy.mjs                      # 預設聽 8787
   ========================================================================== */

import http from 'node:http';

const PORT          = process.env.PORT || 8787;
const UPSTREAM_URL  = process.env.YFP_UPSTREAM_URL;
const UPSTREAM_KEY  = process.env.YFP_UPSTREAM_KEY;
const MODEL         = process.env.YFP_MODEL || 'gpt-4o-mini';
const ALLOW_ORIGIN  = process.env.YFP_ALLOW_ORIGIN || '*';

// 文生圖（image）
const IMAGE_URL     = process.env.YFP_IMAGE_URL || 'https://api.openai.com/v1/images/generations';
const IMAGE_KEY     = process.env.YFP_IMAGE_KEY || UPSTREAM_KEY;     // 預設沿用同一把金鑰
const IMAGE_MODEL   = process.env.YFP_IMAGE_MODEL || 'gpt-image-2';
const IMAGE_QUALITY = process.env.YFP_IMAGE_QUALITY || 'medium';
const IMAGE_SIZE    = process.env.YFP_IMAGE_SIZE || '1024x1536';
const IMAGE_ENABLED = process.env.YFP_IMAGE_ENABLED !== '0';        // 設 0 可關閉文生圖
const IMG_RATE_MAX  = Number(process.env.YFP_IMAGE_RATE_MAX || 5);

const MAX_PROMPT     = 400;       // 文字輸入字數上限
const MAX_IMG_PROMPT = 1000;      // 文生圖輸入字數上限
const RATE_MAX       = 20;        // 文字：每 IP 每分鐘最多次數
const rate    = new Map();        // ip -> { n, ts }  文字
const imgRate = new Map();        // ip -> { n, ts }  文生圖

const SYSTEM = `你是「永豐 AI 雲印」的設計助理。使用者會描述他想做的印刷品——可能是「商店或商品的品牌識別」，也可能是「某個活動、課程、主題或海報的內容」。
重要原則：
- 一律緊扣使用者「實際描述的主題」。不要憑空套用通用口號，也不要只從名稱或網域聯想無關意象（例如看到 "Stone" 就講自然山水）。
- 若描述的是活動／主題海報：brandName 用該主題或主辦單位名稱；tagline 與 copy.poster 要直接點出該主題；vibe 依主題調性決定（科技／機構級系統→例如「現代、專業、可信」）。
- 你無法瀏覽網址。若輸入含網址，僅依使用者的文字描述判斷主題，不要編造網站內容。
請只回傳一個 JSON 物件（不要任何多餘文字、不要 markdown 圍欄），結構如下：
{
 "brandName": "英文名稱(<=18字元)",
 "brandNameZh": "中文名稱",
 "tagline": "一句標語，需反映主題",
 "palette": [{"name":"色名","hex":"#RRGGBB"}, ...共4色，第1色為主底、第2色為強調],
 "fonts": {"display":"標題字建議","body":"內文字建議"},
 "copy": {"card":"名片用一行標語","poster":"海報主標，直接點出主題"},
 "vibe": "三個風格關鍵字，逗號分隔，需符合主題調性"
}`;

function send(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  });
  res.end(JSON.stringify(obj));
}

function limited(map, ip, max) {
  const now = Date.now(), slot = map.get(ip);
  if (!slot || now - slot.ts > 60000) { map.set(ip, { n: 1, ts: now }); return false; }
  slot.n += 1; return slot.n > max;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 8000) req.destroy(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/* ---- /api/design：文字品牌包 ---- */
async function handleDesign(req, res, ip) {
  if (limited(rate, ip, RATE_MAX)) return send(res, 429, { error: 'rate limited，請稍後再試' });
  const body = await readBody(req);
  const { prompt = '', lang = 'zh' } = JSON.parse(body || '{}');
  const clean = String(prompt).slice(0, MAX_PROMPT).trim();
  if (!clean) return send(res, 400, { error: '缺少 prompt' });
  if (!UPSTREAM_URL || !UPSTREAM_KEY) return send(res, 500, { error: '伺服器未設定上游金鑰' });

  const upstream = await fetch(UPSTREAM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${UPSTREAM_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.8,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `語言:${lang}\n需求:${clean}` },
      ],
    }),
  });
  if (!upstream.ok) return send(res, 502, { error: '上游錯誤', detail: await upstream.text() });
  const data = await upstream.json();
  const text = data?.choices?.[0]?.message?.content || '{}';
  let kit; try { kit = JSON.parse(text); } catch { return send(res, 502, { error: '解析失敗', raw: text }); }
  return send(res, 200, { ok: true, kit });
}

/* ---- /api/poster：文生圖海報主視覺 ---- */
async function handlePoster(req, res, ip) {
  if (!IMAGE_ENABLED) return send(res, 404, { error: '文生圖未啟用' });
  if (limited(imgRate, ip, IMG_RATE_MAX)) return send(res, 429, { error: 'rate limited（文生圖較貴，請稍後再試）' });
  const body = await readBody(req);
  const { prompt = '', size = '', quality = '' } = JSON.parse(body || '{}');
  const clean = String(prompt).slice(0, MAX_IMG_PROMPT).trim();
  if (!clean) return send(res, 400, { error: '缺少 prompt' });
  if (!IMAGE_KEY) return send(res, 500, { error: '伺服器未設定上游金鑰' });

  const upstream = await fetch(IMAGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${IMAGE_KEY}` },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: clean,
      size: size || IMAGE_SIZE,
      quality: quality || IMAGE_QUALITY,
      n: 1,
    }),
  });
  if (!upstream.ok) return send(res, 502, { error: '上游錯誤', detail: await upstream.text() });
  const data = await upstream.json();
  const b64 = data?.data?.[0]?.b64_json;
  const url = data?.data?.[0]?.url;
  if (!b64 && !url) return send(res, 502, { error: '未取得圖片', raw: data });
  return send(res, 200, { ok: true, b64: b64 || null, url: url || null });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204, {});
    if (req.url === '/health') return send(res, 200, { ok: true, image: IMAGE_ENABLED });
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    if (req.method === 'POST' && req.url === '/api/design') return await handleDesign(req, res, ip);
    if (req.method === 'POST' && req.url === '/api/poster') return await handlePoster(req, res, ip);
    return send(res, 404, { error: 'not found' });
  } catch (e) {
    return send(res, 500, { error: String(e && e.message || e) });
  }
});

server.listen(PORT, () => console.log(`yfp-ai-proxy on :${PORT}  text=${MODEL}  image=${IMAGE_ENABLED ? IMAGE_MODEL : 'off'}`));
