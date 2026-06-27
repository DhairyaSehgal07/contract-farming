import type { QueryClient } from "@tanstack/react-query";
import { farmerKeys, transferKeys } from "@/lib/query/keys";

export function invalidateFarmerProfileQueries(
  queryClient: QueryClient,
  farmerId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: farmerKeys.requisitions(farmerId),
  });
  void queryClient.invalidateQueries({
    queryKey: farmerKeys.dispatches(farmerId),
  });
  void queryClient.invalidateQueries({
    queryKey: farmerKeys.receivedLots(farmerId),
  });
  void queryClient.invalidateQueries({
    queryKey: transferKeys.farmerStock(farmerId),
  });
}
