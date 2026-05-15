import { z } from "zod"
import {
  LiquorBrightness,
  LiquorStrength,
  LiquorBriskness,
  LiquorFlavor,
  LiquorAroma,
  OverallQuality,
  TastingStatus,
} from "@prisma/client"

const scoreField = z.coerce.number().int().min(1).max(10).optional()

export const TastingCreateSchema = z.object({
  dateTasted: z.coerce.date().optional(),

  dryLeafAppearanceScore: scoreField,
  dryLeafAppearanceNotes: z.string().optional(),
  dryLeafColorScore: scoreField,
  dryLeafColorNotes: z.string().optional(),
  dryLeafUniformityScore: scoreField,
  dryLeafUniformityNotes: z.string().optional(),
  dryLeafAromaScore: scoreField,
  dryLeafAromaNotes: z.string().optional(),

  infusionBrightnessScore: scoreField,
  infusionBrightnessNotes: z.string().optional(),
  infusionColorScore: scoreField,
  infusionColorNotes: z.string().optional(),
  infusionEvennessScore: scoreField,
  infusionEvennessNotes: z.string().optional(),

  liquorBrightness: z.nativeEnum(LiquorBrightness).optional(),
  liquorBrightnessNotes: z.string().optional(),
  liquorColor: z.string().optional(),
  liquorStrength: z.nativeEnum(LiquorStrength).optional(),
  liquorBriskness: z.nativeEnum(LiquorBriskness).optional(),
  liquorFlavor: z.nativeEnum(LiquorFlavor).optional(),
  liquorAroma: z.nativeEnum(LiquorAroma).optional(),
  overallQuality: z.nativeEnum(OverallQuality).optional(),
  overallQualityNotes: z.string().optional(),

  priceRecommendation: z.coerce.number().positive().optional(),
  tastingNotes: z.string().optional(),
  status: z.nativeEnum(TastingStatus).optional(),
})

export type TastingCreateInput = z.infer<typeof TastingCreateSchema>

export const TastingApproveSchema = z.object({
  action: z.enum(["approve", "override"]),
  overridePrice: z.coerce.number().positive().optional(),
  overrideReason: z.string().optional(),
})
