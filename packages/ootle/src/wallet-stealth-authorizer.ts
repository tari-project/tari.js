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
import type { OotleWallet } from "./wallet";
import type { SignatureRequirements, StealthTransferSpec } from "./stealth-transfer";
import type { StealthKeySigner } from "./stealth";

/**
 * Wraps an `OotleWallet` with `SignatureRequirements` from a stealth transfer
 * and selects the correct sealing strategy:
 *
 * - `sealWithStealthKey` → seal using the stealth key for the output.
 * - `useEphemeralSeal` → seal using a fresh throwaway key (fully unlinkable).
 * - Otherwise → seal using the default account key.
 *
 * Mirrors `WalletStealthAuthorizer` from the Rust ootle-rs crate.
 */
export class WalletStealthAuthorizer implements Signer, TransactionSealSigner {
  private readonly wallet: OotleWallet;
  private readonly requirements: SignatureRequirements;
  private readonly stealthKeySigner: StealthKeySigner | null;
  private readonly ephemeralSealSigner: TransactionSealSigner | null;

  constructor(
    wallet: OotleWallet,
    requirements: SignatureRequirements,
    options?: {
      stealthKeySigner?: StealthKeySigner;
      ephemeralSealSigner?: TransactionSealSigner;
    },
  ) {
    this.wallet = wallet;
    this.requirements = requirements;
    this.stealthKeySigner = options?.stealthKeySigner ?? null;
    this.ephemeralSealSigner = options?.ephemeralSealSigner ?? null;
  }

  /**
   * Convenience constructor: builds a `WalletStealthAuthorizer` from a `StealthTransferSpec`.
   */
  public static fromSpec(
    wallet: OotleWallet,
    spec: StealthTransferSpec,
    options?: {
      stealthKeySigner?: StealthKeySigner;
      ephemeralSealSigner?: TransactionSealSigner;
    },
  ): WalletStealthAuthorizer {
    return new WalletStealthAuthorizer(wallet, spec.requirements, options);
  }

  public async getAddress(): Promise<string> {
    return this.wallet.getAddress();
  }

  public async getPublicKey(): Promise<string> {
    return this.wallet.getPublicKey();
  }

  /**
   * Signs the transaction with all required account keys (authorization step).
   * If `mustSignWithAccountKey` is false, returns an empty signature list —
   * the ephemeral seal provides the only authorization needed.
   */
  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    if (!this.requirements.mustSignWithAccountKey) {
      return [];
    }
    return this.wallet.signTransaction(unsignedTx);
  }

  /**
   * Seals the transaction using the appropriate strategy based on
   * `SignatureRequirements`:
   *
   * 1. Ephemeral seal → use the injected `ephemeralSealSigner`.
   * 2. Stealth key seal → use the injected `stealthKeySigner`.
   * 3. Account key seal → delegate to `OotleWallet`.
   */
  public async sealTransaction(transaction: Transaction): Promise<TransactionSealSignature> {
    if (this.requirements.useEphemeralSeal) {
      if (!this.ephemeralSealSigner) {
        throw new Error(
          "WalletStealthAuthorizer: useEphemeralSeal is true but no ephemeralSealSigner was provided.",
        );
      }
      return this.ephemeralSealSigner.sealTransaction(transaction);
    }

    if (this.requirements.sealWithStealthKey) {
      if (!this.stealthKeySigner) {
        throw new Error(
          "WalletStealthAuthorizer: sealWithStealthKey is true but no stealthKeySigner was provided.",
        );
      }
      // Derive the hash and sign with the stealth key.
      // The one-time public key comes from the first output in the spec.
      // Callers constructing this authorizer should pass the correct stealthKeySigner.
      const txJson = JSON.stringify(transaction);
      const encoder = new TextEncoder();
      const prehash = encoder.encode(txJson);
      // Note: in production this prehash should be computed via WASM hashUnsignedTransaction.
      // Here we delegate to stealthKeySigner which handles the hash internally.
      const sig = await this.stealthKeySigner.signWithStealthKey("", new Uint8Array(prehash));
      const pk = await this.wallet.getPublicKey();
      return { public_key: pk, signature: sig };
    }

    // Default: account key seal.
    return this.wallet.sealTransaction(transaction);
  }
}
