//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import { SubstateRequirement } from "../../providers/types";
import { Amount } from "./amount";
import { Instruction } from "./instruction";

interface TransactionSignature {
  publicKey: string;
  signature: string;

  verify(transaction: UnsignedTransaction): boolean;
  getSignature(): string;
  getPublicKey(): string;

  new (): TransactionSignature;
}

interface UnsignedTransaction {
  feeInstructions: Instruction[];
  instructions: Instruction[];
  inputs: Set<SubstateRequirement>;
  minEpoch?: number;
  maxEpoch?: number;
}

interface TransactionSignature {
  sign(secretKey: string, unsignedTransaction: UnsignedTransaction): TransactionSignature;
}

interface Transaction {
  unsignedTransaction: UnsignedTransaction;
  signatures: TransactionSignature[];
}

interface TransactionConstructor {
  new (unsignedTransaction: UnsignedTransaction, signatures: TransactionSignature[]): Transaction;
}

declare var Transaction: TransactionConstructor;

interface Builder {
  withUnsignedTransaction(unsignedTransaction: UnsignedTransaction): TransactionBuilder;
  feeTransactionPayFromComponent(componentAddress: string, maxFee: Amount): TransactionBuilder;
  feeTransactionPayFromComponentConfidential(componentAddress: string, proof: any): TransactionBuilder;
  createAccount(ownerPublicKey: string): TransactionBuilder;
  createAccountWithBucket(ownerPublicKey: string, workspaceBucket: string): TransactionBuilder;
  callFunction(templateAddress: string, fct: string, args: any[]): TransactionBuilder;
  callMethod(componentAddress: string, method: string, args: any[]): TransactionBuilder;
  dropAllProofsInWorkspace(): TransactionBuilder;
  putLastInstructionOutputOnWorkspace(label: string): TransactionBuilder;
  claimBurn(claim: any): TransactionBuilder;
  createProof(account: string, resourceAddr: string): TransactionBuilder;
  withFeeInstructions(instructions: Instruction[]): TransactionBuilder;
  withFeeInstructionsBuilder(builder: (builder: TransactionBuilder) => TransactionBuilder): TransactionBuilder;
  addFeeInstruction(instruction: Instruction): TransactionBuilder;
  addInstruction(instruction: Instruction): TransactionBuilder;
  withInstructions(instructions: Instruction[]): TransactionBuilder;
  addInput(inputObject: SubstateRequirement): TransactionBuilder;
  withInputs(inputs: SubstateRequirement[]): TransactionBuilder;
  withMaxEpoch(maxEpoch: number): TransactionBuilder;
  buildUnsignedTransaction(): UnsignedTransaction;
  sign(secretKey: string): TransactionBuilder;
  build(): Transaction;
}

export class TransactionBuilder implements Builder {
  private unsignedTransaction: UnsignedTransaction;
  private signatures: TransactionSignature[];

  constructor() {
    this.unsignedTransaction = {
      feeInstructions: [],
      instructions: [],
      inputs: new Set(),
      minEpoch: undefined,
      maxEpoch: undefined,
    };
    this.signatures = [];
  }

  withUnsignedTransaction(unsignedTransaction: UnsignedTransaction): TransactionBuilder {
    this.unsignedTransaction = unsignedTransaction;
    this.signatures = [];
    return this;
  }

  /**
   * Adds a fee instruction that calls the "take_fee" method on a component.
   * This method must exist and return a Bucket with containing revealed confidential XTR resource.
   * This allows the fee to originate from sources other than the transaction sender's account.
   * The fee instruction will lock up the "max_fee" amount for the duration of the transaction.
   * @param componentAddress
   * @param maxFee
   * @returns
   */
  feeTransactionPayFromComponent(componentAddress: string, maxFee: Amount): TransactionBuilder {
    // const fee_instructions: Instruction = {
    //   component_address: account.address,
    //   method: "pay_fee",
    //   args: [`Amount(${fee})`],
    // };
    // return this.addFeeInstruction({
    //   type: "CallMethod",
    //   componentAddress,
    //   method: "pay_fee",
    //   args: [maxFee],
    // });
    return this;
  }

  /**
   * Adds a fee instruction that calls the "take_fee_confidential" method on a component.
   * This method must exist and return a Bucket with containing revealed confidential XTR resource.
   * This allows the fee to originate from sources other than the transaction sender's account.
   * @param componentAddress
   * @param proof
   * @returns
   */
  feeTransactionPayFromComponentConfidential(componentAddress: string, proof: any): TransactionBuilder {
    // return this.addFeeInstruction({
    //   type: "CallMethod",
    //   componentAddress,
    //   method: "pay_fee_confidential",
    //   args: [proof],
    // });
    return this;
  }

  createAccount(ownerPublicKey: string): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CreateAccount",
    //   ownerPublicKey,
    //   workspaceBucket: undefined,
    // });
    return this;
  }

  createAccountWithBucket(ownerPublicKey: string, workspaceBucket: string): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CreateAccount",
    //   ownerPublicKey,
    //   workspaceBucket: workspaceBucket,
    // });
    return this;
  }

  callFunction(templateAddress: string, fct: string, args: any[]): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CallFunction",
    //   templateAddress,
    //   fct,
    //   args,
    // });
    return this;
  }

  callMethod(componentAddress: string, method: string, args: any[]): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CallMethod",
    //   componentAddress,
    //   method,
    //   args,
    // });
    return this;
  }

  dropAllProofsInWorkspace(): TransactionBuilder {
    // return this.addInstruction({ type: "DropAllProofsInWorkspace" });
    return this;
  }

  putLastInstructionOutputOnWorkspace(label: string): TransactionBuilder {
    // return this.addInstruction({
    //   type: "PutLastInstructionOutputOnWorkspace",
    //   key: label,
    // });
    return this;
  }

  claimBurn(claim: any): TransactionBuilder {
    // const claimInstruction = {
    //   type: "ClaimBurn",
    //   claim,
    // };
    // return this.addInstruction({
    //   type: "ClaimBurn",
    //   claim,
    // });
    return this;
  }

  createProof(account: string, resourceAddr: string): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CallMethod",
    //   componentAddress: account,
    //   method: "create_proof_for_resource",
    //   args: [resourceAddr],
    // });
    return this;
  }

  withFeeInstructions(instructions: Instruction[]): TransactionBuilder {
    this.unsignedTransaction.feeInstructions = instructions;
    this.signatures = [];
    return this;
  }

  withFeeInstructionsBuilder(builder: (builder: TransactionBuilder) => TransactionBuilder): TransactionBuilder {
    const newBuilder = builder(new TransactionBuilder());
    this.unsignedTransaction.feeInstructions = newBuilder.unsignedTransaction.instructions;
    this.signatures = [];
    return this;
  }

  addFeeInstruction(instruction: Instruction): TransactionBuilder {
    this.unsignedTransaction.feeInstructions.push(instruction);
    this.signatures = [];
    return this;
  }

  addInstruction(instruction: Instruction): TransactionBuilder {
    this.unsignedTransaction.instructions.push(instruction);
    this.signatures = [];
    return this;
  }

  withInstructions(instructions: Instruction[]): TransactionBuilder {
    this.unsignedTransaction.instructions.push(...instructions);
    this.signatures = [];
    return this;
  }

  addInput(inputObject: SubstateRequirement): TransactionBuilder {
    this.unsignedTransaction.inputs.add(inputObject);
    this.signatures = [];
    return this;
  }

  withInputs(inputs: SubstateRequirement[]): TransactionBuilder {
    // this.unsignedTransaction.inputs.push(...inputs);
    // this.signatures = [];
    return this;
  }

  withMaxEpoch(maxEpoch: number): this {
    this.unsignedTransaction.maxEpoch = maxEpoch;
    // Reset the signatures as they are no longer valid
    this.signatures = [];
    return this;
  }

  buildUnsignedTransaction(): UnsignedTransaction {
    return this.unsignedTransaction;
  }

  sign(secretKey: string): this {
    // this.signatures.push(TransactionSignature.sign(secretKey, this.unsignedTransaction));
    this.signatures.push();
    return this;
  }

  build(): Transaction {
    return new Transaction(this.unsignedTransaction, this.signatures);
  }
}
