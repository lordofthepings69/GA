import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatLKR } from "@/lib/utils"
import { format } from "date-fns"

export default async function AuctionResultsPage() {
  const results = await prisma.auctionResult.findMany({
    include: {
      lot: { select: { catalogueNumber: true, estateName: true, grade: true, elevation: true } },
      buyer: { select: { companyName: true } },
    },
    orderBy: { dateRecorded: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Auction Results</h1>
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Lot</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Estate</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Grade</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Hammer Price</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Buyer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Result</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {results.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/lots/${r.lotId}`} className="font-mono text-emerald-700 hover:underline">
                    {r.lot.catalogueNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{r.lot.estateName}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">{r.lot.grade}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold">
                  {r.hammerPrice ? formatLKR(Number(r.hammerPrice)) + "/kg" : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{r.buyer?.companyName ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      r.resultStatus === "Sold"
                        ? ("success" as any)
                        : r.resultStatus === "Passed"
                        ? ("warning" as any)
                        : "secondary"
                    }
                  >
                    {r.resultStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {format(new Date(r.dateRecorded), "dd MMM yyyy")}
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No auction results recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
