import { ComponentAddress, ResourceAddress, LogLevel, PublishedTemplateAddress, SubstateType, WorkspaceOffsetId } from "@tari-project/typescript-bindings";
import { TransactionArg } from "./TransactionArg";
import { ConfidentialClaim } from "./ConfidentialClaim";
import { Amount } from "./Amount";
import { ConfidentialOutput } from "./ConfidentialOutput";

export type Instruction =
  | CreateAccount
  | CallFunction
  | CallMethod
  | PutLastInstructionOutputOnWorkspace
  | EmitLog
  | ClaimBurn
  | ClaimValidatorFees
  | DropAllProofsInWorkspace
  | CreateFreeTestCoins
  | AllocateAddress
  | AssertBucketContains;

export type CreateAccount = { CreateAccount: { owner_public_key: string; workspace_bucket: string | null } };
export type CallFunction = {
  CallFunction: { template_address: PublishedTemplateAddress; function: string; args: Array<TransactionArg> };
};
export type CallMethod = {
  CallMethod: { component_address: ComponentAddress; method: string; args: Array<TransactionArg> };
};
export type PutLastInstructionOutputOnWorkspace = { PutLastInstructionOutputOnWorkspace: { key: string } };
export type EmitLog = { EmitLog: { level: LogLevel; message: string } };
export type ClaimBurn = { ClaimBurn: { claim: ConfidentialClaim } };
export type ClaimValidatorFees = { ClaimValidatorFees: { epoch: number; validator_public_key: string } };
export type DropAllProofsInWorkspace = "DropAllProofsInWorkspace";
export type CreateFreeTestCoins = {
  CreateFreeTestCoins: { revealed_amount: Amount; output: ConfidentialOutput | null };
};
export type AllocateAddress = {
  AllocateAddress: { substate_type: SubstateType; workspace_id: string };
};
export type AssertBucketContains = {
  AssertBucketContains: { key: WorkspaceOffsetId; resource_address: ResourceAddress; min_amount: Amount };
}
