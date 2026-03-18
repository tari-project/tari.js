//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";

/**
 * A Signer is responsible only for signing. It has no read or submit capability.
 * Implementations include SecretKeyWallet (local WASM signing) and WalletDaemonSigner (remote daemon).
 */
export interface Signer {
  /** Returns the component address derived from this signer's public key. */
  getAddress(): Promise<string>;

  /** Returns the hex-encoded public key for this signer. */
  getPublicKey(): Promise<Uint8Array>;

  /** Signs the given unsigned transaction and returns the signed, and encoded TransactionEnvelope. */
  signTransaction(transaction: UnsignedTransactionV1): Promise<TransactionSignature[]>;
}
