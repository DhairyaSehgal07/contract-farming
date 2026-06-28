"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import type { FarmerFieldRow } from "@/app/actions/farmer/farmer-fields";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type FarmerFieldFormInput,
  farmerFieldFormSchema,
} from "@/lib/schemas/farmer/farmer-field";

type FamilyMemberOption = {
  id: string;
  name: string;
  accountNumber: string;
};

type FarmerFieldFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialField?: FarmerFieldRow | null;
  isPending?: boolean;
  onSubmit: (values: FarmerFieldFormInput) => void;
  members?: FamilyMemberOption[];
  selectedFarmerId?: string;
  onFarmerIdChange?: (farmerId: string) => void;
  memberReadOnly?: boolean;
};

const emptyValues: FarmerFieldFormInput = {
  name: "",
  geoLocation: "",
  acres: "",
};

function toFormValues(field?: FarmerFieldRow | null): FarmerFieldFormInput {
  if (!field) return emptyValues;

  return {
    name: field.name,
    geoLocation: field.geoLocation,
    acres: field.acres,
  };
}

export function FarmerFieldFormDialog({
  open,
  onOpenChange,
  mode,
  initialField = null,
  isPending = false,
  onSubmit,
  members,
  selectedFarmerId = "",
  onFarmerIdChange,
  memberReadOnly = false,
}: FarmerFieldFormDialogProps) {
  const form = useForm({
    defaultValues: toFormValues(initialField),
    validators: { onSubmit: farmerFieldFormSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(toFormValues(initialField));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when dialog opens or field changes
  }, [open, initialField, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add field" : "Edit field"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? members
                ? "Record a field for a family member."
                : "Record a field for this farmer."
              : "Update field details."}
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
            {members ? (
              <Field>
                <FieldLabel htmlFor="field-member">Member</FieldLabel>
                <Select
                  value={selectedFarmerId}
                  onValueChange={onFarmerIdChange}
                  disabled={memberReadOnly || isPending}
                >
                  <SelectTrigger id="field-member">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} (#{member.accountNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="field-name">Name</FieldLabel>
                    <Input
                      id="field-name"
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

            <form.Field name="geoLocation">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="field-geo">Geo location</FieldLabel>
                    <Input
                      id="field-geo"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="28.6139, 77.2090"
                    />
                    <FieldDescription>
                      Enter coordinates (latitude, longitude) or a location
                      description.
                    </FieldDescription>
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
                    <FieldLabel htmlFor="field-acres">Acres</FieldLabel>
                    <Input
                      id="field-acres"
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
                <Button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isPending ||
                    (Boolean(members) &&
                      mode === "create" &&
                      !selectedFarmerId)
                  }
                >
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
