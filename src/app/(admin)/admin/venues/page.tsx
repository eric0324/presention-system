import { db } from "@/lib/db"
import { PageHeader } from "@/components/admin/PageHeader"
import { VenueList } from "@/components/admin/VenueList"

export default async function VenuesPage() {
  const venues = await db.venue.findMany({ orderBy: { order: "asc" } })
  return (
    <div>
      <PageHeader title="場地管理" description="管理活動場地與其基本設定" />
      <VenueList initialVenues={venues} />
    </div>
  )
}
