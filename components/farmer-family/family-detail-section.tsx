"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { createFamilyDispatchColumns } from "@/components/farmer-family/family-dispatch-columns";
import { FamilyFieldsSection } from "@/components/farmer-family/family-fields-section";
import { createFamilyMemberColumns } from "@/components/farmer-family/family-member-columns";
import { createFamilyReceivedLotColumns } from "@/components/farmer-family/family-received-lot-columns";
import { createFamilyRequisitionColumns } from "@/components/farmer-family/family-requisition-columns";
import { createFarmerStockColumns } from "@/components/farmers/farmer-stock-columns";
import { FamilyFormDialog } from "@/components/master/families/family-form-dialog";
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
  useFamilyDispatches,
  useFamilyReceivedLots,
  useFamilyRequisitions,
  useFamilyStock,
  useFarmerFamilyProfile,
} from "@/hooks/farmer/use-farmer-family-profile";
import { useUpdateFarmerFamily } from "@/hooks/master/use-farmer-family-records";
import type { FarmerFamilyFormInput } from "@/lib/schemas/master/farmer-family-form";

type FamilyDetailSectionProps = {
  id: string;
  canWriteMaster: boolean;
  canReadRequisitions: boolean;
  canReadDispatches: boolean;
  canReadTransfer: boolean;
};

const FAMILY_TABS = [
  "overview",
  "requisitions",
  "dispatches",
  "stock",
  "fields",
] as const;

type FamilyTab = (typeof FAMILY_TABS)[number];

function isFamilyTab(value: string | null): value is FamilyTab {
  return FAMILY_TABS.includes(value as FamilyTab);
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

function FamilyDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 rounded-4xl" />
    </div>
  );
}

export function FamilyDetailSection({
  id,
  canWriteMaster,
  canReadRequisitions,
  canReadDispatches,
  canReadTransfer,
}: FamilyDetailSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const canReadStock = canReadTransfer || canReadDispatches;

  const activeTab = isFamilyTab(tabParam) ? tabParam : "overview";

  const { data, isPending, isError, error } = useFarmerFamilyProfile(id);
  const updateMutation = useUpdateFarmerFamily();
  const [formOpen, setFormOpen] = useState(false);

  const requisitionsQuery = useFamilyRequisitions(id, {
    enabled: canReadRequisitions && activeTab === "requisitions",
  });
  const dispatchesQuery = useFamilyDispatches(id, {
    enabled: canReadDispatches && activeTab === "dispatches",
  });
  const stockQuery = useFamilyStock(id, {
    enabled: canReadTransfer && activeTab === "stock",
  });
  const receivedLotsQuery = useFamilyReceivedLots(id, {
    enabled: canReadDispatches && activeTab === "stock",
  });

  const memberColumns = useMemo(() => createFamilyMemberColumns(), []);
  const requisitionColumns = useMemo(
    () => createFamilyRequisitionColumns(),
    [],
  );
  const dispatchColumns = useMemo(() => createFamilyDispatchColumns(), []);
  const stockColumns = useMemo(() => createFarmerStockColumns(), []);
  const receivedLotColumns = useMemo(
    () => createFamilyReceivedLotColumns(),
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
    router.replace(
      query ? `/farmer-family/${id}?${query}` : `/farmer-family/${id}`,
    );
  }

  function handleFormSubmit(values: FarmerFamilyFormInput) {
    if (!data) return;

    updateMutation.mutate(
      { id: data.id, ...values },
      {
        onSuccess: () => setFormOpen(false),
      },
    );
  }

  if (isPending) {
    return <FamilyDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        {error?.message ?? "Failed to load family."}
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
              {data.locality.name} · {data._count.members}{" "}
              {data._count.members === 1 ? "member" : "members"}
            </p>
          </div>

          {canWriteMaster ? (
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              Edit family
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
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Family details</CardTitle>
                <CardDescription>
                  Shared account and location for this farmer family.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Account number"
                    value={`#${data.accountNumber}`}
                  />
                  <DetailField label="Station" value={data.station.name} />
                  <DetailField label="Locality" value={data.locality.name} />
                  <DetailField
                    label="Members"
                    value={data._count.members}
                  />
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>
                  Individual farmers linked to this family account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No members linked to this family yet.
                  </p>
                ) : (
                  <DataTable
                    columns={memberColumns}
                    data={data.members}
                    filterColumn="name"
                    filterPlaceholder="Search members…"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {canReadRequisitions ? (
          <TabsContent value="requisitions" className="mt-6">
            {requisitionsQuery.isPending ? (
              <MasterTableSkeleton columnCount={7} rowCount={5} />
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
              <MasterTableSkeleton columnCount={7} rowCount={5} />
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
                      Combined available balances across all family members.
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
                      Dispatch lots received by family members.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {receivedLotsQuery.isPending ? (
                      <MasterTableSkeleton columnCount={6} rowCount={4} />
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
          <FamilyFieldsSection
            familyId={id}
            members={data.members}
            canWriteMaster={canWriteMaster}
          />
        </TabsContent>
      </Tabs>

      {canWriteMaster ? (
        <FamilyFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode="edit"
          initialFamily={data}
          isPending={updateMutation.isPending}
          onSubmit={handleFormSubmit}
        />
      ) : null}
    </div>
  );
}
