import * as z from "zod";
import { EDITABLE_ROLES, ROLES } from "@/lib/auth/roles";

const roleSchema = z.enum(ROLES);
const editableRoleSchema = z.enum(EDITABLE_ROLES);

const userNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

const userEmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const createUserFormSchema = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  password: passwordSchema,
  role: editableRoleSchema,
});

export const editUserFormSchema = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  password: z
    .string()
    .refine((value) => value.length === 0 || value.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  role: roleSchema,
});

export type CreateUserFormInput = z.infer<typeof createUserFormSchema>;
export type EditUserFormInput = z.infer<typeof editUserFormSchema>;
