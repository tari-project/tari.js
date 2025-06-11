import { Instruction } from "./Instruction";
import { TransactionSignature } from "./TransactionSignature";
import { Epoch, SubstateRequirement, VersionedSubstateId } from "@tari-project/typescript-bindings";

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
