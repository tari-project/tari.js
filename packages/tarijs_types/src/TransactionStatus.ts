export enum TransactionStatus {
  New = "New",
  DryRun = "DryRun",
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
  InvalidTransaction = "InvalidTransaction",
  OnlyFeeAccepted = "OnlyFeeAccepted",
}

export function transactionStatusFromStr(s: string): TransactionStatus {
  switch (s) {
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
      throw new Error(`Unknown transaction status: ${s}`);
  }
}
