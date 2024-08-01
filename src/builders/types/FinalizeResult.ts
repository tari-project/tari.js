import { FeeReceipt, InstructionResult, LogEntry, RejectReason } from "@tariproject/typescript-bindings";
import { SubstateDiff } from "./SubstateDiff";

export type TxResultAccept = { Accept: SubstateDiff };
export type TxResultAcceptFeeRejectRest = { AcceptFeeRejectRest: [SubstateDiff, RejectReason] };
export type TxResultReject = { Reject: RejectReason };

export type FinalizeResultStatus = TxResultAccept | TxResultAcceptFeeRejectRest | TxResultReject;

export interface FinalizeResult {
  transaction_hash: Uint8Array;
  events: Array<Event>;
  logs: Array<LogEntry>;
  execution_results: Array<InstructionResult>;
  result: FinalizeResultStatus;
  fee_receipt: FeeReceipt;
}
