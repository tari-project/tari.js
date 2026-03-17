//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import type { Signer } from "@tari-project/ootle";
import { generateKeypair, hashUnsignedTransaction, publicKeyFromSecretKey, schnorrSign } from "ootle-wasm";

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
  private readonly accountSecretHex: string;
  private readonly viewOnlySecretHex: string | null;
  private readonly publicKeyHex: string;

  private constructor(accountSecretHex: string, viewOnlySecretHex: string | null, publicKeyHex: string) {
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
    const accountKeypair = generateKeypair() as { secret_key: string; public_key: string };
    const viewKeypair = generateKeypair() as { secret_key: string; public_key: string };
    return new SecretKeyWallet(accountKeypair.secret_key, viewKeypair.secret_key, accountKeypair.public_key);
  }

  /**
   * Creates a wallet from an existing hex-encoded account secret key.
   * The public key is derived via `wasm.derivePublicKey`.
   */
  public static fromSecretKey(accountSecretHex: string, viewOnlySecretHex?: string): SecretKeyWallet {
    const publicKeyHex = publicKeyFromSecretKey(accountSecretHex);
    return new SecretKeyWallet(accountSecretHex, viewOnlySecretHex ?? null, publicKeyHex);
  }

  /**
   * Creates a wallet directly from a secret key and its corresponding public key.
   * Use this overload if you already have both keys (e.g. from key storage).
   */
  public static fromKeypair(
    accountSecretHex: string,
    publicKeyHex: string,
    viewOnlySecretHex?: string,
  ): SecretKeyWallet {
    return new SecretKeyWallet(accountSecretHex, viewOnlySecretHex ?? null, publicKeyHex);
  }

  public async getAddress(): Promise<string> {
    return Promise.resolve(this.publicKeyHex);
  }

  public async getPublicKey(): Promise<string> {
    return Promise.resolve(this.publicKeyHex);
  }

  /**
   * Returns the view-only secret key, if one was set.
   * Used for stealth/confidential output scanning.
   */
  public getViewOnlySecret(): string | null {
    return this.viewOnlySecretHex;
  }

  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    const hashBytes = hashUnsignedTransaction(JSON.stringify(unsignedTx), this.publicKeyHex);
    const sig = schnorrSign(this.accountSecretHex, hashBytes) as { public_nonce: string; signature: string };
    return Promise.resolve([
      {
        public_key: this.publicKeyHex,
        signature: {
          public_nonce: sig.public_nonce,
          signature: sig.signature,
        },
      },
    ]);
  }
}
