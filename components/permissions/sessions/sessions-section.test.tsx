import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSessionHistory,
  deleteSession,
} from "@/app/actions/permissions/sessions";
import { SessionsSection } from "@/components/permissions/sessions/sessions-section";
import { createSessionRow } from "@/lib/auth/test-utils";
import { mockRefresh } from "@/lib/test/navigation-mocks";

vi.mock("@/app/actions/permissions/sessions", () => ({
  deleteSession: vi.fn(),
  clearSessionHistory: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const deleteSessionMock = vi.mocked(deleteSession);
const clearSessionHistoryMock = vi.mocked(clearSessionHistory);

describe("SessionsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteSessionMock.mockResolvedValue({ success: true, data: undefined });
    clearSessionHistoryMock.mockResolvedValue({
      success: true,
      data: { deletedCount: 2 },
    });
  });

  it("renders empty state when there are no sessions", () => {
    render(
      <SessionsSection sessions={[]} currentSessionToken="current-token" />,
    );

    expect(screen.getByText("No active sessions found.")).toBeInTheDocument();
  });

  it("does not render Delete for the current session row", () => {
    render(
      <SessionsSection
        sessions={[
          createSessionRow({ token: "current-token" }),
          createSessionRow({
            id: "session-2",
            token: "other-token",
            user: {
              id: "user-2",
              name: "Other User",
              email: "other@example.com",
              role: "USER",
            },
          }),
        ]}
        currentSessionToken="current-token"
      />,
    );

    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(1);
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("deletes another session after confirmation", async () => {
    const user = userEvent.setup();

    render(
      <SessionsSection
        sessions={[
          createSessionRow({ token: "current-token" }),
          createSessionRow({
            id: "session-2",
            token: "other-token",
            user: {
              id: "user-2",
              name: "Other User",
              email: "other@example.com",
              role: "USER",
            },
          }),
        ]}
        currentSessionToken="current-token"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteSessionMock).toHaveBeenCalledWith("other-token");
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows an error toast when deleteSession fails", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    deleteSessionMock.mockResolvedValueOnce({
      success: false,
      error: "Failed to delete session.",
    });

    render(
      <SessionsSection
        sessions={[
          createSessionRow({ token: "current-token" }),
          createSessionRow({
            id: "session-2",
            token: "other-token",
          }),
        ]}
        currentSessionToken="current-token"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to delete session.");
    });
  });

  it("disables clear history when only the current session exists", () => {
    render(
      <SessionsSection
        sessions={[createSessionRow({ token: "current-token" })]}
        currentSessionToken="current-token"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Clear session history" }),
    ).toBeDisabled();
  });

  it("clears session history after confirmation", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");

    render(
      <SessionsSection
        sessions={[
          createSessionRow({ token: "current-token" }),
          createSessionRow({ id: "session-2", token: "other-token" }),
        ]}
        currentSessionToken="current-token"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Clear session history" }),
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(clearSessionHistoryMock).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith("Cleared 2 sessions");
    expect(mockRefresh).toHaveBeenCalled();
  });
});
