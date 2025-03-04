import {
  AuthGetAllJwtRequest,
  AuthGetAllJwtResponse,
  AuthRevokeTokenRequest,
  AuthRevokeTokenResponse,
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

  constructor(transport: RpcTransport) {
    this.token = null;
    this.transport = transport;
    this.id = 0;
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

  public setToken(token: string) {
    this.token = token;
  }

  public authGetAllJwt(params: AuthGetAllJwtRequest): Promise<AuthGetAllJwtResponse> {
    return this.__invokeRpc("auth.get_all_jwt", params);
  }

  public async authRequest(permissions: string[]): Promise<string> {
    let resp = await this.__invokeRpc("auth.request", { permissions });
    return resp.auth_token;
  }

  public async authAccept(adminToken: string, name: string): Promise<string | null> {
    let resp = await this.__invokeRpc("auth.accept", { auth_token: adminToken, name });
    this.token = resp.permissions_token;
    return this.token;
  }

  public authRevoke(params: AuthRevokeTokenRequest): Promise<AuthRevokeTokenResponse> {
    return this.__invokeRpc("auth.revoke", params);
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
