import { prisma } from "@/lib/prisma"
import { SellerReportControls } from "@/components/reports/SellerReportControls"

export default async function SellerReportSelectorPage() {
  const sellers = await prisma.seller.findMany({ orderBy: { companyName: "asc" } })

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Seller Reports</h1>
      <SellerReportControls sellers={sellers} />
    </div>
  )
}
