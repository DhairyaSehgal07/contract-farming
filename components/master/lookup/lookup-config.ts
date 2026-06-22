import {
  createGeneration,
  deleteGeneration,
  listGenerations,
  updateGeneration,
} from "@/app/actions/master/generations";
import {
  createVariety,
  deleteVariety,
  listVarieties,
  updateVariety,
} from "@/app/actions/master/varieties";
import type { LookupConfig } from "@/components/master/lookup/lookup-types";
import { masterKeys } from "@/lib/query/keys";

export const varietyLookupConfig: LookupConfig = {
  entity: "variety",
  title: "Varieties",
  description: "Manage crop variety reference data.",
  actionLabel: "Add Variety",
  singularLabel: "variety",
  list: listVarieties,
  create: createVariety,
  update: updateVariety,
  remove: deleteVariety,
  queryKey: masterKeys.varieties(),
};

export const generationLookupConfig: LookupConfig = {
  entity: "generation",
  title: "Generations",
  description: "Manage generation reference data.",
  actionLabel: "Add Generation",
  singularLabel: "generation",
  list: listGenerations,
  create: createGeneration,
  update: updateGeneration,
  remove: deleteGeneration,
  queryKey: masterKeys.generations(),
};
