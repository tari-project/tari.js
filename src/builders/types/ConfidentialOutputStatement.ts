import type { Amount } from "./Amount";
import type { ConfidentialStatement } from "./ConfidentialStatement";

export interface ConfidentialOutputStatement {
  outputStatement?: ConfidentialStatement;
  changeStatement?: ConfidentialStatement;
  rangeProof: Array<number>;
  outputRevealedAmount: Amount;
  changeRevealedAmount: Amount;
}
