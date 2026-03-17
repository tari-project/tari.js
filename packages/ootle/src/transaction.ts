//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type {
  UnsignedTransactionV1,
  Transaction,
  TransactionSignature,
  TransactionEnvelope,
  IndexerGetTransactionResultResponse,
  UnsealedTransactionV1,
  IndexerTransactionFinalizedResult,
} from "@tari-project/ootle-ts-bindings";
import type { Provider } from "./provider";
import type { Signer } from "./signer";
import type { TransactionOutcome, WatchOptions } from "./types";

/**
 * Handles BOR encoding of transactions and hashing for signing.
 * The canonical implementation is provided by `@tari-project/ootle-wasm`.
 */
export interface TransactionEncoder {
  /** BOR-encodes a signed Transaction and returns a base64 TransactionEnvelope string. */
  encode(transaction: Transaction): TransactionEnvelope;

  /** Returns the canonical hash bytes of an unsigned transaction for Schnorr signing. */
  hashForSigning(unsignedTx: UnsignedTransactionV1): Uint8Array;
}

/**
 * Resolves unversioned inputs in the unsigned transaction by fetching their current
 * version from the provider.
 */
export async function resolveTransaction(
  provider: Provider,
  unsignedTx: UnsignedTransactionV1,
): Promise<UnsignedTransactionV1> {
  const resolvedInputs = await provider.resolveInputs(unsignedTx.inputs);
  return { ...unsignedTx, inputs: resolvedInputs };
}

/**
 * Collects signatures from all provided signers and assembles a signed Transaction.
 */
export async function signTransaction(signers: Signer[], unsignedTx: UnsignedTransactionV1): Promise<Transaction> {
  const allSignatures: TransactionSignature[] = [];
  for (const signer of signers) {
    const sigs = await signer.signTransaction(unsignedTx);
    allSignatures.push(...sigs);
  }

  const body: UnsealedTransactionV1 = {
    transaction: unsignedTx,
    signatures: allSignatures,
  };

  // TODO! Sealing needs to be implemented this is just a temporary fix
  const seal_signature = {
    public_key: allSignatures[0].public_key,
    signature: allSignatures[0].signature,
  };

  return {
    V1: {
      body,
      seal_signature,
    },
  };
}

/**
 * BOR-encodes a signed transaction into a TransactionEnvelope string using the provided encoder.
 */
export function encodeTransaction(encoder: TransactionEncoder, transaction: Transaction): TransactionEnvelope {
  return encoder.encode(transaction);
}

/**
 * Submits an encoded transaction envelope and returns the transaction ID.
 */
export async function submitTransaction(provider: Provider, envelope: TransactionEnvelope): Promise<string> {
  const response = await provider.submitTransaction(envelope);
  return response.transaction_id;
}

/**
 * Classifies a finalized transaction result into a `TransactionOutcome`.
 *
 * - `Commit` — all instructions committed.
 * - `OnlyFeeCommit` — fee instructions committed but execution was aborted.
 * - `Reject` — the entire transaction was rejected.
 *
 * Returns `null` if the result is still pending.
 */
export function classifyOutcome(result: IndexerTransactionFinalizedResult): TransactionOutcome | null {
  if (result === "Pending") return null;
  if (!("Finalized" in result)) return null;

  const finalized = result.Finalized;
  const decision = finalized.final_decision;

  if (decision === "Commit") {
    return { status: "Commit" };
  }

  if (typeof decision === "object" && "Abort" in decision) {
    const reason = finalized.abort_details ?? JSON.stringify(decision.Abort);
    // OnlyFeeCommit: fees were paid (fee_decision === "Commit") but execution aborted.
    const feeDecision = (finalized as Record<string, unknown>).fee_decision;
    if (feeDecision === "Commit") {
      return { status: "OnlyFeeCommit", reason };
    }
    return { status: "Reject", reason };
  }

  throw new Error(`Unexpected final_decision variant: ${JSON.stringify(decision)}`);
}

/**
 * Polls the provider until a transaction reaches a finalized state, then returns the result.
 *
 * Throws for `Reject` outcomes. `OnlyFeeCommit` (fees paid, execution aborted) also
 * throws with a distinct message so callers can distinguish it from a full rejection.
 * Use `classifyOutcome` on the raw result for non-throwing outcome inspection.
 */
export async function watchTransaction(
  provider: Provider,
  txId: string,
  opts?: WatchOptions,
): Promise<IndexerGetTransactionResultResponse> {
  const pollIntervalMs = opts?.pollIntervalMs ?? 500;
  const timeoutMs = opts?.timeoutMs ?? 60_000;
  const deadline = Date.now() + timeoutMs;

  while (true) {
    const response = await provider.getTransactionResult(txId);
    const result: IndexerTransactionFinalizedResult = response.result;

    if (result !== "Pending" && "Finalized" in result) {
      const outcome = classifyOutcome(result);
      if (outcome?.status === "Reject") {
        throw new Error(`Transaction ${txId} was rejected: ${outcome.reason}`);
      }
      if (outcome?.status === "OnlyFeeCommit") {
        throw new Error(`Transaction ${txId} only committed fees (execution aborted): ${outcome.reason}`);
      }
      return response;
    }

    if (Date.now() >= deadline) {
      throw new Error(`Transaction ${txId} did not finalize within ${timeoutMs}ms`);
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

/**
 * All-in-one convenience function: resolve → sign → encode → submit → watch.
 */
export async function sendTransaction(
  provider: Provider,
  signers: Signer | Signer[],
  encoder: TransactionEncoder,
  unsignedTx: UnsignedTransactionV1,
  watchOpts?: WatchOptions,
): Promise<IndexerGetTransactionResultResponse> {
  const resolved = await resolveTransaction(provider, unsignedTx);
  const signed = await signTransaction(Array.isArray(signers) ? signers : [signers], resolved);
  const envelope = encodeTransaction(encoder, signed);
  const txId = await submitTransaction(provider, envelope);
  return watchTransaction(provider, txId, watchOpts);
}

/**
 * Like `sendTransaction` but sets `dry_run = true` on the transaction before
 * submitting, so the network simulates execution without committing state.
 */
export async function sendDryRun(
  provider: Provider,
  signers: Signer | Signer[],
  encoder: TransactionEncoder,
  unsignedTx: UnsignedTransactionV1,
  watchOpts?: WatchOptions,
): Promise<IndexerGetTransactionResultResponse> {
  return sendTransaction(provider, signers, encoder, { ...unsignedTx, dry_run: true }, watchOpts);
}
