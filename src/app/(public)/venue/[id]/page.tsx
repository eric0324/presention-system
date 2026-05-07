import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { getSessionStatus } from "@/lib/time"
import { SessionRow } from "@/components/public/SessionRow"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const revalidate = 30

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const venue = await db.venue.findUnique({
    where: { id, isActive: true },
    include: { sessions: { orderBy: { startAt: "asc" }, include: { slides: { select: { id: true }, take: 1 } } } },
  })
  if (!venue) notFound()

  const now = new Date()

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 頂部導航 */}
      <div className="border-b border-white/10 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: venue.accentColor }} />
            <h1 className="font-semibold text-white">{venue.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-8">場次議程</p>

        {venue.sessions.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-sm">此場地尚無排定場次</div>
        ) : (
          <div className="space-y-3">
            {venue.sessions.map((session) => {
              const status = getSessionStatus(session.startAt, session.endAt, now)
              const hasSlides = session.slides.length > 0
              return (
                <SessionRow
                  key={session.id}
                  session={session}
                  status={status}
                  hasSlides={hasSlides}
                  now={now.toISOString()}
                  accentColor={venue.accentColor}
                />
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
