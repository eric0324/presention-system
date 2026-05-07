import { db } from "@/lib/db"
import { getSessionStatus } from "@/lib/time"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await db.session.findUnique({
    where: { id },
    select: { startAt: true, endAt: true },
  })
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const status = getSessionStatus(session.startAt, session.endAt)
  return NextResponse.json({ status, now: new Date().toISOString() })
}
