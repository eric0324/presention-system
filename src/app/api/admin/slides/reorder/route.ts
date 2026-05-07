import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { emitBroadcast } from "@/lib/broadcast"
import { NextResponse } from "next/server"
import { z } from "zod"

const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { ids } = parsed.data

  const [firstSlide] = await Promise.all(
    ids.map((id, index) =>
      db.slide.update({ where: { id }, data: { order: index } })
    )
  )

  emitBroadcast(firstSlide.sessionId, { type: "slides_updated" })
  return NextResponse.json({ ok: true })
}
