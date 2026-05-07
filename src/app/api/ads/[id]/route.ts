import { db } from "@/lib/db"
import { presignS3Url } from "@/lib/s3"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ad = await db.ad.findUnique({ where: { id } })
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const url = await presignS3Url(ad.s3Key, 60)
  return NextResponse.redirect(url, { status: 302 })
}
