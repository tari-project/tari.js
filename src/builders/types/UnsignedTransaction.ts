import { Instruction, SubstateRequirement, VersionedSubstateId } from "@tariproject/typescript-bindings";

// differs from bindings implementation because of 'Instruction'
export interface UnsignedTransaction {
  feeInstructions: Instruction[];
  instructions: Instruction[];
  inputs: SubstateRequirement[];
  filledInputs: VersionedSubstateId[];
  minEpoch?: number;
  maxEpoch?: number;
}
