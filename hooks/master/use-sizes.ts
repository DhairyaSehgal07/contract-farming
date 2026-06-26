"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSize,
  deleteSize,
  updateSize,
} from "@/app/actions/master/sizes";
import { masterKeys } from "@/lib/query/keys";
import { fetchSizes } from "@/lib/query/master-fetchers";
import { REFERENCE_DATA_STALE_TIME } from "@/lib/query/query-options";
import type {
  CreateSizeInput,
  UpdateSizeInput,
} from "@/lib/schemas/master/size";

export function useSizes() {
  return useQuery({
    queryKey: masterKeys.sizes(),
    queryFn: fetchSizes,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useCreateSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSizeInput) => {
      const result = await createSize(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.sizes() });
      toast.success("Size created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSizeInput) => {
      const result = await updateSize(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.sizes() });
      toast.success("Size updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteSize(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.sizes() });
      toast.success("Size deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
