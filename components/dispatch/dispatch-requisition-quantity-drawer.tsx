"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DispatchableRequisitionRow } from "@/app/actions/dispatch/dispatches";
import type { DispatchSizeLineDraft } from "@/components/dispatch/dispatch-form-types";
import { getSelectionTotal } from "@/components/dispatch/dispatch-form-types";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { RequisitionRemarksDisplay } from "@/components/requisition/requisition-remarks-display";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseDateOnly } from "@/lib/date";
import {
  getMaxBagsForRemainingAcres,
  getRemainingAcres,
  getRemainingBagsForSize,
  isAcresBasedRequisition,
} from "@/lib/requisition/quantity";

type DispatchSizeOption = {
  id: string;
  name: string;
  bagsPerAcre: number | null;
};

type DispatchGenerationOption = {
  id: string;
  name: string;
};

type DispatchRequisitionQuantityDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: DispatchableRequisitionRow | null;
  sizes: DispatchSizeOption[];
  generations: DispatchGenerationOption[];
  initialSizeLines: DispatchSizeLineDraft[];
  onConfirm: (sizeLines: DispatchSizeLineDraft[]) => void;
  onRemove: () => void;
};

type SizeLineRow = {
  key: string;
  sizeId: string;
  generationId: string;
  quantity: string;
};

function createRow(overrides?: Partial<SizeLineRow>): SizeLineRow {
  return {
    key: crypto.randomUUID(),
    sizeId: "",
    generationId: "",
    quantity: "",
    ...overrides,
  };
}

function toValidSizeLines(rows: SizeLineRow[]): DispatchSizeLineDraft[] {
  return rows
    .filter((row) => {
      const value = Number.parseFloat(row.quantity);
      return (
        row.sizeId &&
        row.generationId &&
        Number.isFinite(value) &&
        value > 0
      );
    })
    .map((row) => ({
      sizeId: row.sizeId,
      generationId: row.generationId,
      quantity: row.quantity,
    }));
}

function rowsFromInitial(initialSizeLines: DispatchSizeLineDraft[]): SizeLineRow[] {
  const valid = initialSizeLines.filter((line) => {
    const value = Number.parseFloat(line.quantity);
    return (
      line.sizeId &&
      line.generationId &&
      Number.isFinite(value) &&
      value > 0
    );
  });

  if (valid.length === 0) {
    return [createRow()];
  }

  return valid.map((line) =>
    createRow({
      sizeId: line.sizeId,
      generationId: line.generationId,
      quantity: line.quantity,
    }),
  );
}

function hasDuplicateSizeGeneration(rows: SizeLineRow[]) {
  const selected = rows
    .filter((row) => row.sizeId && row.generationId)
    .map((row) => `${row.sizeId}:${row.generationId}`);
  return new Set(selected).size !== selected.length;
}

function getSuggestedQuantity(
  requisition: DispatchableRequisitionRow,
  size: DispatchSizeOption | undefined,
) {
  if (!size || !isAcresBasedRequisition(requisition)) {
    return "";
  }

  const remaining = getRemainingBagsForSize(requisition, size);
  return remaining !== null && remaining > 0 ? String(remaining) : "";
}

type SizeLineRowEditorProps = {
  row: SizeLineRow;
  sizes: DispatchSizeOption[];
  generations: DispatchGenerationOption[];
  usedCombinationKeys: Set<string>;
  isOverLimit: boolean;
  missingStandard: boolean;
  canRemove: boolean;
  onSizeChange: (sizeId: string) => void;
  onGenerationChange: (generationId: string) => void;
  onQuantityChange: (quantity: string) => void;
  onRemove: () => void;
};

function SizeLineRowEditor({
  row,
  sizes,
  generations,
  usedCombinationKeys,
  isOverLimit,
  missingStandard,
  canRemove,
  onSizeChange,
  onGenerationChange,
  onQuantityChange,
  onRemove,
}: SizeLineRowEditorProps) {
  const combinationKey =
    row.sizeId && row.generationId
      ? `${row.sizeId}:${row.generationId}`
      : null;
  const isDuplicateCombination =
    combinationKey !== null && usedCombinationKeys.has(combinationKey);

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex items-end gap-2">
        <Field
          className="min-w-0 flex-1"
          data-invalid={isOverLimit || missingStandard || isDuplicateCombination}
        >
          <FieldLabel htmlFor={`dispatch-size-${row.key}`}>Size</FieldLabel>
          <Select value={row.sizeId} onValueChange={onSizeChange}>
            <SelectTrigger
              id={`dispatch-size-${row.key}`}
              className="w-full"
              aria-invalid={
                isOverLimit || missingStandard || isDuplicateCombination
              }
            >
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name}
                  {size.bagsPerAcre != null
                    ? ` (${size.bagsPerAcre} bags/acre)`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          className="min-w-0 flex-1"
          data-invalid={isDuplicateCombination}
        >
          <FieldLabel htmlFor={`dispatch-generation-${row.key}`}>
            Generation
          </FieldLabel>
          <Select value={row.generationId} onValueChange={onGenerationChange}>
            <SelectTrigger
              id={`dispatch-generation-${row.key}`}
              className="w-full"
              aria-invalid={isDuplicateCombination}
            >
              <SelectValue placeholder="Select generation" />
            </SelectTrigger>
            <SelectContent>
              {generations.map((generation) => (
                <SelectItem key={generation.id} value={generation.id}>
                  {generation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field className="w-28 shrink-0" data-invalid={isOverLimit}>
          <FieldLabel htmlFor={`dispatch-qty-${row.key}`}>Bags</FieldLabel>
          <Input
            id={`dispatch-qty-${row.key}`}
            inputMode="decimal"
            placeholder="0"
            value={row.quantity}
            onChange={(event) => onQuantityChange(event.target.value)}
            aria-invalid={isOverLimit}
          />
        </Field>

        {canRemove ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={onRemove}
            aria-label="Remove size line"
          >
            <Trash2 />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function DispatchRequisitionQuantityDrawer({
  open,
  onOpenChange,
  requisition,
  sizes,
  generations,
  initialSizeLines,
  onConfirm,
  onRemove,
}: DispatchRequisitionQuantityDrawerProps) {
  const [rows, setRows] = useState<SizeLineRow[]>([createRow()]);
  const isAcresBased = requisition
    ? isAcresBasedRequisition(requisition)
    : false;

  useEffect(() => {
    if (!open || !requisition) return;

    const fromInitial = rowsFromInitial(initialSizeLines);
    const hasInitialSelection = fromInitial.some((row) => row.sizeId);

    if (hasInitialSelection) {
      setRows(fromInitial);
      return;
    }

    setRows(fromInitial);
  }, [open, initialSizeLines, requisition]);

  const confirmedLines = useMemo(() => toValidSizeLines(rows), [rows]);
  const total = useMemo(() => getSelectionTotal(confirmedLines), [confirmedLines]);

  const activeSize = useMemo(
    () => sizes.find((size) => size.id === rows[0]?.sizeId),
    [rows, sizes],
  );

  const remainingAcres = useMemo(() => {
    if (!requisition || !isAcresBased) return null;
    return getRemainingAcres(requisition);
  }, [requisition, isAcresBased]);

  const remaining = useMemo(() => {
    if (!requisition) return null;
    if (!isAcresBased) {
      return requisition.remainingQuantity
        ? Number.parseFloat(requisition.remainingQuantity)
        : 0;
    }
    if (!activeSize) return null;
    return getRemainingBagsForSize(requisition, activeSize);
  }, [requisition, isAcresBased, activeSize]);

  const maxBagsForSize = useMemo(() => {
    if (
      remainingAcres === null ||
      !activeSize?.bagsPerAcre ||
      remainingAcres <= 0
    ) {
      return null;
    }
    return getMaxBagsForRemainingAcres(remainingAcres, activeSize.bagsPerAcre);
  }, [remainingAcres, activeSize]);

  const isOverLimit =
    remaining !== null && Number.isFinite(remaining) && total > remaining;
  const hasDuplicate = hasDuplicateSizeGeneration(rows);
  const hasPositiveQuantity = confirmedLines.length > 0;
  const missingStandard =
    isAcresBased && Boolean(activeSize) && activeSize?.bagsPerAcre == null;
  const hasIncompleteRows = rows.some(
    (row) =>
      (row.sizeId || row.generationId || row.quantity) &&
      !(row.sizeId && row.generationId && Number.parseFloat(row.quantity) > 0),
  );
  const isAlreadySelected = initialSizeLines.some((line) => {
    const value = Number.parseFloat(line.quantity);
    return (
      line.sizeId &&
      line.generationId &&
      Number.isFinite(value) &&
      value > 0
    );
  });

  const duplicateCombinationKeys = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      if (row.sizeId && row.generationId) {
        const key = `${row.sizeId}:${row.generationId}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return new Set(
      Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([key]) => key),
    );
  }, [rows]);

  const canAddMore =
    !isAcresBased &&
    rows.every(
      (row) =>
        row.sizeId &&
        row.generationId &&
        Number.parseFloat(row.quantity) > 0,
    );

  function updateRow(key: string, patch: Partial<SizeLineRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function handleSizeChange(key: string, sizeId: string) {
    if (!requisition) return;

    const size = sizes.find((item) => item.id === sizeId);
    const quantity = getSuggestedQuantity(requisition, size);
    updateRow(key, { sizeId, quantity });
  }

  function addRow() {
    setRows((current) => [...current, createRow()]);
  }

  function removeRow(key: string) {
    setRows((current) => {
      const next = current.filter((row) => row.key !== key);
      return next.length > 0 ? next : [createRow()];
    });
  }

  function handleConfirm() {
    if (
      !hasPositiveQuantity ||
      isOverLimit ||
      hasDuplicate ||
      missingStandard
    ) {
      return;
    }
    onConfirm(confirmedLines);
    onOpenChange(false);
  }

  if (!requisition) {
    return null;
  }

  const remainingLabel = isAcresBased
    ? remainingAcres !== null && activeSize && remaining !== null
      ? `${remainingAcres} acres remaining · up to ${remaining} bags for ${activeSize.name}`
      : remainingAcres !== null
        ? `${remainingAcres} acres remaining — select a size to calculate bags`
        : "Select a size to calculate bags"
    : `${requisition.remainingQuantity} bags remaining`;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{requisition.farmer.name}</DrawerTitle>
          <DrawerDescription>
            Account #{requisition.farmer.accountNumber} · {requisition.variety.name}{" "}
            · Req.{" "}
            {parseDateOnly(requisition.requisitionDate).toLocaleDateString(
              "en-IN",
              { day: "2-digit", month: "short", year: "numeric" },
            )}
          </DrawerDescription>
          {requisition.remarks ? (
            <RequisitionRemarksDisplay
              remarks={requisition.remarks}
              variant="detail"
            />
          ) : null}
        </DrawerHeader>

        <div className="px-4">
          <FieldSet>
            <FieldDescription>
              {remainingLabel}.{" "}
              {isAcresBased
                ? "Select size and generation for this lot. Bags default to the max for remaining acres — adjust lower for partial dispatch."
                : "Choose size, generation, and bag count for each line."}
            </FieldDescription>
            <FieldGroup>
              {rows.map((row) => (
                <SizeLineRowEditor
                  key={row.key}
                  row={row}
                  sizes={sizes}
                  generations={generations}
                  usedCombinationKeys={duplicateCombinationKeys}
                  isOverLimit={isOverLimit}
                  missingStandard={missingStandard && row.sizeId === activeSize?.id}
                  canRemove={!isAcresBased && rows.length > 1}
                  onSizeChange={(sizeId) => handleSizeChange(row.key, sizeId)}
                  onGenerationChange={(generationId) =>
                    updateRow(row.key, { generationId })
                  }
                  onQuantityChange={(quantity) =>
                    updateRow(row.key, { quantity })
                  }
                  onRemove={() => removeRow(row.key)}
                />
              ))}
            </FieldGroup>

            {isAcresBased &&
            remainingAcres !== null &&
            activeSize &&
            activeSize.bagsPerAcre != null ? (
              <p className="text-sm text-muted-foreground">
                {remainingAcres} acres remaining × {activeSize.bagsPerAcre}{" "}
                bags/acre = {maxBagsForSize ?? 0} bags max
              </p>
            ) : null}

            {!isAcresBased ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                disabled={!canAddMore}
              >
                <Plus />
                Add more
              </Button>
            ) : null}

            <div className="flex flex-col gap-1 text-sm">
              {!isAcresBased && requisition.initialQuantity ? (
                <span className="text-muted-foreground">
                  Total: {total} / {requisition.initialQuantity}
                </span>
              ) : null}
              {isAcresBased && maxBagsForSize !== null ? (
                <span className="text-muted-foreground">
                  Dispatching: {total} / {maxBagsForSize} bags
                </span>
              ) : null}
              {hasDuplicate ? (
                <FieldError>
                  Each size and generation combination can only be used once.
                </FieldError>
              ) : null}
              {hasIncompleteRows ? (
                <FieldError>
                  Complete size, generation, and bag count for each line.
                </FieldError>
              ) : null}
              {missingStandard ? (
                <FieldError>
                  Selected size does not have a bags-per-acre standard.
                </FieldError>
              ) : null}
              {isOverLimit ? (
                <FieldError>
                  Total exceeds remaining quantity.
                </FieldError>
              ) : null}
            </div>
          </FieldSet>
        </div>

        <DrawerFooter>
          {isAlreadySelected ? (
            <Button type="button" variant="outline" onClick={onRemove}>
              Remove from dispatch
            </Button>
          ) : (
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          )}
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={
              !hasPositiveQuantity ||
              isOverLimit ||
              hasDuplicate ||
              missingStandard ||
              hasIncompleteRows
            }
          >
            Confirm quantities
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
