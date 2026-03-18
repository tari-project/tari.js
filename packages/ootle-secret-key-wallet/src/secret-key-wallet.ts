//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import type { Signer } from "@tari-project/ootle";
import {
  generateKeypair,
  hashUnsignedTransaction,
  publicKeyFromSecretKey,
  schnorrSign,
} from "@tari-project/ootle-wasm";
import type { SchnorrSignatureBytes } from "@tari-project/ootle-ts-bindings/dist/types/SchnorrSignatureBytes";

/**
 * A local signer that holds a secret key (and optional view-only key) in memory,
 * using the WASM module for transaction hashing and Schnorr signing.
 *
 * Mirrors `OotleSecretKey` / `PrivateKeyProvider` from the Rust ootle-rs crate.
 *
 * For production use, prefer `WalletDaemonSigner` so the secret key never lives
 * in JavaScript memory.
 */
export class SecretKeyWallet implements Signer {
  private readonly accountSecretHex: Uint8Array;
  private readonly viewOnlySecretHex: Uint8Array | null;
  private readonly publicKeyHex: Uint8Array;

  private constructor(accountSecretHex: Uint8Array, viewOnlySecretHex: Uint8Array | null, publicKeyHex: Uint8Array) {
    this.accountSecretHex = accountSecretHex;
    this.viewOnlySecretHex = viewOnlySecretHex;
    this.publicKeyHex = publicKeyHex;
  }

  /**
   * Generates a fresh random account keypair and a separate random view-only key.
   * The view-only key is used for stealth/confidential output scanning.
   * Mirrors `OotleSecretKey { account_secret, view_only_secret }` from ootle-rs.
   */
  public static randomWithViewKey(): SecretKeyWallet {
    const accountKeypair = generateKeypair();
    const viewKeypair = generateKeypair();
    return new SecretKeyWallet(accountKeypair.secret_key, viewKeypair.secret_key, accountKeypair.public_key);
  }

  /**
   * Creates a wallet from an existing hex-encoded account secret key.
   * The public key is derived via `wasm.derivePublicKey`.
   */
  public static fromSecretKey(accountSecretHex: Uint8Array, viewOnlySecretHex?: Uint8Array): SecretKeyWallet {
    const publicKeyHex = publicKeyFromSecretKey(accountSecretHex);
    return new SecretKeyWallet(accountSecretHex, viewOnlySecretHex ?? null, publicKeyHex);
  }

  /**
   * Creates a wallet directly from a secret key and its corresponding public key.
   * Use this overload if you already have both keys (e.g. from key storage).
   */
  public static fromKeypair(
    accountSecretHex: Uint8Array,
    publicKeyHex: Uint8Array,
    viewOnlySecretHex?: Uint8Array,
  ): SecretKeyWallet {
    return new SecretKeyWallet(accountSecretHex, viewOnlySecretHex ?? null, publicKeyHex);
  }

  public async getAddress(): Promise<string> {
    return Promise.resolve(this.publicKeyHex.toString());
  }

  public async getPublicKey(): Promise<Uint8Array> {
    return Promise.resolve(this.publicKeyHex);
  }

  /**
   * Returns the view-only secret key, if one was set.
   * Used for stealth/confidential output scanning.
   */
  public getViewOnlySecret(): Uint8Array | null {
    return this.viewOnlySecretHex;
  }

  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    const hashBytes = hashUnsignedTransaction(JSON.stringify(unsignedTx), this.publicKeyHex);
    const sig = schnorrSign(this.accountSecretHex, hashBytes) as unknown as SchnorrSignatureBytes; // TODO - come back and update this when the bindings types align
    return Promise.resolve([
      {
        public_key: this.publicKeyHex.toString(),
        signature: sig,
      },
    ]);
  }
}
