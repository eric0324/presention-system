import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // 圖片透過 API proxy 取得，不需要 next/image 優化
    unoptimized: true,
  },
  // 安全性 headers
  async headers() {
    return [
      {
        source: "/session/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          // 停用瀏覽器快取（簡報圖片透過 signed URL 管理）
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ]
  },
}

export default nextConfig
