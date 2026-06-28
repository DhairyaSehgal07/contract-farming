import {
  getFarmerFamilyProfile,
  listFamilyDispatches,
  listFamilyFields,
  listFamilyReceivedLots,
  listFamilyRequisitions,
  listFamilyStock,
} from "@/app/actions/farmer/farmer-family-profile";

async function unwrap<T>(
  promise: Promise<
    { success: true; data: T } | { success: false; error: string }
  >,
) {
  const result = await promise;
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

export async function fetchFarmerFamilyProfile(id: string) {
  return unwrap(getFarmerFamilyProfile(id));
}

export async function fetchFamilyRequisitions(familyId: string) {
  return unwrap(listFamilyRequisitions(familyId));
}

export async function fetchFamilyDispatches(familyId: string) {
  return unwrap(listFamilyDispatches(familyId));
}

export async function fetchFamilyReceivedLots(familyId: string) {
  return unwrap(listFamilyReceivedLots(familyId));
}

export async function fetchFamilyStock(familyId: string) {
  return unwrap(listFamilyStock(familyId));
}

export async function fetchFamilyFields(familyId: string) {
  return unwrap(listFamilyFields(familyId));
}
