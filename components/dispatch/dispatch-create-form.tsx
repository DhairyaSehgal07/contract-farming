"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DispatchDetailsStep } from "@/components/dispatch/dispatch-details-step";
import { DispatchFormStepper } from "@/components/dispatch/dispatch-form-stepper";
import type { DispatchRequisitionSelectionMap } from "@/components/dispatch/dispatch-form-types";
import { DispatchRequisitionSelectionStep } from "@/components/dispatch/dispatch-requisition-selection-step";
import {
  useCreateDispatch,
  useDispatchableRequisitions,
} from "@/hooks/dispatch/use-dispatches";
import type { CreateDispatchInput } from "@/lib/schemas/dispatch/dispatch";

export function DispatchCreateForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selections, setSelections] =
    useState<DispatchRequisitionSelectionMap>(new Map());

  const { data: requisitions = [] } = useDispatchableRequisitions({
    enabled: step === 2,
  });
  const createMutation = useCreateDispatch();

  function handleSubmit(values: CreateDispatchInput) {
    createMutation.mutate(values, {
      onSuccess: () => {
        router.push("/dispatch");
      },
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-medium">New dispatch</h2>
        <p className="text-muted-foreground">
          Select requisitions and enter dispatch details.
        </p>
      </div>

      <DispatchFormStepper currentStep={step} />

      {step === 1 ? (
        <DispatchRequisitionSelectionStep
          selections={selections}
          onSelectionsChange={setSelections}
          onNext={() => setStep(2)}
        />
      ) : (
        <DispatchDetailsStep
          selections={selections}
          requisitions={requisitions}
          isPending={createMutation.isPending}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
