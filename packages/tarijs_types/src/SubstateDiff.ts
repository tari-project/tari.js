import { Substate, SubstateId } from "@tari-project/typescript-bindings";

export type UpSubstates = Array<[SubstateId, Substate]>;
export type DownSubstates = Array<[SubstateId, number]>;

