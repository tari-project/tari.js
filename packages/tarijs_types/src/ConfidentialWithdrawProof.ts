import type { ConfidentialOutputStatement } from "./ConfidentialOutputStatement";

export interface ConfidentialWithdrawProof {
  inputs: Array<Uint8Array>;
  inputRevealedAmount: number;
  outputProof: ConfidentialOutputStatement;
  balanceProof: Array<number>;
}
