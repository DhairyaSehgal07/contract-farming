"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createFarmer,
  deleteFarmer,
  getFarmer,
  updateFarmer,
} from "@/app/actions/master/farmers";
import { masterKeys } from "@/lib/query/keys";
import { fetchFarmers } from "@/lib/query/master-fetchers";
import {
  LIST_DATA_STALE_TIME,
  REFERENCE_DATA_STALE_TIME,
} from "@/lib/query/query-options";
import type {
  CreateFarmerInput,
  UpdateFarmerInput,
} from "@/lib/schemas/master/farmer";

export function useFarmers() {
  return useQuery({
    queryKey: masterKeys.farmers(),
    queryFn: fetchFarmers,
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFarmer(id: string | null) {
  return useQuery({
    queryKey: masterKeys.farmer(id ?? ""),
    queryFn: async () => {
      if (!id) return null;
      const result = await getFarmer(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFarmerInput) => {
      const result = await createFarmer(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.farmers() });
      toast.success("Farmer created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateFarmerInput) => {
      const result = await updateFarmer(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.farmers() });
      void queryClient.invalidateQueries({
        queryKey: masterKeys.farmer(data.id),
      });
      toast.success("Farmer updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFarmer(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.farmers() });
      toast.success("Farmer deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
