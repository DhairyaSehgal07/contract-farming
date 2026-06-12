"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createRoleMatrixColumns } from "@/components/permissions/roles/role-matrix-columns";
import {
  buildRoleMatrixRows,
  type RoleMatrixRow,
} from "@/components/permissions/roles/role-matrix-types";
import {
  formatRoleLabel,
  type EditableRole,
} from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useRolePermissionMatrix,
  useUpdateRolePermissions,
} from "@/hooks/permissions/use-role-matrix";
import {
  PERMISSION_CATALOG,
  type AppAction,
  type AppResource,
} from "@/lib/auth/permission-catalog";

function grantKey(resource: AppResource, action: AppAction) {
  return `${resource}:${action}`;
}

export function RoleMatrixSection() {
  const { data: matrix, isPending, isError, error } = useRolePermissionMatrix();
  const updateMutation = useUpdateRolePermissions();
  const [selectedRole, setSelectedRole] =
    useState<EditableRole>("PROGRAMME_MANAGER");
  const [grants, setGrants] = useState<Record<string, boolean>>({});

  const catalogEntries = useMemo(() => {
    const entries: { resource: AppResource; action: AppAction }[] = [];
    for (const resource of Object.keys(PERMISSION_CATALOG) as AppResource[]) {
      for (const action of PERMISSION_CATALOG[resource]) {
        entries.push({ resource, action });
      }
    }
    return entries;
  }, []);

  useEffect(() => {
    if (!matrix) return;
    if (!matrix.roles.includes(selectedRole)) {
      setSelectedRole(matrix.roles[0] ?? "PROGRAMME_MANAGER");
    }
  }, [matrix, selectedRole]);

  useEffect(() => {
    if (!matrix) return;

    const roleGrants = matrix.grantsByRole[selectedRole] ?? [];
    const nextGrants: Record<string, boolean> = {};
    for (const entry of catalogEntries) {
      nextGrants[grantKey(entry.resource, entry.action)] = roleGrants.some(
        (grant) =>
          grant.resource === entry.resource && grant.action === entry.action,
      );
    }
    setGrants(nextGrants);
  }, [matrix, selectedRole, catalogEntries]);

  const tableData = useMemo(() => buildRoleMatrixRows(grants), [grants]);

  const handleToggle = useCallback(
    (resource: AppResource, action: AppAction, checked: boolean) => {
      setGrants((current) => ({
        ...current,
        [grantKey(resource, action)]: checked,
      }));
    },
    [],
  );

  const columns = useMemo<ColumnDef<RoleMatrixRow>[]>(
    () => createRoleMatrixColumns({ onToggle: handleToggle }),
    [handleToggle],
  );

  function handleSave() {
    const grantList = Object.entries(grants)
      .filter(([, enabled]) => enabled)
      .map(([key]) => {
        const [resource, action] = key.split(":");
        return { resource, action };
      });

    updateMutation.mutate({ role: selectedRole, grants: grantList });
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading role permissions…
      </div>
    );
  }

  if (isError || !matrix) {
    return (
      <p className="text-destructive">
        {error?.message ?? "Failed to load role permissions."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">
            Managing Director
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Full access to all app features and admin operations. This role
            cannot be edited.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <div className="flex max-w-sm flex-col gap-2">
          <Label htmlFor="role-select">Role</Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as EditableRole)}
          >
            <SelectTrigger id="role-select">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {matrix.roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {formatRoleLabel(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={tableData}
              filterColumn="resource"
              filterPlaceholder="Search resources…"
              showPagination={false}
            />
          </CardContent>
        </Card>

        <div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save permissions"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
