"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { SessionRow } from "@/app/actions/permissions/sessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

type SessionsSectionProps = {
  sessions: SessionRow[];
  currentSessionToken?: string;
};

function formatUserAgent(userAgent: string | null) {
  if (!userAgent) return "Unknown device";
  if (userAgent.length <= 60) return userAgent;
  return `${userAgent.slice(0, 60)}…`;
}

export function SessionsSection({
  sessions,
  currentSessionToken,
}: SessionsSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function revokeSession(token: string) {
    startTransition(async () => {
      const result = await authClient.admin.revokeUserSession({
        sessionToken: token,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to revoke session");
        return;
      }
      toast.success("Session revoked");
      router.refresh();
    });
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No active sessions found.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => {
          const isCurrent = session.token === currentSessionToken;
          return (
            <TableRow key={session.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {session.user.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>{session.user.role}</TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                {formatUserAgent(session.userAgent)}
              </TableCell>
              <TableCell className="text-sm">
                {new Date(session.expiresAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {isCurrent ? <Badge>Current</Badge> : null}
                  {session.impersonatedBy ? (
                    <Badge variant="secondary">Impersonated</Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {isCurrent ? (
                  <span className="text-sm text-muted-foreground">—</span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => revokeSession(session.token)}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Revoke"
                    )}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
