"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import {
  createUserColumns,
  type PermissionsUser,
} from "@/components/permissions/users/user-columns";
import { UserFormDialog } from "@/components/permissions/users/user-form-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  isAppRole,
  MANAGING_DIRECTOR_ROLE,
  type AppRole,
} from "@/lib/auth/roles";
import type {
  CreateUserFormInput,
  EditUserFormInput,
} from "@/lib/schemas/permissions/users";

type UsersSectionProps = {
  users: PermissionsUser[];
  selfId: string;
  canManageUsers: boolean;
};

export function UsersSection({
  users,
  selfId,
  canManageUsers,
}: UsersSectionProps) {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PermissionsUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<PermissionsUser | null>(
    null,
  );

  const refreshAfterMutation = useCallback(() => {
    router.refresh();
  }, [router]);

  const runAction = useCallback(
    (
      user: PermissionsUser,
      action: () => Promise<{ error: null | { message?: string } }>,
      successMessage: string,
      onDone?: () => void,
    ) => {
      setPendingUserId(user.id);
      startTransition(async () => {
        const result = await action();
        setPendingUserId(null);
        if (result.error) {
          toast.error(result.error.message ?? "Action failed");
          return;
        }
        toast.success(successMessage);
        onDone?.();
        refreshAfterMutation();
      });
    },
    [refreshAfterMutation],
  );

  const handleImpersonate = useCallback(
    (user: PermissionsUser) =>
      runAction(
        user,
        () => authClient.admin.impersonateUser({ userId: user.id }),
        `Now impersonating ${user.name}`,
        () => {
          void refetch();
          router.push("/");
        },
      ),
    [refetch, router, runAction],
  );

  const handleSetRole = useCallback(
    (user: PermissionsUser, role: AppRole) =>
      runAction(
        user,
        () => authClient.admin.setRole({ userId: user.id, role }),
        "Role updated",
      ),
    [runAction],
  );

  const handleRevokeSessions = useCallback(
    (user: PermissionsUser) =>
      runAction(
        user,
        () => authClient.admin.revokeUserSessions({ userId: user.id }),
        "User sessions revoked",
      ),
    [runAction],
  );

  const handleBan = useCallback(
    (user: PermissionsUser) => {
      if (
        !window.confirm(
          "Ban this user? They will be signed out and unable to sign in until unbanned.",
        )
      ) {
        return;
      }
      runAction(
        user,
        () =>
          authClient.admin.banUser({
            userId: user.id,
            banReason: "Banned by administrator",
          }),
        "User banned",
      );
    },
    [runAction],
  );

  const handleUnban = useCallback(
    (user: PermissionsUser) =>
      runAction(
        user,
        () => authClient.admin.unbanUser({ userId: user.id }),
        "User unbanned",
      ),
    [runAction],
  );

  const columns = useMemo<ColumnDef<PermissionsUser>[]>(
    () =>
      createUserColumns({
        selfId,
        canManageUsers,
        pendingUserId,
        onEdit: (user) => {
          setEditingUser(user);
          setEditOpen(true);
        },
        onDelete: (user) => {
          setDeletingUser(user);
          setDeleteOpen(true);
        },
        onImpersonate: handleImpersonate,
        onSetRole: handleSetRole,
        onRevokeSessions: handleRevokeSessions,
        onBan: handleBan,
        onUnban: handleUnban,
      }),
    [
      canManageUsers,
      handleBan,
      handleImpersonate,
      handleRevokeSessions,
      handleSetRole,
      handleUnban,
      pendingUserId,
      selfId,
    ],
  );

  function handleCreateSubmit(values: CreateUserFormInput) {
    startTransition(async () => {
      const result = await authClient.admin.createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to create user");
        return;
      }

      toast.success("User created");
      setCreateOpen(false);
      refreshAfterMutation();
    });
  }

  function handleEditSubmit(values: EditUserFormInput) {
    if (!editingUser) return;

    const isManagingDirector = editingUser.role === MANAGING_DIRECTOR_ROLE;
    const userRole =
      editingUser.role && isAppRole(editingUser.role)
        ? editingUser.role
        : "USER";

    startTransition(async () => {
      const data: Record<string, string> = {};

      if (values.name !== editingUser.name) {
        data.name = values.name;
      }
      if (values.email !== editingUser.email) {
        data.email = values.email;
      }
      if (!isManagingDirector && values.role !== userRole) {
        data.role = values.role;
      }

      if (Object.keys(data).length > 0) {
        const updateResult = await authClient.admin.updateUser({
          userId: editingUser.id,
          data,
        });
        if (updateResult.error) {
          toast.error(updateResult.error.message ?? "Failed to update user");
          return;
        }
      }

      if (values.password) {
        const passwordResult = await authClient.admin.setUserPassword({
          userId: editingUser.id,
          newPassword: values.password,
        });
        if (passwordResult.error) {
          toast.error(
            passwordResult.error.message ?? "Failed to update password",
          );
          return;
        }
      }

      if (Object.keys(data).length === 0 && !values.password) {
        toast.message("No changes to save");
        return;
      }

      toast.success("User updated");
      setEditOpen(false);
      setEditingUser(null);
      refreshAfterMutation();
    });
  }

  function handleDeleteConfirm() {
    if (!deletingUser) return;

    setPendingUserId(deletingUser.id);
    startTransition(async () => {
      const result = await authClient.admin.removeUser({
        userId: deletingUser.id,
      });
      setPendingUserId(null);
      if (result.error) {
        toast.error(result.error.message ?? "Failed to delete user");
        return;
      }
      toast.success("User deleted");
      setDeleteOpen(false);
      setDeletingUser(null);
      refreshAfterMutation();
    });
  }

  const editingUserRole =
    editingUser?.role && isAppRole(editingUser.role)
      ? editingUser.role
      : "USER";

  return (
    <div className="flex flex-col gap-4">
      {canManageUsers ? (
        <div className="flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add user
          </Button>
        </div>
      ) : null}

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          filterColumn="name"
          filterPlaceholder="Search users…"
        />
      )}

      <UserFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        isPending={isPending}
        onSubmit={handleCreateSubmit}
      />

      <UserFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingUser(null);
        }}
        isPending={isPending}
        initialValues={{
          name: editingUser?.name ?? "",
          email: editingUser?.email ?? "",
          password: "",
          role: editingUserRole,
        }}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletingUser(null);
        }}
        title="Delete user"
        description={
          deletingUser
            ? `Delete ${deletingUser.name}? This removes their account, sessions, and sign-in credentials. This cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        isPending={pendingUserId === deletingUser?.id}
      />
    </div>
  );
}
