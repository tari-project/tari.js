import { SubstateId } from "@tariproject/typescript-bindings";

export interface VersionedSubstateId {
  substateId: SubstateId;
  version: number;
}
