import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { TastingCreateSchema } from "@/lib/validations/tasting"

export const GET = withAuth(async (_req, { params }) => {
  const records = await prisma.tastingRecord.findMany({
    where: { lotId: params.lotId },
    include: {
      taster: { select: { name: true, role: true } },
      approvedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(records)
})

export const POST = withAuth(
  async (req, { params }, session) => {
    const body = await req.json()
    const parsed = TastingCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const lot = await prisma.lot.findUnique({ where: { id: params.lotId } })
    if (!lot) return NextResponse.json({ error: "Lot not found" }, { status: 404 })

    const record = await prisma.tastingRecord.create({
      data: {
        ...parsed.data,
        lotId: params.lotId,
        tasterId: session.user.id,
      },
    })
    return NextResponse.json(record, { status: 201 })
  },
  "tasting:create"
)
