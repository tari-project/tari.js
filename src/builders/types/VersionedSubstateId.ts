import { SubstateId } from "@tari-project/typescript-bindings";

export interface VersionedSubstateId {
  substateId: SubstateId;
  version: number;
}
