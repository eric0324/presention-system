"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Radio } from "lucide-react"
import { AntiCaptureMask } from "./AntiCaptureMask"
import { BroadcastListener } from "./BroadcastListener"
import { AdOverlay } from "./AdOverlay"
import { AnnouncementBanner } from "@/components/AnnouncementBanner"

type VenueSwitcherItem = {
  id: string
  name: string
  accentColor: string
  targetSessionId: string | null
  sessionTitle: string | null
  sessionSpeaker: string | null
}

type AdItem = { id: string; linkUrl: string }

type Props = {
  sessionId: string
  slideIds: string[]
  title: string
  speaker?: string
  venueName: string
  venueId: string
  accentColor: string
  broadcastEnabled: boolean
  broadcastPage: number
  endAt: string
  venueSwitcher: VenueSwitcherItem[]
  ads: AdItem[]
}

export function SlideViewer({
  sessionId,
  slideIds,
  title,
  speaker,
  venueName,
  venueId,
  accentColor,
  broadcastEnabled: initBroadcast,
  broadcastPage: initPage,
  endAt,
  venueSwitcher,
  ads,
}: Props) {
  const router = useRouter()
  const total = slideIds.length
  const [page, setPage] = useState(0)
  const [isBroadcast, setIsBroadcast] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const [venueOpen, setVenueOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 })

  const openVenue = () => {
    const r = btnRef.current?.getBoundingClientRect()
    if (r) setDropPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    setVenueOpen(true)
  }

  // 同步廣播初始狀態（只在 client mount 後執行，避免 SSR hydration mismatch）
  useEffect(() => {
    if (initBroadcast) {
      setIsBroadcast(true)
      setPage(initPage)
    }
  }, [initBroadcast, initPage])
  const imgRef = useRef<HTMLImageElement>(null)

// ── 防截圖事件 ──────────────────────────────────────────
  useEffect(() => {
    const block = (e: Event) => e.preventDefault()
    const blockKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
      if (e.key === "PrintScreen") e.preventDefault()
    }

    document.addEventListener("contextmenu", block)
    document.addEventListener("dragstart", block)
    document.addEventListener("keydown", blockKey)

    return () => {
      document.removeEventListener("contextmenu", block)
      document.removeEventListener("dragstart", block)
      document.removeEventListener("keydown", blockKey)
    }
  }, [])

  // ── 鍵盤翻頁 ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isBroadcast) return
      if (e.key === "ArrowLeft") setPage((p) => Math.max(0, p - 1))
      if (e.key === "ArrowRight") setPage((p) => Math.min(total - 1, p + 1))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isBroadcast, total])

  // ── 定時驗證場次時間（每 60 秒）──────────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch(`/api/session/${sessionId}/validate`)
      if (!res.ok) return
      const { status } = await res.json()
      if (status !== "active") {
        router.push("/")
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [sessionId, venueId, router])

  // ── 廣播回呼 ──────────────────────────────────────────
  const handlePageChange = useCallback((p: number) => setPage(p), [])
  const handleBroadcastChange = useCallback((enabled: boolean) => setIsBroadcast(enabled), [])
  const handleReload = useCallback(() => router.refresh(), [router])

  const goPrev = () => { if (!isBroadcast) setPage((p) => Math.max(0, p - 1)) }
  const goNext = () => { if (!isBroadcast) setPage((p) => Math.min(total - 1, p + 1)) }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* 頂部 Bar */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md shrink-0">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/event-logo.svg" alt="活動" className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity" />
        </Link>

        <div className="w-px self-stretch bg-white/10 shrink-0" />

        {/* 講題 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{title}</p>
          {speaker && <p className="text-xs text-zinc-400 truncate">{speaker}</p>}
        </div>

        {/* 右側：廣播 + 場地按鈕 */}
        <div className="flex items-center gap-2 shrink-0">
          {isBroadcast && (
            <span className="flex items-center gap-1 text-[10px] text-green-400 border border-green-500/20 bg-green-500/10 px-2 py-0.5 rounded-full">
              <Radio className="w-2.5 h-2.5" />廣播中
            </span>
          )}
          <button
            ref={btnRef}
            type="button"
            onClick={openVenue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-zinc-300 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            {venueName}
            <ChevronRight className="w-3 h-3 text-zinc-500 rotate-90" />
          </button>
        </div>
      </header>

      <AnnouncementBanner />

      {/* 場地 dropdown（fixed，不受任何父層 CSS 影響） */}
      {venueOpen && (
        <>
          {/* 背景遮罩，點擊關閉 */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 998 }}
            onClick={() => setVenueOpen(false)}
          />
          {/* 選單本體 */}
          <div
            style={{
              position: "fixed",
              top: dropPos.top,
              right: dropPos.right,
              zIndex: 999,
              minWidth: 220,
            }}
            className="rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60 overflow-hidden py-1"
          >
            {venueSwitcher
              .filter((v) => v.id === venueId || v.targetSessionId !== null)
              .map((v) => {
                const isActive = v.id === venueId
                const href = v.targetSessionId ? `/session/${v.targetSessionId}` : "/"
                return (
                  <Link
                    key={v.id}
                    href={href}
                    onClick={() => setVenueOpen(false)}
                    className={`flex items-start gap-2.5 px-4 py-2.5 transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: v.accentColor }} />
                    <span>
                      <span className="block text-xs font-medium">{v.name}</span>
                      {v.sessionTitle && (
                        <span className="block text-[11px] text-zinc-300 mt-0.5">{v.sessionTitle}</span>
                      )}
                      {v.sessionSpeaker && (
                        <span className="block text-[11px] text-zinc-500 mt-0.5">{v.sessionSpeaker}</span>
                      )}
                    </span>
                    {isActive && <span className="ml-auto text-[10px] text-zinc-600 self-center shrink-0">目前</span>}
                  </Link>
                )
              })}
          </div>
        </>
      )}

      {/* 主要簡報區 */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div
          className="relative w-full max-w-5xl aspect-video bg-zinc-900/60 rounded-xl overflow-hidden border border-white/10 select-none"
          style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
        >
          {/* 圖片 */}
          {total > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              key={slideIds[page]}
              src={`/api/slides/${slideIds[page]}`}
              alt={`第 ${page + 1} 頁`}
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">
              此場次尚無簡報
            </div>
          )}

          {/* 浮水印 + 失焦遮罩 */}
          <AntiCaptureMask sessionId={sessionId} currentPage={page} />
        </div>
      </div>

      {/* 底部控制列 */}
      <footer className="flex items-center justify-center gap-4 py-4 border-t border-white/10 shrink-0 select-none">
        <button
          onClick={goPrev}
          disabled={mounted && (page === 0 || isBroadcast)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-zinc-300 border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />上一頁
        </button>

        {/* 頁碼點 */}
        {total <= 20 && (
          <div className="flex gap-1">
            {slideIds.map((_, i) => (
              <button
                key={i}
                onClick={() => !isBroadcast && setPage(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === page ? "scale-125" : "opacity-30 hover:opacity-50"
                }`}
                style={{ backgroundColor: i === page ? accentColor : "#71717a" }}
              />
            ))}
          </div>
        )}

        <span className="text-xs text-zinc-600 tabular-nums min-w-[3rem] text-center">
          {page + 1} / {total}
        </span>

        {isBroadcast && (
          <span className="text-xs text-zinc-500">廣播中，翻頁由主持人控制</span>
        )}

        <button
          onClick={goNext}
          disabled={mounted && (page === total - 1 || isBroadcast)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-zinc-300 border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          下一頁<ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* SSE 廣播監聽 */}
      <BroadcastListener
        sessionId={sessionId}
        onPageChange={handlePageChange}
        onBroadcastChange={handleBroadcastChange}
        onReload={handleReload}
      />

      {/* 廣告推播 */}
      <AdOverlay ads={ads} />
    </div>
  )
}
