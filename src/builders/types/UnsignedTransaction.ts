import { SubstateRequirement, VersionedSubstateId } from "@tariproject/typescript-bindings";
import { Instruction } from "./Instruction";

// differs from bindings implementation because of 'Instruction'
export interface UnsignedTransaction {
  feeInstructions: Instruction[];
  instructions: Instruction[];
  inputs: SubstateRequirement[];
  filledInputs: VersionedSubstateId[];
  minEpoch: number | null;
  maxEpoch: number | null;
}
