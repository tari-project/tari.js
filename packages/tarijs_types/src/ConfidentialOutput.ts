import { ElgamalVerifiableBalanceBytes } from "@tari-project/typescript-bindings";

export interface ConfidentialOutput {
  commitment: string;
  stealthPublicNonce: string;
  encrypted_data: Array<number>;
  minimumValuePromise: number;
  viewableBalance?: ElgamalVerifiableBalanceBytes;
}
