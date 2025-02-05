import type { ElgamalVerifiableBalance } from "./ElgamalVerifiableBalance";

export interface ConfidentialOutput {
  commitment: string;
  stealthPublicNonce: string;
  encrypted_data: Array<number>;
  minimumValuePromise: number;
  viewableBalance?: ElgamalVerifiableBalance;
}
