import {
  TariSigner,
  SubmitTransactionRequest,
  TransactionResult,
  SubmitTransactionResponse,
  VaultBalances,
  TemplateDefinition,
  Substate,
  Account,
  ListSubstatesResponse,
} from "@tari-project/tari-signer";
import UniversalProvider from "@walletconnect/universal-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import {
  Instruction,
  KeyBranch,
  ListAccountNftRequest,
  ListAccountNftResponse,
  stringToSubstateId,
  substateIdToString,
  SubstateType,
  TransactionSubmitRequest,
} from "@tari-project/wallet_jrpc_client";
import { convertStringToTransactionStatus } from "@tari-project/tarijs-types";

const walletConnectParams = {
  requiredNamespaces: {
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
      ],
      chains: ["tari:devnet"],
      events: ['chainChanged", "accountsChanged'],
    },
  },
};

export class WalletConnectTariSigner implements TariSigner {
  public signerName = "WalletConnect";
  projectId: string;
  wcProvider: UniversalProvider | null;
  wcSession: any | null;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.wcProvider = null;
    this.wcSession = null;
  }

  async connect(): Promise<void> {
    if (this.wcProvider && this.wcSession) return;

    // initialize WalletConnect
    const projectId = this.projectId;
    this.wcProvider = await UniversalProvider.init({
      projectId,
      // TODO: parameterize the relay URL
      relayUrl: "wss://relay.walletconnect.com",
    });

    // open UI modal with the connection URI
    const { uri, approval } = await this.wcProvider.client.connect(walletConnectParams);
    const walletConnectModal = new WalletConnectModal({
      projectId,
    });
    if (uri) {
      walletConnectModal.openModal({ uri });
    }

    // wait for the wallet to approve the connection
    console.log("waiting for session approval from the wallet app");
    const session = await approval();
    walletConnectModal.closeModal();

    // at this point session is open
    console.log("session approved by the wallet");
    this.wcSession = session;
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

  async getAccount(): Promise<Account> {
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
      resources: balances.map((b: any) => ({
        type: b.resource_type,
        resource_address: b.resource_address,
        balance: b.balance + b.confidential_balance,
        vault_id:
          typeof b.vault_address === "object" && "Vault" in b.vault_address ? b.vault_address.Vault : b.vault_address,
        token_symbol: b.token_symbol,
      })),
    };
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

  public async listSubstates(
    filter_by_template: string | null,
    filter_by_type: SubstateType | null,
    limit: number | null,
    offset: number | null,
  ): Promise<ListSubstatesResponse> {
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

  public async createFreeTestCoins(): Promise<Account> {
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
      resources: [],
    };
  }

  async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
    const method = "tari_submitTransaction";
    const params: TransactionSubmitRequest = {
      transaction: {
        V1: {
          network: req.network,
          fee_instructions: req.fee_instructions as Instruction[],
          instructions: req.instructions as Instruction[],
          inputs: req.required_substates.map((s) => ({
            // TODO: Hmm The bindings want a SubstateId object, but the wallet only wants a string. Any is used to skip type checking here
            substate_id: s.substate_id as any,
            version: s.version ?? null,
          })),
          min_epoch: null,
          max_epoch: null,
          is_seal_signer_authorized: req.is_seal_signer_authorized,
        },
      },
      signing_key_index: req.account_id,
      autofill_inputs: [],
      detect_inputs: true,
      proof_ids: [],
      detect_inputs_use_unversioned: req.detect_inputs_use_unversioned,
    };

    const res = await this.sendRequest(method, params);

    return { transaction_id: res.transaction_id };
  }

  async getTransactionResult(transactionId: string): Promise<TransactionResult> {
    const res = await this.sendRequest("tari_getTransactionResult", { transaction_id: transactionId });

    return {
      transaction_id: transactionId,
      status: convertStringToTransactionStatus(res.status),
      result: res.result,
    };
  }

  async getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
    let resp = await this.sendRequest("tari_getTemplate", { template_address });
    return resp.template_definition as TemplateDefinition;
  }

  async getPublicKey(branch: string, index: number): Promise<string> {
    const res = await this.sendRequest("tari_createKey", { branch: branch as KeyBranch, specific_index: index });
    return res.public_key;
  }

  async getConfidentialVaultBalances(
    viewKeyId: number,
    vaultId: string,
    min: number | null,
    max: number | null,
  ): Promise<VaultBalances> {
    const method = "tari_viewConfidentialVaultBalance";
    const params = {
      view_key_id: viewKeyId,
      vault_id: vaultId,
      minimum_expected_value: min,
      maximum_expected_value: max,
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
}
