import { Instruction } from "./Instruction";
import { SubstateRequirement } from "./SubstateRequirement";
import { VersionedSubstateId } from "./VersionedSubstateId";
import { TransactionSignature } from "./TransactionSignature";
import { Epoch } from "@tari-project/typescript-bindings";

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
