//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

export type {
  Amount,
  UnsignedTransactionV1,
  Transaction,
  TransactionV1,
  UnsealedTransactionV1,
  TransactionSignature,
  TransactionSealSignature,
  Instruction,
  InstructionArg,
  SubstateRequirement,
  SubstateId,
  TransactionEnvelope,
  IndexerSubmitTransactionRequest,
  IndexerSubmitTransactionResponse,
  IndexerGetSubstateRequest,
  IndexerGetSubstateResponse,
  IndexerGetTransactionResultResponse,
  IndexerTransactionFinalizedResult,
  GetSubstatesRequest,
  GetSubstatesResponse,
  GetTemplateDefinitionResponse,
  Decision,
  ExecuteResult,
  FinalizeResult,
} from "@tari-project/ootle-ts-bindings";

export interface WatchOptions {
  /** How often to poll for the transaction result, in milliseconds. Defaults to 500ms. */
  pollIntervalMs?: number;
  /** Maximum time to wait before throwing a timeout error, in milliseconds. Defaults to 60000ms. */
  timeoutMs?: number;
}

export interface ListSubstatesRequest {
  filterByTemplate?: string | null;
  filterByType?: string | null;
  limit?: number | null;
  offset?: number | null;
}

export interface ListSubstatesResponse {
  substates: Array<{
    substate_id: string;
    module_name: string | null;
    version: number;
    template_address: string | null;
    timestamp: string;
  }>;
}
