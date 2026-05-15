import { UserRole } from "@prisma/client"

export type Permission =
  | "lot:create"
  | "lot:edit"
  | "lot:view"
  | "tasting:create"
  | "tasting:approve"
  | "tasting:override"
  | "upset_price:set"
  | "auction:enter"
  | "report:view"
  | "dashboard:view"
  | "samples:write"
  | "admin:all"

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  TeaTaster: ["lot:view", "tasting:create", "dashboard:view"],
  SeniorTaster: [
    "lot:view",
    "tasting:create",
    "tasting:approve",
    "tasting:override",
    "upset_price:set",
    "dashboard:view",
  ],
  CataloguingTeam: ["lot:create", "lot:edit", "lot:view", "dashboard:view"],
  Salesperson: [
    "lot:view",
    "auction:enter",
    "report:view",
    "dashboard:view",
  ],
  WarehouseStaff: ["lot:view", "samples:write", "dashboard:view"],
  Finance: ["lot:view", "report:view", "dashboard:view"],
  Management: ["lot:view", "report:view", "dashboard:view"],
  Admin: [
    "lot:create",
    "lot:edit",
    "lot:view",
    "tasting:create",
    "tasting:approve",
    "tasting:override",
    "upset_price:set",
    "auction:enter",
    "report:view",
    "dashboard:view",
    "samples:write",
    "admin:all",
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
