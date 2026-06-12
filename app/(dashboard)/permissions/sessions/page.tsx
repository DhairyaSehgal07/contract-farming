import { listAllSessions } from "@/app/actions/permissions/sessions";
import { SessionsSection } from "@/components/permissions/sessions/sessions-section";
import { getServerSession } from "@/lib/auth/session";

export default async function PermissionsSessionsPage() {
  const session = await getServerSession();
  const result = await listAllSessions();

  if (!result.success) {
    return <p className="text-destructive">{result.error}</p>;
  }

  return (
    <SessionsSection
      sessions={result.data}
      currentSessionToken={session?.session.token}
    />
  );
}
