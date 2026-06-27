"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createFarmerField,
  deleteFarmerField,
  updateFarmerField,
} from "@/app/actions/farmer/farmer-fields";
import { fetchFarmerFields } from "@/lib/query/farmer-fetchers";
import { farmerKeys } from "@/lib/query/keys";
import { LIST_DATA_STALE_TIME } from "@/lib/query/query-options";
import type {
  CreateFarmerFieldInput,
  UpdateFarmerFieldInput,
} from "@/lib/schemas/farmer/farmer-field";

export function useFarmerFields(
  farmerId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: farmerKeys.fields(farmerId),
    queryFn: () => fetchFarmerFields(farmerId),
    enabled: options?.enabled ?? Boolean(farmerId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useCreateFarmerField(farmerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<CreateFarmerFieldInput, "farmerId">) => {
      const result = await createFarmerField({ ...input, farmerId });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: farmerKeys.fields(farmerId),
      });
      toast.success("Field created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateFarmerField(farmerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateFarmerFieldInput) => {
      const result = await updateFarmerField(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: farmerKeys.fields(farmerId),
      });
      toast.success("Field updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteFarmerField(farmerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFarmerField(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: farmerKeys.fields(farmerId),
      });
      toast.success("Field deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
