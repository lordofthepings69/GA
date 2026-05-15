import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LotStatusBadge } from "@/components/lots/LotStatusBadge"
import { Badge } from "@/components/ui/badge"
import { formatLKR } from "@/lib/utils"
import { format } from "date-fns"
import { Plus, Edit } from "lucide-react"

export default async function LotDetailPage({ params }: { params: { lotId: string } }) {
  const [lot, session] = await Promise.all([
    prisma.lot.findUnique({
      where: { id: params.lotId },
      include: {
        seller: true,
        tastingRecords: {
          include: { taster: { select: { name: true } }, approvedBy: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        auctionResult: { include: { buyer: true } },
        sampleDispatches: { orderBy: { createdAt: "desc" } },
      },
    }),
    auth(),
  ])

  if (!lot) notFound()

  const canEdit = hasPermission(session!.user.role, "lot:edit")
  const canTaste = hasPermission(session!.user.role, "tasting:create")
  const canApprove = hasPermission(session!.user.role, "tasting:approve")
  const canSetUpset = hasPermission(session!.user.role, "upset_price:set")
  const canAuction = hasPermission(session!.user.role, "auction:enter")

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">{lot.catalogueNumber}</h1>
            <LotStatusBadge status={lot.lotStatus} />
          </div>
          <p className="text-gray-500 mt-1">{lot.estateName} — {lot.grade} ({lot.elevation})</p>
        </div>
        {canEdit && (
          <Link href={`/lots/${lot.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Sale Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Sale Number" value={lot.saleNumber} />
            <Row label="Lot Number" value={lot.lotNumber} />
            <Row label="Sale Date" value={format(new Date(lot.saleDate), "dd MMM yyyy")} />
            <Row label="Seller" value={`${lot.seller.companyName} (${lot.seller.sellerCode})`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tea Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Region" value={lot.region} />
            <Row label="Elevation" value={lot.elevation === "HG" ? "High Grown" : lot.elevation === "MG" ? "Mid Grown" : "Low Grown"} />
            <Row label="Grade" value={<span className="font-mono font-bold">{lot.grade}</span>} />
            <Row label="Factory" value={lot.factory ?? "—"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weights</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Packages" value={lot.numPackages} />
            <Row label="Gross Weight" value={`${Number(lot.grossWeight).toFixed(2)} kg`} />
            <Row label="Net Weight" value={`${Number(lot.netWeight).toFixed(2)} kg`} />
            <Row label="Mfg Date" value={format(new Date(lot.dateOfManufacture), "dd MMM yyyy")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Logistics</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Warehouse" value={lot.warehouseLocation ?? "—"} />
            <Row label="Advice Note" value={lot.adviceNoteNumber ?? "—"} />
            <Row label="Upset Price" value={lot.upsettingPrice ? formatLKR(Number(lot.upsettingPrice)) + "/kg" : "Not set"} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasting">
        <TabsList>
          <TabsTrigger value="tasting">Tasting Records ({lot.tastingRecords.length})</TabsTrigger>
          <TabsTrigger value="auction">Auction Result</TabsTrigger>
          <TabsTrigger value="samples">Sample Dispatches ({lot.sampleDispatches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasting" className="space-y-3 pt-3">
          {canTaste && (
            <Link href={`/lots/${lot.id}/tasting/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Tasting
              </Button>
            </Link>
          )}
          {lot.tastingRecords.map((tr) => (
            <Card key={tr.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{tr.taster.name}</p>
                  <p className="text-xs text-gray-500">{format(new Date(tr.dateTasted), "dd MMM yyyy HH:mm")}</p>
                  {tr.priceRecommendation && (
                    <p className="text-sm mt-1">
                      Recommendation: <span className="font-bold text-emerald-700">{formatLKR(Number(tr.priceRecommendation))}/kg</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tr.status === "Approved" ? "success" as any : tr.status === "Overridden" ? "warning" as any : "secondary"}>
                    {tr.status}
                  </Badge>
                  <Link href={`/tasting/${tr.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {lot.tastingRecords.length === 0 && (
            <p className="text-sm text-gray-400 py-4">No tasting records yet.</p>
          )}
        </TabsContent>

        <TabsContent value="auction" className="pt-3">
          {lot.auctionResult ? (
            <Card>
              <CardContent className="pt-4 space-y-2 text-sm">
                <Row label="Result" value={<Badge variant={lot.auctionResult.resultStatus === "Sold" ? "success" as any : "secondary"}>{lot.auctionResult.resultStatus}</Badge>} />
                <Row label="Hammer Price" value={lot.auctionResult.hammerPrice ? formatLKR(Number(lot.auctionResult.hammerPrice)) + "/kg" : "—"} />
                <Row label="Buyer" value={lot.auctionResult.buyer?.companyName ?? "—"} />
                <Row label="Recorded" value={format(new Date(lot.auctionResult.dateRecorded), "dd MMM yyyy")} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">No auction result recorded.</p>
              {canAuction && (
                <Link href={`/lots/${lot.id}/auction`}>
                  <Button size="sm">Record Auction Result</Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="samples" className="pt-3">
          <p className="text-sm text-gray-400">
            {lot.sampleDispatches.length} dispatch records.{" "}
            <Link href={`/lots/${lot.id}/samples`} className="text-emerald-600 hover:underline">
              Manage dispatches →
            </Link>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
