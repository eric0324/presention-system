# Design：簡報系統技術設計

## 技術選型

| 類別 | 選擇 | 理由 |
|---|---|---|
| 框架 | Next.js 14 (App Router) | SSR、API Routes 一體 |
| 語言 | TypeScript | 型別安全，減少 runtime 錯誤 |
| 樣式 | Tailwind CSS + shadcn/ui | 快速開發，深色主題支援佳 |
| 動畫 | Framer Motion | scroll 觸發動畫 |
| ORM | Prisma | 型別安全的 DB 存取 |
| 資料庫 | PostgreSQL | 自架或 Managed（RDS / Supabase） |
| 認證 | NextAuth.js v5 | 內建 JWT，與 App Router 整合 |
| 檔案儲存 | AWS S3 | 圖片存放，URL 不公開，透過後端 proxy |
| 廣播 | Node.js EventEmitter（單 process）| 單台 VPS 部署，無需 Redis |
| 圖片 CDN | CloudFront（files.sat.cool）| CDN 加速 + Signed URL 保護 |
| 部署 | VPS（systemd + Nginx）| 原生 Linux 服務管理，輕量無額外依賴 |

---

## 資料庫 Schema

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
}

model Venue {
  id          String    @id @default(cuid())
  name        String
  description String?
  accentColor String    @default("#7c3aed")
  isActive    Boolean   @default(true)
  order       Int       @default(0)
  sessions    Session[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Session {
  id               String   @id @default(cuid())
  venueId          String
  venue            Venue    @relation(fields: [venueId], references: [id])
  title            String
  speaker          String?
  startAt          DateTime
  endAt            DateTime
  slides           Slide[]
  broadcastEnabled Boolean  @default(false)
  broadcastPage    Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Slide {
  id        String   @id @default(cuid())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  s3Key     String   // S3 object key
  order     Int      // 頁碼順序（從 0 開始）
  createdAt DateTime @default(now())
}
```

---

## 目錄結構

```
src/
  app/
    (public)/
      page.tsx                        ← 場地選擇首頁
      venue/[id]/page.tsx             ← 場地議程
      session/[id]/
        page.tsx                      ← 簡報檢視器（Server Component，驗時間）
        _components/
          SlideViewer.tsx             ← Client Component（翻頁、防截圖）
          AntiCaptureMask.tsx         ← 浮水印 + 失焦遮罩
          BroadcastListener.tsx       ← SSE 連線 + 接收廣播
    (admin)/
      admin/
        login/page.tsx
        dashboard/page.tsx
        venues/
          page.tsx
          [id]/page.tsx
        sessions/
          page.tsx
          [id]/page.tsx
        admins/page.tsx
    api/
      auth/[...nextauth]/route.ts
      slides/[key]/route.ts           ← S3 signed URL proxy（驗時間後轉址）
      session/[id]/
        validate/route.ts             ← 前端定時呼叫，驗時間是否仍在範圍
        stream/route.ts               ← SSE endpoint（廣播接收）
      admin/
        venues/route.ts
        venues/[id]/route.ts
        sessions/route.ts
        sessions/[id]/route.ts
        sessions/[id]/broadcast/route.ts  ← 控制廣播（開關 + 翻頁）
        slides/route.ts               ← 圖片上傳
        slides/[id]/route.ts
        admins/route.ts
        admins/[id]/route.ts
  lib/
    auth.ts                           ← NextAuth 設定
    db.ts                             ← Prisma client singleton
    s3.ts                             ← AWS S3 工具函式（上傳、刪除）
    cloudfront.ts                     ← CloudFront Signed URL 產生
    broadcast.ts                      ← EventEmitter singleton（SSE 廣播）
    time.ts                           ← 時間驗證工具
  middleware.ts                       ← /admin/* 路由保護
```

---

## 關鍵設計決策

### 圖片保護機制

S3 bucket 設為**私有**，只允許 CloudFront OAC（Origin Access Control）存取，禁止直接公開。圖片請求流程：

```
瀏覽器 → GET /api/slides/[s3Key]
         ↓ 伺服器驗證：
           1. session 是否在時間內（startAt <= now <= endAt）
         ↓ 通過 → 產生 CloudFront Signed URL（效期 60 秒）
                   URL 格式：https://files.sat.cool/[s3Key]?Policy=...&Signature=...
         ↓ 302 redirect → CloudFront → S3（透過 OAC）
```

**優點**：圖片走 CDN 快取加速，同時 URL 有時效保護，無法直接下載或分享。

### SSE 廣播架構（單 Process）

```
lib/broadcast.ts
  export const emitter = new EventEmitter()  // 模組層級 singleton

管理員翻頁：
  PATCH /api/admin/sessions/[id]/broadcast { page: 5 }
  → 更新 DB broadcastPage
  → emitter.emit(`session:${id}`, { page: 5 })

觀看者連線：
  GET /api/session/[id]/stream
  → 建立 ReadableStream
  → emitter.on(`session:${id}`, send)
  → 連線關閉時 emitter.off(...)
```

### 時間驗證（雙層）

1. **Server Component**（進入頁面時）：`page.tsx` 在 server 端查 DB，時間不對直接 redirect
2. **Client 定時驗證**（進入後每 60 秒）：呼叫 `/api/session/[id]/validate`，過期則 `router.push` 回議程頁

### 浮水印

```
position: absolute, inset: 0, z-index: 50, pointer-events: none
內容：Session ID 後四碼 + 時間戳，旋轉 -15deg，opacity: 0.07
位置：每次頁面切換時隨機 x/y 偏移
```

### 管理員初始化

`prisma/seed.ts` 讀取環境變數 `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD`，首次 `prisma db seed` 時建立第一個管理員。

---

## 防截圖措施清單

| 措施 | 實作位置 | 效果 |
|---|---|---|
| 禁止右鍵 | `onContextMenu` preventDefault | 防一般使用者另存 |
| 禁止拖曳 | `img onDragStart` preventDefault | 防拖曳儲存 |
| 禁止文字選取 | CSS `select-none` | 防選取複製 |
| 攔截快捷鍵 | `keydown` listener | 防 Ctrl+S/P/U |
| 浮水印 | `AntiCaptureMask` | 截圖留追蹤痕跡 |
| 失焦遮罩 | `window blur/focus` | 遮擋畫面 |
| S3 圖片 URL 保護 | presigned URL（60 秒效期）| 無法直接分享下載 |
| DevTools 偵測 | `debugger` loop + window size diff | 減慢逆向速度 |

---

## 環境變數

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
AUTH_SECRET=
AUTH_URL=http://localhost:3000

# AWS S3
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=

# CloudFront（files.sat.cool）
CLOUDFRONT_DOMAIN=files.sat.cool
CLOUDFRONT_KEY_PAIR_ID=          # CloudFront key group 的 key pair ID
CLOUDFRONT_PRIVATE_KEY=          # PEM 格式私鑰（base64 encoded）

# 初始管理員（seed 用）
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

---

## 部署（VPS）

```
Next.js standalone output
systemd service 管理 Node.js 程序（自動重啟、開機啟動）
Nginx 反向代理 → port 3000
SSL：Let's Encrypt / Certbot
圖片存 S3（私有 bucket）→ CloudFront files.sat.cool
```
