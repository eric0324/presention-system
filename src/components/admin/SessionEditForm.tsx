"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { SlideUploader } from "./SlideUploader"
import { BroadcastControl } from "./BroadcastControl"
import { AdUploader } from "./AdUploader"
import type { Session, Slide, Venue, Ad } from "@prisma/client"

type FullSession = Session & { slides: Slide[]; ads: Ad[]; venue: Venue }

function toDatetimeLocal(date: Date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const fieldCls = "w-full rounded-lg border border-zinc-300 bg-white text-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"

export function SessionEditForm({ session, venues }: { session: FullSession; venues: Venue[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch(`/api/admin/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueId: form.get("venueId"),
        title: form.get("title"),
        speaker: form.get("speaker") || undefined,
        startAt: form.get("startAt"),
        endAt: form.get("endAt"),
      }),
    })
    setLoading(false)
    if (!res.ok) { toast.error("儲存失敗"); return }
    toast.success("已儲存")
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("確定刪除此場次？相關簡報圖片也會一併刪除。")) return
    const res = await fetch(`/api/admin/sessions/${session.id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("刪除失敗"); return }
    toast.success("已刪除")
    router.push("/admin/sessions")
  }

  return (
    <div className="space-y-6">
      {/* 基本資料 */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-medium text-zinc-700 border-b border-zinc-100 pb-3">基本資料</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>場地 *</Label>
            <select name="venueId" defaultValue={session.venueId} className={fieldCls}>
              {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>場次主題 *</Label>
            <Input name="title" required defaultValue={session.title} />
          </div>
          <div className="space-y-1.5">
            <Label>講師</Label>
            <Input name="speaker" defaultValue={session.speaker ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>開始時間 *</Label>
            <Input name="startAt" type="datetime-local" required defaultValue={toDatetimeLocal(session.startAt)} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <Label>結束時間 *</Label>
            <Input name="endAt" type="datetime-local" required defaultValue={toDatetimeLocal(session.endAt)} className="w-full" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
            <Button type="button" variant="ghost" onClick={handleDelete}
              className="text-red-500 hover:text-red-600 hover:bg-red-50">
              刪除場次
            </Button>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white">
              {loading ? "儲存中…" : "儲存變更"}
            </Button>
          </div>
        </form>
      </div>

      {/* 廣播控制 */}
      <BroadcastControl
        sessionId={session.id}
        initialEnabled={session.broadcastEnabled}
        initialPage={session.broadcastPage}
        slideCount={session.slides.length}
      />

      {/* 簡報圖片 */}
      <SlideUploader sessionId={session.id} initialSlides={session.slides} />

      {/* 廣告推播 */}
      <AdUploader sessionId={session.id} initialAds={session.ads} />
    </div>
  )
}
