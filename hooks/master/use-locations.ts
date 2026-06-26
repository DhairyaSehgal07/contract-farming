"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createLocation,
  deleteLocation,
  updateLocation,
} from "@/app/actions/master/locations";
import { masterKeys } from "@/lib/query/keys";
import { fetchLocations } from "@/lib/query/master-fetchers";
import { REFERENCE_DATA_STALE_TIME } from "@/lib/query/query-options";
import type {
  CreateLocationInput,
  UpdateLocationInput,
} from "@/lib/schemas/master/location";

export function useLocations() {
  return useQuery({
    queryKey: masterKeys.locations(),
    queryFn: fetchLocations,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLocationInput) => {
      const result = await createLocation(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.locations() });
      toast.success("Location created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateLocationInput) => {
      const result = await updateLocation(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.locations() });
      toast.success("Location updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteLocation(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.locations() });
      toast.success("Location deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
