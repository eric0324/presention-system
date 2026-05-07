import { db } from "@/lib/db"
import { PageHeader } from "@/components/admin/PageHeader"
import { AnnouncementForm } from "@/components/admin/AnnouncementForm"

export default async function AnnouncementPage() {
  const announcement = await db.announcement.findFirst()

  return (
    <div>
      <PageHeader title="全站公告" description="設定顯示在所有頁面頂部的跑馬燈公告" />
      <div className="max-w-2xl">
        <AnnouncementForm
          initialContent={announcement?.content ?? ""}
          initialEnabled={announcement?.enabled ?? false}
        />
      </div>
    </div>
  )
}
