"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useRef } from "react";
import type { RequisitionRow } from "@/app/actions/requisition/requisitions";
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
import {
  useRequisitionFarmers,
  useRequisitionVarieties,
} from "@/hooks/requisition/use-requisitions";
import { parseDateOnly } from "@/lib/date";
import {
  type RequisitionFormInput,
  requisitionFormSchema,
} from "@/lib/schemas/requisition/requisition";

type RequisitionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialRequisition?: RequisitionRow | null;
  isPending?: boolean;
  onSubmit: (values: RequisitionFormInput) => void;
};

const emptyValues: RequisitionFormInput = {
  farmerId: "",
  varietyId: "",
  requisitionDate: "",
  expectedDeliveryDate: "",
  acres: "",
  quantity: "",
};

function toFormValues(
  requisition?: RequisitionRow | null,
): RequisitionFormInput {
  if (!requisition) return emptyValues;

  return {
    farmerId: requisition.farmerId,
    varietyId: requisition.varietyId,
    requisitionDate: requisition.requisitionDate,
    expectedDeliveryDate: requisition.expectedDeliveryDate,
    acres: requisition.acres ?? "",
    quantity: requisition.quantity ?? "",
  };
}

export function RequisitionFormDialog({
  open,
  onOpenChange,
  mode,
  initialRequisition = null,
  isPending = false,
  onSubmit,
}: RequisitionFormDialogProps) {
  const { data: farmers = [] } = useRequisitionFarmers();
  const { data: varieties = [] } = useRequisitionVarieties();

  const farmerOptions = useMemo<ComboboxOption[]>(
    () =>
      farmers.map((farmer) => ({
        id: farmer.id,
        label: `${farmer.name} (Account #${farmer.accountNumber})`,
        name: farmer.name,
        accountNumber: farmer.accountNumber,
      })),
    [farmers],
  );

  const varietyOptions = useMemo<ComboboxOption[]>(
    () =>
      varieties.map((variety) => ({
        id: variety.id,
        label: variety.name,
      })),
    [varieties],
  );

  const portalContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    defaultValues: toFormValues(initialRequisition),
    validators: { onSubmit: requisitionFormSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(toFormValues(initialRequisition));
  }, [open, initialRequisition?.id, form, initialRequisition]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div ref={portalContainerRef} className="relative flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add requisition" : "Edit requisition"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new seed requisition."
                : "Update requisition details."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="farmerId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="requisition-farmer">
                        Farmer
                      </FieldLabel>
                      <SearchableComboboxField
                        id="requisition-farmer"
                        name={field.name}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        onBlur={field.handleBlur}
                        isInvalid={isInvalid}
                        placeholder="Search farmers…"
                        emptyMessage="No farmers found."
                        options={farmerOptions}
                        portalContainer={portalContainerRef}
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
                      <FieldLabel htmlFor="requisition-variety">
                        Variety
                      </FieldLabel>
                      <SearchableComboboxField
                        id="requisition-variety"
                        name={field.name}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        onBlur={field.handleBlur}
                        isInvalid={isInvalid}
                        placeholder="Search varieties…"
                        emptyMessage="No varieties found."
                        options={varietyOptions}
                        portalContainer={portalContainerRef}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="requisitionDate">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const selectedDate = field.state.value
                    ? parseDateOnly(field.state.value)
                    : undefined;

                  return (
                    <Field data-invalid={isInvalid}>
                      <DatePickerInput
                        id="requisition-date"
                        label="Requisition date"
                        placeholder="Pick a date"
                        value={selectedDate}
                        aria-invalid={isInvalid}
                        onDateChange={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="expectedDeliveryDate">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const selectedDate = field.state.value
                    ? parseDateOnly(field.state.value)
                    : undefined;

                  return (
                    <Field data-invalid={isInvalid}>
                      <DatePickerInput
                        id="requisition-expected-delivery-date"
                        label="Expected delivery date"
                        placeholder="Pick a date"
                        value={selectedDate}
                        aria-invalid={isInvalid}
                        onDateChange={field.handleChange}
                        onBlur={field.handleBlur}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="acres">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="requisition-acres">
                        Acres (optional)
                      </FieldLabel>
                      <Input
                        id="requisition-acres"
                        inputMode="decimal"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
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

              <form.Field name="quantity">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="requisition-quantity">
                        Quantity (optional)
                      </FieldLabel>
                      <Input
                        id="requisition-quantity"
                        inputMode="decimal"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
