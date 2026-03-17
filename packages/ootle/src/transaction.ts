//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type {
  UnsignedTransactionV1,
  Transaction,
  TransactionSignature,
  TransactionSealSignature,
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
 * Applies the seal signature to a signed transaction.
 * The seal signer is invoked last, after all regular signers, when
 * `is_seal_signer_authorized` is true on the unsigned transaction.
 *
 * Mirrors `TransactionSealSigner` from the Rust ootle-rs crate.
 */
export interface TransactionSealSigner {
  sealTransaction(transaction: Transaction): Promise<TransactionSealSignature>;
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
 *
 * If the unsigned transaction has `is_seal_signer_authorized = true`, a
 * `TransactionSealSigner` must be supplied — it is called last and its output
 * is placed in `seal_signature`. When sealing is not required the field is
 * left as a null/empty placeholder as the network expects.
 */
export async function signTransaction(
  signers: Signer[],
  unsignedTx: UnsignedTransactionV1,
  sealSigner?: TransactionSealSigner,
): Promise<Transaction> {
  if (unsignedTx.is_seal_signer_authorized && !sealSigner) {
    throw new Error(
      "Transaction requires a seal signer (is_seal_signer_authorized = true) but none was provided.",
    );
  }

  const allSignatures: TransactionSignature[] = [];
  for (const signer of signers) {
    const sigs = await signer.signTransaction(unsignedTx);
    allSignatures.push(...sigs);
  }

  const body: UnsealedTransactionV1 = {
    transaction: unsignedTx,
    signatures: allSignatures,
  };

  const unsealedTx: Transaction = {
    V1: {
      body,
      seal_signature: {
        public_key: "",
        signature: { public_nonce: "", signature: "" },
      },
    },
  };

  if (sealSigner) {
    const sealSig = await sealSigner.sealTransaction(unsealedTx);
    return {
      V1: {
        body,
        seal_signature: sealSig,
      },
    };
  }

  return unsealedTx;
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
export async function submitTransaction(
  provider: Provider,
  envelope: TransactionEnvelope,
): Promise<string> {
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
export function classifyOutcome(
  result: IndexerTransactionFinalizedResult,
): TransactionOutcome | null {
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

  return { status: "Commit" };
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
        throw new Error(
          `Transaction ${txId} only committed fees (execution aborted): ${outcome.reason}`,
        );
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
  signer: Signer,
  encoder: TransactionEncoder,
  unsignedTx: UnsignedTransactionV1,
  watchOpts?: WatchOptions,
  sealSigner?: TransactionSealSigner,
): Promise<IndexerGetTransactionResultResponse> {
  const resolved = await resolveTransaction(provider, unsignedTx);
  const signed = await signTransaction([signer], resolved, sealSigner);
  const envelope = encodeTransaction(encoder, signed);
  const txId = await submitTransaction(provider, envelope);
  return watchTransaction(provider, txId, watchOpts);
}

/**
 * Like `sendTransaction` but sets `dry_run = true` on the transaction before
 * submitting, so the network simulates execution without committing state.
 *
 * Mirrors `sign_and_send_dry_run` from the Rust ootle-rs `IndexerProvider`.
 */
export async function sendDryRun(
  provider: Provider,
  signer: Signer,
  encoder: TransactionEncoder,
  unsignedTx: UnsignedTransactionV1,
  watchOpts?: WatchOptions,
  sealSigner?: TransactionSealSigner,
): Promise<IndexerGetTransactionResultResponse> {
  return sendTransaction(
    provider,
    signer,
    encoder,
    { ...unsignedTx, dry_run: true },
    watchOpts,
    sealSigner,
  );
}
