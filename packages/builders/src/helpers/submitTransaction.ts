import { TariUniverseSigner } from "@tari-project/tari-universe-signer";
import { TariSigner } from "@tari-project/tari-signer";
import {
  ComponentAddress,
  substateIdToString,
  TransactionResult,
  UnsignedTransactionV1,
} from "@tari-project/typescript-bindings";
import {
  DownSubstates,
  UpSubstates,
  getSubstateValueFromUpSubstates,
  SubmitTransactionRequest,
  TransactionStatus,
} from "@tari-project/tarijs-types";
import { SubmitTxResult } from "@tari-project/tarijs-types/dist/TransactionResult";
import { getTransactionResultStatus } from "@tari-project/tarijs-types/src/helpers/txResult";

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
): Promise<SubmitTxResult> {
  try {
    const response = await signer.submitTransaction(req);
    const result = await waitForTransactionResult(signer, response.transaction_id);
    const { upSubstates, downSubstates } = getAcceptResultSubstates(result);
    const newComponents = getSubstateValueFromUpSubstates("Component", upSubstates);

    function getComponentForTemplate(templateAddress: string): ComponentAddress | null {
      for (const [substateId, substate] of upSubstates) {
        if ("Component" in substate.substate) {
          const templateAddr = substate.substate.Component.template_address;
          const templateString =
            typeof templateAddr === "string" ? templateAddr : new TextDecoder().decode(templateAddr);
          if (templateAddress === templateString) {
            return substateIdToString(substateId);
          }
        }
      }
      return null;
    }

    const resultStatus = getTransactionResultStatus(result);

    return {
      response,
      result,
      resultStatus,
      upSubstates,
      downSubstates,
      newComponents,
      getComponentForTemplate,
    };
  } catch (e) {
    throw new Error(`Transaction failed: ${e}`);
  }
}

export async function waitForTransactionResult(
  signer: TariSigner | TariUniverseSigner,
  transactionId: string,
): Promise<TransactionResult> {
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
    if (!resp.result?.result) {
      throw new Error(`Transaction finalized but the result is undefined`);
    }
    if (FINALIZED_STATUSES.includes(resp.status)) {
      return resp.result?.result;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
