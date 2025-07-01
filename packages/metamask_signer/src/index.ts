import { TariSigner } from "@tari-project/tari-signer";
import {
  SubmitTransactionRequest,
  TransactionStatus,
  SubmitTransactionResponse,
  VaultBalances,
  TemplateDefinition,
  Substate,
  ListSubstatesResponse,
  AccountData,
  ListSubstatesRequest,
  GetTransactionResultResponse,
} from "@tari-project/tarijs-types";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { connectSnap, getSnap, isFlask, Snap } from "./utils";
import {
  ConfidentialViewVaultBalanceRequest,
  ListAccountNftRequest,
  ListAccountNftResponse,
  SubstateType,
} from "@tari-project/typescript-bindings";

export const MetamaskNotInstalled = "METAMASK_NOT_INSTALLED";
export const MetamaskIsNotFlask = "METAMASK_IS_NOT_FLASK";
export const TariSnapNotInstalled = "TARI_SNAP_NOT_INSTALLED";

type Maybe<T> = T | null | undefined;

export class MetamaskTariSigner implements TariSigner {
  public signerName = "Metamask";
  snapId: string;
  snapVersion: string | undefined;
  metamask: MetaMaskInpageProvider;
  snap?: Snap;
  metamaskConnected: boolean;

  constructor(snapId: string, metamask: MetaMaskInpageProvider) {
    this.snapId = snapId;
    this.snapVersion = undefined;
    this.metamask = metamask;
    this.metamaskConnected = false;
  }

  async connect(): Promise<void> {
    // check that the metamask provider is valid
    if (!this.metamask || !this.metamask.isMetaMask) {
      throw MetamaskNotInstalled;
    }

    // check that flask is installed
    if (!isFlask(this.metamask)) {
      throw MetamaskIsNotFlask;
    }

    // connect to the tari snap
    // this will request MetaMask the installation of the tari snap if it's not already installed
    await connectSnap(this.metamask, { [this.snapId]: { version: this.snapVersion } });

    // store the tari snap reference
    const snap = await getSnap(this.metamask, this.snapId);
    if (!snap) {
      // this should olny happen if the user didn't accept the tari snap in the previous step
      throw TariSnapNotInstalled;
    }
    this.snap = snap;
    this.metamaskConnected = true;
  }

  public isConnected(): boolean {
    return this.metamaskConnected;
  }

  public async createFreeTestCoins(account_id: number): Promise<AccountData> {
    const res = (await this.metamaskRequest("getFreeTestCoins", {
      amount: 1000000,
      account_id,
      fee: 2000,
    })) as any;
    return {
      account_id,
      address: res.address,
      public_key: res.public_key,
      resources: [],
    };
  }

  async getAccount(): Promise<AccountData> {
    return (await this.metamaskRequest("getAccountData", { account_id: 0 })) as any;
  }

  async getSubstate(substate_address: string): Promise<Substate> {
    const {
      substate,
      address: substate_id,
      version,
    } = await this.metamaskRequest<any>("getSubstate", { substate_address });
    return { value: substate, address: { substate_id, version } };
  }

  async listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse> {
    return await this.metamaskRequest("listSubstates", req);
  }

  async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
    const params = req.transaction;

    const resp = await this.metamaskRequest<any>("sendTransaction", params);
    if (!resp) {
      throw new Error("Failed to submit transaction to metamask snap: empty response");
    }
    if (resp.error) {
      throw new Error(`Failed to submit transaction to metamask snap: ${resp.error}`);
    }
    return { transaction_id: resp.transaction_id };
  }

  public async getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse> {
    // This request returns the response from the indexer get_transaction_result request
    const resp: Maybe<any> = await this.metamaskRequest("getTransactionResult", { transaction_id: transactionId });

    if (!resp) {
      throw new Error("Failed to get transaction result from metamask snap: empty response");
    }

    if (resp.result === "Pending") {
      return {
        transaction_id: transactionId,
        status: TransactionStatus.Pending,
        result: null,
      } as GetTransactionResultResponse;
    }

    if (!resp?.result?.Finalized) {
      throw new Error("Transaction result was not pending nor finalized");
    }

    const newStatus = convertToStatus(resp.result.Finalized);

    return {
      transaction_id: transactionId,
      status: newStatus,
      result: resp.result.Finalized.execution_result.finalize,
    } as GetTransactionResultResponse;
  }

  public async getPublicKey(_branch: string, index: number): Promise<string> {
    const resp: Maybe<any> = await this.metamaskRequest("getPublicKey", { index });

    if (!resp) {
      throw new Error("Failed to get public key from metamask snap: empty response");
    }

    return resp.public_key;
  }

  public async getConfidentialVaultBalances({
                                              vault_id,
                                              maximum_expected_value,
                                              minimum_expected_value,
                                              view_key_id,
                                            }: ConfidentialViewVaultBalanceRequest): Promise<VaultBalances> {
    const resp = await this.metamaskRequest("getConfidentialVaultBalances", {
      view_key_id,
      vault_id,
      minimum_expected_value,
      maximum_expected_value,
    });

    return { balances: resp as Map<string, number | null> };
  }

  getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
    return this.metamaskRequest("getTemplateDefinition", { template_address }).then((resp) => {
      if (!resp) {
        throw new Error("Template not found");
      }

      return (resp as { definition: TemplateDefinition }).definition;
    });
  }

  private async metamaskRequest<T>(method: string, params: Object): Promise<T> {
    console.log("Metamask request:", method, params);
    const resp = await this.metamask.request({
      method: "wallet_invokeSnap",
      params: {
        snapId: this.snapId,
        request: {
          method,
          params,
        },
      },
    });

    console.log("Metamask response:", resp);

    if (!resp) {
      throw new Error("Metamask request failed: empty response");
    }

    return resp as T;
  }

  public async getNftsList(req: ListAccountNftRequest): Promise<ListAccountNftResponse> {
    const resp = (await this.metamaskRequest("getNftsList", req)) as ListAccountNftResponse;
    return resp;
  }
}

function convertToStatus(result: any): TransactionStatus {
  // Ref: https://github.com/tari-project/tari-ootle/blob/bb0b31139b770aacd7bb49af865543aa4a9e2de4/dan_layer/wallet/sdk/src/apis/transaction.rs
  if (result.final_decision !== "Commit") {
    return TransactionStatus.Rejected;
  }

  // if (!result?.result?.Finalized) {
  //     throw new Error("Transaction result was finalized but no result was returned");
  // }
  //
  // if (result.finalize.AcceptFeeRejectRest) {
  //     return TransactionStatus.OnlyFeeAccepted;
  // }

  return TransactionStatus.Accepted;
}
