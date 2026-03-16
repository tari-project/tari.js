//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type {
  IndexerGetSubstateResponse,
  IndexerGetTransactionResultResponse,
  IndexerSubmitTransactionResponse,
  GetSubstatesResponse,
  TransactionEnvelope,
  SubstateRequirement,
  SubstateId,
  GetTemplateDefinitionResponse,
} from "@tari-project/ootle-ts-bindings";
import type { Provider, ListSubstatesRequest, ListSubstatesResponse } from "@tari-project/ootle";
import { Network } from "@tari-project/ootle";
import { IndexerClient } from "./transport/indexer-client";
import { FetchTransport } from "./transport/http-transport";

export interface IndexerProviderOptions {
  /** Base URL of the indexer REST API, e.g. "http://localhost:18300" */
  url: string;
  network: Network;
}

export class IndexerProvider implements Provider {
  private client: IndexerClient;
  private _network: Network;

  private constructor(client: IndexerClient, network: Network) {
    this.client = client;
    this._network = network;
  }

  /**
   * Creates an IndexerProvider and verifies connectivity by fetching the indexer identity.
   */
  public static async connect(options: IndexerProviderOptions): Promise<IndexerProvider> {
    const client = IndexerClient.new(FetchTransport.new(options.url));
    await client.identityGet();
    return new IndexerProvider(client, options.network);
  }

  public network(): Network {
    return this._network;
  }

  public async getSubstate(substateId: string, version: number | null = null): Promise<IndexerGetSubstateResponse> {
    return this.client.substatesGet(substateId, {
      version,
      local_search_only: false,
    });
  }

  public async fetchSubstates(requests: SubstateId[]): Promise<GetSubstatesResponse> {
    return this.client.fetchSubstates({ requests, cached_only: false });
  }

  public async getTemplateDefinition(templateAddress: string): Promise<GetTemplateDefinitionResponse> {
    return this.client.getTemplateDefinition(templateAddress);
  }

  public async submitTransaction(envelope: TransactionEnvelope): Promise<IndexerSubmitTransactionResponse> {
    return this.client.submitTransaction({ transaction: envelope });
  }

  public async getTransactionResult(transactionId: string): Promise<IndexerGetTransactionResultResponse> {
    return this.client.getTransactionResult(transactionId);
  }

  public async resolveInputs(inputs: SubstateRequirement[]): Promise<SubstateRequirement[]> {
    const resolved = await Promise.all(
      inputs.map(async (req): Promise<SubstateRequirement> => {
        if (req.version !== null) {
          return req;
        }
        try {
          const substate = await this.client.substatesGet(req.substate_id, {
            version: null,
            local_search_only: false,
          });
          return { substate_id: req.substate_id, version: substate.version };
        } catch {
          // If we can't resolve the version, leave it as unversioned
          return req;
        }
      }),
    );
    return resolved;
  }

  public async listSubstates(params: ListSubstatesRequest): Promise<ListSubstatesResponse> {
    const result = await this.client.listSubstates({
      filter_by_template: params.filterByTemplate ?? null,
      filter_by_type: params.filterByType ?? null,
      limit: params.limit ?? null,
      offset: params.offset ?? null,
    });

    return {
      substates: result.substates.map((s) => ({
        substate_id: s.substate_id,
        module_name: s.module_name,
        version: s.version,
        template_address: s.template_address,
        timestamp: s.timestamp,
      })),
    };
  }
}
