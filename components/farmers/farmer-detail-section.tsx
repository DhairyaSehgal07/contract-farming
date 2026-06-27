"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createFarmerDispatchColumns } from "@/components/farmers/farmer-dispatch-columns";
import { FarmerFieldsSection } from "@/components/farmers/farmer-fields-section";
import { FarmerFormDialog } from "@/components/farmers/farmer-form-dialog";
import { createFarmerReceivedLotColumns } from "@/components/farmers/farmer-received-lot-columns";
import { createFarmerRequisitionColumns } from "@/components/farmers/farmer-requisition-columns";
import { createFarmerStockColumns } from "@/components/farmers/farmer-stock-columns";
import { MasterTableSkeleton } from "@/components/master/master-table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFarmerDispatches,
  useFarmerReceivedLots,
  useFarmerRequisitions,
} from "@/hooks/farmer/use-farmer-profile";
import { useFarmer, useUpdateFarmer } from "@/hooks/farmer/use-farmers";
import { useFarmerStock } from "@/hooks/transfer/use-stock-transfers";
import type { FarmerFormInput } from "@/lib/schemas/master/farmer";

type FarmerDetailSectionProps = {
  id: string;
  canWriteMaster: boolean;
  canReadRequisitions: boolean;
  canReadDispatches: boolean;
  canReadTransfer: boolean;
};

const FARMER_TABS = [
  "overview",
  "requisitions",
  "dispatches",
  "stock",
  "fields",
] as const;

type FarmerTab = (typeof FARMER_TABS)[number];

function isFarmerTab(value: string | null): value is FarmerTab {
  return FARMER_TABS.includes(value as FarmerTab);
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function FarmerDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 rounded-4xl" />
    </div>
  );
}

export function FarmerDetailSection({
  id,
  canWriteMaster,
  canReadRequisitions,
  canReadDispatches,
  canReadTransfer,
}: FarmerDetailSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const canReadStock = canReadTransfer || canReadDispatches;

  const defaultTab: FarmerTab = canReadRequisitions
    ? "overview"
    : canReadDispatches
      ? "overview"
      : canReadStock
        ? "overview"
        : "overview";

  const activeTab = isFarmerTab(tabParam) ? tabParam : defaultTab;

  const { data, isPending, isError, error } = useFarmer(id);
  const updateMutation = useUpdateFarmer();
  const [formOpen, setFormOpen] = useState(false);

  const requisitionsQuery = useFarmerRequisitions(id, {
    enabled: canReadRequisitions && activeTab === "requisitions",
  });
  const dispatchesQuery = useFarmerDispatches(id, {
    enabled: canReadDispatches && activeTab === "dispatches",
  });
  const stockQuery = useFarmerStock(id, {
    enabled: canReadTransfer && activeTab === "stock",
  });
  const receivedLotsQuery = useFarmerReceivedLots(id, {
    enabled: canReadDispatches && activeTab === "stock",
  });

  const requisitionColumns = useMemo(
    () => createFarmerRequisitionColumns(),
    [],
  );
  const dispatchColumns = useMemo(() => createFarmerDispatchColumns(), []);
  const stockColumns = useMemo(() => createFarmerStockColumns(), []);
  const receivedLotColumns = useMemo(
    () => createFarmerReceivedLotColumns(),
    [],
  );

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const query = params.toString();
    router.replace(query ? `/farmers/${id}?${query}` : `/farmers/${id}`);
  }

  function handleFormSubmit(values: FarmerFormInput) {
    if (!data) return;

    updateMutation.mutate(
      { id: data.id, ...values },
      {
        onSuccess: () => setFormOpen(false),
      },
    );
  }

  if (isPending) {
    return <FarmerDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        {error?.message ?? "Failed to load farmer."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/farmers">
            <ArrowLeft />
            Back to Farmers
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-medium">{data.name}</h2>
            <p className="text-muted-foreground">
              Account #{data.accountNumber} · {data.station.name} ·{" "}
              {data.locality.name}
            </p>
          </div>

          {canWriteMaster ? (
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              Edit farmer
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {canReadRequisitions ? (
            <TabsTrigger value="requisitions">Requisition</TabsTrigger>
          ) : null}
          {canReadDispatches ? (
            <TabsTrigger value="dispatches">Dispatches</TabsTrigger>
          ) : null}
          {canReadStock ? (
            <TabsTrigger value="stock">Stock</TabsTrigger>
          ) : null}
          <TabsTrigger value="fields">Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmer details</CardTitle>
              <CardDescription>
                Contact, identification, bank, and location information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField label="Mobile" value={data.mobileNumber} />
                <DetailField label="Aadhaar" value={data.aadharNumber} />
                <DetailField
                  label="PAN"
                  value={data.panCardNumber ?? "—"}
                />
                <DetailField
                  label="Family account"
                  value={data.family?.accountNumber ?? "—"}
                />
                <DetailField label="Station" value={data.station.name} />
                <DetailField label="Locality" value={data.locality.name} />
                <DetailField
                  label="Bank account name"
                  value={data.bankAccountName ?? "—"}
                />
                <DetailField label="Bank name" value={data.bankName ?? "—"} />
                <DetailField
                  label="Bank account number"
                  value={data.bankAccountNumber ?? "—"}
                />
                <DetailField
                  label="IFSC code"
                  value={data.bankIfscCode ?? "—"}
                />
                <DetailField
                  label="Branch name"
                  value={data.bankBranchName ?? "—"}
                />
                <DetailField
                  label="Contract URL"
                  value={
                    data.contractUrl ? (
                      <a
                        href={data.contractUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        View contract
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {canReadRequisitions ? (
          <TabsContent value="requisitions" className="mt-6">
            {requisitionsQuery.isPending ? (
              <MasterTableSkeleton columnCount={6} rowCount={5} />
            ) : requisitionsQuery.isError ? (
              <p className="text-sm text-destructive">
                {requisitionsQuery.error.message}
              </p>
            ) : (
              <DataTable
                columns={requisitionColumns}
                data={requisitionsQuery.data ?? []}
                filterColumn="requisitionDate"
                filterPlaceholder="Filter requisitions…"
              />
            )}
          </TabsContent>
        ) : null}

        {canReadDispatches ? (
          <TabsContent value="dispatches" className="mt-6">
            {dispatchesQuery.isPending ? (
              <MasterTableSkeleton columnCount={6} rowCount={5} />
            ) : dispatchesQuery.isError ? (
              <p className="text-sm text-destructive">
                {dispatchesQuery.error.message}
              </p>
            ) : (
              <DataTable
                columns={dispatchColumns}
                data={dispatchesQuery.data ?? []}
                filterColumn="dispatchDate"
                filterPlaceholder="Filter dispatches…"
              />
            )}
          </TabsContent>
        ) : null}

        {canReadStock ? (
          <TabsContent value="stock" className="mt-6">
            <div className="flex flex-col gap-6">
              {canReadTransfer ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Current stock</CardTitle>
                    <CardDescription>
                      Available balances by variety, size, and generation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stockQuery.isPending ? (
                      <MasterTableSkeleton columnCount={4} rowCount={4} />
                    ) : stockQuery.isError ? (
                      <p className="text-sm text-destructive">
                        {stockQuery.error.message}
                      </p>
                    ) : (
                      <DataTable
                        columns={stockColumns}
                        data={stockQuery.data ?? []}
                      />
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {canReadDispatches ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Received dispatches</CardTitle>
                    <CardDescription>
                      Dispatch lots received by this farmer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {receivedLotsQuery.isPending ? (
                      <MasterTableSkeleton columnCount={5} rowCount={4} />
                    ) : receivedLotsQuery.isError ? (
                      <p className="text-sm text-destructive">
                        {receivedLotsQuery.error.message}
                      </p>
                    ) : (
                      <DataTable
                        columns={receivedLotColumns}
                        data={receivedLotsQuery.data ?? []}
                        filterColumn="dispatchDate"
                        filterPlaceholder="Filter received dispatches…"
                      />
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </TabsContent>
        ) : null}

        <TabsContent value="fields" className="mt-6">
          <FarmerFieldsSection
            farmerId={id}
            canWriteMaster={canWriteMaster}
          />
        </TabsContent>
      </Tabs>

      {canWriteMaster ? (
        <FarmerFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode="edit"
          initialFarmer={data}
          isPending={updateMutation.isPending}
          onSubmit={handleFormSubmit}
        />
      ) : null}
    </div>
  );
}
