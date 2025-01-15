import {
  SubmitTransactionRequest,
  TransactionResult,
  SubmitTransactionResponse,
  Account,
  Substate,
  TemplateDefinition,
  VaultBalances,
  ListSubstatesResponse,
} from "../types";
import {
  ProviderRequest,
  ProviderMethodNames,
  ProviderReturnType,
  TariUniverseProviderParameters,
  WindowSize,
} from "./types";
import { TariProvider } from "../index";
import { AccountsGetBalancesResponse, SubstateType } from "@tari-project/wallet_jrpc_client";
import { sendProviderCall } from "./utils";

export class TariUniverseProvider implements TariProvider {
  public providerName = "TariUniverse";
  private __id = 0;

  public constructor(public params: TariUniverseProviderParameters) {
    const filterResizeEvent = function (event: MessageEvent) {
      if (event.data && event.data.type === "resize") {
        const resizeEvent = new CustomEvent("resize", {
          detail: { width: event.data.width, height: event.data.height },
        });
        window.dispatchEvent(resizeEvent);
      }
    };
    window.addEventListener("message", (event) => filterResizeEvent(event), false);
  }

  private async sendRequest<MethodName extends ProviderMethodNames>(
    req: Omit<ProviderRequest<MethodName>, "id">,
  ): Promise<ProviderReturnType<MethodName>> {
    const id = ++this.__id;
    return sendProviderCall(req, id);
  }

  public isConnected(): boolean {
    return true;
  }

  public getPublicKey(): Promise<string> {
    return this.sendRequest<"getPublicKey">({ methodName: "getPublicKey", args: [] });
  }

  public async listSubstates(
    filter_by_template: string | null,
    filter_by_type: SubstateType | null,
    limit: number | null,
    offset: number | null,
  ): Promise<ListSubstatesResponse> {
    return this.sendRequest<"listSubstates">({
      methodName: "listSubstates",
      args: [filter_by_template, filter_by_type, limit, offset],
    });
  }

  public getConfidentialVaultBalances(
    viewKeyId: number,
    vaultId: string,
    min: number | null,
    max: number | null,
  ): Promise<VaultBalances> {
    return this.sendRequest({
      methodName: "getConfidentialVaultBalances",
      args: [viewKeyId, vaultId, min, max],
    });
  }

  public async createFreeTestCoins(): Promise<void> {
    return this.sendRequest({ methodName: "createFreeTestCoins", args: [] });
  }

  public requestParentSize(): Promise<WindowSize> {
    return this.sendRequest({ methodName: "requestParentSize", args: [] });
  }

  public async getAccount(): Promise<Account> {
    const { account_id, address, public_key } = await this.sendRequest({ methodName: "getAccount", args: [] });
    const { balances } = await this.getAccountBalances(address);

    return {
      account_id,
      address,
      public_key,
      resources: balances.map((b: any) => ({
        type: b.resource_type,
        resource_address: b.resource_address,
        balance: b.balance + b.confidential_balance,
        vault_id: "Vault" in b.vault_address ? b.vault_address.Vault : b.vault_address,
        token_symbol: b.token_symbol,
      })),
    };
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

  public async getTransactionResult(transactionId: string): Promise<TransactionResult> {
    return this.sendRequest({
      methodName: "getTransactionResult",
      args: [transactionId],
    });
  }

  public async getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
    return this.sendRequest({ methodName: "getTemplateDefinition", args: [template_address] });
  }
}
