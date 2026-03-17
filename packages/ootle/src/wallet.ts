//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type {
  TransactionSignature,
  TransactionSealSignature,
  UnsignedTransactionV1,
  Transaction,
} from "@tari-project/ootle-ts-bindings";
import type { Signer } from "./signer";
import type { TransactionSealSigner } from "./transaction";
import type { WalletKeyProvider } from "./key-provider";

/**
 * The result of authorizing a transaction: a set of signatures from one signer.
 * Mirrors `TransactionAuthorization` from the Rust ootle-rs crate.
 */
export interface TransactionAuthorization {
  signerAddress: string;
  signatures: TransactionSignature[];
}

/**
 * A wallet that manages multiple key providers (one per component address) and
 * can sign and seal transactions on behalf of any registered signer.
 *
 * Mirrors `OotleWallet` from the Rust ootle-rs crate.
 *
 * @example
 * ```ts
 * const wallet = new OotleWallet();
 * wallet.registerKeyProvider(myAddress, mySecretKeyWallet);
 * wallet.setDefaultSigner(myAddress);
 *
 * const signed = await wallet.authorizeTransaction(unsignedTx);
 * ```
 */
export class OotleWallet implements Signer, TransactionSealSigner {
  private keyProviders: Map<string, WalletKeyProvider & Signer & TransactionSealSigner>;
  private defaultSignerAddress: string | null = null;

  constructor() {
    this.keyProviders = new Map();
  }

  /**
   * Registers a key provider for the given component address.
   * The provider must implement `Signer`, `TransactionSealSigner`, and `WalletKeyProvider`.
   */
  public registerKeyProvider(
    address: string,
    provider: WalletKeyProvider & Signer & TransactionSealSigner,
  ): this {
    this.keyProviders.set(address, provider);
    return this;
  }

  /**
   * Sets the address used when `signTransaction` or `sealTransaction` is called
   * without specifying a signer.
   */
  public setDefaultSigner(address: string): this {
    if (!this.keyProviders.has(address)) {
      throw new Error(`No key provider registered for address: ${address}`);
    }
    this.defaultSignerAddress = address;
    return this;
  }

  /**
   * Returns the default signer address, or throws if none is set.
   */
  public async getAddress(): Promise<string> {
    if (!this.defaultSignerAddress) {
      throw new Error("No default signer address set. Call setDefaultSigner() first.");
    }
    return this.defaultSignerAddress;
  }

  public async getPublicKey(): Promise<string> {
    return this.getSignerOrThrow().getPublicKey();
  }

  /**
   * Signs using the default signer.
   */
  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    return this.getSignerOrThrow().signTransaction(unsignedTx);
  }

  /**
   * Seals using the default signer.
   */
  public async sealTransaction(transaction: Transaction): Promise<TransactionSealSignature> {
    return this.getSignerOrThrow().sealTransaction(transaction);
  }

  /**
   * Generates `TransactionAuthorization` (signatures) for a specific registered signer.
   * Mirrors `OotleWallet::authorize_transaction` from ootle-rs.
   */
  public async authorizeTransaction(
    signerAddress: string,
    unsignedTx: UnsignedTransactionV1,
  ): Promise<TransactionAuthorization> {
    const provider = this.keyProviders.get(signerAddress);
    if (!provider) {
      throw new Error(`No key provider registered for address: ${signerAddress}`);
    }
    const signatures = await provider.signTransaction(unsignedTx);
    return { signerAddress, signatures };
  }

  /**
   * Collects authorizations from all registered key providers.
   * Useful when a transaction requires multiple signers.
   */
  public async authorizeTransactionAll(
    unsignedTx: UnsignedTransactionV1,
  ): Promise<TransactionAuthorization[]> {
    return Promise.all(
      [...this.keyProviders.keys()].map((addr) => this.authorizeTransaction(addr, unsignedTx)),
    );
  }

  /**
   * Returns the key provider for a specific address, if registered.
   */
  public getKeyProvider(address: string): (WalletKeyProvider & Signer & TransactionSealSigner) | undefined {
    return this.keyProviders.get(address);
  }

  /**
   * Returns all registered signer addresses.
   */
  public getSignerAddresses(): string[] {
    return [...this.keyProviders.keys()];
  }

  private getSignerOrThrow(): WalletKeyProvider & Signer & TransactionSealSigner {
    if (!this.defaultSignerAddress) {
      throw new Error("No default signer address set. Call setDefaultSigner() first.");
    }
    const provider = this.keyProviders.get(this.defaultSignerAddress);
    if (!provider) {
      throw new Error(`No key provider registered for default address: ${this.defaultSignerAddress}`);
    }
    return provider;
  }
}
