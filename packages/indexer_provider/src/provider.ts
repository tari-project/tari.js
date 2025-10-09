import { TariProvider } from "@tari-project/tari-provider";
import { TariPermissions } from "@tari-project/tari-permissions";
import { IndexerProviderClient } from "./transports";
import {
  GetTemplateDefinitionResponse,
  ListTemplatesResponse,
  substateIdToString,
} from "@tari-project/typescript-bindings";
import {
  GetSubstateRequest,
  GetTransactionResultResponse,
  ListSubstatesRequest,
  ListSubstatesResponse,
  Substate, TransactionStatus,
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
    await client.identityGet();
    params.onConnection?.();
    return new IndexerProvider(params, client);
  }

  public isConnected(): boolean {
    return true;
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
      limit: limit ? BigInt(limit) : null,
      offset: offset ? BigInt(offset) : null,
    });

    const substates = resp.substates.map((s) => ({
      substate_id: s.substate_id,
      module_name: s.module_name,
      version: s.version,
      template_address: s.template_address,
    }));

    return { substates };
  }

  public async getSubstate({ substate_address, version }: GetSubstateRequest): Promise<Substate> {
    const resp = await this.client.substatesGet(
       substate_address,
      {
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
    const resp = await this.client.templatesList(limit);
    return resp;
  }

  public async getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse> {
    const resp = await this.client.getTransactionResult(transactionId);

    // TODO: make not suck
    if (resp.result == "Pending") {
      return {
        transaction_id: transactionId,
        status: TransactionStatus.Pending,
        result: null
      };
    }
    if (!('Finalized' in resp.result)) {
      throw new Error("Transaction result was not pending nor finalized");
    }

    let finalized = resp.result.Finalized;
    let result = finalized.execution_result?.finalize.result;
    if (!result) {
      if (finalized.abort_details) {
        console.error("Transaction aborted:", finalized.abort_details);
        return {
          transaction_id: transactionId,
          status: TransactionStatus.Rejected,
          result: null
        };
      }
      throw new Error("Transaction finalized without result or abort details");
    }

    if ('Accept' in result) {
      return {
        transaction_id: transactionId,
        status: TransactionStatus.Accepted,
        result: {
            transaction_hash: transactionId,
            events: finalized?.execution_result?.finalize.events || [],
            logs: finalized?.execution_result?.finalize.logs || [],
            execution_results: finalized?.execution_result?.finalize.execution_results || [],
            result,
            fee_receipt: finalized?.execution_result?.finalize.fee_receipt!
          }

      };
    }
    if ('Reject' in result) {
      return {
        transaction_id: transactionId,
        status: TransactionStatus.Rejected,
        result: {
            transaction_hash: transactionId,
            events: finalized.execution_result?.finalize.events || [],
            logs: finalized.execution_result?.finalize.logs || [],
            execution_results: finalized?.execution_result?.finalize.execution_results || [],
            result,
            fee_receipt: finalized.execution_result?.finalize.fee_receipt!
          }
      };
    }

    if ('AcceptFeeRejectRest' in result) {
      return {
        transaction_id: transactionId,
        status: TransactionStatus.OnlyFeeAccepted,
        result: {
            transaction_hash: transactionId,
            events: finalized?.execution_result?.finalize.events || [],
            logs: finalized?.execution_result?.finalize.logs || [],
            execution_results: finalized?.execution_result?.finalize.execution_results || [],
            result,
            fee_receipt: finalized?.execution_result?.finalize.fee_receipt!
          }
      };
    }

    console.error("Unknown transaction result type:", result);
    throw new Error("Unknown transaction result type");
  }

  public async getTemplateDefinition(template_address: string): Promise<GetTemplateDefinitionResponse> {
    const resp = await this.client.templatesGet(template_address);
    return {name: resp.template_definition.V1.template_name, definition: resp.template_definition};
  }
}
