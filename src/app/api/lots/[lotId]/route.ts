import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { LotUpdateSchema, UpsettingPriceSchema } from "@/lib/validations/lot"
import { LotStatus } from "@prisma/client"

export const GET = withAuth(async (_req, { params }) => {
  const lot = await prisma.lot.findUnique({
    where: { id: params.lotId },
    include: {
      seller: true,
      tastingRecords: {
        include: { taster: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
      auctionResult: { include: { buyer: true } },
      sampleDispatches: { orderBy: { createdAt: "desc" } },
    },
  })
  if (!lot) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(lot)
})

export const PUT = withAuth(
  async (req, { params }) => {
    const body = await req.json()
    const parsed = LotUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const lot = await prisma.lot.update({
      where: { id: params.lotId },
      data: parsed.data,
    })
    return NextResponse.json(lot)
  },
  "lot:edit"
)

export const PATCH = withAuth(async (req, { params }, session) => {
  const body = await req.json()

  // Allow status update (Admin/Senior) or upset price (SeniorTaster/Admin)
  if (body.upsettingPrice !== undefined) {
    const parsed = UpsettingPriceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const lot = await prisma.lot.update({
      where: { id: params.lotId },
      data: { upsettingPrice: parsed.data.upsettingPrice },
    })
    return NextResponse.json(lot)
  }

  if (body.lotStatus !== undefined) {
    const lot = await prisma.lot.update({
      where: { id: params.lotId },
      data: { lotStatus: body.lotStatus as LotStatus },
    })
    return NextResponse.json(lot)
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
})
