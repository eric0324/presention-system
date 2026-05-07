import { db } from "@/lib/db"
import { getSessionStatus } from "@/lib/time"
import { VenueCard } from "@/components/public/VenueCard"
import { HeroSection } from "@/components/public/HeroSection"
import { AnnouncementBanner } from "@/components/AnnouncementBanner"

export const revalidate = 30

export default async function HomePage() {
  const venues = await db.venue.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      sessions: {
        orderBy: { startAt: "asc" },
      },
    },
  })

  const now = new Date()

  const venuesWithStatus = venues.map((venue) => {
    const active = venue.sessions.find(
      (s) => getSessionStatus(s.startAt, s.endAt, now) === "active"
    )
    const next = venue.sessions.find(
      (s) => getSessionStatus(s.startAt, s.endAt, now) === "not_started"
    )
    return { ...venue, activeSession: active ?? null, nextSession: next ?? null, sessionCount: venue.sessions.length }
  })

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <AnnouncementBanner />
      <HeroSection />

      {/* 場地列表 */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="mb-10 text-center">
        </div>

        {venuesWithStatus.length === 0 ? (
          <div className="text-center text-zinc-500 py-20">目前無開放場地</div>
        ) : (
          <div className="flex flex-col gap-3">
            {venuesWithStatus.map((venue, i) => (
              <VenueCard key={venue.id} venue={venue} index={i} now={now.toISOString()} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
