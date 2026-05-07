import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { VenueEditForm } from "@/components/admin/VenueEditForm"
import { PageHeader } from "@/components/admin/PageHeader"

export default async function VenueEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const venue = await db.venue.findUnique({ where: { id } })
  if (!venue) notFound()

  return (
    <div>
      <PageHeader title="編輯場地" description={venue.name} />
      <VenueEditForm venue={venue} />
    </div>
  )
}
