import type { QueryClient } from "@tanstack/react-query";
import { farmerFamilyKeys, farmerKeys, transferKeys } from "@/lib/query/keys";

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

export function invalidateFamilyProfileQueries(
  queryClient: QueryClient,
  familyId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: farmerFamilyKeys.requisitions(familyId),
  });
  void queryClient.invalidateQueries({
    queryKey: farmerFamilyKeys.dispatches(familyId),
  });
  void queryClient.invalidateQueries({
    queryKey: farmerFamilyKeys.receivedLots(familyId),
  });
  void queryClient.invalidateQueries({
    queryKey: farmerFamilyKeys.stock(familyId),
  });
  void queryClient.invalidateQueries({
    queryKey: farmerFamilyKeys.fields(familyId),
  });
}
