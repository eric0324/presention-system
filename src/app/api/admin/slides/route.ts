import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { uploadToS3 } from "@/lib/s3"
import { emitBroadcast } from "@/lib/broadcast"
import { createSlidesInOrder } from "@/lib/slideOrdering"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"]

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const sessionId = formData.get("sessionId") as string
  const files = formData.getAll("files") as File[]

  if (!sessionId) return NextResponse.json({ error: "sessionId 必填" }, { status: 400 })
  if (!files.length) return NextResponse.json({ error: "至少需要一張圖片" }, { status: 400 })

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `不支援的格式：${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `${file.name} 超過 10MB 限制` }, { status: 400 })
    }
  }

  const existing = await db.slide.findMany({ where: { sessionId }, orderBy: { order: "asc" } })

  // order 依選檔順序（陣列索引）決定，不可依上傳完成時序，否則重整後順序會亂掉
  const created = await createSlidesInOrder(files, existing.length, async (file, order) => {
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
    const s3Key = `slides/${sessionId}/${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await uploadToS3(s3Key, buffer, file.type)
    return db.slide.create({
      data: { sessionId, s3Key, order },
    })
  })

  emitBroadcast(sessionId, { type: "slides_updated" })
  return NextResponse.json(created, { status: 201 })
}
