import { db } from "@/lib/db"
import { PageHeader } from "@/components/admin/PageHeader"
import { AdminList } from "@/components/admin/AdminList"

export default async function AdminsPage() {
  const admins = await db.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })
  return (
    <div>
      <PageHeader title="管理員" description="管理後台帳號" />
      <AdminList initialAdmins={admins} />
    </div>
  )
}
