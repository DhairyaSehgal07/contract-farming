import { transferKeys } from "@/lib/query/keys";
import {
  fetchStockTransfer,
  fetchStockTransfers,
  fetchTransferableFarmers,
  fetchTransferDestinationFarmers,
} from "@/lib/query/transfer-fetchers";
import { getQueryClient } from "@/lib/query/query-client";

export async function prefetchTransferList() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: transferKeys.list(),
    queryFn: fetchStockTransfers,
  });
  return queryClient;
}

export async function prefetchTransferCreate() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: transferKeys.transferableFarmers(),
      queryFn: fetchTransferableFarmers,
    }),
    queryClient.prefetchQuery({
      queryKey: transferKeys.destinationFarmers(null),
      queryFn: () => fetchTransferDestinationFarmers(),
    }),
  ]);

  return queryClient;
}

export async function prefetchTransfer(id: string) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: transferKeys.detail(id),
    queryFn: () => fetchStockTransfer(id),
  });
  return queryClient;
}
