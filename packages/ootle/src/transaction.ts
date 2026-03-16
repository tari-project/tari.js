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
import type { WatchOptions } from "./types";

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
export async function signTransaction(
  signers: Signer[],
  unsignedTx: UnsignedTransactionV1,
): Promise<Transaction> {
  const allSignatures: TransactionSignature[] = [];
  for (const signer of signers) {
    const sigs = await signer.signTransaction(unsignedTx);
    allSignatures.push(...sigs);
  }

  const body: UnsealedTransactionV1 = {
    transaction: unsignedTx,
    signatures: allSignatures,
  };

  return {
    V1: {
      body,
      // The seal signature is applied by the seal signer (if is_seal_signer_authorized = true).
      // When not required, use empty placeholder values.
      seal_signature: {
        public_key: "",
        signature: { public_nonce: "", signature: "" },
      },
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
export async function submitTransaction(
  provider: Provider,
  envelope: TransactionEnvelope,
): Promise<string> {
  const response = await provider.submitTransaction(envelope);
  return response.transaction_id;
}

/**
 * Polls the provider until a transaction reaches a finalized state, then returns the result.
 *
 * Throws if the transaction is rejected or the optional timeout is exceeded.
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
      const decision = result.Finalized.final_decision;
      // Decision = "Commit" | { Abort: AbortReason }
      if (typeof decision === "object" && "Abort" in decision) {
        throw new Error(
          `Transaction ${txId} was aborted: ${result.Finalized.abort_details ?? JSON.stringify(decision.Abort)}`,
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
): Promise<IndexerGetTransactionResultResponse> {
  const resolved = await resolveTransaction(provider, unsignedTx);
  const signed = await signTransaction([signer], resolved);
  const envelope = encodeTransaction(encoder, signed);
  const txId = await submitTransaction(provider, envelope);
  return watchTransaction(provider, txId, watchOpts);
}
