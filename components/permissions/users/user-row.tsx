"use client";

import { Ban, Loader2, MoreHorizontal, UserCog, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { ROLES, formatRoleLabel, MANAGING_DIRECTOR_ROLE } from "@/lib/auth/roles";
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
import { TableCell, TableRow } from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

export type PermissionsUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date | string;
};

type UserRowProps = {
  user: PermissionsUser;
  selfId: string;
};

export function UserRow({ user, selfId }: UserRowProps) {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const isSelf = user.id === selfId;
  const isManagingDirector = user.role === MANAGING_DIRECTOR_ROLE;

  function refreshAfterMutation() {
    router.refresh();
  }

  function runAction(
    action: () => Promise<{ error: null | { message?: string } }>,
    successMessage: string,
    onDone?: () => void,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error.message ?? "Action failed");
        return;
      }
      toast.success(successMessage);
      onDone?.();
      refreshAfterMutation();
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant={isManagingDirector ? "default" : "secondary"}>
          {user.role ? formatRoleLabel(user.role) : "User"}
        </Badge>
      </TableCell>
      <TableCell>
        {user.banned ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isSelf ? (
          <span className="text-sm text-muted-foreground">You</span>
        ) : (
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

              {!isManagingDirector ? (
                <DropdownMenuItem
                  onClick={() =>
                    runAction(
                      () =>
                        authClient.admin.impersonateUser({ userId: user.id }),
                      `Now impersonating ${user.name}`,
                      () => {
                        void refetch();
                        router.push("/");
                      },
                    )
                  }
                >
                  <UserCog className="mr-2 size-4" />
                  Impersonate
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Set role
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {ROLES.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      disabled={role === user.role || isPending}
                      onClick={() =>
                        runAction(
                          () =>
                            authClient.admin.setRole({
                              userId: user.id,
                              role,
                            }),
                          "Role updated",
                        )
                      }
                    >
                      {formatRoleLabel(role)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem
                onClick={() =>
                  runAction(
                    () =>
                      authClient.admin.revokeUserSessions({ userId: user.id }),
                    "User sessions revoked",
                  )
                }
              >
                <UserX className="mr-2 size-4" />
                Revoke sessions
              </DropdownMenuItem>

              {user.banned ? (
                <DropdownMenuItem
                  onClick={() =>
                    runAction(
                      () => authClient.admin.unbanUser({ userId: user.id }),
                      "User unbanned",
                    )
                  }
                >
                  <Ban className="mr-2 size-4" />
                  Unban
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Ban this user? They will be signed out and unable to sign in until unbanned.",
                      )
                    ) {
                      return;
                    }
                    runAction(
                      () =>
                        authClient.admin.banUser({
                          userId: user.id,
                          banReason: "Banned by administrator",
                        }),
                      "User banned",
                    );
                  }}
                >
                  <Ban className="mr-2 size-4" />
                  Ban
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}
