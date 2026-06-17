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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useRequisitionFarmers,
  useRequisitionVarieties,
} from "@/hooks/requisition/use-requisitions";
import { parseDateOnly } from "@/lib/date";
import {
  type RequisitionFormInput,
  requisitionFormSchema,
} from "@/lib/schemas/requisition/requisition";

type RequisitionFormSheetProps = {
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
  requestedDeliveryDate: "",
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
    requestedDeliveryDate: requisition.requestedDeliveryDate,
    acres: requisition.acres ?? "",
    quantity: requisition.initialQuantity ?? "",
  };
}

export function RequisitionFormSheet({
  open,
  onOpenChange,
  mode,
  initialRequisition = null,
  isPending = false,
  onSubmit,
}: RequisitionFormSheetProps) {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 data-[side=right]:w-full sm:max-w-lg"
      >
        <div ref={portalContainerRef} className="flex h-full min-h-0 flex-col">
          <SheetHeader>
            <SheetTitle>
              {mode === "create" ? "Add requisition" : "Edit requisition"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Create a new seed requisition."
                : "Update requisition details."}
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <div className="flex-1 overflow-y-auto px-6">
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
                          Initial quantity (optional)
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

                <form.Field name="requestedDeliveryDate">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const selectedDate = field.state.value
                      ? parseDateOnly(field.state.value)
                      : undefined;

                    return (
                      <Field data-invalid={isInvalid}>
                        <DatePickerInput
                          id="requisition-requested-delivery-date"
                          label="Requested delivery date"
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
              </FieldGroup>
            </div>

            <SheetFooter className="border-t">
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
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
