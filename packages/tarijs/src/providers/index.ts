import type { SubstateType } from "@tari-project/typescript-bindings";
import {
  Account,
  SubmitTransactionRequest,
  TransactionResult,
  SubmitTransactionResponse,
  VaultBalances,
  TemplateDefinition,
  Substate,
  ListSubstatesResponse,
} from "./types";
import { ProviderMethods, ProviderMethodNames, ProviderReturnType } from "./tari_universe/types";

export type {
  Account,
  SubmitTransactionRequest,
  TransactionResult,
  SubmitTransactionResponse,
  VaultBalances,
  TemplateDefinition,
  Substate,
  ListSubstatesResponse,
  ProviderMethods,
  ProviderMethodNames,
  ProviderReturnType,
};

export interface TariProvider {
  providerName: string;
  isConnected(): boolean;
  getAccount(): Promise<Account>;
  getSubstate(substate_address: string): Promise<Substate>;
  submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse>;
  getTransactionResult(transactionId: string): Promise<TransactionResult>;
  getTemplateDefinition(template_address: string): Promise<TemplateDefinition>;
  getPublicKey(branch: string, index: number): Promise<string>;
  getConfidentialVaultBalances(
    viewKeyId: number,
    vaultId: string,
    min: number | null,
    max: number | null,
  ): Promise<VaultBalances>;
  listSubstates(
    filter_by_template: string | null,
    filter_by_type: SubstateType | null,
    limit: number | null,
    offset: number | null,
  ): Promise<ListSubstatesResponse>;
}
