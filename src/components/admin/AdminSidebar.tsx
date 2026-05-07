"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  Users,
  LogOut,
  Megaphone,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", label: "總覽", icon: LayoutDashboard },
  { href: "/admin/venues", label: "場地管理", icon: MapPin },
  { href: "/admin/sessions", label: "場次管理", icon: CalendarDays },
  { href: "/admin/announcement", label: "全站公告", icon: Megaphone },
  { href: "/admin/admins", label: "管理員", icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen bg-white border-r border-zinc-200 sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 text-xs">
            ⬡
          </div>
          <span className="font-semibold text-sm text-zinc-800">簡報後台</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-violet-50 text-violet-700 font-medium"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-zinc-200">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-500 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          登出
        </button>
      </div>
    </aside>
  )
}
