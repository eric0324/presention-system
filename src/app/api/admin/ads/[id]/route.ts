import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const ad = await db.ad.findUnique({ where: { id } })
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.ad.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
