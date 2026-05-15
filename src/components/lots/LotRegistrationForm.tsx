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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Seller, Region, Elevation, Grade } from "@prisma/client"

const REGIONS = Object.values(Region)
const ELEVATIONS = Object.values(Elevation)
const GRADES = Object.values(Grade)

interface Props {
  sellers: Seller[]
  defaultValues?: Partial<{
    saleNumber: string
    lotNumber: string
    sellerId: string
    estateName: string
    grade: Grade
    region: Region
    elevation: Elevation
  }>
}

export function LotRegistrationForm({ sellers, defaultValues }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sellerId, setSellerId] = useState(defaultValues?.sellerId ?? "")
  const [region, setRegion] = useState<Region | "">(defaultValues?.region ?? "")
  const [elevation, setElevation] = useState<Elevation | "">(defaultValues?.elevation ?? "")
  const [grade, setGrade] = useState<Grade | "">(defaultValues?.grade ?? "")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      saleNumber: fd.get("saleNumber"),
      lotNumber: fd.get("lotNumber"),
      saleDate: fd.get("saleDate"),
      sellerId,
      estateName: fd.get("estateName"),
      factory: fd.get("factory") || undefined,
      division: fd.get("division") || undefined,
      region,
      elevation,
      grade,
      numPackages: Number(fd.get("numPackages")),
      grossWeight: Number(fd.get("grossWeight")),
      netWeight: Number(fd.get("netWeight")),
      dateOfManufacture: fd.get("dateOfManufacture"),
      warehouseLocation: fd.get("warehouseLocation") || undefined,
      adviceNoteNumber: fd.get("adviceNoteNumber") || undefined,
    }
    const res = await fetch("/api/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(JSON.stringify(data.error))
    } else {
      const lot = await res.json()
      router.push(`/lots/${lot.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sale Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="saleNumber">Sale Number</Label>
            <Input id="saleNumber" name="saleNumber" placeholder="e.g. 23" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lotNumber">Lot Number</Label>
            <Input id="lotNumber" name="lotNumber" placeholder="e.g. 4782" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saleDate">Sale Date</Label>
            <Input id="saleDate" name="saleDate" type="date" required />
          </div>
          <div className="space-y-2">
            <Label>Seller</Label>
            <Select value={sellerId} onValueChange={setSellerId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select seller" />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estateName">Estate Name</Label>
            <Input
              id="estateName"
              name="estateName"
              placeholder="e.g. Kenilworth"
              required
              defaultValue={defaultValues?.estateName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="factory">Factory / Division</Label>
            <Input id="factory" name="factory" placeholder="optional" />
          </div>
          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={region} onValueChange={(v) => setRegion(v as Region)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Elevation</Label>
            <Select value={elevation} onValueChange={(v) => setElevation(v as Elevation)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select elevation" />
              </SelectTrigger>
              <SelectContent>
                {ELEVATIONS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e === "HG" ? "High Grown (HG)" : e === "MG" ? "Medium Grown (MG)" : "Low Grown (LG)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Grade</Label>
            <Select value={grade} onValueChange={(v) => setGrade(v as Grade)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numPackages">No. of Packages</Label>
            <Input id="numPackages" name="numPackages" type="number" min={1} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfManufacture">Date of Manufacture</Label>
            <Input id="dateOfManufacture" name="dateOfManufacture" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grossWeight">Gross Weight (kg)</Label>
            <Input id="grossWeight" name="grossWeight" type="number" step="0.01" min={0.01} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="netWeight">Net Weight (kg)</Label>
            <Input id="netWeight" name="netWeight" type="number" step="0.01" min={0.01} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warehouseLocation">Warehouse Location</Label>
            <Input id="warehouseLocation" name="warehouseLocation" placeholder="e.g. Bay 3, Row B, Stack 12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adviceNoteNumber">Advice Note Number</Label>
            <Input id="adviceNoteNumber" name="adviceNoteNumber" placeholder="from factory dispatch" />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Registering…" : "Register Lot"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
