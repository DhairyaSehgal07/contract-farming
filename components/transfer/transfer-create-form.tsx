"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DatePickerInput } from "@/components/date-picker";
import {
  type ComboboxOption,
  SearchableComboboxField,
} from "@/components/searchable-combobox-option";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateStockTransfer,
  useFarmerStock,
  useTransferableFarmers,
  useTransferDestinationFarmers,
} from "@/hooks/transfer/use-stock-transfers";
import { parseDateOnly } from "@/lib/date";
import {
  createStockTransferSchema,
  type CreateStockTransferInput,
} from "@/lib/schemas/transfer/stock-transfer";

function stockLineKey(
  varietyId: string,
  sizeId: string,
  generationId: string,
) {
  return `${varietyId}:${sizeId}:${generationId}`;
}

const emptyValues = {
  transferDate: new Date().toISOString().slice(0, 10),
  fromFarmerId: "",
  toFarmerId: "",
  remarks: "",
};

function validateTransferForm(values: typeof emptyValues) {
  if (!values.transferDate.trim()) {
    return "Transfer date is required.";
  }
  if (!values.fromFarmerId) {
    return "Source farmer is required.";
  }
  if (!values.toFarmerId) {
    return "Destination farmer is required.";
  }
  if (values.fromFarmerId === values.toFarmerId) {
    return "Source and destination farmers must be different.";
  }
  return undefined;
}

export function TransferCreateForm() {
  const router = useRouter();
  const createMutation = useCreateStockTransfer();
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const [lineQuantities, setLineQuantities] = useState<Record<string, string>>(
    {},
  );
  const [fromFarmerId, setFromFarmerId] = useState("");

  const { data: transferableFarmers = [] } = useTransferableFarmers();
  const { data: destinationFarmers = [] } = useTransferDestinationFarmers(
    fromFarmerId || null,
    { enabled: Boolean(fromFarmerId) },
  );
  const { data: farmerStock = [], isPending: stockPending } = useFarmerStock(
    fromFarmerId || null,
    { enabled: Boolean(fromFarmerId) },
  );

  const sourceFarmerOptions = useMemo<ComboboxOption[]>(
    () =>
      transferableFarmers.map((farmer) => ({
        id: farmer.id,
        label: `${farmer.name} (Account #${farmer.accountNumber})`,
        name: farmer.name,
        accountNumber: farmer.accountNumber,
      })),
    [transferableFarmers],
  );

  const destinationFarmerOptions = useMemo<ComboboxOption[]>(
    () =>
      destinationFarmers.map((farmer) => ({
        id: farmer.id,
        label: `${farmer.name} (Account #${farmer.accountNumber})`,
        name: farmer.name,
        accountNumber: farmer.accountNumber,
      })),
    [destinationFarmers],
  );

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      const formError = validateTransferForm(value);
      if (formError) {
        toast.error(formError);
        return;
      }

      const lines = farmerStock
        .map((row) => {
          const key = stockLineKey(row.varietyId, row.sizeId, row.generationId);
          const quantity = lineQuantities[key]?.trim();
          if (!quantity) return null;

          return {
            varietyId: row.varietyId,
            sizeId: row.sizeId,
            generationId: row.generationId,
            quantity,
          };
        })
        .filter((line): line is NonNullable<typeof line> => line !== null);

      const payload: CreateStockTransferInput = {
        ...value,
        lines,
      };

      const parsed = createStockTransferSchema.safeParse(payload);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid input.");
        return;
      }

      createMutation.mutate(parsed.data, {
        onSuccess: (data) => {
          router.push(`/transfer/${data.id}`);
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/transfer">
            <ArrowLeft />
            <span className="sr-only">Back to transfers</span>
          </Link>
        </Button>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-medium">New transfer</h2>
          <p className="text-muted-foreground">
            Move received bags from one farmer to another.
          </p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Transfer details</CardTitle>
            <CardDescription>
              Select farmers and enter quantities to transfer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <form.Field name="fromFarmerId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="transfer-from-farmer">
                        Source farmer
                      </FieldLabel>
                      <SearchableComboboxField
                        id="transfer-from-farmer"
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => {
                          field.handleChange(value);
                          setFromFarmerId(value);
                          setLineQuantities({});
                          form.setFieldValue("toFarmerId", "");
                        }}
                        onBlur={field.handleBlur}
                        isInvalid={isInvalid}
                        options={sourceFarmerOptions}
                        placeholder="Select farmer with stock"
                        emptyMessage="No farmers with transferable stock."
                        portalContainer={portalContainerRef}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="toFarmerId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="transfer-to-farmer">
                        Destination farmer
                      </FieldLabel>
                      <SearchableComboboxField
                        id="transfer-to-farmer"
                        name={field.name}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        onBlur={field.handleBlur}
                        isInvalid={isInvalid}
                        options={destinationFarmerOptions}
                        placeholder="Select receiving farmer"
                        emptyMessage="No farmers found."
                        disabled={!fromFarmerId}
                        portalContainer={portalContainerRef}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="transferDate">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const selectedDate = field.state.value
                    ? parseDateOnly(field.state.value)
                    : undefined;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Transfer date</FieldLabel>
                      <DatePickerInput
                        value={selectedDate}
                        onDateChange={field.handleChange}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid ? (
                        <FieldError errors={field.state.meta.errors} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="remarks">
                {(field) => (
                  <Field>
                    <FieldLabel>Remarks</FieldLabel>
                    <Textarea
                      value={field.state.value ?? ""}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Optional notes about this transfer"
                    />
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {fromFarmerId ? (
          <Card>
            <CardHeader>
              <CardTitle>Available stock</CardTitle>
              <CardDescription>
                Enter the number of bags to transfer for each line.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockPending ? (
                <p className="text-sm text-muted-foreground">Loading stock…</p>
              ) : farmerStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This farmer has no transferable stock.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variety</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Generation</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Transfer qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farmerStock.map((row) => {
                      const key = stockLineKey(
                        row.varietyId,
                        row.sizeId,
                        row.generationId,
                      );

                      return (
                        <TableRow key={key}>
                          <TableCell>{row.variety.name}</TableCell>
                          <TableCell>{row.size.name}</TableCell>
                          <TableCell>{row.generation.name}</TableCell>
                          <TableCell>{row.quantity}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={Number.parseFloat(row.quantity)}
                              step="1"
                              value={lineQuantities[key] ?? ""}
                              onChange={(event) =>
                                setLineQuantities((current) => ({
                                  ...current,
                                  [key]: event.target.value,
                                }))
                              }
                              placeholder="0"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/transfer">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Transferring…" : "Create transfer"}
          </Button>
        </div>
      </form>

      <div ref={portalContainerRef} />
    </div>
  );
}
