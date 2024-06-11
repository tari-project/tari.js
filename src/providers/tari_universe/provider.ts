import { TariPermissions } from "../wallet_daemon/tari_permissions";
import {
  SubmitTransactionRequest,
  TransactionResult,
  SubmitTransactionResponse,
  Account,
  Substate,
  TemplateDefinition,
  VaultBalances,
  ProviderRequest,
  ProviderMethodNames,
  ProviderReturnType,
  ProviderResponse,
} from "../types";
import { TariProvider } from "../index";
import { AccountsGetBalancesResponse } from "@tariproject/wallet_jrpc_client";

export const Unsupported = "UNSUPPORTED";

export type TariUniverseProviderParameters = {
  permissions: TariPermissions;
  optionalPermissions: TariPermissions;
  name?: string;
  onConnection?: () => void;
};

export class TariUniverseProvider implements TariProvider {
  public providerName = "TariUniverse";
  private __id = 0;

  public constructor(public params: TariUniverseProviderParameters) {}

  private async sendRequest<MethodName extends ProviderMethodNames>(
    req: Omit<ProviderRequest<MethodName>, "id">,
  ): Promise<Awaited<ProviderReturnType<MethodName>>> {
    const id = ++this.__id;
    return await new Promise<ProviderReturnType<MethodName>>(function (resolve, _reject) {
      const event_ref = function (resp: MessageEvent<ProviderResponse<MethodName>>) {
        if (resp && resp.data && resp.data.id && resp.data.id == id) {
          window.removeEventListener("message", event_ref);
          resolve(resp.data.result);
        }
      };
      window.addEventListener("message", event_ref, false);

      window.parent.postMessage({ ...req, id }, "*");
    });
  }

  public isConnected(): boolean {
    return true;
  }

  public getPublicKey(): Promise<string> {
    return this.sendRequest<"getPublicKey">({ methodName: "getPublicKey", args: [] });
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

  public async getAccount(): Promise<Account> {
    return this.sendRequest({ methodName: "getAccount", args: [] });
  }

  public async getAccountBalances(): Promise<AccountsGetBalancesResponse> {
    return this.sendRequest({
      methodName: "getAccountBalances",
      args: [],
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
