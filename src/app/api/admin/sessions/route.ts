import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const sessionSchema = z.object({
  venueId: z.string().min(1),
  title: z.string().min(1),
  speaker: z.string().optional(),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
}).refine((d) => new Date(d.startAt) < new Date(d.endAt), {
  message: "開始時間必須早於結束時間",
  path: ["endAt"],
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const venueId = searchParams.get("venueId")

  const sessions = await db.session.findMany({
    where: venueId ? { venueId } : undefined,
    include: { venue: { select: { id: true, name: true } }, slides: { orderBy: { order: "asc" } } },
    orderBy: { startAt: "asc" },
  })
  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = sessionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { startAt, endAt, ...rest } = parsed.data
  const created = await db.session.create({
    data: { ...rest, startAt: new Date(startAt), endAt: new Date(endAt) },
  })
  return NextResponse.json(created, { status: 201 })
}
