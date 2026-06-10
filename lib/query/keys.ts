export const masterKeys = {
  all: ["master"] as const,
  varieties: () => [...masterKeys.all, "varieties"] as const,
  sizes: () => [...masterKeys.all, "sizes"] as const,
  generations: () => [...masterKeys.all, "generations"] as const,
  stations: () => [...masterKeys.all, "stations"] as const,
  localities: (stationId: string | null) =>
    [...masterKeys.all, "localities", stationId] as const,
  farmers: () => [...masterKeys.all, "farmers"] as const,
  farmer: (id: string) => [...masterKeys.all, "farmers", id] as const,
};
