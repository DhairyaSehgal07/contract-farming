import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  createUserColumns,
  type PermissionsUser,
} from "@/components/permissions/users/user-columns";
import { createPermissionsUser } from "@/lib/auth/test-utils";
import { renderColumnCell } from "@/lib/test/render";

const noop = vi.fn();

function createActions() {
  return {
    selfId: "self-1",
    canManageUsers: true,
    pendingUserId: null,
    onEdit: noop,
    onDelete: noop,
    onImpersonate: noop,
    onSetRole: noop,
    onRevokeSessions: noop,
    onBan: noop,
    onUnban: noop,
  };
}

describe("createUserColumns actions", () => {
  const actionsColumn = createUserColumns(createActions()).find(
    (column) => column.id === "actions",
  );

  if (!actionsColumn) {
    throw new Error("Expected actions column to be defined");
  }

  it("shows You for the signed-in user", () => {
    const { getByText } = renderColumnCell(
      actionsColumn,
      createPermissionsUser({ id: "self-1" }),
    );

    expect(getByText("You")).toBeInTheDocument();
  });

  it("shows admin actions for another active user", async () => {
    const user = userEvent.setup();
    const onBan = vi.fn();
    const column = createUserColumns({
      ...createActions(),
      onBan,
    }).find((col) => col.id === "actions");
    if (!column) throw new Error("Expected actions column");

    renderColumnCell(
      column,
      createPermissionsUser({ id: "user-2", name: "Other User" }),
    );

    await user.click(screen.getByRole("button", { name: "User actions" }));
    expect(screen.getByText("Revoke sessions")).toBeInTheDocument();
    expect(screen.getByText("Ban")).toBeInTheDocument();
    expect(screen.queryByText("Unban")).not.toBeInTheDocument();
  });

  it("shows Unban for a banned user", async () => {
    const user = userEvent.setup();
    const column = createUserColumns(createActions()).find(
      (col) => col.id === "actions",
    );
    if (!column) throw new Error("Expected actions column");

    renderColumnCell(
      column,
      createPermissionsUser({ id: "user-2", banned: true }),
    );

    await user.click(screen.getByRole("button", { name: "User actions" }));
    expect(screen.getByText("Unban")).toBeInTheDocument();
    expect(screen.queryByText("Ban")).not.toBeInTheDocument();
  });

  it("does not show ban or impersonate actions for managing director rows", async () => {
    const user = userEvent.setup();
    const column = createUserColumns(createActions()).find(
      (col) => col.id === "actions",
    );
    if (!column) throw new Error("Expected actions column");

    renderColumnCell(
      column,
      createPermissionsUser({
        id: "user-md",
        role: "MANAGING_DIRECTOR",
        name: "Director",
      }),
    );

    await user.click(screen.getByRole("button", { name: "User actions" }));
    expect(screen.getByText("Revoke sessions")).toBeInTheDocument();
    expect(screen.queryByText("Ban")).not.toBeInTheDocument();
    expect(screen.queryByText("Impersonate")).not.toBeInTheDocument();
    expect(screen.queryByText("Set role")).not.toBeInTheDocument();
  });

  it("shows a dash when user management is disabled", () => {
    const column = createUserColumns({
      ...createActions(),
      canManageUsers: false,
    }).find((col) => col.id === "actions");
    if (!column) throw new Error("Expected actions column");

    const { getByText } = renderColumnCell(
      column,
      createPermissionsUser({ id: "user-2" }) as PermissionsUser,
    );

    expect(getByText("—")).toBeInTheDocument();
  });
});
