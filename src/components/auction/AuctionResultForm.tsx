"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Buyer, ResultStatus } from "@prisma/client"

const RESULT_STATUSES = Object.values(ResultStatus)

interface Props {
  lotId: string
  saleNumber: string
  buyers: Buyer[]
}

export function AuctionResultForm({ lotId, saleNumber, buyers }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resultStatus, setResultStatus] = useState<ResultStatus>("Sold")
  const [buyerId, setBuyerId] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      saleNumber,
      hammerPrice: fd.get("hammerPrice") ? Number(fd.get("hammerPrice")) : undefined,
      buyerId: buyerId || undefined,
      resultStatus,
      postSaleNotes: fd.get("postSaleNotes") || undefined,
    }
    const res = await fetch(`/api/lots/${lotId}/auction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!res.ok) {
      setError("Failed to record auction result")
    } else {
      router.push(`/lots/${lotId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Result Status</Label>
            <Select value={resultStatus} onValueChange={(v) => setResultStatus(v as ResultStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESULT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {resultStatus === "Sold" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="hammerPrice">Hammer Price (LKR/kg)</Label>
                <Input
                  id="hammerPrice"
                  name="hammerPrice"
                  type="number"
                  step="0.01"
                  min={0.01}
                  placeholder="e.g. 975.50"
                  required={resultStatus === "Sold"}
                />
              </div>
              <div className="space-y-2">
                <Label>Buyer</Label>
                <Select value={buyerId} onValueChange={setBuyerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select buyer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.companyName} ({b.buyerCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="postSaleNotes">Post-sale Notes</Label>
            <Textarea id="postSaleNotes" name="postSaleNotes" rows={3} placeholder="Any notes…" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Recording…" : "Record Result"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
