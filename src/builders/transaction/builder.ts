//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import { SubstateRequirement } from "../../providers/types";
import { Amount } from "./amount";
import { Instruction, Arg } from "./instruction";
import { BuilderMethodNames, BuilderRequest, BuilderResponse, BuilderReturnType } from "./types";

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

interface VersionedSubstateId {
  substateId: string;
  version: number;
}

interface Transaction {
  id: string;
  transaction: UnsignedTransaction;
  signatures: TransactionSignature[];
  filledInputs: Set<VersionedSubstateId>;
}

interface TransactionConstructor {
  new (unsignedTransaction: UnsignedTransaction, signatures: TransactionSignature[]): Transaction;
}

export interface TariFunctionDefinition {
  functionName: string;
  arguments?: Arg[];
  templateAddress: string;
}

declare var Transaction: TransactionConstructor;

export interface Builder {
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

  // public async callBuilderMethod<MethodName extends BuilderMethodNames>(
  //   req: Omit<BuilderRequest<MethodName>, "id">,
  // ): Promise<BuilderReturnType<MethodName>> {
  //   return new Promise<BuilderReturnType<MethodName>>(function (resolve, _reject) {
  //     const resp = function (msg: MessageEvent<BuilderResponse<MethodName>>) {
  //       if (msg && msg.data && msg.data.type === "call-method") {
  //         //TODO ADD METHOD HERE
  //         resolve(msg.data.result);
  //       }
  //     };
  //   });
  // }

  public withUnsignedTransaction(unsignedTransaction: UnsignedTransaction): TransactionBuilder {
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
  public feeTransactionPayFromComponent(componentAddress: string, maxFee: Amount): TransactionBuilder {
    /**
      const arg1: Arg = { type: 'string', value: 'arg1' };
      const arg2: Arg = { type: 'number', value: 42 };
      const instruction: Instruction = {
      type: 'CallFunction',
      templateAddress: '0x1234567890abcdef',
      function: 'myFunction',
      args: [arg1, arg2],
      };
     */

    return this.addFeeInstruction({
      type: "CallMethod",
      componentAddress,
      method: "pay_fee",
      args: [maxFee],
    });
  }

  /**
   * Adds a fee instruction that calls the "take_fee_confidential" method on a component.
   * This method must exist and return a Bucket with containing revealed confidential XTR resource.
   * This allows the fee to originate from sources other than the transaction sender's account.
   * @param componentAddress
   * @param proof
   * @returns
   */
  public feeTransactionPayFromComponentConfidential(componentAddress: string, proof: any): TransactionBuilder {
    return this.addFeeInstruction({
      type: "CallMethod",
      componentAddress,
      method: "pay_fee_confidential",
      args: [proof],
    });
  }

  public createAccount(ownerPublicKey: string): TransactionBuilder {
    // const instruction = {}
    return this.addInstruction({
      type: "CreateAccount",
      ownerPublicKey,
      workspaceBucket: undefined,
    });
  }

  public createAccountWithBucket(ownerPublicKey: string, workspaceBucket: string): TransactionBuilder {
    return this.addInstruction({
      type: "CreateAccount",
      ownerPublicKey,
      workspaceBucket: workspaceBucket,
    });
  }

  public dupa<T extends TariFunctionDefinition>(func: T, args: Exclude<T["arguments"], undefined>): TransactionBuilder {
    return this.addInstruction({
      type: "CallFunction",
      templateAddress: func.templateAddress,
      function: func.functionName,
      args,
    });
  }

  public callFunction(templateAddress: string, fct: string, args: any[]): TransactionBuilder {
    return this.addInstruction({
      type: "CallFunction",
      templateAddress,
      function: fct,
      args,
    });
  }

  public callMethod(componentAddress: string, method: string, args: any[]): TransactionBuilder {
    return this.addInstruction({
      type: "CallMethod",
      componentAddress,
      method,
      args,
    });
  }

  public dropAllProofsInWorkspace(): TransactionBuilder {
    return this.addInstruction({ type: "DropAllProofsInWorkspace" });
  }

  public putLastInstructionOutputOnWorkspace(label: string): TransactionBuilder {
    return this.addInstruction({
      type: "PutLastInstructionOutputOnWorkspace",
      key: label,
    });
  }

  public claimBurn(claim: any): TransactionBuilder {
    return this.addInstruction({
      type: "ClaimBurn",
      claim,
    });
  }

  public createProof(account: string, resourceAddr: string): TransactionBuilder {
    return this.addInstruction({
      type: "CallMethod",
      componentAddress: account,
      method: "create_proof_for_resource",
      args: [resourceAddr],
    });
  }

  public withFeeInstructions(instructions: Instruction[]): TransactionBuilder {
    this.unsignedTransaction.feeInstructions = instructions;
    this.signatures = [];
    return this;
  }

  public withFeeInstructionsBuilder(builder: (builder: TransactionBuilder) => TransactionBuilder): TransactionBuilder {
    const newBuilder = builder(new TransactionBuilder());
    this.unsignedTransaction.feeInstructions = newBuilder.unsignedTransaction.instructions;
    this.signatures = [];
    return this;
  }

  public addFeeInstruction(instruction: Instruction): TransactionBuilder {
    this.unsignedTransaction.feeInstructions.push(instruction);
    this.signatures = [];
    return this;
  }

  public addInstruction(instruction: Instruction): TransactionBuilder {
    this.unsignedTransaction.instructions.push(instruction);
    this.signatures = [];
    return this;
  }

  public withInstructions(instructions: Instruction[]): TransactionBuilder {
    this.unsignedTransaction.instructions.push(...instructions);
    this.signatures = [];
    return this;
  }

  public addInput(inputObject: SubstateRequirement): TransactionBuilder {
    this.unsignedTransaction.inputs.add(inputObject);
    this.signatures = [];
    return this;
  }

  public withInputs(inputs: SubstateRequirement[]): TransactionBuilder {
    inputs.forEach((input) => this.unsignedTransaction.inputs.add(input));
    this.signatures = [];
    return this;
  }

  public withMaxEpoch(maxEpoch: number): this {
    this.unsignedTransaction.maxEpoch = maxEpoch;
    // Reset the signatures as they are no longer valid
    this.signatures = [];
    return this;
  }

  public buildUnsignedTransaction(): UnsignedTransaction {
    return this.unsignedTransaction;
  }

  public build(): Transaction {
    return new Transaction(this.unsignedTransaction, this.signatures);
  }
}
