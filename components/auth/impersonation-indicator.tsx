"use client";

import { UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth-client";

export function ImpersonationIndicator() {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();

  if (session?.session.impersonatedBy == null) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-lg border border-destructive/50 bg-background p-3 shadow-lg">
      <p className="text-sm">
        Impersonating{" "}
        <span className="font-medium">{session.user.name}</span>
        {session.user.role ? (
          <span className="text-muted-foreground"> ({session.user.role})</span>
        ) : null}
      </p>
      <BetterAuthActionButton
        size="sm"
        variant="destructive"
        successMessage="Stopped impersonating"
        action={() => authClient.admin.stopImpersonating()}
        onSuccess={() => {
          void refetch();
          router.push("/permissions/users");
          router.refresh();
        }}
      >
        <UserX className="size-4" />
        Stop
      </BetterAuthActionButton>
    </div>
  );
}
