import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/rbac"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatLKR } from "@/lib/utils"
import { format } from "date-fns"
import { ApproveOverrideForm } from "@/components/tasting/ApproveOverrideForm"

export default async function TastingDetailPage({ params }: { params: { tastingId: string } }) {
  const [record, session] = await Promise.all([
    prisma.tastingRecord.findUnique({
      where: { id: params.tastingId },
      include: {
        lot: { select: { id: true, catalogueNumber: true, estateName: true, grade: true, elevation: true } },
        taster: { select: { name: true, email: true } },
        approvedBy: { select: { name: true } },
      },
    }),
    auth(),
  ])

  if (!record) notFound()
  const canApprove = hasPermission(session!.user.role, "tasting:approve")

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/lots/${record.lot.id}`} className="text-sm text-emerald-600 hover:underline">
          ← {record.lot.catalogueNumber}
        </Link>
        <h1 className="text-2xl font-bold mt-1">Tasting Record</h1>
        <p className="text-gray-500">{record.lot.estateName} — {record.lot.grade} — {record.lot.elevation}</p>
      </div>

      <div className="flex gap-3 items-center">
        <Badge variant={record.status === "Approved" ? "success" as any : record.status === "Overridden" ? "warning" as any : "secondary"}>
          {record.status}
        </Badge>
        <span className="text-sm text-gray-500">by {record.taster.name} on {format(new Date(record.dateTasted), "dd MMM yyyy")}</span>
        {record.approvedBy && (
          <span className="text-sm text-gray-500">· {record.status} by {record.approvedBy.name}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Dry Leaf</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <ScoreRow label="Appearance" score={record.dryLeafAppearanceScore} notes={record.dryLeafAppearanceNotes} />
            <ScoreRow label="Color" score={record.dryLeafColorScore} notes={record.dryLeafColorNotes} />
            <ScoreRow label="Uniformity" score={record.dryLeafUniformityScore} notes={record.dryLeafUniformityNotes} />
            <ScoreRow label="Aroma" score={record.dryLeafAromaScore} notes={record.dryLeafAromaNotes} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Infusion</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <ScoreRow label="Brightness" score={record.infusionBrightnessScore} notes={record.infusionBrightnessNotes} />
            <ScoreRow label="Color" score={record.infusionColorScore} notes={record.infusionColorNotes} />
            <ScoreRow label="Evenness" score={record.infusionEvennessScore} notes={record.infusionEvennessNotes} />
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Liquor</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-sm">
            <LiquorRow label="Brightness" value={record.liquorBrightness} />
            <LiquorRow label="Color" value={record.liquorColor} />
            <LiquorRow label="Strength" value={record.liquorStrength} />
            <LiquorRow label="Briskness" value={record.liquorBriskness} />
            <LiquorRow label="Flavor" value={record.liquorFlavor} />
            <LiquorRow label="Aroma" value={record.liquorAroma} />
            <div className="col-span-3">
              <LiquorRow label="Overall Quality" value={record.overallQuality} />
              {record.overallQualityNotes && (
                <p className="text-xs text-gray-500 mt-1">{record.overallQualityNotes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Price Recommendation</span>
            <span className="text-xl font-bold text-emerald-700">
              {record.priceRecommendation ? formatLKR(Number(record.priceRecommendation)) + "/kg" : "—"}
            </span>
          </div>
          {record.tastingNotes && (
            <p className="text-sm text-gray-600 border-t pt-2">{record.tastingNotes}</p>
          )}
          {record.overrideReason && (
            <div className="rounded bg-yellow-50 p-2 text-sm text-yellow-800">
              <strong>Override reason:</strong> {record.overrideReason}
            </div>
          )}
        </CardContent>
      </Card>

      {canApprove && record.status === "Submitted" && (
        <ApproveOverrideForm tastingId={record.id} lotId={record.lot.id} />
      )}
    </div>
  )
}

function ScoreRow({ label, score, notes }: { label: string; score: number | null; notes: string | null }) {
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="font-mono font-medium">{score ?? "—"}/10</span>
      </div>
      {notes && <p className="text-xs text-gray-400">{notes}</p>}
    </div>
  )
}

function LiquorRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  )
}
