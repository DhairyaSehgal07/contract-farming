"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchFamilyDispatches,
  fetchFamilyFields,
  fetchFamilyReceivedLots,
  fetchFamilyRequisitions,
  fetchFamilyStock,
  fetchFarmerFamilyProfile,
} from "@/lib/query/farmer-family-fetchers";
import { farmerFamilyKeys } from "@/lib/query/keys";
import { LIST_DATA_STALE_TIME } from "@/lib/query/query-options";

export function useFarmerFamilyProfile(
  familyId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerFamilyKeys.detail(familyId),
    queryFn: () => fetchFarmerFamilyProfile(familyId),
    enabled: options?.enabled ?? Boolean(familyId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFamilyRequisitions(
  familyId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerFamilyKeys.requisitions(familyId),
    queryFn: () => fetchFamilyRequisitions(familyId),
    enabled: options?.enabled ?? Boolean(familyId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFamilyDispatches(
  familyId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerFamilyKeys.dispatches(familyId),
    queryFn: () => fetchFamilyDispatches(familyId),
    enabled: options?.enabled ?? Boolean(familyId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFamilyReceivedLots(
  familyId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerFamilyKeys.receivedLots(familyId),
    queryFn: () => fetchFamilyReceivedLots(familyId),
    enabled: options?.enabled ?? Boolean(familyId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFamilyStock(
  familyId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerFamilyKeys.stock(familyId),
    queryFn: () => fetchFamilyStock(familyId),
    enabled: options?.enabled ?? Boolean(familyId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFamilyFields(
  familyId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerFamilyKeys.fields(familyId),
    queryFn: () => fetchFamilyFields(familyId),
    enabled: options?.enabled ?? Boolean(familyId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}
