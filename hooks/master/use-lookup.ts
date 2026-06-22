"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LookupConfig } from "@/components/master/lookup/lookup-types";
import {
  fetchGenerations,
  fetchVarieties,
} from "@/lib/query/master-fetchers";
import type {
  CreateLookupInput,
  UpdateLookupInput,
} from "@/lib/schemas/master/lookup";

const lookupFetchers = {
  variety: fetchVarieties,
  generation: fetchGenerations,
} as const;

export function useLookupList(config: LookupConfig) {
  return useQuery({
    queryKey: config.queryKey,
    queryFn: lookupFetchers[config.entity],
  });
}

export function useCreateLookup(config: LookupConfig) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLookupInput) => {
      const result = await config.create(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success(
        `${config.singularLabel.charAt(0).toUpperCase()}${config.singularLabel.slice(1)} created`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateLookup(config: LookupConfig) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateLookupInput) => {
      const result = await config.update(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success(
        `${config.singularLabel.charAt(0).toUpperCase()}${config.singularLabel.slice(1)} updated`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteLookup(config: LookupConfig) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await config.remove(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success(
        `${config.singularLabel.charAt(0).toUpperCase()}${config.singularLabel.slice(1)} deleted`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
