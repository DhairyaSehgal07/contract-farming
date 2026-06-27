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
  farmerFamilies: () => [...masterKeys.all, "farmer-families"] as const,
  farmerFamilyRecords: () =>
    [...masterKeys.all, "farmer-family-records"] as const,
  farmerFamilyRecord: (id: string) =>
    [...masterKeys.all, "farmer-family-records", id] as const,
};

export const requisitionKeys = {
  all: ["requisition"] as const,
  list: () => [...requisitionKeys.all, "list"] as const,
  detail: (id: string) => [...requisitionKeys.all, "detail", id] as const,
  farmers: () => [...requisitionKeys.all, "farmers"] as const,
  varieties: () => [...requisitionKeys.all, "varieties"] as const,
};

export const dispatchKeys = {
  all: ["dispatch"] as const,
  list: () => [...dispatchKeys.all, "list"] as const,
  detail: (id: string) => [...dispatchKeys.all, "detail", id] as const,
  dispatchableRequisitions: () =>
    [...dispatchKeys.all, "dispatchable-requisitions"] as const,
  formOptions: () => [...dispatchKeys.all, "form-options"] as const,
};

export const farmerKeys = {
  all: ["farmer"] as const,
  list: () => [...farmerKeys.all, "list"] as const,
  detail: (id: string) => [...farmerKeys.all, "detail", id] as const,
  requisitions: (id: string) =>
    [...farmerKeys.all, "requisitions", id] as const,
  dispatches: (id: string) => [...farmerKeys.all, "dispatches", id] as const,
  receivedLots: (id: string) =>
    [...farmerKeys.all, "received-lots", id] as const,
  fields: (id: string) => [...farmerKeys.all, "fields", id] as const,
};

export const fieldKeys = {
  all: ["field"] as const,
  detail: (id: string) => [...fieldKeys.all, "detail", id] as const,
};

export const transferKeys = {
  all: ["transfer"] as const,
  list: () => [...transferKeys.all, "list"] as const,
  detail: (id: string) => [...transferKeys.all, "detail", id] as const,
  farmerStock: (farmerId: string) =>
    [...transferKeys.all, "farmer-stock", farmerId] as const,
  transferableFarmers: () =>
    [...transferKeys.all, "transferable-farmers"] as const,
  destinationFarmers: (excludeFarmerId: string | null) =>
    [...transferKeys.all, "destination-farmers", excludeFarmerId] as const,
};
