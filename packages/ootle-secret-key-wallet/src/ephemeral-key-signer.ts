//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import { Signer } from "@tari-project/ootle";
import { generateKeypair, hashUnsignedTransaction, schnorrSign } from "ootle-wasm";

/**
 * A one-shot signer that generates a fresh throwaway keypair, signs once,
 * and exposes no way to reuse the key. Used for privacy-preserving transactions
 * where the sender wants no link between the transaction and their identity.
 *
 * Mirrors `EphemeralKeySigner` from the Rust ootle-rs crate.
 *
 * @example
 * ```ts
 * const signer = EphemeralKeySigner.generate(wasm);
 * const signed = await signTransaction([signer], unsignedTx);
 * ```
 */
export class EphemeralKeySigner implements Signer {
  private readonly secretKeyHex: Uint8Array;
  private readonly publicKeyHex: Uint8Array;

  private constructor(secretKeyHex: Uint8Array, publicKeyHex: Uint8Array) {
    this.secretKeyHex = secretKeyHex;
    this.publicKeyHex = publicKeyHex;
  }

  /**
   * Generates a fresh ephemeral keypair. The secret key exists only for the
   * lifetime of this object and is never persisted.
   */
  public static generate(): EphemeralKeySigner {
    const keypair = generateKeypair();
    return new EphemeralKeySigner(keypair.secret_key, keypair.public_key);
  }

  public async getAddress(): Promise<string> {
    // Ephemeral signers have no persistent address — return the public key as-is.
    // TODO - fix this when keys -> address is ready
    return Promise.resolve(this.publicKeyHex.toString());
  }

  public async getPublicKey(): Promise<Uint8Array> {
    return Promise.resolve(this.publicKeyHex);
  }

  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    const hashBytes = hashUnsignedTransaction(JSON.stringify(unsignedTx), this.publicKeyHex);
    const sig = schnorrSign(this.secretKeyHex, hashBytes);
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
