export const permissionsKeys = {
  all: ["permissions"] as const,
  roleMatrix: () => [...permissionsKeys.all, "role-matrix"] as const,
};

export const masterKeys = {
  all: ["master"] as const,
  varieties: () => [...masterKeys.all, "varieties"] as const,
  locations: () => [...masterKeys.all, "locations"] as const,
  sizes: () => [...masterKeys.all, "sizes"] as const,
  generations: () => [...masterKeys.all, "generations"] as const,
  stations: () => [...masterKeys.all, "stations"] as const,
  localities: (stationId: string | null) =>
    [...masterKeys.all, "localities", stationId] as const,
  farmers: () => [...masterKeys.all, "farmers"] as const,
  farmer: (id: string) => [...masterKeys.all, "farmers", id] as const,
};

export const requisitionKeys = {
  all: ["requisition"] as const,
  list: () => [...requisitionKeys.all, "list"] as const,
  farmers: () => [...requisitionKeys.all, "farmers"] as const,
  varieties: () => [...requisitionKeys.all, "varieties"] as const,
};

export const dispatchKeys = {
  all: ["dispatch"] as const,
  list: () => [...dispatchKeys.all, "list"] as const,
  dispatchableRequisitions: () =>
    [...dispatchKeys.all, "dispatchable-requisitions"] as const,
  formOptions: () => [...dispatchKeys.all, "form-options"] as const,
};
