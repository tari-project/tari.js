---
title: Multi-Signer Wallet
description: Manage multiple key providers with OotleWallet.
---

`OotleWallet` is a multi-signer wallet that manages multiple key providers — one per address. This is useful when a transaction requires authorizations from several components.

## Setup

```ts
import { OotleWallet } from "@tari-project/ootle";

const wallet = new OotleWallet();
wallet.registerKeyProvider(addressA, signerA);
wallet.registerKeyProvider(addressB, signerB);
wallet.setDefaultSigner(addressA);
```

## Sign with the default signer

```ts
const signatures = await wallet.signTransaction(unsignedTx);
```

## Authorize for a specific address

```ts
const auth = await wallet.authorizeTransaction(addressB, unsignedTx);
```

## Use with stealth transfers

`OotleWallet` integrates with `WalletStealthAuthorizer` for stealth transfers:

```ts
import { WalletStealthAuthorizer } from "@tari-project/ootle";

const authorizer = WalletStealthAuthorizer.fromSpec(wallet, stealthSpec);
const signed = await signTransaction([authorizer], resolvedTx);
```

The authorizer uses the wallet's registered key providers to sign on behalf of the appropriate account.
