"use client";

import { useForm } from "@tanstack/react-form";
import { useMemo, useRef } from "react";
import type { DispatchableRequisitionRow } from "@/app/actions/dispatch/dispatches";
import { DatePickerInput } from "@/components/date-picker";
import {
  type DispatchRequisitionSelectionMap,
  getSelectionTotal,
  selectionsToInput,
} from "@/components/dispatch/dispatch-form-types";
import {
  type ComboboxOption,
  SearchableComboboxField,
} from "@/components/searchable-combobox-option";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDispatchFormOptions } from "@/hooks/dispatch/use-dispatches";
import { parseDateOnly } from "@/lib/date";
import {
  type CreateDispatchInput,
  createDispatchSchema,
} from "@/lib/schemas/dispatch/dispatch";

type DispatchDetailsFormValues = Omit<
  CreateDispatchInput,
  "requisitions" | "dateOfReceiving"
>;

const emptyValues: DispatchDetailsFormValues = {
  dispatchDate: "",
  generationId: "",
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

type DispatchDetailsStepProps = {
  selections: DispatchRequisitionSelectionMap;
  requisitions: DispatchableRequisitionRow[];
  isPending?: boolean;
  onBack: () => void;
  onSubmit: (values: CreateDispatchInput) => void;
};

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function parseWeightValue(value: string): number {
  if (value === "") return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatWeightValue(value: number) {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function DispatchDetailsStep({
  selections,
  requisitions,
  isPending = false,
  onBack,
  onSubmit,
}: DispatchDetailsStepProps) {
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const { data: formOptions } = useDispatchFormOptions();
  const generations = formOptions?.generations ?? [];
  const locations = formOptions?.locations ?? [];
  const sizes = formOptions?.sizes ?? [];

  const sizeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const size of sizes) {
      map.set(size.id, size.name);
    }
    return map;
  }, [sizes]);

  const requisitionById = useMemo(() => {
    const map = new Map<string, DispatchableRequisitionRow>();
    for (const row of requisitions) {
      map.set(row.id, row);
    }
    return map;
  }, [requisitions]);

  const summaryRows = useMemo(
    () =>
      selectionsToInput(selections).map((selection) => ({
        ...selection,
        requisition: requisitionById.get(selection.requisitionId),
        total: getSelectionTotal(selection.sizeLines),
      })),
    [selections, requisitionById],
  );
  const totalBags = useMemo(
    () => summaryRows.reduce((sum, row) => sum + row.total, 0),
    [summaryRows],
  );

  const generationOptions = useMemo<ComboboxOption[]>(
    () =>
      generations.map((generation) => ({
        id: generation.id,
        label: generation.name,
      })),
    [generations],
  );

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
      onSubmit: createDispatchSchema.omit({
        requisitions: true,
        dateOfReceiving: true,
      }),
    },
    onSubmit: async ({ value }) => {
      const requisitionInput = selectionsToInput(selections);
      const hasGrossWeight = value.grossWeight.trim().length > 0;
      const hasTareWeight = value.tareWeight.trim().length > 0;
      const grossWeight = parseWeightValue(value.grossWeight);
      const tareWeight = parseWeightValue(value.tareWeight);
      const netWeight = grossWeight - tareWeight;
      const hasCalculatedNet =
        hasGrossWeight && hasTareWeight && netWeight >= 0;
      const hasCalculatedAverage = hasCalculatedNet && totalBags > 0;
      onSubmit({
        ...value,
        truckNumber: value.truckNumber.toUpperCase(),
        netWeight: hasCalculatedNet ? formatWeightValue(netWeight) : "",
        averageWeightPerBag: hasCalculatedAverage
          ? formatWeightValue(netWeight / totalBags)
          : "",
        dateOfReceiving: "",
        requisitions: requisitionInput,
      });
    },
  });

  return (
    <Card
      ref={portalContainerRef}
      className="w-full shadow-sm"
    >
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="text-2xl">Dispatch details</CardTitle>
        <CardDescription className="text-base">
          Review selected requisitions and enter transport, location, and
          weighbridge details for this dispatch.
        </CardDescription>
      </CardHeader>

      <form
        id="create-dispatch-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <CardContent className="pt-8 pb-8">
          <FieldGroup className="@container/field-group gap-10">
            <FieldSet>
              <FieldLegend className="text-lg font-semibold">
                Selected requisitions
              </FieldLegend>
              <FieldDescription>
                Review graded bag counts before entering dispatch details.
              </FieldDescription>
              <div className="mt-5 overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-4 py-3 font-medium">Farmer</th>
                      <th className="px-4 py-3 font-medium">Variety</th>
                      <th className="px-4 py-3 font-medium">Sizes</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map((row) => (
                      <tr
                        key={row.requisitionId}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {row.requisition?.farmer.name ?? "—"}
                          </div>
                          <div className="text-muted-foreground">
                            #{row.requisition?.farmer.accountNumber ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {row.requisition?.variety.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            {row.sizeLines.map((line) => (
                              <span key={line.sizeId}>
                                {sizeNameById.get(line.sizeId) ?? "Size"}:{" "}
                                {line.quantity}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="text-lg font-semibold">
                General information
              </FieldLegend>
              <FieldDescription>
                Basic details regarding transport and timing.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="dispatchDate">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    const selectedDate = field.state.value
                      ? parseDateOnly(field.state.value)
                      : undefined;

                    return (
                      <Field data-invalid={isInvalid}>
                        <DatePickerInput
                          id="dispatch-date"
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
                        <FieldLabel htmlFor="dispatch-truck-number">
                          Truck number
                        </FieldLabel>
                        <Input
                          id="dispatch-truck-number"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value.toUpperCase())
                          }
                          aria-invalid={isInvalid}
                          placeholder="e.g. PB08 AB 1234"
                          className="uppercase"
                          autoComplete="off"
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
                        <FieldLabel htmlFor="dispatch-gate-pass">
                          Manual gate pass number (optional)
                        </FieldLabel>
                        <Input
                          id="dispatch-gate-pass"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="e.g. 1024"
                          autoComplete="off"
                        />
                        <FieldDescription>
                          Leave blank if no manual slip number was issued.
                        </FieldDescription>
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
                      <Field
                        data-invalid={isInvalid}
                        className="@md/field-group:col-span-2"
                      >
                        <FieldLabel htmlFor="dispatch-driver-mobile">
                          Driver mobile number (optional)
                        </FieldLabel>
                        <Input
                          id="dispatch-driver-mobile"
                          name={field.name}
                          inputMode="tel"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="10-digit mobile number"
                          autoComplete="off"
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="text-lg font-semibold">
                Location and generation
              </FieldLegend>
              <FieldDescription>
                Generation and source or destination locations for this dispatch.
              </FieldDescription>
              <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                <form.Field name="generationId">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="dispatch-generation">
                          Generation
                        </FieldLabel>
                        <SearchableComboboxField
                          id="dispatch-generation"
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          isInvalid={isInvalid}
                          placeholder="Search generations…"
                          emptyMessage="No generations found."
                          options={generationOptions}
                          portalContainer={portalContainerRef}
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
                        <FieldLabel htmlFor="dispatch-from-location">
                          From location (optional)
                        </FieldLabel>
                        <SearchableComboboxField
                          id="dispatch-from-location"
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
                      <Field
                        data-invalid={isInvalid}
                        className="@md/field-group:col-span-2"
                      >
                        <FieldLabel htmlFor="dispatch-to-location">
                          To location (optional)
                        </FieldLabel>
                        <Input
                          id="dispatch-to-location"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="Enter destination location"
                          autoComplete="off"
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="text-lg font-semibold">
                Weight slip data
              </FieldLegend>
              <FieldDescription>
                Details captured from the weighbridge slip.
              </FieldDescription>
              <form.Subscribe
                selector={(state) => ({
                  grossWeight: state.values.grossWeight,
                  tareWeight: state.values.tareWeight,
                })}
              >
                {({ grossWeight, tareWeight }) => {
                  const hasGrossWeight = grossWeight.trim().length > 0;
                  const hasTareWeight = tareWeight.trim().length > 0;
                  const gross = parseWeightValue(grossWeight);
                  const tare = parseWeightValue(tareWeight);
                  const net = gross - tare;
                  const hasCalculatedNet =
                    hasGrossWeight && hasTareWeight && net >= 0;
                  const hasCalculatedAverage = hasCalculatedNet && totalBags > 0;
                  const averageWeightPerBag = hasCalculatedAverage
                    ? net / totalBags
                    : 0;

                  return (
                    <>
                      <FieldGroup className="mt-5 grid grid-cols-1 gap-6 @md/field-group:grid-cols-2">
                        <form.Field name="weightSlipNumber">
                          {(field) => {
                            const isInvalid = isFieldInvalid(field.state.meta);
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="dispatch-weight-slip-number">
                                  Weight slip number (optional)
                                </FieldLabel>
                                <Input
                                  id="dispatch-weight-slip-number"
                                  name={field.name}
                                  inputMode="numeric"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="e.g. 1024"
                                  autoComplete="off"
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
                                <FieldLabel htmlFor="dispatch-gross-weight">
                                  Gross weight (optional)
                                </FieldLabel>
                                <Input
                                  id="dispatch-gross-weight"
                                  name={field.name}
                                  inputMode="decimal"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="Total weight"
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
                                <FieldLabel htmlFor="dispatch-tare-weight">
                                  Tare weight (optional)
                                </FieldLabel>
                                <Input
                                  id="dispatch-tare-weight"
                                  name={field.name}
                                  inputMode="decimal"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  aria-invalid={isInvalid}
                                  placeholder="Tare weight"
                                />
                                {isInvalid ? (
                                  <FieldError errors={field.state.meta.errors} />
                                ) : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                      </FieldGroup>

                      {hasCalculatedNet ? (
                        <div className="mt-6 grid grid-cols-1 gap-3 @md/field-group:grid-cols-2">
                          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              Calculated net weight
                            </span>
                            <span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                              {net.toLocaleString("en-IN")} kg
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              Calculated avg. weight per bag
                            </span>
                            <span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                              {hasCalculatedAverage
                                ? `${averageWeightPerBag.toLocaleString("en-IN")} kg`
                                : "—"}
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </>
                  );
                }}
              </form.Subscribe>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend className="text-lg font-semibold">
                Additional notes
              </FieldLegend>
              <FieldGroup className="mt-5">
                <form.Field name="remarks">
                  {(field) => {
                    const isInvalid = isFieldInvalid(field.state.meta);
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="dispatch-remarks" className="sr-only">
                          Remarks
                        </FieldLabel>
                        <Textarea
                          id="dispatch-remarks"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                          placeholder="Add any additional comments or observations (optional)"
                          className="min-h-[120px] resize-y"
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-between gap-3 border-t bg-muted/30 py-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" disabled={!canSubmit || isPending}>
                {isPending ? "Creating…" : "Create dispatch"}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  );
}
