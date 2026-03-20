//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

import type { UnsignedTransactionV1 } from "@tari-project/ootle-ts-bindings";

/**
 * Represents a stealth output to be created, with a one-time address and
 * an encrypted payload so only the recipient can scan and spend it.
 * Mirrors `Output` from the Rust ootle-rs `stealth` module.
 */
export interface StealthOutput {
  /** One-time public key for the output (hex). */
  oneTimePublicKeyHex: string;
  /** Encrypted data the recipient uses to reconstruct the spending key. */
  encryptedData: string;
  /** The output mask (blinding factor) as a hex scalar. */
  maskHex: string;
}

/**
 * A statement describing a set of stealth outputs to be created in a transaction.
 * Mirrors `StealthTransferStatement` from ootle-rs.
 */
export interface StealthTransferStatement {
  outputs: StealthOutput[];
  /** BOR-encoded balance proof bytes (base64). */
  balanceProof: string;
}

/**
 * Generates stealth output statements for a transaction.
 * Called by the wallet when constructing stealth transfers.
 *
 * Mirrors `StealthOutputStatementFactory` from the Rust ootle-rs crate.
 */
export interface StealthOutputStatementFactory {
  /**
   * Generates a `StealthTransferStatement` for the given outputs.
   *
   * @param recipientPublicKeyHex - The recipient's public key (hex).
   * @param amounts - Amounts to send in each output.
   */
  generateOutputsStatement(
    recipientPublicKeyHex: string,
    amounts: bigint[],
  ): Promise<StealthTransferStatement>;
}

/**
 * Decrypts stealth inputs the wallet owns, reconstructing the spending key
 * and mask for use in a transaction.
 *
 * Mirrors `InputDecryptor` from the Rust ootle-rs crate.
 */
export interface InputDecryptor {
  /**
   * Decrypts a stealth input and returns the reconstructed secret and mask.
   *
   * @param oneTimePublicKeyHex - The one-time public key of the input (hex).
   * @param encryptedData - The encrypted payload from the UTXO.
   * @returns `{ secretHex, maskHex }` needed to spend the input.
   */
  decryptInput(
    oneTimePublicKeyHex: string,
    encryptedData: string,
  ): Promise<{ secretHex: string; maskHex: string }>;
}

/**
 * Full stealth-capable signer: combines regular signing, output statement
 * generation, and input decryption.
 *
 * Mirrors the combined `WalletKeyProvider` supertrait from ootle-rs.
 */
export interface StealthSigner extends StealthOutputStatementFactory, InputDecryptor {
  /**
   * Signs the transaction body using the account key (for authorization).
   */
  signTransaction(unsignedTx: UnsignedTransactionV1): Promise<
    Array<{ public_key: string; signature: { public_nonce: string; signature: string } }>
  >;
}
