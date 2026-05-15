import { z } from "zod"
import { ResultStatus } from "@prisma/client"

export const AuctionResultSchema = z.object({
  saleNumber: z.string().min(1),
  hammerPrice: z.coerce.number().positive().optional(),
  buyerId: z.string().optional(),
  resultStatus: z.nativeEnum(ResultStatus),
  postSaleNotes: z.string().optional(),
  dateRecorded: z.coerce.date().optional(),
})

export type AuctionResultInput = z.infer<typeof AuctionResultSchema>
