//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { TransactionSignature, UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";
import type { Signer } from "@tari-project/ootle";

interface AccountInfo {
  public_key: string;
  address: string;
}

interface JrpcResponse<T = unknown> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number | string; message: string };
}

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
 * A Signer that delegates signing to a running wallet daemon over its HTTP/JRPC interface.
 *
 * The wallet daemon holds the secret key and returns signatures, so the key never
 * lives in JavaScript memory. This signer is suitable for server-side or trusted
 * environment usage where the wallet daemon is reachable.
 */
export class WalletDaemonSigner implements Signer {
  private options: WalletDaemonSignerOptions;
  private _publicKey: string | null = null;
  private _address: string | null = null;
  private requestId = 0;

  private constructor(options: WalletDaemonSignerOptions) {
    this.options = options;
  }

  public static new(options: WalletDaemonSignerOptions): WalletDaemonSigner {
    return new WalletDaemonSigner(options);
  }

  /** Connect to the daemon and cache the public key / address. */
  public static async connect(options: WalletDaemonSignerOptions): Promise<WalletDaemonSigner> {
    const signer = new WalletDaemonSigner(options);
    await signer.fetchAccountInfo();
    return signer;
  }

  public async getAddress(): Promise<string> {
    if (!this._address) {
      const { address } = await this.fetchAccountInfo();
      return address;
    } else {
      return this._address;
    }
  }

  public async getPublicKey(): Promise<string> {
    if (!this._publicKey) {
      const { public_key } = await this.fetchAccountInfo();
      return public_key;
    }
    return this._publicKey;
  }

  public async signTransaction(unsignedTx: UnsignedTransactionV1): Promise<TransactionSignature[]> {
    const response = await this.jrpcCall<{ signatures: TransactionSignature[] }>("transactions.sign", {
      transaction: unsignedTx,
    });
    return response.signatures;
  }

  private async fetchAccountInfo(): Promise<AccountInfo> {
    const info = await this.jrpcCall<{ public_key: string; address: string }>("accounts.get_default", {});
    if (!info.public_key || !info.address) {
      throw new Error("Wallet daemon response missing public_key or address");
    }
    this._publicKey = info.public_key;
    this._address = info.address;

    return {
      address: info.address,
      public_key: info.public_key,
    };
  }

  private async jrpcCall<T>(method: string, params: unknown): Promise<T> {
    const response = await fetch(this.options.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.options.authToken}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: ++this.requestId,
        method,
        params,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}${text ? ` — ${text}` : ""}`);
    }

    const json = (await response.json()) as JrpcResponse<T>;
    if (json.error) {
      throw new Error(`JRPC error ${json.error.code}: ${json.error.message}`);
    }
    if (json.result === undefined) {
      throw new Error(`JRPC response missing 'result' field for method "${method}"`);
    }
    return json.result;
  }
}
