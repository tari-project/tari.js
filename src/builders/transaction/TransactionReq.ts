import {
  Epoch,
  SubstateRequirement,
  TransactionSignature,
  VersionedSubstateId,
} from "@tariproject/typescript-bindings";
import { Instruction } from "../types/Instruction";
import { UnsignedTransaction } from "../types/UnsignedTransaction";

export interface Transaction {
  id: string;
  fee_instructions: Array<Instruction>;
  instructions: Array<Instruction>;
  inputs: Array<SubstateRequirement>;
  min_epoch: Epoch | null;
  max_epoch: Epoch | null;
  signatures: Array<TransactionSignature>;
  filled_inputs: Array<VersionedSubstateId>;
}

export class TransactionReq implements Transaction {
  id: string;
  fee_instructions: Array<Instruction>;
  instructions: Array<Instruction>;
  inputs: Array<SubstateRequirement>;
  min_epoch: Epoch | null;
  max_epoch: Epoch | null;
  signatures: Array<TransactionSignature>;
  filled_inputs: Array<VersionedSubstateId>;

  constructor(id: string, unsignedTransaction: UnsignedTransaction, signatures: TransactionSignature[]) {
    this.id = id;
    this.fee_instructions = unsignedTransaction.feeInstructions;
    this.instructions = unsignedTransaction.instructions;
    this.inputs = unsignedTransaction.inputs;
    this.min_epoch = unsignedTransaction.minEpoch;
    this.max_epoch = unsignedTransaction.maxEpoch;
    this.signatures = signatures;
    this.filled_inputs = unsignedTransaction.filledInputs;
  }
}
