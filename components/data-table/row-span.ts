import type { Cell, Row } from "@tanstack/react-table";

export type RowSpanCell<TData> = Cell<TData, unknown> & {
  rowSpan?: number;
  isRowSpanned?: boolean;
};

type RowSpanHeader = {
  id: string;
  topRowSpanKey: string | null;
  topRowIndex: number;
};

export function computeRowSpans<TData>(
  rows: Row<TData>[],
  getRowSpanKey: (row: Row<TData>) => string,
) {
  const spanHeaders: RowSpanHeader[] = [];

  rows.forEach((row, rowIndex) => {
    row.getVisibleCells().forEach((cell, columnIndex) => {
      if (!cell.column.columnDef.meta?.enableRowSpan) {
        return;
      }

      let header = spanHeaders.find((item) => item.id === cell.column.id);
      if (!header) {
        header = { id: cell.column.id, topRowSpanKey: null, topRowIndex: 0 };
        spanHeaders.push(header);
      }

      const rowSpanKey = getRowSpanKey(row);
      const spanCell = cell as RowSpanCell<TData>;

      if (header.topRowSpanKey === null || header.topRowSpanKey !== rowSpanKey) {
        spanCell.isRowSpanned = false;
        spanCell.rowSpan = 1;
        header.topRowSpanKey = rowSpanKey;
        header.topRowIndex = rowIndex;
        return;
      }

      const topRow = rows[header.topRowIndex];
      const topCell = topRow?.getVisibleCells()[columnIndex] as
        | RowSpanCell<TData>
        | undefined;

      if (topCell) {
        topCell.rowSpan = (topCell.rowSpan ?? 1) + 1;
      }

      spanCell.isRowSpanned = true;
    });
  });
}
