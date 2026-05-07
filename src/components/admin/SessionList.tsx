"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, ChevronRight } from "lucide-react"
import { getSessionStatus } from "@/lib/time"
import type { Venue } from "@prisma/client"

type Session = {
  id: string
  title: string
  speaker: string | null
  startAt: Date
  endAt: Date
  venue: { id: string; name: string; accentColor: string }
}

const STATUS_MAP = {
  not_started: { label: "未開始", cls: "border-zinc-300 text-zinc-400" },
  active: { label: "進行中", cls: "border-green-300 text-green-600 bg-green-50" },
  ended: { label: "已結束", cls: "border-zinc-200 text-zinc-300" },
}

export function SessionList({ initialSessions, venues }: { initialSessions: Session[]; venues: Venue[] }) {
  const router = useRouter()
  const [sessions, setSessions] = useState(initialSessions)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filterVenue, setFilterVenue] = useState("")

  const displayed = filterVenue ? sessions.filter((s) => s.venue.id === filterVenue) : sessions

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const venueId = form.get("venueId") as string
    const res = await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueId,
        title: form.get("title"),
        speaker: form.get("speaker") || undefined,
        startAt: form.get("startAt"),
        endAt: form.get("endAt"),
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(typeof error === "string" ? error : "建立失敗")
      return
    }
    const created = await res.json()
    const venue = venues.find((v) => v.id === venueId)!
    setSessions((prev) => [...prev, {
      ...created,
      startAt: new Date(created.startAt),
      endAt: new Date(created.endAt),
      venue: { id: venue.id, name: venue.name, accentColor: venue.accentColor },
    }])
    toast.success("場次已建立")
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterVenue("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filterVenue ? "bg-violet-50 border-violet-300 text-violet-600" : "border-zinc-200 text-zinc-400 hover:text-zinc-700"}`}>
            全部
          </button>
          {venues.map((v) => (
            <button key={v.id} onClick={() => setFilterVenue(v.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterVenue === v.id ? "border-zinc-400 text-zinc-700 bg-zinc-100" : "border-zinc-200 text-zinc-400 hover:text-zinc-700"}`}>
              {v.name}
            </button>
          ))}
        </div>

        <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-2 shrink-0" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />新增場次
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>新增場次</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>場地 *</Label>
                <select name="venueId" required className="w-full rounded-md border border-zinc-300 bg-white text-zinc-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="">請選擇場地</option>
                  {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>場次主題 *</Label>
                <Input name="title" required placeholder="簡報主題" />
              </div>
              <div className="space-y-1.5">
                <Label>講師</Label>
                <Input name="speaker" placeholder="講師姓名" />
              </div>
              <div className="space-y-1.5">
                <Label>開始時間 *</Label>
                <Input name="startAt" type="datetime-local" required className="w-full" />
              </div>
              <div className="space-y-1.5">
                <Label>結束時間 *</Label>
                <Input name="endAt" type="datetime-local" required className="w-full" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>取消</Button>
                <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white">
                  {loading ? "建立中…" : "建立"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm bg-white border border-zinc-200 rounded-xl">
          尚無場次
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-zinc-100">
            {displayed.map((s) => {
              const status = getSessionStatus(s.startAt, s.endAt)
              const { label, cls } = STATUS_MAP[status]
              return (
                <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.venue.accentColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-800 truncate">{s.title}</div>
                    <div className="text-xs text-zinc-400">{s.venue.name}{s.speaker ? ` · ${s.speaker}` : ""}</div>
                  </div>
                  <div className="text-xs text-zinc-400 shrink-0 hidden sm:block">
                    {new Date(s.startAt).toLocaleDateString("zh-TW")}
                    {" "}{new Date(s.startAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <Badge variant="outline" className={cls}>{label}</Badge>
                  <Link href={`/admin/sessions/${s.id}`} className="text-zinc-400 hover:text-zinc-600">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
