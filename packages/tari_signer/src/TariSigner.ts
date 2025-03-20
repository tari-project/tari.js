import type {
  ConfidentialViewVaultBalanceRequest,
  ListAccountNftRequest,
  ListAccountNftResponse,
} from "@tari-project/typescript-bindings";
import {
  GetTransactionResultResponse,
  AccountData,
  SubmitTransactionRequest,
  SubmitTransactionResponse,
  VaultBalances,
  TemplateDefinition,
  Substate,
  ListSubstatesResponse,
  ListSubstatesRequest,
} from "@tari-project/tarijs-types";

export interface TariSigner {
  signerName: string;
  isConnected(): boolean;
  getAccount(): Promise<AccountData>;
  getSubstate(substate_address: string): Promise<Substate>;
  submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse>;
  getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse>;
  getTemplateDefinition(template_address: string): Promise<TemplateDefinition>;
  getPublicKey(branch: string, index: number): Promise<string>;
  getConfidentialVaultBalances(req: ConfidentialViewVaultBalanceRequest): Promise<VaultBalances>;
  listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse>;
  getNftsList(req: ListAccountNftRequest): Promise<ListAccountNftResponse>;
}
