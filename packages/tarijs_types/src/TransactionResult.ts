import { FinalizeResult } from "./FinalizeResult";

export type SubmitTransactionResponse = {
  transaction_id: string;
};

export interface SubmitTxResult {
  response: SubmitTransactionResponse;
  result: TransactionResult;
}

export enum TransactionStatus {
  New,
  DryRun,
  Pending,
  Accepted,
  Rejected,
  InvalidTransaction,
  OnlyFeeAccepted,
}

export type TransactionResult = {
  transaction_id: string;
  status: TransactionStatus;
  result: FinalizeResult | null;
};
