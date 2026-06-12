/**
 * Integration tests for session revoke, ban, and sign-out behavior.
 *
 * Requires a migrated test database:
 *   TEST_DATABASE_URL=postgres://... pnpm exec prisma migrate deploy
 *   TEST_DATABASE_URL=postgres://... pnpm test:integration
 */
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSessionHistory,
  deleteSession,
} from "@/app/actions/permissions/sessions";
import { auth } from "@/lib/auth";
import {
  getSessionForHeaders,
  resetAuthTables,
  seedDefaultTestUsers,
  signInAsManagingDirector,
  signInTestUser,
  TARGET_TEST_USER,
  TEST_PASSWORD,
} from "@/lib/test/integration-db";
import { proxy } from "@/proxy";

vi.mock("@/lib/auth/authorization", () => ({
  requireManagingDirectorAdminAction: vi.fn(async () => null),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

const getHeaders = vi.mocked(headers);
const hasTestDatabase = Boolean(process.env.TEST_DATABASE_URL);

describe.skipIf(!hasTestDatabase)("session lifecycle integration", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetAuthTables();
    await seedDefaultTestUsers();
  });

  it("revokes a single session and keeps other sessions for the same user", async () => {
    const deviceA = await signInTestUser(TARGET_TEST_USER.email);
    const deviceB = await signInTestUser(TARGET_TEST_USER.email);
    const md = await signInAsManagingDirector();

    const tokenToRevoke = deviceB.session?.session.token;
    if (!tokenToRevoke) throw new Error("Expected target session token");

    await auth.api.revokeUserSession({
      body: { sessionToken: tokenToRevoke },
      headers: md.headers,
    });

    await expect(getSessionForHeaders(deviceB.headers)).resolves.toBeNull();
    await expect(getSessionForHeaders(deviceA.headers)).resolves.not.toBeNull();
    await expect(getSessionForHeaders(md.headers)).resolves.not.toBeNull();
  });

  it("deleteSession server action signs out the target session", async () => {
    const target = await signInTestUser(TARGET_TEST_USER.email);
    const md = await signInAsManagingDirector();
    const targetToken = target.session?.session.token;
    if (!targetToken) throw new Error("Expected target session token");

    getHeaders.mockResolvedValue(
      md.headers as Awaited<ReturnType<typeof headers>>,
    );

    const result = await deleteSession(targetToken);

    expect(result.success).toBe(true);
    await expect(getSessionForHeaders(target.headers)).resolves.toBeNull();
    await expect(getSessionForHeaders(md.headers)).resolves.not.toBeNull();
  });

  it("revokeUserSessions invalidates all sessions for the target user", async () => {
    const deviceA = await signInTestUser(TARGET_TEST_USER.email);
    const deviceB = await signInTestUser(TARGET_TEST_USER.email);
    const md = await signInAsManagingDirector();
    const targetUserId = deviceA.session?.user.id;
    if (!targetUserId) throw new Error("Expected target user id");

    await auth.api.revokeUserSessions({
      body: { userId: targetUserId },
      headers: md.headers,
    });

    await expect(getSessionForHeaders(deviceA.headers)).resolves.toBeNull();
    await expect(getSessionForHeaders(deviceB.headers)).resolves.toBeNull();
    await expect(getSessionForHeaders(md.headers)).resolves.not.toBeNull();
  });

  it("banUser invalidates sessions and blocks sign in", async () => {
    const target = await signInTestUser(TARGET_TEST_USER.email);
    const md = await signInAsManagingDirector();
    const targetUserId = target.session?.user.id;
    if (!targetUserId) throw new Error("Expected target user id");

    await auth.api.banUser({
      body: {
        userId: targetUserId,
        banReason: "Integration test ban",
      },
      headers: md.headers,
    });

    await expect(getSessionForHeaders(target.headers)).resolves.toBeNull();

    await expect(
      signInTestUser(TARGET_TEST_USER.email, TEST_PASSWORD),
    ).rejects.toBeInstanceOf(APIError);
  });

  it("unbanUser restores sign in", async () => {
    const md = await signInAsManagingDirector();
    const target = await signInTestUser(TARGET_TEST_USER.email);
    const targetUserId = target.session?.user.id;
    if (!targetUserId) throw new Error("Expected target user id");

    await auth.api.banUser({
      body: {
        userId: targetUserId,
        banReason: "Integration test ban",
      },
      headers: md.headers,
    });

    await auth.api.unbanUser({
      body: { userId: targetUserId },
      headers: md.headers,
    });

    const restored = await signInTestUser(TARGET_TEST_USER.email);
    await expect(
      getSessionForHeaders(restored.headers),
    ).resolves.not.toBeNull();
  });

  it("clearSessionHistory removes other sessions but keeps the current admin session", async () => {
    const target = await signInTestUser(TARGET_TEST_USER.email);
    const md = await signInAsManagingDirector();

    getHeaders.mockResolvedValue(
      md.headers as Awaited<ReturnType<typeof headers>>,
    );

    const result = await clearSessionHistory();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deletedCount).toBeGreaterThanOrEqual(1);
    }

    await expect(getSessionForHeaders(target.headers)).resolves.toBeNull();
    await expect(getSessionForHeaders(md.headers)).resolves.not.toBeNull();
  });

  it("redirects revoked sessions through proxy to signin", async () => {
    const target = await signInTestUser(TARGET_TEST_USER.email);
    const md = await signInAsManagingDirector();
    const targetToken = target.session?.session.token;
    if (!targetToken) throw new Error("Expected target session token");

    await auth.api.revokeUserSession({
      body: { sessionToken: targetToken },
      headers: md.headers,
    });

    const request = new NextRequest(
      "http://localhost:3000/permissions/sessions",
      {
        headers: {
          cookie: target.headers.get("cookie") ?? "",
        },
      },
    );

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/signin",
    );
  });
});
