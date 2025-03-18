import { FinalizeResult } from "@tari-project/typescript-bindings";

export type SubstateMetadata = {
  substate_id: string;
  module_name: string | null;
  version: number;
  template_address: string | null;
};

export type SubstateRequirement = {
  substate_id: string;
  version?: number | null;
};

export type SubmitTransactionRequest = {
  network: number;
  account_id: number;
  instructions: object[];
  fee_instructions: object[];
  inputs: object[];
  input_refs: object[];
  required_substates: SubstateRequirement[];
  is_dry_run: boolean;
  min_epoch: number | null;
  max_epoch: number | null;
  is_seal_signer_authorized: boolean;
  detect_inputs_use_unversioned: boolean;
};

export type SubmitTransactionResponse = {
  transaction_id: string;
};

export type TransactionResult = {
  transaction_id: string;
  status: TransactionStatus;
  result: FinalizeResult | null;
};

export enum TransactionStatus {
  New,
  DryRun,
  Pending,
  Accepted,
  Rejected,
  InvalidTransaction,
  OnlyFeeAccepted,
}

export interface Account {
  account_id: number;
  address: string;
  public_key: string;
  resources: VaultData[];
}

export interface VaultData {
  type: string;
  balance: number;
  resource_address: string;
  token_symbol: string;
  vault_id: string;
}

export interface VaultBalances {
  balances: Map<string, number | null>;
}

export interface TemplateDefinition {
  // TODO: Define this type
  [key: string]: any;
}

export interface Substate {
  value: any;
  address: {
    substate_id: string;
    version: number;
  };
}

export type ListSubstatesResponse = {
  substates: Array<SubstateMetadata>;
};
