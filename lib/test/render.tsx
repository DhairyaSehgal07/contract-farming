import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, options);
}

function ColumnCell<TData>({
  column,
  row,
}: {
  column: ColumnDef<TData>;
  row: TData;
}) {
  const table = useReactTable({
    data: [row],
    columns: [column],
    getCoreRowModel: getCoreRowModel(),
  });
  const tableRow = table.getRowModel().rows[0];
  const cell = tableRow.getVisibleCells()[0];

  return <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>;
}

export function renderColumnCell<TData>(
  column: ColumnDef<TData>,
  row: TData,
) {
  return render(<ColumnCell column={column} row={row} />);
}
