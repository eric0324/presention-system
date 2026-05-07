"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, ChevronRight } from "lucide-react"
import type { Venue } from "@prisma/client"

export function VenueList({ initialVenues }: { initialVenues: Venue[] }) {
  const router = useRouter()
  const [venues, setVenues] = useState(initialVenues)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/admin/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description"),
        accentColor: form.get("accentColor"),
      }),
    })
    setLoading(false)
    if (!res.ok) { toast.error("建立失敗"); return }
    const venue = await res.json()
    setVenues((prev) => [...prev, venue])
    setOpen(false)
    toast.success("場地已建立")
    router.refresh()
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/venues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    })
    if (!res.ok) { toast.error("更新失敗"); return }
    setVenues((prev) => prev.map((v) => v.id === id ? { ...v, isActive: !current } : v))
    toast.success(!current ? "已啟用" : "已停用")
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />新增場地
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>新增場地</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>場地名稱 *</Label>
                <Input name="name" required placeholder="例：主舞台" />
              </div>
              <div className="space-y-1.5">
                <Label>說明</Label>
                <Input name="description" placeholder="簡短描述" />
              </div>
              <div className="space-y-1.5">
                <Label>強調色</Label>
                <div className="flex items-center gap-3">
                  <input type="color" name="accentColor" defaultValue="#7c3aed"
                    className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-300" />
                  <span className="text-xs text-zinc-400">選擇場地代表色</span>
                </div>
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

      {venues.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm bg-white border border-zinc-200 rounded-xl">
          尚無場地，點擊「新增場地」開始
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-zinc-100">
            {venues.map((venue) => (
              <div key={venue.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: venue.accentColor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-800">{venue.name}</div>
                  {venue.description && <div className="text-xs text-zinc-400 mt-0.5">{venue.description}</div>}
                </div>
                <Badge
                  variant="outline"
                  className={`cursor-pointer ${venue.isActive
                    ? "border-green-300 text-green-600 bg-green-50"
                    : "border-zinc-300 text-zinc-400"}`}
                  onClick={() => toggleActive(venue.id, venue.isActive)}
                >
                  {venue.isActive ? "啟用" : "停用"}
                </Badge>
                <Link href={`/admin/venues/${venue.id}`} className="text-zinc-400 hover:text-zinc-600">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
