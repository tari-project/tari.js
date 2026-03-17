//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import type { Signer } from "@tari-project/ootle";
import type { OotleWasm } from "@tari-project/ootle-wasm";

/**
 * A local signer that holds a secret key in memory and uses the WASM module for
 * transaction hashing and Schnorr signing.
 *
 * For production use, prefer `WalletDaemonSigner` so the secret key never lives
 * in JavaScript memory.
 */
export class SecretKeyWallet implements Signer {
  private secretKeyHex: string;
  private publicKeyHex: string;
  private address: string;
  private wasm: OotleWasm;

  private constructor(secretKeyHex: string, publicKeyHex: string, address: string, wasm: OotleWasm) {
    this.secretKeyHex = secretKeyHex;
    this.publicKeyHex = publicKeyHex;
    this.address = address;
    this.wasm = wasm;
  }

  /**
   * Generates a fresh random keypair and derives the component address for the given network.
   */
  public static random(wasm: OotleWasm, network: number): SecretKeyWallet {
    const keypair = wasm.generateKeypair();
    const address = wasm.publicKeyToAddress(keypair.public_key, network);
    return new SecretKeyWallet(keypair.secret_key, keypair.public_key, address, wasm);
  }

  /**
   * Creates a wallet from an existing hex-encoded secret key.
   */
  public static fromSecretKey(secretKeyHex: string, wasm: OotleWasm, network: number): SecretKeyWallet {
    // Derive public key by signing a dummy message — the WASM module provides generateKeypair
    // but not a dedicated derivation function. We embed a workaround: sign an empty message
    // and extract the public nonce as the public key placeholder.
    // TODO: expose a `derivePublicKey(secretKeyHex)` in the WASM crate.
    const tempSign = wasm.schnorrSign(secretKeyHex, new Uint8Array(32));
    // The public_nonce from a Schnorr signature is not the public key.
    // For now we require the caller to also supply the public key, or we derive it via a known trick.
    // This is a known limitation until the WASM crate exposes key derivation.
    throw new Error(
      "fromSecretKey requires a WASM export `derivePublicKey(secretKeyHex)` which is not yet available. " +
        "Use SecretKeyWallet.random() or implement the WASM export.",
    );
    // The throw above makes the rest unreachable — it will be removed once the WASM crate is ready.
     
    void tempSign;
  }

  /**
   * Creates a wallet directly from a secret key and its corresponding public key.
   * Use this overload if you already have both keys (e.g. from key storage).
   */
  public static fromKeypair(
    secretKeyHex: string,
    publicKeyHex: string,
    wasm: OotleWasm,
    network: number,
  ): SecretKeyWallet {
    const address = wasm.publicKeyToAddress(publicKeyHex, network);
    return new SecretKeyWallet(secretKeyHex, publicKeyHex, address, wasm);
  }

  public async getAddress(): Promise<string> {
    return this.address;
  }

  public async getPublicKey(): Promise<string> {
    return this.publicKeyHex;
  }

  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    const hashBytes = this.wasm.hashUnsignedTransaction(JSON.stringify(unsignedTx));
    const sig = this.wasm.schnorrSign(this.secretKeyHex, hashBytes);
    return [
      {
        public_key: this.publicKeyHex,
        signature: {
          public_nonce: sig.public_nonce,
          signature: sig.signature,
        },
      },
    ];
  }
}
