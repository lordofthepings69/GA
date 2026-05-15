import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { SampleDispatchSchema } from "@/lib/validations/sample"

export const GET = withAuth(async (_req, { params }) => {
  const dispatches = await prisma.sampleDispatch.findMany({
    where: { lotId: params.lotId },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(dispatches)
})

export const POST = withAuth(
  async (req, { params }) => {
    const body = await req.json()
    const parsed = SampleDispatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const dispatch = await prisma.sampleDispatch.create({
      data: { ...parsed.data, lotId: params.lotId },
    })
    return NextResponse.json(dispatch, { status: 201 })
  },
  "samples:write"
)
