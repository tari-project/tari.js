//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause
import {
  ConfidentialClaim,
  LogLevel,
  SubstateRequirement,
  TransactionSignature,
} from "@tariproject/typescript-bindings";
import { Instruction } from "../types/Instruction";
import { UnsignedTransaction } from "../types/UnsignedTransaction";
import { Builder, TariFunctionDefinition, TariMethodDefinition } from "../types/Builder";
import { TransactionReq } from "./TransactionReq";

export class TransactionBuilder implements Builder {
  private unsignedTransaction: UnsignedTransaction;
  private signatures: TransactionSignature[];

  constructor() {
    this.unsignedTransaction = {
      feeInstructions: [],
      instructions: [],
      inputs: [],
      filledInputs: [],
      minEpoch: null,
      maxEpoch: null,
    };
    this.signatures = [];
  }

  public withUnsignedTransaction(unsignedTransaction: UnsignedTransaction): this {
    this.unsignedTransaction = unsignedTransaction;
    this.signatures = [];
    return this;
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

  // TODO should this be separate function? define bucket type and convertion to string
  // public createAccountWithBucket(ownerPublicKey: string, workspaceBucket: string): this {
  //   return this.addInstruction({
  //     type: "CreateAccount",
  //     ownerPublicKey,
  //     workspaceBucket: workspaceBucket,
  //   });
  // }

  public dropAllProofsInWorkspace(): this {
    return this.addInstruction({ type: "DropAllProofsInWorkspace" });
  }

  public putLastInstructionOutputOnWorkspace(label: Uint8Array): this {
    return this.addInstruction({
      type: "PutLastInstructionOutputOnWorkspace",
      key: label,
    });
  }

  // TODO add arg type
  public claimBurn(claim: ConfidentialClaim): this {
    return this.addInstruction({
      type: "ClaimBurn",
      claim,
    });
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
  public emitLog(logLvl: LogLevel, message: string): this {
    //TODO
    console.log(`${logLvl}: ${message}`);
    return this;
  }

  // TODO should return Transaction but difference is in 'Instruction' type implementation
  public build(): TransactionReq {
    return new TransactionReq("0", this.unsignedTransaction, this.signatures);
  }
}
