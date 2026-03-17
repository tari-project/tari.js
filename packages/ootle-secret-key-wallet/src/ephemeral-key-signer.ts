//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import { Network, Signer } from "@tari-project/ootle";
import type { OotleWasm } from "ootle-wasm";

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
  private readonly address: string;
  private readonly secretKeyHex: string;
  private readonly publicKeyHex: string;
  private readonly wasm: OotleWasm;
  public network: Network;

  private constructor(secretKeyHex: string, publicKeyHex: string, address: string, wasm: OotleWasm, network: Network) {
    this.address = address;
    this.secretKeyHex = secretKeyHex;
    this.publicKeyHex = publicKeyHex;
    this.network = network;
    this.wasm = wasm;
  }

  /**
   * Generates a fresh ephemeral keypair. The secret key exists only for the
   * lifetime of this object and is never persisted.
   */
  public static generate(wasm: OotleWasm, network: Network): EphemeralKeySigner {
    const keypair = wasm.generateKeypair();
    const address = wasm.publicKeyToAddress(keypair.public_key, network);
    return new EphemeralKeySigner(keypair.secret_key, keypair.public_key, address, wasm, network);
  }

  public async getAddress(): Promise<string> {
    // Ephemeral signers have no persistent address — return the public key as-is.
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
