---
sidebar_position: 1
title: Providers vs Signers
---

# Introduction to Providers and Signers

Tari.js provides two methods of interaction with the Ootle via built-in providers and signers.

## What is a provider?

A provider provides a bridge of communication between the application and the Ootle network for the purpose of retrieving publically accessible information from the chain. The provider allows a developer to call information from the Ootle without necessarily requiring a wallet or performing a transaction. Likewise, this means that a developer cannot use a provider to write or commit changes to the Ootle network.

In Tari.js, the `Indexer Provider` class is provided for this purpose. You can read more about [the Provider here](./providers/indexer-provider.md).

## What is a signer?

A signer provides for one or more methods for authenticating a transaction or action, and for accessing additional functionality for interacting with the Ootle. In this way, a signer allows the user to perform specific actions via a verifiable manner.

Tari.js provides three different signers for interacting with the Ootle, depending on the client you are using to interact with the Ootle. All of these utilise the `TariSigner` interface:

- **WalletConnect Signer**: This class is to be used to connect a wallet that is compatible with the WalletConnect protocol to your application.
- **Tari Universe Signer**: This class relies on the use of the Ootle wallet built into the [Tari Universe](https://airdrop.tari.com) application.
- **Tari Wallet Daemon Signer** this class uses the Tari Wallet Daemon service for facilitating transactions, account management and more.

You can read more about the [signers here](./category/signers)

