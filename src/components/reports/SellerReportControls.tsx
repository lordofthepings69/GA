"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Seller } from "@prisma/client"

interface Props {
  sellers: Seller[]
}

export function SellerReportControls({ sellers }: Props) {
  const router = useRouter()
  const [sellerId, setSellerId] = useState("")
  const [saleNumber, setSaleNumber] = useState("")

  function generate() {
    if (!sellerId) return
    const params = saleNumber ? `?saleNumber=${encodeURIComponent(saleNumber)}` : ""
    router.push(`/reports/seller/${sellerId}${params}`)
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <div className="space-y-2">
        <Label>Seller</Label>
        <Select value={sellerId} onValueChange={setSellerId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a seller" />
          </SelectTrigger>
          <SelectContent>
            {sellers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.companyName} ({s.sellerCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="saleNumber">Sale Number (optional)</Label>
        <Input
          id="saleNumber"
          value={saleNumber}
          onChange={(e) => setSaleNumber(e.target.value)}
          placeholder="e.g. 23"
        />
      </div>
      <Button onClick={generate} disabled={!sellerId}>
        Generate Report
      </Button>
    </div>
  )
}
