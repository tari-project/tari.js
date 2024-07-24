import { SubmitTransactionRequest, SubstateRequirement } from "../../providers/types";
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
