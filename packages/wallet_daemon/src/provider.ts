import { TariProvider } from "@tari-project/tari-provider";
import {
  GetSubstateRequest,
  GetTransactionResultResponse,
  ListSubstatesRequest,
  ListSubstatesResponse,
  Substate,
  SubstateMetadata,
  transactionStatusFromStr,
} from "@tari-project/tarijs-types";
import {
  GetTemplateDefinitionResponse,
  ListTemplatesResponse,
  substateIdToString,
} from "@tari-project/typescript-bindings";
import { WalletDaemonClient } from "@tari-project/wallet_jrpc_client";
import { TariConnection } from "./webrtc";
import { WebRtcRpcTransport } from "./webrtc_transport";
import { WalletDaemonBaseParameters, WalletDaemonFetchParameters, WalletDaemonParameters } from "./signer";
import { TariPermissions } from "@tari-project/tari-permissions";

export class WalletDaemonTariProvider implements TariProvider {
  providerName: string = "WalletDaemonTariProvider";
  params: WalletDaemonParameters;
  client: WalletDaemonClient;

  private constructor(params: WalletDaemonParameters, connection: WalletDaemonClient) {
    this.params = params;
    this.client = connection;
  }

  static async buildWebRtc(params: WalletDaemonParameters): Promise<WalletDaemonTariProvider> {
    const allPermissions = WalletDaemonTariProvider.buildPermissions(params);
    const connection = new TariConnection(params.signalingServerUrl, params.webRtcConfig);
    const client = WalletDaemonClient.new(WebRtcRpcTransport.new(connection));
    await connection.init(allPermissions, (conn) => {
      params.onConnection?.();
      if (conn.token) {
        client.setToken(conn.token);
      }
    });
    return new WalletDaemonTariProvider(params, client);
  }

  static async buildFetch(params: WalletDaemonFetchParameters) {
    const allPermissions = WalletDaemonTariProvider.buildPermissions(params);
    const client = WalletDaemonClient.usingFetchTransport(params.serverUrl);

    const plainPermissions = allPermissions.toJSON().flatMap((p) => (typeof p === "string" ? [p] : []));
    const authResponse = await client.authRequest(plainPermissions);
    await client.authAccept(authResponse, "WalletDaemon");

    params.onConnection?.();
    return new WalletDaemonTariProvider(params, client);
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

  isConnected(): boolean {
    return this.getWebRtcTransport()?.isConnected() || true;
  }

  async getSubstate(req: GetSubstateRequest): Promise<Substate> {
    // TODO: Substate address cannot be converted to SubstateId directly - Perhaps we need to change the provider interface
    const { substate } = await this.client.substatesGet({ substate_id: req.substate_address });
    if (!substate) {
      throw new Error(`Substate not found for address: ${req.substate_address}`);
    }

    return {
      value: substate?.substate,
      address: {
        substate_id: req.substate_address,
        version: substate?.version || 0,
      },
    };
  }

  async getTemplateDefinition(template_address: string): Promise<GetTemplateDefinitionResponse> {
    const { template_definition: definition } = await this.client.templatesGet({ template_address });

    return {
      // TODO: return module name from the wallet?
      name: "<Unknown>",
      definition,
    };
  }

  async getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse> {
    const resp = await this.client.getTransactionResult({ transaction_id: transactionId });

    return {
      transaction_id: resp.transaction_id,
      status: transactionStatusFromStr(resp.status),
      result: resp.result || null,
    };
  }

  async listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse> {
    const resp = await this.client.substatesList(req);

    return {
      substates: resp.substates.map(
        (s) =>
          ({
            substate_id: substateIdToString(s.substate_id),
            module_name: s.module_name,
            version: s.version,
            template_address: s.template_address,
          } as SubstateMetadata),
      ),
    };
  }

  listTemplates(_limit?: number): Promise<ListTemplatesResponse> {
    // const resp = await this.client.templatesListAuthored({});
    throw new Error("Listing all templates is not supported by WalletDaemonTariProvider.");
  }
}
