"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
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
import { stationNameSchema } from "@/lib/schemas/master/station";
import * as z from "zod";

const formSchema = z.object({
  name: stationNameSchema,
  city: z.string(),
  state: z.string(),
});

type StationFormValues = {
  name: string;
  city: string;
  state: string;
};

type StationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValues?: StationFormValues;
  isPending?: boolean;
  onSubmit: (values: StationFormValues) => void;
};

const emptyValues: StationFormValues = {
  name: "",
  city: "",
  state: "",
};

export function StationFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues = emptyValues,
  isPending = false,
  onSubmit,
}: StationFormDialogProps) {
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
    }
  }, [open, initialValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add station" : "Edit station"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new station."
              : "Update station details."}
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
                    <FieldLabel htmlFor="station-name">Name</FieldLabel>
                    <Input
                      id="station-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      placeholder="Station name"
                      autoComplete="off"
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
                  <FieldLabel htmlFor="station-city">City</FieldLabel>
                  <Input
                    id="station-city"
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
                  <FieldLabel htmlFor="station-state">State</FieldLabel>
                  <Input
                    id="station-state"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="State"
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
