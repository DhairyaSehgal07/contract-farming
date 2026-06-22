import { dispatchKeys } from "@/lib/query/keys";
import { fetchDispatch } from "@/lib/query/dispatch-fetchers";
import { getQueryClient } from "@/lib/query/query-client";

export async function prefetchDispatch(id: string) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: dispatchKeys.detail(id),
    queryFn: () => fetchDispatch(id),
  });

  return queryClient;
}
