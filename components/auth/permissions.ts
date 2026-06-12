import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const ac = createAccessControl(defaultStatements);

/** Full admin plugin access — only MANAGING_DIRECTOR */
export const managingDirectorRole = ac.newRole({
  ...adminAc.statements,
});

export const programmeManagerRole = ac.newRole({});
export const accountsSettlementsManagerRole = ac.newRole({});
export const fieldOperationsManagerRole = ac.newRole({});
export const accountsSeedsSupplyManagerRole = ac.newRole({});
export const logisticsExecutiveRole = ac.newRole({});
export const fieldOfficerRole = ac.newRole({});
export const userRole = ac.newRole({});

export const authRoles = {
  MANAGING_DIRECTOR: managingDirectorRole,
  PROGRAMME_MANAGER: programmeManagerRole,
  ACCOUNTS_SETTLEMENTS_MANAGER: accountsSettlementsManagerRole,
  FIELD_OPERATIONS_MANAGER: fieldOperationsManagerRole,
  ACCOUNTS_SEEDS_SUPPLY_MANAGER: accountsSeedsSupplyManagerRole,
  LOGISTICS_EXECUTIVE: logisticsExecutiveRole,
  FIELD_OFFICER: fieldOfficerRole,
  USER: userRole,
} as const;
