//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import { SubstateRequirement } from "../../providers/types";
import { Amount } from "./amount";
import { Instruction } from "./instruction";
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

interface Transaction {
  unsignedTransaction: UnsignedTransaction;
  signatures: TransactionSignature[];
}

interface TransactionConstructor {
  new (unsignedTransaction: UnsignedTransaction, signatures: TransactionSignature[]): Transaction;
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

  private async callBuilderMethod<MethodName extends BuilderMethodNames>(
    req: Omit<BuilderRequest<MethodName>, "id">,
  ): Promise<BuilderReturnType<MethodName>> {
    return new Promise<BuilderReturnType<MethodName>>(function (resolve, _reject) {
      const resp = function (msg: MessageEvent<BuilderResponse<MethodName>>) {
        if (msg && msg.data && msg.data.type === "call-method") {
          console.log(req.args);
          resolve(msg.data.result);
        }
      };
    });
  }

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
    this.callBuilderMethod<"feeTransactionPayFromComponent">({
      methodName: "feeTransactionPayFromComponent",
      args: [componentAddress, maxFee],
    });
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
  public feeTransactionPayFromComponentConfidential(componentAddress: string, proof: any): TransactionBuilder {
    // return this.addFeeInstruction({
    //   type: "CallMethod",
    //   componentAddress,
    //   method: "pay_fee_confidential",
    //   args: [proof],
    // });
    return this;
  }

  public createAccount(ownerPublicKey: string): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CreateAccount",
    //   ownerPublicKey,
    //   workspaceBucket: undefined,
    // });
    return this;
  }

  public createAccountWithBucket(ownerPublicKey: string, workspaceBucket: string): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CreateAccount",
    //   ownerPublicKey,
    //   workspaceBucket: workspaceBucket,
    // });
    return this;
  }

  public callFunction(templateAddress: string, fct: string, args: any[]): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CallFunction",
    //   templateAddress,
    //   fct,
    //   args,
    // });
    return this;
  }

  public callMethod(componentAddress: string, method: string, args: any[]): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CallMethod",
    //   componentAddress,
    //   method,
    //   args,
    // });
    return this;
  }

  public dropAllProofsInWorkspace(): TransactionBuilder {
    // return this.addInstruction({ type: "DropAllProofsInWorkspace" });
    return this;
  }

  public putLastInstructionOutputOnWorkspace(label: string): TransactionBuilder {
    // return this.addInstruction({
    //   type: "PutLastInstructionOutputOnWorkspace",
    //   key: label,
    // });
    return this;
  }

  public claimBurn(claim: any): TransactionBuilder {
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

  public createProof(account: string, resourceAddr: string): TransactionBuilder {
    // return this.addInstruction({
    //   type: "CallMethod",
    //   componentAddress: account,
    //   method: "create_proof_for_resource",
    //   args: [resourceAddr],
    // });
    return this;
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
    // this.unsignedTransaction.inputs.push(...inputs);
    // this.signatures = [];
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

  public sign(secretKey: string): this {
    // this.signatures.push(TransactionSignature.sign(secretKey, this.unsignedTransaction));
    this.signatures.push();
    return this;
  }

  public build(): Transaction {
    return new Transaction(this.unsignedTransaction, this.signatures);
  }
}
