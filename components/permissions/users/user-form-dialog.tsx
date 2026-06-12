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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EDITABLE_ROLES,
  MANAGING_DIRECTOR_ROLE,
  formatRoleLabel,
  type AppRole,
} from "@/lib/auth/roles";
import {
  type CreateUserFormInput,
  type EditUserFormInput,
  createUserFormSchema,
  editUserFormSchema,
} from "@/lib/schemas/permissions/users";

type UserFormDialogProps =
  | {
      mode: "create";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      isPending?: boolean;
      onSubmit: (values: CreateUserFormInput) => void;
    }
  | {
      mode: "edit";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      initialValues: EditUserFormInput;
      isPending?: boolean;
      onSubmit: (values: EditUserFormInput) => void;
    };

const createDefaults: CreateUserFormInput = {
  name: "",
  email: "",
  password: "",
  role: "USER",
};

export function UserFormDialog(props: UserFormDialogProps) {
  const { open, onOpenChange, mode, isPending = false } = props;

  const form = useForm({
    defaultValues:
      mode === "create"
        ? createDefaults
        : (props.initialValues satisfies EditUserFormInput),
    validators: {
      onSubmit: mode === "create" ? createUserFormSchema : editUserFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        props.onSubmit(value as CreateUserFormInput);
        return;
      }
      props.onSubmit(value as EditUserFormInput);
    },
  });

  const editInitialValues = mode === "edit" ? props.initialValues : null;

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      form.reset(createDefaults);
      return;
    }

    if (editInitialValues) {
      form.reset(editInitialValues);
    }
  }, [open, mode, form, editInitialValues]);

  const roleOptions =
    mode === "create"
      ? EDITABLE_ROLES
      : props.initialValues.role === MANAGING_DIRECTOR_ROLE
        ? ([MANAGING_DIRECTOR_ROLE] as const)
        : EDITABLE_ROLES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add user" : "Edit user"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new user account with email and password sign-in."
              : "Update user details. Leave password blank to keep the current password."}
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
                    <FieldLabel htmlFor="user-name">Name</FieldLabel>
                    <Input
                      id="user-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      autoComplete="name"
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="user-email">Email</FieldLabel>
                    <Input
                      id="user-email"
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      autoComplete="email"
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="user-password">
                      {mode === "create" ? "Password" : "New password"}
                    </FieldLabel>
                    <Input
                      id="user-password"
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      autoComplete={
                        mode === "create" ? "new-password" : "off"
                      }
                      placeholder={
                        mode === "edit" ? "Leave blank to keep unchanged" : ""
                      }
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="role">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="user-role">Role</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as AppRole)
                      }
                      disabled={roleOptions.length === 1}
                    >
                      <SelectTrigger id="user-role" className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {formatRoleLabel(role)}
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
                      ? "Create user"
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
