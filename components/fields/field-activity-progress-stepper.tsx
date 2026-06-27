"use client";

import {
  Droplets,
  FlaskConical,
  Leaf,
  PackageCheck,
  Scissors,
  Sprout,
} from "lucide-react";
import type { FieldDetail } from "@/app/actions/field/field-activities";
import { VerticalStepper } from "@/components/ui/vertical-stepper";
import {
  getFieldActivityStages,
  type FieldActivityStageId,
} from "@/lib/field/step-state";

const STEP_ICONS = [
  Sprout,
  Droplets,
  Scissors,
  Leaf,
  FlaskConical,
  Scissors,
  FlaskConical,
  PackageCheck,
] as const;

type FieldActivityProgressStepperProps = {
  detail: FieldDetail;
  selectedStageId: FieldActivityStageId;
  onStageSelect: (stageId: FieldActivityStageId) => void;
};

export function FieldActivityProgressStepper({
  detail,
  selectedStageId,
  onStageSelect,
}: FieldActivityProgressStepperProps) {
  const stages = getFieldActivityStages(detail, selectedStageId);

  const steps = stages.map((stage, index) => ({
    id: stage.id,
    title: stage.title,
    description: stage.description,
    icon: STEP_ICONS[index]!,
    status: stage.status,
  }));

  return (
    <VerticalStepper
      aria-label="Field activity progress"
      steps={steps}
      onStepSelect={(stepId) => onStageSelect(stepId as FieldActivityStageId)}
    />
  );
}
