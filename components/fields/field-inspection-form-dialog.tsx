"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import type { FieldInspectionRow } from "@/app/actions/field/field-activities";
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
  type FieldInspectionFormInput,
  fieldInspectionFormSchema,
} from "@/lib/schemas/field/inspection";

type FieldInspectionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  title: string;
  description: string;
  initialRecord?: FieldInspectionRow | null;
  isPending?: boolean;
  onSubmit: (values: FieldInspectionFormInput) => void;
};

const emptyValues: FieldInspectionFormInput = {
  activityDate: "",
  result: "",
  remarks: "",
  imageUrl: "",
};

function toFormValues(record?: FieldInspectionRow | null): FieldInspectionFormInput {
  if (!record) return emptyValues;

  return {
    activityDate: record.activityDate,
    result: record.result ?? "",
    remarks: record.remarks ?? "",
    imageUrl: record.imageUrl ?? "",
  };
}

export function FieldInspectionFormDialog({
  open,
  onOpenChange,
  mode,
  title,
  description,
  initialRecord = null,
  isPending = false,
  onSubmit,
}: FieldInspectionFormDialogProps) {
  const form = useForm({
    defaultValues: toFormValues(initialRecord),
    validators: { onSubmit: fieldInspectionFormSchema },
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
            {mode === "create" ? `Add ${title.toLowerCase()}` : `Edit ${title.toLowerCase()}`}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            <form.Field name="activityDate">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <DatePickerInput
                      id="inspection-date"
                      label="Date"
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

            <form.Field name="result">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="inspection-result">Result</FieldLabel>
                  <Textarea
                    id="inspection-result"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="remarks">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="inspection-remarks">Remarks</FieldLabel>
                  <Textarea
                    id="inspection-remarks"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="imageUrl">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="inspection-image">Image URL</FieldLabel>
                    <Input
                      id="inspection-image"
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
