import {
  fetchFarmer,
  fetchFarmerDispatches,
  fetchFarmerFields,
  fetchFarmerReceivedLots,
  fetchFarmerRequisitions,
  fetchFarmers,
} from "@/lib/query/farmer-fetchers";
import { farmerKeys, masterKeys, transferKeys } from "@/lib/query/keys";
import { fetchFarmerFamilies, fetchStations } from "@/lib/query/master-fetchers";
import { getQueryClient } from "@/lib/query/query-client";
import { fetchFarmerStock } from "@/lib/query/transfer-fetchers";

type FarmerDetailPermissions = {
  canReadRequisitions: boolean;
  canReadDispatches: boolean;
  canReadTransfer: boolean;
};

type PrefetchEntry = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
};

async function prefetchFarmerQueries(entries: PrefetchEntry[]) {
  const queryClient = getQueryClient();
  await Promise.all(entries.map((entry) => queryClient.prefetchQuery(entry)));
  return queryClient;
}

export async function prefetchFarmers() {
  return prefetchFarmerQueries([
    { queryKey: farmerKeys.list(), queryFn: fetchFarmers },
    { queryKey: masterKeys.stations(), queryFn: fetchStations },
    { queryKey: masterKeys.farmerFamilies(), queryFn: fetchFarmerFamilies },
  ]);
}

export async function prefetchFarmerDetail(
  id: string,
  permissions: FarmerDetailPermissions,
) {
  const entries: PrefetchEntry[] = [
    { queryKey: farmerKeys.detail(id), queryFn: () => fetchFarmer(id) },
    {
      queryKey: farmerKeys.fields(id),
      queryFn: () => fetchFarmerFields(id),
    },
  ];

  if (permissions.canReadRequisitions) {
    entries.push({
      queryKey: farmerKeys.requisitions(id),
      queryFn: () => fetchFarmerRequisitions(id),
    });
  }

  if (permissions.canReadDispatches) {
    entries.push({
      queryKey: farmerKeys.dispatches(id),
      queryFn: () => fetchFarmerDispatches(id),
    });
    entries.push({
      queryKey: farmerKeys.receivedLots(id),
      queryFn: () => fetchFarmerReceivedLots(id),
    });
  }

  if (permissions.canReadTransfer) {
    entries.push({
      queryKey: transferKeys.farmerStock(id),
      queryFn: () => fetchFarmerStock(id),
    });
  }

  return prefetchFarmerQueries(entries);
}
