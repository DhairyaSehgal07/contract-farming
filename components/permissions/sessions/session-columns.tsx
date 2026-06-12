"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import type { SessionRow } from "@/app/actions/permissions/sessions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canDeleteSessionToken } from "@/lib/permissions/session-guards";

function parseBrowser(userAgent: string): string | null {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/OPR\/|Opera/.test(userAgent)) return "Opera";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari";
  return null;
}

function parseOs(userAgent: string): string | null {
  if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
  if (/Android/.test(userAgent)) return "Android";
  if (/Mac OS X|Macintosh/.test(userAgent)) return "macOS";
  if (/Windows/.test(userAgent)) return "Windows";
  if (/Linux/.test(userAgent)) return "Linux";
  return null;
}

export function formatUserAgent(userAgent: string | null) {
  if (!userAgent) return "Unknown device";

  const browser = parseBrowser(userAgent);
  const os = parseOs(userAgent);
  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (os) return os;
  if (userAgent.length <= 60) return userAgent;
  return `${userAgent.slice(0, 60)}…`;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

type SessionColumnActions = {
  currentSessionToken?: string;
  deletingToken: string | null;
  isPending: boolean;
  onDelete: (session: SessionRow) => void;
};

export function createSessionColumns({
  currentSessionToken,
  deletingToken,
  isPending,
  onDelete,
}: SessionColumnActions): ColumnDef<SessionRow>[] {
  return [
    {
      id: "user",
      accessorFn: (row) => row.user.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.user.email}
          </span>
        </div>
      ),
    },
    {
      id: "role",
      accessorFn: (row) => row.user.role,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => row.original.user.role,
    },
    {
      id: "device",
      accessorFn: (row) => formatUserAgent(row.userAgent),
      header: "Device",
      cell: ({ row }) => (
        <span className="max-w-xs truncate text-sm text-muted-foreground">
          {formatUserAgent(row.original.userAgent)}
        </span>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expires" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {dateFormatter.format(new Date(row.original.expiresAt))}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => {
        const isCurrent = row.token === currentSessionToken;
        if (isCurrent && row.impersonatedBy) return "Current, Impersonated";
        if (isCurrent) return "Current";
        if (row.impersonatedBy) return "Impersonated";
        return "Active";
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isCurrent = row.original.token === currentSessionToken;
        return (
          <div className="flex flex-wrap gap-1">
            {isCurrent ? <Badge>Current</Badge> : null}
            {row.original.impersonatedBy ? (
              <Badge variant="secondary">Impersonated</Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const session = row.original;
        const isDeleting = deletingToken === session.token;

        if (!canDeleteSessionToken(session.token, currentSessionToken)) {
          return (
            <div className="text-right text-sm text-muted-foreground">—</div>
          );
        }

        return (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={isPending}
              onClick={() => onDelete(session)}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        );
      },
    },
  ];
}
