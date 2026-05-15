import { LotRegistrationForm } from "@/components/lots/LotRegistrationForm"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"
import { redirect } from "next/navigation"

export default async function NewLotPage() {
  const session = await auth()
  if (!hasPermission(session!.user.role, "lot:create")) redirect("/lots")

  const sellers = await prisma.seller.findMany({ orderBy: { companyName: "asc" } })

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Register New Lot</h1>
      <LotRegistrationForm sellers={sellers} />
    </div>
  )
}
