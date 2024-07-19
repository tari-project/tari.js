import {
  Epoch,
  Instruction,
  SubstateRequirement,
  Transaction,
  TransactionSignature,
  UnsignedTransaction,
  VersionedSubstateId,
} from "@tariproject/typescript-bindings";
import { TransactionId } from "../types/TransactionId";
import { TransactionBuilder } from "./TransactionBuilder";

///TODO this implementation is not fully done, see:
/// https://github.com/tari-project/tari-dan/blob/development/dan_layer/transaction/src/transaction.rs
export class TransactionRequest implements Transaction {
  id: TransactionId;
  fee_instructions: Array<Instruction>;
  instructions: Array<Instruction>;
  inputs: Array<SubstateRequirement>;
  min_epoch: Epoch | null;
  max_epoch: Epoch | null;
  signatures: Array<TransactionSignature>;
  filled_inputs: Array<VersionedSubstateId>;
  unsigned_transaction: UnsignedTransaction;

  static builder(): TransactionBuilder {
    return new TransactionBuilder();
  }

  constructor(unsignedTransaction: UnsignedTransaction, signatures: TransactionSignature[]) {
    this.id = this.calculateHash();
    this.fee_instructions = unsignedTransaction.fee_instructions;
    this.instructions = unsignedTransaction.instructions;
    this.inputs = unsignedTransaction.inputs;
    this.min_epoch = unsignedTransaction.min_epoch;
    this.max_epoch = unsignedTransaction.max_epoch;
    this.signatures = signatures;
    /// Inputs filled by some authority. These are not part of the transaction hash nor the signature
    this.filled_inputs = [];
  }

  //TODO
  private calculateHash(): TransactionId {
    return "";
  }

  withFilledInputs(filled_inputs: Array<VersionedSubstateId>): this {
    return { ...this, filled_inputs };
  }

  getId(): TransactionId {
    return this.id;
  }

  //TODO
  checkId(): boolean {
    const id = this.calculateHash();
    return id === this.id;
  }

  getUnsignedTransaction(): UnsignedTransaction {
    return this.unsigned_transaction;
  }

  getFeeInstructions(): Instruction[] {
    return this.fee_instructions;
  }

  getInstructions(): Instruction[] {
    return this.instructions;
  }

  getSignatures(): TransactionSignature[] {
    return this.signatures;
  }

  getHash(): string {
    return this.id;
  }

  getInputs(): SubstateRequirement[] {
    return this.inputs;
  }

  getFilledInputs(): VersionedSubstateId[] {
    return this.filled_inputs;
  }

  getFilledInputsMut(): VersionedSubstateId[] {
    return this.filled_inputs;
  }

  minEpoch(): Epoch | null {
    return this.min_epoch;
  }

  maxEpoch(): Epoch | null {
    return this.max_epoch;
  }
}
