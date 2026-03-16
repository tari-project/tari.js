//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type {
  IndexerGetIdentityResponse,
  IndexerReadyResponse,
  IndexerGetSubstateRequest,
  IndexerGetSubstateResponse,
  IndexerGetTransactionResultResponse,
  IndexerSubmitTransactionRequest,
  IndexerSubmitTransactionResponse,
  GetSubstatesRequest,
  GetSubstatesResponse,
  GetTemplateDefinitionResponse,
  ListTemplatesResponse,
  SubstateId,
} from "@tari-project/ootle-ts-bindings";
import type { ListSubstateItem } from "@tari-project/ootle-ts-bindings";
import { FetchTransport, type HttpTransport } from "./http-transport";

export interface ListSubstatesParams {
  filter_by_template?: string | null;
  filter_by_type?: string | null;
  limit?: number | null;
  offset?: number | null;
}

export interface ListSubstatesResult {
  substates: ListSubstateItem[];
}

export class IndexerClient {
  private transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  public static new(transport: HttpTransport): IndexerClient {
    return new IndexerClient(transport);
  }

  public static usingFetchTransport(url: string): IndexerClient {
    return IndexerClient.new(FetchTransport.new(url));
  }

  getTransport(): HttpTransport {
    return this.transport;
  }

  public identityGet(): Promise<IndexerGetIdentityResponse> {
    return this.transport.sendGet(`identity`, {});
  }

  public waitUntilReady(): Promise<IndexerReadyResponse> {
    return this.transport.sendGet(`wait-until-ready`, {});
  }

  public substatesGet(id: SubstateId, params: IndexerGetSubstateRequest): Promise<IndexerGetSubstateResponse> {
    return this.transport.sendGet(`substates/${encodeURIComponent(id)}`, params as Record<string, unknown>);
  }

  public fetchSubstates(params: GetSubstatesRequest): Promise<GetSubstatesResponse> {
    return this.transport.sendPost(`substates/fetch`, params);
  }

  public submitTransaction(params: IndexerSubmitTransactionRequest): Promise<IndexerSubmitTransactionResponse> {
    return this.transport.sendPost(`transactions`, params);
  }

  public getTransactionResult(transactionId: string): Promise<IndexerGetTransactionResultResponse> {
    return this.transport.sendGet(`transactions/${encodeURIComponent(transactionId)}/result`, {});
  }

  public getTemplateDefinition(templateAddress: string): Promise<GetTemplateDefinitionResponse> {
    return this.transport.sendGet(`templates/${encodeURIComponent(templateAddress)}`, {});
  }

  public listTemplates(limit = 0): Promise<ListTemplatesResponse> {
    return this.transport.sendGet(`templates`, { limit });
  }

  public listSubstates(params: ListSubstatesParams): Promise<ListSubstatesResult> {
    const query: Record<string, unknown> = {};
    if (params.filter_by_template != null) query["filter_by_template"] = params.filter_by_template;
    if (params.filter_by_type != null) query["filter_by_type"] = params.filter_by_type;
    if (params.limit != null) query["limit"] = params.limit;
    if (params.offset != null) query["offset"] = params.offset;
    return this.transport.sendGet(`substates`, query);
  }
}
