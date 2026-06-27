import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { DataTable } from "@/components/data-table/data-table";

type Row = { id: number; name: string };

const baseData = Array.from({ length: 25 }, (_, index) => ({
  id: index,
  name: `Farmer ${index}`,
}));

const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "Name" }];

type GroupRow = { id: string; name: string; familyAccount: string };

const groupedColumns: ColumnDef<GroupRow>[] = [
  {
    id: "familyAccount",
    accessorKey: "familyAccount",
    enableGrouping: true,
    header: "Family account",
    cell: ({ row, getValue }) =>
      row.getIsGrouped()
        ? `${String(getValue())} (${row.subRows.length})`
        : String(getValue()),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row, getValue }) => (row.getIsGrouped() ? null : String(getValue())),
  },
];

const groupedData: GroupRow[] = [
  { id: "1", name: "Alice", familyAccount: "100" },
  { id: "2", name: "Bob", familyAccount: "100" },
  { id: "3", name: "Carol", familyAccount: "200" },
];

function UnstableDataTable() {
  const [tick, setTick] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setTick((value) => value + 1)}>
        Rerender {tick}
      </button>
      <DataTable columns={columns} data={[...baseData]} />
    </>
  );
}

describe("DataTable", () => {
  it("enables previous page after clicking next", async () => {
    const user = userEvent.setup();

    render(<DataTable columns={columns} data={baseData} />);

    const previousButton = screen.getByRole("button", { name: "Previous" });
    const nextButton = screen.getByRole("button", { name: "Next" });

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();
    expect(screen.getByText("Farmer 0")).toBeInTheDocument();
    expect(screen.queryByText("Farmer 10")).not.toBeInTheDocument();

    await user.click(nextButton);

    expect(previousButton).toBeEnabled();
    expect(screen.queryByText("Farmer 0")).not.toBeInTheDocument();
    expect(screen.getByText("Farmer 10")).toBeInTheDocument();
  });

  it("keeps pagination when parent rerenders with new data reference", async () => {
    const user = userEvent.setup();

    render(<UnstableDataTable />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    expect(screen.getByText("Farmer 10")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Rerender/ }));

    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    expect(screen.getByText("Farmer 10")).toBeInTheDocument();
  });

  it("returns to first page when filtering", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        columns={columns}
        data={baseData}
        filterColumn="name"
        filterPlaceholder="Search…"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Farmer 10")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search table"), "Farmer 12");

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByText("Farmer 12")).toBeInTheDocument();
    expect(screen.queryByText("Farmer 10")).not.toBeInTheDocument();
  });

  it("supports previous and next round trip", async () => {
    const user = userEvent.setup();

    render(<DataTable columns={columns} data={baseData} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Farmer 10")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Farmer 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("collapses and expands grouped rows", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        columns={groupedColumns}
        data={groupedData}
        grouping={["familyAccount"]}
      />,
    );

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();

    const expandButtons = screen.getAllByRole("button", {
      name: "Expand group",
    });
    expect(expandButtons.length).toBeGreaterThan(0);

    await user.click(expandButtons[0]!);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Collapse group" }));

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("hides pagination when grouping is enabled", () => {
    render(
      <DataTable
        columns={groupedColumns}
        data={groupedData}
        grouping={["familyAccount"]}
      />,
    );

    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();
  });
});
