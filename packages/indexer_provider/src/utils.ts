import { TransactionStatus } from "@tari-project/tari-provider";

export function convertStringToTransactionStatus(status: string): TransactionStatus {
  switch (status) {
    case "New":
      return TransactionStatus.New;
    case "DryRun":
      return TransactionStatus.DryRun;
    case "Pending":
      return TransactionStatus.Pending;
    case "Accepted":
      return TransactionStatus.Accepted;
    case "Rejected":
      return TransactionStatus.Rejected;
    case "InvalidTransaction":
      return TransactionStatus.InvalidTransaction;
    case "OnlyFeeAccepted":
      return TransactionStatus.OnlyFeeAccepted;
    default:
      throw new Error(`Unknown status: ${status}`);
  }
}
