import { TariSigner } from "@tari-project/tari-signer";
import UniversalProvider from "@walletconnect/universal-provider";
import { AppKitNetwork, mainnet, sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/core";
import {
  convertStringToTransactionStatus,
  GetTransactionResultResponse,
  SubmitTransactionRequest,
  VaultBalances,
  TemplateDefinition,
  Substate,
  AccountData,
  ListSubstatesResponse,
  ListSubstatesRequest,
  SubmitTransactionResponse,
} from "@tari-project/tarijs-types";
import {
  AccountGetResponse,
  AccountsListRequest,
  AccountsListResponse,
  ConfidentialViewVaultBalanceRequest,
  KeyBranch,
  ListAccountNftRequest,
  ListAccountNftResponse,
  substateIdToString,
  TransactionSubmitRequest,
  WalletGetInfoResponse,
} from "@tari-project/typescript-bindings";
import { TariPermission } from "@tari-project/tari-permissions";

const walletConnectParams = {
  optionalNamespaces: {
    tari: {
      methods: [
        "tari_getSubstate",
        "tari_getDefaultAccount",
        "tari_getAccountBalances",
        "tari_submitTransaction",
        "tari_getTransactionResult",
        "tari_getTemplate",
        "tari_createKey",
        "tari_viewConfidentialVaultBalance",
        "tari_createFreeTestCoins",
        "tari_listSubstates",
        "tari_getNftsList",
        "tari_getWalletInfo",
      ],
      chains: ["tari:devnet"],
      events: [],
      // events: ["chainChanged", "accountsChanged"],
    },
  },
};

export interface WalletConnectParameters {
  requiredPermissions?: TariPermission[];
  optionalPermissions?: TariPermission[];
  projectId: string;
}

export class WalletConnectTariSigner implements TariSigner {
  public signerName = "WalletConnect";
  params: WalletConnectParameters;
  wcProvider: UniversalProvider | undefined;
  wcSession: any | null;

  constructor(params: WalletConnectParameters) {
    this.params = params;
    this.wcProvider = undefined;
    this.wcSession = null;
  }

  static init(params: WalletConnectParameters): WalletConnectTariSigner {
    return new WalletConnectTariSigner(params);
  }

  async connect(): Promise<() => Promise<void>> {
    if (this.wcProvider && this.wcSession)
      return async () => {
        // No-op if already connected
      };

    const metadata = {
      name: "Tari Universe",
      description: "Tari Universe Wallet",
      url: "https://www.tari.com",
      icons: ["https://tari.com/assets/img/node-icon-alt.svg"],
    };

    const projectId = this.params.projectId;
    const provider = await UniversalProvider.init({
      projectId,
      // TODO: parameterize the relay URL
      // relayUrl: "wss://relay.walletconnect.com",
      metadata,
    });

    const sessionProperties = {
      required_permissions: JSON.stringify(this.params.requiredPermissions) || "[]",
      optional_permissions: JSON.stringify(this.params.optionalPermissions) || "[]",
    };
    const connectParams = {
      ...walletConnectParams,
      sessionProperties,
    };

    const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, sepolia];

    const { uri, approval } = await provider.client.connect(connectParams);
    return async () => {
      const walletConnectModal = createAppKit({
        projectId: projectId,
        networks: networks,
        universalProvider: provider,
        manualWCControl: true,
      });

      if (uri) {
        await walletConnectModal.open({ uri });
      }

      // wait for the wallet to approve the connection
      console.log("waiting for session approval from the wallet app");
      const session = await approval();
      walletConnectModal.close();

      // at this point session is open
      console.log("session approved by the wallet");
      this.wcProvider = provider;
      this.wcSession = session;
    };
  }

  private async sendRequest(method: string, params: object): Promise<any> {
    if (!this.wcProvider) {
      throw "WalletConnect provider not initialized";
    }

    if (!this.wcSession) {
      throw "WalletConnect session not initialized";
    }

    const requestResult = await this.wcProvider.client.request({
      topic: this.wcSession.topic,
      chainId: "tari:devnet",
      request: {
        method,
        params,
      },
    });

    console.log({ requestResult });

    return requestResult;
  }

  isConnected(): boolean {
    // TODO: check status in the session
    return this.wcSession !== null;
  }

  async accountsList(req: AccountsListRequest): Promise<AccountsListResponse> {
    const res = await this.sendRequest("tari_accountsList", req);
    return res as AccountsListResponse;
  }

  async getAccount(): Promise<AccountData> {
    const { account, public_key } = await this.sendRequest("tari_getDefaultAccount", {});
    const { balances } = await this.sendRequest("tari_getAccountBalances", {
      account: { ComponentAddress: account.address },
      refresh: false,
    });

    return {
      account_id: account.key_index,
      address: account.address,
      public_key,
      // TODO: should be vaults not resources
      vaults: balances.map((b: any) => ({
        type: b.resource_type,
        resource_address: b.resource_address,
        balance: b.balance + b.confidential_balance,
        vault_id:
          typeof b.vault_address === "object" && "Vault" in b.vault_address ? b.vault_address.Vault : b.vault_address,
        token_symbol: b.token_symbol,
      })),
    };
  }

  async getAccountByAddress(address: string): Promise<AccountGetResponse> {
    const res = await this.sendRequest("tari_getAccountByAddress", {
      name_or_address: {
        ComponentAddress: address,
      },
    });
    return res as AccountGetResponse;
  }

  async getSubstate(substate_address: string): Promise<Substate> {
    const method = "tari_getSubstate";
    const params = { substate_id: substate_address };
    const { value, record } = await this.sendRequest(method, params);
    return {
      value,
      address: {
        substate_id: record.substate_id,
        version: record.version,
      },
    };
  }

  public async listSubstates({
    filter_by_template,
    filter_by_type,
    limit,
    offset,
  }: ListSubstatesRequest): Promise<ListSubstatesResponse> {
    const method = "tari_listSubstates";
    const params = {
      filter_by_template,
      filter_by_type,
      limit,
      offset,
    };
    const res = await this.sendRequest(method, params);
    const substates = res.substates.map((s: any) => ({
      substate_id: substateIdToString(s.substate_id),
      module_name: s.module_name,
      version: s.version,
      template_address: s.template_address,
    }));

    return { substates };
  }

  public async createFreeTestCoins(): Promise<AccountData> {
    const method = "tari_createFreeTestCoins";
    const params = {
      account: { Name: "template_web" },
      amount: 1000000,
      max_fee: null,
      key_id: 0,
    };
    const res = await this.sendRequest(method, params);
    return {
      account_id: res.account.key_index,
      address: (res.account.address as { Component: string }).Component,
      public_key: res.public_key,
      vaults: [],
    };
  }

  async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
    const method = req.transaction.dry_run ? "tari_submitTransactionDryRun" : "tari_submitTransaction";
    const params: TransactionSubmitRequest = {
      transaction: {
        V1: req.transaction,
      },
      signing_key_index: req.account_id,
      detect_inputs: true,
      proof_ids: [],
      detect_inputs_use_unversioned: req.detect_inputs_use_unversioned,
    };

    const res = await this.sendRequest(method, params);

    return { transaction_id: res.transaction_id };
  }

  async getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse> {
    const res = await this.sendRequest("tari_getTransactionResult", { transaction_id: transactionId });

    return {
      transaction_id: transactionId,
      status: convertStringToTransactionStatus(res.status),
      result: res.result,
    };
  }

  async getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
    const resp = await this.sendRequest("tari_getTemplate", { template_address });
    return resp.template_definition as TemplateDefinition;
  }

  async getPublicKey(branch: string, index: number): Promise<string> {
    const res = await this.sendRequest("tari_createKey", { branch: branch as KeyBranch, specific_index: index });
    return res.public_key;
  }

  async getConfidentialVaultBalances({
    vault_id,
    view_key_id,
    maximum_expected_value = null,
    minimum_expected_value = null,
  }: ConfidentialViewVaultBalanceRequest): Promise<VaultBalances> {
    const method = "tari_viewConfidentialVaultBalance";
    const params = {
      view_key_id,
      vault_id,
      minimum_expected_value,
      maximum_expected_value,
    };

    const res = await this.sendRequest(method, params);
    return { balances: res.balances as unknown as Map<string, number | null> };
  }

  public async getNftsList(req: ListAccountNftRequest): Promise<ListAccountNftResponse> {
    const method = "tari_getNftsList";
    const params = {
      account: req.account,
      limit: req.limit,
      offset: req.offset,
    };
    const res = await this.sendRequest(method, params);
    return res as ListAccountNftResponse;
  }

  public async getWalletInfo(): Promise<WalletGetInfoResponse> {
    const res = await this.sendRequest("tari_getWalletInfo", {});
    return res as WalletGetInfoResponse;
  }
}
