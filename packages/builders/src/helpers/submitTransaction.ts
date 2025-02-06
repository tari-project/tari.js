import { TariUniverseProvider } from "@tari-project/tari-universe-provider";
import { TariProvider, SubmitTransactionRequest } from "@tari-project/tari-provider";
import { SubstateRequirement } from "@tari-project/typescript-bindings";
import {
  Transaction,
  TransactionResult,
  TransactionStatus,
  DownSubstates,
  UpSubstates,
  FinalizeResultStatus,
  TxResultAccept,
  SubmitTxResult,
} from "@tari-project/tarijs-types";

export function buildTransactionRequest(
  transaction: Transaction,
  accountId: number,
  requiredSubstates: SubstateRequirement[],
  inputRefs = [],
  isDryRun = false,
  network = 0,
  isSealSignerAuthorized = true,
  detectInputsUseUnversioned = true,
): SubmitTransactionRequest {
  return {
    //TODO refactor SubTxReq type to not use 'object[]' and types match
    // https://github.com/tari-project/tari.js/issues/25
    network,
    account_id: accountId,
    instructions: transaction.instructions as object[],
    fee_instructions: transaction.feeInstructions as object[],
    inputs: transaction.inputs,
    input_refs: inputRefs as object[],
    required_substates: requiredSubstates,
    is_dry_run: isDryRun,
    min_epoch: transaction.minEpoch ?? null,
    max_epoch: transaction.maxEpoch ?? null,
    is_seal_signer_authorized: isSealSignerAuthorized,
    detect_inputs_use_unversioned: detectInputsUseUnversioned,
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
    throw new Error(`Transaction failed: ${e}`);
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
      return resp as any as TransactionResult; //TODO fix: type mismatch (https://github.com/tari-project/tari.js/issues/29)
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
