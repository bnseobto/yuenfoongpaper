/* ============================================================================
   yfp-ai-proxy.mjs — 永豐 AI 雲印 · 極輕後端代理（放在你的 VPS）
   ----------------------------------------------------------------------------
   作用：前端把使用者輸入送來這裡，這裡才用「金鑰」去呼叫付費 LLM，回傳
        結構化「品牌包 JSON」。金鑰只存在這台機器的環境變數，前端永遠看不到。

   特色：零相依套件（只用 Node 18+ 內建 http + fetch）、CORS、每 IP 速率限制、
        輸入長度上限、上游採 OpenAI 相容格式（可接任何便宜供應商或自架）。

   執行：
     export YFP_UPSTREAM_URL="https://api.<your-provider>.com/v1/chat/completions"
     export YFP_UPSTREAM_KEY="sk-..."          # ← 只存在這裡，不進前端
     export YFP_MODEL="gpt-4o-mini"            # 任何便宜的 instruct 模型
     export YFP_ALLOW_ORIGIN="https://你的網站網域"   # 或 * 做 demo
     node yfp-ai-proxy.mjs                      # 預設聽 8787

   前端呼叫： POST  https://你的VPS/api/design   body={ prompt, lang }
   ========================================================================== */

import http from 'node:http';

const PORT          = process.env.PORT || 8787;
const UPSTREAM_URL  = process.env.YFP_UPSTREAM_URL;
const UPSTREAM_KEY  = process.env.YFP_UPSTREAM_KEY;
const MODEL         = process.env.YFP_MODEL || 'gpt-4o-mini';
const ALLOW_ORIGIN  = process.env.YFP_ALLOW_ORIGIN || '*';
const MAX_PROMPT    = 400;        // 輸入字數上限
const RATE_MAX      = 20;         // 每 IP 每分鐘最多次數
const rate = new Map();           // ip -> { n, ts }

const SYSTEM = `你是「永豐 AI 雲印」的品牌設計助理。使用者會用一句話描述他的店或商品。
請只回傳一個 JSON 物件（不要任何多餘文字、不要 markdown 圍欄），結構如下：
{
 "brandName": "英文品牌名(<=18字元)",
 "brandNameZh": "中文品牌名",
 "tagline": "一句標語",
 "palette": [{"name":"色名","hex":"#RRGGBB"}, ...共4色，第1色為主底、第2色為強調],
 "fonts": {"display":"標題字建議","body":"內文字建議"},
 "copy": {"card":"名片用一行標語","poster":"海報主視覺大字"},
 "vibe": "三個風格關鍵字，逗號分隔"
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

function limited(ip) {
  const now = Date.now(), slot = rate.get(ip);
  if (!slot || now - slot.ts > 60000) { rate.set(ip, { n: 1, ts: now }); return false; }
  slot.n += 1; return slot.n > RATE_MAX;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.url === '/health') return send(res, 200, { ok: true });
  if (req.method !== 'POST' || req.url !== '/api/design') return send(res, 404, { error: 'not found' });

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (limited(ip)) return send(res, 429, { error: 'rate limited，請稍後再試' });

  let body = '';
  req.on('data', c => { body += c; if (body.length > 4000) req.destroy(); });
  req.on('end', async () => {
    try {
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
    } catch (e) {
      return send(res, 500, { error: String(e && e.message || e) });
    }
  });
});

server.listen(PORT, () => console.log(`yfp-ai-proxy on :${PORT}  model=${MODEL}`));
