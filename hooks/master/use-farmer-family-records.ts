"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createFarmerFamily,
  deleteFarmerFamily,
  getFarmerFamily,
  listFarmerFamilyRecords,
  updateFarmerFamily,
} from "@/app/actions/master/farmer-families";
import { farmerKeys, masterKeys, farmerFamilyKeys } from "@/lib/query/keys";
import { fetchFarmerFamilyRecords } from "@/lib/query/master-fetchers";
import {
  LIST_DATA_STALE_TIME,
  REFERENCE_DATA_STALE_TIME,
} from "@/lib/query/query-options";
import type {
  CreateFarmerFamilyInput,
  UpdateFarmerFamilyInput,
} from "@/lib/schemas/master/farmer-family-form";

export function useFarmerFamilyRecords() {
  return useQuery({
    queryKey: masterKeys.farmerFamilyRecords(),
    queryFn: fetchFarmerFamilyRecords,
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useFarmerFamilyRecord(id: string | null) {
  return useQuery({
    queryKey: masterKeys.farmerFamilyRecord(id ?? ""),
    queryFn: async () => {
      if (!id) return null;
      const result = await getFarmerFamily(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: Boolean(id),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

function invalidateFamilyQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({
    queryKey: masterKeys.farmerFamilyRecords(),
  });
  void queryClient.invalidateQueries({ queryKey: masterKeys.farmerFamilies() });
  void queryClient.invalidateQueries({ queryKey: farmerKeys.list() });
}

export function useCreateFarmerFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFarmerFamilyInput) => {
      const result = await createFarmerFamily(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      invalidateFamilyQueries(queryClient);
      toast.success("Family created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateFarmerFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateFarmerFamilyInput) => {
      const result = await updateFarmerFamily(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      invalidateFamilyQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: masterKeys.farmerFamilyRecord(data.id),
      });
      void queryClient.invalidateQueries({
        queryKey: farmerFamilyKeys.detail(data.id),
      });
      toast.success("Family updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteFarmerFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFarmerFamily(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      invalidateFamilyQueries(queryClient);
      toast.success("Family deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
