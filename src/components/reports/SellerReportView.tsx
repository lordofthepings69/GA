"use client"

import { Button } from "@/components/ui/button"
import { formatLKR } from "@/lib/utils"
import { format } from "date-fns"
import { Printer } from "lucide-react"

interface LotRow {
  catalogueNumber: string
  grade: string
  elevation: string
  netWeight: number
  upsettingPrice: number | null
  hammerPrice: number | null
  resultStatus: string | null
  buyerName: string | null
  totalValue: number | null
  vsUpsetting: number | null
  vsMarketAvg: number | null
  tasterRecommendation: number | null
}

interface ReportData {
  seller: { sellerCode: string; companyName: string; contactName?: string | null }
  saleNumber: string
  generatedAt: Date
  lots: LotRow[]
  gradeAverages: Record<string, number>
  summary: {
    totalLots: number
    soldLots: number
    totalNetWeight: number
    totalValue: number
    avgHammerPrice: number | null
    avgUpsettingPrice: number | null
  }
}

function pctDisplay(v: number | null) {
  if (v == null) return "—"
  const cls = v >= 0 ? "text-green-700" : "text-red-600"
  return <span className={cls}>{v >= 0 ? "+" : ""}{v.toFixed(1)}%</span>
}

export function SellerReportView({ data }: { data: ReportData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between no-print">
        <h1 className="text-2xl font-bold">Seller Report</h1>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <div id="seller-report-print-target" className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Seller</p>
              <p className="font-bold text-lg">{data.seller.companyName}</p>
              <p className="text-gray-600">Code: {data.seller.sellerCode}</p>
              {data.seller.contactName && <p className="text-gray-600">{data.seller.contactName}</p>}
            </div>
            <div className="text-right">
              <p className="text-gray-500">Sale Number</p>
              <p className="font-bold text-lg">{data.saleNumber}</p>
              <p className="text-gray-500 text-xs">
                Generated: {format(new Date(data.generatedAt), "dd MMM yyyy HH:mm")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Lot</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Grade</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Elev.</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Net Wt (kg)</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Upset</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Hammer</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">vs Upset</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">vs Market</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.lots.map((lot) => (
                <tr
                  key={lot.catalogueNumber}
                  className={
                    lot.hammerPrice && lot.upsettingPrice
                      ? lot.hammerPrice >= lot.upsettingPrice
                        ? "bg-green-50"
                        : "bg-red-50"
                      : ""
                  }
                >
                  <td className="px-3 py-2 font-mono text-xs">{lot.catalogueNumber}</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-gray-100 px-1 text-xs font-mono">{lot.grade}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{lot.elevation}</td>
                  <td className="px-3 py-2 text-right font-mono">{lot.netWeight.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {lot.upsettingPrice ? formatLKR(lot.upsettingPrice) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold">
                    {lot.hammerPrice ? formatLKR(lot.hammerPrice) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">{pctDisplay(lot.vsUpsetting)}</td>
                  <td className="px-3 py-2 text-right">{pctDisplay(lot.vsMarketAvg)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        lot.resultStatus === "Sold"
                          ? "bg-green-100 text-green-800"
                          : lot.resultStatus === "Passed"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {lot.resultStatus ?? "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 bg-gray-50 font-medium">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-gray-600">
                  Summary ({data.summary.soldLots}/{data.summary.totalLots} sold)
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  {data.summary.totalNetWeight.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  {formatLKR(data.summary.avgUpsettingPrice)}
                </td>
                <td className="px-3 py-2 text-right font-bold">
                  {formatLKR(data.summary.avgHammerPrice)}
                </td>
                <td colSpan={3} className="px-3 py-2 text-right text-gray-600">
                  Total Value: {formatLKR(data.summary.totalValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {Object.keys(data.gradeAverages).length > 0 && (
          <div className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-semibold mb-2">Grade Market Averages (this sale)</h3>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(data.gradeAverages).map(([grade, avg]) => (
                <div key={grade} className="rounded bg-gray-50 px-3 py-1.5 text-sm">
                  <span className="font-mono font-bold">{grade}</span>
                  <span className="ml-2 text-gray-600">{formatLKR(avg)}/kg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
