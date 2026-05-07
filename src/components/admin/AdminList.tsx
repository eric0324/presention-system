"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

type Admin = { id: string; email: string; name: string; createdAt: Date }

export function AdminList({ initialAdmins }: { initialAdmins: Admin[] }) {
  const [admins, setAdmins] = useState(initialAdmins)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password"), name: form.get("name") }),
    })
    setLoading(false)
    if (!res.ok) { const { error } = await res.json(); toast.error(typeof error === "string" ? error : "建立失敗"); return }
    const admin = await res.json()
    setAdmins((prev) => [...prev, admin])
    setOpen(false)
    toast.success("管理員已建立")
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`確定移除管理員 ${email}？`)) return
    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" })
    if (!res.ok) { const { error } = await res.json(); toast.error(error ?? "刪除失敗"); return }
    setAdmins((prev) => prev.filter((a) => a.id !== id))
    toast.success("已移除")
  }

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex justify-end">
        <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />新增管理員
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>新增管理員</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>姓名 *</Label>
                <Input name="name" required placeholder="管理員姓名" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input name="email" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label>密碼 *（至少 8 位）</Label>
                <Input name="password" type="password" required minLength={8} />
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

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-zinc-100">
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-medium shrink-0">
                {admin.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-800">{admin.name}</div>
                <div className="text-xs text-zinc-400">{admin.email}</div>
              </div>
              <div className="text-xs text-zinc-300">{new Date(admin.createdAt).toLocaleDateString("zh-TW")}</div>
              <button onClick={() => handleDelete(admin.id, admin.email)} disabled={admins.length <= 1}
                className="text-zinc-300 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
