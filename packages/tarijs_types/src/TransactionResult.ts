import { DownSubstates, UpSubstates } from "./SubstateDiff";
import { ComponentAddress, TransactionResult } from "@tari-project/typescript-bindings";

export type SubmitTransactionResponse = {
  transaction_id: string;
};

export enum TransactionResultStatus {
  Accept = "Accept",
  AcceptFeeRejectRest = "AcceptFeeRejectRest",
  Reject = "Reject",
}

export interface SubmitTxResult {
  response: SubmitTransactionResponse;
  result: TransactionResult;
  resultStatus: TransactionResultStatus | null;
  finalizedTxStatus: TransactionStatus;
  upSubstates: UpSubstates;
  downSubstates: DownSubstates;
  newComponents: UpSubstates;
  getComponentForTemplate(templateAddress: string): ComponentAddress | null;
}
