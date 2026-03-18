//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import type { Signer } from "./signer";
import type { OotleWallet } from "./wallet";
import type { StealthTransferSpec } from "./stealth-transfer";

/**
 * Wraps an `OotleWallet` for use with stealth transfers, optionally
 * skipping account key signing when the transfer does not require it.
 *
 * Mirrors `WalletStealthAuthorizer` from the Rust ootle-rs crate.
 */
export class WalletStealthAuthorizer implements Signer {
  private readonly wallet: OotleWallet;
  private readonly mustSignWithAccountKey: boolean;

  constructor(wallet: OotleWallet, mustSignWithAccountKey = true) {
    this.wallet = wallet;
    this.mustSignWithAccountKey = mustSignWithAccountKey;
  }

  /**
   * Convenience constructor: builds a `WalletStealthAuthorizer` from a `StealthTransferSpec`.
   */
  public static fromSpec(wallet: OotleWallet, _spec: StealthTransferSpec): WalletStealthAuthorizer {
    // Stealth transfers always require the account key signature.
    return new WalletStealthAuthorizer(wallet, true);
  }

  public async getAddress(): Promise<string> {
    return this.wallet.getAddress();
  }

  public async getPublicKey(): Promise<Uint8Array> {
    return this.wallet.getPublicKey();
  }

  /**
   * Signs the transaction with the account key, or returns an empty list
   * if `mustSignWithAccountKey` is false.
   */
  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    if (!this.mustSignWithAccountKey) {
      return [];
    }
    return this.wallet.signTransaction(unsignedTx);
  }
}
