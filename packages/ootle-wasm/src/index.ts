//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { Transaction, TransactionEnvelope, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import type { TransactionEncoder } from "@tari-project/ootle";

/**
 * WASM-backed cryptographic primitives exposed to JavaScript.
 *
 * This interface is implemented by the compiled Rust WASM crate.
 * The Rust crate depends on `tari_bor`, `tari_ootle_transaction`, and `tari_crypto`.
 */
export interface OotleWasm {
  /**
   * BOR-encodes a Transaction (supplied as JSON) and returns a base64 TransactionEnvelope string.
   * The encoding must be byte-identical to Rust's `ciborium`/`tari_bor` output.
   */
  borEncodeTransaction(transactionJson: string): string;

  /**
   * Returns the canonical hash bytes of an UnsignedTransactionV1 for Schnorr signing.
   * Must match the Rust canonical transaction hash.
   */
  hashUnsignedTransaction(unsignedTxJson: string): Uint8Array;

  /**
   * Produces a Schnorr signature over `message` using `secretKeyHex`.
   */
  schnorrSign(
    secretKeyHex: string,
    message: Uint8Array,
  ): { public_nonce: string; signature: string };

  /**
   * Generates a new random keypair.
   */
  generateKeypair(): { secret_key: string; public_key: string };

  /**
   * Derives the public key from a hex-encoded secret key.
   * Must be implemented in the WASM crate (tari_crypto scalar multiplication).
   */
  derivePublicKey(secretKeyHex: string): string;

  /**
   * Derives the component address from a public key and network byte.
   */
  publicKeyToAddress(publicKey: string, network: number): string;
}

/**
 * A TransactionEncoder backed by the WASM module.
 */
class WasmEncoder implements TransactionEncoder {
  constructor(private wasm: OotleWasm) {}

  encode(transaction: Transaction): TransactionEnvelope {
    return this.wasm.borEncodeTransaction(JSON.stringify(transaction));
  }

  hashForSigning(unsignedTx: UnsignedTransactionV1): Uint8Array {
    return this.wasm.hashUnsignedTransaction(JSON.stringify(unsignedTx));
  }
}

/**
 * Loads the WASM module and returns a TransactionEncoder backed by it.
 *
 * @param wasmModule - The initialised WASM module instance. Pass the result of
 *   `await import('@tari-project/ootle-wasm/wasm')` after calling its `default()` init function.
 *
 * NOTE: The actual WASM binary is compiled from the Rust crate at
 * `packages/ootle-wasm/crate/`. Until that crate is compiled, this function
 * throws unless a mock `wasmModule` is supplied (useful for tests).
 */
export function createWasmEncoder(wasmModule: OotleWasm): TransactionEncoder {
  return new WasmEncoder(wasmModule);
}

export type { TransactionEncoder } from "@tari-project/ootle";
