import { masterKeys } from "@/lib/query/keys";
import {
  fetchFarmerFamilies,
  fetchFarmerFamilyRecords,
  fetchGenerations,
  fetchLocalities,
  fetchLocations,
  fetchSizes,
  fetchStations,
  fetchVarieties,
} from "@/lib/query/master-fetchers";
import { getQueryClient } from "@/lib/query/query-client";

type PrefetchEntry = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
};

export async function prefetchMasterQueries(entries: PrefetchEntry[]) {
  const queryClient = getQueryClient();
  await Promise.all(entries.map((entry) => queryClient.prefetchQuery(entry)));
  return queryClient;
}

export async function prefetchVarieties() {
  return prefetchMasterQueries([
    { queryKey: masterKeys.varieties(), queryFn: fetchVarieties },
  ]);
}

export async function prefetchSizes() {
  return prefetchMasterQueries([
    { queryKey: masterKeys.sizes(), queryFn: fetchSizes },
  ]);
}

export async function prefetchGenerations() {
  return prefetchMasterQueries([
    { queryKey: masterKeys.generations(), queryFn: fetchGenerations },
  ]);
}

export async function prefetchStations() {
  return prefetchMasterQueries([
    { queryKey: masterKeys.stations(), queryFn: fetchStations },
  ]);
}

export async function prefetchLocalities(stationId: string) {
  return prefetchMasterQueries([
    {
      queryKey: masterKeys.localities(stationId),
      queryFn: () => fetchLocalities(stationId),
    },
  ]);
}

export async function prefetchFarmerFamilies() {
  return prefetchMasterQueries([
    {
      queryKey: masterKeys.farmerFamilyRecords(),
      queryFn: fetchFarmerFamilyRecords,
    },
    { queryKey: masterKeys.stations(), queryFn: fetchStations },
  ]);
}

export async function prefetchLocations() {
  return prefetchMasterQueries([
    { queryKey: masterKeys.locations(), queryFn: fetchLocations },
  ]);
}
