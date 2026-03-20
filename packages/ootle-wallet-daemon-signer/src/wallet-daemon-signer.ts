//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import { WalletDaemonClient } from "@tari-project/wallet_jrpc_client";
import { type Signer, fromHexStr } from "@tari-project/ootle";

export interface WalletDaemonSignerOptions {
  /** Base URL of the wallet daemon HTTP endpoint, e.g. "http://localhost:18103" */
  url: string;
  /**
   * Token used to authenticate JRPC calls to the wallet daemon.
   * Obtain via the wallet daemon's auth flow before constructing this signer.
   */
  authToken: string;
}

/**
 * A Signer that delegates signing to a running wallet daemon over its JRPC interface,
 * using `@tari-project/wallet_jrpc_client` for all communication.
 *
 * The wallet daemon holds the secret key and returns signatures, so the key never
 * lives in JavaScript memory. This signer is suitable for server-side or trusted
 * environment usage where the wallet daemon is reachable.
 */
export class WalletDaemonSigner implements Signer {
  private readonly client: WalletDaemonClient;
  private _publicKey: Uint8Array | null = null;
  private _address: string | null = null;

  private constructor(client: WalletDaemonClient) {
    this.client = client;
  }

  /**
   * Creates a new signer without verifying connectivity.
   * Prefer `connect()` for eager validation.
   */
  public static new(options: WalletDaemonSignerOptions): WalletDaemonSigner {
    const client = WalletDaemonClient.usingFetchTransport(options.url);
    client.setToken(options.authToken);
    return new WalletDaemonSigner(client);
  }

  /** Connect to the daemon and cache the public key / address. */
  public static async connect(options: WalletDaemonSignerOptions): Promise<WalletDaemonSigner> {
    const signer = WalletDaemonSigner.new(options);
    await signer?.fetchAccountInfo();
    return signer;
  }

  public async getAddress(): Promise<string> {
    if (!this._address) {
      await this.fetchAccountInfo();
    }
    return this._address as string;
  }

  public async getPublicKey(): Promise<Uint8Array> {
    if (!this._publicKey) {
      await this.fetchAccountInfo();
    }
    return this._publicKey as Uint8Array;
  }

  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    // The WalletDaemonClient has no typed wrapper for `transactions.sign`.
    // Use the generic sendRequest to call the JRPC method directly.
    const response = await this.client.sendRequest<{ signatures: TransactionSignature[] }>("transactions.sign", {
      transaction: unsignedTx,
    });
    return response.signatures;
  }

  public async fetchAccountInfo(): Promise<void> {
    if (!this.client) {
      throw new Error("Wallet daemon client not initialized");
    }
    const response = await this.client.accountsGetDefault({});
    if (!response.account?.owner_public_key || !response.address) {
      throw new Error("Wallet daemon response missing public_key or address");
    }
    this._publicKey = fromHexStr(response.account.owner_public_key);
    this._address = response.address;
  }
}
