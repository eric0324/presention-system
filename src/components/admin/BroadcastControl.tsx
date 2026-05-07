"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Radio } from "lucide-react"

export function BroadcastControl({
  sessionId,
  initialEnabled,
  initialPage,
  slideCount,
}: {
  sessionId: string
  initialEnabled: boolean
  initialPage: number
  slideCount: number
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [page, setPage] = useState(initialPage)

  async function patch(data: { enabled?: boolean; page?: number }) {
    const res = await fetch(`/api/admin/sessions/${sessionId}/broadcast`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) toast.error("操作失敗")
    return res.ok
  }

  async function toggleBroadcast(val: boolean) {
    const ok = await patch({ enabled: val })
    if (ok) {
      setEnabled(val)
      toast.success(val ? "廣播已開啟" : "廣播已關閉")
    }
  }

  async function goToPage(newPage: number) {
    if (newPage < 0 || newPage >= slideCount) return
    const ok = await patch({ page: newPage })
    if (ok) setPage(newPage)
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4 text-violet-600" />
        <h2 className="text-sm font-medium text-zinc-700">即時廣播控制</h2>
        {enabled && (
          <span className="ml-auto text-[10px] bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full animate-pulse">
            廣播中
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={enabled} onCheckedChange={toggleBroadcast} id="broadcast" />
        <Label htmlFor="broadcast" className="text-zinc-600 cursor-pointer">
          {enabled ? "廣播開啟 — 觀眾頁碼與此同步" : "廣播關閉 — 觀眾可自由翻頁"}
        </Label>
      </div>

      {enabled && slideCount > 0 && (
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
          <span className="text-sm text-zinc-400">目前頁碼</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 0}
            className="border-zinc-300 text-zinc-600 hover:bg-zinc-50"
          >
            ← 上一頁
          </Button>
          <span className="text-sm text-zinc-800 font-medium min-w-[4rem] text-center">
            {page + 1} / {slideCount}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToPage(page + 1)}
            disabled={page >= slideCount - 1}
            className="border-zinc-300 text-zinc-600 hover:bg-zinc-50"
          >
            下一頁 →
          </Button>
        </div>
      )}

      {slideCount === 0 && (
        <p className="text-xs text-zinc-500">尚未上傳簡報，請先上傳圖片後再使用廣播</p>
      )}
    </div>
  )
}
