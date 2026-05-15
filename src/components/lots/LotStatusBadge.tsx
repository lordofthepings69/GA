import { Badge } from "@/components/ui/badge"
import { LotStatus } from "@prisma/client"

const STATUS_STYLES: Record<LotStatus, "default" | "success" | "destructive" | "warning" | "secondary"> = {
  Active: "info" as any,
  Withdrawn: "destructive",
  Passed: "warning",
  Sold: "success",
}

export function LotStatusBadge({ status }: { status: LotStatus }) {
  return <Badge variant={STATUS_STYLES[status]}>{status}</Badge>
}
