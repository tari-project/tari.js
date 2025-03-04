import type { ListTemplatesResponse } from "@tari-project/typescript-bindings";
import {
  TransactionResult,
  TemplateDefinition,
  Substate,
  ListSubstatesResponse,
  GetSubstateRequest,
  ListSubstatesRequest,
} from "./types";

export interface TariProvider {
  providerName: string;
  isConnected(): boolean;
  getSubstate(req: GetSubstateRequest): Promise<Substate>;
  getTransactionResult(transactionId: string): Promise<TransactionResult>;
  getTemplateDefinition(template_address: string): Promise<TemplateDefinition>;
  listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse>;
  listTemplates(limit?: number): Promise<ListTemplatesResponse>;
}
