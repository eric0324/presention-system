import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/PageHeader"
import { SessionEditForm } from "@/components/admin/SessionEditForm"

export default async function SessionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, venues] = await Promise.all([
    db.session.findUnique({
      where: { id },
      include: { slides: { orderBy: { order: "asc" } }, ads: { orderBy: { createdAt: "asc" } }, venue: true },
    }),
    db.venue.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
  ])
  if (!session) notFound()

  return (
    <div>
      <PageHeader title="編輯場次" description={session.title} />
      <SessionEditForm session={session} venues={venues} />
    </div>
  )
}
