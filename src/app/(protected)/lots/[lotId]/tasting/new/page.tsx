import { TastingSheetForm } from "@/components/tasting/TastingSheetForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"
import { redirect } from "next/navigation"

export default async function NewTastingPage({ params }: { params: { lotId: string } }) {
  const [lot, session] = await Promise.all([
    prisma.lot.findUnique({
      where: { id: params.lotId },
      select: { id: true, catalogueNumber: true, estateName: true, grade: true, elevation: true },
    }),
    auth(),
  ])

  if (!lot) notFound()
  if (!hasPermission(session!.user.role, "tasting:create")) redirect(`/lots/${params.lotId}`)

  return (
    <div className="max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        Tasting Sheet — <span className="font-mono text-emerald-700">{lot.catalogueNumber}</span>
      </h1>
      <p className="text-gray-500">{lot.estateName} · {lot.grade} · {lot.elevation}</p>
      <TastingSheetForm lot={lot} />
    </div>
  )
}
