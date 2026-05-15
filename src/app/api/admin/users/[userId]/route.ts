import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { UserRole } from "@prisma/client"

const UpdateSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  name: z.string().optional(),
})

export const PUT = withAuth(async (req, { params }) => {
  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const user = await prisma.user.update({
    where: { id: params.userId },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true },
  })
  return NextResponse.json(user)
}, "admin:all")
