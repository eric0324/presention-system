import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const venueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c3aed"),
  order: z.number().int().default(0),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const venues = await db.venue.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json(venues)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = venueSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const venue = await db.venue.create({ data: parsed.data })
  return NextResponse.json(venue, { status: 201 })
}
