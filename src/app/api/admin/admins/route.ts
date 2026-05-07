import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admins = await db.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(admins)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) return NextResponse.json({ error: "此 Email 已存在" }, { status: 409 })

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  const admin = await db.user.create({
    data: { email: parsed.data.email, name: parsed.data.name, passwordHash },
    select: { id: true, email: true, name: true, createdAt: true },
  })
  return NextResponse.json(admin, { status: 201 })
}
