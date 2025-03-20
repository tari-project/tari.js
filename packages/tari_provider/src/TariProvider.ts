import type { GetTemplateDefinitionResponse, ListTemplatesResponse } from "@tari-project/typescript-bindings";
import {
  GetTransactionResultResponse,
  TemplateDefinition,
  Substate,
  ListSubstatesResponse,
  GetSubstateRequest,
  ListSubstatesRequest,
} from "@tari-project/tarijs-types";

export interface TariProvider {
  providerName: string;
  isConnected(): boolean;
  getSubstate(req: GetSubstateRequest): Promise<Substate>;
  getTransactionResult(transactionId: string): Promise<GetTransactionResultResponse>;
  getTemplateDefinition(template_address: string): Promise<GetTemplateDefinitionResponse>;
  listSubstates(req: ListSubstatesRequest): Promise<ListSubstatesResponse>;
  listTemplates(limit?: number): Promise<ListTemplatesResponse>;
}
