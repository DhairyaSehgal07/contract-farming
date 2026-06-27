import type { FieldDetail } from "@/app/actions/field/field-activities";
import { formatDisplayDate } from "@/lib/date";
import type { FieldActivityRound } from "@/lib/schemas/field/shared";

export type FieldActivityStageId =
  | "plantation"
  | "irrigation"
  | "dehaulming-first"
  | "rouging"
  | "strip-test-first"
  | "dehaulming-second"
  | "strip-test-second"
  | "harvest";

export type FieldStepStatus = "complete" | "active" | "upcoming";

export type FieldActivityStage = {
  id: FieldActivityStageId;
  title: string;
  description: string;
  status: FieldStepStatus;
};

function countLabel(count: number, singular: string, plural: string) {
  if (count === 0) {
    return "No records yet";
  }

  if (count === 1) {
    return `1 ${singular} recorded`;
  }

  return `${count} ${plural} recorded`;
}

function latestDateLabel(dates: string[]) {
  if (dates.length === 0) {
    return null;
  }

  const sorted = [...dates].sort((a, b) => b.localeCompare(a));
  return `Latest: ${formatDisplayDate(sorted[0])}`;
}

function filterByRound<T extends { round: FieldActivityRound }>(
  rows: T[],
  round: FieldActivityRound,
) {
  return rows.filter((row) => row.round === round);
}

function stageDescription(count: number, singular: string, plural: string, dates: string[]) {
  const countText = countLabel(count, singular, plural);
  const latest = latestDateLabel(dates);

  return latest ? `${countText} · ${latest}` : countText;
}

export function getFieldActivityStages(
  detail: FieldDetail,
  selectedStageId: FieldActivityStageId,
): FieldActivityStage[] {
  const dehaulmingFirst = filterByRound(detail.dehaulming, "FIRST");
  const dehaulmingSecond = filterByRound(detail.dehaulming, "SECOND");
  const stripTestFirst = filterByRound(detail.stripTests, "FIRST");
  const stripTestSecond = filterByRound(detail.stripTests, "SECOND");

  const stageDefinitions: Array<
    Omit<FieldActivityStage, "status"> & { count: number; dates: string[] }
  > = [
    {
      id: "plantation",
      title: "Plantation",
      description: stageDescription(
        detail.plantations.length,
        "plantation",
        "plantations",
        detail.plantations.map((row) => row.plantedAt),
      ),
      count: detail.plantations.length,
      dates: detail.plantations.map((row) => row.plantedAt),
    },
    {
      id: "irrigation",
      title: "Irrigation",
      description: stageDescription(
        detail.irrigations.length,
        "cycle",
        "cycles",
        detail.irrigations.map((row) => row.irrigatedAt),
      ),
      count: detail.irrigations.length,
      dates: detail.irrigations.map((row) => row.irrigatedAt),
    },
    {
      id: "dehaulming-first",
      title: "Dehaulming (1)",
      description: stageDescription(
        dehaulmingFirst.length,
        "record",
        "records",
        dehaulmingFirst.map((row) => row.activityDate),
      ),
      count: dehaulmingFirst.length,
      dates: dehaulmingFirst.map((row) => row.activityDate),
    },
    {
      id: "rouging",
      title: "Rouging",
      description: stageDescription(
        detail.rouging.length,
        "record",
        "records",
        detail.rouging.map((row) => row.activityDate),
      ),
      count: detail.rouging.length,
      dates: detail.rouging.map((row) => row.activityDate),
    },
    {
      id: "strip-test-first",
      title: "Strip test (1)",
      description: stageDescription(
        stripTestFirst.length,
        "record",
        "records",
        stripTestFirst.map((row) => row.activityDate),
      ),
      count: stripTestFirst.length,
      dates: stripTestFirst.map((row) => row.activityDate),
    },
    {
      id: "dehaulming-second",
      title: "Dehaulming (2)",
      description: stageDescription(
        dehaulmingSecond.length,
        "record",
        "records",
        dehaulmingSecond.map((row) => row.activityDate),
      ),
      count: dehaulmingSecond.length,
      dates: dehaulmingSecond.map((row) => row.activityDate),
    },
    {
      id: "strip-test-second",
      title: "Strip test (2)",
      description: stageDescription(
        stripTestSecond.length,
        "record",
        "records",
        stripTestSecond.map((row) => row.activityDate),
      ),
      count: stripTestSecond.length,
      dates: stripTestSecond.map((row) => row.activityDate),
    },
    {
      id: "harvest",
      title: "Harvest",
      description: stageDescription(
        detail.harvests.length,
        "record",
        "records",
        detail.harvests.map((row) => row.activityDate),
      ),
      count: detail.harvests.length,
      dates: detail.harvests.map((row) => row.activityDate),
    },
  ];

  return stageDefinitions.map((stage) => ({
    id: stage.id,
    title: stage.title,
    description: stage.description,
    status:
      stage.id === selectedStageId
        ? "active"
        : stage.count > 0
          ? "complete"
          : "upcoming",
  }));
}

export function getFieldStageTitle(stageId: FieldActivityStageId) {
  switch (stageId) {
    case "plantation":
      return "Plantation";
    case "irrigation":
      return "Irrigation";
    case "dehaulming-first":
      return "Dehaulming (1)";
    case "rouging":
      return "Rouging";
    case "strip-test-first":
      return "Strip test (1)";
    case "dehaulming-second":
      return "Dehaulming (2)";
    case "strip-test-second":
      return "Strip test (2)";
    case "harvest":
      return "Harvest";
  }
}
