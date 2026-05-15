import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { LotCreateSchema } from "@/lib/validations/lot"
import { Grade, LotStatus, Region } from "@prisma/client"

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "50")
  const status = searchParams.get("status") as LotStatus | null
  const grade = searchParams.get("grade") as Grade | null
  const region = searchParams.get("region") as Region | null
  const sellerId = searchParams.get("sellerId")
  const saleNumber = searchParams.get("saleNumber")
  const q = searchParams.get("q")

  const where = {
    ...(status ? { lotStatus: status } : {}),
    ...(grade ? { grade } : {}),
    ...(region ? { region } : {}),
    ...(sellerId ? { sellerId } : {}),
    ...(saleNumber ? { saleNumber } : {}),
    ...(q
      ? {
          OR: [
            { estateName: { contains: q, mode: "insensitive" as const } },
            { catalogueNumber: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [lots, total] = await Promise.all([
    prisma.lot.findMany({
      where,
      include: { seller: { select: { sellerCode: true, companyName: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lot.count({ where }),
  ])

  return NextResponse.json({ lots, total, page, limit })
})

export const POST = withAuth(
  async (req) => {
    const body = await req.json()
    const parsed = LotCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data
    const catalogueNumber = `${data.saleNumber}/${data.lotNumber}`

    const lot = await prisma.lot.create({
      data: {
        ...data,
        catalogueNumber,
        saleDate: data.saleDate,
        dateOfManufacture: data.dateOfManufacture,
      },
    })
    return NextResponse.json(lot, { status: 201 })
  },
  "lot:create"
)
