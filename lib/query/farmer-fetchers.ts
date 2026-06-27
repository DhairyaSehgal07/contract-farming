import {
  listFarmerDispatches,
  listFarmerReceivedLots,
  listFarmerRequisitions,
} from "@/app/actions/farmer/farmer-profile";
import { listFarmerFields } from "@/app/actions/farmer/farmer-fields";
import {
  type FarmerRow,
  getFarmer,
  listFarmers,
} from "@/app/actions/master/farmers";

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

export async function fetchFarmers(): Promise<FarmerRow[]> {
  return unwrap(listFarmers());
}

export async function fetchFarmer(id: string): Promise<FarmerRow> {
  return unwrap(getFarmer(id));
}

export async function fetchFarmerRequisitions(farmerId: string) {
  return unwrap(listFarmerRequisitions(farmerId));
}

export async function fetchFarmerDispatches(farmerId: string) {
  return unwrap(listFarmerDispatches(farmerId));
}

export async function fetchFarmerReceivedLots(farmerId: string) {
  return unwrap(listFarmerReceivedLots(farmerId));
}

export async function fetchFarmerFields(farmerId: string) {
  return unwrap(listFarmerFields(farmerId));
}
