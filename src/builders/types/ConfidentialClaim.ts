import type { ConfidentialWithdrawProof } from "./ConfidentialWithdrawProof";

export interface ConfidentialClaim {
  publicKey: string;
  outputAddress: string;
  rangeProof: Array<number>;
  proofOfKnowledge: string;
  withdrawProof?: ConfidentialWithdrawProof;
}
