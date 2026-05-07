import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { deleteFromS3 } from "@/lib/s3"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
  venueId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  speaker: z.string().optional(),
  startAt: z.string().min(1).optional(),
  endAt: z.string().min(1).optional(),
}).refine(
  (d) => !d.startAt || !d.endAt || new Date(d.startAt) < new Date(d.endAt),
  { message: "開始時間必須早於結束時間", path: ["endAt"] }
)

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const item = await db.session.findUnique({
    where: { id },
    include: { venue: true, slides: { orderBy: { order: "asc" } } },
  })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { startAt, endAt, ...rest } = parsed.data
  const item = await db.session.update({
    where: { id },
    data: {
      ...rest,
      ...(startAt ? { startAt: new Date(startAt) } : {}),
      ...(endAt ? { endAt: new Date(endAt) } : {}),
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const slides = await db.slide.findMany({ where: { sessionId: id } })

  // 同步刪除 S3 圖片
  await Promise.all(slides.map((s) => deleteFromS3(s.s3Key)))

  await db.session.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
