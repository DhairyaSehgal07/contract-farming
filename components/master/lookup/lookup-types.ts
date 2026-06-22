import type { ActionResult } from "@/lib/schemas/master/action-result";
import type {
  CreateLookupInput,
  UpdateLookupInput,
} from "@/lib/schemas/master/lookup";

export type LookupRow = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LookupEntity = "variety" | "generation";

export type LookupConfig = {
  entity: LookupEntity;
  title: string;
  description: string;
  actionLabel: string;
  singularLabel: string;
  list: () => Promise<ActionResult<LookupRow[]>>;
  create: (input: CreateLookupInput) => Promise<ActionResult<LookupRow>>;
  update: (input: UpdateLookupInput) => Promise<ActionResult<LookupRow>>;
  remove: (id: string) => Promise<ActionResult>;
  queryKey: readonly string[];
};
