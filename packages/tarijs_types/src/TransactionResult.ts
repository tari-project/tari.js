import { TransactionStatus } from "./TransactionStatus";
import { FinalizeResult } from "./FinalizeResult";
import { DownSubstates, UpSubstates } from "./SubstateDiff";
import { ComponentAddress } from "@tari-project/typescript-bindings";

export type SubmitTransactionResponse = {
  transaction_id: string;
};

export interface SubmitTxResult {
  response: SubmitTransactionResponse;
  result: TransactionResult;
  upSubstates: UpSubstates;
  downSubstates: DownSubstates;
  newComponents: UpSubstates;
  getComponentForTemplate(templateAddress: string): ComponentAddress | null;
}

export type TransactionResult = {
  transaction_id: string;
  status: TransactionStatus;
  result: FinalizeResult | null;
};

export type TransactionResultResponse = {
  transaction_id: string;
  status: TransactionStatus;
  result: FinalizeResult | null;
};
