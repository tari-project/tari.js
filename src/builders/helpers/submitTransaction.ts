import { TariProvider } from "../../providers";
import { TariUniverseProvider } from "../../providers/tari_universe";
import {
  SubmitTransactionRequest,
  SubstateRequirement,
  TransactionResult,
  TransactionStatus,
} from "../../providers/types";
import { Transaction } from "../types";

export function buildTransactionRequest(
  transaction: Transaction,
  accountId: number,
  requiredSubstates: SubstateRequirement[], //TODO use bindings type not from provider
  inputRefs: object[] = [], //TODO
  isDryRun = false,
): SubmitTransactionRequest {
  return {
    account_id: accountId,
    instructions: transaction.instructions as object[], //TODO refactor SubTxReq type to change 'object[]'
    fee_instructions: transaction.feeInstructions as object[],
    inputs: transaction.inputs,
    input_refs: inputRefs, //TODO
    required_substates: requiredSubstates,
    is_dry_run: isDryRun,
    min_epoch: transaction.minEpoch ?? null, //TODO
    max_epoch: transaction.maxEpoch ?? null,
  };
}

export async function submitAndWaitForTransaction(
  provider: TariProvider | TariUniverseProvider,
  req: SubmitTransactionRequest,
): Promise<TransactionResult> {
  try {
    const resp = await provider.submitTransaction(req);
    const result = await waitForTransactionResult(provider, resp.transaction_id);

    return result;
  } catch (e) {
    console.log(e);
    throw new Error("Transaction failed:", e);
  }
}

export async function waitForTransactionResult(provider: TariProvider | TariUniverseProvider, transactionId: string) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await provider.getTransactionResult(transactionId);
    const FINALIZED_STATUSES = [
      TransactionStatus.Accepted,
      TransactionStatus.Rejected,
      TransactionStatus.InvalidTransaction,
      TransactionStatus.OnlyFeeAccepted,
      TransactionStatus.DryRun,
    ];

    if (resp.status == TransactionStatus.Rejected) {
      throw new Error(`Transaction rejected: ${JSON.stringify(resp.result)}`);
    }
    if (FINALIZED_STATUSES.includes(resp.status)) {
      return resp;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
