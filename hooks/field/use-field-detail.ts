"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createFieldDehaulming,
  createFieldHarvest,
  createFieldIrrigation,
  createFieldPlantation,
  createFieldRouging,
  createFieldStripTest,
  deleteFieldDehaulming,
  deleteFieldHarvest,
  deleteFieldIrrigation,
  deleteFieldPlantation,
  deleteFieldRouging,
  deleteFieldStripTest,
  updateFieldDehaulming,
  updateFieldHarvest,
  updateFieldIrrigation,
  updateFieldPlantation,
  updateFieldRouging,
  updateFieldStripTest,
} from "@/app/actions/field/field-activities";
import { fetchFieldDetail } from "@/lib/query/field-fetchers";
import { fieldKeys } from "@/lib/query/keys";
import { LIST_DATA_STALE_TIME } from "@/lib/query/query-options";
import type {
  CreateFieldDehaulmingInput,
  CreateFieldHarvestInput,
  CreateFieldRougingInput,
  CreateFieldStripTestInput,
  UpdateFieldDehaulmingInput,
  UpdateFieldHarvestInput,
  UpdateFieldRougingInput,
  UpdateFieldStripTestInput,
} from "@/lib/schemas/field/inspection";
import type {
  CreateFieldIrrigationInput,
  UpdateFieldIrrigationInput,
} from "@/lib/schemas/field/irrigation";
import type {
  CreateFieldPlantationInput,
  UpdateFieldPlantationInput,
} from "@/lib/schemas/field/plantation";

function useInvalidateFieldDetail(fieldId: string) {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: fieldKeys.detail(fieldId),
    });
  };
}

export function useFieldDetail(fieldId: string) {
  return useQuery({
    queryKey: fieldKeys.detail(fieldId),
    queryFn: () => fetchFieldDetail(fieldId),
    enabled: Boolean(fieldId),
    staleTime: LIST_DATA_STALE_TIME,
  });
}

export function useCreateFieldPlantation(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: Omit<CreateFieldPlantationInput, "fieldId">) => {
      const result = await createFieldPlantation({ ...input, fieldId });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Plantation recorded");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateFieldPlantation(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: UpdateFieldPlantationInput) => {
      const result = await updateFieldPlantation(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Plantation updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteFieldPlantation(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFieldPlantation(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Plantation deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateFieldIrrigation(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: Omit<CreateFieldIrrigationInput, "fieldId">) => {
      const result = await createFieldIrrigation({ ...input, fieldId });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Irrigation recorded");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateFieldIrrigation(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: UpdateFieldIrrigationInput) => {
      const result = await updateFieldIrrigation(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Irrigation updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteFieldIrrigation(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFieldIrrigation(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Irrigation deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateFieldDehaulming(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: Omit<CreateFieldDehaulmingInput, "fieldId">) => {
      const result = await createFieldDehaulming({ ...input, fieldId });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Dehaulming recorded");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateFieldDehaulming(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: UpdateFieldDehaulmingInput) => {
      const result = await updateFieldDehaulming(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Dehaulming updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteFieldDehaulming(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFieldDehaulming(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Dehaulming deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateFieldRouging(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: Omit<CreateFieldRougingInput, "fieldId">) => {
      const result = await createFieldRouging({ ...input, fieldId });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Rouging recorded");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateFieldRouging(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: UpdateFieldRougingInput) => {
      const result = await updateFieldRouging(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Rouging updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteFieldRouging(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFieldRouging(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Rouging deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateFieldStripTest(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: Omit<CreateFieldStripTestInput, "fieldId">) => {
      const result = await createFieldStripTest({ ...input, fieldId });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Strip test recorded");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateFieldStripTest(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: UpdateFieldStripTestInput) => {
      const result = await updateFieldStripTest(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Strip test updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteFieldStripTest(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFieldStripTest(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Strip test deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateFieldHarvest(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: Omit<CreateFieldHarvestInput, "fieldId">) => {
      const result = await createFieldHarvest({ ...input, fieldId });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Harvest recorded");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateFieldHarvest(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (input: UpdateFieldHarvestInput) => {
      const result = await updateFieldHarvest(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Harvest updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteFieldHarvest(fieldId: string) {
  const invalidate = useInvalidateFieldDetail(fieldId);

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFieldHarvest(id);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Harvest deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
