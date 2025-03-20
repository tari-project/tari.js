import { Instruction } from "./Instruction";
import { Epoch } from "./Epoch";
import { SubstateRequirement } from "./SubstateRequirement";
import { VersionedSubstateId } from "./VersionedSubstateId";

// differs from bindings implementation because of 'Instruction'
export interface UnsignedTransaction {
  feeInstructions: Instruction[];
  instructions: Instruction[];
  inputs: SubstateRequirement[];
  filledInputs: VersionedSubstateId[];
  minEpoch?: Epoch;
  maxEpoch?: Epoch;
}
