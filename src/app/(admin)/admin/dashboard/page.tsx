import { db } from "@/lib/db"
import { getSessionStatus } from "@/lib/time"
import { MapPin, CalendarDays, PlayCircle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const [venueCount, sessionCount, allSessions] = await Promise.all([
    db.venue.count({ where: { isActive: true } }),
    db.session.count(),
    db.session.findMany({
      where: {
        startAt: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        endAt: { gte: new Date() },
      },
      include: { venue: { select: { name: true } } },
      orderBy: { startAt: "asc" },
      take: 10,
    }),
  ])

  const now = new Date()
  const active = allSessions.filter(
    (s) => getSessionStatus(s.startAt, s.endAt, now) === "active"
  )
  const upcoming = allSessions.filter(
    (s) => getSessionStatus(s.startAt, s.endAt, now) === "not_started"
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">總覽</h1>
        <p className="text-sm text-zinc-500 mt-1">活動系統即時狀態</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "啟用場地", value: venueCount, icon: MapPin, color: "violet" },
          { label: "場次總數", value: sessionCount, icon: CalendarDays, color: "blue" },
          { label: "進行中", value: active.length, icon: PlayCircle, color: "green" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg mb-3 ${
              color === "violet" ? "bg-violet-50 text-violet-600" :
              color === "blue" ? "bg-blue-50 text-blue-600" :
              "bg-green-50 text-green-600"
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-3xl font-semibold text-zinc-900">{value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-900">今日 / 即將場次</h2>
          <Link href="/admin/sessions" className="text-xs text-violet-600 hover:text-violet-700">
            查看全部 →
          </Link>
        </div>
        {allSessions.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-zinc-400">今日無場次</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {[...active, ...upcoming].map((s) => {
              const status = getSessionStatus(s.startAt, s.endAt, now)
              return (
                <div key={s.id} className="px-5 py-3.5 flex items-center gap-4">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    status === "active" ? "bg-green-500" : "bg-zinc-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-800 truncate">{s.title}</div>
                    <div className="text-xs text-zinc-400">{s.venue.name}</div>
                  </div>
                  <div className="text-xs text-zinc-400 shrink-0">
                    {s.startAt.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
                    {" – "}
                    {s.endAt.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {status === "active" && (
                    <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded-full">
                      進行中
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
