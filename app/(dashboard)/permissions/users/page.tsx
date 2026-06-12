import { headers } from "next/headers";
import { UsersSection } from "@/components/permissions/users/users-section";
import { auth } from "@/lib/auth";
import { sessionCanManageUsers } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";

export default async function PermissionsUsersPage() {
  const session = await getServerSession();
  const headerList = await headers();
  const canManageUsers = session ? await sessionCanManageUsers(session) : false;

  const usersResult = await auth.api.listUsers({
    headers: headerList,
    query: {
      limit: 100,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });

  const users = usersResult.users ?? [];

  return (
    <UsersSection
      users={users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        banned: user.banned,
        createdAt: user.createdAt,
      }))}
      selfId={session?.user.id ?? ""}
      canManageUsers={canManageUsers}
    />
  );
}
