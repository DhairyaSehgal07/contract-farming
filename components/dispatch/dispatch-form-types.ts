export type DispatchSizeLineDraft = {
  sizeId: string;
  generationId: string;
  quantity: string;
};

export type DispatchRequisitionSelectionMap = Map<
  string,
  DispatchSizeLineDraft[]
>;

export function getSelectionTotal(sizeLines: DispatchSizeLineDraft[]) {
  return sizeLines.reduce((sum, line) => {
    const value = Number.parseFloat(line.quantity);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
}

export function hasValidSelection(sizeLines: DispatchSizeLineDraft[]) {
  return sizeLines.some((line) => {
    const value = Number.parseFloat(line.quantity);
    return Number.isFinite(value) && value > 0;
  });
}

export function selectionsToInput(
  selections: DispatchRequisitionSelectionMap,
): Array<{ requisitionId: string; sizeLines: DispatchSizeLineDraft[] }> {
  return Array.from(selections.entries())
    .filter(([, sizeLines]) => hasValidSelection(sizeLines))
    .map(([requisitionId, sizeLines]) => ({
      requisitionId,
      sizeLines: sizeLines.filter((line) => {
        const value = Number.parseFloat(line.quantity);
        return Number.isFinite(value) && value > 0;
      }),
    }));
}
