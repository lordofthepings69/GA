import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const SellerSchema = z.object({
  sellerCode: z.string().min(1),
  companyName: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const GET = withAuth(async () => {
  const sellers = await prisma.seller.findMany({ orderBy: { companyName: "asc" } })
  return NextResponse.json(sellers)
})

export const POST = withAuth(async (req) => {
  const body = await req.json()
  const parsed = SellerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const seller = await prisma.seller.create({ data: parsed.data })
  return NextResponse.json(seller, { status: 201 })
}, "admin:all")
