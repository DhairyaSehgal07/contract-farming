"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { FieldDetail } from "@/app/actions/field/field-activities";
import { FieldActivityPanel } from "@/components/fields/field-activity-panel";
import { FieldActivityProgressStepper } from "@/components/fields/field-activity-progress-stepper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFieldDetail } from "@/hooks/field/use-field-detail";
import type { FieldActivityStageId } from "@/lib/field/step-state";

type FieldDetailSectionProps = {
  id: string;
  canWriteMaster: boolean;
};

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

function formatGeoLocation(value: string) {
  const coords = value.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!coords) {
    return value;
  }

  const [, lat, , lng] = coords;
  return (
    <a
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noreferrer"
      className="text-primary hover:underline"
    >
      {value}
    </a>
  );
}

function FieldDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-96 rounded-4xl" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 rounded-4xl" />
          <Skeleton className="h-64 rounded-4xl" />
        </div>
      </div>
    </div>
  );
}

function FieldDetailContent({
  data,
  canWriteMaster,
}: {
  data: FieldDetail;
  canWriteMaster: boolean;
}) {
  const [selectedStageId, setSelectedStageId] =
    useState<FieldActivityStageId>("plantation");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href={`/farmers/${data.farmerId}?tab=fields`}>
            <ArrowLeft />
            Back to {data.farmer.name}
          </Link>
        </Button>

        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-medium">{data.name}</h2>
          <p className="text-muted-foreground">
            {data.farmer.name} · Account #{data.farmer.accountNumber} ·{" "}
            {data.acres} acres
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="lg:sticky lg:top-6 lg:self-start">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Field lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldActivityProgressStepper
              detail={data}
              selectedStageId={selectedStageId}
              onStageSelect={setSelectedStageId}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Field details</CardTitle>
              <CardDescription>
                Location, size, and farmer information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailField label="Field name" value={data.name} />
                <DetailField
                  label="Farmer"
                  value={
                    <Link
                      href={`/farmers/${data.farmerId}`}
                      className="text-primary hover:underline"
                    >
                      {data.farmer.name}
                    </Link>
                  }
                />
                <DetailField label="Acres" value={data.acres} />
                <DetailField
                  label="Geo location"
                  value={formatGeoLocation(data.geoLocation)}
                />
              </dl>
            </CardContent>
          </Card>

          <FieldActivityPanel
            fieldId={data.id}
            detail={data}
            stageId={selectedStageId}
            canWriteMaster={canWriteMaster}
          />
        </div>
      </div>
    </div>
  );
}

export function FieldDetailSection({
  id,
  canWriteMaster,
}: FieldDetailSectionProps) {
  const { data, isLoading, isError, error } = useFieldDetail(id);

  if (isLoading) {
    return <FieldDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <p className="text-destructive">
        {error instanceof Error ? error.message : "Failed to load field."}
      </p>
    );
  }

  return <FieldDetailContent data={data} canWriteMaster={canWriteMaster} />;
}
