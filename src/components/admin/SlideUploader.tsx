"use client"

import { useState, useCallback, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import { Upload, X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Slide } from "@prisma/client"

function SortableSlide({
  slide,
  index,
  onDelete,
}: {
  slide: Slide
  index: number
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative group rounded-lg overflow-hidden border ${isDragging ? "border-violet-500 opacity-50" : "border-zinc-200"} bg-zinc-50 aspect-video`}
    >
      {/* 縮圖 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/admin/slides/${slide.id}/thumb`}
        alt={`第 ${index + 1} 頁`}
        className="w-full h-full object-cover"
        onError={(e) => {
          // 圖片載入失敗時顯示頁碼
          (e.target as HTMLImageElement).style.display = "none"
        }}
      />

      {/* 頁碼 */}
      <div className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-zinc-300 px-1.5 py-0.5 rounded">
        {index + 1}
      </div>

      {/* 拖曳把手 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 bg-black/60 rounded transition-opacity"
      >
        <GripVertical className="w-3 h-3 text-zinc-300" />
      </div>

      {/* 刪除 */}
      <button
        onClick={() => onDelete(slide.id)}
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 bg-black/60 hover:bg-red-500/80 rounded transition-all"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  )
}

export function SlideUploader({
  sessionId,
  initialSlides,
}: {
  sessionId: string
  initialSlides: Slide[]
}) {
  const [slides, setSlides] = useState(initialSlides)
  const [uploading, setUploading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = slides.findIndex((s) => s.id === active.id)
      const newIndex = slides.findIndex((s) => s.id === over.id)
      const newSlides = arrayMove(slides, oldIndex, newIndex)
      setSlides(newSlides)

      await fetch("/api/admin/slides/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newSlides.map((s) => s.id) }),
      })
    },
    [slides]
  )

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return
      setUploading(true)
      const form = new FormData()
      form.append("sessionId", sessionId)
      Array.from(files).forEach((f) => form.append("files", f))

      const res = await fetch("/api/admin/slides", { method: "POST", body: form })
      setUploading(false)
      if (!res.ok) {
        const { error } = await res.json()
        toast.error(error ?? "上傳失敗")
        return
      }
      const created: Slide[] = await res.json()
      setSlides((prev) => [...prev, ...created])
      toast.success(`已上傳 ${created.length} 張`)
    },
    [sessionId]
  )

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("確定刪除此頁？")) return
    const res = await fetch(`/api/admin/slides/${id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("刪除失敗"); return }
    setSlides((prev) => prev.filter((s) => s.id !== id))
    toast.success("已刪除")
  }, [])

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-700">
          簡報圖片
          {slides.length > 0 && (
            <span className="ml-2 text-zinc-400 font-normal">（{slides.length} 頁）</span>
          )}
        </h2>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "上傳中…" : "上傳圖片"}
          </span>
        </label>
      </div>

      {slides.length === 0 ? (
        <label className="cursor-pointer block">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
          />
          <div className="border-2 border-dashed border-zinc-200 rounded-xl py-12 flex flex-col items-center gap-2 text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 transition-colors">
            <Upload className="w-6 h-6" />
            <span className="text-sm">點擊或拖曳上傳圖片（PNG / JPG / WebP）</span>
            <span className="text-xs">單張最大 10MB</span>
          </div>
        </label>
      ) : mounted ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map((s) => s.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-3">
              {slides.map((slide, i) => (
                <SortableSlide key={slide.id} slide={slide} index={i} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className="relative rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/admin/slides/${slide.id}/thumb`} alt={`第 ${i + 1} 頁`} className="w-full h-full object-cover" />
              <div className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-zinc-300 px-1.5 py-0.5 rounded">{i + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
