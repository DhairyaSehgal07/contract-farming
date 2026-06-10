"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import type { FarmerRow } from "@/app/actions/master/farmers";
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
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalities } from "@/hooks/master/use-localities";
import { useStations } from "@/hooks/master/use-stations";
import {
  type FarmerFormInput,
  farmerFormSchema,
} from "@/lib/schemas/master/farmer";

type FarmerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialFarmer?: FarmerRow | null;
  isPending?: boolean;
  onSubmit: (values: FarmerFormInput) => void;
};

const emptyValues: FarmerFormInput = {
  name: "",
  accountNumber: "",
  mobileNumber: "",
  aadharNumber: "",
  panCardNumber: "",
  bankAccountName: "",
  bankName: "",
  bankAccountNumber: "",
  bankIfscCode: "",
  bankBranchName: "",
  contractUrl: "",
  stationId: "",
  localityId: "",
};

function toFormValues(farmer?: FarmerRow | null): FarmerFormInput {
  if (!farmer) return emptyValues;

  return {
    name: farmer.name,
    accountNumber: farmer.accountNumber,
    mobileNumber: farmer.mobileNumber,
    aadharNumber: farmer.aadharNumber,
    panCardNumber: farmer.panCardNumber ?? "",
    bankAccountName: farmer.bankAccountName ?? "",
    bankName: farmer.bankName ?? "",
    bankAccountNumber: farmer.bankAccountNumber ?? "",
    bankIfscCode: farmer.bankIfscCode ?? "",
    bankBranchName: farmer.bankBranchName ?? "",
    contractUrl: farmer.contractUrl ?? "",
    stationId: farmer.stationId,
    localityId: farmer.localityId,
  };
}

export function FarmerFormDialog({
  open,
  onOpenChange,
  mode,
  initialFarmer = null,
  isPending = false,
  onSubmit,
}: FarmerFormDialogProps) {
  const { data: stations = [] } = useStations();
  const [stationId, setStationId] = useState(initialFarmer?.stationId ?? "");
  const { data: localities = [] } = useLocalities(stationId || null);

  const form = useForm({
    defaultValues: toFormValues(initialFarmer),
    validators: { onSubmit: farmerFormSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const values = toFormValues(initialFarmer);
    form.reset(values);
    setStationId(values.stationId);
  }, [open, initialFarmer?.id, mode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add farmer" : "Edit farmer"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new farmer record."
              : "Update farmer details."}
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
            <FieldSet>
              <FieldLegend>Identity</FieldLegend>
              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="farmer-name">Name</FieldLabel>
                      <Input
                        id="farmer-name"
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

              <form.Field name="accountNumber">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="farmer-account">
                        Account number
                      </FieldLabel>
                      <Input
                        id="farmer-account"
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
            </FieldSet>

            <FieldSet>
              <FieldLegend>Contact and IDs</FieldLegend>
              <form.Field name="mobileNumber">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="farmer-mobile">Mobile</FieldLabel>
                      <Input
                        id="farmer-mobile"
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

              <form.Field name="aadharNumber">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="farmer-aadhar">
                        Aadhaar number
                      </FieldLabel>
                      <Input
                        id="farmer-aadhar"
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

              <form.Field name="panCardNumber">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="farmer-pan">
                        PAN card number
                      </FieldLabel>
                      <Input
                        id="farmer-pan"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value.toUpperCase())
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
            </FieldSet>

            <FieldSet>
              <FieldLegend>Bank details</FieldLegend>
              {(
                [
                  ["bankAccountName", "Account holder name"],
                  ["bankName", "Bank name"],
                  ["bankAccountNumber", "Bank account number"],
                  ["bankIfscCode", "IFSC code"],
                  ["bankBranchName", "Branch name"],
                ] as const
              ).map(([name, label]) => (
                <form.Field key={name} name={name}>
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={`farmer-${name}`}>
                        {label}
                      </FieldLabel>
                      <Input
                        id={`farmer-${name}`}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                    </Field>
                  )}
                </form.Field>
              ))}
            </FieldSet>

            <FieldSet>
              <FieldLegend>Location</FieldLegend>
              <form.Field name="stationId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="farmer-station">Station</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => {
                          field.handleChange(value);
                          setStationId(value);
                          form.setFieldValue("localityId", "");
                        }}
                      >
                        <SelectTrigger
                          id="farmer-station"
                          className="w-full"
                          aria-invalid={isInvalid}
                        >
                          <SelectValue placeholder="Select station" />
                        </SelectTrigger>
                        <SelectContent>
                          {stations.map((station) => (
                            <SelectItem key={station.id} value={station.id}>
                              {station.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="localityId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="farmer-locality">
                        Locality
                      </FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        disabled={!stationId}
                      >
                        <SelectTrigger
                          id="farmer-locality"
                          className="w-full"
                          aria-invalid={isInvalid}
                        >
                          <SelectValue placeholder="Select locality" />
                        </SelectTrigger>
                        <SelectContent>
                          {localities.map((locality) => (
                            <SelectItem key={locality.id} value={locality.id}>
                              {locality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>
            </FieldSet>

            <form.Field name="contractUrl">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="farmer-contract">
                      Contract URL
                    </FieldLabel>
                    <Input
                      id="farmer-contract"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      placeholder="https://"
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
