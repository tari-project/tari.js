---
sidebar_position: 1
slug: /
---

# Overview

This is the documentation of `tari.js` library, which enables interaction with Tari L2 (Ootle) wallet using TypeScript or JavaScript.

At its core, `TariProvider` is an abstract interface implemented by multiple concrete providers. To access a wallet, you need to create an instance of one of these providers:

* [Tari WalletConnect provider](./providers/wallet-connect.md)
* [Tari Universe provider](./providers/tari-universe.md)
* [Tari Wallet Daemon provider](./providers/wallet-daemon.md)
* Tari Metamask provider

