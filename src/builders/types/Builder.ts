import {
  ComponentAddress,
  ConfidentialClaim,
  SubstateRequirement,
  Transaction,
  TransactionSignature,
  Instruction,
  UnsignedTransaction,
  ResourceAddress,
} from "@tariproject/typescript-bindings";
import { TemplateAddress } from "./Address";
import { TransactionBuilder } from "../transaction/TransactionBuilder";
import { Amount } from "./Amount";

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

export interface WorkspaceArg {
  Workspace: number[];
}

export interface Builder {
  callFunction<T extends TariFunctionDefinition>(func: T, args: Exclude<T["args"], undefined>): this;
  callMethod<T extends TariMethodDefinition>(method: T, args: Exclude<T["args"], undefined>): this;
  createAccount(ownerPublicKey: string, workspaceBucket: string | null): this;
  createProof(account: ComponentAddress, resourceAddress: ResourceAddress): this;
  putLastInstructionOutputOnWorkspace(label: Array<number>): this;
  dropAllProofsInWorkspace(): this;
  claimBurn(claim: ConfidentialClaim): this;
  addInput(inputObject: SubstateRequirement): this;
  addInstruction(instruction: Instruction): this;
  addFeeInstruction(instruction: Instruction): this;
  withMinEpoch(minEpoch: number): this;
  withMaxEpoch(maxEpoch: number): this;
  withInputs(inputs: SubstateRequirement[]): this;
  withInstructions(instructions: Instruction[]): this;
  withFeeInstructions(instructions: Instruction[]): this;
  withFeeInstructionsBuilder(builder: (builder: TransactionBuilder) => this): this;
  withUnsignedTransaction(unsignedTransaction: UnsignedTransaction): this;
  feeTransactionPayFromComponent(componentAddress: ComponentAddress, maxFee: Amount): this;
  buildUnsignedTransaction(): UnsignedTransaction;
  build(): Transaction;
}
