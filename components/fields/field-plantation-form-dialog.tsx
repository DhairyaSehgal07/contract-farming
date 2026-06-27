"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo } from "react";
import type { FieldPlantationRow } from "@/app/actions/field/field-activities";
import { DatePickerInput } from "@/components/date-picker";
import {
  type ComboboxOption,
  SearchableComboboxField,
} from "@/components/searchable-combobox-option";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRequisitionVarieties } from "@/hooks/requisition/use-requisitions";
import { useSizes } from "@/hooks/master/use-sizes";
import { parseDateOnly } from "@/lib/date";
import {
  type FieldPlantationFormInput,
  fieldPlantationFormSchema,
} from "@/lib/schemas/field/plantation";

type FieldPlantationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialRecord?: FieldPlantationRow | null;
  isPending?: boolean;
  onSubmit: (values: FieldPlantationFormInput) => void;
};

const emptyValues: FieldPlantationFormInput = {
  varietyId: "",
  sizeId: "",
  plantedAt: "",
  bagCount: "",
  acresPlanted: "",
  imageUrl: "",
  remarks: "",
};

function toFormValues(record?: FieldPlantationRow | null): FieldPlantationFormInput {
  if (!record) return emptyValues;

  return {
    varietyId: record.varietyId,
    sizeId: record.sizeId,
    plantedAt: record.plantedAt,
    bagCount: record.bagCount,
    acresPlanted: record.acresPlanted,
    imageUrl: record.imageUrl ?? "",
    remarks: record.remarks ?? "",
  };
}

export function FieldPlantationFormDialog({
  open,
  onOpenChange,
  mode,
  initialRecord = null,
  isPending = false,
  onSubmit,
}: FieldPlantationFormDialogProps) {
  const { data: varieties = [] } = useRequisitionVarieties({ enabled: open });
  const { data: sizes = [] } = useSizes();

  const varietyOptions = useMemo<ComboboxOption[]>(
    () => varieties.map((variety) => ({ id: variety.id, label: variety.name })),
    [varieties],
  );

  const sizeOptions = useMemo<ComboboxOption[]>(
    () => sizes.map((size) => ({ id: size.id, label: size.name })),
    [sizes],
  );

  const form = useForm({
    defaultValues: toFormValues(initialRecord),
    validators: { onSubmit: fieldPlantationFormSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(toFormValues(initialRecord));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when dialog opens
  }, [open, initialRecord, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add plantation" : "Edit plantation"}
          </DialogTitle>
          <DialogDescription>
            Record plantation details for this field.
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="plantedAt">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <DatePickerInput
                      id="plantation-date"
                      label="Plantation date"
                      value={
                        field.state.value
                          ? parseDateOnly(field.state.value)
                          : undefined
                      }
                      onDateChange={field.handleChange}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                      required
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="varietyId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="plantation-variety">Variety</FieldLabel>
                    <SearchableComboboxField
                      id="plantation-variety"
                      name={field.name}
                      placeholder="Select variety"
                      emptyMessage="No varieties found."
                      options={varietyOptions}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      isInvalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="sizeId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="plantation-size">Size</FieldLabel>
                    <SearchableComboboxField
                      id="plantation-size"
                      name={field.name}
                      placeholder="Select size"
                      emptyMessage="No sizes found."
                      options={sizeOptions}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      onBlur={field.handleBlur}
                      isInvalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="bagCount">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="plantation-bags">No. of bags</FieldLabel>
                    <Input
                      id="plantation-bags"
                      inputMode="decimal"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="acresPlanted">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="plantation-acres">Acres planted</FieldLabel>
                    <Input
                      id="plantation-acres"
                      inputMode="decimal"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="imageUrl">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="plantation-image">Image URL</FieldLabel>
                    <Input
                      id="plantation-image"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="https://..."
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="remarks">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="plantation-remarks">Remarks</FieldLabel>
                  <Textarea
                    id="plantation-remarks"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isPending}>
                  {isPending
                    ? "Saving…"
                    : mode === "create"
                      ? "Create"
                      : "Save changes"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
