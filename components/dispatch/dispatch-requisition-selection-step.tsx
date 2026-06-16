"use client";

import { useMemo, useState } from "react";
import type { DispatchableRequisitionRow } from "@/app/actions/dispatch/dispatches";
import { DispatchRequisitionQuantityDrawer } from "@/components/dispatch/dispatch-requisition-quantity-drawer";
import {
  type DispatchRequisitionSelectionMap,
  type DispatchSizeLineDraft,
  getSelectionTotal,
  hasValidSelection,
} from "@/components/dispatch/dispatch-form-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import {
  useDispatchableRequisitions,
  useDispatchFormOptions,
} from "@/hooks/dispatch/use-dispatches";
import { parseDateOnly } from "@/lib/date";
import { cn } from "@/lib/utils";

type DispatchRequisitionSelectionStepProps = {
  selections: DispatchRequisitionSelectionMap;
  onSelectionsChange: (selections: DispatchRequisitionSelectionMap) => void;
  onNext: () => void;
};

function formatDate(value: string) {
  return parseDateOnly(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DispatchRequisitionSelectionStep({
  selections,
  onSelectionsChange,
  onNext,
}: DispatchRequisitionSelectionStepProps) {
  const {
    data: requisitions = [],
    isPending,
    isError,
    error,
  } = useDispatchableRequisitions();
  const { data: formOptions } = useDispatchFormOptions();
  const sizes = formOptions?.sizes ?? [];

  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRequisition, setActiveRequisition] =
    useState<DispatchableRequisitionRow | null>(null);

  const filteredRequisitions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requisitions;

    return requisitions.filter((row) => {
      const haystack = [
        row.farmer.name,
        row.farmer.accountNumber,
        row.variety.name,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [requisitions, search]);

  const selectedCount = useMemo(
    () =>
      Array.from(selections.values()).filter((lines) => hasValidSelection(lines))
        .length,
    [selections],
  );

  function openDrawer(requisition: DispatchableRequisitionRow) {
    setActiveRequisition(requisition);
    setDrawerOpen(true);
  }

  function handleConfirm(sizeLines: DispatchSizeLineDraft[]) {
    if (!activeRequisition) return;

    const next = new Map(selections);
    next.set(activeRequisition.id, sizeLines);
    onSelectionsChange(next);
  }

  function handleRemove() {
    if (!activeRequisition) return;

    const next = new Map(selections);
    next.delete(activeRequisition.id);
    onSelectionsChange(next);
    setDrawerOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-lg font-medium">Select requisitions</h3>
        <p className="text-sm text-muted-foreground">
          Click a requisition to enter graded bag counts. Only approved
          requisitions with remaining quantity are shown.
        </p>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by farmer, account, or variety…"
      />

      {isPending ? (
        <MasterTableSkeleton columnCount={3} rowCount={4} />
      ) : isError ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : filteredRequisitions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No dispatchable requisitions found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequisitions.map((requisition) => {
            const sizeLines = selections.get(requisition.id) ?? [];
            const isSelected = hasValidSelection(sizeLines);
            const total = getSelectionTotal(sizeLines);

            return (
              <button
                key={requisition.id}
                type="button"
                className="text-left"
                onClick={() => openDrawer(requisition)}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-shadow hover:shadow-lg",
                    isSelected && "ring-2 ring-primary",
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle>{requisition.farmer.name}</CardTitle>
                      {isSelected ? (
                        <Badge>{total} bags</Badge>
                      ) : null}
                    </div>
                    <CardDescription>
                      Account #{requisition.farmer.accountNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1 text-sm">
                    <span>{requisition.variety.name}</span>
                    <span className="text-muted-foreground">
                      Req. {formatDate(requisition.requisitionDate)}
                    </span>
                    <span className="text-muted-foreground">
                      Remaining: {requisition.remainingQuantity} bags
                    </span>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {selectedCount} requisition{selectedCount === 1 ? "" : "s"} selected
        </p>
        <Button type="button" onClick={onNext} disabled={selectedCount === 0}>
          Next
        </Button>
      </div>

      <DispatchRequisitionQuantityDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        requisition={activeRequisition}
        sizes={sizes}
        initialSizeLines={
          activeRequisition ? (selections.get(activeRequisition.id) ?? []) : []
        }
        onConfirm={handleConfirm}
        onRemove={handleRemove}
      />
    </div>
  );
}
