import { z } from "zod";
import { isValidAppPermission } from "@/lib/auth/permission-catalog";
import { EDITABLE_ROLES } from "@/lib/auth/roles";

const grantSchema = z.object({
  resource: z.string(),
  action: z.string(),
});

const editableRoleSchema = z.enum(EDITABLE_ROLES);

export const updateRolePermissionsSchema = z
  .object({
    role: editableRoleSchema,
    grants: z.array(grantSchema),
  })
  .superRefine((value, ctx) => {
    for (const [index, grant] of value.grants.entries()) {
      if (!isValidAppPermission(grant.resource, grant.action)) {
        ctx.addIssue({
          code: "custom",
          message: `Invalid permission: ${grant.resource}:${grant.action}`,
          path: ["grants", index],
        });
      }
    }
  });

export type UpdateRolePermissionsInput = z.infer<
  typeof updateRolePermissionsSchema
>;
