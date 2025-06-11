import { TariUniverseSigner } from "@tari-project/tari-universe-signer";
import { TariSigner } from "@tari-project/tari-signer";
import {
  Transaction,
  TransactionResult,
  TransactionStatus,
  DownSubstates,
  UpSubstates,
  SubmitTxResult,
  ReqSubstate,
  SubmitTransactionRequest,
  ComponentAddress,
} from "@tari-project/tarijs-types";
import { getSubstateValueFromUpSubstates, substateIdToString, txResultCheck } from "@tari-project/tarijs-types";

export function buildTransactionRequest(
  transaction: Transaction,
  accountId: number,
  isDryRun = false,
  network = 0,
  isSealSignerAuthorized = true,
  detectInputsUseUnversioned = true,
): SubmitTransactionRequest {
  return {
    network,
    account_id: accountId,
    instructions: transaction.instructions as object[],
    fee_instructions: transaction.feeInstructions as object[],
    inputs: transaction.inputs,
    is_dry_run: isDryRun,
    min_epoch: transaction.minEpoch ?? null,
    max_epoch: transaction.maxEpoch ?? null,
    is_seal_signer_authorized: isSealSignerAuthorized,
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

    return {
      response,
      result,
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
      return resp as TransactionResult;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export function getAcceptResultSubstates(txResult: TransactionResult): {
  upSubstates: UpSubstates;
  downSubstates: DownSubstates;
} {
  const result = txResult.result?.result;

  if (result && txResultCheck.isAcceptFeeRejectRest(result)) {
    return {
      upSubstates: result.AcceptFeeRejectRest[0].up_substates,
      downSubstates: result.AcceptFeeRejectRest[0].down_substates,
    };
  }
  if (result && txResultCheck.isAccept(result)) {
    return { upSubstates: result.Accept.up_substates, downSubstates: result.Accept.down_substates };
  }
  return { upSubstates: [], downSubstates: [] };
}
