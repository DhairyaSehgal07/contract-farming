"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import type { FarmerFamilyRow } from "@/app/actions/master/farmer-families";
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
  FieldDescription,
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
  type FarmerFamilyFormInput,
  farmerFamilyFormSchema,
} from "@/lib/schemas/master/farmer-family-form";

type FamilyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialFamily?: FarmerFamilyRow | null;
  isPending?: boolean;
  onSubmit: (values: FarmerFamilyFormInput) => void;
};

const emptyValues: FarmerFamilyFormInput = {
  accountNumber: "",
  name: "",
  stationId: "",
  localityId: "",
};

function toFormValues(family?: FarmerFamilyRow | null): FarmerFamilyFormInput {
  if (!family) return emptyValues;

  return {
    accountNumber: family.accountNumber,
    name: family.name,
    stationId: family.stationId,
    localityId: family.localityId,
  };
}

export function FamilyFormDialog({
  open,
  onOpenChange,
  mode,
  initialFamily = null,
  isPending = false,
  onSubmit,
}: FamilyFormDialogProps) {
  const { data: stations = [] } = useStations({ enabled: open });
  const [stationId, setStationId] = useState(initialFamily?.stationId ?? "");
  const { data: localities = [] } = useLocalities(
    open ? stationId || null : null,
  );

  const accountNumberLocked =
    mode === "edit" && (initialFamily?._count.members ?? 0) > 0;

  const form = useForm({
    defaultValues: toFormValues(initialFamily),
    validators: { onSubmit: farmerFamilyFormSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const values = toFormValues(initialFamily);
    form.reset(values);
    setStationId(values.stationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when dialog opens or family changes
  }, [open, initialFamily, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add family" : "Edit family"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a farmer family group. Add members from the Farmers tab."
              : "Update family details."}
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
            <FieldSet>
              <FieldLegend>Family details</FieldLegend>

              <form.Field name="accountNumber">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="family-account">
                        Account number
                      </FieldLabel>
                      <Input
                        id="family-account"
                        autoComplete="off"
                        value={field.state.value}
                        disabled={accountNumberLocked}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      {accountNumberLocked ? (
                        <FieldDescription>
                          Account number cannot be changed while members are
                          linked.
                        </FieldDescription>
                      ) : (
                        <FieldDescription>
                          Use a whole number (e.g. 20, 62).
                        </FieldDescription>
                      )}
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="family-name">Name</FieldLabel>
                      <Input
                        id="family-name"
                        autoComplete="off"
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
              <FieldLegend>Location</FieldLegend>
              <form.Field name="stationId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="family-station">Station</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => {
                          field.handleChange(value);
                          setStationId(value);
                          form.setFieldValue("localityId", "");
                        }}
                      >
                        <SelectTrigger
                          id="family-station"
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
                      <FieldLabel htmlFor="family-locality">
                        Locality
                      </FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        disabled={!stationId}
                      >
                        <SelectTrigger
                          id="family-locality"
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
