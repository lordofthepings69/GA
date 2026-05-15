import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { pctDiff } from "@/lib/utils"

export const GET = withAuth(
  async (req, { params }) => {
    const { searchParams } = new URL(req.url)
    const saleNumber = searchParams.get("saleNumber")

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

    if (!seller) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Per-grade market averages via raw query
    const distinctGrades = Array.from(new Set(seller.lots.map((l) => l.grade)))
    const gradeAvgRows = distinctGrades.length
      ? await prisma.$queryRaw<{ grade: string; avg_hammer: number }[]>`
          SELECT l.grade, AVG(ar.hammer_price)::float AS avg_hammer
          FROM auction_results ar
          JOIN lots l ON ar.lot_id = l.id
          WHERE ar.sale_number = ${saleNumber ?? ""}
            AND ar.result_status = 'Sold'
            AND l.grade = ANY(${distinctGrades}::text[])
          GROUP BY l.grade
        `
      : []

    const gradeAverages: Record<string, number> = {}
    for (const row of gradeAvgRows) {
      gradeAverages[row.grade] = row.avg_hammer
    }

    const lots = seller.lots.map((lot) => {
      const hammer = lot.auctionResult?.hammerPrice
        ? Number(lot.auctionResult.hammerPrice)
        : null
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
    const totalValue = soldLots.reduce((s, l) => s + (l.totalValue ?? 0), 0)
    const hammerPrices = soldLots.map((l) => l.hammerPrice).filter(Boolean) as number[]

    return NextResponse.json({
      seller: {
        sellerCode: seller.sellerCode,
        companyName: seller.companyName,
        contactName: seller.contactName,
      },
      saleNumber: saleNumber ?? "All",
      generatedAt: new Date(),
      lots,
      gradeAverages,
      summary: {
        totalLots: lots.length,
        soldLots: soldLots.length,
        totalNetWeight: lots.reduce((s, l) => s + l.netWeight, 0),
        totalValue,
        avgHammerPrice:
          hammerPrices.length
            ? hammerPrices.reduce((a, b) => a + b, 0) / hammerPrices.length
            : null,
        avgUpsettingPrice:
          lots.filter((l) => l.upsettingPrice).length
            ? lots.reduce((s, l) => s + (l.upsettingPrice ?? 0), 0) /
              lots.filter((l) => l.upsettingPrice).length
            : null,
      },
    })
  },
  "report:view"
)
