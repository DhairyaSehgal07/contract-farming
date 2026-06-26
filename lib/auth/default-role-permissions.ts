import { Role } from "@/app/generated/prisma/client";
import type { AppPermissionGrant } from "@/lib/auth/permission-catalog";

export const DASHBOARD_READ = [
  { resource: "dashboard", action: "read" },
] as const satisfies readonly AppPermissionGrant[];

export const REQUISITION_ACCESS = [
  { resource: "requisition", action: "read" },
  { resource: "requisition", action: "write" },
] as const satisfies readonly AppPermissionGrant[];

export const REQUISITION_APPROVE = [
  { resource: "requisition", action: "approve" },
] as const satisfies readonly AppPermissionGrant[];

export const DISPATCH_ACCESS = [
  { resource: "dispatch", action: "read" },
  { resource: "dispatch", action: "write" },
] as const satisfies readonly AppPermissionGrant[];

export const MASTER_READ_WRITE = [
  { resource: "master", action: "read" },
  { resource: "master", action: "write" },
] as const satisfies readonly AppPermissionGrant[];

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, AppPermissionGrant[]> = {
  [Role.MANAGING_DIRECTOR]: [],
  [Role.PROGRAMME_MANAGER]: [
    ...DASHBOARD_READ,
    ...MASTER_READ_WRITE,
    ...REQUISITION_ACCESS,
    ...REQUISITION_APPROVE,
    ...DISPATCH_ACCESS,
  ],
  [Role.ACCOUNTS_SETTLEMENTS_MANAGER]: [
    ...DASHBOARD_READ,
    ...REQUISITION_ACCESS,
    ...REQUISITION_APPROVE,
    ...DISPATCH_ACCESS,
  ],
  [Role.FIELD_OPERATIONS_MANAGER]: [
    ...DASHBOARD_READ,
    ...MASTER_READ_WRITE,
    ...REQUISITION_ACCESS,
    ...DISPATCH_ACCESS,
  ],
  [Role.ACCOUNTS_SEEDS_SUPPLY_MANAGER]: [
    ...DASHBOARD_READ,
    ...REQUISITION_ACCESS,
    ...REQUISITION_APPROVE,
    ...DISPATCH_ACCESS,
  ],
  [Role.LOGISTICS_EXECUTIVE]: [...DASHBOARD_READ, ...DISPATCH_ACCESS],
  [Role.FIELD_OFFICER]: [...DASHBOARD_READ, ...DISPATCH_ACCESS],
  [Role.USER]: [...DASHBOARD_READ],
};

/** DB grants stored for Managing Director (app bypass still grants full access). */
export const MANAGING_DIRECTOR_DB_PERMISSIONS = [
  { resource: "permissions", action: "read" },
  { resource: "permissions", action: "write" },
] as const satisfies readonly AppPermissionGrant[];
