import {
  GetEpochManagerStatsResponse,
  GetNonFungibleCollectionsResponse,
  GetNonFungibleCountRequest,
  GetNonFungibleCountResponse,
  GetNonFungiblesRequest,
  GetNonFungiblesResponse,
  GetRelatedTransactionsRequest,
  GetRelatedTransactionsResponse,
  GetTemplateDefinitionRequest,
  GetTemplateDefinitionResponse,
  IndexerGetIdentityResponse,
  IndexerGetSubstateRequest,
  IndexerGetSubstateResponse,
  IndexerSubmitTransactionRequest,
  IndexerSubmitTransactionResponse,
  InspectSubstateRequest,
  InspectSubstateResponse,
  ListTemplatesRequest,
  ListTemplatesResponse,
  SubstatesListRequest,
  SubstatesListResponse,
  TransactionGetResultRequest,
  TransactionGetResultResponse,
  TransactionWaitResultRequest,
  TransactionWaitResultResponse,
} from "@tari-project/typescript-bindings";
import { FetchRpcTransport, RpcTransport } from "./rpc";

export class IndexerProviderClient {
  private token: string | null;
  private transport: RpcTransport;
  private id: number;
  private connected: boolean;

  constructor(transport: RpcTransport) {
    this.token = null;
    this.transport = transport;
    this.id = 0;
    this.connected = false;
  }

  public static new(transport: RpcTransport): IndexerProviderClient {
    return new IndexerProviderClient(transport);
  }

  public static usingFetchTransport(url: string): IndexerProviderClient {
    return IndexerProviderClient.new(FetchRpcTransport.new(url));
  }

  getTransport() {
    return this.transport;
  }

  public isAuthenticated() {
    return this.token !== null;
  }

  public isConnected() {
    return this.connected;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public submitTransaction(params: IndexerSubmitTransactionRequest): Promise<IndexerSubmitTransactionResponse> {
    return this.__invokeRpc("submit_transaction", params);
  }

  public inspectSubstate(params: InspectSubstateRequest): Promise<InspectSubstateResponse> {
    return this.__invokeRpc("inspect_substate", params);
  }

  public getSubstate(params: IndexerGetSubstateRequest): Promise<IndexerGetSubstateResponse> {
    return this.__invokeRpc("get_substate", params);
  }

  public listSubstates(params: SubstatesListRequest): Promise<SubstatesListResponse> {
    return this.__invokeRpc("list_substates", params);
  }

  public listTemplates(params: ListTemplatesRequest): Promise<ListTemplatesResponse> {
    return this.__invokeRpc("list_templates", params);
  }

  public getTemplateDefinition(params: GetTemplateDefinitionRequest): Promise<GetTemplateDefinitionResponse> {
    return this.__invokeRpc("get_template_definition", params);
  }

  public getTransactionResult(params: TransactionGetResultRequest): Promise<TransactionGetResultResponse> {
    return this.__invokeRpc("get_transaction_result", params);
  }

  public getSubstateTransactions(params: GetRelatedTransactionsRequest): Promise<GetRelatedTransactionsResponse> {
    return this.__invokeRpc("get_substate_transactions", params);
  }

  public getNonFungibles(params: GetNonFungiblesRequest): Promise<GetNonFungiblesResponse> {
    return this.__invokeRpc("get_non_fungibles", params);
  }

  public getNonFungibleCollections(): Promise<GetNonFungibleCollectionsResponse> {
    return this.__invokeRpc("get_non_fungible_collections");
  }

  public getNonFungibleCount(params: GetNonFungibleCountRequest): Promise<GetNonFungibleCountResponse> {
    return this.__invokeRpc("get_non_fungible_count", params);
  }

  public getEpochManagerStats(): Promise<GetEpochManagerStatsResponse> {
    return this.__invokeRpc("get_epoch_manager_stats");
  }

  public waitForTransactionResult(params: TransactionWaitResultRequest): Promise<TransactionWaitResultResponse> {
    return this.__invokeRpc("transactions.wait_result", params);
  }

  public async getIdentity(): Promise<IndexerGetIdentityResponse | undefined> {
    try {
      const res: IndexerGetIdentityResponse = await this.__invokeRpc("get_identity");
      this.connected = !!res.public_key;
      return res;
    } catch (e) {
      console.error("Failed to get Indexer identity:", e);
      this.connected = false;
    }
  }

  async __invokeRpc(method: string, params: object | null = null) {
    const id = this.id++;
    const response = await this.transport.sendRequest<any>(
      {
        method,
        jsonrpc: "2.0",
        id: id,
        params: params || {},
      },
      { token: this.token ?? undefined, timeout_millis: undefined },
    );

    return response;
  }
}
