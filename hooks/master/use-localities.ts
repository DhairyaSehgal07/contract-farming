"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createLocality,
  deleteLocality,
  updateLocality,
} from "@/app/actions/master/localities";
import { masterKeys } from "@/lib/query/keys";
import { fetchLocalities } from "@/lib/query/master-fetchers";
import type {
  CreateLocalityInput,
  UpdateLocalityInput,
} from "@/lib/schemas/master/locality";

export function useLocalities(stationId: string | null) {
  return useQuery({
    queryKey: masterKeys.localities(stationId),
    queryFn: () => (stationId ? fetchLocalities(stationId) : Promise.resolve([])),
    enabled: Boolean(stationId),
  });
}

export function useCreateLocality(stationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Omit<CreateLocalityInput, "stationId"> & { stationId?: string },
    ) => {
      const result = await createLocality({
        ...input,
        stationId: input.stationId ?? stationId ?? "",
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: masterKeys.localities(stationId),
      });
      void queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success("Locality created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateLocality(stationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateLocalityInput) => {
      const result = await updateLocality(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: masterKeys.localities(stationId),
      });
      toast.success("Locality updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteLocality(stationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteLocality(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: masterKeys.localities(stationId),
      });
      void queryClient.invalidateQueries({ queryKey: masterKeys.stations() });
      toast.success("Locality deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
