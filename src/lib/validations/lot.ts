import { z } from "zod"
import { Region, Elevation, Grade } from "@prisma/client"

export const LotCreateSchema = z.object({
  saleNumber: z.string().min(1, "Sale number required"),
  lotNumber: z.string().min(1, "Lot number required"),
  saleDate: z.coerce.date(),
  sellerId: z.string().min(1, "Seller required"),
  estateName: z.string().min(2).max(100),
  factory: z.string().optional(),
  division: z.string().optional(),
  region: z.nativeEnum(Region),
  elevation: z.nativeEnum(Elevation),
  grade: z.nativeEnum(Grade),
  numPackages: z.coerce.number().int().positive(),
  grossWeight: z.coerce.number().positive(),
  netWeight: z.coerce.number().positive(),
  dateOfManufacture: z.coerce.date(),
  warehouseLocation: z.string().optional(),
  adviceNoteNumber: z.string().optional(),
})

export type LotCreateInput = z.infer<typeof LotCreateSchema>

export const LotUpdateSchema = LotCreateSchema.partial()

export const UpsettingPriceSchema = z.object({
  upsettingPrice: z.coerce.number().positive(),
})
