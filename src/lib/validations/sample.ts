import { z } from "zod"
import { RecipientType, DispatchStatus } from "@prisma/client"

export const SampleDispatchSchema = z.object({
  recipientType: z.nativeEnum(RecipientType),
  recipientId: z.string().min(1),
  dateDispatched: z.coerce.date(),
  dateReceived: z.coerce.date().optional(),
  sampleWeightSent: z.coerce.number().positive().optional(),
  notes: z.string().optional(),
})

export const SampleDispatchUpdateSchema = z.object({
  status: z.nativeEnum(DispatchStatus),
  dateReceived: z.coerce.date().optional(),
  notes: z.string().optional(),
})
