"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createStation,
  deleteStation,
  updateStation,
} from "@/app/actions/master/stations";
import { masterKeys } from "@/lib/query/keys";
import { fetchStations } from "@/lib/query/master-fetchers";
import { REFERENCE_DATA_STALE_TIME } from "@/lib/query/query-options";
import type {
  CreateStationInput,
  UpdateStationInput,
} from "@/lib/schemas/master/station";

export function useStations(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: masterKeys.stations(),
    queryFn: fetchStations,
    enabled: options.enabled ?? true,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useCreateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStationInput) => {
      const result = await createStation(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success("Station created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateStationInput) => {
      const result = await updateStation(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success("Station updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteStation(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success("Station deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
