import { DownSubstates, UpSubstates } from "./SubstateDiff";
import { ComponentAddress, TransactionResult } from "@tari-project/typescript-bindings";

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
