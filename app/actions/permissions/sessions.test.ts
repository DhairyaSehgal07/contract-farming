import { headers } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSessionHistory,
  deleteSession,
  listAllSessions,
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
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

const getSession = vi.mocked(getServerSession);
const getHeaders = vi.mocked(headers);
const revokeUserSession = vi.mocked(auth.api.revokeUserSession);
const findMany = vi.mocked(prisma.session.findMany);
const deleteMany = vi.mocked(prisma.session.deleteMany);

const currentSession = {
  user: {
    id: "user-1",
    name: "Admin",
    email: "admin@example.com",
    role: "MANAGING_DIRECTOR",
  },
  session: {
    id: "session-1",
    token: "current-token",
    userId: "user-1",
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const dbSession = {
  id: "session-2",
  token: "other-token",
  expiresAt: new Date("2030-01-01"),
  createdAt: new Date("2026-01-01"),
  ipAddress: "127.0.0.1",
  userAgent: "Mozilla/5.0",
  impersonatedBy: null,
  user: {
    id: "user-2",
    name: "Target User",
    email: "target@example.com",
    role: "USER",
  },
};

describe("listAllSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([dbSession]);
  });

  it("returns mapped session rows when authorized", async () => {
    const result = await listAllSessions();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([
        {
          id: dbSession.id,
          token: dbSession.token,
          expiresAt: dbSession.expiresAt,
          createdAt: dbSession.createdAt,
          ipAddress: dbSession.ipAddress,
          userAgent: dbSession.userAgent,
          impersonatedBy: dbSession.impersonatedBy,
          user: dbSession.user,
        },
      ]);
    }
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  });

  it("returns permission error when admin check fails", async () => {
    const { requireManagingDirectorAdminAction } = await import(
      "@/lib/auth/authorization"
    );
    vi.mocked(requireManagingDirectorAdminAction).mockResolvedValueOnce({
      success: false,
      error: "You do not have permission to perform this action.",
    });

    const result = await listAllSessions();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You do not have permission to perform this action.",
      );
    }
    expect(findMany).not.toHaveBeenCalled();
  });

  it("returns error when database query fails", async () => {
    findMany.mockRejectedValueOnce(new Error("db error"));

    const result = await listAllSessions();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Failed to load sessions.");
    }
  });
});

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

  it("returns sign-in error when there is no active session", async () => {
    getSession.mockResolvedValueOnce(null);

    const result = await deleteSession("other-token");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You must be signed in to perform this action.",
      );
    }
    expect(revokeUserSession).not.toHaveBeenCalled();
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

  it("returns error when revokeUserSession fails", async () => {
    revokeUserSession.mockRejectedValueOnce(new Error("revoke failed"));

    const result = await deleteSession("other-token");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Failed to delete session.");
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

  it("returns zero deleted count when no other sessions exist", async () => {
    deleteMany.mockResolvedValueOnce({ count: 0 });

    const result = await clearSessionHistory();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deletedCount).toBe(0);
    }
  });

  it("returns sign-in error when there is no active session", async () => {
    getSession.mockResolvedValueOnce(null);

    const result = await clearSessionHistory();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "You must be signed in to perform this action.",
      );
    }
    expect(deleteMany).not.toHaveBeenCalled();
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

  it("returns error when database delete fails", async () => {
    deleteMany.mockRejectedValueOnce(new Error("db error"));

    const result = await clearSessionHistory();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Failed to clear session history.");
    }
  });
});
