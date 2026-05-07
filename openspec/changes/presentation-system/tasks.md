# Tasks：簡報系統

## 狀態說明
- [ ] 待執行
- [x] 已完成
- [~] 進行中

---

## Phase 1：專案基礎建設

- [ ] **T01** 初始化 Next.js 14 專案（TypeScript + Tailwind CSS + ESLint）
- [ ] **T02** 安裝並設定依賴：Prisma、NextAuth.js v5、shadcn/ui、Framer Motion、AWS SDK v3
- [ ] **T03** 建立 Prisma schema（User、Venue、Session、Slide）並執行 migration
- [ ] **T04** 建立 `lib/db.ts`（Prisma client singleton）
- [ ] **T05** 建立 `lib/s3.ts`（上傳、刪除）與 `lib/cloudfront.ts`（產生 Signed URL，效期 60 秒）
- [ ] **T06** 建立 `lib/broadcast.ts`（EventEmitter singleton）
- [ ] **T07** 建立 `lib/time.ts`（session 時間驗證工具函式）
- [ ] **T08** 設定 `middleware.ts`（保護 `/admin/*` 路由）
- [ ] **T09** 建立 `prisma/seed.ts`（從環境變數建立初始管理員）
- [ ] **T10** 設定 `.env.example`

---

## Phase 2：後台管理 API

- [ ] **T11** `POST /api/auth/[...nextauth]`：NextAuth 登入/登出
- [ ] **T12** `GET/POST /api/admin/venues`：場地列表、新增場地
- [ ] **T13** `GET/PATCH/DELETE /api/admin/venues/[id]`：場地詳情、更新、停用
- [ ] **T14** `GET/POST /api/admin/sessions`：場次列表、新增場次
- [ ] **T15** `GET/PATCH/DELETE /api/admin/sessions/[id]`：場次詳情、更新、刪除
- [ ] **T16** `POST /api/admin/slides`：圖片上傳至 S3，建立 Slide 記錄
- [ ] **T17** `DELETE /api/admin/slides/[id]`：刪除圖片（S3 + DB）
- [ ] **T18** `PATCH /api/admin/slides/reorder`：更新多張圖片的 order
- [ ] **T19** `GET/POST /api/admin/admins`：管理員列表、新增管理員
- [ ] **T20** `DELETE /api/admin/admins/[id]`：刪除管理員（需確保不刪最後一個）
- [ ] **T21** `PATCH /api/admin/sessions/[id]/broadcast`：控制廣播（開關 + 當前頁碼）

---

## Phase 3：公開前端 API

- [ ] **T22** `GET /api/slides/[key]`：驗證時間後產生 S3 presigned URL，302 redirect
- [ ] **T23** `GET /api/session/[id]/validate`：驗證 session 時間是否仍在範圍
- [ ] **T24** `GET /api/session/[id]/stream`：SSE endpoint（廣播接收）

---

## Phase 4：後台管理 UI

- [ ] **T25** 管理員登入頁 `/admin/login`
- [ ] **T26** 後台 Layout（側邊欄導航、登出按鈕）
- [ ] **T27** Dashboard `/admin/dashboard`（場地數、場次數、今日場次概覽）
- [ ] **T28** 場地管理頁 `/admin/venues`（列表 + 新增 Modal）
- [ ] **T29** 場地編輯頁 `/admin/venues/[id]`（表單 + 強調色選色器）
- [ ] **T30** 場次管理頁 `/admin/sessions`（列表，可依場地篩選）
- [ ] **T31** 場次編輯頁 `/admin/sessions/[id]`（表單 + 圖片上傳排序區）
  - 子任務：拖曳排序（dnd-kit）
  - 子任務：縮圖預覽
  - 子任務：廣播控制面板（開關 + 翻頁 + 連線人數顯示）
- [ ] **T32** 管理員管理頁 `/admin/admins`（列表 + 新增 + 刪除）

---

## Phase 5：公開前台 UI

- [ ] **T33** 場地選擇首頁 `/`
  - 深色背景 + 場地卡片（含強調色、進行中場次、下一場倒數）
  - Framer Motion scroll 動畫
- [ ] **T34** 場地議程頁 `/venue/[id]`
  - 場次列表（依時間排序）
  - 狀態標籤：未開始（含倒數）/ 進行中（高亮）/ 已結束
  - 點擊時間驗證 → 允許進入或顯示阻擋訊息
- [ ] **T35** 簡報檢視器 `/session/[id]`
  - Server Component 驗時間（時間外 redirect）
  - `SlideViewer`：圖片顯示、上一頁/下一頁、頁碼
  - `AntiCaptureMask`：浮水印 + 失焦遮罩
  - `BroadcastListener`：SSE 連線 + 廣播同步
  - 防截圖事件綁定（右鍵、拖曳、快捷鍵）
  - 定時驗證（每 60 秒呼叫 validate API）

---

## Phase 6：測試

- [ ] **T36** 時間驗證工具函式單元測試（`lib/time.ts`）
- [ ] **T37** S3 proxy API 整合測試（時間內 vs 時間外）
- [ ] **T38** 廣播 EventEmitter 單元測試（emit → listener 接收）
- [ ] **T39** 管理員 CRUD API 整合測試

---

## Phase 7：部署設定

- [ ] **T40** `next.config.ts` 設定 standalone output
- [ ] **T41** `presentation-system.service`（systemd unit 設定檔範本）
- [ ] **T42** Nginx 設定範本（反向代理 + SSL）
- [ ] **T43** S3 bucket policy 設定文件（私有存取）

---

## 執行順序建議

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

Phase 2 和 Phase 3 API 完成後即可同步進行 Phase 4 和 Phase 5 UI。
