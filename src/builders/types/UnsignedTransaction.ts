import { Instruction } from "./Instruction";
import { Epoch } from "./Epoch";
import { SubstateRequirement } from "./SubstateRequirement";
import { VersionedSubstateId } from "./VersionedSubstateId";

//TODO refactor type (https://github.com/tari-project/tari.js/issues/29)
// differs from bindings implementation because of 'Instruction'
export interface UnsignedTransaction {
  feeInstructions: Instruction[];
  instructions: Instruction[];
  inputs: SubstateRequirement[];
  filledInputs: VersionedSubstateId[];
  minEpoch?: Epoch;
  maxEpoch?: Epoch;
}
