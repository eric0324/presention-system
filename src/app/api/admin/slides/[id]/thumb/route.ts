import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { presignS3Url } from "@/lib/s3"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const slide = await db.slide.findUnique({ where: { id } })
  if (!slide) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const signedUrl = await presignS3Url(slide.s3Key, 300)
  return NextResponse.redirect(signedUrl, { status: 302 })
}
