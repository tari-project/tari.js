import { ComponentAddress, LogLevel } from "@tari-project/typescript-bindings";
import { TransactionArg } from "./TransactionArg";
import { ConfidentialClaim } from "./ConfidentialClaim";
import { Amount } from "./Amount";
import { ConfidentialOutput } from "./ConfidentialOutput";
import { TemplateAddress } from "./TemplateAddress";

export type Instruction =
  | CreateAccount
  | CallFunction
  | CallMethod
  | PutLastInstructionOutputOnWorkspace
  | EmitLog
  | ClaimBurn
  | ClaimValidatorFees
  | DropAllProofsInWorkspace
  | CreateFreeTestCoins;

export type CreateAccount = { CreateAccount: { owner_public_key: string; workspace_bucket: string | null } };
export type CallFunction = {
  CallFunction: { template_address: TemplateAddress; function: string; args: Array<TransactionArg> };
};
export type CallMethod = {
  CallMethod: { component_address: ComponentAddress; method: string; args: Array<TransactionArg> };
};
export type PutLastInstructionOutputOnWorkspace = { PutLastInstructionOutputOnWorkspace: { key: number[] } };
export type EmitLog = { EmitLog: { level: LogLevel; message: string } };
export type ClaimBurn = { ClaimBurn: { claim: ConfidentialClaim } };
export type ClaimValidatorFees = { ClaimValidatorFees: { epoch: number; validator_public_key: string } };
export type DropAllProofsInWorkspace = "DropAllProofsInWorkspace";
export type CreateFreeTestCoins = {
  CreateFreeTestCoins: { revealed_amount: Amount; output: ConfidentialOutput | null };
};
