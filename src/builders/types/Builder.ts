import {
  ComponentAddress,
  ConfidentialClaim,
  LogLevel,
  SubstateRequirement,
  Transaction,
  TransactionSignature,
} from "@tariproject/typescript-bindings";
import { Instruction } from "./Instruction";
import { UnsignedTransaction } from "./UnsignedTransaction";
import { TemplateAddress } from "./Address";
import { TransactionBuilder } from "../transaction/TransactionBuilder";
import { TransactionReq } from "../transaction/TransactionReq";

export interface TransactionConstructor {
  new (unsignedTransaction: UnsignedTransaction, signatures: TransactionSignature[]): Transaction;
}

export interface TariFunctionDefinition {
  functionName: string;
  args?: any[]; //TODO add arg type
  templateAddress: TemplateAddress;
}
export interface TariMethodDefinition {
  methodName: string;
  args?: any[]; //TODO add arg type
  componentAddress: ComponentAddress;
}

export interface TariCreateAccountDefinition {
  methodName: string;
  args?: {
    ownerPublicKey: string;
    workspaceBucket?: string;
  };
}

export interface Builder {
  callFunction<T extends TariFunctionDefinition>(func: T, args: Exclude<T["args"], undefined>): this;
  callMethod<T extends TariMethodDefinition>(method: T, args: Exclude<T["args"], undefined>): this;
  createAccount(ownerPublicKey: string, workspaceBucket?: string): this;
  putLastInstructionOutputOnWorkspace(label: Uint8Array): this;
  dropAllProofsInWorkspace(): this;
  claimBurn(claim: ConfidentialClaim): this;
  withUnsignedTransaction(unsignedTransaction: UnsignedTransaction): this;
  withFeeInstructions(instructions: Instruction[]): this;
  withFeeInstructionsBuilder(builder: (builder: TransactionBuilder) => this): this;
  addFeeInstruction(instruction: Instruction): this;
  addInstruction(instruction: Instruction): this;
  withInstructions(instructions: Instruction[]): this;
  addInput(inputObject: SubstateRequirement): this;
  withInputs(inputs: SubstateRequirement[]): this;
  withMinEpoch(minEpoch: number): this;
  withMaxEpoch(maxEpoch: number): this;
  buildUnsignedTransaction(): UnsignedTransaction;
  emitLog(logLvl: LogLevel, message: string): this;
  build(): TransactionReq; //TODO return Transaction type from bindings? 
}
