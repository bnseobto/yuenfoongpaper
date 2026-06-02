# 永豐 AI 雲印 — VPS 容器部署（yunprint.taozhuai.com）

用 Docker 跑兩個容器，對外曝光交給你**既有的 Cloudflare Tunnel**。
VPS 不開任何對外連接埠，TLS 由 Cloudflare 邊緣處理。

```
瀏覽器 ──HTTPS──> Cloudflare 邊緣 ──既有 Tunnel──> VPS
                                          ├─ /api/*  → proxy 容器   :8787
                                          └─ 其他    → frontend 容器 :8080
```

---

## 1. 取得程式碼

```bash
git clone https://github.com/bnseobto/yuenfoongpaper.git
cd yuenfoongpaper
```

## 2. 設定上游 LLM 金鑰

```bash
cp .env.example .env
nano .env          # 填入 YFP_UPSTREAM_KEY，預設模型 gpt-4o-mini
```

`.env` 已被 `.gitignore` 排除，不會進版控。要換供應商（Gemini Flash / DeepSeek）只改 `.env` 三行，不動程式碼。

## 3. 起容器

```bash
docker compose up -d --build
```

兩個服務只綁在 `127.0.0.1`（8080 前端 / 8787 proxy），公網無法直接連，全部走 Tunnel。

驗證（在 VPS 本機）：

```bash
curl http://127.0.0.1:8787/health     # → {"ok":true}
curl -I http://127.0.0.1:8080/        # → 302 轉向 /ui_kits/yunyin/
```

## 4. 加進你既有的 Cloudflare Tunnel

把 `yunprint.taozhuai.com` 這個 public hostname 加進**現有 tunnel** 的 ingress。
**順序很重要**：`/api` 規則要排在該 hostname 的 catch-all 規則「之前」。

編輯你現有的 `config.yml`（通常在 `~/.cloudflared/` 或 `/etc/cloudflared/`）：

```yaml
ingress:
  # ── 你現有的規則（forging 等）保留不動 ──
  # - hostname: forging.taozhuai.com
  #   service: http://localhost:xxxx

  # ── 新增：永豐 AI 雲印 ──
  - hostname: yunprint.taozhuai.com
    path: ^/api/.*            # AI 設計生成 → proxy
    service: http://localhost:8787
  - hostname: yunprint.taozhuai.com
    service: http://localhost:8080   # 其餘 → 靜態前端

  # 最後保留你原本的 catch-all
  - service: http_status:404
```

加 DNS 路由並重啟 tunnel：

```bash
cloudflared tunnel route dns <你的-tunnel-名稱> yunprint.taozhuai.com
sudo systemctl restart cloudflared      # 或你啟動 tunnel 的方式
```

> **若你的 cloudflared 本身是跑在容器裡**：`localhost` 不會指向宿主機。
> 解法二選一：(a) 把 cloudflared 容器和本專案放同一個 docker network，
> 改用服務名 `http://frontend:80` 與 `http://proxy:8787`；
> 或 (b) 在 cloudflared 容器加 `extra_hosts: host-gateway`，改用 `http://host.docker.internal:8080/8787`。

## 5. 驗收

開 `https://yunprint.taozhuai.com` → 應載入首頁。
進「AI 設計工作室」輸入一句描述 → 若 `.env` 金鑰正確，會回真實品牌包(非範例)。

---

## 哪些功能是真的、哪些還是 demo

| 功能 | 狀態 | 說明 |
|---|---|---|
| AI 影像工具（去背 / 元件擷取 / 升解析 / 轉 PDF） | **真**（瀏覽器端） | 在使用者瀏覽器以 WebGPU 跑 ISNet / SlimSAM / UpscalerJS / pdf-lib。需桌面 Chrome/Edge，首次載入下載模型，執行時連 esm.sh CDN。 |
| AI 設計工作室（生成品牌包） | **真**（部署後） | 經 `/api/design` → VPS proxy → 上游 LLM。金鑰未設或斷線時自動退回範例。 |
| 印前預檢（出血/安全線、一鍵修正） | **demo** | 介面為模擬動畫，尚無真實檔案分析。商轉需補後端服務。 |
| 報價（15 秒、最省/CP值/最快、130+ 印刷廠） | **demo** | 方案寫死、模擬計時。商轉需接報價引擎與印刷廠資料。 |
| 訂單 / Brand Kit | **demo** | 靜態畫面，無真實下單、無金流。 |

> 商轉時的擴充方向：報價、預檢、訂單各自做成獨立服務，新增 `/api/quote`、`/api/preflight`、`/api/order`，
> 用同樣的 Tunnel ingress 路由即可，proxy 維持單一職責不要塞功能。

## 注意：執行時依賴外部 CDN

前端的 React/Babel/Lucide 與影像模型都是執行時從 `unpkg` / `esm.sh` 抓的，**未打包進容器**。
原型期可接受；正式對外上線建議把這些函式庫 vendor 自帶，避免站台穩定性綁在第三方 CDN 上。
