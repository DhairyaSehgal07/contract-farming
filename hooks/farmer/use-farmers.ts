"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createFarmer,
  deleteFarmer,
  updateFarmer,
} from "@/app/actions/master/farmers";
import { farmerKeys, masterKeys } from "@/lib/query/keys";
import { fetchFarmer, fetchFarmers } from "@/lib/query/farmer-fetchers";
import { fetchFarmerFamilies } from "@/lib/query/master-fetchers";
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
    queryKey: farmerKeys.list(),
    queryFn: fetchFarmers,
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFarmerFamilies(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: masterKeys.farmerFamilies(),
    queryFn: fetchFarmerFamilies,
    staleTime: REFERENCE_DATA_STALE_TIME,
    enabled: options?.enabled ?? true,
  });
}

export function useFarmer(id: string | null) {
  return useQuery({
    queryKey: farmerKeys.detail(id ?? ""),
    queryFn: () => {
      if (!id) {
        throw new Error("Farmer is required.");
      }
      return fetchFarmer(id);
    },
    enabled: Boolean(id),
    staleTime: LIST_DATA_STALE_TIME,
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
      void queryClient.invalidateQueries({ queryKey: farmerKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: masterKeys.farmerFamilies(),
      });
      void queryClient.invalidateQueries({
        queryKey: masterKeys.farmerFamilyRecords(),
      });
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
      void queryClient.invalidateQueries({ queryKey: farmerKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: masterKeys.farmerFamilies(),
      });
      void queryClient.invalidateQueries({
        queryKey: masterKeys.farmerFamilyRecords(),
      });
      void queryClient.invalidateQueries({
        queryKey: farmerKeys.detail(data.id),
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
      void queryClient.invalidateQueries({ queryKey: farmerKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: masterKeys.farmerFamilies(),
      });
      void queryClient.invalidateQueries({
        queryKey: masterKeys.farmerFamilyRecords(),
      });
      toast.success("Farmer deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
