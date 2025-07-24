import type {
  AccountGetResponse,
  AccountsListRequest,
  AccountsListResponse,
  ConfidentialViewVaultBalanceRequest,
  ListAccountNftRequest,
  ListAccountNftResponse,
  WalletGetInfoResponse,
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
  accountsList(req: AccountsListRequest): Promise<AccountsListResponse>;
  getAccount(): Promise<AccountData>;
  getAccountByAddress(address: string): Promise<AccountGetResponse>;
  getSubstate(substate_address: string): Promise<Substate>;
  submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse>;
  getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse>;
  getTemplateDefinition(template_address: string): Promise<TemplateDefinition>;
  getPublicKey(branch: string, index: number): Promise<string>;
  getConfidentialVaultBalances(req: ConfidentialViewVaultBalanceRequest): Promise<VaultBalances>;
  listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse>;
  getNftsList(req: ListAccountNftRequest): Promise<ListAccountNftResponse>;
  getWalletInfo(): Promise<WalletGetInfoResponse>;
}
