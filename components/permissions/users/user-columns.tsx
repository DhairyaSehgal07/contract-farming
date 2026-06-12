"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Ban,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCog,
  UserX,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EDITABLE_ROLES,
  formatRoleLabel,
  isAppRole,
  MANAGING_DIRECTOR_ROLE,
  type AppRole,
} from "@/lib/auth/roles";

export type PermissionsUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date | string;
};

type UserColumnActions = {
  selfId: string;
  canManageUsers: boolean;
  pendingUserId: string | null;
  onEdit: (user: PermissionsUser) => void;
  onDelete: (user: PermissionsUser) => void;
  onImpersonate: (user: PermissionsUser) => void;
  onSetRole: (user: PermissionsUser, role: AppRole) => void;
  onRevokeSessions: (user: PermissionsUser) => void;
  onBan: (user: PermissionsUser) => void;
  onUnban: (user: PermissionsUser) => void;
};

export function createUserColumns(
  actions: UserColumnActions,
): ColumnDef<PermissionsUser>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      id: "role",
      accessorFn: (row) => row.role ?? "USER",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const isManagingDirector =
          row.original.role === MANAGING_DIRECTOR_ROLE;
        return (
          <Badge variant={isManagingDirector ? "default" : "secondary"}>
            {row.original.role
              ? formatRoleLabel(row.original.role)
              : "User"}
          </Badge>
        );
      },
    },
    {
      id: "status",
      accessorFn: (row) => (row.banned ? "Banned" : "Active"),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) =>
        row.original.banned ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === actions.selfId;
        const isManagingDirector = user.role === MANAGING_DIRECTOR_ROLE;
        const userRole =
          user.role && isAppRole(user.role) ? user.role : "USER";
        const isPending = actions.pendingUserId === user.id;

        if (isSelf || !actions.canManageUsers) {
          return (
            <div className="text-right text-sm text-muted-foreground">
              {isSelf ? "You" : "—"}
            </div>
          );
        }

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="User actions"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="size-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => actions.onEdit(user)}>
                  <Pencil className="mr-2 size-4" />
                  Edit user
                </DropdownMenuItem>

                {!isManagingDirector ? (
                  <DropdownMenuItem
                    onClick={() => actions.onImpersonate(user)}
                  >
                    <UserCog className="mr-2 size-4" />
                    Impersonate
                  </DropdownMenuItem>
                ) : null}

                {!isManagingDirector ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Set role</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {EDITABLE_ROLES.map((role) => (
                        <DropdownMenuItem
                          key={role}
                          disabled={role === userRole || isPending}
                          onClick={() => actions.onSetRole(user, role)}
                        >
                          {formatRoleLabel(role)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : null}

                <DropdownMenuItem
                  onClick={() => actions.onRevokeSessions(user)}
                >
                  <UserX className="mr-2 size-4" />
                  Revoke sessions
                </DropdownMenuItem>

                {!isManagingDirector ? (
                  user.banned ? (
                    <DropdownMenuItem onClick={() => actions.onUnban(user)}>
                      <Ban className="mr-2 size-4" />
                      Unban
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => actions.onBan(user)}
                    >
                      <Ban className="mr-2 size-4" />
                      Ban
                    </DropdownMenuItem>
                  )
                ) : null}

                {!isManagingDirector ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => actions.onDelete(user)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete user
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
