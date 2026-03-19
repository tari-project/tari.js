---
title: Stealth Transfers
description: Privacy-preserving transfers with one-time public keys.
---

Stealth transfers produce outputs with one-time public keys — only the recipient (who holds the matching view-only key) can scan and spend them. This mirrors the `stealth` module in the Rust `ootle-rs` crate.

## Build a stealth transfer

```ts
import {
  StealthTransfer,
  WalletStealthAuthorizer,
  OotleWallet,
  signTransaction,
  resolveTransaction,
  submitTransaction,
  Network,
} from "@tari-project/ootle";

// 1. Build the stealth transfer
const spec = await new StealthTransfer(Network.Esmeralda, factory)
  .from(sourceAccount, resourceAddress)
  .to(recipientPublicKeyHex, 1_000_000n)
  .feeFrom(feeAccount, 1000n)
  .build();

// 2. Create the authorizer
const wallet = new OotleWallet();
wallet.registerKeyProvider(senderAddress, secretKeyWallet);
wallet.setDefaultSigner(senderAddress);

const authorizer = WalletStealthAuthorizer.fromSpec(wallet, spec);

// 3. Sign and submit
const resolved = await resolveTransaction(provider, spec.unsignedTx);
const signed = await signTransaction([authorizer], resolved);
const txId = await submitTransaction(provider, signed);
```

## StealthTransfer API

The `StealthTransfer` builder uses a fluent API:

| Method | Description |
|---|---|
| `from(account, resource)` | Set the source account and resource |
| `to(recipientPubKey, amount)` | Add a stealth output for the recipient |
| `feeFrom(account, maxFee)` | Set the fee source |
| `build()` | Build the unsigned transaction and stealth statement |

Multiple `.to()` calls add multiple stealth outputs.

## Implementing stealth providers

To integrate stealth transfers into your own application, implement these interfaces:

- **`StealthOutputStatementFactory`** — generates output statements (proofs + encrypted data)
- **`InputDecryptor`** — decrypts stealth inputs owned by your key
- **`OutputMaskProvider`** — provides fresh output masks (blinding factors)
- **`DiffieHellmanKdfKeyProvider`** — derives shared secrets for output encryption

## View-only keys

The `SecretKeyWallet` supports view-only keys for scanning stealth outputs:

```ts
const wallet = SecretKeyWallet.randomWithViewKey();
const viewKey = wallet.getViewOnlySecret(); // Uint8Array | null
```
