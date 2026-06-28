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
import { useDispatchFormOptions } from "@/hooks/dispatch/use-dispatches";
import { parseDateOnly } from "@/lib/date";
import {
  type UpdateDispatchBasicInput,
  updateDispatchBasicSchema,
} from "@/lib/schemas/dispatch/dispatch";

type DispatchBasicFormValues = Omit<UpdateDispatchBasicInput, "id">;

type DispatchEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatch: DispatchRow | null;
  isPending?: boolean;
  onSubmit: (values: UpdateDispatchBasicInput) => void;
};

const emptyValues: DispatchBasicFormValues = {
  dispatchDate: "",
  locationId: "",
  toLocation: "",
};

function isFieldInvalid(meta: { isTouched: boolean; isValid: boolean }) {
  return meta.isTouched && !meta.isValid;
}

function toFormValues(dispatch: DispatchRow | null): DispatchBasicFormValues {
  if (!dispatch) return emptyValues;

  return {
    dispatchDate: dispatch.dispatchDate ?? "",
    locationId: dispatch.locationId ?? "",
    toLocation: dispatch.toLocation ?? "",
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
  const { data: formOptions } = useDispatchFormOptions({ enabled: open });
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
      onSubmit: updateDispatchBasicSchema.omit({ id: true }),
    },
    onSubmit: async ({ value }) => {
      if (!dispatch) return;
      onSubmit({ id: dispatch.id, ...value });
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
          <SheetTitle>Edit dispatch</SheetTitle>
          <SheetDescription id="dispatch-edit-description">
            Update the dispatch date and locations. Other details remain
            unchanged.
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
