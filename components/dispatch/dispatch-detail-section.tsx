"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { DispatchDetail, DispatchLotRow } from "@/app/actions/dispatch/dispatches";
import { DispatchLotReceiptDialog } from "@/components/dispatch/dispatch-lot-receipt-dialog";
import { DispatchLotsTable } from "@/components/dispatch/dispatch-lots-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch } from "@/hooks/dispatch/use-dispatches";
import { parseDateOnly } from "@/lib/date";

function formatDate(value: string | null) {
  if (!value) return "—";
  return parseDateOnly(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDecimal(value: string | null) {
  return value ?? "—";
}

type DispatchDetailSectionProps = {
  id: string;
  canWrite: boolean;
};

function DispatchDetailContent({
  data,
  canWrite,
}: {
  data: DispatchDetail;
  canWrite: boolean;
}) {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<DispatchLotRow | null>(null);

  const receiptPercent =
    data.lotsTotal > 0
      ? Math.round((data.lotsReceived / data.lotsTotal) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dispatch">
            <ArrowLeft />
            <span className="sr-only">Back to dispatches</span>
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dispatch {formatDate(data.dispatchDate)}
          </h1>
          <p className="text-muted-foreground text-sm">
            {data.truckNumber ?? "—"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>Dispatch details</CardTitle>
              <CardDescription>
                {data.location?.name ?? "—"} → {data.toLocation ?? "—"}
              </CardDescription>
            </div>
            <Badge variant={data.status === "CLOSED" ? "default" : "outline"}>
              {data.status === "CLOSED" ? "Closed" : "Open"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Closed on</dt>
              <dd>{formatDate(data.dateOfReceiving)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Net weight</dt>
              <dd>{formatDecimal(data.netWeight)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Driver mobile</dt>
              <dd>{data.driverMobileNumber ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Gate pass</dt>
              <dd>{data.manualGatePassNumber ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Weight slip</dt>
              <dd>{data.weightSlipNumber ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Farmers on truck</dt>
              <dd>{data.requisitionCount}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Farmer receipt progress</p>
              <p className="text-muted-foreground text-sm">
                {data.lotsReceived} / {data.lotsTotal} received
              </p>
            </div>
            <Progress value={receiptPercent} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Farmer lots</h2>
          <p className="text-muted-foreground text-sm">
            Confirm receipt for each farmer on this dispatch using OTP.
          </p>
        </div>
        <DispatchLotsTable
          lots={data.requisitions}
          canWrite={canWrite}
          dispatchStatus={data.status}
          onReceive={(lot) => {
            setSelectedLot(lot);
            setReceiptOpen(true);
          }}
        />
      </div>

      <DispatchLotReceiptDialog
        dispatchId={data.id}
        lot={selectedLot}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </div>
  );
}

export function DispatchDetailSection({ id, canWrite }: DispatchDetailSectionProps) {
  const { data, isPending, isError, error } = useDispatch(id);

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load dispatch."}
      </p>
    );
  }

  return <DispatchDetailContent data={data} canWrite={canWrite} />;
}
