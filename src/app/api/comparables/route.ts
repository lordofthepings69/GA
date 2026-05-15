import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { getHistoricalComparables } from "@/lib/comparables"
import { Grade } from "@prisma/client"
import { z } from "zod"

const QuerySchema = z.object({
  estate: z.string().min(1),
  grade: z.nativeEnum(Grade),
  weeks: z.coerce.number().int().min(1).max(12).default(6),
})

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    estate: searchParams.get("estate"),
    grade: searchParams.get("grade"),
    weeks: searchParams.get("weeks") ?? 6,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const result = await getHistoricalComparables(
    parsed.data.estate,
    parsed.data.grade,
    parsed.data.weeks
  )
  return NextResponse.json(result)
})
