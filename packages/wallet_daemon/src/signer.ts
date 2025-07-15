import { TariPermissions } from "@tari-project/tari-permissions";
import { TariConnection } from "./webrtc";
import { TariSigner } from "@tari-project/tari-signer";
import { WalletDaemonClient } from "@tari-project/wallet_jrpc_client";
import { WebRtcRpcTransport } from "./webrtc_transport";
import {
  AccountData,
  convertStringToTransactionStatus,
  GetTransactionResultResponse,
  SubmitTransactionRequest,
  SubmitTransactionResponse,
  VaultBalances,
  TemplateDefinition,
  Substate,
  ListSubstatesResponse,
  ListSubstatesRequest,
} from "@tari-project/tarijs-types";
import {
  ConfidentialViewVaultBalanceRequest,
  KeyBranch,
  ListAccountNftRequest,
  ListAccountNftResponse,
  substateIdToString,
  SubstatesListRequest,
} from "@tari-project/typescript-bindings";

export const WalletDaemonNotConnected = "WALLET_DAEMON_NOT_CONNECTED";
export const Unsupported = "UNSUPPORTED";

export interface WalletDaemonBaseParameters {
  permissions: TariPermissions;
  optionalPermissions?: TariPermissions;
  onConnection?: () => void;
}

export interface WalletDaemonParameters extends WalletDaemonBaseParameters {
  signalingServerUrl?: string;
  webRtcConfig?: RTCConfiguration;
  name?: string;
}

export interface WalletDaemonFetchParameters extends WalletDaemonBaseParameters {
  serverUrl: string;
}

export class WalletDaemonTariSigner implements TariSigner {
  public signerName = "WalletDaemon";
  params: WalletDaemonParameters;
  client: WalletDaemonClient;

  private constructor(params: WalletDaemonParameters, connection: WalletDaemonClient) {
    this.params = params;
    this.client = connection;
  }

  static async build(params: WalletDaemonParameters): Promise<WalletDaemonTariSigner> {
    const allPermissions = WalletDaemonTariSigner.buildPermissions(params);
    const connection = new TariConnection(params.signalingServerUrl, params.webRtcConfig);
    const client = WalletDaemonClient.new(WebRtcRpcTransport.new(connection));
    await connection.init(allPermissions, (conn) => {
      params.onConnection?.();
      if (conn.token) {
        client.setToken(conn.token);
      }
    });
    return new WalletDaemonTariSigner(params, client);
  }

  static async buildFetchSigner(params: WalletDaemonFetchParameters) {
    const allPermissions = WalletDaemonTariSigner.buildPermissions(params);
    const client = WalletDaemonClient.usingFetchTransport(params.serverUrl);

    const plainPermissions = allPermissions.toJSON().flatMap((p) => (typeof p === "string" ? [p] : []));
    const authResponse = await client.authRequest(plainPermissions);
    await client.authAccept(authResponse, "WalletDaemon");

    params.onConnection?.();
    return new WalletDaemonTariSigner(params, client);
  }

  private static buildPermissions(params: WalletDaemonBaseParameters): TariPermissions {
    const allPermissions = new TariPermissions();
    allPermissions.addPermissions(params.permissions);
    if (params.optionalPermissions) {
      allPermissions.addPermissions(params.optionalPermissions);
    }
    return allPermissions;
  }

  private getWebRtcTransport(): WebRtcRpcTransport | undefined {
    const transport = this.client.getTransport();
    return transport instanceof WebRtcRpcTransport ? transport : undefined;
  }

  public get token(): string | undefined {
    return this.getWebRtcTransport()?.token();
  }

  public get tokenUrl(): string | undefined {
    if (!this.token) {
      return undefined;
    }

    const name = (this.params.name && encodeURIComponent(this.params.name)) || "";
    const token = this.token;
    const permissions = JSON.stringify(this.params.permissions);
    const optionalPermissions = JSON.stringify(this.params.optionalPermissions);

    return `tari://${name}/${token}/${permissions}/${optionalPermissions}`;
  }

  public isConnected(): boolean {
    return this.getWebRtcTransport()?.isConnected() || true;
  }

  public async createFreeTestCoins(): Promise<AccountData> {
    const res = await this.client.createFreeTestCoins({
      account: { Name: "template_web" },
      amount: 1000000,
      max_fee: null,
      key_id: 0,
    });
    return {
      account_id: res.account.key_index,
      address: (res.account.address as { Component: string }).Component,
      public_key: res.public_key,
      resources: [],
    };
  }

  public async getAccount(): Promise<AccountData> {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const { account, public_key } = (await this.client.accountsGetDefault({})) as any;
    const address = typeof account.address === "object" ? account.address.Component : account.address;
    const { balances } = await this.client.accountsGetBalances({
      account: { ComponentAddress: address },
      refresh: false,
    });

    return {
      account_id: account.key_index,
      address,
      public_key,
      // TODO: should be vaults not resources
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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

  public async getAccountBalances(componentAddress: string): Promise<unknown> {
    return await this.client.accountsGetBalances({ account: { ComponentAddress: componentAddress }, refresh: true });
  }

  public async getSubstate(substateId: string): Promise<Substate> {
    const { substate } = await this.client.substatesGet({ substate_id: substateId });
    if (!substate) {
      throw new Error(`Substate not found for address: ${substateId}`);
    }

    return {
      value: substate?.substate,
      address: {
        substate_id: substateId,
        version: substate?.version || 0,
      },
    };
  }

  public async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
    const params = {
      transaction: {
        V1: req.transaction,
      },
      signing_key_index: req.account_id,
      detect_inputs: true,
      proof_ids: [],
      detect_inputs_use_unversioned: req.detect_inputs_use_unversioned,
    };

    const res = req.transaction.dry_run
      ? await this.client.submitTransactionDryRun(params)
      : await this.client.submitTransaction(params);
    return { transaction_id: res.transaction_id };
  }

  public async getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse> {
    const res = await this.client.getTransactionResult({ transaction_id: transactionId });

    return {
      transaction_id: transactionId,
      status: convertStringToTransactionStatus(res.status),
      result: res.result,
    };
  }

  public async getPublicKey(branch: string, index: number): Promise<string> {
    const res = await this.client.createKey({ branch: branch as KeyBranch, specific_index: index });
    return res.public_key;
  }

  public async getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
    const resp = await this.client.templatesGet({ template_address });
    return resp.template_definition as TemplateDefinition;
  }

  public async getConfidentialVaultBalances({
    vault_id,
    view_key_id,
    maximum_expected_value = null,
    minimum_expected_value = null,
  }: ConfidentialViewVaultBalanceRequest): Promise<VaultBalances> {
    const res = await this.client.viewVaultBalance({
      view_key_id,
      vault_id,
      minimum_expected_value,
      maximum_expected_value,
    });
    return { balances: res.balances as unknown as Map<string, number | null> };
  }

  public async listSubstates({
    filter_by_template,
    filter_by_type,
    limit,
    offset,
  }: ListSubstatesRequest): Promise<ListSubstatesResponse> {
    const resp = await this.client.substatesList({
      filter_by_template,
      filter_by_type,
      limit,
      offset,
    } as SubstatesListRequest);

    const substates = resp.substates.map((s) => ({
      substate_id: typeof s.substate_id === "string" ? s.substate_id : substateIdToString(s.substate_id),
      module_name: s.module_name,
      version: s.version,
      template_address: s.template_address,
    }));

    return { substates };
  }

  public async getNftsList(req: ListAccountNftRequest): Promise<ListAccountNftResponse> {
    return await this.client.nftsList(req);
  }
}
