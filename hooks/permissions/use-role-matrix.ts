"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateRolePermissions } from "@/app/actions/permissions/roles";
import { permissionsKeys } from "@/lib/query/keys";
import { fetchRolePermissionMatrix } from "@/lib/query/permissions-fetchers";
import type { UpdateRolePermissionsInput } from "@/lib/schemas/permissions/roles";

export function useRolePermissionMatrix() {
  return useQuery({
    queryKey: permissionsKeys.roleMatrix(),
    queryFn: fetchRolePermissionMatrix,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateRolePermissionsInput) => {
      const result = await updateRolePermissions(input);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: permissionsKeys.roleMatrix(),
      });
      toast.success("Role permissions updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
