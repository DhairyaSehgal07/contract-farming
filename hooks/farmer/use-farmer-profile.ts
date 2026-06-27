"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchFarmerDispatches,
  fetchFarmerReceivedLots,
  fetchFarmerRequisitions,
} from "@/lib/query/farmer-fetchers";
import { farmerKeys } from "@/lib/query/keys";
import { LIST_DATA_STALE_TIME } from "@/lib/query/query-options";

export function useFarmerRequisitions(
  farmerId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerKeys.requisitions(farmerId),
    queryFn: () => fetchFarmerRequisitions(farmerId),
    enabled: options?.enabled ?? Boolean(farmerId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFarmerDispatches(
  farmerId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerKeys.dispatches(farmerId),
    queryFn: () => fetchFarmerDispatches(farmerId),
    enabled: options?.enabled ?? Boolean(farmerId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFarmerReceivedLots(
  farmerId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerKeys.receivedLots(farmerId),
    queryFn: () => fetchFarmerReceivedLots(farmerId),
    enabled: options?.enabled ?? Boolean(farmerId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}
