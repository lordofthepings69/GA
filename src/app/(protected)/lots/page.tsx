import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"
import { Button } from "@/components/ui/button"
import { LotStatusBadge } from "@/components/lots/LotStatusBadge"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { Grade, LotStatus, Region } from "@prisma/client"

export default async function LotsPage({
  searchParams,
}: {
  searchParams: { status?: string; grade?: string; region?: string; q?: string; page?: string }
}) {
  const session = await auth()
  const canCreate = hasPermission(session!.user.role, "lot:create")

  const page = parseInt(searchParams.page ?? "1")
  const limit = 50

  const where = {
    ...(searchParams.status ? { lotStatus: searchParams.status as LotStatus } : {}),
    ...(searchParams.grade ? { grade: searchParams.grade as Grade } : {}),
    ...(searchParams.region ? { region: searchParams.region as Region } : {}),
    ...(searchParams.q
      ? {
          OR: [
            { estateName: { contains: searchParams.q, mode: "insensitive" as const } },
            { catalogueNumber: { contains: searchParams.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [lots, total] = await Promise.all([
    prisma.lot.findMany({
      where,
      include: { seller: { select: { companyName: true, sellerCode: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lot.count({ where }),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lots</h1>
        {canCreate && (
          <Link href="/lots/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Register Lot
            </Button>
          </Link>
        )}
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Catalogue No.</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Estate</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Grade</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Region</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Elevation</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Net Wt (kg)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Sale Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lots.map((lot) => (
              <tr key={lot.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/lots/${lot.id}`}
                    className="font-mono text-emerald-700 hover:underline"
                  >
                    {lot.catalogueNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium">{lot.estateName}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                    {lot.grade}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{lot.region}</td>
                <td className="px-4 py-3 text-gray-600">{lot.elevation}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {Number(lot.netWeight).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {format(new Date(lot.saleDate), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3">
                  <LotStatusBadge status={lot.lotStatus} />
                </td>
              </tr>
            ))}
            {lots.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No lots found. Register the first lot to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">
        Showing {lots.length} of {total} lots
      </p>
    </div>
  )
}
