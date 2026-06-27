import { fieldKeys } from "@/lib/query/keys";
import { fetchFieldDetail } from "@/lib/query/field-fetchers";
import { getQueryClient } from "@/lib/query/query-client";

export async function prefetchFieldDetail(id: string) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: fieldKeys.detail(id),
    queryFn: () => fetchFieldDetail(id),
  });

  return queryClient;
}
