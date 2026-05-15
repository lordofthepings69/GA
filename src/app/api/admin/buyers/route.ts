import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const BuyerSchema = z.object({
  buyerCode: z.string().min(1),
  companyName: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

export const GET = withAuth(async () => {
  const buyers = await prisma.buyer.findMany({ orderBy: { companyName: "asc" } })
  return NextResponse.json(buyers)
})

export const POST = withAuth(async (req) => {
  const body = await req.json()
  const parsed = BuyerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const buyer = await prisma.buyer.create({ data: parsed.data })
  return NextResponse.json(buyer, { status: 201 })
}, "admin:all")
