import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  confirmLotReceipt,
  createDispatch,
  deleteDispatch,
  sendLotReceiptOtp,
  updateDispatchStep2,
} from "@/app/actions/dispatch/dispatches";
import {
  fetchDispatch,
  fetchDispatchableRequisitions,
  fetchDispatchFormOptions,
  fetchDispatches,
} from "@/lib/query/dispatch-fetchers";
import { dispatchKeys, farmerKeys, requisitionKeys, transferKeys } from "@/lib/query/keys";
import { invalidateFarmerProfileQueries } from "@/lib/query/invalidate-farmer-profile";
import {
  LIST_DATA_STALE_TIME,
  REFERENCE_DATA_STALE_TIME,
} from "@/lib/query/query-options";
import type {
  ConfirmLotReceiptInput,
  CreateDispatchInput,
  SendLotReceiptOtpInput,
  UpdateDispatchStep2Input,
} from "@/lib/schemas/dispatch/dispatch";

export function useDispatches() {
  return useQuery({
    queryKey: dispatchKeys.list(),
    queryFn: fetchDispatches,
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useDispatch(id: string) {
  return useQuery({
    queryKey: dispatchKeys.detail(id),
    queryFn: () => fetchDispatch(id),
    enabled: Boolean(id),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

type DispatchableRequisitionsOptions = {
  enabled?: boolean;
};

export function useDispatchableRequisitions(
  options: DispatchableRequisitionsOptions = {},
) {
  return useQuery({
    queryKey: dispatchKeys.dispatchableRequisitions(),
    queryFn: fetchDispatchableRequisitions,
    enabled: options.enabled ?? true,
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useDispatchFormOptions(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: dispatchKeys.formOptions(),
    queryFn: fetchDispatchFormOptions,
    enabled: options.enabled ?? true,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useCreateDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDispatchInput) => {
      const result = await createDispatch(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dispatchKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: dispatchKeys.dispatchableRequisitions(),
      });
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.list() });
      void queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success("Dispatch created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateDispatchStep2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDispatchStep2Input) => {
      const result = await updateDispatchStep2(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dispatchKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: dispatchKeys.dispatchableRequisitions(),
      });
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.list() });
      void queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success("Dispatch updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteDispatch(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dispatchKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: dispatchKeys.dispatchableRequisitions(),
      });
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.list() });
      void queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success("Dispatch deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSendLotReceiptOtp() {
  return useMutation({
    mutationFn: async (input: SendLotReceiptOtpInput) => {
      const result = await sendLotReceiptOtp(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(`OTP sent to ${data.mobileNumber}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useConfirmLotReceipt(dispatchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ConfirmLotReceiptInput) => {
      const result = await confirmLotReceipt(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, input) => {
      queryClient.setQueryData(dispatchKeys.detail(dispatchId), data);
      void queryClient.invalidateQueries({ queryKey: dispatchKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: dispatchKeys.dispatchableRequisitions(),
      });
      void queryClient.invalidateQueries({ queryKey: requisitionKeys.list() });

      const receivedLot = data.requisitions.find(
        (lot) => lot.id === input.lotId,
      );
      if (receivedLot) {
        invalidateFarmerProfileQueries(queryClient, receivedLot.farmer.id);
        void queryClient.invalidateQueries({
          queryKey: transferKeys.transferableFarmers(),
        });
      }

      toast.success("Lot received");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
