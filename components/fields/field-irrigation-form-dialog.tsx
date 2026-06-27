"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import type { FieldIrrigationRow } from "@/app/actions/field/field-activities";
import { DatePickerInput } from "@/components/date-picker";
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
import { parseDateOnly } from "@/lib/date";
import {
  type FieldIrrigationFormInput,
  fieldIrrigationFormSchema,
} from "@/lib/schemas/field/irrigation";

type FieldIrrigationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialRecord?: FieldIrrigationRow | null;
  isPending?: boolean;
  onSubmit: (values: FieldIrrigationFormInput) => void;
};

const emptyValues: FieldIrrigationFormInput = {
  irrigatedAt: "",
  cycleNumber: 1,
  imageUrl: "",
  remarks: "",
};

function toFormValues(record?: FieldIrrigationRow | null): FieldIrrigationFormInput {
  if (!record) return emptyValues;

  return {
    irrigatedAt: record.irrigatedAt,
    cycleNumber: record.cycleNumber,
    imageUrl: record.imageUrl ?? "",
    remarks: record.remarks ?? "",
  };
}

export function FieldIrrigationFormDialog({
  open,
  onOpenChange,
  mode,
  initialRecord = null,
  isPending = false,
  onSubmit,
}: FieldIrrigationFormDialogProps) {
  const form = useForm({
    defaultValues: toFormValues(initialRecord),
    validators: { onSubmit: fieldIrrigationFormSchema },
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
            {mode === "create" ? "Add irrigation" : "Edit irrigation"}
          </DialogTitle>
          <DialogDescription>
            Record an irrigation cycle for this field.
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
            <form.Field name="irrigatedAt">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <DatePickerInput
                      id="irrigation-date"
                      label="Irrigation date"
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

            <form.Field name="cycleNumber">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="irrigation-cycle">Cycle number</FieldLabel>
                    <Input
                      id="irrigation-cycle"
                      type="number"
                      min={1}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(Number.parseInt(event.target.value, 10) || 0)
                      }
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
                    <FieldLabel htmlFor="irrigation-image">Image URL</FieldLabel>
                    <Input
                      id="irrigation-image"
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
                  <FieldLabel htmlFor="irrigation-remarks">Remarks</FieldLabel>
                  <Textarea
                    id="irrigation-remarks"
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
