---
title: Transaction Flow
description: How transactions move from construction to finalization.
---

A transaction in ootle.ts goes through four stages: **build**, **resolve**, **sign**, and **submit**. The SDK provides both individual functions for each stage and an all-in-one convenience helper.

## The pipeline

```
TransactionBuilder.buildUnsignedTransaction()
  → resolveTransaction(provider, unsignedTx)     // fill in substate versions
  → signTransaction([signer], resolvedTx)         // seal keypair + Schnorr signatures
  → submitTransaction(provider, signedTx)         // BOR-encode and send to network
  → watchTransaction(provider, txId)              // wait for finalization
```

## Individual steps

```ts
import {
  resolveTransaction,
  signTransaction,
  submitTransaction,
  watchTransaction,
  classifyOutcome,
} from "@tari-project/ootle";

// 1. Resolve — fills in missing substate versions
const resolved = await resolveTransaction(provider, unsignedTx);

// 2. Sign — generates a seal keypair, collects Schnorr signatures
const signed = await signTransaction([signer], resolved);

// 3. Submit — BOR-encodes via ootle-wasm and sends
const txId = await submitTransaction(provider, signed);

// 4. Watch — waits for finalization (SSE + polling fallback)
const receipt = await watchTransaction(provider, txId, { timeoutMs: 30_000 });

// 5. Inspect the outcome
const outcome = classifyOutcome(receipt.result);
// { status: "Commit" }
// | { status: "OnlyFeeCommit"; reason: string }
// | { status: "Reject"; reason: string }
```

## All-in-one helpers

```ts
import { sendTransaction, sendDryRun } from "@tari-project/ootle";

// Resolve → sign → submit → watch in a single call
const receipt = await sendTransaction(provider, signer, unsignedTx);

// Dry-run: simulates without committing state
const result = await sendDryRun(provider, signer, unsignedTx);
```

`sendTransaction` accepts either a single `Signer` or an array of signers. All signatures are collected before submitting.

## Transaction outcomes

`classifyOutcome` returns one of three statuses:

| Status | Meaning |
|---|---|
| `Commit` | Transaction fully committed |
| `OnlyFeeCommit` | Fee deducted but execution aborted |
| `Reject` | Transaction rejected entirely |

Neither `watchTransaction` nor `PendingTransaction.watch()` throws on `OnlyFeeCommit` or `Reject` — the caller decides how to handle each case.
