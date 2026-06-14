"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  approveRequisition,
  createRequisition,
  deleteRequisition,
  rejectRequisition,
  updateRequisition,
} from "@/app/actions/requisition/requisitions";
import { requisitionKeys } from "@/lib/query/keys";
import {
  fetchRequisitionFarmers,
  fetchRequisitions,
  fetchRequisitionVarieties,
} from "@/lib/query/requisition-fetchers";
import type {
  CreateRequisitionInput,
  RejectRequisitionInput,
  UpdateRequisitionInput,
} from "@/lib/schemas/requisition/requisition";

export function useRequisitions() {
  return useQuery({
    queryKey: requisitionKeys.list(),
    queryFn: fetchRequisitions,
  });
}

export function useRequisitionFarmers() {
  return useQuery({
    queryKey: requisitionKeys.farmers(),
    queryFn: fetchRequisitionFarmers,
  });
}

export function useRequisitionVarieties() {
  return useQuery({
    queryKey: requisitionKeys.varieties(),
    queryFn: fetchRequisitionVarieties,
  });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRequisitionInput) => {
      const result = await createRequisition(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.list() });
      toast.success("Requisition created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateRequisitionInput) => {
      const result = await updateRequisition(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.list() });
      toast.success("Requisition updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteRequisition(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.list() });
      toast.success("Requisition deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useApproveRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await approveRequisition(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.list() });
      toast.success("Requisition approved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRejectRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RejectRequisitionInput) => {
      const result = await rejectRequisition(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.list() });
      toast.success("Requisition rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
