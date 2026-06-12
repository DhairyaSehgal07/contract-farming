"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  clearSessionHistory,
  deleteSession,
  type SessionRow,
} from "@/app/actions/permissions/sessions";
import { DataTable } from "@/components/data-table/data-table";
import { DeleteConfirmDialog } from "@/components/master/delete-confirm-dialog";
import { createSessionColumns } from "@/components/permissions/sessions/session-columns";
import { Button } from "@/components/ui/button";

type SessionsSectionProps = {
  sessions: SessionRow[];
  currentSessionToken?: string;
};

export function SessionsSection({
  sessions,
  currentSessionToken,
}: SessionsSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SessionRow | null>(null);
  const [deletingToken, setDeletingToken] = useState<string | null>(null);
  const [clearingHistory, setClearingHistory] = useState(false);

  const deletableCount = sessions.filter(
    (session) => session.token !== currentSessionToken,
  ).length;

  const columns = useMemo<ColumnDef<SessionRow>[]>(
    () =>
      createSessionColumns({
        currentSessionToken,
        deletingToken,
        isPending,
        onDelete: setDeleteTarget,
      }),
    [currentSessionToken, deletingToken, isPending],
  );

  function handleDeleteSession() {
    if (!deleteTarget) return;

    const token = deleteTarget.token;
    setDeletingToken(token);
    startTransition(async () => {
      const result = await deleteSession(token);
      setDeletingToken(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDeleteTarget(null);
      toast.success("Session deleted");
      router.refresh();
    });
  }

  function handleClearHistory() {
    setClearingHistory(true);
    startTransition(async () => {
      const result = await clearSessionHistory();
      setClearingHistory(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setClearOpen(false);
      if (result.data.deletedCount === 0) {
        toast.success("No other sessions to clear");
      } else {
        toast.success(
          `Cleared ${result.data.deletedCount} session${result.data.deletedCount === 1 ? "" : "s"}`,
        );
      }
      router.refresh();
    });
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No active sessions found.</p>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {sessions.length} session{sessions.length === 1 ? "" : "s"}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={deletableCount === 0 || isPending}
          onClick={() => setClearOpen(true)}
        >
          {clearingHistory ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Clear session history"
          )}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sessions}
        filterColumn="user"
        filterPlaceholder="Search sessions by user…"
      />

      <DeleteConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear session history"
        description="This will sign out all users except you and remove their session records. This cannot be undone."
        onConfirm={handleClearHistory}
        isPending={clearingHistory}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete session"
        description={
          deleteTarget
            ? `Delete this session for ${deleteTarget.user.name}? They will be signed out on that device.`
            : ""
        }
        onConfirm={handleDeleteSession}
        isPending={deletingToken !== null}
      />
    </>
  );
}
