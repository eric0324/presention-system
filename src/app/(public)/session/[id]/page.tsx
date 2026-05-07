import { db } from "@/lib/db"
import { isSessionActive, getSessionStatus } from "@/lib/time"
import { notFound, redirect } from "next/navigation"
import { SlideViewer } from "./_components/SlideViewer"

export const dynamic = "force-dynamic"

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const now = new Date()

  const [session, allVenues] = await Promise.all([
    db.session.findUnique({
      where: { id },
      include: {
        slides: { orderBy: { order: "asc" } },
        ads: { orderBy: { createdAt: "asc" }, select: { id: true, linkUrl: true } },
        venue: { select: { id: true, name: true, accentColor: true } },
      },
    }),
    db.venue.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { sessions: { orderBy: { startAt: "asc" } } },
    }),
  ])

  if (!session) notFound()

  if (!isSessionActive(session.startAt, session.endAt)) {
    redirect("/")
  }

  const slideIds = session.slides.map((s: { id: string }) => s.id)

  type VenueWithSessions = typeof allVenues[number]
  type SessionItem = VenueWithSessions["sessions"][number]
  // 每個場地找出 active 或 next session 的 id（沒有就給 null，前台改連首頁）
  const venueSwitcher = allVenues.map((v: VenueWithSessions) => {
    const active = v.sessions.find((s: SessionItem) => getSessionStatus(s.startAt, s.endAt, now) === "active")
    const next = v.sessions.find((s: SessionItem) => getSessionStatus(s.startAt, s.endAt, now) === "not_started")
    const target = active ?? next ?? null
    return {
      id: v.id,
      name: v.name,
      accentColor: v.accentColor,
      targetSessionId: target?.id ?? null,
      sessionTitle: target?.title ?? null,
      sessionSpeaker: target?.speaker ?? null,
    }
  })

  return (
    <SlideViewer
      sessionId={session.id}
      slideIds={slideIds}
      title={session.title}
      speaker={session.speaker ?? undefined}
      venueName={session.venue.name}
      venueId={session.venue.id}
      accentColor={session.venue.accentColor}
      broadcastEnabled={session.broadcastEnabled}
      broadcastPage={session.broadcastPage}
      endAt={session.endAt.toISOString()}
      venueSwitcher={venueSwitcher}
      ads={session.ads}
    />
  )
}
