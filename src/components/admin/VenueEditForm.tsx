"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import type { Venue } from "@prisma/client"

export function VenueEditForm({ venue }: { venue: Venue }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isActive, setIsActive] = useState(venue.isActive)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch(`/api/admin/venues/${venue.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description"),
        accentColor: form.get("accentColor"),
        isActive,
        order: Number(form.get("order")),
      }),
    })
    setLoading(false)
    if (!res.ok) { toast.error("儲存失敗"); return }
    toast.success("已儲存")
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("確定刪除此場地？")) return
    const res = await fetch(`/api/admin/venues/${venue.id}`, { method: "DELETE" })
    if (!res.ok) { const { error } = await res.json(); toast.error(error ?? "刪除失敗"); return }
    toast.success("已刪除")
    router.push("/admin/venues")
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5 max-w-lg shadow-sm">
      <div className="space-y-1.5">
        <Label>場地名稱 *</Label>
        <Input name="name" required defaultValue={venue.name} />
      </div>
      <div className="space-y-1.5">
        <Label>說明</Label>
        <Input name="description" defaultValue={venue.description ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label>強調色</Label>
        <div className="flex items-center gap-3">
          <input type="color" name="accentColor" defaultValue={venue.accentColor}
            className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-300" />
          <span className="text-xs text-zinc-400">{venue.accentColor}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>排序</Label>
        <Input name="order" type="number" defaultValue={venue.order} className="w-28" />
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
        <Label htmlFor="isActive" className="cursor-pointer">{isActive ? "啟用中" : "已停用"}</Label>
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
          刪除場地
        </Button>
        <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white">
          {loading ? "儲存中…" : "儲存變更"}
        </Button>
      </div>
    </form>
  )
}
