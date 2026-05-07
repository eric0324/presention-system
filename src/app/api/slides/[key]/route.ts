import { db } from "@/lib/db"
import { signCloudfrontUrl } from "@/lib/cloudfront"
import { isSessionActive } from "@/lib/time"
import { NextResponse } from "next/server"

// [key] 為 slide id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key: slideId } = await params

  const slide = await db.slide.findUnique({
    where: { id: slideId },
    include: { session: { select: { startAt: true, endAt: true } } },
  })

  if (!slide) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (!isSessionActive(slide.session.startAt, slide.session.endAt)) {
    return NextResponse.json({ error: "場次不在進行中" }, { status: 403 })
  }

  const signedUrl = signCloudfrontUrl(slide.s3Key, 60)
  return NextResponse.redirect(signedUrl, { status: 302 })
}
