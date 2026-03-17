//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type {
  TransactionSignature,
  UnsignedTransactionV1,
} from "@tari-project/ootle-ts-bindings";
import type { Signer } from "@tari-project/ootle";
import { Network } from "@tari-project/ootle";
import type { OotleWasm } from "@tari-project/ootle-wasm";

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
  private readonly address: string;
  private readonly wasm: OotleWasm;
  readonly network: Network;

  private constructor(
    accountSecretHex: string,
    viewOnlySecretHex: string | null,
    publicKeyHex: string,
    address: string,
    wasm: OotleWasm,
    network: Network,
  ) {
    this.accountSecretHex = accountSecretHex;
    this.viewOnlySecretHex = viewOnlySecretHex;
    this.publicKeyHex = publicKeyHex;
    this.address = address;
    this.wasm = wasm;
    this.network = network;
  }

  /**
   * Generates a fresh random account keypair and derives the component address.
   * The view-only key is not set; use `randomWithViewKey` if you need stealth support.
   */
  public static random(wasm: OotleWasm, network: Network | number): SecretKeyWallet {
    const keypair = wasm.generateKeypair();
    const address = wasm.publicKeyToAddress(keypair.public_key, network as number);
    return new SecretKeyWallet(keypair.secret_key, null, keypair.public_key, address, wasm, network as Network);
  }

  /**
   * Generates a fresh random account keypair and a separate random view-only key.
   * The view-only key is used for stealth/confidential output scanning.
   * Mirrors `OotleSecretKey { account_secret, view_only_secret }` from ootle-rs.
   */
  public static randomWithViewKey(wasm: OotleWasm, network: Network | number): SecretKeyWallet {
    const accountKeypair = wasm.generateKeypair();
    const viewKeypair = wasm.generateKeypair();
    const address = wasm.publicKeyToAddress(accountKeypair.public_key, network as number);
    return new SecretKeyWallet(
      accountKeypair.secret_key,
      viewKeypair.secret_key,
      accountKeypair.public_key,
      address,
      wasm,
      network as Network,
    );
  }

  /**
   * Creates a wallet from an existing hex-encoded account secret key.
   * The public key is derived via `wasm.derivePublicKey`.
   */
  public static fromSecretKey(
    accountSecretHex: string,
    wasm: OotleWasm,
    network: Network | number,
    viewOnlySecretHex?: string,
  ): SecretKeyWallet {
    const publicKeyHex = wasm.derivePublicKey(accountSecretHex);
    const address = wasm.publicKeyToAddress(publicKeyHex, network as number);
    return new SecretKeyWallet(
      accountSecretHex,
      viewOnlySecretHex ?? null,
      publicKeyHex,
      address,
      wasm,
      network as Network,
    );
  }

  /**
   * Creates a wallet directly from a secret key and its corresponding public key.
   * Use this overload if you already have both keys (e.g. from key storage).
   */
  public static fromKeypair(
    accountSecretHex: string,
    publicKeyHex: string,
    wasm: OotleWasm,
    network: Network | number,
    viewOnlySecretHex?: string,
  ): SecretKeyWallet {
    const address = wasm.publicKeyToAddress(publicKeyHex, network as number);
    return new SecretKeyWallet(
      accountSecretHex,
      viewOnlySecretHex ?? null,
      publicKeyHex,
      address,
      wasm,
      network as Network,
    );
  }

  public async getAddress(): Promise<string> {
    return this.address;
  }

  public async getPublicKey(): Promise<string> {
    return this.publicKeyHex;
  }

  /**
   * Returns the view-only secret key, if one was set.
   * Used for stealth/confidential output scanning.
   */
  public getViewOnlySecret(): string | null {
    return this.viewOnlySecretHex;
  }

  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    const hashBytes = this.wasm.hashUnsignedTransaction(JSON.stringify(unsignedTx));
    const sig = this.wasm.schnorrSign(this.accountSecretHex, hashBytes);
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
