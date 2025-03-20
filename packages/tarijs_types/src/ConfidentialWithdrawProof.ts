import { ConfidentialOutputStatement } from "@tari-project/typescript-bindings";

export interface ConfidentialWithdrawProof {
  inputs: Array<Uint8Array>;
  inputRevealedAmount: number;
  outputProof: ConfidentialOutputStatement;
  balanceProof: Array<number>;
}
