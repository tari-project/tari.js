//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause
import { Builder, TariFunctionDefinition, TariMethodDefinition } from "../types/Builder";
import { TransactionRequest } from "./TransactionRequest";
import {
  Amount,
  ComponentAddress,
  ConfidentialClaim,
  Instruction,
  ResourceAddress,
  SubstateRequirement,
  Transaction,
  TransactionSignature,
  UnsignedTransaction,
} from "../types";
import { toWorkspace } from "../helpers/workspace";

export class TransactionBuilder implements Builder {
  private unsignedTransaction: UnsignedTransaction;
  private signatures: TransactionSignature[];

  constructor() {
    this.unsignedTransaction = {
      feeInstructions: [],
      instructions: [],
      inputs: [],
      filledInputs: [],
      minEpoch: undefined,
      maxEpoch: undefined,
    };
    this.signatures = [];
  }

  public callFunction<T extends TariFunctionDefinition>(func: T, args: Exclude<T["args"], undefined>): this {
    return this.addInstruction({
      type: "CallFunction",
      templateAddress: func.templateAddress,
      function: func.functionName,
      args,
    });
  }

  public callMethod<T extends TariMethodDefinition>(method: T, args: Exclude<T["args"], undefined>): this {
    return this.addInstruction({
      type: "CallMethod",
      componentAddress: method.componentAddress,
      method: method.methodName,
      args,
    });
  }

  public createAccount(ownerPublicKey: string, workspaceBucket?: string): this {
    return this.addInstruction({
      type: "CreateAccount",
      ownerPublicKey,
      workspaceBucket,
    });
  }

  public createProof(account: ComponentAddress, resourceAddress: ResourceAddress): this {
    return this.addInstruction({
      type: "CallMethod",
      componentAddress: account,
      method: "create_proof_for_resource",
      args: [resourceAddress],
    });
  }

  public dropAllProofsInWorkspace(): this {
    return this.addInstruction({
      type: "DropAllProofsInWorkspace",
    });
  }

  /**
   * `SaveVar` replaces
   * `PutLastInstructionOutputOnWorkspace: { key: Array<number> }`
   * but under the hood it does the same.
   */
  public saveVar(key: string): this {
    return this.addInstruction({
      type: "PutLastInstructionOutputOnWorkspace",
      key: toWorkspace(key),
    });
  }

  public claimBurn(claim: ConfidentialClaim): this {
    return this.addInstruction({
      type: "ClaimBurn",
      claim,
    });
  }

  /**
   *
   * Adds a fee instruction that calls the "take_fee" method on a component.
   * This method must exist and return a Bucket with containing revealed confidential XTR resource.
   * This allows the fee to originate from sources other than the transaction sender's account.
   * The fee instruction will lock up the "max_fee" amount for the duration of the transaction.
   */
  public feeTransactionPayFromComponent(componentAddress: ComponentAddress, maxFee: Amount): this {
    return this.addFeeInstruction({
      type: "CallMethod",
      componentAddress,
      method: "pay_fee",
      args: [maxFee],
    });
  }

  public withUnsignedTransaction(unsignedTransaction: UnsignedTransaction): this {
    this.unsignedTransaction = unsignedTransaction;
    this.signatures = [];
    return this;
  }

  public withFeeInstructions(instructions: Instruction[]): this {
    this.unsignedTransaction.feeInstructions = instructions;
    this.signatures = [];
    return this;
  }

  public withFeeInstructionsBuilder(builder: (builder: TransactionBuilder) => TransactionBuilder): this {
    const newBuilder = builder(new TransactionBuilder());
    this.unsignedTransaction.feeInstructions = newBuilder.unsignedTransaction.instructions;
    this.signatures = [];
    return this;
  }

  public addInstruction(instruction: Instruction): this {
    this.unsignedTransaction.instructions.push(instruction);
    this.signatures = [];
    return this;
  }

  public addFeeInstruction(instruction: Instruction): this {
    this.unsignedTransaction.feeInstructions.push(instruction);
    this.signatures = [];
    return this;
  }

  public withInstructions(instructions: Instruction[]): this {
    this.unsignedTransaction.instructions.push(...instructions);
    this.signatures = [];
    return this;
  }

  public addInput(inputObject: SubstateRequirement): this {
    this.unsignedTransaction.inputs.push(inputObject);
    this.signatures = [];
    return this;
  }

  public withInputs(inputs: SubstateRequirement[]): this {
    this.unsignedTransaction.inputs.push(...inputs);
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

  public build(): Transaction {
    return new TransactionRequest(this.unsignedTransaction, this.signatures);
  }
}
