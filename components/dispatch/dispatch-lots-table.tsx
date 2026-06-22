"use client";

import { useMemo, useState } from "react";
import type { DispatchLotRow } from "@/app/actions/dispatch/dispatches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDisplayDate } from "@/lib/date";

const PAGE_SIZE = 10;

function formatDate(value: string | null) {
  return formatDisplayDate(value);
}

function formatSizeLabel(name: string) {
  if (/\(mm\)/i.test(name)) {
    return name;
  }
  return `${name} (mm)`;
}

type DispatchLotsTableProps = {
  lots: DispatchLotRow[];
  canWrite: boolean;
  dispatchStatus: "OPEN" | "CLOSED";
  onReceive: (lot: DispatchLotRow) => void;
};

export function DispatchLotsTable({
  lots,
  canWrite,
  dispatchStatus,
  onReceive,
}: DispatchLotsTableProps) {
  const [pageIndex, setPageIndex] = useState(0);

  const pageCount = Math.max(1, Math.ceil(lots.length / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const visibleLots = useMemo(
    () =>
      lots.slice(safePageIndex * PAGE_SIZE, safePageIndex * PAGE_SIZE + PAGE_SIZE),
    [lots, safePageIndex],
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Farmer</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead className="text-center">Generation</TableHead>
              <TableHead className="text-center">Size</TableHead>
              <TableHead className="text-center">Bags</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received on</TableHead>
              <TableHead>Received by</TableHead>
              {canWrite ? <TableHead /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleLots.length ? (
              visibleLots.flatMap((lot) => {
                const lineCount = Math.max(lot.sizeLines.length, 1);
                const canReceive =
                  dispatchStatus === "OPEN" && lot.status === "PENDING";

                if (lot.sizeLines.length === 0) {
                  return (
                    <TableRow key={lot.id}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span>{lot.farmer.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {lot.farmer.accountNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{lot.variety.name}</TableCell>
                      <TableCell className="text-center">—</TableCell>
                      <TableCell className="text-center">—</TableCell>
                      <TableCell className="text-center">—</TableCell>
                      <TableCell className="text-center font-medium tabular-nums">
                        {lot.totalQuantity}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lot.status === "RECEIVED" ? "default" : "outline"
                          }
                        >
                          {lot.status === "RECEIVED" ? "Received" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(lot.receivedAt)}</TableCell>
                      <TableCell>{lot.receivedBy?.name ?? "—"}</TableCell>
                      {canWrite ? (
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canReceive}
                            onClick={() => onReceive(lot)}
                          >
                            Receive
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                }

                return lot.sizeLines.map((line, lineIndex) => (
                  <TableRow key={`${lot.id}-${line.id}`}>
                    {lineIndex === 0 ? (
                      <>
                        <TableCell rowSpan={lineCount}>
                          <div className="flex flex-col gap-0.5">
                            <span>{lot.farmer.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {lot.farmer.accountNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell rowSpan={lineCount}>
                          {lot.variety.name}
                        </TableCell>
                      </>
                    ) : null}
                    <TableCell className="text-center">
                      {line.generation.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatSizeLabel(line.size.name)}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {line.quantity}
                    </TableCell>
                    {lineIndex === 0 ? (
                      <>
                        <TableCell
                          className="text-center font-medium tabular-nums"
                          rowSpan={lineCount}
                        >
                          {lot.totalQuantity}
                        </TableCell>
                        <TableCell rowSpan={lineCount}>
                          <Badge
                            variant={
                              lot.status === "RECEIVED" ? "default" : "outline"
                            }
                          >
                            {lot.status === "RECEIVED"
                              ? "Received"
                              : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell rowSpan={lineCount}>
                          {formatDate(lot.receivedAt)}
                        </TableCell>
                        <TableCell rowSpan={lineCount}>
                          {lot.receivedBy?.name ?? "—"}
                        </TableCell>
                        {canWrite ? (
                          <TableCell rowSpan={lineCount}>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!canReceive}
                              onClick={() => onReceive(lot)}
                            >
                              Receive
                            </Button>
                          </TableCell>
                        ) : null}
                      </>
                    ) : null}
                  </TableRow>
                ));
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={canWrite ? 10 : 9}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {lots.length > PAGE_SIZE ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((current) => current - 1)}
            disabled={safePageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((current) => current + 1)}
            disabled={safePageIndex >= pageCount - 1}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
