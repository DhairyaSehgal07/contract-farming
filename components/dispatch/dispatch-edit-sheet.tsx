"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useRef } from "react";
import type { DispatchRow } from "@/app/actions/dispatch/dispatches";
import { DatePickerInput } from "@/components/date-picker";
import {
  type ComboboxOption,
  SearchableComboboxField,
} from "@/components/searchable-combobox-option";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useDispatchFormOptions } from "@/hooks/dispatch/use-dispatches";
import { parseDateOnly } from "@/lib/date";
import {
  type DispatchStep2Input,
  dispatchStep2Schema,
} from "@/lib/schemas/dispatch/dispatch";

type DispatchEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatch: DispatchRow | null;
  isPending?: boolean;
  onSubmit: (values: DispatchStep2Input) => void;
};

const emptyValues: DispatchStep2Input = {
  dispatchDate: "",
  locationId: "",
  toLocation: "",
  truckNumber: "",
  manualGatePassNumber: "",
  weightSlipNumber: "",
  driverMobileNumber: "",
  grossWeight: "",
  tareWeight: "",
  netWeight: "",
  averageWeightPerBag: "",
  remarks: "",
};

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function toFormValues(dispatch: DispatchRow | null): DispatchStep2Input {
  if (!dispatch) return emptyValues;

  return {
    dispatchDate: dispatch.dispatchDate ?? "",
    locationId: dispatch.locationId ?? "",
    toLocation: dispatch.toLocation ?? "",
    truckNumber: dispatch.truckNumber ?? "",
    manualGatePassNumber: dispatch.manualGatePassNumber ?? "",
    weightSlipNumber: dispatch.weightSlipNumber ?? "",
    driverMobileNumber: dispatch.driverMobileNumber ?? "",
    grossWeight: dispatch.grossWeight ?? "",
    tareWeight: dispatch.tareWeight ?? "",
    netWeight: dispatch.netWeight ?? "",
    averageWeightPerBag: dispatch.averageWeightPerBag ?? "",
    remarks: dispatch.remarks ?? "",
  };
}

export function DispatchEditSheet({
  open,
  onOpenChange,
  dispatch,
  isPending = false,
  onSubmit,
}: DispatchEditSheetProps) {
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const { data: formOptions } = useDispatchFormOptions();
  const locations = formOptions?.locations ?? [];

  const locationOptions = useMemo<ComboboxOption[]>(
    () =>
      locations.map((location) => ({
        id: location.id,
        label: location.name,
      })),
    [locations],
  );

  const form = useForm({
    defaultValues: emptyValues,
    validators: {
      onSubmit: dispatchStep2Schema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    form.reset(toFormValues(dispatch));
  }, [dispatch, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={portalContainerRef}
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 data-[side=right]:w-full sm:max-w-lg"
        aria-describedby="dispatch-edit-description"
      >
        <SheetHeader>
          <SheetTitle>Edit dispatch details</SheetTitle>
          <SheetDescription id="dispatch-edit-description">
            Update only step 2 fields. Requisition selection and quantities are
            read-only after creation.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="flex-1 overflow-y-auto px-6">
            <FieldGroup className="gap-5">
              <form.Field name="dispatchDate">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  const selectedDate = field.state.value
                    ? parseDateOnly(field.state.value)
                    : undefined;

                  return (
                    <Field data-invalid={isInvalid}>
                      <DatePickerInput
                        id="edit-dispatch-date"
                        label="Dispatch date"
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

              <form.Field name="truckNumber">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-truck-number">
                        Truck number
                      </FieldLabel>
                      <Input
                        id="edit-dispatch-truck-number"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value.toUpperCase())
                        }
                        aria-invalid={isInvalid}
                        className="uppercase"
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="locationId">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-location">
                        From location (optional)
                      </FieldLabel>
                      <SearchableComboboxField
                        id="edit-dispatch-location"
                        name={field.name}
                        value={field.state.value ?? ""}
                        onValueChange={field.handleChange}
                        onBlur={field.handleBlur}
                        isInvalid={isInvalid}
                        placeholder="Search locations…"
                        emptyMessage="No locations found."
                        options={locationOptions}
                        portalContainer={portalContainerRef}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="toLocation">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-to-location">
                        To location (optional)
                      </FieldLabel>
                      <Input
                        id="edit-dispatch-to-location"
                        name={field.name}
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

              <form.Field name="manualGatePassNumber">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-manual-gate-pass">
                        Manual gate pass number (optional)
                      </FieldLabel>
                      <Input
                        id="edit-dispatch-manual-gate-pass"
                        name={field.name}
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

              <form.Field name="weightSlipNumber">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-weight-slip-number">
                        Weight slip number (optional)
                      </FieldLabel>
                      <Input
                        id="edit-dispatch-weight-slip-number"
                        name={field.name}
                        inputMode="numeric"
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

              <form.Field name="driverMobileNumber">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-driver-mobile">
                        Driver mobile number (optional)
                      </FieldLabel>
                      <Input
                        id="edit-dispatch-driver-mobile"
                        name={field.name}
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

              <form.Field name="grossWeight">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-gross-weight">
                        Gross weight (optional)
                      </FieldLabel>
                      <Input
                        id="edit-dispatch-gross-weight"
                        name={field.name}
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

              <form.Field name="tareWeight">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-tare-weight">
                        Tare weight (optional)
                      </FieldLabel>
                      <Input
                        id="edit-dispatch-tare-weight"
                        name={field.name}
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

              <form.Field name="netWeight">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-net-weight">
                        Net weight (optional)
                      </FieldLabel>
                      <Input
                        id="edit-dispatch-net-weight"
                        name={field.name}
                        inputMode="decimal"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      <FieldDescription>
                        Keep this aligned with gross and tare weights from the
                        slip.
                      </FieldDescription>
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="averageWeightPerBag">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-average-weight-per-bag">
                        Avg. weight per bag (optional)
                      </FieldLabel>
                      <Input
                        id="edit-dispatch-average-weight-per-bag"
                        name={field.name}
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

              <form.Field name="remarks">
                {(field) => {
                  const isInvalid = isFieldInvalid(field.state.meta);
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="edit-dispatch-remarks">
                        Remarks (optional)
                      </FieldLabel>
                      <Textarea
                        id="edit-dispatch-remarks"
                        name={field.name}
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
          </div>

          <SheetFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isPending}>
                  {isPending ? "Saving…" : "Save changes"}
                </Button>
              )}
            </form.Subscribe>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
