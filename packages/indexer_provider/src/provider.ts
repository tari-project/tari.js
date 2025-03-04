import {
  ListSubstatesResponse,
  Substate,
  TariProvider,
  TemplateDefinition,
  TransactionResult,
} from "@tari-project/tari-provider";
import { TariPermissions } from "@tari-project/tari-permissions";
import { TariConnection } from "./transports/webrtc";
import { WebRtcRpcTransport } from "./transports/webrtc_transport";
import { convertStringToTransactionStatus } from "./utils";
import { IndexerProviderClient } from "./transports";
import {
  GetTemplateDefinitionResponse,
  IndexerGetSubstateRequest,
  IndexerGetSubstateResponse,
  IndexerSubmitTransactionRequest,
  IndexerSubmitTransactionResponse,
  ListTemplatesResponse,
  stringToSubstateId,
  SubstateId,
  substateIdToString,
  SubstatesListRequest,
  SubstateType,
} from "@tari-project/typescript-bindings";
import { SubmitTransactionResponse } from "../../tarijs_types/src";

export interface IndexerProviderBaseParameters {
  permissions: TariPermissions;
  optionalPermissions?: TariPermissions;
  onConnection?: () => void;
}

export interface IndexerProviderParameters extends IndexerProviderBaseParameters {
  signalingServerUrl?: string;
  webRtcConfig?: RTCConfiguration;
  name?: string;
}

export interface IndexerProviderFetchParameters extends IndexerProviderBaseParameters {
  serverUrl: string;
}

export class IndexerProvider implements TariProvider {
  public providerName = "IndexerProvider";
  params: IndexerProviderParameters;
  client: IndexerProviderClient;

  private constructor(params: IndexerProviderParameters, connection: IndexerProviderClient) {
    this.params = params;
    this.client = connection;
  }
  private static buildPermissions(params: IndexerProviderParameters): TariPermissions {
    const allPermissions = new TariPermissions();
    allPermissions.addPermissions(params.permissions);
    if (params.optionalPermissions) {
      allPermissions.addPermissions(params.optionalPermissions);
    }
    return allPermissions;
  }

  static async build(params: IndexerProviderParameters): Promise<IndexerProvider> {
    const allPermissions = this.buildPermissions(params);
    let connection = new TariConnection(params.signalingServerUrl, params.webRtcConfig);
    const client = IndexerProviderClient.new(WebRtcRpcTransport.new(connection));
    await connection.init(allPermissions, (conn) => {
      params.onConnection?.();
      if (conn.token) {
        client.setToken(conn.token);
      }
    });
    return new IndexerProvider(params, client);
  }

  static async buildFetchSigner(params: IndexerProviderFetchParameters) {
    const client = IndexerProviderClient.usingFetchTransport(params.serverUrl);

    // const allPermissions = this.buildPermissions(params);
    // const plainPermissions = allPermissions.toJSON().flatMap((p) => (typeof p === "string" ? [p] : []));
    // const authResponse = await client.authRequest(plainPermissions);
    // await client.authAccept(authResponse, "WalletDaemon");

    params.onConnection?.();
    return new IndexerProvider(params, client);
  }

  public isConnected(): boolean {
    return this.getWebRtcTransport()?.isConnected() || true;
  }

  public async listSubstates(
    filter_by_template: string | null,
    filter_by_type: SubstateType | null,
    limit: number | null,
    offset: number | null,
  ): Promise<ListSubstatesResponse> {
    const resp = await this.client.listSubstates({
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

  public async submitTransaction({
    transaction,
    required_substates,
    is_dry_run,
  }: IndexerSubmitTransactionRequest): Promise<IndexerSubmitTransactionResponse> {
    const resp = await this.client.submitTransaction({ transaction, required_substates, is_dry_run });
    return resp;
  }

  public async getSubstate({
    address,
    local_search_only,
    version,
  }: IndexerGetSubstateRequest): Promise<IndexerGetSubstateResponse> {
    const resp = await this.client.getSubstate({ address, version, local_search_only });
    return resp;
  }

  public async listTemplates(limit: number = 0): Promise<ListTemplatesResponse> {
    const resp = await this.client.listTemplates({ limit });
    return resp;
  }

  public async getTransactionResult(transactionId: string): Promise<TransactionResult> {
    const resp = await this.client.getTransactionResult({ transaction_id: transactionId });

    return {
      transaction_id: transactionId,
      status: convertStringToTransactionStatus(resp.status),
      result: resp.result,
    };
  }

  public async getTemplateDefinition(template_address: string): Promise<GetTemplateDefinitionResponse> {
    let resp = await this.client.getTemplateDefinition({ template_address });
    return resp;
  }

  private getWebRtcTransport(): WebRtcRpcTransport | undefined {
    const transport = this.client.getTransport();
    return transport instanceof WebRtcRpcTransport ? transport : undefined;
  }
}
