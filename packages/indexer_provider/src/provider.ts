import { TariProvider } from "@tari-project/tari-provider";
import { TariPermissions } from "@tari-project/tari-permissions";
import { IndexerProviderClient } from "./transports";
import {
  GetTemplateDefinitionResponse,
  ListTemplatesResponse,
  stringToSubstateId,
  substateIdToString,
  SubstatesListRequest,
} from "@tari-project/typescript-bindings";
import {
  convertStringToTransactionStatus,
  GetSubstateRequest,
  GetTransactionResultResponse,
  ListSubstatesRequest,
  ListSubstatesResponse,
  Substate,
} from "@tari-project/tarijs-types";

export interface IndexerProviderParameters {
  indexerJrpcUrl: string;
  permissions: TariPermissions;
  optionalPermissions?: TariPermissions;
  onConnection?: () => void;
}

export class IndexerProvider implements TariProvider {
  public providerName = "IndexerProvider";
  client: IndexerProviderClient;
  params: IndexerProviderParameters;

  private constructor(params: IndexerProviderParameters, connection: IndexerProviderClient) {
    this.params = params;
    this.client = connection;
  }

  static async build(params: IndexerProviderParameters) {
    const client = IndexerProviderClient.usingFetchTransport(params.indexerJrpcUrl);
    await client.getIdentity();
    params.onConnection?.();
    return new IndexerProvider(params, client);
  }

  public isConnected(): boolean {
    return this.client.isConnected();
  }

  public async listSubstates({
                               filter_by_template,
                               filter_by_type,
                               limit,
                               offset,
                             }: ListSubstatesRequest): Promise<ListSubstatesResponse> {
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

  public async getSubstate({ substate_address, version }: GetSubstateRequest): Promise<Substate> {
    const resp = await this.client.getSubstate({
      address: substate_address,
      version: version ?? null,
      local_search_only: false,
    });
    return {
      address: {
        substate_id: substateIdToString(resp.address),
        version: resp.version,
      },
      value: resp.substate,
    };
  }

  public async listTemplates(limit: number = 0): Promise<ListTemplatesResponse> {
    const resp = await this.client.listTemplates({ limit });
    return resp;
  }

  public async getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse> {
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
}
