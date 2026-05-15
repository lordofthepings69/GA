import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/rbac"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, ShoppingBag } from "lucide-react"

export default async function AdminPage() {
  const session = await auth()
  if (!hasPermission(session!.user.role, "admin:all")) redirect("/dashboard")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
      <div className="grid grid-cols-3 gap-4">
        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />Users</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-500">Manage user accounts and roles</CardContent>
          </Card>
        </Link>
        <Link href="/admin/sellers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building className="h-4 w-4" />Sellers</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-500">Manage estate / planter accounts</CardContent>
          </Card>
        </Link>
        <Link href="/admin/buyers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ShoppingBag className="h-4 w-4" />Buyers</CardTitle></CardHeader>
            <CardContent className="text-sm text-gray-500">Manage manufacturer / exporter accounts</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
