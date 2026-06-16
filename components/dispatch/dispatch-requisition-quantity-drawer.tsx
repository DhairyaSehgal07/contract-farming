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

type DispatchRequisitionQuantityDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: DispatchableRequisitionRow | null;
  sizes: { id: string; name: string }[];
  initialSizeLines: DispatchSizeLineDraft[];
  onConfirm: (sizeLines: DispatchSizeLineDraft[]) => void;
  onRemove: () => void;
};

type SizeLineRow = {
  key: string;
  sizeId: string;
  quantity: string;
};

function createRow(overrides?: Partial<SizeLineRow>): SizeLineRow {
  return {
    key: crypto.randomUUID(),
    sizeId: "",
    quantity: "",
    ...overrides,
  };
}

function toValidSizeLines(rows: SizeLineRow[]): DispatchSizeLineDraft[] {
  return rows
    .filter((row) => {
      const value = Number.parseFloat(row.quantity);
      return row.sizeId && Number.isFinite(value) && value > 0;
    })
    .map((row) => ({ sizeId: row.sizeId, quantity: row.quantity }));
}

function rowsFromInitial(initialSizeLines: DispatchSizeLineDraft[]): SizeLineRow[] {
  const valid = initialSizeLines.filter((line) => {
    const value = Number.parseFloat(line.quantity);
    return line.sizeId && Number.isFinite(value) && value > 0;
  });

  if (valid.length === 0) {
    return [createRow()];
  }

  return valid.map((line) =>
    createRow({ sizeId: line.sizeId, quantity: line.quantity }),
  );
}

function hasDuplicateSizes(rows: SizeLineRow[]) {
  const selected = rows.map((row) => row.sizeId).filter(Boolean);
  return new Set(selected).size !== selected.length;
}

type SizeLineRowEditorProps = {
  row: SizeLineRow;
  sizes: { id: string; name: string }[];
  usedSizeIds: Set<string>;
  isOverLimit: boolean;
  canRemove: boolean;
  onSizeChange: (sizeId: string) => void;
  onQuantityChange: (quantity: string) => void;
  onRemove: () => void;
};

function SizeLineRowEditor({
  row,
  sizes,
  usedSizeIds,
  isOverLimit,
  canRemove,
  onSizeChange,
  onQuantityChange,
  onRemove,
}: SizeLineRowEditorProps) {
  const availableSizes = sizes.filter(
    (size) => size.id === row.sizeId || !usedSizeIds.has(size.id),
  );

  return (
    <div className="flex items-end gap-2">
      <Field className="min-w-0 flex-1" data-invalid={isOverLimit}>
        <FieldLabel htmlFor={`dispatch-size-${row.key}`}>Size</FieldLabel>
        <Select value={row.sizeId} onValueChange={onSizeChange}>
          <SelectTrigger
            id={`dispatch-size-${row.key}`}
            className="w-full"
            aria-invalid={isOverLimit}
          >
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {availableSizes.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                {size.name}
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
  );
}

export function DispatchRequisitionQuantityDrawer({
  open,
  onOpenChange,
  requisition,
  sizes,
  initialSizeLines,
  onConfirm,
  onRemove,
}: DispatchRequisitionQuantityDrawerProps) {
  const [rows, setRows] = useState<SizeLineRow[]>([createRow()]);

  useEffect(() => {
    if (!open) return;
    setRows(rowsFromInitial(initialSizeLines));
  }, [open, initialSizeLines]);

  const confirmedLines = useMemo(() => toValidSizeLines(rows), [rows]);
  const total = useMemo(() => getSelectionTotal(confirmedLines), [confirmedLines]);
  const remaining = requisition
    ? Number.parseFloat(requisition.remainingQuantity)
    : 0;
  const isOverLimit = total > remaining;
  const hasDuplicate = hasDuplicateSizes(rows);
  const hasPositiveQuantity = confirmedLines.length > 0;
  const isAlreadySelected = initialSizeLines.some((line) => {
    const value = Number.parseFloat(line.quantity);
    return Number.isFinite(value) && value > 0;
  });

  const usedSizeIds = useMemo(
    () => new Set(rows.map((row) => row.sizeId).filter(Boolean)),
    [rows],
  );

  const canAddMore =
    rows.length < sizes.length &&
    rows.every((row) => row.sizeId && Number.parseFloat(row.quantity) > 0);

  function updateRow(key: string, patch: Partial<SizeLineRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
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
    if (!hasPositiveQuantity || isOverLimit || hasDuplicate) return;
    onConfirm(confirmedLines);
    onOpenChange(false);
  }

  if (!requisition) {
    return null;
  }

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
        </DrawerHeader>

        <div className="px-4">
          <FieldSet>
            <FieldDescription>
              Remaining quantity: {requisition.remainingQuantity} bags. Choose a
              size, enter bag count, and add more sizes if needed.
            </FieldDescription>
            <FieldGroup>
              {rows.map((row) => (
                <SizeLineRowEditor
                  key={row.key}
                  row={row}
                  sizes={sizes}
                  usedSizeIds={usedSizeIds}
                  isOverLimit={isOverLimit}
                  canRemove={rows.length > 1}
                  onSizeChange={(sizeId) => updateRow(row.key, { sizeId })}
                  onQuantityChange={(quantity) =>
                    updateRow(row.key, { quantity })
                  }
                  onRemove={() => removeRow(row.key)}
                />
              ))}
            </FieldGroup>

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

            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">
                Total: {total} / {requisition.remainingQuantity}
              </span>
              {hasDuplicate ? (
                <FieldError>Each size can only be selected once.</FieldError>
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
            disabled={!hasPositiveQuantity || isOverLimit || hasDuplicate}
          >
            Confirm quantities
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
