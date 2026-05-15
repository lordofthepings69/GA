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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComparablesPanel } from "./ComparablesPanel"
import { Grade } from "@prisma/client"

interface Lot {
  id: string
  catalogueNumber: string
  estateName: string
  grade: Grade
  elevation: string
}

interface Props {
  lot: Lot
}

const BRIGHTNESS_OPTS = ["Bright", "Good", "Fair", "Dull"]
const STRENGTH_OPTS = ["Strong", "Medium", "Light", "Thin"]
const BRISKNESS_OPTS = ["Brisk", "Good", "Fair", "Lacking"]
const FLAVOR_OPTS = ["Excellent", "Good", "Fair", "Plain", "Off"]
const AROMA_OPTS = ["Distinctive", "Good", "Fair", "Plain"]
const OVERALL_OPTS = ["Outstanding", "VeryGood", "Good", "Fair", "BelowAverage", "Poor"]

function ScoreInput({ name, label }: { name: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Label className="w-28 text-xs shrink-0">{label}</Label>
      <Input type="number" name={name} min={1} max={10} className="w-20 h-8 text-sm" />
      <span className="text-xs text-gray-400">/10</span>
    </div>
  )
}

function EnumSelect({ name, label, options, value, onChange }: {
  name: string; label: string; options: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange} name={name}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function TastingSheetForm({ lot }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Liquor enum states
  const [brightness, setBrightness] = useState("")
  const [strength, setStrength] = useState("")
  const [briskness, setBriskness] = useState("")
  const [flavor, setFlavor] = useState("")
  const [aroma, setAroma] = useState("")
  const [overall, setOverall] = useState("")

  async function submit(e: React.FormEvent<HTMLFormElement>, status: "Draft" | "Submitted") {
    e.preventDefault()
    setError("")
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      dryLeafAppearanceScore: fd.get("dryLeafAppearanceScore") ? Number(fd.get("dryLeafAppearanceScore")) : undefined,
      dryLeafAppearanceNotes: fd.get("dryLeafAppearanceNotes") || undefined,
      dryLeafColorScore: fd.get("dryLeafColorScore") ? Number(fd.get("dryLeafColorScore")) : undefined,
      dryLeafColorNotes: fd.get("dryLeafColorNotes") || undefined,
      dryLeafUniformityScore: fd.get("dryLeafUniformityScore") ? Number(fd.get("dryLeafUniformityScore")) : undefined,
      dryLeafUniformityNotes: fd.get("dryLeafUniformityNotes") || undefined,
      dryLeafAromaScore: fd.get("dryLeafAromaScore") ? Number(fd.get("dryLeafAromaScore")) : undefined,
      dryLeafAromaNotes: fd.get("dryLeafAromaNotes") || undefined,

      infusionBrightnessScore: fd.get("infusionBrightnessScore") ? Number(fd.get("infusionBrightnessScore")) : undefined,
      infusionBrightnessNotes: fd.get("infusionBrightnessNotes") || undefined,
      infusionColorScore: fd.get("infusionColorScore") ? Number(fd.get("infusionColorScore")) : undefined,
      infusionColorNotes: fd.get("infusionColorNotes") || undefined,
      infusionEvennessScore: fd.get("infusionEvennessScore") ? Number(fd.get("infusionEvennessScore")) : undefined,
      infusionEvennessNotes: fd.get("infusionEvennessNotes") || undefined,

      liquorBrightness: brightness || undefined,
      liquorBrightnessNotes: fd.get("liquorBrightnessNotes") || undefined,
      liquorColor: fd.get("liquorColor") || undefined,
      liquorStrength: strength || undefined,
      liquorBriskness: briskness || undefined,
      liquorFlavor: flavor || undefined,
      liquorAroma: aroma || undefined,
      overallQuality: overall || undefined,
      overallQualityNotes: fd.get("overallQualityNotes") || undefined,

      priceRecommendation: fd.get("priceRecommendation") ? Number(fd.get("priceRecommendation")) : undefined,
      tastingNotes: fd.get("tastingNotes") || undefined,
      status,
    }
    const res = await fetch(`/api/lots/${lot.id}/tasting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!res.ok) {
      setError("Failed to save tasting record")
    } else {
      router.push(`/lots/${lot.id}`)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <form id="tasting-form" onSubmit={(e) => submit(e, "Submitted")}>
          <Tabs defaultValue="dry">
            <TabsList className="mb-4">
              <TabsTrigger value="dry">Dry Leaf</TabsTrigger>
              <TabsTrigger value="infusion">Infusion</TabsTrigger>
              <TabsTrigger value="liquor">Liquor</TabsTrigger>
              <TabsTrigger value="price">Price & Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="dry">
              <Card>
                <CardHeader><CardTitle className="text-sm">Dry Leaf Assessment</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <ScoreInput name="dryLeafAppearanceScore" label="Appearance" />
                  <Textarea name="dryLeafAppearanceNotes" placeholder="well-made, wiry, tippy, stalky, mixed…" className="text-sm" rows={2} />
                  <ScoreInput name="dryLeafColorScore" label="Color" />
                  <Textarea name="dryLeafColorNotes" placeholder="black, brownish, greenish tinge…" className="text-sm" rows={2} />
                  <ScoreInput name="dryLeafUniformityScore" label="Uniformity" />
                  <Textarea name="dryLeafUniformityNotes" placeholder="consistency across the sample…" className="text-sm" rows={2} />
                  <ScoreInput name="dryLeafAromaScore" label="Aroma" />
                  <Textarea name="dryLeafAromaNotes" placeholder="aroma of dry leaf…" className="text-sm" rows={2} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="infusion">
              <Card>
                <CardHeader><CardTitle className="text-sm">Infused Leaf Assessment</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-gray-500">Standard: 2.86g in 140ml water, 6 minutes brew time</p>
                  <ScoreInput name="infusionBrightnessScore" label="Brightness" />
                  <Textarea name="infusionBrightnessNotes" placeholder="copper, bright, dull, dark…" className="text-sm" rows={2} />
                  <ScoreInput name="infusionColorScore" label="Color" />
                  <Textarea name="infusionColorNotes" placeholder="color depth and tone…" className="text-sm" rows={2} />
                  <ScoreInput name="infusionEvennessScore" label="Evenness" />
                  <Textarea name="infusionEvennessNotes" placeholder="evenness of infusion…" className="text-sm" rows={2} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="liquor">
              <Card>
                <CardHeader><CardTitle className="text-sm">Liquor Assessment</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <EnumSelect name="liquorBrightness" label="Brightness" options={BRIGHTNESS_OPTS} value={brightness} onChange={setBrightness} />
                  <div className="space-y-1">
                    <Label className="text-xs">Color (free text)</Label>
                    <Input name="liquorColor" placeholder="Golden, Amber, Coppery, Dark…" className="h-8 text-sm" />
                  </div>
                  <EnumSelect name="liquorStrength" label="Strength" options={STRENGTH_OPTS} value={strength} onChange={setStrength} />
                  <EnumSelect name="liquorBriskness" label="Briskness" options={BRISKNESS_OPTS} value={briskness} onChange={setBriskness} />
                  <EnumSelect name="liquorFlavor" label="Flavor" options={FLAVOR_OPTS} value={flavor} onChange={setFlavor} />
                  <EnumSelect name="liquorAroma" label="Aroma" options={AROMA_OPTS} value={aroma} onChange={setAroma} />
                  <div className="col-span-2">
                    <EnumSelect name="overallQuality" label="Overall Quality" options={OVERALL_OPTS} value={overall} onChange={setOverall} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Overall Notes</Label>
                    <Textarea name="overallQualityNotes" placeholder="Overall quality notes…" className="text-sm" rows={2} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="price">
              <Card>
                <CardHeader><CardTitle className="text-sm">Price Recommendation & Notes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceRecommendation">Price Recommendation (LKR/kg)</Label>
                    <Input
                      id="priceRecommendation"
                      name="priceRecommendation"
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="e.g. 950.00"
                      className="max-w-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tastingNotes">Overall Tasting Notes</Label>
                    <Textarea
                      id="tastingNotes"
                      name="tastingNotes"
                      placeholder="Free-form tasting notes…"
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex gap-3 mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Submit for Approval"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={(e) => {
                const form = document.getElementById("tasting-form") as HTMLFormElement
                submit({ ...e, currentTarget: form, preventDefault: () => {} } as any, "Draft")
              }}
            >
              Save as Draft
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <div className="col-span-1">
        <Card className="sticky top-0">
          <CardContent className="pt-4">
            <ComparablesPanel estateName={lot.estateName} grade={lot.grade} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
