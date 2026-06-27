export type FarmerKind = "individual" | "family_head" | "family_member";

export function isWholeNumberAccountNumber(accountNumber: string) {
  return /^\d+$/.test(accountNumber.trim());
}

/** @deprecated Use isWholeNumberAccountNumber */
export const isFamilyHeadAccountNumber = isWholeNumberAccountNumber;

export function isValidFamilyMemberAccountNumber(
  accountNumber: string,
  familyAccountNumber: string,
) {
  const trimmed = accountNumber.trim();
  return (
    isWholeNumberAccountNumber(trimmed) &&
    trimmed !== familyAccountNumber.trim()
  );
}

export function inferFarmerKind(input: {
  familyId: string | null | undefined;
  accountNumber: string;
  familyAccountNumber: string | null | undefined;
}): FarmerKind {
  if (!input.familyId) {
    return "individual";
  }

  if (
    input.familyAccountNumber &&
    input.accountNumber === input.familyAccountNumber
  ) {
    return "family_head";
  }

  return "family_member";
}
