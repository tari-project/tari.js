import type {
  IndexerGetSubstateRequest,
  IndexerGetSubstateResponse,
  IndexerSubmitTransactionRequest,
  IndexerSubmitTransactionResponse,
  ListTemplatesResponse,
  SubstateType,
} from "@tari-project/typescript-bindings";
import { TransactionResult, TemplateDefinition, Substate, ListSubstatesResponse } from "./types";

export interface TariProvider {
  providerName: string;
  isConnected(): boolean;
  // getAccount(): Promise<Account>;
  getSubstate({ address, local_search_only, version }: IndexerGetSubstateRequest): Promise<IndexerGetSubstateResponse>;
  submitTransaction(req: IndexerSubmitTransactionRequest): Promise<IndexerSubmitTransactionResponse>;
  getTransactionResult(transactionId: string): Promise<TransactionResult>;
  getTemplateDefinition(template_address: string): Promise<TemplateDefinition>;
  listSubstates(
    filter_by_template: string | null,
    filter_by_type: SubstateType | null,
    limit: number | null,
    offset: number | null,
  ): Promise<ListSubstatesResponse>;
  listTemplates(limit: 0): Promise<ListTemplatesResponse>;
}
