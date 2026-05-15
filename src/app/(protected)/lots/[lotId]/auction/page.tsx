import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"
import { AuctionResultForm } from "@/components/auction/AuctionResultForm"

export default async function AuctionResultPage({ params }: { params: { lotId: string } }) {
  const [lot, session, buyers] = await Promise.all([
    prisma.lot.findUnique({
      where: { id: params.lotId },
      select: { id: true, catalogueNumber: true, estateName: true, grade: true, saleNumber: true },
    }),
    auth(),
    prisma.buyer.findMany({ orderBy: { companyName: "asc" } }),
  ])

  if (!lot) notFound()
  if (!hasPermission(session!.user.role, "auction:enter")) redirect(`/lots/${params.lotId}`)

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Record Auction Result</h1>
      <p className="text-gray-500 font-mono">{lot.catalogueNumber} — {lot.estateName} {lot.grade}</p>
      <AuctionResultForm lotId={lot.id} saleNumber={lot.saleNumber} buyers={buyers} />
    </div>
  )
}
