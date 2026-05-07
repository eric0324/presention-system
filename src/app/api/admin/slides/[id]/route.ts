import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { deleteFromS3 } from "@/lib/s3"
import { emitBroadcast } from "@/lib/broadcast"
import { NextResponse } from "next/server"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const slide = await db.slide.findUnique({ where: { id } })
  if (!slide) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await deleteFromS3(slide.s3Key)
  await db.slide.delete({ where: { id } })

  // 重新排序同場次的其他 slides
  const remaining = await db.slide.findMany({
    where: { sessionId: slide.sessionId },
    orderBy: { order: "asc" },
  })
  await Promise.all(
    remaining.map((s, i) => db.slide.update({ where: { id: s.id }, data: { order: i } }))
  )

  emitBroadcast(slide.sessionId, { type: "slides_updated" })
  return new NextResponse(null, { status: 204 })
}
