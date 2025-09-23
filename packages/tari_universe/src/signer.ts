import {
  SubmitTransactionResponse,
  AccountData,
  Substate,
  TemplateDefinition,
  VaultBalances,
  ListSubstatesResponse,
  SubmitTransactionRequest,
  ListSubstatesRequest,
  GetTransactionResultResponse,
  ListAccountNftFromBalancesRequest,
  ListNftsRequest,
  ListNftsResponse,
} from "@tari-project/tarijs-types";
import { SignerRequest, SignerMethodNames, SignerReturnType, TariUniverseSignerParameters, WindowSize } from "./types";
import { sendSignerCall } from "./utils";
import { TariSigner } from "@tari-project/tari-signer";
import {
  AccountGetResponse,
  AccountsGetBalancesResponse,
  AccountsListRequest,
  AccountsListResponse,
  ConfidentialViewVaultBalanceRequest,
  WalletGetInfoResponse,
} from "@tari-project/typescript-bindings";
import { MessageType } from "./useIframeMessage";

export class TariUniverseSigner implements TariSigner {
  public signerName = "TariUniverse";
  private __id = 0;

  public constructor(public params: TariUniverseSignerParameters) {
    const filterResizeEvent = function (event: MessageEvent) {
      if (event.data && event.data.type === MessageType.RESIZE) {
        const resizeEvent = new CustomEvent(MessageType.RESIZE, {
          detail: { width: event.data.width, height: event.data.height },
        });
        window.dispatchEvent(resizeEvent);
      }
    };
    window.addEventListener("message", (event) => filterResizeEvent(event), false);
  }

  private async sendRequest<MethodName extends SignerMethodNames>(
    req: Omit<SignerRequest<MethodName>, "id">,
  ): Promise<SignerReturnType<MethodName>> {
    const id = ++this.__id;
    return sendSignerCall(req, id);
  }

  public isConnected(): boolean {
    return true;
  }

  public getPublicKey(): Promise<string> {
    return this.sendRequest<"getPublicKey">({ methodName: "getPublicKey", args: [] });
  }

  public async listSubstates({
    filter_by_template,
    filter_by_type,
    limit,
    offset,
  }: ListSubstatesRequest): Promise<ListSubstatesResponse> {
    return this.sendRequest<"listSubstates">({
      methodName: "listSubstates",
      args: [{ filter_by_template, filter_by_type, limit, offset }],
    });
  }

  public getConfidentialVaultBalances({
    vault_id,
    maximum_expected_value,
    minimum_expected_value,
    view_key_id,
  }: ConfidentialViewVaultBalanceRequest): Promise<VaultBalances> {
    return this.sendRequest({
      methodName: "getConfidentialVaultBalances",
      args: [{ view_key_id, vault_id, minimum_expected_value, maximum_expected_value }],
    });
  }

  public async createFreeTestCoins(): Promise<AccountData> {
    return this.sendRequest({ methodName: "createFreeTestCoins", args: [] });
  }

  public requestParentSize(): Promise<WindowSize> {
    return this.sendRequest({ methodName: "requestParentSize", args: [] });
  }

  public async accountsList(req: AccountsListRequest): Promise<AccountsListResponse> {
    return this.sendRequest({ methodName: "accountsList", args: [req] });
  }

  public async getAccount(): Promise<AccountData> {
    console.warn("ELOSZKI Z GET ACCOUNT");
    return this.sendRequest({ methodName: "getAccount", args: [] });
  }

  public async getAccountByAddress(address: string): Promise<AccountGetResponse> {
    return this.sendRequest({ methodName: "getAccountByAddress", args: [address] });
  }

  public async getAccountBalances(componentAddress: string): Promise<AccountsGetBalancesResponse> {
    return this.sendRequest({
      methodName: "getAccountBalances",
      args: [componentAddress],
    });
  }

  public async getSubstate(substate_id: string): Promise<Substate> {
    return this.sendRequest({
      methodName: "getSubstate",
      args: [substate_id],
    });
  }

  public async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
    return this.sendRequest({
      methodName: "submitTransaction",
      args: [req],
    });
  }

  public async getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse> {
    return this.sendRequest({
      methodName: "getTransactionResult",
      args: [transactionId],
    });
  }

  public async getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
    return this.sendRequest({ methodName: "getTemplateDefinition", args: [template_address] });
  }

  public async getNftsList(req: ListNftsRequest): Promise<ListNftsResponse> {
    return this.sendRequest({ methodName: "getNftsList", args: [req] });
  }

  public async getNftsFromAccountBalances(req: ListAccountNftFromBalancesRequest): Promise<ListNftsResponse> {
    return this.sendRequest({ methodName: "getNftsFromAccountBalances", args: [req] });
  }

  public async getWalletInfo(): Promise<WalletGetInfoResponse> {
    return this.sendRequest({ methodName: "getWalletInfo", args: [] });
  }
}
