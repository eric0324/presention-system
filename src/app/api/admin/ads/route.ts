import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { uploadToS3 } from "@/lib/s3"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"]

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const sessionId = formData.get("sessionId") as string
  const linkUrl = formData.get("linkUrl") as string
  const file = formData.get("file") as File | null

  if (!sessionId) return NextResponse.json({ error: "sessionId 必填" }, { status: 400 })
  if (!linkUrl) return NextResponse.json({ error: "linkUrl 必填" }, { status: 400 })
  if (!file) return NextResponse.json({ error: "file 必填" }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `不支援的格式：${file.type}` }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: `${file.name} 超過 10MB 限制` }, { status: 400 })
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const s3Key = `ads/${sessionId}/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await uploadToS3(s3Key, buffer, file.type)

  const ad = await db.ad.create({
    data: { sessionId, s3Key, linkUrl },
  })

  return NextResponse.json(ad, { status: 201 })
}
