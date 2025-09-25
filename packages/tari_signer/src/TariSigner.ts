import type {
  AccountGetResponse,
  AccountsListRequest,
  AccountsListResponse,
  WalletGetInfoResponse,
} from "@tari-project/typescript-bindings";
import {
  GetTransactionResultResponse,
  AccountData,
  SubmitTransactionRequest,
  SubmitTransactionResponse,
  TemplateDefinition,
  Substate,
  ListSubstatesResponse,
  ListSubstatesRequest,
  ListNftsRequest,
  ListNftsResponse,
} from "@tari-project/tarijs-types";

export interface TariSigner {
  signerName: string;
  isConnected(): boolean;
  // TODO: this should have signTransaction(UnsignedTransaction, keyId) and remove the rest of these
  accountsList(req: AccountsListRequest): Promise<AccountsListResponse>;
  getAccount(): Promise<AccountData>;
  getAccountByAddress(address: string): Promise<AccountGetResponse>;
  getSubstate(substate_address: string): Promise<Substate>;
  submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse>;
  getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse>;
  getTemplateDefinition(template_address: string): Promise<TemplateDefinition>;
  getPublicKey(branch: string, index: number): Promise<string>;
  listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse>;
  getNftsList(req: ListNftsRequest): Promise<ListNftsResponse>;
  getWalletInfo(): Promise<WalletGetInfoResponse>;
}
