"use client";

import type { PermissionsUser } from "@/components/permissions/users/user-row";
import { UserRow } from "@/components/permissions/users/user-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UsersSectionProps = {
  users: PermissionsUser[];
  selfId: string;
};

export function UsersSection({ users, selfId }: UsersSectionProps) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No users found.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserRow key={user.id} user={user} selfId={selfId} />
        ))}
      </TableBody>
    </Table>
  );
}
