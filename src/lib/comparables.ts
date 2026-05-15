import { subWeeks } from "date-fns"
import { Grade, Elevation, ResultStatus, TastingStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type ComparableDataPoint = {
  source: "auction" | "recommendation"
  date: Date
  price: number
  catalogueNumber: string
  saleNumber: string
  grade: Grade
  elevation: Elevation
  netWeight: number
  buyerName?: string
  resultStatus?: ResultStatus
  tasterName?: string
  tastingStatus?: TastingStatus
}

function avg(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export async function getHistoricalComparables(
  estateName: string,
  grade: Grade,
  weeksBack: number = 6
): Promise<{
  dataPoints: ComparableDataPoint[]
  stats: {
    avgAuctionPrice: number | null
    avgRecommendedPrice: number | null
    minPrice: number | null
    maxPrice: number | null
    sampleCount: number
  }
}> {
  const cutoffDate = subWeeks(new Date(), weeksBack)

  const [auctionResults, tastingRecs] = await Promise.all([
    prisma.auctionResult.findMany({
      where: {
        resultStatus: "Sold",
        dateRecorded: { gte: cutoffDate },
        lot: {
          estateName: { equals: estateName, mode: "insensitive" },
          grade,
        },
      },
      include: {
        lot: {
          select: {
            catalogueNumber: true,
            saleNumber: true,
            grade: true,
            elevation: true,
            netWeight: true,
          },
        },
        buyer: { select: { companyName: true } },
      },
      orderBy: { dateRecorded: "desc" },
    }),
    prisma.tastingRecord.findMany({
      where: {
        status: { in: ["Submitted", "Approved"] },
        dateTasted: { gte: cutoffDate },
        priceRecommendation: { not: null },
        lot: {
          estateName: { equals: estateName, mode: "insensitive" },
          grade,
        },
      },
      include: {
        lot: {
          select: {
            catalogueNumber: true,
            saleNumber: true,
            grade: true,
            elevation: true,
            netWeight: true,
          },
        },
        taster: { select: { name: true } },
      },
      orderBy: { dateTasted: "desc" },
    }),
  ])

  const dataPoints: ComparableDataPoint[] = [
    ...auctionResults.map((r) => ({
      source: "auction" as const,
      date: r.dateRecorded,
      price: Number(r.hammerPrice),
      catalogueNumber: r.lot.catalogueNumber,
      saleNumber: r.saleNumber,
      grade: r.lot.grade,
      elevation: r.lot.elevation,
      netWeight: Number(r.lot.netWeight),
      buyerName: r.buyer?.companyName,
      resultStatus: r.resultStatus,
    })),
    ...tastingRecs.map((t) => ({
      source: "recommendation" as const,
      date: t.dateTasted,
      price: Number(t.priceRecommendation),
      catalogueNumber: t.lot.catalogueNumber,
      saleNumber: t.lot.saleNumber,
      grade: t.lot.grade,
      elevation: t.lot.elevation,
      netWeight: Number(t.lot.netWeight),
      tasterName: t.taster.name,
      tastingStatus: t.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const auctionPrices = auctionResults.map((r) => Number(r.hammerPrice)).filter(Boolean)
  const recPrices = tastingRecs.map((t) => Number(t.priceRecommendation)).filter(Boolean)
  const allPrices = [...auctionPrices, ...recPrices]

  return {
    dataPoints,
    stats: {
      avgAuctionPrice: auctionPrices.length ? avg(auctionPrices) : null,
      avgRecommendedPrice: recPrices.length ? avg(recPrices) : null,
      minPrice: allPrices.length ? Math.min(...allPrices) : null,
      maxPrice: allPrices.length ? Math.max(...allPrices) : null,
      sampleCount: dataPoints.length,
    },
  }
}
