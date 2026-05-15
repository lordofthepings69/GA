import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { SampleDispatchUpdateSchema } from "@/lib/validations/sample"

export const PUT = withAuth(
  async (req, { params }) => {
    const body = await req.json()
    const parsed = SampleDispatchUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const dispatch = await prisma.sampleDispatch.update({
      where: { id: params.dispatchId },
      data: parsed.data,
    })
    return NextResponse.json(dispatch)
  },
  "samples:write"
)
