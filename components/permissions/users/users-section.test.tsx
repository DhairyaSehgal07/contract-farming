import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPermissionsUser } from "@/lib/auth/test-utils";
import { mockRefresh } from "@/lib/test/navigation-mocks";

const { revokeUserSessions, banUser } = vi.hoisted(() => ({
  revokeUserSessions: vi.fn(),
  banUser: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ refetch: vi.fn() }),
    admin: {
      revokeUserSessions,
      banUser,
      unbanUser: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      setUserPassword: vi.fn(),
      removeUser: vi.fn(),
      impersonateUser: vi.fn(),
      setRole: vi.fn(),
    },
  },
}));

import { UsersSection } from "@/components/permissions/users/users-section";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  },
}));

describe("UsersSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    revokeUserSessions.mockResolvedValue({ error: null });
    banUser.mockResolvedValue({ error: null });
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("does not show actions for the signed-in user", () => {
    render(
      <UsersSection
        users={[createPermissionsUser({ id: "self-1", name: "You User" })]}
        selfId="self-1"
        canManageUsers
      />,
    );

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "User actions" }),
    ).not.toBeInTheDocument();
  });

  it("revokes sessions for another user", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    render(
      <UsersSection
        users={[
          createPermissionsUser({ id: "self-1", name: "Admin" }),
          createPermissionsUser({ id: "user-2", name: "Target User" }),
        ]}
        selfId="self-1"
        canManageUsers
      />,
    );

    const actionButtons = screen.getAllByRole("button", {
      name: "User actions",
    });
    await user.click(actionButtons[0]);
    await user.click(screen.getByText("Revoke sessions"));

    await waitFor(() => {
      expect(revokeUserSessions).toHaveBeenCalledWith({ userId: "user-2" });
    });
    expect(toast.success).toHaveBeenCalledWith("User sessions revoked");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("bans a user after confirmation", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    render(
      <UsersSection
        users={[createPermissionsUser({ id: "user-2", name: "Target User" })]}
        selfId="self-1"
        canManageUsers
      />,
    );

    await user.click(screen.getByRole("button", { name: "User actions" }));
    await user.click(screen.getByText("Ban"));

    await waitFor(() => {
      expect(banUser).toHaveBeenCalledWith({
        userId: "user-2",
        banReason: "Banned by administrator",
      });
    });
    expect(toast.success).toHaveBeenCalledWith("User banned");
  });

  it("does not ban when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("confirm", vi.fn(() => false));

    render(
      <UsersSection
        users={[createPermissionsUser({ id: "user-2", name: "Target User" })]}
        selfId="self-1"
        canManageUsers
      />,
    );

    await user.click(screen.getByRole("button", { name: "User actions" }));
    await user.click(screen.getByText("Ban"));

    expect(banUser).not.toHaveBeenCalled();
  });

  it("shows an error toast when revoke sessions fails", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    revokeUserSessions.mockResolvedValueOnce({
      error: { message: "Revoke failed" },
    });

    render(
      <UsersSection
        users={[createPermissionsUser({ id: "user-2", name: "Target User" })]}
        selfId="self-1"
        canManageUsers
      />,
    );

    await user.click(screen.getByRole("button", { name: "User actions" }));
    await user.click(screen.getByText("Revoke sessions"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Revoke failed");
    });
  });
});
