import { SellerReportView } from "@/components/reports/SellerReportView"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { pctDiff } from "@/lib/utils"

export default async function SellerReportPage({
  params,
  searchParams,
}: {
  params: { sellerId: string }
  searchParams: { saleNumber?: string }
}) {
  const saleNumber = searchParams.saleNumber

  const seller = await prisma.seller.findUnique({
    where: { id: params.sellerId },
    include: {
      lots: {
        where: saleNumber ? { saleNumber } : {},
        include: {
          tastingRecords: {
            where: { status: { in: ["Approved", "Overridden"] } },
            orderBy: { approvedAt: "desc" },
            take: 1,
          },
          auctionResult: { include: { buyer: { select: { companyName: true } } } },
        },
        orderBy: [{ grade: "asc" }, { catalogueNumber: "asc" }],
      },
    },
  })

  if (!seller) notFound()

  // Per-grade market averages
  const distinctGrades = Array.from(new Set(seller.lots.map((l) => l.grade)))
  const gradeAvgRows =
    distinctGrades.length && saleNumber
      ? await prisma.$queryRaw<{ grade: string; avg_hammer: number }[]>`
          SELECT l.grade, AVG(ar.hammer_price)::float AS avg_hammer
          FROM auction_results ar
          JOIN lots l ON ar.lot_id = l.id
          WHERE ar.result_status = 'Sold'
            AND ar.sale_number = ${saleNumber}
            AND l.grade = ANY(${distinctGrades}::text[])
          GROUP BY l.grade
        `
      : distinctGrades.length
      ? await prisma.$queryRaw<{ grade: string; avg_hammer: number }[]>`
          SELECT l.grade, AVG(ar.hammer_price)::float AS avg_hammer
          FROM auction_results ar
          JOIN lots l ON ar.lot_id = l.id
          WHERE ar.result_status = 'Sold'
            AND l.grade = ANY(${distinctGrades}::text[])
          GROUP BY l.grade
        `
      : []

  const gradeAverages: Record<string, number> = {}
  for (const row of gradeAvgRows) gradeAverages[row.grade] = row.avg_hammer

  const lots = seller.lots.map((lot) => {
    const hammer = lot.auctionResult?.hammerPrice ? Number(lot.auctionResult.hammerPrice) : null
    const upset = lot.upsettingPrice ? Number(lot.upsettingPrice) : null
    const marketAvg = gradeAverages[lot.grade] ?? null
    const rec = lot.tastingRecords[0]?.priceRecommendation
      ? Number(lot.tastingRecords[0].priceRecommendation)
      : null
    return {
      catalogueNumber: lot.catalogueNumber,
      grade: lot.grade,
      elevation: lot.elevation,
      netWeight: Number(lot.netWeight),
      upsettingPrice: upset,
      hammerPrice: hammer,
      resultStatus: lot.auctionResult?.resultStatus ?? null,
      buyerName: lot.auctionResult?.buyer?.companyName ?? null,
      totalValue: hammer && lot.netWeight ? hammer * Number(lot.netWeight) : null,
      vsUpsetting: hammer && upset ? pctDiff(hammer, upset) : null,
      vsMarketAvg: hammer && marketAvg ? pctDiff(hammer, marketAvg) : null,
      tasterRecommendation: rec,
    }
  })

  const soldLots = lots.filter((l) => l.resultStatus === "Sold")
  const hammerPrices = soldLots.map((l) => l.hammerPrice).filter(Boolean) as number[]

  const reportData = {
    seller: {
      sellerCode: seller.sellerCode,
      companyName: seller.companyName,
      contactName: seller.contactName,
    },
    saleNumber: saleNumber ?? "All Sales",
    generatedAt: new Date(),
    lots,
    gradeAverages,
    summary: {
      totalLots: lots.length,
      soldLots: soldLots.length,
      totalNetWeight: lots.reduce((s, l) => s + l.netWeight, 0),
      totalValue: soldLots.reduce((s, l) => s + (l.totalValue ?? 0), 0),
      avgHammerPrice: hammerPrices.length
        ? hammerPrices.reduce((a, b) => a + b, 0) / hammerPrices.length
        : null,
      avgUpsettingPrice:
        lots.filter((l) => l.upsettingPrice).length
          ? lots.reduce((s, l) => s + (l.upsettingPrice ?? 0), 0) /
            lots.filter((l) => l.upsettingPrice).length
          : null,
    },
  }

  return <SellerReportView data={reportData} />
}
