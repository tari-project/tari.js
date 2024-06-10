import { TariPermissions } from "../wallet_daemon/tari_permissions";
import {
  SubmitTransactionRequest,
  TransactionResult,
  TransactionStatus,
  SubmitTransactionResponse,
  Account,
  TariUniverseProviderRequest,
  Substate,
  TemplateDefinition,
  VaultBalances,
} from "../types";
import { TariProvider } from "../index";
import { Instruction, TransactionSubmitRequest, AccountsGetBalancesResponse } from "@tariproject/wallet_jrpc_client";

export const Unsupported = "UNSUPPORTED";

export type TariUniverseProviderParameters = {
  permissions: TariPermissions;
  optionalPermissions: TariPermissions;
  name?: string;
  onConnection?: () => void;
};

export class TariUniverseProvider implements TariProvider {
  public providerName = "WalletDaemon";
  params: TariUniverseProviderParameters;
  private __id = 0;

  public constructor(params: TariUniverseProviderParameters) {
    this.params = params;
  }

  private async sendRequest(req: Omit<TariUniverseProviderRequest, "id">): Promise<any> {
    const id = ++this.__id;
    return new Promise(function (resolve, _reject) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event_ref = function (resp: any) {
        if (resp && resp.data && resp.data.id && resp.data.id == id) {
          window.removeEventListener("message", event_ref);
          resolve(resp.data);
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
    return this.sendRequest({ methodName: "getPublicKey", args: [] });
  }

  public getConfidentialVaultBalances(
    viewKeyId: number,
    vaultId: string,
    min: number | null,
    max: number | null,
  ): Promise<VaultBalances> {
    return this.sendRequest({
      methodName: "getConfidentialVaultBalances",
      args: [{ view_key_id: viewKeyId, vault_id: vaultId, minimum_expected_value: min, maximum_expected_value: max }],
    });
  }

  public async createFreeTestCoins(): Promise<void> {
    return this.sendRequest({ methodName: "createFreeTestCoins", args: [] });
  }

  public async getAccount(): Promise<Account> {
    const { account, public_key } = (await this.sendRequest({ methodName: "getAccount", args: [] })) as any;

    return {
      account_id: account.key_index,
      address: account.address.Component,
      public_key,
      // TODO
      resources: [],
    };
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
    const params = {
      transaction: null, // TODO figure out what this is
      signing_key_index: req.account_id,
      fee_instructions: req.fee_instructions as Instruction[],
      instructions: req.instructions as Instruction[],
      inputs: req.required_substates.map((s) => ({
        // TODO: Hmm The bindings want a SubstateId object, but the wallet only wants a string. Any is used to skip type checking here
        substate_id: s.substate_id as any,
        version: s.version || null,
      })),
      override_inputs: false,
      is_dry_run: req.is_dry_run,
      proof_ids: [],
      min_epoch: null,
      max_epoch: null,
    } satisfies TransactionSubmitRequest;
    const res = await this.sendRequest({
      methodName: "getSubstate",
      args: [params],
    });

    return { transaction_id: res.transaction_id };
  }

  public async getTransactionResult(transactionId: string): Promise<TransactionResult> {
    const res = await this.sendRequest({
      methodName: "getTransactionResult",
      args: [transactionId],
    });

    return {
      transaction_id: transactionId,
      status: convertStringToTransactionStatus(res.status),
      result: res.result,
    };
  }

  public async getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
    return await this.sendRequest({ methodName: "getTemplateDefinition", args: [template_address] });
  }
}

function convertStringToTransactionStatus(status: string): TransactionStatus {
  switch (status) {
    case "New":
      return TransactionStatus.New;
    case "DryRun":
      return TransactionStatus.DryRun;
    case "Pending":
      return TransactionStatus.Pending;
    case "Accepted":
      return TransactionStatus.Accepted;
    case "Rejected":
      return TransactionStatus.Rejected;
    case "InvalidTransaction":
      return TransactionStatus.InvalidTransaction;
    case "OnlyFeeAccepted":
      return TransactionStatus.OnlyFeeAccepted;
    default:
      throw new Error(`Unknown status: ${status}`);
  }
}
