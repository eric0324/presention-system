import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { emitAnnouncement } from "@/lib/broadcast"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const announcement = await db.announcement.findFirst()
  return NextResponse.json(announcement ?? { content: "", enabled: false })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { content, enabled } = body as { content?: string; enabled?: boolean }

  const updated = await db.announcement.upsert({
    where: { id: "singleton" },
    update: {
      ...(content !== undefined && { content }),
      ...(enabled !== undefined && { enabled }),
    },
    create: {
      id: "singleton",
      content: content ?? "",
      enabled: enabled ?? false,
    },
  })

  emitAnnouncement({ content: updated.content, enabled: updated.enabled })

  return NextResponse.json(updated)
}
