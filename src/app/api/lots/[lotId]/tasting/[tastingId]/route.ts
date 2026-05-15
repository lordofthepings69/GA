import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { TastingCreateSchema, TastingApproveSchema } from "@/lib/validations/tasting"
import { hasPermission } from "@/lib/rbac"

export const GET = withAuth(async (_req, { params }) => {
  const record = await prisma.tastingRecord.findUnique({
    where: { id: params.tastingId },
    include: {
      lot: { include: { seller: true } },
      taster: { select: { name: true, email: true, role: true } },
      approvedBy: { select: { name: true } },
    },
  })
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(record)
})

export const PUT = withAuth(async (req, { params }, session) => {
  const record = await prisma.tastingRecord.findUnique({ where: { id: params.tastingId } })
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (record.status !== "Draft") {
    return NextResponse.json({ error: "Only Draft records can be edited" }, { status: 400 })
  }
  if (record.tasterId !== session.user.id && !hasPermission(session.user.role, "admin:all")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const body = await req.json()
  const parsed = TastingCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const updated = await prisma.tastingRecord.update({
    where: { id: params.tastingId },
    data: parsed.data,
  })
  return NextResponse.json(updated)
})

export const PATCH = withAuth(
  async (req, { params }, session) => {
    const body = await req.json()
    const parsed = TastingApproveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { action, overridePrice, overrideReason } = parsed.data

    const updateData =
      action === "approve"
        ? {
            status: "Approved" as const,
            approvedById: session.user.id,
            approvedAt: new Date(),
          }
        : {
            status: "Overridden" as const,
            approvedById: session.user.id,
            approvedAt: new Date(),
            overrideReason,
            ...(overridePrice ? { priceRecommendation: overridePrice } : {}),
          }

    const updated = await prisma.tastingRecord.update({
      where: { id: params.tastingId },
      data: updateData,
    })

    // Update lot's upset price if approved/overridden and price exists
    if (updated.priceRecommendation) {
      await prisma.lot.update({
        where: { id: params.lotId },
        data: { upsettingPrice: updated.priceRecommendation },
      })
    }

    return NextResponse.json(updated)
  },
  "tasting:approve"
)
