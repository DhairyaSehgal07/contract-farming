"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createFarmerField,
  deleteFarmerField,
  updateFarmerField,
} from "@/app/actions/farmer/farmer-fields";
import { invalidateFamilyProfileQueries } from "@/lib/query/invalidate-farmer-profile";
import { farmerKeys } from "@/lib/query/keys";
import type {
  CreateFarmerFieldInput,
  UpdateFarmerFieldInput,
} from "@/lib/schemas/farmer/farmer-field";

function invalidateFieldQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  familyId: string,
  farmerId: string,
) {
  invalidateFamilyProfileQueries(queryClient, familyId);
  void queryClient.invalidateQueries({
    queryKey: farmerKeys.fields(farmerId),
  });
}

export function useCreateFamilyField(familyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFarmerFieldInput) => {
      const result = await createFarmerField(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      invalidateFieldQueries(queryClient, familyId, data.farmerId);
      toast.success("Field created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateFamilyField(familyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateFarmerFieldInput) => {
      const result = await updateFarmerField(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      invalidateFieldQueries(queryClient, familyId, data.farmerId);
      toast.success("Field updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteFamilyField(familyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      farmerId,
    }: {
      id: string;
      farmerId: string;
    }) => {
      const result = await deleteFarmerField(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { farmerId };
    },
    onSuccess: ({ farmerId }) => {
      invalidateFieldQueries(queryClient, familyId, farmerId);
      toast.success("Field deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
