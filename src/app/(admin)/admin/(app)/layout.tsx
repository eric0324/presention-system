import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
