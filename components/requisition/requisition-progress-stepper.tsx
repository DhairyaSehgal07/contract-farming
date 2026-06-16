"use client";

import {
  ClipboardCheck,
  FileText,
  PackageCheck,
  Truck,
} from "lucide-react";
import type { RequisitionDetail } from "@/app/actions/requisition/requisitions";
import { VerticalStepper } from "@/components/ui/vertical-stepper";
import { getRequisitionStepState } from "@/lib/requisition/step-state";

const STEP_ICONS = [FileText, ClipboardCheck, Truck, PackageCheck] as const;

type RequisitionProgressStepperProps = {
  detail: RequisitionDetail;
};

export function RequisitionProgressStepper({
  detail,
}: RequisitionProgressStepperProps) {
  const stepStates = getRequisitionStepState(detail);

  const steps = stepStates.map((step, index) => ({
    title: step.title,
    description: step.description,
    icon: STEP_ICONS[index]!,
    status: step.status,
  }));

  return (
    <VerticalStepper
      aria-label="Requisition progress"
      steps={steps}
    />
  );
}
