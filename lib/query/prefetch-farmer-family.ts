import {
  fetchFamilyDispatches,
  fetchFamilyFields,
  fetchFamilyReceivedLots,
  fetchFamilyRequisitions,
  fetchFamilyStock,
  fetchFarmerFamilyProfile,
} from "@/lib/query/farmer-family-fetchers";
import { farmerFamilyKeys } from "@/lib/query/keys";
import { getQueryClient } from "@/lib/query/query-client";

type FarmerFamilyDetailPermissions = {
  canReadRequisitions: boolean;
  canReadDispatches: boolean;
  canReadTransfer: boolean;
};

type PrefetchEntry = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
};

async function prefetchFamilyQueries(entries: PrefetchEntry[]) {
  const queryClient = getQueryClient();
  await Promise.all(entries.map((entry) => queryClient.prefetchQuery(entry)));
  return queryClient;
}

export async function prefetchFarmerFamilyDetail(
  id: string,
  permissions: FarmerFamilyDetailPermissions,
) {
  const entries: PrefetchEntry[] = [
    {
      queryKey: farmerFamilyKeys.detail(id),
      queryFn: () => fetchFarmerFamilyProfile(id),
    },
    {
      queryKey: farmerFamilyKeys.fields(id),
      queryFn: () => fetchFamilyFields(id),
    },
  ];

  if (permissions.canReadRequisitions) {
    entries.push({
      queryKey: farmerFamilyKeys.requisitions(id),
      queryFn: () => fetchFamilyRequisitions(id),
    });
  }

  if (permissions.canReadDispatches) {
    entries.push({
      queryKey: farmerFamilyKeys.dispatches(id),
      queryFn: () => fetchFamilyDispatches(id),
    });
    entries.push({
      queryKey: farmerFamilyKeys.receivedLots(id),
      queryFn: () => fetchFamilyReceivedLots(id),
    });
  }

  if (permissions.canReadTransfer) {
    entries.push({
      queryKey: farmerFamilyKeys.stock(id),
      queryFn: () => fetchFamilyStock(id),
    });
  }

  return prefetchFamilyQueries(entries);
}
