import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createStockTransfer } from "@/app/actions/transfer/stock-transfers";
import { transferKeys } from "@/lib/query/keys";
import { invalidateFarmerProfileQueries } from "@/lib/query/invalidate-farmer-profile";
import {
  LIST_DATA_STALE_TIME,
  REFERENCE_DATA_STALE_TIME,
} from "@/lib/query/query-options";
import {
  fetchFarmerStock,
  fetchStockTransfer,
  fetchStockTransfers,
  fetchTransferableFarmers,
  fetchTransferDestinationFarmers,
} from "@/lib/query/transfer-fetchers";
import type { CreateStockTransferInput } from "@/lib/schemas/transfer/stock-transfer";

export function useStockTransfers() {
  return useQuery({
    queryKey: transferKeys.list(),
    queryFn: fetchStockTransfers,
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useStockTransfer(id: string) {
  return useQuery({
    queryKey: transferKeys.detail(id),
    queryFn: () => fetchStockTransfer(id),
    enabled: Boolean(id),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useTransferableFarmers(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: transferKeys.transferableFarmers(),
    queryFn: fetchTransferableFarmers,
    enabled: options.enabled ?? true,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useTransferDestinationFarmers(
  excludeFarmerId: string | null,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: transferKeys.destinationFarmers(excludeFarmerId),
    queryFn: () =>
      fetchTransferDestinationFarmers(excludeFarmerId ?? undefined),
    enabled: options.enabled ?? true,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useFarmerStock(
  farmerId: string | null,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: transferKeys.farmerStock(farmerId ?? ""),
    queryFn: () => fetchFarmerStock(farmerId!),
    enabled: Boolean(farmerId) && (options.enabled ?? true),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStockTransferInput) => {
      const result = await createStockTransfer(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: transferKeys.list() });
      invalidateFarmerProfileQueries(queryClient, data.fromFarmer.id);
      invalidateFarmerProfileQueries(queryClient, data.toFarmer.id);
      void queryClient.invalidateQueries({
        queryKey: transferKeys.transferableFarmers(),
      });
      void queryClient.invalidateQueries({
        queryKey: transferKeys.destinationFarmers(null),
      });
      toast.success("Stock transferred");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
