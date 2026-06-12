import { headers } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSessionHistory,
  deleteSession,
} from "@/app/actions/permissions/sessions";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

vi.mock("@/lib/auth/authorization", () => ({
  requireManagingDirectorAdminAction: vi.fn(async () => null),
}));

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      revokeUserSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    session: {
      deleteMany: vi.fn(),
    },
  },
}));

const getSession = vi.mocked(getServerSession);
const getHeaders = vi.mocked(headers);
const revokeUserSession = vi.mocked(auth.api.revokeUserSession);
const deleteMany = vi.mocked(prisma.session.deleteMany);

const currentSession = {
  user: { id: "user-1", name: "Admin", email: "admin@example.com", role: "MANAGING_DIRECTOR" },
  session: {
    id: "session-1",
    token: "current-token",
    userId: "user-1",
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe("deleteSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue(currentSession);
    getHeaders.mockResolvedValue(
      new Headers() as Awaited<ReturnType<typeof headers>>,
    );
    revokeUserSession.mockResolvedValue(
      {} as Awaited<ReturnType<typeof revokeUserSession>>,
    );
  });

  it("rejects deleting the current session", async () => {
    const result = await deleteSession("current-token");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("You cannot delete your current session.");
    }
    expect(revokeUserSession).not.toHaveBeenCalled();
  });

  it("revokes other sessions via Better Auth", async () => {
    const requestHeaders = new Headers({ cookie: "session=abc" });
    getHeaders.mockResolvedValue(
      requestHeaders as Awaited<ReturnType<typeof headers>>,
    );

    const result = await deleteSession("other-token");

    expect(result.success).toBe(true);
    expect(revokeUserSession).toHaveBeenCalledWith({
      body: { sessionToken: "other-token" },
      headers: requestHeaders,
    });
  });

  it("returns auth error when admin check fails", async () => {
    const { requireManagingDirectorAdminAction } = await import(
      "@/lib/auth/authorization"
    );
    vi.mocked(requireManagingDirectorAdminAction).mockResolvedValueOnce({
      success: false,
      error: "You do not have permission to perform this action.",
    });

    const result = await deleteSession("other-token");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
  });
});

describe("clearSessionHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue(currentSession);
    deleteMany.mockResolvedValue({ count: 3 });
  });

  it("deletes all sessions except the current one", async () => {
    const result = await clearSessionHistory();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deletedCount).toBe(3);
    }
    expect(deleteMany).toHaveBeenCalledWith({
      where: { token: { not: "current-token" } },
    });
  });

  it("returns auth error when admin check fails", async () => {
    const { requireManagingDirectorAdminAction } = await import(
      "@/lib/auth/authorization"
    );
    vi.mocked(requireManagingDirectorAdminAction).mockResolvedValueOnce({
      success: false,
      error: "You do not have permission to perform this action.",
    });

    const result = await clearSessionHistory();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
    expect(deleteMany).not.toHaveBeenCalled();
  });
});
