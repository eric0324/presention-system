"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Megaphone } from "lucide-react"

export function AnnouncementForm({
  initialContent,
  initialEnabled,
}: {
  initialContent: string
  initialEnabled: boolean
}) {
  const [content, setContent] = useState(initialContent)
  const [enabled, setEnabled] = useState(initialEnabled)
  const [saving, setSaving] = useState(false)

  async function patch(data: { content?: string; enabled?: boolean }) {
    const res = await fetch("/api/admin/announcement", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error("操作失敗"); return false }
    return true
  }

  async function handleToggle(val: boolean) {
    const ok = await patch({ enabled: val })
    if (ok) {
      setEnabled(val)
      toast.success(val ? "公告已開啟" : "公告已關閉")
    }
  }

  async function handleSave() {
    if (!content.trim()) { toast.error("請輸入公告內容"); return }
    setSaving(true)
    const ok = await patch({ content: content.trim() })
    setSaving(false)
    if (ok) toast.success("公告已儲存")
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-violet-600" />
        <h2 className="text-sm font-medium text-zinc-700">全站跑馬燈公告</h2>
        {enabled && (
          <span className="ml-auto text-[10px] bg-violet-500/10 text-violet-500 border border-violet-500/20 px-2 py-0.5 rounded-full animate-pulse">
            播出中
          </span>
        )}
      </div>

      {/* 開關 */}
      <div className="flex items-center gap-3">
        <Switch checked={enabled} onCheckedChange={handleToggle} id="ann-enabled" />
        <Label htmlFor="ann-enabled" className="text-zinc-600 cursor-pointer">
          {enabled ? "公告顯示中 — 所有頁面頂部可見" : "公告已關閉"}
        </Label>
      </div>

      {/* 內容 */}
      <div className="space-y-2">
        <Label className="text-zinc-600">公告內容</Label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="輸入要在跑馬燈顯示的文字…"
          rows={3}
          className="w-full rounded-lg border border-zinc-300 bg-white text-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>

      {/* 預覽 */}
      {content && (
        <div className="rounded-lg overflow-hidden border border-zinc-200">
          <p className="text-[10px] text-zinc-400 px-3 py-1 bg-zinc-50 border-b border-zinc-200">預覽</p>
          <div className="bg-violet-600 text-white text-sm px-4 py-2 text-center">
            {content}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-violet-600 hover:bg-violet-500 text-white"
        >
          {saving ? "儲存中…" : "儲存公告"}
        </Button>
      </div>
    </div>
  )
}
