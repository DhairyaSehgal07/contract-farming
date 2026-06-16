import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createDispatch } from "@/app/actions/dispatch/dispatches";
import {
  fetchDispatchableRequisitions,
  fetchDispatchFormOptions,
  fetchDispatches,
} from "@/lib/query/dispatch-fetchers";
import { dispatchKeys, requisitionKeys } from "@/lib/query/keys";
import type { CreateDispatchInput } from "@/lib/schemas/dispatch/dispatch";

export function useDispatches() {
  return useQuery({
    queryKey: dispatchKeys.list(),
    queryFn: fetchDispatches,
  });
}

export function useDispatchableRequisitions() {
  return useQuery({
    queryKey: dispatchKeys.dispatchableRequisitions(),
    queryFn: fetchDispatchableRequisitions,
  });
}

export function useDispatchFormOptions() {
  return useQuery({
    queryKey: dispatchKeys.formOptions(),
    queryFn: fetchDispatchFormOptions,
  });
}

export function useCreateDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDispatchInput) => {
      const result = await createDispatch(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.all });
      toast.success("Dispatch created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
