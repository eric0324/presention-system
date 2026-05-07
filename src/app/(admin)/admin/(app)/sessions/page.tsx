import { db } from "@/lib/db"
import { PageHeader } from "@/components/admin/PageHeader"
import { SessionList } from "@/components/admin/SessionList"

export default async function SessionsPage() {
  const [sessions, venues] = await Promise.all([
    db.session.findMany({
      include: { venue: { select: { id: true, name: true, accentColor: true } } },
      orderBy: { startAt: "asc" },
    }),
    db.venue.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ])

  return (
    <div>
      <PageHeader title="場次管理" description="管理各場地的簡報場次" />
      <SessionList initialSessions={sessions} venues={venues} />
    </div>
  )
}
