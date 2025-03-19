import { FinalizeResult } from "@tari-project/typescript-bindings";
import { TransactionStatus } from "./TransactionStatus";

export type GetTransactionResultResponse = {
  transaction_id: string;
  status: TransactionStatus;
  result: FinalizeResult | null;
};
