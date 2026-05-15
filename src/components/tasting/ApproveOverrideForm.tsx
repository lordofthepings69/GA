"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  tastingId: string
  lotId: string
}

export function ApproveOverrideForm({ tastingId, lotId }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<"" | "approve" | "override">("")
  const [loading, setLoading] = useState(false)
  const [overridePrice, setOverridePrice] = useState("")
  const [overrideReason, setOverrideReason] = useState("")
  const [error, setError] = useState("")

  async function submit() {
    setError("")
    setLoading(true)
    const res = await fetch(`/api/lots/${lotId}/tasting/${tastingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: mode,
        overridePrice: overridePrice ? Number(overridePrice) : undefined,
        overrideReason: overrideReason || undefined,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      setError("Failed to update record")
    } else {
      router.push(`/lots/${lotId}`)
      router.refresh()
    }
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-emerald-800">Senior Taster Action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "approve" ? "default" : "outline"}
            onClick={() => setMode("approve")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant={mode === "override" ? "default" : "outline"}
            onClick={() => setMode("override")}
          >
            Override Price
          </Button>
        </div>

        {mode === "override" && (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">New Price (LKR/kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={overridePrice}
                onChange={(e) => setOverridePrice(e.target.value)}
                className="max-w-xs h-8"
                placeholder="e.g. 980.00"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Override Reason (required)</Label>
              <Textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={2}
                placeholder="Reason for overriding the recommendation…"
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {mode && (
          <Button size="sm" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : `Confirm ${mode === "approve" ? "Approval" : "Override"}`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
