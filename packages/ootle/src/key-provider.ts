//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

/**
 * Provides output masks (blinding factors) for confidential transactions.
 * Each call to `nextMask` must return a fresh, unique mask.
 *
 * Mirrors `OutputMaskProvider` from the Rust ootle-rs crate.
 */
export interface OutputMaskProvider {
  /**
   * Returns the next output mask as a hex-encoded scalar.
   * Implementations must ensure masks are not reused.
   */
  nextMask(): Promise<string>;
}

/**
 * Derives a shared secret via Diffie-Hellman key derivation for stealth outputs.
 *
 * Mirrors `DiffieHellmanKdfKeyProvider` from the Rust ootle-rs crate.
 */
export interface DiffieHellmanKdfKeyProvider {
  /**
   * Computes a KDF-derived shared secret between this key and the given
   * hex-encoded public key.
   *
   * @param publicKeyHex - The counterparty's public key (hex).
   * @returns The derived shared secret as a hex-encoded scalar.
   */
  createKdfDhKey(publicKeyHex: string): Promise<string>;
}

/**
 * A combined interface for a local key holder that can provide output masks
 * and perform DH key derivation. Implemented by `LocalKeyProvider`.
 *
 * Mirrors `WalletKeyProvider` from the Rust ootle-rs crate.
 */
export interface WalletKeyProvider extends OutputMaskProvider, DiffieHellmanKdfKeyProvider {}
