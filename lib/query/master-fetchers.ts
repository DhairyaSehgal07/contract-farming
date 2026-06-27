import {
  type FarmerFamilyOption,
  listFarmerFamilies,
} from "@/app/actions/master/farmers";
import {
  type FarmerFamilyRow,
  listFarmerFamilyRecords,
} from "@/app/actions/master/farmer-families";
import {
  type GenerationRow,
  listGenerations,
} from "@/app/actions/master/generations";
import {
  type LocalityRow,
  listLocalities,
} from "@/app/actions/master/localities";
import {
  type LocationRow,
  listLocations,
} from "@/app/actions/master/locations";
import { listSizes, type SizeRow } from "@/app/actions/master/sizes";
import { listStations, type StationRow } from "@/app/actions/master/stations";
import { listVarieties, type VarietyRow } from "@/app/actions/master/varieties";

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

export async function fetchVarieties(): Promise<VarietyRow[]> {
  return unwrap(listVarieties());
}

export async function fetchLocations(): Promise<LocationRow[]> {
  return unwrap(listLocations());
}

export async function fetchSizes(): Promise<SizeRow[]> {
  return unwrap(listSizes());
}

export async function fetchGenerations(): Promise<GenerationRow[]> {
  return unwrap(listGenerations());
}

export async function fetchStations(): Promise<StationRow[]> {
  return unwrap(listStations());
}

export async function fetchLocalities(
  stationId: string,
): Promise<LocalityRow[]> {
  return unwrap(listLocalities(stationId));
}

export async function fetchFarmerFamilies(): Promise<FarmerFamilyOption[]> {
  return unwrap(listFarmerFamilies());
}

export async function fetchFarmerFamilyRecords(): Promise<FarmerFamilyRow[]> {
  return unwrap(listFarmerFamilyRecords());
}
