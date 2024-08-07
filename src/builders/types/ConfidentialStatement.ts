import type { ViewableBalanceProof } from "./ViewableBalanceProof";

export interface ConfidentialStatement {
  commitment: Array<number>;
  senderPublicNonce: Array<number>;
  encryptedData: Array<number>;
  minimumValuePromise: number;
  viewableBalanceProof?: ViewableBalanceProof;
}
