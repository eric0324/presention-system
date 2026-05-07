import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { emitBroadcast } from "@/lib/broadcast"
import { NextResponse } from "next/server"
import { z } from "zod"

const broadcastSchema = z.object({
  enabled: z.boolean().optional(),
  page: z.number().int().min(0).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = broadcastSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { enabled, page } = parsed.data

  const updated = await db.session.update({
    where: { id },
    data: {
      ...(enabled !== undefined ? { broadcastEnabled: enabled } : {}),
      ...(page !== undefined ? { broadcastPage: page } : {}),
    },
  })

  // 廣播到所有連線的觀看者
  if (enabled === false) {
    emitBroadcast(id, { type: "broadcast_off" })
  } else if (enabled === true) {
    emitBroadcast(id, { type: "broadcast_on", page: updated.broadcastPage })
  } else if (page !== undefined) {
    emitBroadcast(id, { type: "page", page })
  }

  return NextResponse.json(updated)
}
