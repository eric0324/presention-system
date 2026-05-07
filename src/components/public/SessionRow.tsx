"use client"

import { useRouter } from "next/navigation"
import { Countdown } from "./Countdown"
import { toast } from "sonner"
import type { Session } from "@prisma/client"
import type { SessionTimeStatus } from "@/lib/time"

type Props = {
  session: Session
  status: SessionTimeStatus
  hasSlides: boolean
  now: string
  accentColor: string
}

const STATUS_CONFIG = {
  active: {
    badge: "bg-green-500/15 text-green-400 border-green-500/20",
    label: "進行中",
    rowCls: "border-green-500/20 bg-green-500/5",
  },
  not_started: {
    badge: "bg-zinc-800 text-zinc-500 border-zinc-700",
    label: "未開始",
    rowCls: "border-white/8 bg-zinc-900/40",
  },
  ended: {
    badge: "bg-zinc-900 text-zinc-600 border-zinc-800",
    label: "已結束",
    rowCls: "border-white/5 bg-zinc-900/20 opacity-60",
  },
}

export function SessionRow({ session, status, hasSlides, now, accentColor }: Props) {
  const router = useRouter()
  const { badge, label, rowCls } = STATUS_CONFIG[status]

  function handleClick() {
    if (status === "not_started") {
      toast.error("場次尚未開始，請稍候")
      return
    }
    if (status === "ended") {
      toast.error("此場次已結束")
      return
    }
    if (!hasSlides) {
      toast.error("此場次尚未上傳簡報")
      return
    }
    router.push(`/session/${session.id}`)
  }

  const isClickable = status === "active" && hasSlides

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left rounded-xl border p-5 transition-all duration-200 ${rowCls} ${
        isClickable ? "cursor-pointer hover:border-white/15 hover:bg-zinc-900/60" : "cursor-default"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* 時間軸點 */}
        <div className="shrink-0 mt-1">
          <div
            className={`w-2 h-2 rounded-full ${status === "active" ? "animate-pulse" : "opacity-40"}`}
            style={{ backgroundColor: status === "active" ? accentColor : "#71717a" }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] border px-2 py-0.5 rounded-full ${badge}`}>{label}</span>
            {status === "not_started" && (
              <span className="text-[10px] text-zinc-500">
                <Countdown targetIso={session.startAt.toISOString()} now={now} />後開始
              </span>
            )}
          </div>

          <h3 className={`font-medium leading-snug ${status === "ended" ? "text-zinc-500" : "text-white"}`}>
            {session.title}
          </h3>
          {session.speaker && (
            <p className="text-xs text-zinc-500 mt-0.5">{session.speaker}</p>
          )}
        </div>

        {/* 時間 */}
        <div className="shrink-0 text-right">
          <div className="text-xs text-zinc-400">
            {new Date(session.startAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-xs text-zinc-600">
            – {new Date(session.endAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>

        {/* 進入箭頭 */}
        {isClickable && (
          <div className="shrink-0 text-zinc-500 text-sm self-center">→</div>
        )}
      </div>
    </button>
  )
}
