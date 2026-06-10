import { masterKeys } from "@/lib/query/keys";
import {
  fetchFarmers,
  fetchGenerations,
  fetchLocalities,
  fetchSizes,
  fetchStations,
  fetchVarieties,
} from "@/lib/query/master-fetchers";
import { getQueryClient } from "@/lib/query/query-client";

export async function prefetchVarieties() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: masterKeys.varieties(),
    queryFn: fetchVarieties,
  });
  return queryClient;
}

export async function prefetchSizes() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: masterKeys.sizes(),
    queryFn: fetchSizes,
  });
  return queryClient;
}

export async function prefetchGenerations() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: masterKeys.generations(),
    queryFn: fetchGenerations,
  });
  return queryClient;
}

export async function prefetchStations() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: masterKeys.stations(),
    queryFn: fetchStations,
  });
  return queryClient;
}

export async function prefetchLocalities(stationId: string) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: masterKeys.localities(stationId),
    queryFn: () => fetchLocalities(stationId),
  });
  return queryClient;
}

export async function prefetchFarmers() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: masterKeys.farmers(),
    queryFn: fetchFarmers,
  });
  return queryClient;
}
