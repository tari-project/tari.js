import {
  Epoch,
  Instruction,
  SubstateRequirement,
  Transaction,
  UnsignedTransactionV1,
  TransactionSignature,
  VersionedSubstateId,
  TransactionV1,
} from "@tari-project/typescript-bindings";



///TODO this implementation is not fully done, see:
/// https://github.com/tari-project/tari-dan/blob/development/dan_layer/transaction/src/transaction.rs
export class TransactionRequest implements Transaction {
  id: string;
  V1: TransactionV1;

  constructor(unsignedTransaction: UnsignedTransactionV1, signatures: TransactionSignature[]) {
    this.id = "";
    this.V1 = {
      body: {
        transaction: unsignedTransaction,
        signatures,
      },
      seal_signature: {
        public_key: "",
        signature: {
          public_nonce: "",
          signature: "",
        }
      },
      // Inputs filled by some authority. These are not part of the transaction hash nor the signature
      filled_inputs: []
    };
  }

  withFilledInputs(filled_inputs: Array<VersionedSubstateId>): this {
    return { ...this, filled_inputs };
  }

  getUnsignedTransaction(): UnsignedTransactionV1 {
    return this.V1.body.transaction;
  }

  getFeeInstructions(): Instruction[] {
    return this.V1.body.transaction.fee_instructions;
  }

  getInstructions(): Instruction[] {
    return this.V1.body.transaction.instructions;
  }

  getSignatures(): TransactionSignature[] {
    return this.V1.body.signatures;
  }

  getInputs(): SubstateRequirement[] {
    return this.V1.body.transaction.inputs;
  }

  getFilledInputs(): VersionedSubstateId[] {
    return this.V1.filled_inputs;
  }

  getFilledInputsMut(): VersionedSubstateId[] {
    return this.V1.filled_inputs;
  }

  getMinEpoch(): Epoch | null {
    return this.V1.body.transaction.min_epoch;
  }

  getMaxEpoch(): Epoch | null {
    return this.V1.body.transaction.max_epoch;
  }

  setId(id: string): void {
    this.id = id;
  }

  getId(): string {
    return this.id;
  }
}
