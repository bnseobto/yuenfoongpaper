# 永豐 AI 雲印 — VPS 代理部署說明

這支代理讓「AI 設計創作」真的能動，同時**金鑰只存在你的 VPS、不進前端檔案**。

## 1. 需求
- VPS 上有 **Node 18+**（`node -v` 確認）。
- 一個 **OpenAI 相容**的付費 LLM 帳號（任何便宜供應商皆可，或自架）。只需要它的
  `chat/completions` 端點、一把 API key、一個模型名稱。

## 2. 設定環境變數
```bash
export YFP_UPSTREAM_URL="https://api.<供應商>.com/v1/chat/completions"
export YFP_UPSTREAM_KEY="sk-..."             # ← 機密，只放這裡
export YFP_MODEL="gpt-4o-mini"               # 任何便宜 instruct 模型
export YFP_ALLOW_ORIGIN="https://你的網站網域"  # demo 可先用 *
```

## 3. 啟動
```bash
node yfp-ai-proxy.mjs           # 預設 :8787
```
建議用 `pm2 start yfp-ai-proxy.mjs` 常駐，並用 Nginx 反代 + HTTPS 對外。

驗證：`curl https://你的VPS/health` → `{"ok":true}`

## 4. 前端怎麼接
在網頁載入時設一個全域變數指向這支代理（**不含任何金鑰**）：
```html
<script>window.YFP_AI_ENDPOINT = "https://你的VPS/api/design";</script>
```
前端只送 `{ prompt, lang }`，拿回 `{ ok, kit }`，把 `kit`（品牌名/配色/字體/文案）套進名片·海報模板。

## 5. 內建保護
- 每 IP 每分鐘 20 次速率限制（`RATE_MAX`）
- 輸入字數上限 400（`MAX_PROMPT`）
- 強制 JSON 輸出，解析失敗會回 502

## 6. 成本（demo、約 10 人同時）
品牌包是純文字、token 極少 → 每次約幾分之一美分；月成本通常**個位數美元**。
影像工具（去背/擷取/升解析）完全在使用者瀏覽器跑，**這支代理不經手、$0 推論成本**。
