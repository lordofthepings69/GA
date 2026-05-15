import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { AuctionResultSchema } from "@/lib/validations/auction"

export const GET = withAuth(async (_req, { params }) => {
  const result = await prisma.auctionResult.findUnique({
    where: { lotId: params.lotId },
    include: { buyer: true },
  })
  if (!result) return NextResponse.json(null)
  return NextResponse.json(result)
})

export const POST = withAuth(
  async (req, { params }) => {
    const body = await req.json()
    const parsed = AuctionResultSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const result = await prisma.auctionResult.create({
      data: { ...parsed.data, lotId: params.lotId },
    })
    // Update lot status
    const newStatus =
      parsed.data.resultStatus === "Sold"
        ? "Sold"
        : parsed.data.resultStatus === "Passed"
        ? "Passed"
        : "Active"
    await prisma.lot.update({
      where: { id: params.lotId },
      data: { lotStatus: newStatus },
    })
    return NextResponse.json(result, { status: 201 })
  },
  "auction:enter"
)

export const PUT = withAuth(
  async (req, { params }) => {
    const body = await req.json()
    const parsed = AuctionResultSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const result = await prisma.auctionResult.update({
      where: { lotId: params.lotId },
      data: parsed.data,
    })
    return NextResponse.json(result)
  },
  "auction:enter"
)
