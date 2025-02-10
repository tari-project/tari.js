import { TemplateAddress } from "./TemplateAddress";
import { Arg } from "./Arg";
import {
  ComponentAddress,
  ConfidentialClaim,
  ConfidentialWithdrawProof,
  Instruction,
  ResourceAddress,
  SubstateRequirement,
  Transaction,
  TransactionSignature,
  UnsignedTransaction,
} from ".";
import { TransactionBuilder } from "../transaction";

export interface TransactionConstructor {
  new (unsignedTransaction: UnsignedTransaction, signatures: TransactionSignature[]): Transaction;
}

export interface TariFunctionDefinition {
  functionName: string;
  args?: Arg[];
  templateAddress: TemplateAddress;
}
export interface TariMethodDefinition {
  methodName: string;
  args?: Arg[];
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
  createProof(account: ComponentAddress, resourceAddress: ResourceAddress): this;
  saveVar(key: string): this;
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
  feeTransactionPayFromComponent(componentAddress: ComponentAddress, maxFee: string): this;
  feeTransactionPayFromComponentConfidential(
    componentAddress: ComponentAddress,
    proof: ConfidentialWithdrawProof,
  ): this;
  buildUnsignedTransaction(): UnsignedTransaction;
  build(): Transaction;
}
