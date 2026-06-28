import { dispatchKeys } from "@/lib/query/keys";
import {
  fetchDispatchableRequisitions,
  fetchDispatchFormOptions,
  fetchDispatches,
} from "@/lib/query/dispatch-fetchers";
import { getQueryClient } from "@/lib/query/query-client";

export async function prefetchDispatchList() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: dispatchKeys.list(),
      queryFn: fetchDispatches,
    }),
    queryClient.prefetchQuery({
      queryKey: dispatchKeys.formOptions(),
      queryFn: fetchDispatchFormOptions,
    }),
  ]);
  return queryClient;
}

export async function prefetchDispatchCreate() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: dispatchKeys.dispatchableRequisitions(),
      queryFn: fetchDispatchableRequisitions,
    }),
    queryClient.prefetchQuery({
      queryKey: dispatchKeys.formOptions(),
      queryFn: fetchDispatchFormOptions,
    }),
  ]);

  return queryClient;
}
