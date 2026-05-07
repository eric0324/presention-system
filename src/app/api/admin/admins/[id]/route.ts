import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const total = await db.user.count()
  if (total <= 1) {
    return NextResponse.json({ error: "無法刪除最後一個管理員" }, { status: 409 })
  }

  await db.user.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
