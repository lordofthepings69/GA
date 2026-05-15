import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatLKR } from "@/lib/utils"
import { format } from "date-fns"

export default async function TastingQueuePage() {
  const session = await auth()

  const records = await prisma.tastingRecord.findMany({
    where: { status: "Submitted" },
    include: {
      lot: { select: { catalogueNumber: true, estateName: true, grade: true, elevation: true } },
      taster: { select: { name: true } },
    },
    orderBy: { dateTasted: "asc" },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Tasting Approval Queue</h1>
      <p className="text-sm text-gray-500">{records.length} records awaiting approval</p>

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Lot</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Estate</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Grade</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Taster</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Recommended</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-emerald-700">
                  <Link href={`/lots/${r.lotId}`} className="hover:underline">
                    {r.lot.catalogueNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{r.lot.estateName}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                    {r.lot.grade}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.taster.name}</td>
                <td className="px-4 py-3 font-medium text-emerald-700">
                  {r.priceRecommendation ? formatLKR(Number(r.priceRecommendation)) + "/kg" : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {format(new Date(r.dateTasted), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/tasting/${r.id}`}>
                    <Button size="sm" variant="outline">Review</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No records awaiting approval.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
