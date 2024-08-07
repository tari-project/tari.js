import { SubstateId } from "@tari-project/typescript-bindings";

export interface SubstateRequirement {
  substateId: SubstateId;
  version?: number;
}
