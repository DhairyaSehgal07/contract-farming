import { describe, expect, it, vi } from "vitest";
import {
  createSessionColumns,
  formatUserAgent,
} from "@/components/permissions/sessions/session-columns";
import { createSessionRow } from "@/lib/auth/test-utils";
import { renderColumnCell } from "@/lib/test/render";

describe("formatUserAgent", () => {
  it("returns unknown device for null user agent", () => {
    expect(formatUserAgent(null)).toBe("Unknown device");
  });

  it("formats Chrome on macOS", () => {
    expect(
      formatUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0",
      ),
    ).toBe("Chrome on macOS");
  });

  it("truncates very long user agent strings", () => {
    const longAgent = "x".repeat(80);
    expect(formatUserAgent(longAgent)).toBe(`${"x".repeat(60)}…`);
  });
});

describe("createSessionColumns actions", () => {
  const onDelete = vi.fn();

  const columns = createSessionColumns({
    currentSessionToken: "current-token",
    deletingToken: null,
    isPending: false,
    onDelete,
  });

  const actionsColumn = columns.find((column) => column.id === "actions");
  const statusColumn = columns.find((column) => column.id === "status");

  if (!actionsColumn || !statusColumn) {
    throw new Error("Expected session columns to be defined");
  }

  it("shows Current badge for the active session", () => {
    const { getByText } = renderColumnCell(
      statusColumn,
      createSessionRow({ token: "current-token" }),
    );

    expect(getByText("Current")).toBeInTheDocument();
  });

  it("does not render Delete for the current session", () => {
    const { queryByRole, getByText } = renderColumnCell(
      actionsColumn,
      createSessionRow({ token: "current-token" }),
    );

    expect(getByText("—")).toBeInTheDocument();
    expect(queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("renders Delete for non-current sessions", () => {
    const { getByRole } = renderColumnCell(
      actionsColumn,
      createSessionRow({ token: "other-token" }),
    );

    expect(getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
