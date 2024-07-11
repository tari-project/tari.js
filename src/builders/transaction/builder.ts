//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import { SubstateRequirement } from "../../providers/types";
import { Instruction, Arg, LogLevel } from "./instruction";

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
  args?: Arg[];
  templateAddress: string;
}
export interface TariMethodDefinition {
  methodName: string;
  args?: Arg[];
  componentAddress: string;
}

export interface TariCreateAccountDefinition {
  methodName: string;
  args?: {
    ownerPublicKey: string;
    workspaceBucket?: string | null;
  };
}

declare var Transaction: TransactionConstructor;

export interface Builder {
  callFunction<T extends TariFunctionDefinition>(func: T, args: Exclude<T["args"], undefined>): TransactionBuilder;
  callMethod<T extends TariMethodDefinition>(method: T, args: Exclude<T["args"], undefined>): TransactionBuilder;
  createAccount(ownerPublicKey: string, workspaceBucket?: string | null): TransactionBuilder;
  putLastInstructionOutputOnWorkspace(label: Uint8Array): TransactionBuilder;
  dropAllProofsInWorkspace(): TransactionBuilder;
  claimBurn(claim: any): TransactionBuilder;
  withUnsignedTransaction(unsignedTransaction: UnsignedTransaction): TransactionBuilder;
  withFeeInstructions(instructions: Instruction[]): TransactionBuilder;
  withFeeInstructionsBuilder(builder: (builder: TransactionBuilder) => TransactionBuilder): TransactionBuilder;
  addFeeInstruction(instruction: Instruction): TransactionBuilder;
  addInstruction(instruction: Instruction): TransactionBuilder;
  withInstructions(instructions: Instruction[]): TransactionBuilder;
  addInput(inputObject: SubstateRequirement): TransactionBuilder;
  withInputs(inputs: SubstateRequirement[]): TransactionBuilder;
  withMinEpoch(minEpoch: number): TransactionBuilder;
  withMaxEpoch(maxEpoch: number): TransactionBuilder;
  buildUnsignedTransaction(): UnsignedTransaction;
  emitLog(logLvl: LogLevel, message: string): TransactionBuilder;
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

  public withUnsignedTransaction(unsignedTransaction: UnsignedTransaction): TransactionBuilder {
    this.unsignedTransaction = unsignedTransaction;
    this.signatures = [];
    return this;
  }

  public callFunction<T extends TariFunctionDefinition>(
    func: T,
    args: Exclude<T["args"], undefined>,
  ): TransactionBuilder {
    return this.addInstruction({
      type: "CallFunction",
      templateAddress: func.templateAddress,
      function: func.functionName,
      args,
    });
  }

  public callMethod<T extends TariMethodDefinition>(
    method: T,
    args: Exclude<T["args"], undefined>,
  ): TransactionBuilder {
    return this.addInstruction({
      type: "CallMethod",
      componentAddress: method.componentAddress,
      method: method.methodName,
      args,
    });
  }

  public createAccount(ownerPublicKey: string, workspaceBucket?: string | null): TransactionBuilder {
    return this.addInstruction({
      type: "CreateAccount",
      ownerPublicKey,
      workspaceBucket,
    });
  }

  // TODO should this be separate function? define bucket type and convertion to string
  // public createAccountWithBucket(ownerPublicKey: string, workspaceBucket: string): TransactionBuilder {
  //   return this.addInstruction({
  //     type: "CreateAccount",
  //     ownerPublicKey,
  //     workspaceBucket: workspaceBucket,
  //   });
  // }

  public dropAllProofsInWorkspace(): TransactionBuilder {
    return this.addInstruction({ type: "DropAllProofsInWorkspace" });
  }

  public putLastInstructionOutputOnWorkspace(label: Uint8Array): TransactionBuilder {
    return this.addInstruction({
      type: "PutLastInstructionOutputOnWorkspace",
      key: label,
    });
  }

  // TODO add arg type
  public claimBurn(claim: any): TransactionBuilder {
    return this.addInstruction({
      type: "ClaimBurn",
      claim,
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

  public addInstruction(instruction: Instruction): TransactionBuilder {
    this.unsignedTransaction.instructions.push(instruction);
    this.signatures = [];
    return this;
  }

  public addFeeInstruction(instruction: Instruction): TransactionBuilder {
    this.unsignedTransaction.feeInstructions.push(instruction);
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

  public withMinEpoch(minEpoch: number): this {
    this.unsignedTransaction.minEpoch = minEpoch;
    // Reset the signatures as they are no longer valid
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
  public emitLog(logLvl: LogLevel, message: string): TransactionBuilder {
    //TODO
    console.log(`${logLvl}: ${message}`);
    return this;
  }

  public build(): Transaction {
    return new Transaction(this.unsignedTransaction, this.signatures);
  }
}
