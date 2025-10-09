/*
 * //  Copyright 2024 The Tari Project
 * //  SPDX-License-Identifier: BSD-3-Clause
 */

import type {
  GetEpochManagerStatsResponse,
  GetNetworkSyncStateResponse, GetNonFungiblesRequest, GetNonFungiblesResponse,
  GetSubstatesRequest,
  GetSubstatesResponse,
  IndexerAddPeerRequest,
  IndexerAddPeerResponse,
  IndexerGetConnectionsResponse,
  IndexerGetIdentityResponse,
  IndexerGetSubstateRequest,
  IndexerGetSubstateResponse,
  IndexerGetTransactionResultResponse,
  IndexerReadyResponse, ListRecentTransactionsRequest, ListRecentTransactionsResponse,
  ListSubstatesRequest,
  ListSubstatesResponse, ListTemplatesResponse,
  SubstateId,
  TemplatesGetResponse,
  TemplatesListAuthoredRequest,
  TemplatesListAuthoredResponse,
  TransactionId,
  TransactionSubmitRequest,
  TransactionSubmitResponse,
} from "@tari-project/typescript-bindings";
import { FetchTransport, HttpTransport } from "./fetch";

export class IndexerProviderClient {
  private transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  public static new(transport: HttpTransport): IndexerProviderClient {
    return new IndexerProviderClient(transport);
  }

  public static usingFetchTransport(url: string): IndexerProviderClient {
    return IndexerProviderClient.new(FetchTransport.new(url));
  }

  getTransport() {
    return this.transport;
  }

  public identityGet(): Promise<IndexerGetIdentityResponse> {
    return this.transport.sendGet(`identity`, {});
  }

  public waitUntilReady(): Promise<IndexerReadyResponse> {
    return this.transport.sendGet(`wait-until-ready`, {});
  }

  public epochManagerStats(): Promise<GetEpochManagerStatsResponse> {
    return this.transport.sendGet(`epoch-manager/stats`, {});
  }

  public networkStats(): Promise<GetNetworkSyncStateResponse> {
    return this.transport.sendGet(`network/stats`, {});
  }

  public addConnection(req: IndexerAddPeerRequest): Promise<IndexerAddPeerResponse> {
    return this.transport.sendPost(`network/connections`, req);
  }

  public getConnections(): Promise<IndexerGetConnectionsResponse> {
    return this.transport.sendGet(`network/connections`, {});
  }

  public getNonFungibles(params: GetNonFungiblesRequest): Promise<GetNonFungiblesResponse> {
    return this.transport.sendGet(`non-fungibles`, params);
  }

  public substatesGet(id: SubstateId, params: IndexerGetSubstateRequest): Promise<IndexerGetSubstateResponse> {
    return this.transport.sendGet(`substates/${encodeURIComponent(id)}`, params);
  }

  public listSubstates(params: ListSubstatesRequest): Promise<ListSubstatesResponse> {
    return this.transport.sendGet(`substates`, params);
  }

  public fetchSubstates(params: GetSubstatesRequest): Promise<GetSubstatesResponse> {
    return this.transport.sendPost(`substates/fetch`, params);
  }

  public submitTransaction(params: TransactionSubmitRequest): Promise<TransactionSubmitResponse> {
    return this.transport.sendPost(`transactions`, params);
  }

  public getTransactionResult(transaction_id: TransactionId): Promise<IndexerGetTransactionResultResponse> {
    return this.transport.sendGet(`transactions/${encodeURIComponent(transaction_id)}/result`, {});
  }

  public listRecentTransactions(params: ListRecentTransactionsRequest): Promise<ListRecentTransactionsResponse> {
    return this.transport.sendGet(`transactions/recent`, params);
  }

  public templatesList(limit: number = 0): Promise<ListTemplatesResponse> {
    return this.transport.sendGet(`templates`, { limit });
  }
  public templatesGet(template_address: string): Promise<TemplatesGetResponse> {
    return this.transport.sendGet(`templates/${encodeURIComponent(template_address)}`, {});
  }

  public templatesListAuthored(params: TemplatesListAuthoredRequest): Promise<TemplatesListAuthoredResponse> {
    return this.transport.sendPost(`templates`, params);
  }
}
