"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart2,
  Package,
  FlaskConical,
  Gavel,
  FileText,
  Settings,
  Leaf,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { hasPermission, Permission } from "@/lib/rbac"
import { UserRole } from "@prisma/client"
import { NAV_ITEMS } from "./nav-items"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart2,
  Package,
  FlaskConical,
  Gavel,
  FileText,
  Settings,
}

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Leaf className="h-6 w-6 text-emerald-600" />
        <span className="font-semibold text-gray-900">Tea Valuation</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.filter((item) => hasPermission(role, item.permission as Permission)).map(
          (item) => {
            const Icon = ICONS[item.icon] ?? Package
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          }
        )}
      </nav>
    </aside>
  )
}
