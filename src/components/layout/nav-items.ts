import { Permission } from "@/lib/rbac"

export type NavItem = {
  href: string
  label: string
  permission: Permission
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", permission: "dashboard:view", icon: "BarChart2" },
  { href: "/lots", label: "Lots", permission: "lot:view", icon: "Package" },
  { href: "/tasting", label: "Tasting Queue", permission: "tasting:create", icon: "FlaskConical" },
  { href: "/auction", label: "Auction", permission: "auction:enter", icon: "Gavel" },
  { href: "/reports/seller", label: "Reports", permission: "report:view", icon: "FileText" },
  { href: "/admin", label: "Admin", permission: "admin:all", icon: "Settings" },
]
