import { TariProvider } from "../../providers";
import { TariUniverseProvider } from "../../providers/tari_universe";
import { SubmitTransactionRequest, SubstateRequirement } from "../../providers/types";
import { Transaction, TransactionResult, TransactionStatus } from "../types";
import { FinalizeResultStatus, TxResultAccept } from "../types/FinalizeResult";
import { DownSubstates, UpSubstates } from "../types/SubstateDiff";
import { SubmitTxResult } from "../types/TransactionResult";

export function buildTransactionRequest(
  transaction: Transaction,
  accountId: number,
  requiredSubstates: SubstateRequirement[],
  inputRefs = [],
  isDryRun = false,
): SubmitTransactionRequest {
  return {
    //TODO refactor SubTxReq type to not use 'object[]' and types match
    account_id: accountId,
    instructions: transaction.instructions as object[],
    fee_instructions: transaction.feeInstructions as object[],
    inputs: transaction.inputs,
    input_refs: inputRefs as object[],
    required_substates: requiredSubstates,
    is_dry_run: isDryRun,
    min_epoch: transaction.minEpoch ?? null,
    max_epoch: transaction.maxEpoch ?? null,
  };
}

export async function submitAndWaitForTransaction(
  provider: TariProvider,
  req: SubmitTransactionRequest,
): Promise<SubmitTxResult> {
  try {
    const response = await provider.submitTransaction(req);
    const result = await waitForTransactionResult(provider, response.transaction_id);

    return {
      response,
      result,
    };
  } catch (e) {
    throw new Error("Transaction failed:", e);
  }
}

export async function waitForTransactionResult(
  provider: TariProvider | TariUniverseProvider,
  transactionId: string,
): Promise<TransactionResult> {
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
      return resp as any as TransactionResult; //TODO fix: type mismatch
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export function getAcceptResultSubstates(
  txResult: TransactionResult,
): { upSubstates: UpSubstates; downSubstates: DownSubstates } | undefined {
  const result = txResult.result?.result;

  if (result && isAccept(result)) {
    return { upSubstates: result.Accept.up_substates, downSubstates: result.Accept.down_substates };
  }
  return undefined;
}

function isAccept(result: FinalizeResultStatus): result is TxResultAccept {
  return "Accept" in result;
}
