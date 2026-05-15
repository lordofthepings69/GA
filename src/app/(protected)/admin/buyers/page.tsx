import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/rbac"

export default async function BuyersPage() {
  const session = await auth()
  if (!hasPermission(session!.user.role, "admin:all")) redirect("/dashboard")

  const buyers = await prisma.buyer.findMany({ orderBy: { companyName: "asc" } })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Buyers</h1>
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Code</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Company</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {buyers.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{b.buyerCode}</td>
                <td className="px-4 py-3 font-medium">{b.companyName}</td>
                <td className="px-4 py-3 text-gray-600">{b.contactName ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{b.email ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
