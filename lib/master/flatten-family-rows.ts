import type { FarmerFamilyRow } from "@/app/actions/master/farmer-families";

export type FamilyTableRow = {
  familyId: string;
  accountNumber: string;
  name: string;
  station: { name: string };
  locality: { name: string };
  memberCount: number;
  memberId: string | null;
  memberName: string | null;
  memberAccountNumber: string | null;
  family: FarmerFamilyRow;
};

export function flattenFamilyRows(families: FarmerFamilyRow[]): FamilyTableRow[] {
  const rows: FamilyTableRow[] = [];

  for (const family of families) {
    if (family.members.length === 0) {
      rows.push({
        familyId: family.id,
        accountNumber: family.accountNumber,
        name: family.name,
        station: family.station,
        locality: family.locality,
        memberCount: family._count.members,
        memberId: null,
        memberName: null,
        memberAccountNumber: null,
        family,
      });
      continue;
    }

    for (const member of family.members) {
      rows.push({
        familyId: family.id,
        accountNumber: family.accountNumber,
        name: family.name,
        station: family.station,
        locality: family.locality,
        memberCount: family._count.members,
        memberId: member.id,
        memberName: member.name,
        memberAccountNumber: member.accountNumber,
        family,
      });
    }
  }

  return rows;
}
