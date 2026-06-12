import { MANAGING_DIRECTOR_ROLE } from "@/lib/auth/roles";

export function canDeleteSessionToken(
  token: string,
  currentToken?: string,
): boolean {
  return token !== currentToken;
}

export function canShowUserAdminActions(
  userId: string,
  selfId: string,
  canManageUsers: boolean,
): boolean {
  if (userId === selfId) return false;
  return canManageUsers;
}

export function isUserBanProtected(role?: string | null): boolean {
  return role === MANAGING_DIRECTOR_ROLE;
}
