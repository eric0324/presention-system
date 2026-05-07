"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Upload, X, ExternalLink } from "lucide-react"
import type { Ad } from "@prisma/client"

export function AdUploader({
  sessionId,
  initialAds,
}: {
  sessionId: string
  initialAds: Ad[]
}) {
  const [ads, setAds] = useState(initialAds)
  const [uploading, setUploading] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPendingFile(file)
    e.target.value = ""
  }

  const handleUpload = useCallback(async () => {
    if (!pendingFile) { toast.error("請先選擇圖片"); return }
    if (!linkUrl.trim()) { toast.error("請輸入連結 URL"); return }

    setUploading(true)
    const form = new FormData()
    form.append("sessionId", sessionId)
    form.append("linkUrl", linkUrl.trim())
    form.append("file", pendingFile)

    const res = await fetch("/api/admin/ads", { method: "POST", body: form })
    setUploading(false)

    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error ?? "上傳失敗")
      return
    }
    const created: Ad = await res.json()
    setAds((prev) => [...prev, created])
    setPendingFile(null)
    setLinkUrl("")
    toast.success("廣告已新增")
  }, [pendingFile, linkUrl, sessionId])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("確定刪除此廣告？")) return
    const res = await fetch(`/api/admin/ads/${id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("刪除失敗"); return }
    setAds((prev) => prev.filter((a) => a.id !== id))
    toast.success("已刪除")
  }, [])

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-sm">
      <h2 className="text-sm font-medium text-zinc-700">
        廣告推播
        {ads.length > 0 && (
          <span className="ml-2 text-zinc-400 font-normal">（{ads.length} 則）</span>
        )}
      </h2>

      {/* 新增廣告 */}
      <div className="border border-zinc-200 rounded-lg p-4 space-y-3 bg-zinc-50">
        <p className="text-xs font-medium text-zinc-600">新增廣告</p>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer shrink-0">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {pendingFile ? pendingFile.name : "選擇圖片"}
            </span>
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 rounded-md border border-zinc-300 bg-white text-zinc-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={handleUpload}
            disabled={uploading || !pendingFile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {uploading ? "上傳中…" : "新增"}
          </button>
        </div>
      </div>

      {/* 廣告列表 */}
      {ads.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-4">尚未新增廣告</p>
      ) : (
        <div className="space-y-2">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/ads/${ad.id}`}
                alt="廣告"
                className="w-16 h-10 object-cover rounded border border-zinc-200 shrink-0"
              />
              <a
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 text-xs text-violet-600 hover:underline truncate flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                {ad.linkUrl}
              </a>
              <button
                onClick={() => handleDelete(ad.id)}
                className="p-1 rounded hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
