import { Instruction } from "./Instruction";
import { SubstateRequirement } from "./SubstateRequirement";
import { Epoch } from "./Epoch";
import { VersionedSubstateId } from "./VersionedSubstateId";
import { TransactionSignature } from "./TransactionSignature";

export interface Transaction {
  id: string;
  feeInstructions: Array<Instruction>;
  instructions: Array<Instruction>;
  inputs: Array<SubstateRequirement>;
  minEpoch?: Epoch;
  maxEpoch?: Epoch;
  signatures: Array<TransactionSignature>;
  filledInputs: Array<VersionedSubstateId>;
}
