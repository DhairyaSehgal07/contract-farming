import { generateId } from "better-auth";
import { parseSetCookieHeader } from "better-auth/cookies";
import { hashPassword } from "better-auth/crypto";
import { Role } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const TEST_PASSWORD = "12345678";

export const MD_TEST_USER = {
  email: "md-integration@example.com",
  name: "Managing Director",
  role: Role.MANAGING_DIRECTOR,
} as const;

export const TARGET_TEST_USER = {
  email: "target-integration@example.com",
  name: "Target User",
  role: Role.USER,
} as const;

export async function resetAuthTables() {
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
}

export async function createTestUser({
  email,
  name,
  role,
  password = TEST_PASSWORD,
}: {
  email: string;
  name: string;
  role: Role;
  password?: string;
}) {
  const userId = generateId();
  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: true,
      role,
      accounts: {
        create: {
          id: generateId(),
          accountId: userId,
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  return { id: userId, email, name, role };
}

function cookieHeaderFromSetCookies(setCookieHeader: string | null): string {
  if (!setCookieHeader) return "";

  const cookies = parseSetCookieHeader(setCookieHeader);
  return Array.from(cookies.entries())
    .map(([name, attributes]) => `${name}=${attributes.value}`)
    .join("; ");
}

function mergeSetCookiesIntoHeaders(
  baseHeaders: Headers,
  setCookieHeader: string | null,
): Headers {
  const merged = new Headers(baseHeaders);
  const cookieHeader = cookieHeaderFromSetCookies(setCookieHeader);
  if (cookieHeader) {
    merged.set("cookie", cookieHeader);
  }
  return merged;
}

export async function signInTestUser(email: string, password = TEST_PASSWORD) {
  const result = await auth.api.signInEmail({
    body: { email, password },
    headers: new Headers(),
    returnHeaders: true,
  });

  const headers = mergeSetCookiesIntoHeaders(
    new Headers(),
    result.headers?.get("set-cookie") ?? null,
  );

  const session = await auth.api.getSession({ headers });

  return {
    headers,
    session,
    response: result.response,
  };
}

export async function signInAsManagingDirector(password = TEST_PASSWORD) {
  return signInTestUser(MD_TEST_USER.email, password);
}

export async function getSessionForHeaders(headers: Headers) {
  return auth.api.getSession({
    headers,
    query: { disableCookieCache: true },
  });
}

export async function findSessionByToken(token: string) {
  return prisma.session.findUnique({ where: { token } });
}

export async function seedDefaultTestUsers() {
  await createTestUser(MD_TEST_USER);
  return createTestUser(TARGET_TEST_USER);
}
