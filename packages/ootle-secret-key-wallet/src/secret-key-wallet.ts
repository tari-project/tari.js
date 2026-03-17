//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import { Network, Signer } from "@tari-project/ootle";
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
  private network: Network;

  private constructor(secretKeyHex: string, publicKeyHex: string, address: string, wasm: OotleWasm, network: Network) {
    this.secretKeyHex = secretKeyHex;
    this.publicKeyHex = publicKeyHex;
    this.address = address;
    this.wasm = wasm;
    this.network = network;
  }

  /**
   * Generates a fresh random keypair and derives the component address for the given network.
   */
  public static random(wasm: OotleWasm, network: number): SecretKeyWallet {
    const keypair = wasm.generateKeypair();
    const address = wasm.publicKeyToAddress(keypair.public_key, network);
    return new SecretKeyWallet(keypair.secret_key, keypair.public_key, address, wasm, network);
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
    return new SecretKeyWallet(secretKeyHex, publicKeyHex, address, wasm, network);
  }

  public async getAddress(): Promise<string> {
    return Promise.resolve(this.address);
  }

  public async getPublicKey(): Promise<string> {
    return Promise.resolve(this.publicKeyHex);
  }

  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    const hashBytes = this.wasm.hashUnsignedTransaction(JSON.stringify(unsignedTx));
    const sig = this.wasm.schnorrSign(this.secretKeyHex, hashBytes);
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
