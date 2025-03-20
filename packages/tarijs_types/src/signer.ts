import { SubstateType, TemplateDef } from "@tari-project/typescript-bindings";

export type SubstateMetadata = {
  substate_id: string;
  module_name: string | null;
  version: number;
  template_address: string | null;
};

export type ReqSubstate = {
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
  required_substates: ReqSubstate[];
  is_dry_run: boolean;
  min_epoch: number | null;
  max_epoch: number | null;
  is_seal_signer_authorized: boolean;
  detect_inputs_use_unversioned: boolean;
};

export interface AccountData {
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

export type TemplateDefinition = TemplateDef;

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

export type ListSubstatesRequest = {
  filter_by_template: string | null;
  filter_by_type: SubstateType | null;
  limit: number | null;
  offset: number | null;
};

export type GetSubstateRequest = {
  substate_address: string;
  version: number | null;
};
