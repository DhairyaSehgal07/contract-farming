"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import * as z from "zod";
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
import { localityNameSchema } from "@/lib/schemas/master/locality";

const formSchema = z.object({
  name: localityNameSchema,
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
});

type LocalityFormValues = {
  name: string;
  city: string;
  state: string;
  postalCode: string;
};

type LocalityFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValues?: LocalityFormValues;
  isPending?: boolean;
  onSubmit: (values: LocalityFormValues) => void;
};

const emptyValues: LocalityFormValues = {
  name: "",
  city: "",
  state: "",
  postalCode: "",
};

export function LocalityFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues = emptyValues,
  isPending = false,
  onSubmit,
}: LocalityFormDialogProps) {
  const form = useForm({
    defaultValues: initialValues,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  useEffect(() => {
    if (open) {
      form.setFieldValue("name", initialValues.name);
      form.setFieldValue("city", initialValues.city);
      form.setFieldValue("state", initialValues.state);
      form.setFieldValue("postalCode", initialValues.postalCode);
    }
  }, [open, initialValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add locality" : "Edit locality"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new locality for the selected station."
              : "Update locality details."}
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
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="locality-name">Name</FieldLabel>
                    <Input
                      id="locality-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      placeholder="Locality name"
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="city">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="locality-city">City</FieldLabel>
                  <Input
                    id="locality-city"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="City"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="state">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="locality-state">State</FieldLabel>
                  <Input
                    id="locality-state"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="State"
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="postalCode">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="locality-postal">Postal code</FieldLabel>
                  <Input
                    id="locality-postal"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Postal code"
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
