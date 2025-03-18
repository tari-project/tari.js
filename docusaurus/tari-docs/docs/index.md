---
sidebar_position: 1
slug: /
---

# Overview

This is the documentation of `tari.js` library, which enables interaction with Tari L2 (Ootle) wallet using TypeScript or JavaScript.

### Note

> This documentation covers version **v0.5.0**.
>
> The biggest difference between version 0.4.0 and 0.5.0 is the _Signer_ and _Provider_ split. Learn more in the [Tari Provider](./providers/indexer-provider.md) and [Tari Signer](./signers/wallet-connect.md) sections.

At its core, `TariSigner` is an abstract interface implemented by multiple concrete signers. To access a wallet, you need to create an instance of one of these signers:

- [Tari WalletConnect signer](./signers/wallet-connect.md)
- [Tari Universe signer](./signers/tari-universe.md)
- [Tari Wallet Daemon signer](./signers/wallet-daemon.md)
- Tari Metamask signer
