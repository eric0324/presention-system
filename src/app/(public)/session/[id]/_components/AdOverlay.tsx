"use client"

import { useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"

type Ad = { id: string; linkUrl: string }

const DISPLAY_MS = 20_000       // 顯示 20 秒
const MIN_INTERVAL = 10_000     // 最短 10 秒後出現
const MAX_INTERVAL = 30_000     // 最長 30 秒後出現

function randomInterval() {
  return MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)
}

export function AdOverlay({ ads }: { ads: Ad[] }) {
  const [current, setCurrent] = useState<Ad | null>(null)
  const [visible, setVisible] = useState(false)

  const show = useCallback(() => {
    if (!ads.length) return
    const ad = ads[Math.floor(Math.random() * ads.length)]
    setCurrent(ad)
    setVisible(true)

    // 10 秒後自動消失
    setTimeout(() => setVisible(false), DISPLAY_MS)
  }, [ads])

  useEffect(() => {
    if (!ads.length) return

    // 第一次：隨機延遲後出現
    const first = setTimeout(show, randomInterval())
    return () => clearTimeout(first)
  }, [ads, show])

  // 消失後，安排下一次出現
  useEffect(() => {
    if (visible) return
    if (!ads.length) return

    const next = setTimeout(show, randomInterval())
    return () => clearTimeout(next)
  }, [visible, ads, show])

  if (!current || !visible) return null

  return (
    <a
      href={current.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 block rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 group"
      style={{ animation: "adSlideIn 0.35s ease-out" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/ads/${current.id}`}
        alt="廣告"
        className="w-64 object-cover block"
        draggable={false}
      />
      {/* 關閉按鈕 */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setVisible(false) }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </button>
    </a>
  )
}
