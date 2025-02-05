import { Substate, SubstateId } from "@tari-project/typescript-bindings";

export type UpSubstates = Array<[SubstateId, Substate]>;
export type DownSubstates = Array<[SubstateId, number]>;

export interface SubstateDiff {
  up_substates: UpSubstates;
  down_substates: DownSubstates;
}
