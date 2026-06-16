import { requisitionKeys } from "@/lib/query/keys";
import { fetchRequisition } from "@/lib/query/requisition-fetchers";
import { getQueryClient } from "@/lib/query/query-client";

export async function prefetchRequisition(id: string) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: requisitionKeys.detail(id),
    queryFn: () => fetchRequisition(id),
  });

  return queryClient;
}
