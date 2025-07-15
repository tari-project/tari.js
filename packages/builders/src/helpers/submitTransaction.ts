import { TariUniverseSigner } from "@tari-project/tari-universe-signer";
import { TariSigner } from "@tari-project/tari-signer";
import {
  ComponentAddress, FinalizeResult,
  substateIdToString,
  TransactionResult,
  UnsignedTransactionV1,
} from "@tari-project/typescript-bindings";
import {
  DownSubstates,
  UpSubstates,
  getSubstateValueFromUpSubstates,
  SubmitTransactionRequest,
  TransactionStatus, SimpleTransactionResult,
} from "@tari-project/tarijs-types";
import { SubmitTxResult } from "@tari-project/tarijs-types/dist/TransactionResult";

export function buildTransactionRequest(
  transaction: UnsignedTransactionV1,
  accountId: number,
  detectInputsUseUnversioned = true,
): SubmitTransactionRequest {
  return {
    transaction,
    account_id: accountId,
    detect_inputs_use_unversioned: detectInputsUseUnversioned,
  };
}

export async function submitAndWaitForTransaction(
  signer: TariSigner,
  req: SubmitTransactionRequest,
): Promise<SimpleTransactionResult> {
  try {
    const response = await signer.submitTransaction(req);
    return await waitForTransactionResult(signer, response.transaction_id);
  } catch (e) {
    throw new Error(`Transaction failed: ${e}`);
  }
}

export async function waitForTransactionResult(
  signer: TariSigner | TariUniverseSigner,
  transactionId: string,
): Promise<SimpleTransactionResult> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await signer.getTransactionResult(transactionId);
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
      if (!resp.result) {
        throw new Error(`BUG: Transaction result is empty for transaction ID: ${transactionId}`);
      }

      return SimpleTransactionResult.fromResponse(resp);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export function getAcceptResultSubstates(txResult: TransactionResult): {
  upSubstates: UpSubstates;
  downSubstates: DownSubstates;
} {
  if ("Accept" in txResult) {
    return {
      upSubstates: txResult.Accept.up_substates,
      downSubstates: txResult.Accept.down_substates,
    };
  }

  if ("Reject" in txResult) {
    throw new Error(`Transaction rejected: ${txResult.Reject}`);
  }

  if ("AcceptFeeRejectRest" in txResult) {
    return {
      upSubstates: txResult.AcceptFeeRejectRest[0].up_substates,
      downSubstates: txResult.AcceptFeeRejectRest[0].down_substates,
    };
  }

  throw new Error(`Unexpected transaction result: ${JSON.stringify(txResult)}`);
}
