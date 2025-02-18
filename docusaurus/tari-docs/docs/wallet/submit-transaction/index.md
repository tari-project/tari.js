---
id: transactions-index
title: Submit Transaction
description: A detailed explanation of submitting transactions.
---

# Submit transaction

The provider exposes the `submitTransaction` and `getTransactionResult` methods. The first submits the transaction, while the second polls the current status of the transaction using its ID. These methods are low-level, so it is recommended to use the transaction builder and other helpers instead.

```ts
submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse>;
getTransactionResult(transactionId: string): Promise<TransactionResult>;
```