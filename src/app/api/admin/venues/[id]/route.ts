import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const venue = await db.venue.findUnique({ where: { id }, include: { sessions: { orderBy: { startAt: "asc" } } } })
  if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(venue)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const venue = await db.venue.update({ where: { id }, data: parsed.data })
  return NextResponse.json(venue)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const sessionCount = await db.session.count({ where: { venueId: id } })
  if (sessionCount > 0) {
    return NextResponse.json({ error: "此場地有場次，無法刪除，請先將場地停用" }, { status: 409 })
  }

  await db.venue.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
